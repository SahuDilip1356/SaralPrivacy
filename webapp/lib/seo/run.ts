// run.ts — the inspection run itself, shared by the CLI (tools/seo/inspect.ts),
// the weekly GitHub Action and the admin "Run now" route. Pure orchestration:
// callers supply the GSC client, the previous run, the ledger and the sitemap;
// this returns the Report. No file or env access here.

import { randomUUID } from "node:crypto";
import type { GscApi, SitemapEntry } from "./gsc.ts";
import type { PrevRun } from "./db.ts";
import {
  bucketCounts,
  checkDataSanity,
  crawledNotIndexedBreakdown,
  decide,
  diffRuns,
  shortlist,
  suspectVerdict,
  toRecord,
  type Report,
  type UrlRecord,
} from "./verdict.ts";
import { WATCHLIST } from "./watchlist.ts";

export type Scope = "watchlist" | "newcomers" | "full";
export const SCOPES: readonly Scope[] = ["watchlist", "newcomers", "full"];

/** ¼ of the 2,000/day URL Inspection quota; the watchlist is never cut. */
export const DEFAULT_BUDGET = 500;
const CONCURRENCY = 3;

export type RunOptions = {
  api: GscApi;
  site: string;
  scope: Scope;
  budget: number;
  analytics: boolean;
  submitSitemap: boolean;
  prev: PrevRun | null;
  /** path → ISO date; code ledger merged with the DB ledger (see mergeLedger). */
  ledger: Record<string, string>;
  sitemapUrls: string[];
  sitemapFetched: boolean;
  keySource: string;
  dryRun: boolean;
  now?: Date;
  log?: (line: string) => void;
};

/** Code ledger (watchlist.ts) + DB ledger (ops.seo_index_requests); the DB wins on conflict. */
export function mergeLedger(code: Readonly<Record<string, string>>, db: Readonly<Record<string, string>>): Record<string, string> {
  return { ...code, ...db };
}

/** sitemap.xml is a dynamic route (Appwrite-backed) — retry a blip rather than blank the run. */
export async function fetchSitemapUrls(base: string, depth = 0): Promise<string[]> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(base, { headers: { "user-agent": "saralprivacy-seo-inspect/1" }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
      if (/<sitemapindex/i.test(xml) && depth < 2) {
        const nested = await Promise.all(locs.map((u) => fetchSitemapUrls(u, depth + 1)));
        return nested.flat();
      }
      if (locs.length === 0) throw new Error("no <loc> entries");
      return locs;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error(`${base}: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
}

/** Live sitemap, else the previous run's, else the given fallback (dry-run fixture) — never blank the shortlist on a blip. */
export async function resolveSitemap(
  site: string,
  prev: PrevRun | null,
  fallback: string[] | null,
  log: (s: string) => void,
): Promise<{ urls: string[]; fetched: boolean }> {
  const sitemapUrl = `${site.replace(/\/$/, "")}/sitemap.xml`;
  try {
    return { urls: await fetchSitemapUrls(sitemapUrl), fetched: true };
  } catch (err) {
    const fromPrev = prev?.sitemap_urls.length ? prev.sitemap_urls : null;
    log(`sitemap fetch failed after retries (${(err as Error).message}); using ${fromPrev ? "the previous run's sitemap" : fallback ? "the fallback sitemap" : "the watchlist only"}`);
    return { urls: fromPrev ?? fallback ?? [], fetched: false };
  }
}

async function pool<T, R>(items: readonly T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function runInspection(o: RunOptions): Promise<Report> {
  const log = o.log ?? (() => {});
  const now = o.now ?? new Date();
  const site = o.site;
  const sitemapUrl = `${site.replace(/\/$/, "")}/sitemap.xml`;

  // ── Targets: watchlist first, then newcomers / everything, bounded by budget ──
  const sitemapSet = new Set(o.sitemapUrls);
  const prevSitemap = new Set(o.prev?.sitemap_urls ?? []);
  const newcomers = o.prev ? o.sitemapUrls.filter((u) => !prevSitemap.has(u)) : o.sitemapUrls.filter((u) => !WATCHLIST.includes(u));
  log(`sitemap: ${o.sitemapUrls.length} URLs${o.sitemapFetched ? "" : " (not fetched live)"} · ${newcomers.length} newcomers`);

  const targets: string[] = [...WATCHLIST];
  const extra = o.scope === "full" ? o.sitemapUrls : o.scope === "newcomers" ? newcomers : [];
  for (const u of extra) if (!targets.includes(u)) targets.push(u);
  const cut = Math.max(WATCHLIST.length, o.budget);
  if (targets.length > cut) log(`budget ${o.budget}: inspecting ${cut} of ${targets.length} candidate URLs`);
  const toInspect = targets.slice(0, cut);

  // ── Inspect ──
  const ctx = { watchlist: new Set(WATCHLIST), sitemap: sitemapSet, ledger: o.ledger };
  let done = 0;
  const records: UrlRecord[] = await pool(toInspect, CONCURRENCY, async (url) => {
    try {
      const r = toRecord(url, await o.api.inspect(url), ctx);
      if (++done % 25 === 0) log(`  inspected ${done}/${toInspect.length}`);
      return r;
    } catch (err) {
      const msg = (err as Error).message;
      log(`  ✗ ${url}: ${msg}`);
      return toRecord(url, null, { ...ctx, error: msg });
    }
  });
  const errors = records.filter((r) => r.bucket === "error").length;
  log(`inspected ${records.length} (${errors} errors)`);

  // ── Search Analytics, last 28 days (GSC data lags ~3 days) ──
  if (o.analytics) {
    try {
      const end = new Date(now.getTime() - 3 * 86_400_000);
      const start = new Date(end.getTime() - 27 * 86_400_000);
      const rows = await o.api.searchAnalytics(isoDay(start), isoDay(end));
      const byPage = new Map(rows.map((r) => [r.keys[0], r]));
      for (const r of records) {
        const row = byPage.get(r.url);
        if (row) r.search_28d = { clicks: row.clicks, impressions: row.impressions, position: Number(row.position.toFixed(1)) };
      }
      log(`search analytics: ${rows.length} pages with impressions (${isoDay(start)} → ${isoDay(end)})`);
    } catch (err) {
      log(`search analytics skipped: ${(err as Error).message}`);
    }
  }

  // ── Sitemaps in GSC (+ optional resubmit) ──
  let sitemapsInGsc: SitemapEntry[] = [];
  let submitted = false;
  try {
    if (o.submitSitemap) {
      await o.api.submitSitemap(sitemapUrl);
      submitted = true;
      log(`sitemap resubmitted: ${sitemapUrl}`);
    }
    sitemapsInGsc = await o.api.listSitemaps();
  } catch (err) {
    log(`sitemaps API skipped: ${(err as Error).message}`);
  }

  // ── Verdict, diff, shortlist ──
  const prevDiscovered = o.prev
    ? o.prev.records.filter((p) => WATCHLIST.includes(p.url) && (p.bucket === "discovered" || p.bucket === "unknown")).length
    : null;
  const realVerdict = decide(records, { now, prevDiscovered });

  // A mass de-indexation with nothing recrawled is an API fault, not an SEO
  // event: override the verdict so nobody reads a false alarm as truth. The
  // caller must also skip persisting — a suspect run may never become the
  // baseline the next diff is measured against.
  const dataSanity = checkDataSanity(o.prev?.records ?? null, records);
  if (dataSanity.suspect) {
    log(`⚠ SUSPECT DATA — ${dataSanity.reason}; verdict withheld and this run will not be persisted`);
  }
  const verdict = dataSanity.suspect ? suspectVerdict(dataSanity, realVerdict.evidence) : realVerdict;

  return {
    run_id: randomUUID(),
    run_at: now.toISOString(),
    site,
    scope: o.scope,
    dry_run: o.dryRun,
    key_source: o.keySource,
    sitemap: { url: sitemapUrl, fetched: o.sitemapFetched, url_count: o.sitemapUrls.length, urls: o.sitemapUrls, newcomers },
    sitemaps_in_gsc: sitemapsInGsc,
    sitemap_submitted: submitted,
    inspected: records.length,
    errors,
    buckets: bucketCounts(records),
    watchlist_buckets: bucketCounts(records.filter((r) => r.watchlist)),
    verdict,
    data_sanity: dataSanity,
    diff: diffRuns(o.prev?.records ?? null, o.prev?.run_at ?? null, records),
    crawled_not_indexed: crawledNotIndexedBreakdown(records),
    shortlist: shortlist(records),
    urls: records,
  };
}

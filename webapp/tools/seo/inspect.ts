// inspect.ts — SEO observability agent: the Google Search Console watcher.
//
// Watchlist (17 never-crawled commercial pages) + sitemap newcomers
//   → URL Inspection API per URL (last crawl / coverage / canonical)
//   → dated JSON report (+ ops.seo_runs / ops.seo_inspections in Supabase)
//   → diff vs the previous run
//   → the pre-agreed verdict (QUEUE_MOVED / STARVED / TOO_EARLY)
//   → a ≤10-URL human shortlist for the "Request Indexing" button.
//
// Run from webapp/ (Node ≥ 22.6; the flag is a no-op on 24+):
//   node --experimental-strip-types tools/seo/inspect.ts [flags]
//
//   --dry-run            fixture instead of the GSC API (no key needed)
//   --offline            with --dry-run: fixture sitemap instead of the live one
//   --scope S            watchlist | newcomers (default) | full
//   --budget N           max inspections this run (default 500 = ¼ of the daily quota; watchlist is never cut)
//   --no-db              skip Supabase read/write
//   --no-analytics       skip the 28-day Search Analytics enrichment
//   --submit-sitemap     re-submit /sitemap.xml to GSC (e.g. after a deploy)
//   --site URL           property (default https://saralprivacy.com/)
//   --out DIR            report directory (default tools/seo/reports)
//
// Key: webapp/.gsc-service-account.json (gitignored) or GSC_SERVICE_ACCOUNT_JSON.
// Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from webapp/.env.local (auto-loaded).

import { randomUUID } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDb, isMissingTable, type Db, type PrevRun } from "./db.ts";
import { createDryRunClient, createGscClient, loadServiceAccount, type DryRunFixture, type GscApi, type SitemapEntry } from "./gsc.ts";
import {
  bucketCounts,
  crawledNotIndexedBreakdown,
  decide,
  diffRuns,
  renderSummary,
  shortlist,
  toRecord,
  type Report,
  type UrlRecord,
} from "./verdict.ts";
import { REQUESTED_INDEXING, SITE, WATCHLIST } from "./watchlist.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(HERE, "..", "..");
const FIXTURE = join(HERE, "fixtures", "dry-run.json");
const CONCURRENCY = 3;

type Scope = "watchlist" | "newcomers" | "full";

type Args = {
  dryRun: boolean;
  offline: boolean;
  scope: Scope;
  budget: number;
  db: boolean;
  analytics: boolean;
  submitSitemap: boolean;
  site: string;
  out: string;
};

function parseArgs(argv: string[]): Args {
  const a: Args = {
    dryRun: false,
    offline: false,
    scope: "newcomers",
    budget: 500,
    db: true,
    analytics: true,
    submitSitemap: false,
    site: SITE,
    out: "",
  };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    const next = () => argv[++i] ?? "";
    if (f === "--dry-run") a.dryRun = true;
    else if (f === "--offline") a.offline = true;
    else if (f === "--scope") a.scope = next() as Scope;
    else if (f === "--budget") a.budget = Number(next());
    else if (f === "--no-db") a.db = false;
    else if (f === "--no-analytics") a.analytics = false;
    else if (f === "--submit-sitemap") a.submitSitemap = true;
    else if (f === "--site") a.site = next();
    else if (f === "--out") a.out = next();
    else throw new Error(`unknown flag ${f}`);
  }
  if (!["watchlist", "newcomers", "full"].includes(a.scope)) throw new Error(`--scope must be watchlist | newcomers | full`);
  if (!Number.isFinite(a.budget) || a.budget < 1) throw new Error("--budget must be a positive number");
  if (!a.out) a.out = a.dryRun ? join(tmpdir(), "seo-inspect-dry-run") : join(HERE, "reports");
  return a;
}

/** Minimal .env.local loader — never overrides variables already in the environment. */
function loadDotEnv(path: string): void {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const SETUP = `
No Search Console key found. One-time setup (≈10 min, reuses the existing Google service account if you like):
  1. Google Cloud console → the project that owns the daily-briefing service account (or a new one) → APIs & Services → enable "Google Search Console API".
  2. IAM → Service Accounts → create "gsc-reader" (or reuse the Sheets one) → Keys → add JSON key.
  3. Search Console → property https://saralprivacy.com/ (URL-prefix, NOT the domain property) → Settings → Users and permissions → add the service-account email as Full.
  4. Save the JSON as webapp/.gsc-service-account.json (gitignored) — or set GSC_SERVICE_ACCOUNT_JSON in CI. Never paste it into chat or a commit.
Until then: node --experimental-strip-types tools/seo/inspect.ts --dry-run
`;

/** sitemap.xml is a dynamic route (Appwrite-backed) — retry a blip rather than blank the run. */
async function fetchSitemapUrls(base: string, depth = 0): Promise<string[]> {
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

function newestLocalReport(dir: string): PrevRun | null {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}T\d{4}Z\.json$/.test(f))
    .sort();
  if (files.length === 0) return null;
  const rep = JSON.parse(readFileSync(join(dir, files[files.length - 1]), "utf8")) as Report;
  return {
    run_at: rep.run_at,
    sitemap_urls: rep.sitemap.urls,
    records: rep.urls.map((u) => ({ url: u.url, bucket: u.bucket, last_crawl_time: u.last_crawl_time })),
  };
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  loadDotEnv(join(APP_DIR, ".env.local"));
  const now = new Date();
  const log = (s: string) => console.error(s);

  // ── Client ──
  let api: GscApi;
  let keySource: string;
  let fixture: DryRunFixture | null = null;
  if (args.dryRun) {
    fixture = JSON.parse(readFileSync(FIXTURE, "utf8")) as DryRunFixture;
    api = createDryRunClient(fixture);
    keySource = "fixture";
    log(`DRY RUN — inspections come from ${FIXTURE}`);
  } else {
    const loaded = loadServiceAccount(APP_DIR);
    if (!loaded) {
      console.error(SETUP);
      return 1;
    }
    api = createGscClient(loaded.sa, args.site);
    keySource = loaded.source;
    log(`key: ${loaded.source} (${loaded.sa.client_email}) · property ${args.site}`);
  }

  // ── Previous run (Supabase → local report fallback) ──
  let db: Db | null = null;
  let prev: PrevRun | null = null;
  const supaUrl = (process.env.SUPABASE_URL || "").trim();
  const supaKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (args.db && !args.dryRun && supaUrl && supaKey) {
    db = createDb(supaUrl, supaKey);
    try {
      prev = await db.fetchPrevRun();
      log(prev ? `previous run from Supabase: ${prev.run_at}` : "no previous run in Supabase");
    } catch (err) {
      if (isMissingTable(err)) {
        log("Supabase: ops.seo_runs not found — apply supabase/migrations/0005_ops_seo_inspections.sql; continuing without DB");
        db = null;
      } else throw err;
    }
  } else if (args.db && !args.dryRun) {
    log("Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — local reports only");
  }
  if (!prev) {
    prev = newestLocalReport(args.out);
    if (prev) log(`previous run from local report: ${prev.run_at}`);
  }

  // ── Sitemap ──
  const sitemapUrl = `${args.site.replace(/\/$/, "")}/sitemap.xml`;
  let sitemapUrls: string[] = [];
  let sitemapFetched = false;
  if (args.offline && fixture) {
    sitemapUrls = fixture.sitemapUrls;
  } else {
    try {
      sitemapUrls = await fetchSitemapUrls(sitemapUrl);
      sitemapFetched = true;
    } catch (err) {
      // Never blank the shortlist on a fetch blip: reuse the last known sitemap.
      const fromPrev = prev?.sitemap_urls.length ? prev.sitemap_urls : null;
      sitemapUrls = fromPrev ?? fixture?.sitemapUrls ?? [];
      log(`sitemap fetch failed after retries (${(err as Error).message}); using ${fromPrev ? "the previous run's sitemap" : fixture ? "the fixture sitemap" : "the watchlist only"}`);
    }
  }
  const sitemapSet = new Set(sitemapUrls);
  const prevSitemap = new Set(prev?.sitemap_urls ?? []);
  const newcomers = prev ? sitemapUrls.filter((u) => !prevSitemap.has(u)) : sitemapUrls.filter((u) => !WATCHLIST.includes(u));
  log(`sitemap: ${sitemapUrls.length} URLs${sitemapFetched ? "" : " (not fetched live)"} · ${newcomers.length} newcomers`);

  // ── Targets ──
  const targets: string[] = [...WATCHLIST];
  const extra = args.scope === "full" ? sitemapUrls : args.scope === "newcomers" ? newcomers : [];
  for (const u of extra) if (!targets.includes(u)) targets.push(u);
  const cut = Math.max(WATCHLIST.length, args.budget);
  if (targets.length > cut) log(`budget ${args.budget}: inspecting ${cut} of ${targets.length} candidate URLs`);
  const toInspect = targets.slice(0, cut);

  // ── Inspect ──
  const ctx = { watchlist: new Set(WATCHLIST), sitemap: sitemapSet, ledger: REQUESTED_INDEXING };
  let done = 0;
  const records: UrlRecord[] = await pool(toInspect, CONCURRENCY, async (url) => {
    try {
      const r = toRecord(url, await api.inspect(url), ctx);
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
  if (args.analytics) {
    try {
      const end = new Date(now.getTime() - 3 * 86_400_000);
      const start = new Date(end.getTime() - 27 * 86_400_000);
      const rows = await api.searchAnalytics(isoDay(start), isoDay(end));
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
    if (args.submitSitemap) {
      await api.submitSitemap(sitemapUrl);
      submitted = true;
      log(`sitemap resubmitted: ${sitemapUrl}`);
    }
    sitemapsInGsc = await api.listSitemaps();
  } catch (err) {
    log(`sitemaps API skipped: ${(err as Error).message}`);
  }

  // ── Verdict, diff, shortlist ──
  const prevDiscovered = prev
    ? prev.records.filter((p) => WATCHLIST.includes(p.url) && (p.bucket === "discovered" || p.bucket === "unknown")).length
    : null;
  const verdict = decide(records, { now, prevDiscovered });
  const report: Report = {
    run_id: randomUUID(),
    run_at: now.toISOString(),
    site: args.site,
    scope: args.scope,
    dry_run: args.dryRun,
    key_source: keySource,
    sitemap: { url: sitemapUrl, fetched: sitemapFetched, url_count: sitemapUrls.length, urls: sitemapUrls, newcomers },
    sitemaps_in_gsc: sitemapsInGsc,
    sitemap_submitted: submitted,
    inspected: records.length,
    errors,
    buckets: bucketCounts(records),
    watchlist_buckets: bucketCounts(records.filter((r) => r.watchlist)),
    verdict,
    diff: diffRuns(prev?.records ?? null, prev?.run_at ?? null, records),
    crawled_not_indexed: crawledNotIndexedBreakdown(records),
    shortlist: shortlist(records),
    urls: records,
  };

  // ── Outputs ──
  mkdirSync(args.out, { recursive: true });
  // e.g. 2026-09-06T0412Z.json — matches newestLocalReport()'s pattern.
  const file = join(args.out, `${now.toISOString().slice(0, 16).replace(":", "")}Z.json`);
  writeFileSync(file, JSON.stringify(report, null, 2));
  const summary = renderSummary(report);
  console.log(summary);
  console.error(`report: ${file}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");

  if (db) {
    try {
      await db.persist(report);
      log(`persisted to Supabase: run ${report.run_id}`);
    } catch (err) {
      log(`Supabase write failed: ${(err as Error).message}`);
      return 1;
    }
  }

  return verdict.code === "INSUFFICIENT_DATA" ? 2 : 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  },
);

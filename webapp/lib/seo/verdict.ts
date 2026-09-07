// verdict.ts — the pure logic of the SEO observability agent: bucket each
// inspected URL, diff against the previous run, fire the pre-agreed decision
// tree, and rank the human "Request Indexing" shortlist.
//
// No I/O here; everything is unit-tested in verdict.test.ts.

import type { IndexStatusResult, InspectionResult, SitemapEntry } from "./gsc.ts";

export type Bucket = "indexed" | "discovered" | "crawled_not_indexed" | "unknown" | "excluded" | "other" | "error";

export const BUCKETS: readonly Bucket[] = ["indexed", "discovered", "crawled_not_indexed", "unknown", "excluded", "other", "error"];

export type UrlRecord = {
  url: string;
  path: string;
  watchlist: boolean;
  in_sitemap: boolean;
  bucket: Bucket;
  coverage_state: string | null;
  verdict: string | null;
  indexing_state: string | null;
  last_crawl_time: string | null;
  google_canonical: string | null;
  user_canonical: string | null;
  robots_txt_state: string | null;
  page_fetch_state: string | null;
  referring_urls: number;
  requested_indexing_at: string | null;
  search_28d: { clicks: number; impressions: number; position: number } | null;
  error: string | null;
  raw: IndexStatusResult | null;
};

/** What the previous run must supply for a diff. */
export type PrevRecord = Pick<UrlRecord, "url" | "bucket" | "last_crawl_time">;

export type VerdictCode = "QUEUE_MOVED" | "STARVED" | "TOO_EARLY" | "INSUFFICIENT_DATA";

export type Verdict = {
  code: VerdictCode;
  summary: string;
  next: string;
  evidence: {
    watchlist: number;
    inspected: number;
    crawled: number;
    indexed: number;
    discovered: number;
    crawled_share: number;
    weeks_since_request: number | null;
    prev_discovered: number | null;
  };
};

export type Diff = {
  prev_run_at: string | null;
  compared: number;
  changed: Array<{ url: string; from: Bucket; to: Bucket }>;
  newly_crawled: string[];
  newly_indexed: string[];
  regressed: string[];
};

export type Breakdown = {
  total: number;
  by: { briefings: number; blog: number; other: number };
  briefings_share: number;
  hypothesis: "confirmed" | "rejected" | "mixed" | "insufficient";
  urls: string[];
};

export type ShortlistItem = { url: string; bucket: Bucket; reason: string };

export type Report = {
  run_id: string;
  run_at: string;
  site: string;
  scope: string;
  dry_run: boolean;
  key_source: string;
  sitemap: { url: string; fetched: boolean; url_count: number; urls: string[]; newcomers: string[] };
  sitemaps_in_gsc: SitemapEntry[];
  sitemap_submitted: boolean;
  inspected: number;
  errors: number;
  buckets: Record<Bucket, number>;
  watchlist_buckets: Record<Bucket, number>;
  verdict: Verdict;
  diff: Diff | null;
  crawled_not_indexed: Breakdown;
  shortlist: ShortlistItem[];
  urls: UrlRecord[];
};

// ── Thresholds of the pre-agreed decision tree ───────────────────────────────

/** ≥ this share of the watchlist carrying a real crawl date = the queue moved. */
export const MOVED_CRAWLED_SHARE = 0.5;
/** Discovered bucket at ≤ this ratio of the previous run (with any crawl movement) also counts as moved. */
export const SHRINK_RATIO = 0.7;
/** Still no crawl dates after this many weeks since the request = starved. */
export const STARVED_WEEKS = 5;
/** Max URLs on the human "Request Indexing" shortlist (GSC button quota ≈ 10/day). */
export const SHORTLIST_MAX = 10;

// ── Per-URL classification ───────────────────────────────────────────────────

const EPOCH = /^1970-01-01T/;

/** The API omits lastCrawlTime for never-crawled URLs; GSC exports show the epoch. Normalise both to null. */
export function normalizeCrawlTime(t: string | null | undefined): string | null {
  if (!t || EPOCH.test(t)) return null;
  return t;
}

export function bucketOf(s: IndexStatusResult | undefined | null): Bucket {
  if (!s) return "error";
  const cov = (s.coverageState || "").toLowerCase();
  if (s.verdict === "PASS") return "indexed";
  if (cov.includes("indexed") && !cov.includes("not indexed")) return "indexed";
  if (cov.startsWith("discovered")) return "discovered";
  if (cov.startsWith("crawled")) return "crawled_not_indexed";
  if (cov.includes("unknown to google")) return "unknown";
  if (cov.includes("noindex") || cov.includes("redirect") || cov.includes("canonical") || cov.includes("duplicate") || cov.includes("blocked")) {
    return "excluded";
  }
  return "other";
}

export function pathOf(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

export function toRecord(
  url: string,
  result: InspectionResult | null,
  ctx: { watchlist: ReadonlySet<string>; sitemap: ReadonlySet<string>; ledger: Readonly<Record<string, string>>; error?: string },
): UrlRecord {
  const s = result?.indexStatusResult ?? null;
  const path = pathOf(url);
  return {
    url,
    path,
    watchlist: ctx.watchlist.has(url),
    in_sitemap: ctx.sitemap.has(url),
    bucket: ctx.error ? "error" : bucketOf(s),
    coverage_state: s?.coverageState ?? null,
    verdict: s?.verdict ?? null,
    indexing_state: s?.indexingState ?? null,
    last_crawl_time: normalizeCrawlTime(s?.lastCrawlTime),
    google_canonical: s?.googleCanonical ?? null,
    user_canonical: s?.userCanonical ?? null,
    robots_txt_state: s?.robotsTxtState ?? null,
    page_fetch_state: s?.pageFetchState ?? null,
    referring_urls: s?.referringUrls?.length ?? 0,
    requested_indexing_at: ctx.ledger[path] ?? null,
    search_28d: null,
    error: ctx.error ?? null,
    raw: s,
  };
}

export function bucketCounts(records: readonly UrlRecord[]): Record<Bucket, number> {
  const out = Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Record<Bucket, number>;
  for (const r of records) out[r.bucket] += 1;
  return out;
}

// ── The decision tree ────────────────────────────────────────────────────────

export function weeksBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (7 * 86_400_000));
}

export function decide(records: readonly UrlRecord[], opts: { now: Date; prevDiscovered?: number | null }): Verdict {
  const watch = records.filter((r) => r.watchlist);
  const inspected = watch.filter((r) => r.bucket !== "error");
  const crawled = inspected.filter((r) => r.last_crawl_time !== null);
  const indexed = inspected.filter((r) => r.bucket === "indexed");
  const discovered = inspected.filter((r) => r.bucket === "discovered" || r.bucket === "unknown");
  const crawledShare = inspected.length ? crawled.length / inspected.length : 0;

  const requestDates = watch.map((r) => r.requested_indexing_at).filter((d): d is string => !!d);
  const earliest = requestDates.length ? new Date(requestDates.sort()[0]) : null;
  const weeks = earliest ? weeksBetween(earliest, opts.now) : null;
  const prevDiscovered = opts.prevDiscovered ?? null;

  const evidence = {
    watchlist: watch.length,
    inspected: inspected.length,
    crawled: crawled.length,
    indexed: indexed.length,
    discovered: discovered.length,
    crawled_share: Number(crawledShare.toFixed(2)),
    weeks_since_request: weeks,
    prev_discovered: prevDiscovered,
  };

  if (watch.length === 0 || inspected.length < Math.ceil(watch.length / 2)) {
    return {
      code: "INSUFFICIENT_DATA",
      summary: `Only ${inspected.length}/${watch.length} watchlist inspections succeeded.`,
      next: "Check the service-account key, property access and quota, then re-run. No decision can be read from this run.",
      evidence,
    };
  }

  const shrank = prevDiscovered !== null && prevDiscovered > 0 && discovered.length <= prevDiscovered * SHRINK_RATIO && crawled.length > 0;

  if (crawledShare >= MOVED_CRAWLED_SHARE || shrank) {
    return {
      code: "QUEUE_MOVED",
      summary: `${crawled.length}/${inspected.length} watchlist URLs now carry a real crawl date (${indexed.length} indexed, ${discovered.length} still discovered-only).`,
      next:
        "Request-indexing cut through. Resume SEO Cycle 2 in the revised order: A2/A4/A6 hygiene → CA-firms pillar (B3) → B2 briefing rationalisation (its 4-week gate expired 2026-08-28 — decision is ripe).",
      evidence,
    };
  }

  if (weeks !== null && weeks >= STARVED_WEEKS) {
    return {
      code: "STARVED",
      summary: `${weeks} weeks after the request, ${crawled.length}/${inspected.length} watchlist URLs have been crawled; ${discovered.length} remain discovered-only.`,
      next:
        "Request-indexing did not cut through. Skip hygiene and escalate to the authority/cadence problem directly: open decision D-D (daily briefing cadence), now double-evidenced by crawl starvation and the 2026-09-06 funnel baseline.",
      evidence,
    };
  }

  return {
    code: "TOO_EARLY",
    summary: `${weeks ?? "?"} weeks since the request and ${crawled.length}/${inspected.length} crawled — under the ${STARVED_WEEKS}-week threshold.`,
    next: "No decision yet. Re-run next week.",
    evidence,
  };
}

// ── Diff vs previous run ─────────────────────────────────────────────────────

export function diffRuns(prev: readonly PrevRecord[] | null, prevRunAt: string | null, curr: readonly UrlRecord[]): Diff | null {
  if (!prev) return null;
  const byUrl = new Map(prev.map((p) => [p.url, p]));
  const diff: Diff = { prev_run_at: prevRunAt, compared: 0, changed: [], newly_crawled: [], newly_indexed: [], regressed: [] };
  for (const r of curr) {
    const p = byUrl.get(r.url);
    if (!p || r.bucket === "error" || p.bucket === "error") continue;
    diff.compared += 1;
    if (p.bucket !== r.bucket) diff.changed.push({ url: r.url, from: p.bucket, to: r.bucket });
    if (p.last_crawl_time === null && r.last_crawl_time !== null) diff.newly_crawled.push(r.url);
    if (p.bucket !== "indexed" && r.bucket === "indexed") diff.newly_indexed.push(r.url);
    if (p.bucket === "indexed" && r.bucket !== "indexed") diff.regressed.push(r.url);
  }
  return diff;
}

// ── "Crawled – currently not indexed": is it the briefings? ─────────────────

export function crawledNotIndexedBreakdown(records: readonly UrlRecord[]): Breakdown {
  const hits = records.filter((r) => r.bucket === "crawled_not_indexed");
  const by = { briefings: 0, blog: 0, other: 0 };
  for (const r of hits) {
    if (r.path.startsWith("/briefings/")) by.briefings += 1;
    else if (r.path.startsWith("/blog/")) by.blog += 1;
    else by.other += 1;
  }
  const share = hits.length ? by.briefings / hits.length : 0;
  let hypothesis: Breakdown["hypothesis"];
  if (hits.length < 5) hypothesis = "insufficient";
  else if (share >= 0.7) hypothesis = "confirmed";
  else if (share < 0.5) hypothesis = "rejected";
  else hypothesis = "mixed";
  return { total: hits.length, by, briefings_share: Number(share.toFixed(2)), hypothesis, urls: hits.map((r) => r.url) };
}

// ── Human shortlist for the Request Indexing button ──────────────────────────

/** Commercial pages first, then blog, then briefings. */
export function tierOf(path: string): number {
  if (path.startsWith("/briefings/")) return 2;
  if (path.startsWith("/blog/")) return 1;
  return 0;
}

const SHORTLIST_BUCKETS: readonly Bucket[] = ["discovered", "unknown", "crawled_not_indexed"];
const TIER_LABEL = ["commercial", "blog", "briefing"];

export function shortlist(records: readonly UrlRecord[], max = SHORTLIST_MAX): ShortlistItem[] {
  return records
    .filter((r) => SHORTLIST_BUCKETS.includes(r.bucket) && r.in_sitemap && r.requested_indexing_at === null)
    .sort((a, b) => {
      const t = tierOf(a.path) - tierOf(b.path);
      if (t) return t;
      const bk = SHORTLIST_BUCKETS.indexOf(a.bucket) - SHORTLIST_BUCKETS.indexOf(b.bucket);
      if (bk) return bk;
      return a.path.localeCompare(b.path);
    })
    .slice(0, max)
    .map((r) => ({ url: r.url, bucket: r.bucket, reason: `${r.coverage_state ?? r.bucket} · ${TIER_LABEL[tierOf(r.path)]}` }));
}

// ── Summary (console + GitHub step summary) ──────────────────────────────────

export function renderSummary(rep: Report): string {
  const line = (s = "") => s + "\n";
  let out = "";
  out += line(`# SEO inspection — ${rep.run_at.slice(0, 10)}${rep.dry_run ? " (DRY RUN — fixture data)" : ""}`);
  out += line();
  out += line(`**Verdict: ${rep.verdict.code}** — ${rep.verdict.summary}`);
  out += line();
  out += line(`▶ ${rep.verdict.next}`);
  out += line();
  out += line(`Scope \`${rep.scope}\` · inspected ${rep.inspected} (${rep.errors} errors) · sitemap ${rep.sitemap.url_count} URLs · ${rep.sitemap.newcomers.length} newcomers since last run`);
  out += line();
  out += line("| Bucket | All | Watchlist |");
  out += line("|---|---|---|");
  for (const b of BUCKETS) {
    if (rep.buckets[b] === 0 && rep.watchlist_buckets[b] === 0) continue;
    out += line(`| ${b} | ${rep.buckets[b]} | ${rep.watchlist_buckets[b]} |`);
  }
  out += line();
  const e = rep.verdict.evidence;
  out += line(`Watchlist crawl share ${e.crawled}/${e.inspected} (${Math.round(e.crawled_share * 100)}%) · weeks since request ${e.weeks_since_request ?? "n/a"} · previous discovered ${e.prev_discovered ?? "n/a"}`);
  out += line();
  if (rep.diff) {
    out += line(`## Diff vs ${rep.diff.prev_run_at?.slice(0, 10) ?? "previous run"} (${rep.diff.compared} URLs compared)`);
    out += line(`newly crawled ${rep.diff.newly_crawled.length} · newly indexed ${rep.diff.newly_indexed.length} · regressed ${rep.diff.regressed.length} · bucket changes ${rep.diff.changed.length}`);
    for (const c of rep.diff.changed.slice(0, 25)) out += line(`- ${pathOf(c.url)}: ${c.from} → ${c.to}`);
    out += line();
  } else {
    out += line("_No previous run to diff against._");
    out += line();
  }
  const b = rep.crawled_not_indexed;
  out += line(`## Crawled – currently not indexed: ${b.total} (briefings ${b.by.briefings}, blog ${b.by.blog}, other ${b.by.other}) — hypothesis "it's the briefings": **${b.hypothesis}**`);
  out += line();
  out += line(`## Request-Indexing shortlist (${rep.shortlist.length}, max ${SHORTLIST_MAX}, never a URL already in the ledger)`);
  if (rep.shortlist.length === 0) out += line("_Nothing to request._");
  for (const s of rep.shortlist) out += line(`- ${s.url} — ${s.reason}`);
  out += line();
  out += line("## Watchlist");
  out += line("| Path | Bucket | Last crawled | Requested |");
  out += line("|---|---|---|---|");
  for (const r of rep.urls.filter((u) => u.watchlist)) {
    out += line(`| ${r.path} | ${r.bucket} | ${r.last_crawl_time?.slice(0, 10) ?? "never"} | ${r.requested_indexing_at ?? "—"} |`);
  }
  return out;
}

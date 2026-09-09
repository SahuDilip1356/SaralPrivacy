// verdict.test.ts — run from webapp/:
//   node --experimental-strip-types --test tools/seo/verdict.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bucketOf,
  checkDataSanity,
  crawledNotIndexedBreakdown,
  decide,
  diffRuns,
  normalizeCrawlTime,
  shortlist,
  suspectVerdict,
  toRecord,
  type Bucket,
  type UrlRecord,
} from "../../lib/seo/verdict.ts";
import { BASE, REQUESTED_INDEXING, WATCHLIST, WATCHLIST_PATHS } from "../../lib/seo/watchlist.ts";

const NOW = new Date("2026-09-06T00:00:00Z"); // 5+ weeks after the 31 Jul / 1 Aug requests

const ctx = {
  watchlist: new Set(WATCHLIST),
  sitemap: new Set([...WATCHLIST, `${BASE}/learn/consent`, `${BASE}/blog/some-post`, `${BASE}/briefings/a`, `${BASE}/briefings/b`]),
  ledger: REQUESTED_INDEXING,
};

function rec(url: string, bucket: Bucket, extra: Partial<UrlRecord> = {}): UrlRecord {
  const base = toRecord(url, null, ctx);
  return { ...base, bucket, ...extra };
}

function watchlistAs(bucket: Bucket, crawled: boolean): UrlRecord[] {
  return WATCHLIST.map((u) => rec(u, bucket, { last_crawl_time: crawled ? "2026-09-01T00:00:00Z" : null }));
}

test("watchlist: 17 paths, every one in the request ledger", () => {
  assert.equal(WATCHLIST_PATHS.length, 17);
  for (const p of WATCHLIST_PATHS) assert.ok(REQUESTED_INDEXING[p], `${p} missing from ledger`);
});

test("bucketOf maps GSC coverage states", () => {
  assert.equal(bucketOf({ verdict: "PASS", coverageState: "Submitted and indexed" }), "indexed");
  assert.equal(bucketOf({ verdict: "NEUTRAL", coverageState: "Indexed, not submitted in sitemap" }), "indexed");
  assert.equal(bucketOf({ verdict: "NEUTRAL", coverageState: "Discovered - currently not indexed" }), "discovered");
  assert.equal(bucketOf({ verdict: "NEUTRAL", coverageState: "Crawled - currently not indexed" }), "crawled_not_indexed");
  assert.equal(bucketOf({ verdict: "NEUTRAL", coverageState: "URL is unknown to Google" }), "unknown");
  assert.equal(bucketOf({ verdict: "NEUTRAL", coverageState: "Excluded by 'noindex' tag" }), "excluded");
  assert.equal(bucketOf({ verdict: "NEUTRAL", coverageState: "Page with redirect" }), "excluded");
  assert.equal(bucketOf({ verdict: "FAIL", coverageState: "Soft 404" }), "other");
  assert.equal(bucketOf(undefined), "error");
});

test("normalizeCrawlTime treats the epoch as never crawled", () => {
  assert.equal(normalizeCrawlTime("1970-01-01T00:00:00Z"), null);
  assert.equal(normalizeCrawlTime(undefined), null);
  assert.equal(normalizeCrawlTime("2026-08-20T10:00:00Z"), "2026-08-20T10:00:00Z");
});

test("toRecord: watchlist flag, sitemap flag, ledger date, epoch crawl → null", () => {
  const r = toRecord(
    `${BASE}/discovery`,
    { indexStatusResult: { verdict: "NEUTRAL", coverageState: "Discovered - currently not indexed", lastCrawlTime: "1970-01-01T00:00:00Z" } },
    ctx,
  );
  assert.equal(r.watchlist, true);
  assert.equal(r.in_sitemap, true);
  assert.equal(r.bucket, "discovered");
  assert.equal(r.last_crawl_time, null);
  assert.equal(r.requested_indexing_at, "2026-07-31");
  const e = toRecord(`${BASE}/discovery`, null, { ...ctx, error: "HTTP 403" });
  assert.equal(e.bucket, "error");
  assert.equal(e.error, "HTTP 403");
});

test("decide → STARVED when nothing crawled after 5+ weeks", () => {
  const v = decide(watchlistAs("discovered", false), { now: NOW });
  assert.equal(v.code, "STARVED");
  assert.equal(v.evidence.crawled, 0);
  assert.ok(v.evidence.weeks_since_request !== null && v.evidence.weeks_since_request >= 5);
  assert.match(v.next, /D-D/);
});

test("decide → QUEUE_MOVED when a majority carry crawl dates", () => {
  const recs = watchlistAs("discovered", false);
  for (let i = 0; i < 9; i++) recs[i] = { ...recs[i], bucket: i < 4 ? "indexed" : "crawled_not_indexed", last_crawl_time: "2026-08-25T00:00:00Z" };
  const v = decide(recs, { now: NOW });
  assert.equal(v.code, "QUEUE_MOVED");
  assert.equal(v.evidence.crawled, 9);
  assert.equal(v.evidence.indexed, 4);
  assert.match(v.next, /B3/);
});

test("decide → QUEUE_MOVED when the discovered bucket shrank ≥30% vs previous run", () => {
  const recs = watchlistAs("discovered", false);
  for (let i = 0; i < 6; i++) recs[i] = { ...recs[i], bucket: "crawled_not_indexed", last_crawl_time: "2026-08-25T00:00:00Z" };
  // 6/17 = 35% crawled — under the 50% bar on its own, but discovered went 17 → 11 (≤ 70%).
  assert.equal(decide(recs, { now: NOW, prevDiscovered: 17 }).code, "QUEUE_MOVED");
  assert.equal(decide(recs, { now: NOW, prevDiscovered: null }).code, "STARVED");
});

test("decide → TOO_EARLY under 5 weeks", () => {
  const v = decide(watchlistAs("discovered", false), { now: new Date("2026-08-20T00:00:00Z") });
  assert.equal(v.code, "TOO_EARLY");
});

test("decide → INSUFFICIENT_DATA when most inspections failed", () => {
  const recs = watchlistAs("discovered", false).map((r, i) => (i < 10 ? { ...r, bucket: "error" as Bucket, error: "HTTP 403" } : r));
  assert.equal(decide(recs, { now: NOW }).code, "INSUFFICIENT_DATA");
});

test("diffRuns reports crawl, index and regression movement", () => {
  const prev = [
    { url: `${BASE}/discovery`, bucket: "discovered" as Bucket, last_crawl_time: null },
    { url: `${BASE}/rights`, bucket: "indexed" as Bucket, last_crawl_time: "2026-08-01T00:00:00Z" },
    { url: `${BASE}/blog`, bucket: "discovered" as Bucket, last_crawl_time: null },
  ];
  const curr = [
    rec(`${BASE}/discovery`, "indexed", { last_crawl_time: "2026-09-01T00:00:00Z" }),
    rec(`${BASE}/rights`, "crawled_not_indexed", { last_crawl_time: "2026-09-01T00:00:00Z" }),
    rec(`${BASE}/blog`, "discovered"),
    rec(`${BASE}/new-page`, "indexed"),
  ];
  const d = diffRuns(prev, "2026-08-30T00:00:00Z", curr);
  assert.ok(d);
  assert.equal(d.compared, 3);
  assert.deepEqual(d.newly_crawled, [`${BASE}/discovery`]);
  assert.deepEqual(d.newly_indexed, [`${BASE}/discovery`]);
  assert.deepEqual(d.regressed, [`${BASE}/rights`]);
  assert.equal(d.changed.length, 2);
  assert.equal(diffRuns(null, null, curr), null);
});

test("crawledNotIndexedBreakdown confirms the briefings hypothesis at ≥70%", () => {
  const recs = [
    ...Array.from({ length: 8 }, (_, i) => rec(`${BASE}/briefings/b${i}`, "crawled_not_indexed")),
    rec(`${BASE}/blog/x`, "crawled_not_indexed"),
    rec(`${BASE}/learn/consent`, "crawled_not_indexed"),
    rec(`${BASE}/discovery`, "discovered"),
  ];
  const b = crawledNotIndexedBreakdown(recs);
  assert.equal(b.total, 10);
  assert.deepEqual(b.by, { briefings: 8, blog: 1, other: 1 });
  assert.equal(b.hypothesis, "confirmed");
  assert.equal(crawledNotIndexedBreakdown(recs.slice(0, 3)).hypothesis, "insufficient");
});

test("shortlist: ≤10, commercial first, never a ledger URL, never indexed/excluded, sitemap only", () => {
  const recs = [
    ...watchlistAs("discovered", false), // all in the ledger → excluded from the shortlist
    rec(`${BASE}/learn/consent`, "discovered"),
    rec(`${BASE}/blog/some-post`, "crawled_not_indexed"),
    rec(`${BASE}/briefings/a`, "discovered"),
    rec(`${BASE}/briefings/b`, "indexed"),
    rec(`${BASE}/not-in-sitemap`, "discovered"), // in_sitemap=false
    ...Array.from({ length: 12 }, (_, i) => rec(`${BASE}/briefings/z${i}`, "discovered", { in_sitemap: true })),
  ];
  const s = shortlist(recs);
  assert.equal(s.length, 10);
  assert.equal(s[0].url, `${BASE}/learn/consent`);
  assert.equal(s[1].url, `${BASE}/blog/some-post`);
  assert.ok(s.every((x) => !WATCHLIST.includes(x.url)));
  assert.ok(s.every((x) => x.url !== `${BASE}/briefings/b` && x.url !== `${BASE}/not-in-sitemap`));
});

// ── Data sanity: the 2026-09-08 false alarm must never fire again ────────────

/** prev/curr pairs for n watchlist URLs, all previously indexed. */
function sanityPair(n: number, opts: { regress: number; recrawl: number }) {
  const urls = WATCHLIST.slice(0, n);
  const prev = urls.map((u) => ({ url: u, bucket: "indexed" as Bucket, last_crawl_time: "2026-08-01T00:00:00Z" }));
  const curr = urls.map((u, i) => {
    const regressed = i < opts.regress;
    return rec(u, regressed ? "crawled_not_indexed" : "indexed", {
      // A genuine re-judgement follows a genuine re-fetch.
      last_crawl_time: i < opts.recrawl ? "2026-09-08T00:00:00Z" : "2026-08-01T00:00:00Z",
    });
  });
  return { prev, curr };
}

test("checkDataSanity: mass regression with no recrawl is suspect", () => {
  const { prev, curr } = sanityPair(16, { regress: 16, recrawl: 0 });
  const s = checkDataSanity(prev, curr);
  assert.equal(s.suspect, true);
  assert.equal(s.regressed, 16);
  assert.equal(s.prev_indexed, 16);
  assert.equal(s.stale_crawl, 16);
});

test("checkDataSanity: mass regression WITH recrawls is believed", () => {
  const { prev, curr } = sanityPair(16, { regress: 16, recrawl: 16 });
  assert.equal(checkDataSanity(prev, curr).suspect, false);
});

test("checkDataSanity: a few stale regressions are ordinary churn", () => {
  const { prev, curr } = sanityPair(16, { regress: 4, recrawl: 0 });
  assert.equal(checkDataSanity(prev, curr).suspect, false);
});

test("checkDataSanity: no previous run is never suspect", () => {
  const { curr } = sanityPair(16, { regress: 16, recrawl: 0 });
  assert.equal(checkDataSanity(null, curr).suspect, false);
});

test("suspectVerdict withholds the real verdict and says not to act", () => {
  const { prev, curr } = sanityPair(16, { regress: 16, recrawl: 0 });
  const s = checkDataSanity(prev, curr);
  const real = decide(curr, { now: NOW, prevDiscovered: null });
  const v = suspectVerdict(s, real.evidence);
  assert.equal(v.code, "SUSPECT_DATA");
  assert.match(v.next, /do not treat it as the new baseline/i);
  assert.deepEqual(v.evidence, real.evidence);
});

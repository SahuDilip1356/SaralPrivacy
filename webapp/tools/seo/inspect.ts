// inspect.ts — SEO observability agent: the Google Search Console watcher (CLI).
//
// Watchlist (17 never-crawled commercial pages) + sitemap newcomers
//   → URL Inspection API per URL (last crawl / coverage / canonical)
//   → dated JSON report (+ ops.seo_runs / ops.seo_inspections in Supabase)
//   → diff vs the previous run
//   → the pre-agreed verdict (QUEUE_MOVED / STARVED / TOO_EARLY)
//   → a ≤10-URL human shortlist for the "Request Indexing" button.
//
// The run itself lives in lib/seo/run.ts and is shared with /admin/seo's
// "Run now" button; this file is the shell around it (args, env, key, files).
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
// Key: webapp/.gsc-service-account.json (gitignored), GSC_SERVICE_ACCOUNT_PATH,
// or GSC_SERVICE_ACCOUNT_JSON. Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// from webapp/.env.local (auto-loaded).

import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dbFromEnv, isMissingTable, ledgerToMap, type Db, type PrevRun } from "../../lib/seo/db.ts";
import { createDryRunClient, createGscClient, loadServiceAccount, type DryRunFixture, type GscApi } from "../../lib/seo/gsc.ts";
import { DEFAULT_BUDGET, SCOPES, mergeLedger, resolveSitemap, runInspection, type Scope } from "../../lib/seo/run.ts";
import { renderSummary, type Report } from "../../lib/seo/verdict.ts";
import { REQUESTED_INDEXING, SITE } from "../../lib/seo/watchlist.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(HERE, "..", "..");
const FIXTURE = join(HERE, "fixtures", "dry-run.json");

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
    budget: DEFAULT_BUDGET,
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
  if (!SCOPES.includes(a.scope)) throw new Error(`--scope must be ${SCOPES.join(" | ")}`);
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
No Search Console key found. One-time setup (≈10 min):
  1. Google Cloud console → the project of the daily-briefing service account → APIs & Services → enable "Google Search Console API".
  2. IAM → Service Accounts → that account (or a new "gsc-reader") → Keys → add JSON key.
  3. Search Console → property https://saralprivacy.com/ (URL-prefix, NOT the domain property) → Settings → Users and permissions → add the service-account email as Full.
  4. Save the JSON as webapp/.gsc-service-account.json (gitignored) — or set GSC_SERVICE_ACCOUNT_JSON in CI. Never paste it into chat or a commit.
Until then: node --experimental-strip-types tools/seo/inspect.ts --dry-run
`;

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

  // ── Previous run + ledger (Supabase → local report fallback) ──
  let db: Db | null = args.db && !args.dryRun ? dbFromEnv() : null;
  let prev: PrevRun | null = null;
  let ledger: Record<string, string> = { ...REQUESTED_INDEXING };
  if (db) {
    try {
      prev = await db.fetchPrevRun();
      ledger = mergeLedger(REQUESTED_INDEXING, ledgerToMap(await db.fetchLedger()));
      log(prev ? `previous run from Supabase: ${prev.run_at}` : "no previous run in Supabase");
    } catch (err) {
      if (!isMissingTable(err)) throw err;
      log("Supabase: ops.seo_* tables not found — apply supabase/migrations/0005_ops_seo_inspections.sql; continuing without DB");
      db = null;
    }
  } else if (args.db && !args.dryRun) {
    log("Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — local reports only");
  }
  if (!prev) {
    prev = newestLocalReport(args.out);
    if (prev) log(`previous run from local report: ${prev.run_at}`);
  }

  // ── Sitemap ──
  const sitemap =
    args.offline && fixture
      ? { urls: fixture.sitemapUrls, fetched: false }
      : await resolveSitemap(args.site, prev, fixture?.sitemapUrls ?? null, log);

  // ── Run ──
  const report = await runInspection({
    api,
    site: args.site,
    scope: args.scope,
    budget: args.budget,
    analytics: args.analytics,
    submitSitemap: args.submitSitemap,
    prev,
    ledger,
    sitemapUrls: sitemap.urls,
    sitemapFetched: sitemap.fetched,
    keySource,
    dryRun: args.dryRun,
    now,
    log,
  });

  // ── Outputs ──
  mkdirSync(args.out, { recursive: true });
  // e.g. 2026-09-06T0412Z.json — matches newestLocalReport()'s pattern.
  const file = join(args.out, `${now.toISOString().slice(0, 16).replace(":", "")}Z.json`);
  writeFileSync(file, JSON.stringify(report, null, 2));
  const summary = renderSummary(report);
  console.log(summary);
  console.error(`report: ${file}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");

  if (db && report.data_sanity?.suspect) {
    // Never let implausible data become the baseline the next diff is read against.
    log(`NOT persisted — suspect data (${report.data_sanity.reason}); the last good run remains the baseline`);
  } else if (db) {
    try {
      await db.persist(report);
      log(`persisted to Supabase: run ${report.run_id}`);
    } catch (err) {
      log(`Supabase write failed: ${(err as Error).message}`);
      return 1;
    }
  }

  return report.verdict.code === "INSUFFICIENT_DATA" || report.verdict.code === "SUSPECT_DATA" ? 2 : 0;
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

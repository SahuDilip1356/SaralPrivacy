import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/adminSession";
import { dbFromEnv, isMissingTable, ledgerToMap } from "@/lib/seo/db";
import { createGscClient, loadServiceAccount } from "@/lib/seo/gsc";
import { DEFAULT_BUDGET, SCOPES, mergeLedger, resolveSitemap, runInspection, type Scope } from "@/lib/seo/run";
import { REQUESTED_INDEXING, SITE } from "@/lib/seo/watchlist";

/**
 * Admin-triggered Search Console inspection — same run as
 * tools/seo/inspect.ts and the weekly Action, fired from /admin/seo.
 * Auth via the admin session (requireRole), same as /api/admin/aeo-panel-run.
 *
 * Needs GSC_SERVICE_ACCOUNT_JSON + SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * in the Vercel env. A full run is ≈240 inspections at 3-wide, well under
 * the 300 s ceiling.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireRole(req, ["admin"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { scope?: string; submitSitemap?: boolean };
  const scope = (SCOPES as readonly string[]).includes(body.scope ?? "") ? (body.scope as Scope) : "newcomers";

  const loaded = loadServiceAccount(process.cwd());
  if (!loaded) {
    return NextResponse.json({ error: "GSC_SERVICE_ACCOUNT_JSON is not configured in the Vercel env" }, { status: 500 });
  }
  const db = dbFromEnv();
  if (!db) {
    return NextResponse.json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured" }, { status: 500 });
  }

  const startedAt = Date.now();
  const lines: string[] = [];
  const log = (s: string) => lines.push(s);

  try {
    let prev = null;
    let ledger = { ...REQUESTED_INDEXING };
    try {
      prev = await db.fetchPrevRun();
      ledger = mergeLedger(REQUESTED_INDEXING, ledgerToMap(await db.fetchLedger()));
    } catch (err) {
      if (!isMissingTable(err)) throw err;
      return NextResponse.json({ error: "ops.seo_* tables missing — apply migration 0005 first" }, { status: 500 });
    }

    const sitemap = await resolveSitemap(SITE, prev, null, log);
    const report = await runInspection({
      api: createGscClient(loaded.sa, SITE),
      site: SITE,
      scope,
      budget: DEFAULT_BUDGET,
      analytics: true,
      submitSitemap: body.submitSitemap === true,
      prev,
      ledger,
      sitemapUrls: sitemap.urls,
      sitemapFetched: sitemap.fetched,
      keySource: loaded.source,
      dryRun: false,
      log,
    });
    // A suspect run is shown but never stored — it must not become the baseline.
    const suspect = report.data_sanity?.suspect === true;
    if (suspect) log(`NOT persisted — suspect data (${report.data_sanity?.reason}); the last good run remains the baseline`);
    else await db.persist(report);

    return NextResponse.json({
      ok: true,
      run_id: report.run_id,
      persisted: !suspect,
      verdict: report.verdict.code,
      summary: report.verdict.summary,
      inspected: report.inspected,
      errors: report.errors,
      shortlist: report.shortlist.length,
      newcomers: report.sitemap.newcomers.length,
      durationMs: Date.now() - startedAt,
      log: lines,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error", durationMs: Date.now() - startedAt, log: lines },
      { status: 500 },
    );
  }
}

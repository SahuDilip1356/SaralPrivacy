import { NextRequest, NextResponse } from 'next/server'
import { databases, DB_ID, COLLECTIONS, ID } from '@/lib/appwrite'
import { runAeoPanel, summarizeRun } from '@/lib/aeo/runner'
import { requireRole } from '@/lib/adminSession'

/**
 * Admin-triggered AEO panel run.
 * Same logic as /api/cron/aeo-panel but auth via admin_session cookie
 * instead of CRON_SECRET bearer — lets admins fire a run from the
 * /admin/citations dashboard without leaving the app.
 */
export const maxDuration = 300
export const dynamic     = 'force-dynamic'
export const runtime     = 'nodejs'

export async function POST(req: NextRequest) {
  // Auth — same pattern as /api/admin/data (signature-verified, admin only)
  const session = await requireRole(req, ['admin'])
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY not configured in Vercel env vars' },
      { status: 500 },
    )
  }

  const startedAt = Date.now()

  try {
    const results = await runAeoPanel(apiKey)
    const summary = summarizeRun(results)

    const persistResults = await Promise.allSettled(
      results.map((r) =>
        databases.createDocument(DB_ID, COLLECTIONS.AI_CITATIONS, ID.unique(), {
          run_id:          r.runId,
          date:            r.date,
          week_num:        r.weekNum,
          engine:          r.engine,
          engine_label:    r.engineLabel,
          query_id:        r.queryId,
          query_text:      r.queryText,
          cited:           r.cited,
          position:        r.position,
          cited_page:      r.citedPage,
          quote_type:      r.quoteType,
          competitors:     JSON.stringify(r.competitors),
          raw_citations:   JSON.stringify(r.rawCitations).slice(0, 50000),
          content_snippet: r.contentSnippet,
          duration_ms:     r.durationMs,
          error_message:   r.errorMessage || null,
        }),
      ),
    )

    const dbErrors = persistResults
      .filter((p) => p.status === 'rejected')
      .map((p) => (p as PromiseRejectedResult).reason?.message || 'unknown')

    return NextResponse.json({
      ok: true,
      totalDurationMs: Date.now() - startedAt,
      summary,
      persisted: persistResults.length - dbErrors.length,
      dbErrors:  dbErrors.slice(0, 5),
    })
  } catch (err) {
    console.error('Admin AEO panel run failed:', err)
    return NextResponse.json(
      {
        ok:    false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    )
  }
}

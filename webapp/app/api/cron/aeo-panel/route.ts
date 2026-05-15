import { NextResponse } from 'next/server'
import { databases, DB_ID, COLLECTIONS, ID } from '@/lib/appwrite'
import { runAeoPanel, summarizeRun } from '@/lib/aeo/runner'

/**
 * Weekly AEO Citation Panel
 * ─────────────────────────
 * Runs 5 locked prompts × 4 engines through OpenRouter, detects whether
 * saralprivacy.com is cited, and writes one row per (prompt, engine)
 * to Appwrite collection `ai_citations`.
 *
 * Schedule: Monday 03:30 UTC (≈ 09:00 IST) — see vercel.json
 * Auth: Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Manual test:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        https://saralprivacy.com/api/cron/aeo-panel
 *
 * Required env vars:
 *   OPENROUTER_API_KEY — your OpenRouter key
 *   CRON_SECRET        — random string, also set as cron secret in Vercel
 *   APPWRITE_*         — already configured for the project
 */

export const maxDuration = 300        // 5 min — Fluid Compute default ceiling
export const dynamic     = 'force-dynamic'
export const runtime     = 'nodejs'

export async function GET(req: Request) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 },
    )
  }
  const auth = req.headers.get('authorization') || ''
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── API key guard ─────────────────────────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY not configured' },
      { status: 500 },
    )
  }

  const startedAt = Date.now()

  try {
    // ── Run the panel ───────────────────────────────────────────────────────
    const results = await runAeoPanel(apiKey)
    const summary = summarizeRun(results)

    // ── Persist to Appwrite ─────────────────────────────────────────────────
    // One document per (run, query, engine) row.
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
    console.error('AEO panel failed:', err)
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

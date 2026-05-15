import { ENGINES } from './engines'
import { PROMPTS } from './prompts'
import { callOpenRouter } from './openrouter-client'
import { detectCitation } from './citation-detector'
import type { RunResult } from './types'

function weekNumber(d: Date): number {
  // ISO week number (Mon-start, week 1 contains the first Thursday)
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const diff = target.getTime() - firstThursday.getTime()
  return 1 + Math.round(diff / 604800000)
}

function uuid(): string {
  // Cheap UUID v4 — sufficient for run grouping, not security-sensitive
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Run the full AEO panel: 5 prompts × 4 engines = 20 OpenRouter calls.
 * Returns RunResult[] — caller persists to Appwrite + returns summary.
 *
 * Engine errors are captured per-row (not fatal) so a single engine outage
 * doesn't kill the whole run.
 */
export async function runAeoPanel(apiKey: string): Promise<RunResult[]> {
  const runId   = uuid()
  const now     = new Date()
  const date    = now.toISOString().slice(0, 10)
  const weekNum = weekNumber(now)

  const results: RunResult[] = []

  for (const prompt of PROMPTS) {
    for (const engine of ENGINES) {
      const startedAt = Date.now()
      const base: Omit<RunResult, 'cited' | 'position' | 'citedPage' | 'quoteType' | 'competitors' | 'rawCitations' | 'contentSnippet' | 'durationMs' | 'errorMessage'> = {
        runId,
        date,
        weekNum,
        engine:      engine.key,
        engineLabel: engine.label,
        queryId:     prompt.id,
        queryText:   prompt.text,
      }

      try {
        const { content, citations } = await callOpenRouter(engine.model, prompt.text, apiKey)
        const detection = detectCitation(content, citations)

        results.push({
          ...base,
          ...detection,
          quoteType:     null,                    // human review only — leave null in v1
          rawCitations:  citations,
          contentSnippet: content.slice(0, 500),
          durationMs:    Date.now() - startedAt,
        })
      } catch (err) {
        results.push({
          ...base,
          cited:         'No',
          position:      null,
          citedPage:     null,
          quoteType:     null,
          competitors:   [],
          rawCitations:  [],
          contentSnippet: '',
          durationMs:    Date.now() - startedAt,
          errorMessage:  err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  return results
}

export function summarizeRun(results: RunResult[]) {
  const total      = results.length
  const cited      = results.filter((r) => r.cited === 'Yes').length
  const mentioned  = results.filter((r) => r.cited === 'Mentioned-no-link').length
  const errored    = results.filter((r) => r.errorMessage).length
  const byEngine: Record<string, { total: number; cited: number }> = {}
  for (const r of results) {
    const k = r.engineLabel
    byEngine[k] ??= { total: 0, cited: 0 }
    byEngine[k].total++
    if (r.cited === 'Yes') byEngine[k].cited++
  }
  return {
    total,
    cited,
    mentioned,
    errored,
    citeRate: total ? cited / total : 0,
    byEngine,
  }
}

import { databases, DB_ID, COLLECTIONS, Query } from '@/lib/appwrite'
import RunButton from './RunButton'

export const dynamic     = 'force-dynamic'
export const revalidate  = 0

interface CitationRow {
  $id: string
  $createdAt: string
  run_id:        string
  date:          string
  week_num:      number
  engine:        string
  engine_label:  string
  query_id:      string
  query_text:    string
  cited:         'Yes' | 'No' | 'Mentioned-no-link'
  position:      number | null
  cited_page:    string | null
  competitors:   string  // JSON
  content_snippet: string
  duration_ms:   number
  error_message: string | null
}

async function fetchRecent(): Promise<CitationRow[]> {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.AI_CITATIONS, [
      Query.orderDesc('$createdAt'),
      Query.limit(500),
    ])
    return result.documents as unknown as CitationRow[]
  } catch {
    return []
  }
}

function pct(n: number, d: number): string {
  if (!d) return '—'
  return `${((n / d) * 100).toFixed(1)}%`
}

export default async function CitationsAdmin() {
  const rows = await fetchRecent()

  // ── Aggregate latest run ───────────────────────────────────────────────────
  const latestRunId = rows[0]?.run_id
  const latest = rows.filter((r) => r.run_id === latestRunId)
  const latestDate = latest[0]?.date

  const erroredCount = latest.filter((r) => r.error_message).length
  const overall = {
    total: latest.length,
    cited: latest.filter((r) => r.cited === 'Yes').length,
    mentioned: latest.filter((r) => r.cited === 'Mentioned-no-link').length,
    errored: erroredCount,
    cleanTotal: latest.length - erroredCount,
  }

  const byEngine: Record<string, { total: number; cited: number; errored: number }> = {}
  for (const r of latest) {
    const k = r.engine_label
    byEngine[k] ??= { total: 0, cited: 0, errored: 0 }
    byEngine[k].total++
    if (r.cited === 'Yes') byEngine[k].cited++
    if (r.error_message) byEngine[k].errored++
  }

  const byQuery: Record<string, { total: number; cited: number; topic: string }> = {}
  for (const r of latest) {
    const k = r.query_id
    byQuery[k] ??= { total: 0, cited: 0, topic: r.query_text.slice(0, 60) }
    byQuery[k].total++
    if (r.cited === 'Yes') byQuery[k].cited++
  }

  // ── Trend across all runs ──────────────────────────────────────────────────
  const runsMap: Record<string, { date: string; total: number; cited: number }> = {}
  for (const r of rows) {
    runsMap[r.run_id] ??= { date: r.date, total: 0, cited: 0 }
    runsMap[r.run_id].total++
    if (r.cited === 'Yes') runsMap[r.run_id].cited++
  }
  const trend = Object.entries(runsMap)
    .map(([runId, v]) => ({ runId, ...v, rate: v.total ? v.cited / v.total : 0 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy-700 mb-2">AEO Citation Panel</h1>
      <p className="text-slate-600 mb-6">
        Weekly automated cite-rate measurement across ChatGPT, Claude, Perplexity, Gemini via OpenRouter.
        Latest run: <strong>{latestDate || '—'}</strong>.
      </p>

      <RunButton />

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Overall Cite Rate</p>
          <p className="text-3xl font-bold text-navy-700 mt-2">{pct(overall.cited, overall.cleanTotal)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {overall.cited} of {overall.cleanTotal} clean prompts
            {overall.errored > 0 && (
              <span className="text-amber-600"> · {overall.errored} errored</span>
            )}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-xs text-yellow-700 font-semibold uppercase tracking-wider">Mentioned (no link)</p>
          <p className="text-3xl font-bold text-navy-700 mt-2">{pct(overall.mentioned, overall.total)}</p>
          <p className="text-xs text-slate-500 mt-1">Brand awareness, no citation</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Total runs logged</p>
          <p className="text-3xl font-bold text-navy-700 mt-2">{Object.keys(runsMap).length}</p>
          <p className="text-xs text-slate-500 mt-1">Across {rows.length} prompt-engine pairs</p>
        </div>
      </div>

      {/* ── By Engine ────────────────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Cite Rate by Engine — Latest Run</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {Object.entries(byEngine).map(([engine, v]) => {
          const cleanCount = v.total - v.errored
          return (
            <div key={engine} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500">{engine}</p>
              <p className="text-2xl font-bold text-navy-700 mt-1">{pct(v.cited, cleanCount)}</p>
              <p className="text-xs text-slate-400">
                {v.cited}/{cleanCount}
                {v.errored > 0 && (
                  <span className="text-amber-600 ml-1">· {v.errored} err</span>
                )}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── By Query ─────────────────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Cite Rate by Query — Latest Run</h2>
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Query</th>
              <th className="text-left px-3 py-2">Topic</th>
              <th className="text-right px-3 py-2">Cited</th>
              <th className="text-right px-3 py-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byQuery).map(([qid, v]) => (
              <tr key={qid} className="border-b border-slate-100">
                <td className="px-3 py-2 font-mono">{qid}</td>
                <td className="px-3 py-2 text-slate-700">{v.topic}…</td>
                <td className="px-3 py-2 text-right">{v.cited}/{v.total}</td>
                <td className="px-3 py-2 text-right font-semibold">{pct(v.cited, v.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Trend ────────────────────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Trend — Last 12 Runs</h2>
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-right px-3 py-2">Cite Rate</th>
              <th className="text-right px-3 py-2">Cited / Total</th>
              <th className="text-left px-3 py-2 pl-6">Bar</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((t) => (
              <tr key={t.runId} className="border-b border-slate-100">
                <td className="px-3 py-2">{t.date}</td>
                <td className="px-3 py-2 text-right font-semibold">{(t.rate * 100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-slate-500">{t.cited}/{t.total}</td>
                <td className="px-3 py-2 pl-6">
                  <div className="h-2 bg-slate-100 rounded">
                    <div
                      className="h-2 rounded bg-green-500"
                      style={{ width: `${(t.rate * 100).toFixed(1)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Raw rows ─────────────────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Latest Run — Detail</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-2 py-2">Engine</th>
              <th className="text-left px-2 py-2">Q</th>
              <th className="text-left px-2 py-2">Cited</th>
              <th className="text-right px-2 py-2">Pos</th>
              <th className="text-left px-2 py-2">Page</th>
              <th className="text-left px-2 py-2">Competitors</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((r) => (
              <tr key={r.$id} className="border-b border-slate-100">
                <td className="px-2 py-2">{r.engine_label}</td>
                <td className="px-2 py-2 font-mono">{r.query_id}</td>
                <td className={`px-2 py-2 font-semibold ${
                  r.cited === 'Yes' ? 'text-green-700' :
                  r.cited === 'Mentioned-no-link' ? 'text-yellow-700' : 'text-slate-500'
                }`}>{r.cited}</td>
                <td className="px-2 py-2 text-right">{r.position ?? '—'}</td>
                <td className="px-2 py-2 truncate max-w-xs">{r.cited_page || '—'}</td>
                <td className="px-2 py-2 text-slate-500 truncate max-w-xs">
                  {(() => { try { return (JSON.parse(r.competitors) as string[]).slice(0, 3).join(', ') } catch { return '—' } })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mt-6">
          <p className="text-sm text-yellow-800">
            No data yet. Either (a) the Appwrite collection <code>ai_citations</code> hasn&apos;t been
            created, (b) the cron hasn&apos;t fired yet, or (c) you need to trigger a manual run via
            <code className="ml-1 px-1.5 py-0.5 bg-yellow-100 rounded">curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; https://saralprivacy.com/api/cron/aeo-panel</code>
          </p>
        </div>
      )}
    </div>
  )
}

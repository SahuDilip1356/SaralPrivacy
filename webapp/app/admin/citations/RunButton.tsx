'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'

interface RunSummary {
  total: number
  cited: number
  mentioned: number
  errored: number
  citeRate: number
  byEngine: Record<string, { total: number; cited: number }>
}

interface RunResponse {
  ok: boolean
  summary?: RunSummary
  persisted?: number
  dbErrors?: string[]
  error?: string
  totalDurationMs?: number
}

export default function RunButton() {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [elapsed, setElapsed] = useState(0)

  async function triggerRun() {
    setState('running')
    setMessage('Starting 20 prompts across ChatGPT, Claude, Perplexity, Gemini…')
    setElapsed(0)

    const tick = setInterval(() => setElapsed((s) => s + 1), 1000)

    try {
      const res = await fetch('/api/admin/aeo-panel-run', { method: 'POST' })
      clearInterval(tick)

      // Defensive parse — Vercel returns HTML on 504 timeouts and 500 errors
      const text = await res.text()
      let data: RunResponse | null = null
      try {
        data = JSON.parse(text) as RunResponse
      } catch {
        setState('error')
        if (res.status === 504) {
          setMessage(`Vercel function timed out (504, ${elapsed}s). The run exceeded the 300s ceiling. Tell Claude — the runner needs parallelization.`)
        } else {
          setMessage(`HTTP ${res.status} returned non-JSON: ${text.slice(0, 200)}`)
        }
        return
      }

      if (!res.ok || !data?.ok) {
        setState('error')
        setMessage(data?.error || `HTTP ${res.status}`)
        return
      }

      const s = data.summary!
      setState('success')
      setMessage(
        `Done — ${s.cited} of ${s.total} prompts cited saralprivacy. ` +
        `(${(s.citeRate * 100).toFixed(1)}% cite rate). ` +
        `Persisted ${data.persisted} rows. Refreshing in 2s…`
      )
      setTimeout(() => router.refresh(), 2000)
    } catch (err) {
      clearInterval(tick)
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-navy-700">Run Panel Now</p>
          <p className="text-sm text-slate-600 mt-1">
            Fires 5 prompts × 4 engines via OpenRouter. Takes 60–120 seconds. Writes 20 rows to Appwrite.
          </p>
        </div>
        <button
          onClick={triggerRun}
          disabled={state === 'running'}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            state === 'running'
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {state === 'running' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running… {elapsed}s
            </>
          ) : (
            <>
              <Play size={16} />
              Run Panel Now
            </>
          )}
        </button>
      </div>

      {state !== 'idle' && (
        <div
          className={`mt-4 px-4 py-3 rounded-lg text-sm ${
            state === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            state === 'error'   ? 'bg-red-50 border border-red-200 text-red-800' :
                                  'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}

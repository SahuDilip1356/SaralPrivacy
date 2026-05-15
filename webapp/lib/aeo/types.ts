/**
 * Shared types for the AEO Citation Panel.
 * Mirrors the Appwrite `ai_citations` collection schema.
 */

export type CitedStatus = 'Yes' | 'No' | 'Mentioned-no-link'
export type QuoteType   = 'Verbatim' | 'Paraphrase' | 'Just-link' | null
export type EngineKey   = 'chatgpt' | 'claude' | 'perplexity' | 'gemini'
export type QueryId     = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'

export interface PromptDef {
  id: QueryId
  topic: string
  text: string
  targetPage: string
  rationale: string
}

export interface EngineDef {
  key: EngineKey
  label: string
  /** OpenRouter model identifier (with :online suffix where applicable) */
  model: string
  /** Whether this model has native search (Perplexity Sonar) vs OpenRouter web wrapper (:online) */
  nativeSearch: boolean
}

export interface CitationHit {
  url: string
  title?: string
  position: number     // 1-indexed; the order it appeared in the citation list
}

export interface RunResult {
  runId: string        // UUID per cron firing — groups all 20 rows
  date: string         // YYYY-MM-DD (UTC of run)
  weekNum: number
  engine: EngineKey
  engineLabel: string
  queryId: QueryId
  queryText: string
  cited: CitedStatus
  position: number | null
  citedPage: string | null
  quoteType: QuoteType
  competitors: string[]
  rawCitations: CitationHit[]   // full citation list for audit
  contentSnippet: string         // first 500 chars of model output for context
  durationMs: number
  errorMessage?: string
}

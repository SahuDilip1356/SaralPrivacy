import type { CitationHit } from './types'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const SITE_URL       = 'https://saralprivacy.com'
const APP_NAME       = 'SaralPrivacy AEO Panel'

interface OpenRouterChoice {
  message: {
    content: string
    annotations?: Array<{
      type?: string
      url_citation?: { url: string; title?: string; start_index?: number; end_index?: number }
      url?: string
      title?: string
    }>
  }
}

interface OpenRouterResponse {
  id?: string
  choices: OpenRouterChoice[]
  // Perplexity-specific top-level field
  citations?: string[]
  // Some models return a structured search_results array
  search_results?: Array<{ url: string; title?: string }>
  error?: { message: string; code?: number }
}

export interface CallResult {
  content: string
  citations: CitationHit[]
  raw: OpenRouterResponse
}

/**
 * Calls an OpenRouter chat completion with web-search enabled and
 * normalizes citations across the three response shapes we've seen:
 *   1. Perplexity Sonar: top-level `citations: string[]`
 *   2. OpenAI/Anthropic via :online: `message.annotations[].url_citation`
 *   3. Some Gemini routes: `search_results[]`
 */
export async function callOpenRouter(
  model: string,
  prompt: string,
  apiKey: string,
): Promise<CallResult> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
      // OpenRouter ranking signals — helps with their dashboard, no functional impact
      'HTTP-Referer':  SITE_URL,
      'X-Title':       APP_NAME,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      // Cap output to keep responses comparable and costs predictable
      max_tokens: 1500,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`)
  }

  const data: OpenRouterResponse = await res.json()

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message}`)
  }

  const choice = data.choices?.[0]
  if (!choice) {
    throw new Error('OpenRouter returned no choices')
  }

  const content = choice.message?.content ?? ''
  const citations = extractCitations(data, choice)

  return { content, citations, raw: data }
}

function extractCitations(
  resp: OpenRouterResponse,
  choice: OpenRouterChoice,
): CitationHit[] {
  const out: CitationHit[] = []
  const seen = new Set<string>()
  let pos = 1

  const push = (url: string, title?: string) => {
    if (!url) return
    const normalized = url.trim()
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    out.push({ url: normalized, title, position: pos++ })
  }

  // 1. Perplexity-style top-level citations
  if (Array.isArray(resp.citations)) {
    for (const url of resp.citations) {
      if (typeof url === 'string') push(url)
    }
  }

  // 2. OpenAI/Anthropic via :online — annotations
  const annotations = choice.message?.annotations
  if (Array.isArray(annotations)) {
    for (const a of annotations) {
      const url   = a.url_citation?.url ?? a.url
      const title = a.url_citation?.title ?? a.title
      if (url) push(url, title)
    }
  }

  // 3. search_results (some Gemini routes)
  if (Array.isArray(resp.search_results)) {
    for (const r of resp.search_results) {
      if (r.url) push(r.url, r.title)
    }
  }

  return out
}

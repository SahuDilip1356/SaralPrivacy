import type { CitationHit, CitedStatus } from './types'

const OWN_HOST_PATTERNS = [
  /(^|\.)saralprivacy\.com$/i,
]

const BRAND_MENTION_PATTERN = /\bsaral\s*privacy\b/i

export interface DetectionResult {
  cited: CitedStatus
  position: number | null
  citedPage: string | null
  competitors: string[]
}

/**
 * Decide whether a model response cites saralprivacy.com.
 *
 * Logic:
 *   - If any citation URL hostname matches saralprivacy.com → Yes, with position.
 *   - Else if model output mentions "SaralPrivacy" as text without a URL citation → Mentioned-no-link.
 *   - Else → No.
 *
 * Competitors = all non-saralprivacy hosts cited, deduped.
 */
export function detectCitation(
  content: string,
  citations: CitationHit[],
): DetectionResult {
  let ownHit: CitationHit | null = null
  const competitorHosts = new Set<string>()

  for (const c of citations) {
    const host = safeHost(c.url)
    if (!host) continue
    if (isOwnHost(host)) {
      if (!ownHit) ownHit = c // first match wins for position
    } else {
      competitorHosts.add(host)
    }
  }

  if (ownHit) {
    return {
      cited: 'Yes',
      position: ownHit.position,
      citedPage: ownHit.url,
      competitors: [...competitorHosts],
    }
  }

  if (BRAND_MENTION_PATTERN.test(content)) {
    return {
      cited: 'Mentioned-no-link',
      position: null,
      citedPage: null,
      competitors: [...competitorHosts],
    }
  }

  return {
    cited: 'No',
    position: null,
    citedPage: null,
    competitors: [...competitorHosts],
  }
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

function isOwnHost(host: string): boolean {
  return OWN_HOST_PATTERNS.some((re) => re.test(host))
}

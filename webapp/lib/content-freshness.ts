// Single source of truth for content lastModified dates.
// Read by app/sitemap.ts, articleSchema(), and the visible Byline component
// so the dates in JSON-LD, the sitemap, and the UI never drift apart.

export const FRESHNESS = {
  core:          new Date('2026-04-29'),
  glossary:      new Date('2026-04-29'),
  tools:         new Date('2026-04-29'),
  learn:         new Date('2026-04-30'),
  industry:      new Date('2026-04-30'),
  faq:           new Date('2026-03-01'),
  briefingsHub:  new Date('2026-03-28'),
  blogHub:       new Date('2026-03-29'),
  media:         new Date('2026-06-06'),
  legal:         new Date('2026-07-17'), // Privacy Notice v2.0 + /rights hub
} as const

export function formatReviewDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

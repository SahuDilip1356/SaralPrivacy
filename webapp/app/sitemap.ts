import { MetadataRoute } from 'next'
import { queryDocuments } from '@/lib/db'
import { FRESHNESS } from '@/lib/content-freshness'
import { sectorSlugs } from '@/lib/data/sectors'
import { dataMapSlugs } from '@/lib/data/data-flow'
import { READING_LANGS } from '@/lib/data/guide-languages'
import { getPublishedBriefings } from '@/lib/data/briefings-source'

const BASE = 'https://saralprivacy.com'

// Date constants now live in lib/content-freshness.ts so sitemap, schema, and
// the visible Byline component all read one source of truth. Update there.
const CORE_UPDATED     = FRESHNESS.core
const GLOSSARY_UPDATED = FRESHNESS.glossary
const TOOLS_UPDATED    = FRESHNESS.tools
const LEARN_UPDATED    = FRESHNESS.learn
const INDUSTRY_UPDATED = FRESHNESS.industry
const FAQ_UPDATED      = FRESHNESS.faq
const BRIEFINGS_HUB    = FRESHNESS.briefingsHub
const BLOG_HUB         = FRESHNESS.blogHub

const learnTopics = [
  'what-is-dpdpa',
  'applicability',
  'consent',
  'rights',
  'data-breach',
  'key-terms',
  'duties',
  'notice',
  'childrens-data',
  'retention',
  'cross-border',
  'myths',
]

const industryPages = sectorSlugs

// Briefing slugs that exist as STATIC content only (not Appwrite documents).
// Every other briefing comes from getPublishedBriefings() — never hand-maintain
// a slug list here again, it drifted to 8-of-122 last time.
const staticBriefingSlugs: Array<{ slug: string; updated: Date }> = [
  { slug: 'dpdpa-consent-notice-requirements-2025',          updated: new Date('2026-02-10') },
  { slug: 'recruitment-agencies-dpdpa-cv-database-risk',     updated: new Date('2026-02-14') },
  { slug: 'ca-firms-pan-aadhaar-obligations-dpdpa',          updated: new Date('2026-02-18') },
  { slug: 'd2c-brands-whatsapp-marketing-consent-dpdpa',     updated: new Date('2026-02-22') },
  { slug: 'data-breach-notification-obligations-dpdpa',      updated: new Date('2026-02-26') },
  { slug: 'training-institutes-student-data-dpdpa',          updated: new Date('2026-03-01') },
  { slug: 'rights-of-data-principals-dpdpa-explained',       updated: new Date('2026-03-05') },
  { slug: 'significant-data-fiduciary-status-dpdpa',         updated: new Date('2026-03-10') },
]

/**
 * Live briefings from Appwrite, merged with the static fallbacks above.
 * Appwrite wins on date when a slug exists in both.
 */
async function getBriefingEntries(): Promise<Array<{ slug: string; updated: Date }>> {
  const live = await getPublishedBriefings()
  const bySlug = new Map<string, Date>()
  for (const { slug, updated } of staticBriefingSlugs) bySlug.set(slug, updated)
  for (const { slug, updated } of live) bySlug.set(slug, updated)
  return [...bySlug].map(([slug, updated]) => ({ slug, updated }))
}

/** Fetch ALL published blog post slugs + updated dates from Appwrite (paginated). */
async function getBlogSlugs(): Promise<Array<{ slug: string; updated: Date }>> {
  const PAGE = 100
  const posts: Array<{ slug: string; updated: Date }> = []
  try {
    for (let page = 0; page < 20; page++) {
      const result = await queryDocuments('blog_posts', {
        where: [{ field: 'status', value: 'published' }],
        orderBy: { field: '$updatedAt', dir: 'desc' },
        limit: PAGE,
        offset: page * PAGE,
      })
      for (const doc of result.docs) {
        if (!doc.slug) continue
        posts.push({
          // Lowercased deliberately: at least one stored slug has a capital
          // ("Cross-border-…"). Appwrite slug matching is case-insensitive
          // (verified on prod: both cases return 200) and proxy.ts 308s
          // uppercase → lowercase, so the sitemap must advertise the
          // lowercase URL or every crawl of it would be a wasted redirect.
          slug: (doc.slug as string).toLowerCase(),
          updated: new Date((doc.published_at || doc.$updatedAt) as string),
        })
      }
      if (result.docs.length < PAGE || posts.length >= result.total) break
    }
  } catch {
    return posts
  }
  return posts
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogSlugs, briefingSlugs] = await Promise.all([
    getBlogSlugs(),
    getBriefingEntries(),
  ])

  return [
    // ── Core ──
    { url: BASE,                    lastModified: CORE_UPDATED,     changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/about`,         lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,       lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/media`,            lastModified: FRESHNESS.media, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/media/coverage`,   lastModified: FRESHNESS.media, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/media/press-wall`, lastModified: FRESHNESS.media, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/white-paper`,   lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.8 },
    // Per-language Guide reading pages (static HTML in /public/guides)
    ...READING_LANGS.map((l) => ({
      url: `${BASE}${l.htmlUrl}`,
      lastModified: CORE_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${BASE}/resources`,     lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.8 },

    // ── Tools ──
    { url: `${BASE}/penalty-calculator`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/discovery`,          lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/tools/dpdpa-privacy-notice-generator`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },

    // ── Assessment hub (crawlable intro text) ──
    { url: `${BASE}/assessment`,    lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.8 },
    // Sub-routes are client-side JS wizards; noindex set in page metadata — exclude from sitemap
    // /assessment/recruitment, /assessment/ca-firms, /assessment/training-institutes, /assessment/d2c-brands

    // ── Learn ──
    { url: `${BASE}/learn`,                       lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/learn/dpdp-act-2023`,         lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/learn/dpdp-rules-2025-plain-english-guide`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    ...learnTopics.map((topic) => ({
      url: `${BASE}/learn/${topic}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Industries ──
    { url: `${BASE}/industries`,    lastModified: INDUSTRY_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    ...industryPages.map((slug) => ({
      url: `${BASE}/industries/${slug}`,
      lastModified: INDUSTRY_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // ── Data Mapping ──
    // Landing page plus one entry per LIVE map, derived from the data-flow
    // registry, so a new map is listed the moment its pack is registered and a
    // planned sector can never be submitted before its page exists.
    { url: `${BASE}/data-mapping`, lastModified: INDUSTRY_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    ...dataMapSlugs.map((slug) => ({
      url: `${BASE}/industries/${slug}/data-flow`,
      lastModified: INDUSTRY_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Glossary ──
    { url: `${BASE}/glossary`, lastModified: GLOSSARY_UPDATED, changeFrequency: 'monthly', priority: 0.85 },

    // ── FAQ ──
    { url: `${BASE}/faq`,           lastModified: FAQ_UPDATED,      changeFrequency: 'monthly', priority: 0.7 },

    // ── Briefings ──
    { url: `${BASE}/briefings`,     lastModified: BRIEFINGS_HUB,    changeFrequency: 'daily',   priority: 0.8 },
    ...briefingSlugs.map(({ slug, updated }) => ({
      url: `${BASE}/briefings/${slug}`,
      lastModified: updated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Blog ──
    { url: `${BASE}/blog`,          lastModified: BLOG_HUB,         changeFrequency: 'weekly',  priority: 0.7 },
    ...blogSlugs.map(({ slug, updated }) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: updated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Legal (low priority) ──
    { url: `${BASE}/privacy`,       lastModified: FRESHNESS.legal, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`,         lastModified: FRESHNESS.legal, changeFrequency: 'yearly', priority: 0.2 },

    // /rights — canonical hub for Data Principal rights. Indexed deliberately (unlike the
    // /rights/* stubs): it is a genuine trust surface and targets real search intent.
    // Higher priority than /privacy for that reason.
    { url: `${BASE}/rights`,        lastModified: FRESHNESS.legal, changeFrequency: 'yearly', priority: 0.4 },

    // EXCLUDED — intentional:
    // /consent-preferences  → utility page, noindex
    // /subscribe            → utility subscribe form, noindex
    // /unsubscribe          → redirect to /consent-preferences
    // /rights/access        → 308 redirect to /rights#access, noindex
    // /rights/erasure       → 308 redirect to /rights#erasure, noindex
    //                         (robots.ts deliberately does NOT disallow /rights/ — rights
    //                          pages stay crawlable; noindex deindexes just these stubs)
    // /admin/*              → gated, disallowed in robots
    // /api/*                → internal endpoints
    // /assessment/*         → client-side JS wizards, noindex
  ]
}

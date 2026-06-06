import { MetadataRoute } from 'next'
import { databases, DB_ID, COLLECTIONS, Query } from '@/lib/appwrite'
import { FRESHNESS } from '@/lib/content-freshness'

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

const industryPages = [
  'recruitment-agencies',
  'ca-firms',
  'training-institutes',
  'd2c-brands',
]

// Briefing slugs: add new slugs + real publish dates as briefings go live
const briefingSlugs: Array<{ slug: string; updated: Date }> = [
  { slug: 'dpdpa-consent-notice-requirements-2025',          updated: new Date('2026-02-10') },
  { slug: 'recruitment-agencies-dpdpa-cv-database-risk',     updated: new Date('2026-02-14') },
  { slug: 'ca-firms-pan-aadhaar-obligations-dpdpa',          updated: new Date('2026-02-18') },
  { slug: 'd2c-brands-whatsapp-marketing-consent-dpdpa',     updated: new Date('2026-02-22') },
  { slug: 'data-breach-notification-obligations-dpdpa',      updated: new Date('2026-02-26') },
  { slug: 'training-institutes-student-data-dpdpa',          updated: new Date('2026-03-01') },
  { slug: 'rights-of-data-principals-dpdpa-explained',       updated: new Date('2026-03-05') },
  { slug: 'significant-data-fiduciary-status-dpdpa',         updated: new Date('2026-03-10') },
]

/** Fetch all published blog post slugs + updated dates from Appwrite */
async function getBlogSlugs(): Promise<Array<{ slug: string; updated: Date }>> {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOG_POSTS, [
      Query.equal('status', 'published'),
      Query.orderDesc('$updatedAt'),
      Query.limit(100),
    ])
    return result.documents.map((doc) => ({
      slug: doc.slug as string,
      updated: new Date((doc.published_at || doc.$updatedAt) as string),
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogSlugs = await getBlogSlugs()

  return [
    // ── Core ──
    { url: BASE,                    lastModified: CORE_UPDATED,     changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/about`,         lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,       lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/media`,            lastModified: FRESHNESS.media, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/media/coverage`,   lastModified: FRESHNESS.media, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/media/press-wall`, lastModified: FRESHNESS.media, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/white-paper`,   lastModified: CORE_UPDATED,     changeFrequency: 'monthly', priority: 0.8 },
    // /resources → 301 redirect to /blog; excluded from sitemap to avoid index pollution

    // ── Tools ──
    { url: `${BASE}/penalty-calculator`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.8 },

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

    // EXCLUDED — intentional:
    // /resources            → 301 redirect to /blog
    // /consent-preferences  → utility page, noindex
    // /subscribe            → utility subscribe form, noindex
    // /unsubscribe          → redirect to /consent-preferences
    // /rights/access        → redirect to /privacy#data-rights, noindex, robots disallowed
    // /rights/erasure       → redirect to /privacy#data-rights, noindex, robots disallowed
    // /admin/*              → gated, disallowed in robots
    // /api/*                → internal endpoints
    // /assessment/*         → client-side JS wizards, noindex
  ]
}

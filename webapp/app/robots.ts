import { MetadataRoute } from 'next'

// Only block what genuinely shouldn't be in search results:
//   /admin       — admin console (private)
//   /api/        — API endpoints (not pages)
//   /report/     — tokenized assessment reports (already noindex; defense in depth)
// Public consent and rights pages remain crawlable — they are transparency
// surfaces that we want indexed.
// Static assets under /_next/ MUST remain crawlable so Googlebot can render
// JS-driven pages and index optimized images.
const COMMON_DISALLOW = ['/admin', '/admin/', '/api/', '/report/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*',                    allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'Googlebot',            allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'Bingbot',              allow: '/', disallow: COMMON_DISALLOW },
      // AI / LLM crawlers — SaralPrivacy is public DPDPA education content;
      // welcome compliant AI crawlers indexing guides, briefings, FAQs.
      { userAgent: 'GPTBot',               allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'Google-Extended',      allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'anthropic-ai',         allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'ClaudeBot',            allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'PerplexityBot',        allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'YouBot',               allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'Applebot-Extended',    allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'Diffbot',              allow: '/', disallow: COMMON_DISALLOW },
      { userAgent: 'cohere-ai',            allow: '/', disallow: COMMON_DISALLOW },
    ],
    sitemap: 'https://saralprivacy.com/sitemap.xml',
    host: 'https://saralprivacy.com',
  }
}

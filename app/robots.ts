import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Wildcard: allow all public routes, block utility + internal ──
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/consent-preferences',
          '/_next/',
        ],
      },

      // ── Google ──
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },

      // ── Bing ──
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },

      // ── AI / LLM crawlers ──
      // SaralPrivacy is a public DPDPA compliance education platform.
      // We explicitly welcome compliant AI crawlers indexing our guides,
      // briefings, FAQs, and industry content for knowledge retrieval.
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'YouBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'Diffbot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences'],
      },
    ],
    sitemap: 'https://saralprivacy.com/sitemap.xml',
    host: 'https://saralprivacy.com',
  }
}

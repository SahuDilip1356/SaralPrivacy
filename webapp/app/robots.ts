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
          '/rights/',
          '/_next/',
        ],
      },

      // ── Google ──
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },

      // ── Bing ──
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },

      // ── AI / LLM crawlers ──
      // SaralPrivacy is a public DPDPA compliance education platform.
      // We explicitly welcome compliant AI crawlers indexing our guides,
      // briefings, FAQs, and industry content for knowledge retrieval.
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'YouBot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'Diffbot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/consent-preferences', '/rights/'],
      },
    ],
    sitemap: 'https://saralprivacy.com/sitemap.xml',
    host: 'https://saralprivacy.com',
  }
}

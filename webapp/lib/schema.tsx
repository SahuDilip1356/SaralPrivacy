import React from 'react'
import { defaultAuthor, type Author } from './data/authors'

type PersonSchema = {
  '@type': 'Person'
  name: string
  url?: string
  jobTitle?: string
  sameAs?: string[]
  image?: string
  description?: string
}

function personFromAuthor(a: Author): PersonSchema {
  return {
    '@type': 'Person',
    name: a.name,
    url: a.url,
    jobTitle: a.jobTitle,
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
    ...(a.image ? { image: a.image } : {}),
    ...(a.description ? { description: a.description } : {}),
  }
}

export function organizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SaralPrivacy',
    url: 'https://saralprivacy.com',
    logo: 'https://saralprivacy.com/og-image.png',
    description: 'Practical DPDPA education, assessment, and advisory platform for Indian businesses.',
    foundingDate: '2025',
    areaServed: 'IN',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'privacy@saralprivacy.com',
      contactType: 'customer support',
    },
    sameAs: [],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function websiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SaralPrivacy',
    url: 'https://saralprivacy.com',
    description: 'DPDPA compliance education and assessment platform for Indian businesses.',
    inLanguage: 'en-IN',
    // Note: potentialAction / SearchAction removed — the FAQ search is client-side
    // only and does not resolve via URL parameter server-side. A broken SearchAction
    // is worse than none and can cause rich result errors in Search Console.
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function articleSchema(
  title: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified?: string,
  opts: { author?: Author; reviewedBy?: Author; inLanguage?: string } = {}
) {
  const author = opts.author ?? defaultAuthor
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: opts.inLanguage ?? 'en-IN',
    datePublished,
    dateModified: dateModified || datePublished,
    author: personFromAuthor(author),
    publisher: {
      '@type': 'Organization',
      name: 'SaralPrivacy',
      url: 'https://saralprivacy.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://saralprivacy.com/og-image.png',
      },
    },
  }
  if (opts.reviewedBy) {
    schema.reviewedBy = personFromAuthor(opts.reviewedBy)
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>,
  opts: { url?: string; inLanguage?: string; dateModified?: string } = {}
) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: opts.inLanguage ?? 'en-IN',
    ...(opts.url ? { url: opts.url, mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url } } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// AEO/GEO helpers — added Sprint 4 to lift LLM citation rate.
// Mounted opportunistically; consumers in industry/learn/penalty-calculator pages
// will pick these up across Sprint 4 and Sprint 5.
// ──────────────────────────────────────────────────────────────────────────────

export function howToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; url?: string }>,
  opts: { totalTime?: string; url?: string; inLanguage?: string } = {}
) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    inLanguage: opts.inLanguage ?? 'en-IN',
    ...(opts.url ? { url: opts.url } : {}),
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function speakableSchema(cssSelectors: string[], url?: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    ...(url ? { url } : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function datasetSchema(
  name: string,
  description: string,
  url: string,
  opts: {
    license?: string
    creator?: string
    keywords?: string[]
    isAccessibleForFree?: boolean
  } = {}
) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    isAccessibleForFree: opts.isAccessibleForFree ?? true,
    license: opts.license ?? 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: opts.creator ?? 'SaralPrivacy',
      url: 'https://saralprivacy.com',
    },
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function legalServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'SaralPrivacy',
    url: 'https://saralprivacy.com',
    description:
      'DPDPA compliance education, readiness assessments, and advisory for Indian businesses. Not a law firm.',
    areaServed: { '@type': 'Country', name: 'India' },
    serviceType: 'DPDPA Compliance Advisory',
    provider: {
      '@type': 'Organization',
      name: 'SaralPrivacy',
      url: 'https://saralprivacy.com',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

import React from 'react'

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
  dateModified?: string
) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: 'SaralPrivacy Editorial Team',
      url: 'https://saralprivacy.com',
    },
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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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

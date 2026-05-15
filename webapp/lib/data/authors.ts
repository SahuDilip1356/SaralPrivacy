export type Author = {
  id: string
  name: string
  jobTitle: string
  url: string
  sameAs?: string[]
  image?: string
  description?: string
}

// To strengthen author E-E-A-T for LLM citation, add verified profile URLs to
// `sameAs` (LinkedIn, X, GitHub, academic page, Wikipedia, etc.). LLMs use
// these to confirm the author is a real, identifiable expert.
export const AUTHORS = {
  saahodilipkumaar: {
    id: 'saahodilipkumaar',
    name: 'SaahoDilipKumaar',
    jobTitle: 'Founder, SaralPrivacy',
    url: 'https://saralprivacy.com/author/saahodilipkumaar',
    sameAs: [],
    image: 'https://saralprivacy.com/og-image.png',
    description:
      "Founder of SaralPrivacy. Works on practical DPDPA compliance for Indian SMBs — recruitment agencies, CA firms, training institutes, and D2C brands. Focuses on translating the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 into operational steps a small business can actually run.",
  },
} as const satisfies Record<string, Author>

export const defaultAuthor: Author = AUTHORS.saahodilipkumaar

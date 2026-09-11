// lib/cta-copy.ts
// Single source of truth for contextual CTA WIRING (hrefs + the industry-slug
// union). The display copy itself moved verbatim into messages/en.json under
// the `cta` namespace (MULTILINGUAL_SPEC §4.3A) — the CTA components in
// components/cta/* resolve it with useTranslations("cta"), so one catalog
// change still updates every placement across learn, briefings, faq, glossary
// and industry pages.

export const ctaHrefs = {
  assessment: "/assessment",
  whitepaper: "/white-paper#download",
} as const;

/**
 * Industry slugs with assessment-CTA copy overrides in the catalog
 * (`cta.industry.<slug>.*`). Passed as the `industry` prop to <AssessmentCTA>
 * on industry pages; the href is derived as /assessment/<assessment slug>.
 */
export const industryAssessmentHrefs = {
  "recruitment-agencies": "/assessment/recruitment",
  "ca-firms": "/assessment/ca-firms",
  "training-institutes": "/assessment/training-institutes",
  "d2c-brands": "/assessment/d2c-brands",
  "clinics-diagnostic-labs": "/assessment/clinics-diagnostic-labs",
  "schools-colleges": "/assessment/schools-colleges",
  "law-firms": "/assessment/law-firms",
  "real-estate": "/assessment/real-estate",
} as const;

export type IndustrySlug = keyof typeof industryAssessmentHrefs;

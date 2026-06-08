// lib/cta-copy.ts
// Single source of truth for all contextual CTA copy.
// Change once → updates everywhere across learn, briefings, faq, glossary, and industry pages.

export const ctaCopy = {
  assessment: {
    eyebrow:  "Free · 10 minutes",
    heading:  "Is your business DPDPA-ready?",
    body:     "Answer a few plain-English questions. Get your free Readiness Score with a prioritised action list.",
    cta:      "Check My Readiness →",
    href:     "/assessment",
  },
  assessmentCompact: {
    heading:  "Know your DPDPA risk in 10 minutes",
    cta:      "Free Readiness Check →",
    href:     "/assessment",
  },
  whitepaper: {
    eyebrow:  "Free Download",
    heading:  "The Complete DPDPA Compliance Guide",
    body:     "35 pages. Plain English. Everything your business needs to understand the DPDP Rules 2025 — written for founders, not lawyers.",
    cta:      "Download White Paper →",
    href:     "/white-paper#download",
  },
  whitepaperCompact: {
    heading:  "Get the complete DPDPA guide",
    cta:      "Free Download →",
    href:     "/white-paper#download",
  },
  templates: {
    eyebrow:  "5 Ready-to-Use Templates",
    heading:  "Start complying — not just reading",
    body:     "Privacy Notice, Consent Language, Data Inventory, DSR SOP, Vendor Register. Delivered free to your email.",
    cta:      "Download Free Templates",
  },
  templatesCompact: {
    heading:  "Download DPDPA compliance templates",
    cta:      "Get Free Templates",
  },
} as const;

// Industry-specific assessment copy overrides.
// Passed as the `copy` prop to <AssessmentCTA> on industry pages.
export const industryAssessmentCopy = {
  "recruitment-agencies": {
    eyebrow:  "Free · For Recruitment Agencies",
    heading:  "Is your candidate data DPDPA-compliant?",
    body:     "CV collection, WhatsApp consent, reference checks — see your specific risks and what to fix first.",
    cta:      "Check Recruiter Readiness →",
    href:     "/assessment",
  },
  "ca-firms": {
    eyebrow:  "Free · For CA Firms",
    heading:  "Is your client-document handling DPDPA-ready?",
    body:     "PAN, Aadhaar, ITR, bank statements, payroll across WhatsApp, Drive and laptops — get your firm's readiness score in 3 minutes.",
    cta:      "Start CA Firm Risk Scan →",
    href:     "/assessment/ca-firms",
  },
  "training-institutes": {
    eyebrow:  "Free · For Training Institutes",
    heading:  "Is your student-data handling DPDPA-ready?",
    body:     "Admission forms, parent consent, minors, WhatsApp groups, student photos, LMS tools and placement data — get your institute's readiness score in 3 minutes.",
    cta:      "Start Training Institute Risk Scan →",
    href:     "/assessment/training-institutes",
  },
  "d2c-brands": {
    eyebrow:  "Free · For D2C Brands",
    heading:  "Is your customer data collection DPDPA-ready?",
    body:     "Cart abandonment, remarketing pixels, SMS/WhatsApp — see what needs fixing before you face a complaint.",
    cta:      "Check D2C Readiness →",
    href:     "/assessment",
  },
} as const;

export type IndustrySlug = keyof typeof industryAssessmentCopy;

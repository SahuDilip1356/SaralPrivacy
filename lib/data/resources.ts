import { Resource } from "../types";

export const resources: Resource[] = [
  {
    id: "res001",
    slug: "dpdpa-compliance-checklist-2025",
    title: "DPDPA Compliance Checklist for Indian Businesses (2025 Edition)",
    description:
      "A practical, step-by-step checklist covering consent, notice, data mapping, retention, breach response, and rights management. Designed for Indian businesses taking their first compliance steps.",
    type: "checklist",
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands", "general"],
    tags: ["compliance", "checklist", "getting-started", "consent"],
    gated: false,
    publishedAt: "2025-01-15",
    featured: true,
  },
  {
    id: "res002",
    slug: "dpdpa-white-paper-2025",
    title: "DPDPA: The Complete Guide for Indian Businesses — White Paper",
    description:
      "Our comprehensive white paper covering DPDPA applicability, obligations, key definitions, enforcement timelines, and a sector-by-sector breakdown. 45-page practitioner-grade guide.",
    type: "white-paper",
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands", "general"],
    tags: ["white-paper", "comprehensive", "guide", "enforcement"],
    gated: true,
    publishedAt: "2025-02-01",
    featured: true,
  },
  {
    id: "res003",
    slug: "recruitment-agency-dpdpa-guide",
    title: "DPDPA for Recruitment Agencies: A Practical Compliance Guide",
    description:
      "A sector-specific guide for recruitment and staffing agencies. Covers CV databases, candidate consent, ATS obligations, client data sharing, background checks, and retention policies.",
    type: "guide",
    industries: ["recruitment"],
    tags: ["recruitment", "candidate-data", "ats", "consent"],
    gated: true,
    publishedAt: "2025-02-10",
    featured: false,
  },
  {
    id: "res004",
    slug: "privacy-notice-template-b2c",
    title: "Privacy Notice Template for Indian B2C Businesses",
    description:
      "A customisable Privacy Notice template written in plain English, aligned with DPDPA requirements. Covers data collection, purpose, retention, rights, and contact information.",
    type: "template",
    industries: ["d2c-brands", "training-institutes", "general"],
    tags: ["privacy-notice", "template", "website", "b2c"],
    gated: false,
    publishedAt: "2025-01-20",
    featured: false,
  },
  {
    id: "res005",
    slug: "consent-notice-template-forms",
    title: "Consent Notice Templates for Indian Business Forms",
    description:
      "Ready-to-use consent language for common business forms: lead capture, newsletter subscription, job applications, and checkout pages. Includes separate consent blocks for different purposes.",
    type: "template",
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands"],
    tags: ["consent", "template", "forms", "language"],
    gated: false,
    publishedAt: "2025-01-25",
    featured: false,
  },
  {
    id: "res006",
    slug: "ca-firm-dpdpa-guide",
    title: "DPDPA for CA Firms: Client Data, Payroll, and Financial Records",
    description:
      "Designed specifically for Chartered Accountant practices. Covers the intersection of professional confidentiality and DPDPA obligations, with practical guidance on PAN/Aadhaar handling, retention, and vendor management.",
    type: "guide",
    industries: ["ca-firms"],
    tags: ["ca-firms", "payroll", "aadhaar", "pan", "retention"],
    gated: true,
    publishedAt: "2025-02-15",
    featured: false,
  },
  {
    id: "res007",
    slug: "data-rights-request-form-template",
    title: "Data Rights Request Form Template (Access / Correction / Erasure)",
    description:
      "A professional web form template for handling data subject rights requests. Includes identity verification guidance, response workflow, and suggested timelines.",
    type: "template",
    industries: ["recruitment", "ca-firms", "training-institutes", "d2c-brands"],
    tags: ["rights", "template", "access", "deletion", "correction"],
    gated: false,
    publishedAt: "2025-01-30",
    featured: false,
  },
  {
    id: "res008",
    slug: "dpdpa-explainer-for-founders",
    title: "DPDPA in Plain English: A Founder's Overview",
    description:
      "A short, readable explainer for founders who need to understand DPDPA without a law degree. Covers what the Act requires, who it affects, and the five most urgent actions to take.",
    type: "explainer",
    industries: ["general"],
    tags: ["explainer", "founders", "overview", "basics"],
    gated: false,
    publishedAt: "2025-01-10",
    featured: false,
  },
  {
    id: "res009",
    slug: "d2c-brand-dpdpa-guide",
    title: "DPDPA for D2C Brands: Customer Data, Marketing Consent, and Analytics",
    description:
      "A sector-specific guide for D2C and e-commerce brands. Covers marketing consent, WhatsApp/SMS opt-in design, third-party analytics disclosure, loyalty data, and re-consent campaigns.",
    type: "guide",
    industries: ["d2c-brands"],
    tags: ["d2c", "ecommerce", "whatsapp", "marketing-consent", "analytics"],
    gated: true,
    publishedAt: "2025-02-20",
    featured: false,
  },
  {
    id: "res010",
    slug: "data-processing-agreement-template",
    title: "Data Processing Agreement (DPA) Template for Indian Businesses",
    description:
      "A template DPA for use between Data Fiduciaries and Data Processors. Includes obligations, sub-processor rules, breach notification clauses, and audit rights.",
    type: "template",
    industries: ["recruitment", "ca-firms", "d2c-brands", "general"],
    tags: ["dpa", "template", "vendor", "processor", "legal"],
    gated: true,
    publishedAt: "2025-03-01",
    featured: false,
  },
  {
    id: "res011",
    slug: "training-institute-dpdpa-guide",
    title: "DPDPA for Training Institutes: Student Data, Marketing, and Placements",
    description:
      "Sector-specific guide for coaching centres, training institutes, and EdTech operations. Covers admissions forms, minor students, placement data, remarketing pixels, and faculty data.",
    type: "guide",
    industries: ["training-institutes"],
    tags: ["training", "students", "minors", "admissions", "placement"],
    gated: true,
    publishedAt: "2025-03-05",
    featured: false,
  },
];

export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}

export function getFeaturedResources(): Resource[] {
  return resources.filter((r) => r.featured);
}

export function getResourcesByType(type: string): Resource[] {
  return resources.filter((r) => r.type === type);
}

export function getResourcesByIndustry(industry: string): Resource[] {
  return resources.filter((r) => r.industries.includes(industry as any));
}

export function getFreeResources(): Resource[] {
  return resources.filter((r) => !r.gated);
}

// Maps a discovery niche to one of the 8 existing industry starter-checklist PDFs
// (public/templates/<slug>-dpdpa-starter-checklist.pdf), with a generic fallback
// for the ~250 niches without a dedicated pack.
import { getNiche } from "./data";

// The 8 industries that have a dedicated starter-checklist PDF today.
export type ChecklistSlug =
  | "ca-firm"
  | "clinic-diagnostic-lab"
  | "d2c-brand"
  | "law-firm"
  | "real-estate"
  | "recruitment-agency"
  | "school-college"
  | "training-institute";

// Niche-id → slug overrides (take priority over the category default).
const NICHE_OVERRIDE: Record<string, ChecklistSlug> = {
  // finance
  "ca-firms": "ca-firm",
  "mf-distributors-advisors": "ca-firm",
  // professional → recruitment / legal / advisory
  "recruitment-staffing": "recruitment-agency",
  "executive-search": "recruitment-agency",
  "bgv-agencies": "recruitment-agency",
  "gig-platforms": "recruitment-agency",
  "hrtech-hrms": "recruitment-agency",
  "payroll-providers": "recruitment-agency",
  "law-firms": "law-firm",
  legaltech: "law-firm",
  "cs-compliance": "law-firm",
  "notaries-attestation": "law-firm",
  "immigration-visa": "law-firm",
  "insolvency-valuation": "law-firm",
  "management-consulting": "ca-firm",
  // education → school vs training
  schools: "school-college",
  colleges: "school-college",
  "playschools-daycare": "school-college",
  "minor-academies": "school-college",
  "student-hostels": "school-college",
  "school-transport": "school-college",
  "training-institutes": "training-institute",
  "coaching-centres": "training-institute",
  "corporate-training": "training-institute",
  "online-tutoring": "training-institute",
  edtech: "training-institute",
  "elearning-lms": "training-institute",
  "study-abroad": "training-institute",
  "driving-schools": "training-institute",
  "placement-cells": "recruitment-agency",
};

// Category-id → default slug (used when no niche override matches).
const CATEGORY_DEFAULT: Record<string, ChecklistSlug> = {
  retail: "d2c-brand",
  healthcare: "clinic-diagnostic-lab",
  realestate: "real-estate",
  education: "school-college",
};

export interface ChecklistTarget {
  slug: ChecklistSlug | null; // null = no dedicated pack (generic fallback)
  templateName: string; // e.g. "ca-firm-dpdpa-starter-checklist" or "dpdpa-starter-checklist"
  pdfPath: string; // public path
  dedicated: boolean; // true if a niche-specific PDF exists
}

const GENERIC: Omit<ChecklistTarget, "slug"> = {
  templateName: "dpdpa-starter-checklist",
  pdfPath: "/templates/dpdpa-starter-checklist.pdf",
  dedicated: false,
};

export function checklistFor(nicheId: string): ChecklistTarget {
  const niche = getNiche(nicheId);
  const slug =
    NICHE_OVERRIDE[nicheId] || (niche ? CATEGORY_DEFAULT[niche.cat] : undefined) || null;
  if (!slug) return { slug: null, ...GENERIC };
  return {
    slug,
    templateName: `${slug}-dpdpa-starter-checklist`,
    pdfPath: `/templates/${slug}-dpdpa-starter-checklist.pdf`,
    dedicated: true,
  };
}

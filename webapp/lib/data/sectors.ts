// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Sector taxonomy · single source of truth
//
// The label-list surfaces that historically drifted (the homepage hero count,
// the Header + Footer "Industries" menus, the Footer "Assessment" menu, the
// sitemap, and the white-paper segmentation dropdown) all derive from this one
// array — so the sector list can never disagree across them again.
//
// NOTE: the homepage sector cards (components/home/AudienceCards.tsx) and the
// /industries index page carry bespoke per-sector content (pain points, risks,
// table rows) and are not yet folded in. Adding the 13th sector still touches
// those two files plus this one + the pack. See SECTOR_CONSISTENCY spec.
//
// Invariants:
//  • `assessmentSlug` is ALSO the white-paper dropdown value (kept identical so
//    historical lead-segmentation values don't change).
//  • `reportType` mirrors the pack's reportType (≤10 chars, Appwrite string(10)).
// ─────────────────────────────────────────────────────────────────────────────

export interface Sector {
  /** /industries/{slug} */
  slug: string;
  /** /assessment/{assessmentSlug} — also the white-paper dropdown value */
  assessmentSlug: string;
  /** payload report_type; mirrors the pack (≤10 chars) */
  reportType: string;
  /** Header + Footer "Industries" menu label (full) */
  navLabel: string;
  /** Footer "Assessment" menu label (shorter) */
  assessmentLabel: string;
  /** White-paper segmentation dropdown label */
  dropdownLabel: string;
}

export const SECTORS: Sector[] = [
  { slug: "recruitment-agencies", assessmentSlug: "recruitment", reportType: "recruit", navLabel: "Recruitment Agencies", assessmentLabel: "Recruitment Assessment", dropdownLabel: "Recruitment & Staffing" },
  { slug: "ca-firms", assessmentSlug: "ca-firms", reportType: "ca-firm", navLabel: "CA Firms", assessmentLabel: "CA Firm Assessment", dropdownLabel: "CA & Accounting Firm" },
  { slug: "training-institutes", assessmentSlug: "training-institutes", reportType: "training", navLabel: "Training Institutes", assessmentLabel: "Training Institute", dropdownLabel: "Training & Coaching Institute" },
  { slug: "d2c-brands", assessmentSlug: "d2c-brands", reportType: "d2c", navLabel: "D2C Brands", assessmentLabel: "D2C Brand Assessment", dropdownLabel: "D2C & E-commerce Brand" },
  { slug: "clinics-diagnostic-labs", assessmentSlug: "clinics-diagnostic-labs", reportType: "clinic", navLabel: "Clinics & Diagnostic Labs", assessmentLabel: "Clinic & Diagnostic Lab", dropdownLabel: "Clinic & Diagnostic Lab" },
  { slug: "schools-colleges", assessmentSlug: "schools-colleges", reportType: "school", navLabel: "Schools & Colleges", assessmentLabel: "School & College", dropdownLabel: "School & College" },
  { slug: "law-firms", assessmentSlug: "law-firms", reportType: "law-firm", navLabel: "Law Firms & Legal Consultants", assessmentLabel: "Law Firm & Legal", dropdownLabel: "Law Firm & Legal Consultant" },
  { slug: "real-estate", assessmentSlug: "real-estate", reportType: "realty", navLabel: "Real Estate & Property Firms", assessmentLabel: "Real Estate & Property", dropdownLabel: "Real Estate & Property Firm" },
  { slug: "hotels-travel", assessmentSlug: "hotels-travel", reportType: "hotel", navLabel: "Hotels, Hospitality & Travel", assessmentLabel: "Hotels & Travel", dropdownLabel: "Hotel, Hospitality & Travel" },
  { slug: "pharmacies", assessmentSlug: "pharmacies", reportType: "pharmacy", navLabel: "Pharmacies & Online Pharmacies", assessmentLabel: "Pharmacy & Online Pharmacy", dropdownLabel: "Pharmacy & Online Pharmacy" },
  { slug: "fintech-nbfc", assessmentSlug: "fintech-nbfc", reportType: "fintech", navLabel: "Fintech, NBFC & Digital Payments", assessmentLabel: "Fintech & NBFC", dropdownLabel: "Fintech, NBFC & Digital Payments" },
  { slug: "gyms-salons-spas", assessmentSlug: "gyms-salons-spas", reportType: "wellness", navLabel: "Gyms, Salons & Spas", assessmentLabel: "Gym, Salon & Spa", dropdownLabel: "Gym, Salon & Spa" },
];

/** All sectors that are live today (currently all of them). */
export const LIVE_SECTORS = SECTORS;

/** Count for the homepage hero stat — never hardcode a sector count again. */
export const SECTOR_COUNT = LIVE_SECTORS.length;

/** Header + Footer "Industries" menu items. */
export const sectorNavLinks = LIVE_SECTORS.map((s) => ({
  label: s.navLabel,
  href: `/industries/${s.slug}`,
}));

/** Footer "Assessment" menu items (sector scans only; prepend the hub link separately). */
export const sectorAssessmentLinks = LIVE_SECTORS.map((s) => ({
  label: s.assessmentLabel,
  href: `/assessment/${s.assessmentSlug}`,
}));

/** White-paper segmentation dropdown options (append "general" separately). */
export const sectorDropdownOptions = LIVE_SECTORS.map((s) => ({
  value: s.assessmentSlug,
  label: s.dropdownLabel,
}));

/** Industry-page slugs for the sitemap. */
export const sectorSlugs = LIVE_SECTORS.map((s) => s.slug);

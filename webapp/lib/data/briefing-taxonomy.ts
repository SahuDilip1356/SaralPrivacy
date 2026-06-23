/**
 * briefing-taxonomy.ts — single source of truth for the /briefings discovery facets.
 *
 * Three facets, all stored on EXISTING Appwrite attributes (collection is at attribute
 * capacity — no new fields):
 *   - Stage   → stored in `category`          (learn | assess | fix | sustain)
 *   - Sector  → stored in `industries[0]`     (slug, e.g. "schools-colleges")
 *   - Format  → stored in `tags[0]`           (slug, e.g. "checklist")
 *
 * The pipeline writes the SLUGS via tools/briefing_taxonomy.py (Python mirror — keep the
 * two in sync). Labels live here and are resolved client-side. Unknown slugs fall back to
 * the raw value, so a drift never hard-breaks the page.
 */

export type StageSlug = "learn" | "assess" | "fix" | "sustain";
export type FormatSlug =
  | "explainer" | "checklist" | "playbook" | "stat" | "case-story" | "myth-buster";

export interface TaxonomyOption {
  slug: string;
  label: string;
  hint?: string;
}

/** Journey stages — mirror the site spine Discover → Assess → Fix → Get Help. */
export const STAGES: readonly TaxonomyOption[] = [
  { slug: "learn",   label: "Learn",   hint: "Understand the law and your exposure" },
  { slug: "assess",  label: "Assess",  hint: "Find where you touch personal data" },
  { slug: "fix",     label: "Fix",     hint: "Close the gaps with concrete steps" },
  { slug: "sustain", label: "Sustain", hint: "Keep compliance a habit, not a one-off" },
] as const;

/** Plain-English, jobs-to-be-done label for each stage (SMBs think in jobs, not taxonomy). */
const STAGE_JTBD: Record<string, string> = {
  learn:   "Understand the law",
  assess:  "Check my risk",
  fix:     "Take action",
  sustain: "Maintain compliance",
};
export const stageJtbd = (slug: string): string => STAGE_JTBD[slug] ?? stageLabel(slug);

/** Plain-English facet group headers — shown above each filter group. */
export const FACET_HEADERS = {
  sector: "My business type",
  stage:  "What I need now",
  format: "How I want to use it",
} as const;

/** Per-stage tool CTA on each card — routes readers from a briefing into the funnel. */
const STAGE_CTA: Record<string, { label: string; href: string }> = {
  learn:   { label: "Check my readiness", href: "/assessment" },
  assess:  { label: "Map my data",        href: "/discovery" },
  fix:     { label: "Get the checklist",  href: "/resources" },
  sustain: { label: "Browse templates",   href: "/resources" },
};
export const stageCta = (slug: string) =>
  STAGE_CTA[slug] ?? { label: "Check my readiness", href: "/assessment" };

/** Risk tier per sector — auto-derived (no per-briefing authoring). */
export type RiskTier = "high" | "medium" | "low";
const HIGH_RISK_SECTORS = new Set([
  "ca-firms", "recruitment", "clinics-labs", "schools-colleges", "hospitals",
  "pharmacies", "nbfc", "fintech", "insurance-brokers", "edtech", "law-firms",
  "fitness-wellness",
]);
export function riskFor(sector: string): RiskTier {
  if (sector === "general" || !sector) return "low";
  return HIGH_RISK_SECTORS.has(sector) ? "high" : "medium";
}
export const RISK_LABEL: Record<RiskTier, string> = {
  high: "High risk", medium: "Medium risk", low: "Low risk",
};

/** Content formats — derived from the roadmap's infographic_type + stage. */
export const FORMATS: readonly TaxonomyOption[] = [
  { slug: "explainer",   label: "Explainer" },
  { slug: "checklist",   label: "Checklist" },
  { slug: "playbook",    label: "Playbook" },
  { slug: "stat",        label: "Stat" },
  { slug: "case-story",  label: "Case story" },
  { slug: "myth-buster", label: "Myth-buster" },
] as const;

/**
 * Briefing sectors — 30 industry verticals (days 91–240) + "general" for the
 * foundational 88. Broader than the 12 assessment sectors by design.
 * slug ↔ label; `match` = lowercase topic-prefix substrings the pipeline maps from.
 */
export const BRIEFING_SECTORS: readonly TaxonomyOption[] = [
  { slug: "general",            label: "Foundations / all sectors" },
  { slug: "ca-firms",           label: "CA firms" },
  { slug: "recruitment",        label: "Recruitment firms" },
  { slug: "training-institutes",label: "Training institutes" },
  { slug: "d2c-brands",         label: "D2C brands" },
  { slug: "clinics-labs",       label: "Clinics & labs" },
  { slug: "schools-colleges",   label: "Schools & colleges" },
  { slug: "law-firms",          label: "Law firms" },
  { slug: "real-estate",        label: "Real estate firms" },
  { slug: "hospitality",        label: "Hospitality businesses" },
  { slug: "pharmacies",         label: "Pharmacies" },
  { slug: "nbfc",               label: "NBFCs" },
  { slug: "insurance-brokers",  label: "Insurance brokers" },
  { slug: "manufacturing",      label: "Manufacturing firms" },
  { slug: "logistics",          label: "Logistics firms" },
  { slug: "retail",             label: "Retail chains" },
  { slug: "restaurants",        label: "Restaurants & cloud kitchens" },
  { slug: "fitness-wellness",   label: "Fitness & wellness" },
  { slug: "it-saas",            label: "IT services & SaaS" },
  { slug: "marketing-agencies", label: "Marketing agencies" },
  { slug: "consultancies-bpo",  label: "Consultancies & BPOs" },
  { slug: "hospitals",          label: "Hospitals & healthcare" },
  { slug: "edtech",             label: "Edtech & online learning" },
  { slug: "marketplaces",       label: "Marketplaces & platforms" },
  { slug: "housing-proptech",   label: "Housing societies & proptech" },
  { slug: "auto-dealers",       label: "Auto dealers & service" },
  { slug: "ngos",               label: "NGOs & member networks" },
  { slug: "media-community",    label: "Media & community platforms" },
  { slug: "travel-tech",        label: "Travel tech & booking" },
  { slug: "fintech",            label: "Fintech & payments" },
  { slug: "multi-location",     label: "Multi-location service businesses" },
] as const;

const STAGE_MAP = new Map(STAGES.map((s) => [s.slug, s]));
const FORMAT_MAP = new Map(FORMATS.map((f) => [f.slug, f]));
const SECTOR_MAP = new Map(BRIEFING_SECTORS.map((s) => [s.slug, s]));

export const stageLabel = (slug: string): string => STAGE_MAP.get(slug)?.label ?? slug;
export const stageHint = (slug: string): string | undefined => STAGE_MAP.get(slug)?.hint;
export const formatLabel = (slug: string): string => FORMAT_MAP.get(slug)?.label ?? slug;
export const sectorLabel = (slug: string): string => SECTOR_MAP.get(slug)?.label ?? slug;

/** Known format slugs — used to pick the Format token out of the tags array. */
export const FORMAT_SLUGS = new Set(FORMATS.map((f) => f.slug));
export const STAGE_SLUGS = new Set(STAGES.map((s) => s.slug));

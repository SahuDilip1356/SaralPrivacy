// Hero "is-this-me" verdicts — one per sector, keyed by Sector.assessmentSlug.
// Powers the interactive hero (Beat 1): pick a business type → instant read.
//
// IMPORTANT: `band` and the specifics are ILLUSTRATIVE starters drafted from
// sector knowledge — they are NOT the user's real score. The hero copy always
// frames them as "typical" and points to the real assessment for the actual
// score. Verify/refine against each pack before treating as authoritative.

export interface HeroVerdict {
  /** === Sector.assessmentSlug (single-sourced order follows sectors.ts) */
  slug: string;
  /** short label for the chip + verdict sentence ("a {chipLabel}") */
  chipLabel: string;
  /** typical/illustrative band — never the user's real score */
  band: "Moderate" | "Moderate–High" | "High";
  /** one sector-true sentence — the "taste" */
  riskLine: string;
}

export const HERO_VERDICTS: HeroVerdict[] = [
  { slug: "recruitment", chipLabel: "recruitment agency", band: "Moderate–High", riskLine: "You hold candidate IDs, CVs and references far longer than you need to." },
  { slug: "ca-firms", chipLabel: "CA firm", band: "High", riskLine: "Client PAN, financials and KYC sit across email, drives and WhatsApp." },
  { slug: "training-institutes", chipLabel: "training institute", band: "Moderate", riskLine: "Student records, fee data and parent contacts often have no retention limit." },
  { slug: "d2c-brands", chipLabel: "D2C brand", band: "Moderate–High", riskLine: "Customer addresses, order history and ad-pixel data flow to many vendors." },
  { slug: "clinics-diagnostic-labs", chipLabel: "diagnostic lab", band: "High", riskLine: "You hold high-impact health data, and often share reports over WhatsApp." },
  { slug: "schools-colleges", chipLabel: "school or college", band: "High", riskLine: "Children's data carries the strictest consent and verifiable-parent rules." },
  { slug: "law-firms", chipLabel: "law firm", band: "High", riskLine: "Privileged client matters and ID copies sit in inboxes and shared drives." },
  { slug: "real-estate", chipLabel: "real estate firm", band: "Moderate–High", riskLine: "KYC, income proofs and Aadhaar copies pile up across deals and brokers." },
  { slug: "hotels-travel", chipLabel: "hotel or travel business", band: "Moderate", riskLine: "Guest IDs, card details and CCTV/Wi-Fi logs are usually retained too long." },
  { slug: "pharmacies", chipLabel: "pharmacy", band: "High", riskLine: "Prescriptions reveal high-impact health data tied to a named person." },
  { slug: "fintech-nbfc", chipLabel: "fintech or NBFC", band: "High", riskLine: "High-impact financial data and KYC flow through many third parties." },
  { slug: "gyms-salons-spas", chipLabel: "gym, salon or spa", band: "Moderate", riskLine: "Member health notes, photos and biometric check-ins are all personal data." },
];

export function getHeroVerdict(slug: string): HeroVerdict | undefined {
  return HERO_VERDICTS.find((v) => v.slug === slug);
}

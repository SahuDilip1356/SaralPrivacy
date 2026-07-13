// Beat 5 — "See a real verdict" preview data.
//
// Hand-authored, illustrative report slices for three sectors. Deliberately NOT
// imported from the assessment packs: this keeps the packs byte-identical
// (isolation rule) and needs no Appwrite. These are labelled "Sample ·
// illustrative" in the UI and are meant to *look like* a real report output
// (category breakdown + band + top gap), NOT to reproduce the engine's exact
// scoring. `slug` drives a sector-scoped CTA to /assessment/{slug}.

export type VerdictBand = "High" | "Moderate" | "Low";

export type VerdictPreview = {
  slug: string; // assessment route slug
  tab: string; // short tab label
  label: string; // report card title
  band: VerdictBand;
  categories: { label: string; pct: number }[]; // 5 bars, higher = stronger
  topGap: string;
};

export const VERDICT_PREVIEWS: VerdictPreview[] = [
  {
    slug: "clinics-diagnostic-labs",
    tab: "Clinic",
    label: "Clinics & Diagnostic Labs",
    band: "High",
    categories: [
      { label: "Patient data handling", pct: 44 },
      { label: "Consent & notice", pct: 38 },
      { label: "Sharing & vendors", pct: 26 },
      { label: "Retention limits", pct: 31 },
      { label: "Breach readiness", pct: 22 },
    ],
    topGap:
      "Reports shared over WhatsApp with no consent line or retention limit.",
  },
  {
    slug: "ca-firms",
    tab: "CA firm",
    label: "CA Firms",
    band: "Moderate",
    categories: [
      { label: "Client data handling", pct: 58 },
      { label: "Consent & engagement", pct: 49 },
      { label: "Sub-processor control", pct: 52 },
      { label: "Retention & disposal", pct: 41 },
      { label: "Breach readiness", pct: 47 },
    ],
    topGap:
      "Client financial records kept indefinitely — no retention or disposal schedule.",
  },
  {
    slug: "gyms-salons-spas",
    tab: "Gym",
    label: "Gyms, Salons & Spas",
    band: "Moderate",
    categories: [
      { label: "Member & health data", pct: 54 },
      { label: "Consent (photos, biometrics)", pct: 39 },
      { label: "Staff & vendor access", pct: 56 },
      { label: "Retention after exit", pct: 46 },
      { label: "Breach readiness", pct: 50 },
    ],
    topGap:
      "Member health details and gym photos collected without a clear consent line.",
  },
];

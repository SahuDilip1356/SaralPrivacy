// S4 — "Your report" preview data.
//
// Hand-authored, illustrative report slices. Deliberately NOT imported from the
// assessment packs: this keeps the packs byte-identical (isolation rule) and
// needs no Appwrite. Every surface that renders this labels it "Sample ·
// illustrative" — it is meant to *look like* a real report output, not to
// reproduce the engine's scoring.
//
// ⛔ Nothing may be claimed here that the real report does not produce. The six
// deliverables below match app/assessment/SurveyClient.tsx ("What you'll get"):
// score 0-100 · risk category · top gaps · recommended actions · checklist ·
// option to email the full report.
//
// The three sectors are the page's priority set and must stay in sync with the
// hero chips (HeroSection) and the sector tabs (AudienceCards) — one set of
// three sectors across the whole homepage, so a visitor who picks "CA firm" in
// the hero sees a CA firm everywhere after it.
//
// The five dimension labels are FIXED across sectors on purpose. Sector-specific
// axis names made each card read as a different document; a fixed instrument
// scored differently per sector reads as a real assessment.

export type VerdictBand = "High" | "Moderate" | "Low";

export type VerdictPreview = {
  slug: string; // assessment route slug
  tab: string; // short tab label
  label: string; // report card title
  /** illustrative readiness score, 0-100 — same scale as the real report */
  score: number;
  band: VerdictBand;
  categories: { label: string; pct: number }[]; // 5 dimensions, higher = stronger
  /** exactly three — the real report shows "your top 3 privacy gaps" */
  topGaps: string[];
  /** exactly three — the real report's "recommended next steps" */
  firstActions: string[];
};

/** The five assessment dimensions, in report order. Shared by every sector. */
export const VERDICT_DIMENSIONS = [
  "Notice & collection",
  "Consent",
  "Sharing & vendors",
  "Access & security",
  "Retention & response",
] as const;

export const VERDICT_PREVIEWS: VerdictPreview[] = [
  {
    slug: "recruitment",
    tab: "Recruitment",
    label: "Recruitment agency",
    score: 46,
    band: "High",
    categories: [
      { label: "Notice & collection", pct: 48 },
      { label: "Consent", pct: 34 },
      { label: "Sharing & vendors", pct: 29 },
      { label: "Access & security", pct: 55 },
      { label: "Retention & response", pct: 26 },
    ],
    topGaps: [
      "CVs forwarded to clients over email and WhatsApp, with no record of candidate permission.",
      "Candidate profiles stay with multiple recipients after the role closes.",
      "No deletion period for unsuccessful applicants — databases grow indefinitely.",
    ],
    firstActions: [
      "Record candidate permission at the point you collect the CV, not at placement.",
      "Set a deletion period for unsuccessful applicants and put it in writing.",
      "List every client and job board you send candidate data to.",
    ],
  },
  {
    slug: "ca-firms",
    tab: "CA firm",
    label: "CA firm",
    score: 52,
    band: "Moderate",
    categories: [
      { label: "Notice & collection", pct: 58 },
      { label: "Consent", pct: 49 },
      { label: "Sharing & vendors", pct: 52 },
      { label: "Access & security", pct: 41 },
      { label: "Retention & response", pct: 38 },
    ],
    topGaps: [
      "Client PAN and Aadhaar files shared through email and Drive with no access review.",
      "Former staff and interns may still reach shared folders.",
      "Client financial records kept indefinitely — no retention or disposal schedule.",
    ],
    firstActions: [
      "Review shared-folder access and remove inactive accounts.",
      "Give each client engagement a named data owner in the firm.",
      "Agree a disposal schedule for closed matters and apply it once.",
    ],
  },
  {
    slug: "d2c-brands",
    tab: "D2C brand",
    label: "D2C brand",
    score: 49,
    band: "Moderate",
    categories: [
      { label: "Notice & collection", pct: 44 },
      { label: "Consent", pct: 31 },
      { label: "Sharing & vendors", pct: 37 },
      { label: "Access & security", pct: 61 },
      { label: "Retention & response", pct: 43 },
    ],
    topGaps: [
      "Marketing opt-in bundled into checkout — consent is not separate or withdrawable.",
      "Analytics and ad pixels pass customer data to vendors with no written terms.",
      "Inactive customer records and abandoned-cart data are never cleared.",
    ],
    firstActions: [
      "Separate the marketing opt-in from the purchase, and make withdrawal one click.",
      "List every pixel, app and vendor that receives customer data.",
      "Set a retention period for inactive customers and abandoned carts.",
    ],
  },
];

/** Checklist teaser shown under the report preview. Sector-neutral by design. */
export const VERDICT_CHECKLIST = [
  "Privacy notice published and current",
  "Consent collected separately, and withdrawable",
  "Vendor list with written terms",
  "Retention period defined per data type",
  "Named owner for data-rights requests",
  "Breach response steps written down",
];

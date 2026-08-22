// S4 — "Your report" preview data. All twelve sectors.
//
// Hand-authored, illustrative report slices. Deliberately NOT imported from the
// assessment packs at runtime: that keeps the packs byte-identical (isolation
// rule) and needs no Appwrite. Every surface that renders this labels it
// "Sample · illustrative" — it is meant to *look like* a real report output, not
// to reproduce the engine's scoring.
//
// ⛔ Nothing may be claimed here that the real report does not produce. The six
// deliverables below match app/assessment/SurveyClient.tsx ("What you'll get"):
// score 0-100 · risk category · top gaps · recommended actions · checklist ·
// option to email the full report. No percentages about the market, no customer
// counts, no outcomes — an illustrative score for a fictional business is a
// sample; a statistic about real businesses would be a fabrication.
//
// ── Reversal: the five dimensions are now per-sector ─────────────────────────
// This file used to fix five generic axes (Notice & collection · Consent ·
// Sharing & vendors · Access & security · Retention & response) across every
// sector, on the argument that one instrument scored differently reads as a real
// assessment while renamed axes read as twelve different documents.
//
// That was defensible at three sectors and is wrong at twelve. Two reasons.
// First, it is not what the reader gets: take the CA firm assessment and the
// real report says "Client document risk", not "Notice & collection" — a small
// promise broken at the exact moment we are asking to be believed. Second, with
// twelve tabs showing the same five axes, the tabs would be a gimmick; the
// sector-specific axis names ARE the evidence that these are twelve different
// assessments rather than one questionnaire with a dropdown.
//
// So the five `categories[].label` values in every entry below are copied from
// that sector's real pack buckets in lib/data/industry-assessment/packs/*.ts,
// in pack order. If a pack's buckets are renamed, rename them here too. Only
// the SCORES are illustrative.
//
// Order matches the sector ring deck's chip rail, so a visitor who reads the
// rail and then the report tabs sees one order, not two.

export type VerdictBand = "High" | "Moderate" | "Low";

export type VerdictPreview = {
  slug: string; // assessment route slug
  tab: string; // short tab label — matches the sector deck's chip
  label: string; // report card title
  /** illustrative readiness score, 0-100 — same scale as the real report */
  score: number;
  band: VerdictBand;
  /** exactly 5 — labels copied from the sector's real pack buckets */
  categories: { label: string; pct: number }[];
  /** exactly three — the real report shows "your top 3 privacy gaps" */
  topGaps: string[];
  /** exactly three — the real report's "recommended next steps" */
  firstActions: string[];
};

export const VERDICT_PREVIEWS: VerdictPreview[] = [
  {
    slug: "recruitment",
    tab: "Recruitment",
    label: "Recruitment agency",
    score: 46,
    band: "High",
    categories: [
      { label: "Candidate sourcing", pct: 48 },
      { label: "Candidate documents", pct: 34 },
      { label: "Client sharing", pct: 29 },
      { label: "ATS, tool & access", pct: 55 },
      { label: "Retention & rights", pct: 26 },
    ],
    topGaps: [
      "CVs forwarded to clients over email and WhatsApp, with no record of candidate permission.",
      "Candidate profiles stay with multiple recipients after the role closes.",
      "No deletion period for unsuccessful applicants, so databases grow indefinitely.",
    ],
    firstActions: [
      "Record candidate permission at the point you collect the CV, not at placement.",
      "Set a deletion period for unsuccessful applicants and put it in writing.",
      "List every client and job board you send candidate data to.",
    ],
  },
  {
    slug: "ca-firms",
    tab: "CA firms",
    label: "CA firm",
    score: 52,
    band: "Moderate",
    categories: [
      { label: "Client documents", pct: 58 },
      { label: "Document intake", pct: 49 },
      { label: "Storage & access", pct: 52 },
      { label: "Retention & deletion", pct: 41 },
      { label: "Vendor & incident readiness", pct: 38 },
    ],
    topGaps: [
      "Client PAN and Aadhaar files shared through email and Drive with no access review.",
      "Former staff and interns may still reach shared folders.",
      "Client financial records kept indefinitely, with no retention or disposal schedule.",
    ],
    firstActions: [
      "Review shared-folder access and remove inactive accounts.",
      "Give each client engagement a named data owner in the firm.",
      "Agree a disposal schedule for closed matters and apply it once.",
    ],
  },
  {
    slug: "training-institutes",
    tab: "Training",
    label: "Training institute",
    score: 44,
    band: "High",
    categories: [
      { label: "Student data collection", pct: 47 },
      { label: "Minor & parental consent", pct: 28 },
      { label: "Communication & marketing", pct: 33 },
      { label: "LMS, vendor & platform", pct: 52 },
      { label: "Retention & rights", pct: 30 },
    ],
    topGaps: [
      "Enquiry forms collect a student's age and parent's number with no notice at the point of collection.",
      "Where the learner is a minor, verifiable parental consent is not recorded before enrolment.",
      "Placement and alumni records are kept indefinitely and reused for marketing.",
    ],
    firstActions: [
      "Put an itemised notice on the enquiry form and separate marketing consent from enrolment.",
      "Record verifiable parental consent for every learner under eighteen before the course starts.",
      "Set a retention period for placement and alumni data, and stop reusing it for campaigns.",
    ],
  },
  {
    slug: "d2c-brands",
    tab: "D2C",
    label: "D2C brand",
    score: 49,
    band: "Moderate",
    categories: [
      { label: "Customer data collection", pct: 44 },
      { label: "Marketing consent", pct: 31 },
      { label: "Tracking & adtech", pct: 37 },
      { label: "Vendor & fulfilment", pct: 61 },
      { label: "Retention & preferences", pct: 43 },
    ],
    topGaps: [
      "Marketing opt-in bundled into checkout, so consent is not separate or withdrawable.",
      "Analytics and ad pixels pass customer data to vendors with no written terms.",
      "Inactive customer records and abandoned-cart data are never cleared.",
    ],
    firstActions: [
      "Separate the marketing opt-in from the purchase, and make withdrawal one click.",
      "List every pixel, app and vendor that receives customer data.",
      "Set a retention period for inactive customers and abandoned carts.",
    ],
  },
  {
    slug: "clinics-diagnostic-labs",
    tab: "Clinics",
    label: "Clinic / diagnostic lab",
    score: 42,
    band: "High",
    categories: [
      { label: "Patient data collection", pct: 45 },
      { label: "Health data sensitivity", pct: 30 },
      { label: "Report sharing", pct: 27 },
      { label: "System, staff & vendor access", pct: 51 },
      { label: "Retention & incident readiness", pct: 32 },
    ],
    topGaps: [
      "Reports sent to patients over WhatsApp from staff handsets the clinic does not control.",
      "Front-desk registers and appointment books hold health details anyone at the counter can read.",
      "Referral labs and imaging partners receive patient data with no written processing terms.",
    ],
    firstActions: [
      "Move report delivery to a channel the clinic controls, and stop sending from personal handsets.",
      "Restrict who can view patient records to the roles that actually need them.",
      "List every referral lab and partner you send patient data to, and add processing terms.",
    ],
  },
  {
    slug: "schools-colleges",
    tab: "Schools",
    label: "School / college",
    score: 43,
    band: "High",
    categories: [
      { label: "Student & parent data", pct: 46 },
      { label: "Children & consent", pct: 25 },
      { label: "Monitoring & safety systems", pct: 38 },
      { label: "Learning, vendor & platform", pct: 49 },
      { label: "Retention, sharing & rights", pct: 34 },
    ],
    topGaps: [
      "Student data is children's data, and verifiable parental consent is not recorded at admission.",
      "Class WhatsApp groups carry names, photographs and results to every parent in the group.",
      "Learning platforms and transport trackers receive student data with no written terms.",
    ],
    firstActions: [
      "Record verifiable parental consent at admission, and stop treating enrolment as consent.",
      "Move results and photographs off open parent groups to a channel the school controls.",
      "List every platform, app and transport vendor holding student data.",
    ],
  },
  {
    slug: "law-firms",
    tab: "Law firms",
    label: "Law firm",
    score: 50,
    band: "Moderate",
    categories: [
      { label: "Client & matter data", pct: 54 },
      { label: "Case-file sensitivity", pct: 44 },
      { label: "Document sharing", pct: 39 },
      { label: "Staff, junior & vendor access", pct: 47 },
      { label: "Retention & incident readiness", pct: 36 },
    ],
    topGaps: [
      "Case files and evidence move over personal email and messaging with no access record.",
      "Juniors, interns and clerks retain folder access long after a matter closes.",
      "Closed matters are archived indefinitely with no disposal decision ever taken.",
    ],
    firstActions: [
      "Route matter documents through one controlled system rather than personal mailboxes.",
      "Review access when a matter closes, not when someone leaves.",
      "Set a disposal schedule for closed matters that respects your professional obligations.",
    ],
  },
  {
    slug: "real-estate",
    tab: "Real estate",
    label: "Real estate business",
    score: 45,
    band: "High",
    categories: [
      { label: "Client & lead data", pct: 42 },
      { label: "KYC & property documents", pct: 36 },
      { label: "Broker network sharing", pct: 26 },
      { label: "CRM, staff & vendor access", pct: 53 },
      { label: "Retention & incident readiness", pct: 31 },
    ],
    topGaps: [
      "Buyer PAN, Aadhaar and bank documents circulate in broker groups with no record of who holds them.",
      "Purchased and scraped lead lists are called without any consent for that contact.",
      "Lead databases are never cleared, so enquiries from years ago are still marketed to.",
    ],
    firstActions: [
      "Stop sending KYC documents into broker groups; use one controlled channel per transaction.",
      "Record where each lead came from, and stop calling lists you have no consent for.",
      "Set a retention period for dead leads and apply it.",
    ],
  },
  {
    slug: "hotels-travel",
    tab: "Hotels",
    label: "Hotel / travel business",
    score: 47,
    band: "High",
    categories: [
      { label: "Guest & traveller data", pct: 50 },
      { label: "ID & travel documents", pct: 35 },
      { label: "Booking, OTA & vendor sharing", pct: 33 },
      { label: "System, staff & access", pct: 52 },
      { label: "Retention & incident readiness", pct: 29 },
    ],
    topGaps: [
      "Passport and ID scans taken at check-in are stored on the front-desk machine indefinitely.",
      "OTAs, tour operators and transport partners receive guest data with no written terms.",
      "Every front-desk shift shares one login, so no action can be traced to a person.",
    ],
    firstActions: [
      "Set a deletion period for ID scans once the statutory requirement is met, and enforce it.",
      "List every OTA and partner that receives guest data, and add processing terms.",
      "Give each front-desk staff member their own login.",
    ],
  },
  {
    slug: "pharmacies",
    tab: "Pharmacies",
    label: "Pharmacy",
    score: 44,
    band: "High",
    categories: [
      { label: "Customer & prescription data", pct: 46 },
      { label: "Health indicators & history", pct: 31 },
      { label: "Order, delivery & vendor sharing", pct: 34 },
      { label: "System, staff & access", pct: 50 },
      { label: "Retention & refill readiness", pct: 28 },
    ],
    topGaps: [
      "Prescription photographs arrive over WhatsApp and stay on staff handsets after the sale.",
      "Delivery partners receive the customer's name, address and medicine details with no terms.",
      "Refill reminders are sent from purchase history with no consent for marketing.",
    ],
    firstActions: [
      "Stop keeping prescription images on personal handsets, and move them to one controlled system.",
      "Share only what the delivery partner needs, and put terms in place with them.",
      "Get separate consent before using purchase history for reminders.",
    ],
  },
  {
    slug: "fintech-nbfc",
    tab: "Fintech",
    label: "Fintech / NBFC",
    score: 55,
    band: "Moderate",
    categories: [
      { label: "KYC & financial data", pct: 62 },
      { label: "Profiling & underwriting", pct: 44 },
      { label: "Consent, notice & rights", pct: 48 },
      { label: "Vendor, partner & agent sharing", pct: 39 },
      { label: "Access, retention & incidents", pct: 51 },
    ],
    topGaps: [
      "Customers are not told what data drives an underwriting decision, or how to contest it.",
      "Collection agents and sourcing partners hold borrower data outside your systems.",
      "Rejected applicants' KYC documents are retained on the same schedule as approved customers.",
    ],
    firstActions: [
      "Publish what data an underwriting decision uses, and name who a customer can ask about it.",
      "List every agent and sourcing partner holding borrower data, with written terms.",
      "Set a shorter retention period for rejected applications and apply it.",
    ],
  },
  {
    slug: "gyms-salons-spas",
    tab: "Gyms & salons",
    label: "Gym / salon / spa",
    score: 41,
    band: "High",
    categories: [
      { label: "Customer & membership data", pct: 44 },
      { label: "Health & consultation data", pct: 27 },
      { label: "Photos, marketing & WhatsApp", pct: 24 },
      { label: "App, staff & vendor access", pct: 48 },
      { label: "Retention & incident readiness", pct: 30 },
    ],
    topGaps: [
      "Before-and-after photographs are posted to social media without written permission.",
      "Health and consultation notes sit in an open register or a shared WhatsApp group.",
      "Members who left years ago are still messaged from the old member list.",
    ],
    firstActions: [
      "Get written, separate permission before using any client photograph, and honour withdrawal.",
      "Move consultation notes off shared groups into one controlled record.",
      "Set a retention period for lapsed members and stop marketing to them.",
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

/**
 * The homepage's priority set — the hero's chips and any surface that shows
 * three sectors rather than twelve. Kept as slugs so there is one list, not
 * three copies of "recruitment, ca-firms, d2c-brands" drifting apart.
 */
export const PRIORITY_PREVIEW_SLUGS = ["recruitment", "ca-firms", "d2c-brands"] as const;

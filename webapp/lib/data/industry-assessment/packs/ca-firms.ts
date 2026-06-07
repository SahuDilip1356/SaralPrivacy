// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · CA Firms pack (reference implementation)
// "CA Firm DPDPA Risk Scan" — a CA practice risk scan, not a generic test.
// Caps for Q1–Q10 sum to 100. Q0 (volume) is optional and renormalises fairly.
// ─────────────────────────────────────────────────────────────────────────────

import {
  IndustryPack,
  IAQuestion,
  IABucket,
  IAOverride,
  IAFlagRule,
  IAResult,
  IAAnswers,
  selectedIds,
} from "../core";

// ── Buckets ──────────────────────────────────────────────────────────────────

const BUCKETS: IABucket[] = [
  {
    key: "client_document",
    label: "Client document risk",
    meaning:
      "Your firm handles sensitive client financial and identity documents (PAN, Aadhaar, ITR, bank, payroll).",
  },
  {
    key: "intake",
    label: "Document intake risk",
    meaning: "Client files may enter through uncontrolled channels like WhatsApp and email.",
  },
  {
    key: "storage_access",
    label: "Storage & access risk",
    meaning: "Cloud, email, laptop or staff access controls may need review.",
  },
  {
    key: "retention",
    label: "Retention & deletion risk",
    meaning: "Old client files may be retained without a formal policy.",
  },
  {
    key: "vendor_incident",
    label: "Vendor & incident readiness",
    meaning: "Software/vendor and breach-response controls may need strengthening.",
  },
];

// ── High-impact document ids (used by overrides) ─────────────────────────────

const HIGH_IMPACT_DOCS = ["pan", "aadhaar", "bank", "payroll", "family", "medical"];

// ── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q0 Volume (optional) ──────────────────────────────────────────────
  {
    id: "q0",
    badge: "Practice Scale",
    question: "Roughly how many clients' data does your firm handle in a year?",
    helpText: "A rough range is fine. Higher volume means more individuals exposed if something goes wrong.",
    whyThisMatters:
      "Volume multiplies impact. The same gap is far costlier across 1,000 clients than across 50.",
    type: "single",
    cap: 6,
    bucket: "client_document",
    layer: "exposure",
    optional: true,
    options: [
      { id: "lt50", label: "Under 50", riskPoints: 1 },
      { id: "50-200", label: "50–200", riskPoints: 2 },
      { id: "200-1000", label: "200–1,000", riskPoints: 4 },
      { id: "gt1000", label: "More than 1,000", riskPoints: 6, badge: "HIGH VOLUME", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 4, badge: "NEEDS REVIEW", badgeColor: "amber" },
    ],
  },

  // ─── Q1 Services ───────────────────────────────────────────────────────
  {
    id: "q1",
    badge: "Practice Profile",
    question: "Which client services does your firm provide?",
    helpText: "Select all that apply. This helps estimate the type of client data your firm handles.",
    whyThisMatters:
      "Payroll, bookkeeping and outsourced CFO work pull in the most sensitive personal data.",
    type: "multi",
    cap: 8,
    bucket: "client_document",
    layer: "exposure",
    mutuallyExclusive: ["not-sure"],
    options: [
      { id: "itr-individual", label: "Individual ITR filing", riskPoints: 2 },
      { id: "itr-business", label: "Business ITR / tax computation", riskPoints: 3 },
      { id: "gst", label: "GST / TDS / TCS compliance", riskPoints: 2 },
      { id: "audit", label: "Statutory / tax / internal audit", riskPoints: 3 },
      { id: "payroll", label: "Payroll processing", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "roc", label: "ROC / MCA / company secretarial", riskPoints: 2 },
      { id: "bookkeeping", label: "Accounting / bookkeeping / outsourced CFO", riskPoints: 4 },
      { id: "advisory", label: "Advisory, valuation, due diligence, finance support", riskPoints: 3 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not-sure", label: "Not sure", riskPoints: 4 },
    ],
  },

  // ─── Q2 Documents ──────────────────────────────────────────────────────
  {
    id: "q2",
    badge: "Client Document Risk",
    question: "Which client documents do you regularly collect or store?",
    helpText: "Select all documents your firm receives, stores, reviews or processes.",
    whyThisMatters:
      "PAN, Aadhaar, bank statements, payroll and family financial data are the highest-impact records under DPDPA.",
    type: "multi",
    cap: 14,
    bucket: "client_document",
    layer: "exposure",
    mutuallyExclusive: ["not-sure"],
    options: [
      { id: "pan", label: "PAN copies", riskPoints: 3 },
      { id: "aadhaar", label: "Aadhaar copies", riskPoints: 4, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "itr", label: "ITR acknowledgements / computations", riskPoints: 3 },
      { id: "form16", label: "Form 16 / AIS / TIS / 26AS", riskPoints: 3 },
      { id: "bank", label: "Bank statements", riskPoints: 4 },
      { id: "payroll", label: "Salary sheets / payroll files", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "gst", label: "GST returns / invoices / e-way bill", riskPoints: 2 },
      { id: "kyc-mca", label: "Company KYC / MCA / board documents", riskPoints: 2 },
      { id: "investment", label: "Investment, loan or property documents", riskPoints: 4 },
      { id: "family", label: "Family member financial documents", riskPoints: 4 },
      { id: "medical", label: "Medical insurance / reimbursement documents", riskPoints: 5, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other client documents", riskPoints: 1 },
      { id: "not-sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q3 Intake ─────────────────────────────────────────────────────────
  {
    id: "q3",
    badge: "Document Intake Risk",
    question: "How do clients usually send documents to your firm?",
    helpText: "Select all channels used in your practice. Many firms receive the same data through several routes.",
    whyThisMatters:
      "Unstructured intake via WhatsApp, email and shared folders makes access, deletion and breach control much harder.",
    type: "multi",
    cap: 12,
    bucket: "intake",
    layer: "exposure",
    mutuallyExclusive: ["not-sure"],
    options: [
      { id: "portal", label: "Secure client portal or structured upload link", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "email", label: "Email attachments", riskPoints: 4 },
      { id: "whatsapp", label: "WhatsApp", riskPoints: 6, badge: "HIGH RISK", badgeColor: "red" },
      { id: "cloud", label: "Shared Google Drive / OneDrive / Dropbox folders", riskPoints: 4 },
      { id: "physical-scan", label: "Physical copies scanned by our team", riskPoints: 2 },
      { id: "staff-collect", label: "Staff collect documents from client offices", riskPoints: 2 },
      { id: "multiple-no-standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q4 Storage ────────────────────────────────────────────────────────
  {
    id: "q4",
    badge: "Storage & Access Risk",
    question: "Where are client documents stored after collection?",
    helpText: "Select all storage locations used by your firm.",
    whyThisMatters:
      "Files scattered across laptops, inboxes and WhatsApp with no single source of truth are the hardest to secure or delete.",
    type: "multi",
    cap: 12,
    bucket: "storage_access",
    layer: "control",
    mutuallyExclusive: ["not-sure"],
    options: [
      { id: "dms", label: "Document management / practice software with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "cloud-mfa", label: "Cloud with MFA and restricted access", riskPoints: 1 },
      { id: "shared-cloud", label: "Shared cloud folders without regular access review", riskPoints: 5 },
      { id: "email-inbox", label: "Email inboxes", riskPoints: 5 },
      { id: "laptops", label: "Staff laptops / desktops", riskPoints: 6 },
      { id: "whatsapp", label: "WhatsApp chats or groups", riskPoints: 7, badge: "HIGH RISK", badgeColor: "red" },
      { id: "hdd", label: "External hard drives / pen drives", riskPoints: 6 },
      { id: "physical-only", label: "Physical files only", riskPoints: 2 },
      { id: "multiple-no-ssot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q5 Access ─────────────────────────────────────────────────────────
  {
    id: "q5",
    badge: "Staff Access Risk",
    question: "Who can access client files inside your firm?",
    helpText: "Choose the option closest to your current practice.",
    whyThisMatters:
      "Former-staff access to client files is one of the most common and serious DPDPA control gaps in CA firms.",
    type: "single",
    cap: 12,
    bucket: "storage_access",
    layer: "control",
    options: [
      { id: "role-based", label: "Role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "current-informal", label: "Current staff have access, but reviews are informal", riskPoints: 4 },
      { id: "articles-interns", label: "Article assistants / interns can access many client folders", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "most-staff", label: "Most staff can access most client documents", riskPoints: 9, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex-staff", label: "Ex-staff access may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q6 Notice / engagement letter ─────────────────────────────────────
  {
    id: "q6",
    badge: "Client Notice & Engagement Letter",
    question:
      "Does your engagement letter or onboarding communication explain how client data will be used, stored, shared and retained?",
    helpText: "This may be in your engagement letter, onboarding email, privacy notice or client terms.",
    whyThisMatters:
      "DPDPA expects clients to be told how their data is handled. For CA firms the engagement letter is the most practical place.",
    type: "single",
    cap: 10,
    bucket: "client_document",
    layer: "control",
    options: [
      { id: "yes-clear", label: "Yes, our engagement letter or privacy notice clearly explains this", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "partial", label: "Partially, but it is generic or not updated for DPDPA", riskPoints: 4 },
      { id: "on-ask", label: "We explain it only when clients ask", riskPoints: 7 },
      { id: "no-doc", label: "No, we do not document this clearly", riskPoints: 10, badge: "RISK", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q7 Retention ──────────────────────────────────────────────────────
  {
    id: "q7",
    badge: "Retention & Deletion Risk",
    question:
      "How long do you retain old client documents such as ITR files, PAN copies, bank statements, payroll sheets and audit papers?",
    helpText: "The issue is not retention itself — it is uncontrolled indefinite retention with no documented reason.",
    whyThisMatters:
      "Keeping high-impact documents forever, with no policy or review, turns old files into standing risk.",
    type: "single",
    cap: 12,
    bucket: "retention",
    layer: "control",
    options: [
      { id: "documented", label: "Documented retention schedule based on tax, audit, legal and professional requirements", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined-informal", label: "Defined period, but not formally documented", riskPoints: 4 },
      { id: "many-years", label: "We retain most documents for many years for convenience", riskPoints: 8 },
      { id: "indefinite", label: "We keep most client files indefinitely / forever", riskPoints: 12, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q8 Vendor ─────────────────────────────────────────────────────────
  {
    id: "q8",
    badge: "Vendor & Software Risk",
    question:
      "When tax software, GST tools, payroll platforms, cloud providers, IT vendors or outsourced teams access client data, how is it controlled?",
    helpText: "Includes tax-filing tools, GST software, payroll platforms, cloud storage, IT support and outsourced teams.",
    whyThisMatters:
      "Software vendors and outsourced teams are part of your data-processing chain under DPDPA — not just 'tools'.",
    type: "single",
    cap: 8,
    bucket: "vendor_incident",
    layer: "control",
    options: [
      { id: "vendor-list", label: "We maintain a vendor list and use written terms / contracts / access controls", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "standard-informal", label: "We use standard vendors, but vendor privacy review is informal", riskPoints: 3 },
      { id: "email-whatsapp", label: "Vendors / outsourced teams receive client files via email or WhatsApp", riskPoints: 6, badge: "RISK", badgeColor: "red" },
      { id: "not-sure-vendors", label: "We are not sure which vendors or tools store client data", riskPoints: 8, badge: "RISK", badgeColor: "red" },
      { id: "no-vendor", label: "We do not use any vendor or external tool", riskPoints: 1 },
    ],
  },

  // ─── Q9 Rights ─────────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Client Rights Handling",
    question: "If a client asks for correction, return or deletion of old documents, what happens?",
    helpText: "A CA firm balances client requests with tax, audit, legal and professional retention obligations.",
    whyThisMatters:
      "Data-principal rights apply to client data too. You need a defined way to respond — and to check lawful retention first.",
    type: "single",
    cap: 6,
    bucket: "retention",
    layer: "control",
    options: [
      { id: "defined-process", label: "We have a defined process and check legal/professional retention before action", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "case-by-case", label: "Partner or senior staff decides case-by-case", riskPoints: 2 },
      { id: "return-no-delete", label: "We usually return documents but do not delete internal copies systematically", riskPoints: 4 },
      { id: "no-process", label: "We do not have a standard process", riskPoints: 6, badge: "RISK", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q10 Breach ────────────────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question:
      "Do you have a process if a laptop, email inbox, Google Drive folder, WhatsApp account or tax software login containing client documents is compromised?",
    helpText: "This checks whether your firm can respond quickly if client documents are exposed.",
    whyThisMatters:
      "DPDPA requires breach intimation. Without a process, you cannot respond in time or evidence what you did.",
    type: "single",
    cap: 6,
    bucket: "vendor_incident",
    layer: "control",
    options: [
      { id: "documented-ir", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal", label: "IT support or senior staff would handle it informally", riskPoints: 3 },
      { id: "no-process", label: "No, we do not have a documented process", riskPoints: 6, badge: "RISK", badgeColor: "red" },
      { id: "not-sure", label: "Not sure", riskPoints: 5 },
    ],
  },
];

// ── Override + flag helpers ──────────────────────────────────────────────────

const has = (a: IAAnswers, qid: string, optId: string) =>
  selectedIds(a[qid]).includes(optId);
const anyOf = (a: IAAnswers, qid: string, optIds: string[]) =>
  selectedIds(a[qid]).some((id) => optIds.includes(id));

// ── Overrides (raise-only) ────────────────────────────────────────────────────

const OVERRIDES: IAOverride[] = [
  {
    id: "ex-staff-access",
    minBand: "High Risk",
    severity: 10,
    test: (a) => has(a, "q5", "ex-staff"),
    flag: "Former-staff access to client files may not be revoked promptly — a serious control gap.",
  },
  {
    id: "indefinite-retention-high-impact",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q7", "indefinite") && anyOf(a, "q2", HIGH_IMPACT_DOCS),
    flag: "High-impact records (PAN, Aadhaar, bank, payroll) may be retained indefinitely with no policy.",
  },
  {
    id: "informal-intake-no-breach",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q3", ["whatsapp", "email"]) && has(a, "q10", "no-process"),
    flag: "Documents arrive via WhatsApp/email but there is no breach-response process.",
  },
  {
    id: "no-notice-high-impact",
    minBand: "High Risk",
    severity: 7,
    test: (a) =>
      has(a, "q6", "no-doc") &&
      anyOf(a, "q2", ["pan", "aadhaar", "bank", "payroll", "family"]),
    flag: "High-impact client data is processed without a clear client notice or engagement-letter clause.",
  },
  {
    id: "vendor-uncertainty",
    minBand: "Moderate Risk", // → High if payroll/bookkeeping (handled below)
    severity: 6,
    test: (a) => has(a, "q8", "not-sure-vendors"),
    flag: "It is unclear which vendors or tools store client data.",
  },
  {
    id: "vendor-uncertainty-payroll",
    minBand: "High Risk",
    severity: 6,
    test: (a) =>
      has(a, "q8", "not-sure-vendors") && anyOf(a, "q1", ["payroll", "bookkeeping"]),
    flag: "Payroll/bookkeeping client data may sit with unknown vendors or tools.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "multiple-intake",
    severity: 8,
    test: (a) => has(a, "q3", "multiple-no-standard"),
    flag: "Client documents enter through multiple channels with no standard intake process.",
  },
  {
    id: "no-ssot",
    severity: 7,
    test: (a) => has(a, "q4", "multiple-no-ssot"),
    flag: "Client files are scattered with no single source of truth.",
  },
  {
    id: "whatsapp-storage",
    severity: 6,
    test: (a) => has(a, "q4", "whatsapp"),
    flag: "Client documents are stored in WhatsApp chats or groups.",
  },
  {
    id: "docs-unknown",
    severity: 6,
    test: (a) => has(a, "q2", "not-sure"),
    flag: "The firm is unsure which client documents it stores.",
  },
  {
    id: "whatsapp-intake",
    severity: 5,
    test: (a) => has(a, "q3", "whatsapp"),
    flag: "Clients send sensitive documents via WhatsApp.",
  },
  {
    id: "most-staff-access",
    severity: 5,
    test: (a) => has(a, "q5", "most-staff"),
    flag: "Most staff can access most client documents.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

const FOUR_CONTROLS = [
  "Standardise how clients send PAN, Aadhaar, ITR and bank documents — move to one controlled intake channel.",
  "Restrict and periodically review access to Google Drive, email folders and client files — especially article staff and ex-staff.",
  "Define retention rules for old ITR files, PAN copies, bank statements and payroll data.",
  "Create a breach-response process for laptop, email, WhatsApp and cloud-folder incidents.",
];

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FOUR_CONTROLS;
  }

  // Moderate / Controlled: target the highest-risk buckets, lighter tone.
  const recs: string[] = [];
  const s = r.bucketScores;
  if ((s.intake ?? 0) >= 34) recs.push(FOUR_CONTROLS[0]);
  if ((s.storage_access ?? 0) >= 34) recs.push(FOUR_CONTROLS[1]);
  if ((s.retention ?? 0) >= 34) recs.push(FOUR_CONTROLS[2]);
  if ((s.vendor_incident ?? 0) >= 34) recs.push(FOUR_CONTROLS[3]);

  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, set an annual access and retention review, and keep evidence of how client data is handled."
    );
  }
  return recs.slice(0, 4);
}

// ── Pack ──────────────────────────────────────────────────────────────────────

export const caFirmPack: IndustryPack = {
  industry: "ca-firms",
  route: "/assessment/ca-firms",
  reportType: "ca-firm",
  positioning: {
    title: "CA Firm DPDPA Risk Scan",
    hero: "Most CA firms don't have a tax knowledge problem. They have a client-document control problem.",
    sub: "Your firm may handle PAN, Aadhaar, ITR files, Form 16, bank statements, payroll sheets and audit records across WhatsApp, email, Google Drive and staff laptops. This 3-minute scan shows where DPDPA exposure may arise.",
    cta: "Start CA Firm Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "PAN",
      "Aadhaar",
      "ITR Files",
      "Bank Statements",
      "Payroll",
      "Google Drive",
      "WhatsApp",
      "Article-Staff Access",
      "Old Client Files",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  leadMagnet: {
    title: "CA Firm DPDPA Starter Checklist",
    href: "/templates/ca-firm-dpdpa-starter-checklist.pdf",
  },
};

export default caFirmPack;

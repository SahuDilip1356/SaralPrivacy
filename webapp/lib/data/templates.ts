// Single source of truth for the downloadable template catalogue.
//
// Both /resources (the public page) and the chat index import this, so the
// page and Setu can never disagree about what exists. Same pattern as
// sectors.ts and privacy-vendors.ts.
//
// Adding a template here is enough to make Setu aware of it — rerun
// `scripts/build-chat-index.mts` and the Pinecone ingest.

export interface DownloadTemplate {
  title: string;
  /** Filename under /public/templates — the download URL is /templates/<file>. */
  file: string;
  /** Format badge shown on the card. */
  tag: string;
  desc: string;
}

/** The five free templates on /resources, unlocked together behind one form. */
export const FREE_TEMPLATES: DownloadTemplate[] = [
  {
    title: "Privacy Notice Template",
    file: "privacy-notice.docx",
    tag: "Word",
    desc: "DPDPA-aligned privacy notice covering all 10 required sections — adapt for your website, app, or printed materials",
  },
  {
    title: "Data Inventory Register",
    file: "data-inventory-register.xlsx",
    tag: "Excel",
    desc: "Map every data type, storage location, retention period, and legal basis — the foundation of DPDPA compliance",
  },
  {
    title: "Consent Language Examples",
    file: "consent-language-examples.docx",
    tag: "Word",
    desc: "8 ready-to-use consent statements for website forms, WhatsApp, checkout, app onboarding, in-person, and employee data",
  },
  {
    title: "DSR & Grievance Handling SOP",
    file: "dsr-grievance-sop.docx",
    tag: "Word",
    desc: "Step-by-step process to handle access, correction, erasure, and grievance requests from customers and employees",
  },
  {
    title: "Vendor Data-Sharing Register",
    file: "vendor-data-sharing-register.xlsx",
    tag: "Excel",
    desc: "Track every third party who receives personal data, what DPAs are in place, and when to review each relationship",
  },
];

/**
 * Per-industry starter checklists. These are NOT on /resources — they are
 * emailed with the assessment report for that sector (see
 * app/api/assessment/route.ts). Setu needs to know they exist so he can say
 * how to get one, without implying it is a free download.
 */
export const STARTER_CHECKLIST_SECTORS = [
  "CA firms",
  "recruitment agencies",
  "D2C brands",
  "training institutes",
  "clinics and diagnostic labs",
  "schools and colleges",
  "law firms",
  "real estate",
  "hotels and travel",
  "pharmacies",
  "fintech and NBFCs",
  "gyms, salons and spas",
] as const;

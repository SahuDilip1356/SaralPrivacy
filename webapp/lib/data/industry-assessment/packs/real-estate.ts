// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Real Estate Brokers & Property Firms (8th)
// "Real Estate DPDPA Risk Scan" — a property-client data risk scan.
// Caps for Q1–Q10 sum to 112; the engine normalises by Σ caps automatically.
// Plain additive scoring — no credit options, so no engine interaction.
//
// Thesis: most real estate firms don't have a lead-generation problem — they
// have a lead-and-document *control* problem (KYC, intake, storage, broker
// sharing, access, notice, retention, incident readiness).
// Two-lens: exposure = Q1,Q2,Q3,Q4,Q5,Q6 (70) · control = Q7,Q8,Q9,Q10 (42).
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
import type { BandLabel } from "../bands";

// ── Buckets (5) ────────────────────────────────────────────────────────────────

const BUCKETS: IABucket[] = [
  {
    key: "client_lead_data",
    label: "Client & lead data risk",
    meaning: "Buyer, tenant, landlord and site-visit data may need stronger mapping.",
  },
  {
    key: "kyc_property_document",
    label: "KYC & property-document risk",
    meaning: "PAN, Aadhaar, agreements, title papers or loan documents may require stronger controls.",
  },
  {
    key: "broker_network_sharing",
    label: "Broker network & sharing risk",
    meaning: "WhatsApp groups, co-brokers and lead sheets may create onward-sharing exposure.",
  },
  {
    key: "crm_staff_vendor_access",
    label: "CRM, staff & vendor access risk",
    meaning: "Staff, field executives, CRM and old partner access may need review.",
  },
  {
    key: "retention_incident_readiness",
    label: "Retention & incident readiness risk",
    meaning: "Old leads and KYC/property records may be retained without clear rules.",
  },
];

// option-id groups reused by overrides/flags
const ID_OR_PROPERTY_DOCS = ["pan", "aadhaar", "passport_nri", "title_docs", "bank_loan_docs"];
const LOAN_FINANCIAL_DOCS = ["bank_loan_docs", "income_proof"];
const SCATTERED_STORAGE = ["whatsapp", "staff_devices", "sheets_excel", "cloud_folders", "multiple_no_sot"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Real estate profile ────────────────────────────────────────────
  {
    id: "q1",
    badge: "Real Estate Profile",
    question: "What type of real estate work do you handle?",
    helpText: "Select all that apply. This helps estimate your client, KYC and property-document risk profile.",
    whyThisMatters:
      "Rental, property management, co-living, NRI, land and loan-linked workflows usually involve more KYC, address, financial and document-sharing exposure.",
    type: "multi",
    cap: 8,
    bucket: "client_lead_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "residential_sale", label: "Residential sale / resale brokerage", riskPoints: 3 },
      { id: "residential_rental", label: "Residential rentals / tenant placement", riskPoints: 5 },
      { id: "commercial_leasing", label: "Commercial leasing / office space brokerage", riskPoints: 4 },
      { id: "builder_channel", label: "Builder channel partner / new project sales", riskPoints: 4 },
      { id: "property_management", label: "Property management services", riskPoints: 5 },
      { id: "coliving_pg", label: "Co-living / PG / managed accommodation", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "land_plot", label: "Land / plot transactions", riskPoints: 5 },
      { id: "nri_services", label: "NRI property services", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "loan_referral", label: "Loan / mortgage referral support", riskPoints: 5 },
      { id: "rera_documentation", label: "RERA / documentation / legal coordination", riskPoints: 4 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Client & lead data ─────────────────────────────────────────────
  {
    id: "q2",
    badge: "Client & Lead Data Risk",
    question: "What client or lead data do you collect or store?",
    helpText: "Select all buyer, tenant, seller, landlord, site-visit, budget, family or property-preference data your firm collects.",
    whyThisMatters:
      "Real estate data can reveal where a person lives, plans to move, budget, family composition, income signals and property preferences.",
    type: "multi",
    cap: 12,
    bucket: "client_lead_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact", label: "Buyer / tenant / seller / landlord name, phone and email", riskPoints: 2 },
      { id: "address_budget", label: "Address, location preference and budget", riskPoints: 3 },
      { id: "site_visit", label: "Site-visit history and property shortlists", riskPoints: 3 },
      { id: "family_occupancy", label: "Family details or occupancy details", riskPoints: 4 },
      { id: "employer_income", label: "Employer, business or income details", riskPoints: 5 },
      { id: "lead_source_history", label: "Lead source and communication history", riskPoints: 3 },
      { id: "property_preference", label: "Society, flat, unit or property preference details", riskPoints: 3 },
      { id: "nri_details", label: "NRI contact details or overseas address", riskPoints: 5 },
      { id: "references_guarantor", label: "References, guarantor or emergency contact details", riskPoints: 5 },
      { id: "other", label: "Other client or lead data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q3 KYC & property documents ───────────────────────────────────────
  {
    id: "q3",
    badge: "KYC & Property Document Risk",
    question: "Which KYC or property documents do you collect or handle?",
    helpText: "Select all identity, agreement, title, loan, income, verification or property documents your firm receives or stores.",
    whyThisMatters:
      "Real estate firms often hold identity, address, financial and property ownership documents. These are high-impact documents if copied, forwarded or retained without controls.",
    type: "multi",
    cap: 14,
    bucket: "kyc_property_document",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "pan", label: "PAN copy", riskPoints: 4, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "aadhaar", label: "Aadhaar copy", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "passport_nri", label: "Passport / visa / OCI or NRI documents", riskPoints: 6, badge: "SENSITIVE", badgeColor: "red" },
      { id: "rent_agreement", label: "Rent agreement / lease deed", riskPoints: 5 },
      { id: "sale_agreement", label: "Sale agreement / sale deed / allotment letter", riskPoints: 5 },
      { id: "title_docs", label: "Title documents / property papers", riskPoints: 6 },
      { id: "bank_loan_docs", label: "Bank statements / loan documents / sanction letters", riskPoints: 6, badge: "SENSITIVE", badgeColor: "red" },
      { id: "income_proof", label: "Salary slips / income proof", riskPoints: 6 },
      { id: "address_proof", label: "Utility bills / address proof", riskPoints: 4 },
      { id: "tenant_verification", label: "Police verification or tenant verification documents", riskPoints: 6 },
      { id: "society_noc", label: "Society NOC / maintenance records", riskPoints: 3 },
      { id: "other", label: "Other KYC or property documents", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q4 Document intake ────────────────────────────────────────────────
  {
    id: "q4",
    badge: "Document Intake Risk",
    question: "How do clients usually share KYC, property papers or agreement documents with you?",
    helpText: "Select all channels used by clients, landlords, builders, societies, staff or field executives.",
    whyThisMatters:
      "Real estate documents are commonly exchanged through WhatsApp and email for speed. That convenience creates storage, access, forwarding and deletion risk.",
    type: "multi",
    cap: 10,
    bucket: "kyc_property_document",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "secure_upload", label: "Secure upload link or document portal", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "email", label: "Email attachments", riskPoints: 4 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "shared_cloud", label: "Shared Google Drive / OneDrive / Dropbox folders", riskPoints: 5 },
      { id: "physical_scanned", label: "Physical copies later scanned by your team", riskPoints: 3 },
      { id: "field_collection", label: "Staff / field executive collects documents", riskPoints: 4 },
      { id: "direct_from_others", label: "Builder / landlord / society shares documents directly", riskPoints: 4 },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q5 Storage locations ──────────────────────────────────────────────
  {
    id: "q5",
    badge: "Storage & Access Risk",
    question: "Where are client leads, KYC documents and property papers stored?",
    helpText: "Select all systems, folders, chats, devices or physical locations where client and property data is stored.",
    whyThisMatters:
      "Client leads and KYC documents often remain scattered across phones, WhatsApp, spreadsheets and cloud folders long after the deal closes.",
    type: "multi",
    cap: 12,
    bucket: "crm_staff_vendor_access",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "crm_pms", label: "CRM or property management system with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "sheets_excel", label: "Google Sheets / Excel trackers", riskPoints: 5 },
      { id: "cloud_folders", label: "Google Drive / OneDrive / Dropbox folders", riskPoints: 5 },
      { id: "email_inboxes", label: "Email inboxes", riskPoints: 5 },
      { id: "whatsapp", label: "WhatsApp chats or broker groups", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "staff_devices", label: "Staff phones or laptops", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "physical_only", label: "Physical files only", riskPoints: 2 },
      { id: "external_drives", label: "External hard drives / pen drives", riskPoints: 7 },
      { id: "multiple_no_sot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q6 Broker sharing ─────────────────────────────────────────────────
  {
    id: "q6",
    badge: "Broker Network & Sharing Risk",
    question: "How do you share buyer, tenant, landlord or seller details with others?",
    helpText: "Select all parties and channels used for co-broking, builder sales, society coordination, loan referral, legal documentation or property management.",
    whyThisMatters:
      "Real estate is network-driven. Privacy risk increases when buyer, tenant or landlord information is forwarded across brokers, builders, lenders and societies without visibility.",
    type: "multi",
    cap: 14,
    bucket: "broker_network_sharing",
    layer: "exposure",
    // "documented_purpose" (the 'only with instruction' answer) and "not_sure"
    // clear the rest.
    mutuallyExclusive: ["documented_purpose", "not_sure"],
    options: [
      { id: "documented_purpose", label: "Only with clear client instruction or documented purpose", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "whatsapp_broker_groups", label: "WhatsApp groups with co-brokers or channel partners", riskPoints: 7, badge: "HIGH RISK", badgeColor: "red" },
      { id: "lead_sheets", label: "Excel / Google Sheets lead lists", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "builder_teams", label: "Builder sales teams or project teams", riskPoints: 4 },
      { id: "landlords_society", label: "Landlords / owners / society representatives", riskPoints: 5 },
      { id: "loan_partners", label: "Loan agents / banks / NBFC partners", riskPoints: 6 },
      { id: "legal_registration", label: "Lawyers, registration agents or documentation vendors", riskPoints: 4 },
      { id: "property_management", label: "Property management or maintenance teams", riskPoints: 4 },
      { id: "multiple_parties", label: "Multiple parties depending on deal requirements", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q7 Staff & partner access ─────────────────────────────────────────
  {
    id: "q7",
    badge: "Staff / Broker Access Risk",
    question: "How is access controlled for staff, freelancers, field executives or co-brokers?",
    helpText: "This includes internal sales teams, field executives, freelancers, co-brokers, channel partners and ex-staff.",
    whyThisMatters:
      "Property leads and KYC documents are often shared widely within sales teams and broker networks. Ex-staff and old partner access is a serious control gap.",
    type: "single",
    cap: 12,
    bucket: "crm_staff_vendor_access",
    layer: "control",
    options: [
      { id: "role_based_reviewed", label: "Access is role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_review", label: "Current staff access is controlled, but review is informal", riskPoints: 3 },
      { id: "sales_field_broad", label: "Sales staff / field executives can access many leads and documents", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "freelancers_cobrokers", label: "Freelancers / co-brokers receive lead sheets or document folders", riskPoints: 9, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_partner_access", label: "Ex-staff or old broker partners may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q8 Client notice ──────────────────────────────────────────────────
  {
    id: "q8",
    badge: "Client Notice & Lead Form",
    question: "Does your client onboarding, site-visit form, lead form or agreement process explain how personal data will be used, shared and retained?",
    helpText: "This may be part of your lead form, site-visit form, WhatsApp onboarding message, brokerage terms or agreement workflow.",
    whyThisMatters:
      "Real estate clients may not realise their details will be shared with brokers, builders, landlords, societies, loan partners, lawyers or registration agents.",
    type: "single",
    cap: 10,
    bucket: "client_lead_data",
    layer: "control",
    options: [
      { id: "clear_terms", label: "Yes, our forms/terms clearly explain data use, sharing and retention", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "generic_not_updated", label: "Partially, but wording is generic or not updated for DPDPA", riskPoints: 4 },
      { id: "verbal_whatsapp", label: "We explain verbally or over WhatsApp/call when needed", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "no_documentation", label: "No, we do not document this clearly", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Lead & Document Retention",
    question: "How long do you retain old buyer/tenant leads, KYC copies, rent agreements, property papers and closed-deal records?",
    helpText: "The issue is not retention itself. The issue is uncontrolled indefinite retention of old leads and sensitive property documents.",
    whyThisMatters:
      "Real estate firms often keep old buyer and tenant databases indefinitely for future resale/rental opportunities. That creates avoidable exposure.",
    type: "single",
    cap: 10,
    bucket: "retention_incident_readiness",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_future_deals", label: "We retain old leads and documents for many years for future deals", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most client and property documents indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if KYC documents, property papers, WhatsApp chats, lead sheets, CRM access or agreement copies are compromised or sent to the wrong person?",
    helpText: "This checks whether your firm can respond quickly to wrong-recipient sharing, exposed lead sheets, unauthorised CRM access or forwarded KYC documents.",
    whyThisMatters:
      "Wrong-recipient WhatsApp messages, forwarded PAN/Aadhaar copies, exposed lead sheets or old broker access can quickly become a privacy and trust issue.",
    type: "single",
    cap: 10,
    bucket: "retention_incident_readiness",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_owner_it", label: "Owner/senior broker/IT vendor would handle it informally", riskPoints: 4 },
      { id: "case_by_case", label: "We handle such issues case-by-case if they occur", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "no_standard_process", label: "No, we do not have a standard process", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },
];

// ── Override + flag helpers ──────────────────────────────────────────────────

const has = (a: IAAnswers, qid: string, optId: string) =>
  selectedIds(a[qid]).includes(optId);
const anyOf = (a: IAAnswers, qid: string, optIds: string[]) =>
  selectedIds(a[qid]).some((id) => optIds.includes(id));
const hasIdOrPropertyDocs = (a: IAAnswers) => anyOf(a, "q3", ID_OR_PROPERTY_DOCS);
const hasLoanFinancialDocs = (a: IAAnswers) => anyOf(a, "q3", LOAN_FINANCIAL_DOCS);

// ── Overrides (raise-only) ────────────────────────────────────────────────────
// Max band reached here is High Risk — Critical is reachable purely via raw score.
// Override 4 (loan docs + lender sharing) has a conditional minimum: Moderate
// alone, escalating to High with WhatsApp/email intake — expressed as a paired
// entry sharing one flag text.

const OVERRIDES: IAOverride[] = [
  {
    id: "id_docs_whatsapp",
    minBand: "High Risk",
    severity: 9,
    test: (a) => hasIdOrPropertyDocs(a) && has(a, "q4", "whatsapp"),
    flag: "PAN, Aadhaar, title papers or loan documents are coming in over WhatsApp — easy to forward, hard to delete and control.",
  },
  {
    id: "broker_sharing_no_notice",
    minBand: "High Risk",
    severity: 9,
    test: (a) => anyOf(a, "q6", ["whatsapp_broker_groups", "lead_sheets"]) && anyOf(a, "q8", ["no_documentation", "verbal_whatsapp"]),
    flag: "Buyer/tenant details are circulated via WhatsApp broker groups or lead sheets, but clients aren't told their data is shared.",
  },
  {
    id: "ex_staff_partner_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q7", "ex_staff_partner_access"),
    flag: "Ex-staff or old broker partners may still have access to lead sheets, document folders or CRM systems.",
  },
  {
    id: "indefinite_id_docs",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && hasIdOrPropertyDocs(a),
    flag: "PAN/Aadhaar copies, title papers and loan documents are kept indefinitely with no retention or deletion rule.",
  },
  {
    id: "no_incident_scattered",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && anyOf(a, "q5", SCATTERED_STORAGE),
    flag: "Leads and KYC are scattered across WhatsApp, staff phones, sheets and cloud folders with no process for a wrong-recipient share or a breach.",
  },
  // Override 4 — loan/financial docs + lender sharing. Moderate alone; High with WhatsApp/email intake.
  {
    id: "loan_docs_lender",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => hasLoanFinancialDocs(a) && has(a, "q6", "loan_partners"),
    flag: "Bank/loan and income documents are shared with loan agents, banks or NBFCs — keep this purposeful and access-controlled.",
  },
  {
    id: "loan_docs_lender_informal_intake",
    minBand: "High Risk",
    severity: 7,
    test: (a) => hasLoanFinancialDocs(a) && has(a, "q6", "loan_partners") && anyOf(a, "q4", ["whatsapp", "email"]),
    flag: "Bank/loan and income documents are shared with loan agents, banks or NBFCs — keep this purposeful and access-controlled.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "lead_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["address_budget", "family_occupancy", "employer_income", "nri_details", "references_guarantor"]),
    flag: "Lead data can reveal location, budget, family composition, income signals and property movement plans.",
  },
  {
    id: "kyc_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q3", ["pan", "aadhaar", "passport_nri", "title_docs", "bank_loan_docs", "income_proof", "tenant_verification"]),
    flag: "PAN, Aadhaar, passport, title papers and bank/loan documents are high-impact if copied, forwarded or retained without controls.",
  },
  {
    id: "informal_intake",
    severity: 6,
    test: (a) => anyOf(a, "q4", ["whatsapp", "email", "shared_cloud", "multiple_no_standard"]),
    flag: "KYC and property papers may be exchanged through WhatsApp, email and shared folders without enough control.",
  },
  {
    id: "storage_sprawl",
    severity: 6,
    test: (a) => anyOf(a, "q5", SCATTERED_STORAGE),
    flag: "Client leads and KYC may be scattered across CRM, sheets, WhatsApp, staff phones and cloud folders.",
  },
  {
    id: "broker_sharing",
    severity: 6,
    test: (a) => anyOf(a, "q6", ["whatsapp_broker_groups", "lead_sheets", "loan_partners", "multiple_parties"]),
    flag: "Buyer, tenant or landlord details may be forwarded across broker groups, lead sheets, lenders and partners without clear tracking.",
  },
  {
    id: "broad_access",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["sales_field_broad", "freelancers_cobrokers", "ex_staff_partner_access"]),
    flag: "Sales staff, field executives, freelancers, co-brokers or ex-staff may have broader access to leads and documents than necessary.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["many_years_future_deals", "indefinitely"]),
    flag: "Old buyer/tenant leads and KYC copies may be retained indefinitely for future deals without a documented schedule.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Standardise KYC and property-document collection — define a secure way to receive PAN, Aadhaar, agreements and property papers instead of scattered WhatsApp and email.",
  "Reduce WhatsApp forwarding of PAN, Aadhaar and agreement documents — prefer a secure upload/portal and don't keep duplicate copies on staff phones.",
  "Control lead sharing with co-brokers, builders, landlords and loan partners — share only with client instruction or a documented purpose, and tell clients in the lead/site-visit form.",
  "Review access to CRM, Google Sheets, cloud folders, WhatsApp groups and staff phones — remove ex-staff and old broker access, and limit by role and deal need.",
  "Define retention and deletion rules for old buyer/tenant leads, KYC copies and closed-deal documents, plus a simple wrong-recipient/breach response.",
];

const BUCKET_RECS: Record<string, string> = {
  kyc_property_document:
    "Standardise KYC and property-document handling. Reduce PAN, Aadhaar, passport, bank, loan and property-paper exchange over WhatsApp, and define secure collection, storage and deletion rules.",
  client_lead_data:
    "Map client and lead data across enquiry forms, site visits, CRM, WhatsApp, brokers, builder teams, landlords, loan partners and property management. Explain data use and sharing clearly in lead or site-visit forms.",
  broker_network_sharing:
    "Control broker and partner sharing. Define when buyer, tenant, landlord or seller details can be shared with co-brokers, builders, societies, loan partners, lawyers or registration agents.",
  crm_staff_vendor_access:
    "Review access to CRM, Google Sheets, cloud folders, WhatsApp groups and staff devices. Remove ex-staff and old broker access, and limit lead/document access based on role and deal need.",
  retention_incident_readiness:
    "Define retention and incident-response rules for old leads, KYC copies, rent agreements, sale documents, property papers, WhatsApp chats and wrong-recipient sharing.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "kyc_property_document",
    "client_lead_data",
    "broker_network_sharing",
    "crm_staff_vendor_access",
    "retention_incident_readiness",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your KYC handling, broker sharing, access and retention practices consistent, and set a periodic review."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your real estate firm appears to have basic client, KYC and property-document controls in place. Your next step is to document these practices, review broker-sharing channels and define retention rules for old leads and property documents.",
  "Moderate Risk":
    "Your real estate firm has some client-data controls, but several practices may be informal. Focus first on KYC handling, WhatsApp sharing, broker networks, CRM access and retention of old buyer/tenant leads.",
  "High Risk":
    "Your real estate firm may have significant DPDPA exposure across buyer/tenant KYC, PAN/Aadhaar documents, property papers, WhatsApp sharing, broker networks, loan partners, CRM access or old lead retention. Your first priority is to control KYC collection, broker sharing, staff access and old client-data retention.",
  "Critical Risk":
    "Your real estate firm may have serious DPDPA exposure. This usually happens when PAN, Aadhaar, rent agreements, sale deeds, property papers, loan documents, buyer leads, tenant data, WhatsApp groups, broker networks, staff phones and old databases are managed informally — without notice, access control, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const realEstatePack: IndustryPack = {
  industry: "real-estate",
  route: "/assessment/real-estate",
  reportType: "realty", // short token — "real-estate" is 11 chars; Appwrite `report_type` is string(10)
  positioning: {
    title: "Real Estate DPDPA Risk Scan",
    hero: "Your real estate firm does not just close deals. It moves buyer, tenant and property data across people and networks.",
    sub: "From buyer leads and tenant KYC to PAN/Aadhaar copies, rent agreements, sale deeds, title papers, WhatsApp groups, broker networks, loan partners, societies and old lead databases — real estate firms handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise in your property-client data workflows. It collects no client documents — only your answers about your processes.",
    cta: "Start Real Estate Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Buyer Leads",
      "Tenant KYC",
      "PAN / Aadhaar",
      "Rent Agreements",
      "Sale Deeds",
      "Property Papers",
      "WhatsApp Groups",
      "Broker Networks",
      "Loan Partners",
      "Old Leads",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Real Estate DPDPA Starter Checklist",
    href: "/templates/real-estate-dpdpa-starter-checklist.pdf",
  },
};

export default realEstatePack;

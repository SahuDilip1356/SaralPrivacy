// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Fintech / NBFC / Digital Payments (11th)
// "Fintech / NBFC DPDPA Risk Scan" — a financial-data & profiling risk scan.
// Caps for Q1–Q10 sum to 122 (this pack runs hotter than the 110/112 norm);
// the engine normalises by Σ caps automatically. Plain additive — no engine change.
//
// Thesis: fintech/NBFC businesses don't only process transactions — they verify,
// score, profile and share customer financial data across KYC, bureau checks,
// DSAs, collection agents, payment partners, vendor dashboards and old records.
// Two-lens: exposure = Q1,Q2,Q3,Q6 (52) · control = Q4,Q5,Q7,Q8,Q9,Q10 (70).
//
// LEGAL-COPY: DPDPA-scoped only — no implied RBI / data-localization / Digital
// Lending Guidelines coverage. Profiling framed under DPDPA notice/consent, NOT a
// GDPR "right to explanation". "High-impact financial data", never "sensitive".
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
    key: "kyc_financial_data",
    label: "KYC & financial data risk",
    meaning: "PAN, Aadhaar, bank, bureau and repayment data may need stronger mapping.",
  },
  {
    key: "profiling_underwriting",
    label: "Profiling & underwriting risk",
    meaning: "Scoring, eligibility or automated decisions may need better governance.",
  },
  {
    key: "consent_notice_rights",
    label: "Consent, notice & rights risk",
    meaning: "Consent evidence and customer request workflows may need strengthening.",
  },
  {
    key: "vendor_partner_agent_sharing",
    label: "Vendor, partner & agent-sharing risk",
    meaning: "Lenders, bureaus, DSAs, collection agents and vendors may create exposure.",
  },
  {
    key: "access_retention_incident",
    label: "Access, retention & incident readiness risk",
    meaning: "Financial-data storage, old records and incident processes may not be mature.",
  },
];

// option-id groups reused by overrides/flags
const HIGH_IMPACT_FINANCIAL = ["pan", "aadhaar_kyc", "bank_statements", "bureau_data", "loan_emi", "collection_notes"];
const SCATTERED_STORAGE = ["whatsapp", "sheets_excel", "email_inboxes", "staff_agent_devices", "multiple_no_sot"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Financial service profile ──────────────────────────────────────
  {
    id: "q1",
    badge: "Financial Service Profile",
    question: "What type of financial service do you provide?",
    helpText: "Select all that apply. This helps estimate your KYC, financial-data and partner-sharing risk profile.",
    whyThisMatters:
      "Digital lending, collections, credit scoring and UPI/payment workflows usually create higher data sensitivity and vendor-sharing exposure.",
    type: "multi",
    cap: 10,
    bucket: "kyc_financial_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "nbfc_lending", label: "NBFC lending / loan provider", riskPoints: 7 },
      { id: "digital_lending_app", label: "Digital lending app", riskPoints: 8, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "loan_aggregator", label: "Loan aggregator / marketplace", riskPoints: 6 },
      { id: "payment_gateway", label: "Payment gateway / payment processor", riskPoints: 5 },
      { id: "upi_wallet", label: "UPI / wallet / prepaid payment service", riskPoints: 6 },
      { id: "bnpl_emi", label: "BNPL / EMI / consumer finance", riskPoints: 7 },
      { id: "wealthtech", label: "Wealth-tech / investment / advisory platform", riskPoints: 6 },
      { id: "credit_score_matching", label: "Credit-score / eligibility / lead-matching platform", riskPoints: 7 },
      { id: "collection_agency", label: "Collection agency / recovery support", riskPoints: 8, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "msme_finance", label: "MSME finance / business lending", riskPoints: 6 },
      { id: "corporate_payout", label: "Corporate payout / payroll / expense fintech", riskPoints: 6 },
      { id: "other", label: "Other financial service", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q2 Customer financial data ────────────────────────────────────────
  {
    id: "q2",
    badge: "KYC & Financial Data Risk",
    question: "What customer financial data do you collect or store?",
    helpText: "Select all KYC, bank, UPI, income, bureau, repayment, device or collection data your business collects.",
    whyThisMatters:
      "Financial data can reveal identity, income, debt, creditworthiness, spending patterns, repayment behaviour, business activity and personal relationships.",
    type: "multi",
    cap: 16,
    bucket: "kyc_financial_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact_address", label: "Customer name, phone number, email and address", riskPoints: 2 },
      { id: "pan", label: "PAN", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "aadhaar_kyc", label: "Aadhaar or Aadhaar-derived KYC data", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "bank_account", label: "Bank account details / IFSC / cancelled cheque", riskPoints: 6 },
      { id: "bank_statements", label: "Bank statements or account transaction history", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "upi_payment", label: "UPI ID / VPA / payment transaction references", riskPoints: 5 },
      { id: "income_data", label: "Salary slips, income proof or GST/business turnover data", riskPoints: 7 },
      { id: "bureau_data", label: "Credit bureau report / credit score / repayment history", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "loan_emi", label: "Loan application data / EMI details / repayment schedule", riskPoints: 6 },
      { id: "device_behavioural", label: "Device, app, IP, location or behavioural data", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "nominee_guarantor", label: "Nominee, family member, guarantor or reference details", riskPoints: 5 },
      { id: "collection_notes", label: "Collection notes, call recordings or recovery history", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other customer financial data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q3 KYC / document intake ──────────────────────────────────────────
  {
    id: "q3",
    badge: "KYC & Document Intake Risk",
    question: "How do customers submit KYC, income or financial documents?",
    helpText: "Select all channels used by customers, DSAs, field agents, call centres or partner platforms.",
    whyThisMatters:
      "Financial documents collected through WhatsApp, DSAs, call centres and informal channels are difficult to control, verify, delete and audit.",
    type: "multi",
    cap: 10,
    bucket: "kyc_financial_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "secure_app_web", label: "Secure app / website workflow", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "regulated_kyc", label: "Regulated KYC / eKYC / CKYC / partner KYC flow", riskPoints: 1, badge: "GOOD", badgeColor: "green" },
      { id: "email", label: "Email attachments", riskPoints: 5 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "dsa_field_agent", label: "DSA / field agent collects documents", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "third_party_upload", label: "Customer uploads through third-party platform", riskPoints: 4 },
      { id: "call_centre_sales", label: "Call centre or sales team collects details", riskPoints: 5 },
      { id: "physical_scanned", label: "Physical documents scanned later", riskPoints: 4 },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q4 Profiling & underwriting ───────────────────────────────────────
  {
    id: "q4",
    badge: "Profiling & Underwriting Risk",
    question: "Do you use credit scoring, profiling, eligibility checks, risk models or automated decisioning?",
    helpText: "This includes credit scoring, fraud scoring, eligibility checks, offer personalisation, risk models and automated approval/rejection logic.",
    whyThisMatters:
      "Fintech risk is not only collection risk. Profiling and eligibility decisions can materially affect customers, so the purpose, inputs and customer notice for those decisions need to be clear under DPDPA.",
    type: "single",
    cap: 14,
    bucket: "profiling_underwriting",
    layer: "control",
    options: [
      { id: "documented_human_review", label: "Yes, with documented model purpose, data inputs and human review where needed", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_documentation", label: "Yes, but documentation and review are informal", riskPoints: 5 },
      { id: "scoring_personalisation", label: "Yes, customer data is used for scoring, eligibility or offer personalisation", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "automated_limited_explanation", label: "Yes, automated decisions are made with limited customer explanation", riskPoints: 12, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_profiling", label: "No, we do not use scoring/profiling/automated decisioning", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q5 Consent & notice ───────────────────────────────────────────────
  {
    id: "q5",
    badge: "Consent, Notice & Customer Rights",
    question: "How do you provide notice and capture consent for collection, verification, profiling and sharing of customer data?",
    helpText: "This includes KYC, bureau checks, bank statement analysis, partner sharing, risk scoring, cross-sell and marketing use.",
    whyThisMatters:
      "Financial-data processing needs strong, traceable consent and clear customer communication, especially where verification, profiling or sharing is involved.",
    type: "single",
    cap: 12,
    bucket: "consent_notice_rights",
    layer: "control",
    options: [
      { id: "clear_audit_evidence", label: "Clear notice and consent are captured with timestamp/audit evidence", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "exists_not_traceable", label: "Notice/consent exists, but evidence is not always easy to trace", riskPoints: 3 },
      { id: "bundled_terms", label: "Consent is bundled into terms and conditions without clear explanation", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "no_clear_evidence", label: "Data is collected or shared based on business process without clear consent evidence", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 9 },
    ],
  },

  // ─── Q6 External parties ───────────────────────────────────────────────
  {
    id: "q6",
    badge: "Partner, Vendor & Agent Sharing",
    question: "Which external parties receive customer financial data?",
    helpText: "Select all lenders, bureaus, KYC providers, payment partners, DSAs, collection agents, call centres, risk vendors or support partners involved.",
    whyThisMatters:
      "Fintech data often moves across a large partner ecosystem. Vendor and agent governance is usually the biggest practical risk.",
    type: "multi",
    cap: 16,
    bucket: "vendor_partner_agent_sharing",
    layer: "exposure",
    mutuallyExclusive: ["no_external_sharing", "not_sure"],
    options: [
      { id: "lending_partners", label: "Lending partners / NBFCs / banks", riskPoints: 5 },
      { id: "credit_bureaus", label: "Credit bureaus", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "kyc_providers", label: "KYC / eKYC / identity verification providers", riskPoints: 5 },
      { id: "account_aggregator", label: "Account aggregator / bank statement analysis provider", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "payment_partner", label: "Payment gateway / UPI / wallet / settlement partner", riskPoints: 5 },
      { id: "dsa_agents", label: "DSA / sales agents / field agents", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "collection_agents", label: "Collection agencies / recovery agents", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "call_centre", label: "Call centres / customer-support vendors", riskPoints: 5 },
      { id: "cloud_crm_analytics", label: "Cloud / CRM / analytics / marketing platforms", riskPoints: 5 },
      { id: "fraud_risk_vendors", label: "Fraud detection / risk / device intelligence vendors", riskPoints: 6 },
      { id: "legal_audit_regulatory", label: "Legal, audit, compliance or regulatory reporting partners", riskPoints: 3 },
      { id: "insurance_crosssell", label: "Insurance or cross-sell partners", riskPoints: 6 },
      { id: "no_external_sharing", label: "We do not share customer financial data externally", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 9 },
    ],
  },

  // ─── Q7 Agent access ───────────────────────────────────────────────────
  {
    id: "q7",
    badge: "DSA / Collection Agent Access",
    question: "Do collection agents, DSAs, sales partners or call-centre teams access customer data?",
    helpText: "This checks whether agents can access, export, call, message or follow up using customer financial data.",
    whyThisMatters:
      "Collection and sales-agent workflows can expose customer financial data, repayment status, phone numbers, references and guarantor information.",
    type: "single",
    cap: 12,
    bucket: "vendor_partner_agent_sharing",
    layer: "control",
    options: [
      { id: "limited_monitored", label: "Yes, access is role-based, limited and monitored", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_monitoring", label: "Yes, but access reviews and monitoring are informal", riskPoints: 4 },
      { id: "download_export", label: "Yes, agents can download or export customer lists", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "personal_phone_whatsapp", label: "Yes, agents use personal phones or WhatsApp for customer follow-up", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_agents", label: "No agents/DSAs/call centres involved", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 9 },
    ],
  },

  // ─── Q8 Storage ────────────────────────────────────────────────────────
  {
    id: "q8",
    badge: "Storage & Access Risk",
    question: "Where is customer financial data stored?",
    helpText: "Select all systems, dashboards, sheets, chats, devices, call tools or data stores where customer financial data is stored.",
    whyThisMatters:
      "Financial data scattered across sheets, WhatsApp, phones, CRM, data warehouses and vendor dashboards creates leakage and access-control risk.",
    type: "multi",
    cap: 12,
    bucket: "access_retention_incident",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "core_platform", label: "Core system / lending platform / payment platform with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "crm_support", label: "CRM or support platform", riskPoints: 3 },
      { id: "data_warehouse", label: "Cloud database / data warehouse", riskPoints: 4 },
      { id: "sheets_excel", label: "Google Sheets / Excel trackers", riskPoints: 6 },
      { id: "email_inboxes", label: "Email inboxes", riskPoints: 6 },
      { id: "whatsapp", label: "WhatsApp chats or groups", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "staff_agent_devices", label: "Agent or staff phones/laptops", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "vendor_dashboards", label: "Third-party vendor dashboards", riskPoints: 5 },
      { id: "call_recordings", label: "Call recordings or support tools", riskPoints: 5 },
      { id: "multiple_no_sot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Financial Record Retention",
    question: "How long do you retain rejected applications, KYC records, bank statements, bureau data, repayment history and collection notes?",
    helpText: "The issue is not retention itself. The issue is uncontrolled retention of high-impact financial records without purpose and access review.",
    whyThisMatters:
      "Fintech businesses often retain rejected leads, KYC records and bank statements for future offers or risk modelling. This must be purpose-bound and controlled.",
    type: "single",
    cap: 10,
    bucket: "access_retention_incident",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_risk_audit", label: "We retain records for many years for risk, audit, future offers or collections", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most customer financial records indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if KYC records, bank data, UPI data, bureau data, repayment records, customer lists or vendor dashboards are compromised or shared with the wrong person?",
    helpText: "This checks whether your business can respond quickly to exposed KYC records, leaked customer lists, compromised dashboards or wrong-recipient sharing.",
    whyThisMatters:
      "Financial-data breaches can involve identity fraud, loan fraud, reputational damage, regulatory scrutiny and high customer harm.",
    type: "single",
    cap: 10,
    bucket: "access_retention_incident",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_compliance_it", label: "Compliance/IT/vendor team would handle it informally", riskPoints: 4 },
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

// ── Overrides (raise-only) ────────────────────────────────────────────────────
// Highest-stakes sector: all seven overrides go straight to High (no Moderate→High
// pair). Critical remains reachable purely via raw score.

const OVERRIDES: IAOverride[] = [
  {
    id: "bank_bureau_informal_intake",
    minBand: "High Risk",
    severity: 9,
    test: (a) => anyOf(a, "q2", ["bank_statements", "bureau_data"]) && anyOf(a, "q3", ["whatsapp", "dsa_field_agent"]),
    flag: "Bank statements or credit-bureau data are coming in over WhatsApp or via DSAs/field agents — hard to control, verify and delete.",
  },
  {
    id: "automated_limited_explanation",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q4", "automated_limited_explanation"),
    flag: "Automated lending/eligibility decisions are made with limited customer explanation — purpose, inputs and notice need to be clear.",
  },
  {
    id: "bundled_consent_with_profiling",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q5", ["bundled_terms", "no_clear_evidence"]) && anyOf(a, "q4", ["informal_documentation", "scoring_personalisation", "automated_limited_explanation"]),
    flag: "Customer data is profiled or scored, but consent is bundled into terms or lacks clear, traceable evidence.",
  },
  {
    id: "agents_personal_phone_whatsapp",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q7", "personal_phone_whatsapp"),
    flag: "Collection/sales agents follow up using personal phones or WhatsApp — customer financial data sits outside any access control.",
  },
  {
    id: "agents_export_lists",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q7", "download_export"),
    flag: "Agents can download or export customer lists — a common and serious leakage path for financial data.",
  },
  {
    id: "indefinite_high_impact_records",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && anyOf(a, "q2", HIGH_IMPACT_FINANCIAL),
    flag: "PAN, Aadhaar, bank statements, bureau data or repayment records are kept indefinitely with no retention or deletion rule.",
  },
  {
    id: "no_incident_scattered",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && anyOf(a, "q8", SCATTERED_STORAGE),
    flag: "Financial data is scattered across WhatsApp, Excel, email and staff devices with no process for a leaked list or a breach.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "financial_data_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["pan", "aadhaar_kyc", "bank_statements", "bureau_data", "income_data", "device_behavioural", "collection_notes"]),
    flag: "PAN, Aadhaar, bank statements, bureau data and behavioural data can reveal identity, income, debt and creditworthiness — treat them as high-impact.",
  },
  {
    id: "profiling_governance",
    severity: 6,
    test: (a) => anyOf(a, "q4", ["informal_documentation", "scoring_personalisation", "automated_limited_explanation"]),
    flag: "Scoring, eligibility or automated decisions may be used without enough documentation of purpose, inputs and customer notice.",
  },
  {
    id: "consent_evidence_gap",
    severity: 6,
    test: (a) => anyOf(a, "q5", ["bundled_terms", "no_clear_evidence"]),
    flag: "Consent for verification, profiling, bureau checks and partner sharing may be bundled into terms without traceable evidence.",
  },
  {
    id: "partner_ecosystem",
    severity: 6,
    test: (a) => anyOf(a, "q6", ["credit_bureaus", "account_aggregator", "dsa_agents", "collection_agents", "fraud_risk_vendors"]),
    flag: "Customer financial data may move across bureaus, account aggregators, DSAs, collection agents and risk vendors without a clear sharing register.",
  },
  {
    id: "agent_access",
    severity: 6,
    test: (a) => anyOf(a, "q7", ["informal_monitoring", "download_export", "personal_phone_whatsapp"]),
    flag: "DSAs, collection agents or call-centre teams may access or export customer lists without sufficient monitoring.",
  },
  {
    id: "storage_sprawl",
    severity: 5,
    test: (a) => anyOf(a, "q8", SCATTERED_STORAGE),
    flag: "Financial data may be scattered across core systems, CRM, Excel, WhatsApp, vendor dashboards, call recordings and staff devices.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["many_years_risk_audit", "indefinitely"]),
    flag: "Rejected applications, KYC records, bank statements and bureau data may be retained for years without a documented schedule.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Map KYC, bank, bureau, UPI and repayment data flows — where each is collected, why, and who can access it.",
  "Strengthen timestamped, traceable consent for verification, profiling, bureau checks and partner sharing — not bundled into terms.",
  "Document scoring, eligibility and underwriting logic at a business-process level — inputs, decision points, model owners and customer notice.",
  "Control DSA, collection-agent, call-centre and vendor access — role-based, monitored, no exports or personal-phone/WhatsApp follow-up.",
  "Define retention and incident-response rules for KYC, bureau, bank and repayment data, including rejected applications.",
];

const BUCKET_RECS: Record<string, string> = {
  kyc_financial_data:
    "Map KYC and financial data across onboarding, KYC, bank statement collection, bureau checks, loan applications, UPI/payment workflows, repayment records and collection notes. Define what is collected, why and who can access it.",
  profiling_underwriting:
    "Document scoring, eligibility and underwriting logic at a business-process level. Identify data inputs, decision points, model owners, review points and customer-impact areas, and make the customer notice clear.",
  consent_notice_rights:
    "Strengthen consent and notice flows. Capture timestamped consent evidence for collection, verification, profiling, bureau checks, partner sharing and marketing/cross-sell use.",
  vendor_partner_agent_sharing:
    "Create a partner and agent register covering lenders, banks, bureaus, KYC providers, account aggregators, payment partners, DSAs, collection agents, call centres, cloud vendors and risk vendors.",
  access_retention_incident:
    "Review access to core systems, CRM, data warehouse, vendor dashboards, Excel exports, WhatsApp groups, call recordings and agent devices. Define retention and incident-response rules for KYC, bureau, bank and repayment data.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "kyc_financial_data",
    "profiling_underwriting",
    "consent_notice_rights",
    "vendor_partner_agent_sharing",
    "access_retention_incident",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your KYC, consent, profiling, partner-sharing, agent-access and retention practices consistent, and set a periodic review."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your fintech or NBFC appears to have basic financial-data controls in place. Your next step is to document these practices, review partner/agent access, evidence consent and define retention rules for KYC, bureau, bank and repayment data.",
  "Moderate Risk":
    "Your fintech or NBFC has some financial-data controls, but several partner, agent, profiling or retention workflows may be informal. Focus first on consent evidence, KYC intake, bureau checks, partner sharing, agent access and old application retention.",
  "High Risk":
    "Your fintech or NBFC may have significant DPDPA exposure across KYC, PAN/Aadhaar, bank data, UPI, bureau records, profiling, DSAs, collection agents, vendor dashboards or old customer records. Your first priority is to control consent, financial-data sharing, profiling, agent access and retention.",
  "Critical Risk":
    "Your fintech or NBFC may have serious DPDPA exposure. This usually happens when KYC, PAN, Aadhaar, bank statements, bureau data, credit scoring, repayment history, collection records, agent access, WhatsApp workflows, Excel exports and vendor platforms are managed informally — without consent evidence, access control, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const fintechNbfcPack: IndustryPack = {
  industry: "fintech-nbfc",
  route: "/assessment/fintech-nbfc",
  reportType: "fintech", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "Fintech / NBFC DPDPA Risk Scan",
    hero: "Your fintech does not just process transactions. It verifies, profiles and shares financial data every day.",
    sub: "From KYC and PAN/Aadhaar to bank statements, UPI data, credit bureau checks, scoring models, DSAs, collection agents, payment partners, call centres and old customer records — fintech and NBFC businesses handle high-impact financial data at every step. This 3-minute scan shows where DPDPA exposure may arise in your financial-data workflows. It collects no customer financial data — only your answers about your processes.",
    cta: "Start Fintech / NBFC Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "KYC",
      "PAN / Aadhaar",
      "Bank Data",
      "Credit Bureau",
      "Profiling",
      "DSAs & Collection Agents",
      "Old Records",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Fintech / NBFC DPDPA Starter Checklist",
    href: "/templates/fintech-nbfc-dpdpa-starter-checklist.pdf",
  },
};

export default fintechNbfcPack;

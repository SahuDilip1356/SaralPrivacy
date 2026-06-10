// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Law Firms & Legal Consultants (7th industry)
// "Law Firm DPDPA Risk Scan" — a client-case-data risk scan.
// Caps for Q1–Q10 sum to 112; the engine normalises by Σ caps automatically.
// Built on the shared engine. Q7's "documented purpose & controlled access" (-4)
// credit option reuses the engine's questionRisk floor-at-0 (added for Schools) —
// no engine change needed.
//
// Thesis: most law firms don't have a confidentiality problem — they have a
// matter-data *control* problem (intake, storage, access, sharing, sensitive
// files, retention, incident readiness).
// Two-lens: exposure = Q1,Q2,Q3,Q4 (44) · control = Q5,Q6,Q7,Q8,Q9,Q10 (68).
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
    key: "client_matter_data",
    label: "Client & matter-data risk",
    meaning: "Client KYC, contracts, affidavits and correspondence may need stronger mapping.",
  },
  {
    key: "case_evidence_sensitivity",
    label: "Case-file & evidence sensitivity risk",
    meaning: "Sensitive or evidence-heavy files may need restricted access.",
  },
  {
    key: "document_sharing_court_workflow",
    label: "Document sharing & court-workflow risk",
    meaning: "WhatsApp, email, court agents and external counsel sharing may create exposure.",
  },
  {
    key: "staff_junior_vendor_access",
    label: "Staff, junior & vendor access risk",
    meaning: "Juniors, interns, clerks or ex-staff access may need review.",
  },
  {
    key: "retention_incident_readiness",
    label: "Retention & incident readiness risk",
    meaning: "Closed matter files and breach-response processes may not be mature.",
  },
];

// option-id groups reused by overrides/flags
const HIGH_RISK_MATTER = ["id_proof", "financial_tax", "employee_hr", "evidence_files", "sensitive_records"];
const SENSITIVE_OR_EVIDENCE = ["evidence_files", "sensitive_records"];
const INFORMAL_INTAKE = ["whatsapp", "email", "informal_evidence_exports"];
const EXTERNAL_WORKFLOW = ["court_clerks", "notary_stamp", "translators", "legaltech"];
const SCATTERED_STORAGE = ["whatsapp", "email_inboxes", "lawyer_devices", "external_drives", "multiple_no_sot"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Practice profile ───────────────────────────────────────────────
  {
    id: "q1",
    badge: "Practice Profile",
    question: "What type of legal work do you handle?",
    helpText: "Select all that apply. This helps estimate your client and matter-data risk profile.",
    whyThisMatters:
      "Different legal practices handle different levels of sensitivity. Family, criminal, employment, litigation, insolvency, tax and real-estate matters often involve high-impact personal data and evidence records.",
    type: "multi",
    cap: 8,
    bucket: "client_matter_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "corporate_commercial", label: "Corporate / commercial advisory", riskPoints: 3 },
      { id: "litigation_disputes", label: "Litigation / dispute resolution", riskPoints: 5 },
      { id: "employment_labour", label: "Employment / labour law matters", riskPoints: 5 },
      { id: "family_matrimonial", label: "Family law / matrimonial matters", riskPoints: 7, badge: "SENSITIVE", badgeColor: "amber" },
      { id: "criminal", label: "Criminal law matters", riskPoints: 7, badge: "SENSITIVE", badgeColor: "amber" },
      { id: "real_estate_property", label: "Real-estate / property documentation", riskPoints: 5 },
      { id: "ip_trademark", label: "IP / trademark / copyright matters", riskPoints: 3 },
      { id: "tax_regulatory", label: "Tax / regulatory litigation", riskPoints: 5 },
      { id: "company_law", label: "Company law / secretarial / compliance support", riskPoints: 3 },
      { id: "arbitration_insolvency", label: "Arbitration / insolvency / recovery matters", riskPoints: 5 },
      { id: "lpo", label: "Legal-process outsourcing / document review", riskPoints: 6 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Client & matter documents ──────────────────────────────────────
  {
    id: "q2",
    badge: "Client & Matter Data Risk",
    question: "What client or matter documents do you collect or store?",
    helpText: "Select all identity, financial, employment, property, court, evidence or sensitive documents your legal practice collects or stores.",
    whyThisMatters:
      "Legal files often contain far more personal data than a business realises. Evidence, affidavits, financial records, ID proofs, employee records and family/criminal records can create significant privacy exposure.",
    type: "multi",
    cap: 14,
    bucket: "client_matter_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "client_contact", label: "Client name, phone number, email and address", riskPoints: 2 },
      { id: "id_proof", label: "PAN, Aadhaar, passport or other ID proof", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "company_kyc", label: "Company KYC, board documents or MCA records", riskPoints: 3 },
      { id: "contracts_notices", label: "Contracts, agreements, notices or correspondence", riskPoints: 3 },
      { id: "affidavits", label: "Affidavits, declarations or notarised documents", riskPoints: 4 },
      { id: "financial_tax", label: "Bank statements, financial records or tax documents", riskPoints: 5 },
      { id: "employee_hr", label: "Employee records, salary details or HR documents", riskPoints: 5 },
      { id: "property_docs", label: "Property documents, rent/sale agreements or title papers", riskPoints: 5 },
      { id: "court_records", label: "Court pleadings, petitions, replies or orders", riskPoints: 4 },
      { id: "evidence_files", label: "Evidence files, screenshots, call records, photos or videos", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "sensitive_records", label: "Medical, family, criminal, disciplinary or sensitive personal records", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other client/matter documents", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q3 Document intake ────────────────────────────────────────────────
  {
    id: "q3",
    badge: "Matter Intake Risk",
    question: "How do clients usually share documents, instructions or evidence with your firm?",
    helpText: "Select all channels used for client instructions, document collection, evidence sharing and matter intake.",
    whyThisMatters:
      "Legal document intake is often highly informal. WhatsApp, email, screenshots, chat exports and shared folders make it harder to control access, retention, confidentiality and deletion.",
    type: "multi",
    cap: 10,
    bucket: "document_sharing_court_workflow",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "secure_portal", label: "Secure client portal or structured upload link", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "email", label: "Email attachments", riskPoints: 4 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "shared_cloud", label: "Shared Google Drive / OneDrive / Dropbox folders", riskPoints: 5 },
      { id: "physical_scanned", label: "Physical documents later scanned by your team", riskPoints: 3 },
      { id: "clerk_junior_collection", label: "Documents collected by clerk / junior / field staff", riskPoints: 4 },
      { id: "informal_evidence_exports", label: "Screenshots, audio/video files or chat exports sent informally", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q4 File storage ───────────────────────────────────────────────────
  {
    id: "q4",
    badge: "File Storage Risk",
    question: "Where are client files and matter records stored?",
    helpText: "Select all systems, folders, devices, chats or physical locations where client and matter documents are stored.",
    whyThisMatters:
      "A legal matter file often gets duplicated across email, laptop folders, cloud drives, WhatsApp and physical files. This creates access, leakage and retention complexity.",
    type: "multi",
    cap: 12,
    bucket: "staff_junior_vendor_access",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "dms_legal_software", label: "Document management system / legal practice software with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "cloud_mfa", label: "Google Drive / OneDrive / Dropbox with MFA and restricted access", riskPoints: 1, badge: "GOOD", badgeColor: "green" },
      { id: "cloud_no_review", label: "Shared cloud folders without regular access review", riskPoints: 5 },
      { id: "email_inboxes", label: "Email inboxes", riskPoints: 5 },
      { id: "lawyer_devices", label: "Staff or lawyer laptops/desktops", riskPoints: 6 },
      { id: "whatsapp", label: "WhatsApp chats or groups", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "external_drives", label: "External hard drives / pen drives", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "physical_only", label: "Physical files only", riskPoints: 2 },
      { id: "multiple_no_sot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q5 Internal access ────────────────────────────────────────────────
  {
    id: "q5",
    badge: "Junior / Staff Access Risk",
    question: "Who can access client files inside your law firm or legal practice?",
    helpText: "This includes partners, associates, juniors, interns, paralegals, clerks, support staff and ex-staff.",
    whyThisMatters:
      "Law firms rely on juniors and interns, but broad or lingering access to client files can create serious privacy and confidentiality exposure.",
    type: "single",
    cap: 12,
    bucket: "staff_junior_vendor_access",
    layer: "control",
    options: [
      { id: "matter_based_reviewed", label: "Access is matter-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_review", label: "Lawyers and core staff have access, but review is informal", riskPoints: 3 },
      { id: "juniors_interns_access", label: "Juniors, interns or paralegals can access many matter folders", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "most_staff_access", label: "Most staff can access most client files", riskPoints: 9, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_access", label: "Ex-staff, former interns or old associates may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q6 Client notice ──────────────────────────────────────────────────
  {
    id: "q6",
    badge: "Client Notice & Engagement Terms",
    question: "Does your engagement letter, vakalatnama process, onboarding email or client terms explain how client data and documents will be used, stored, shared and retained?",
    helpText: "This may be part of your engagement letter, onboarding email, client terms, privacy notice or professional communication.",
    whyThisMatters:
      "Legal clients may assume confidentiality, but DPDPA readiness requires clear communication about collection, use, sharing, storage and retention of personal data.",
    type: "single",
    cap: 10,
    bucket: "client_matter_data",
    layer: "control",
    options: [
      { id: "clear_terms", label: "Yes, our engagement letter/client terms clearly explain this", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "generic_not_updated", label: "Partially, but it is generic or not updated for DPDPA", riskPoints: 4 },
      { id: "only_when_asked", label: "We explain it only when clients ask", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "no_documentation", label: "No, we do not document this clearly", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q7 External sharing ───────────────────────────────────────────────
  {
    id: "q7",
    badge: "Court, Counsel & Vendor Sharing",
    question: "Do you share client documents or personal data with external parties for legal work?",
    helpText: "Select all external counsel, filing agents, court systems, notaries, experts, translators, vendors or legal-tech tools involved in matter work. Tick the documented-controls option too if it applies — it lowers this risk.",
    whyThisMatters:
      "Legal work naturally requires sharing. The risk is not sharing itself. The risk is uncontrolled sharing without purpose, access limitation, client awareness or document-tracking.",
    type: "multi",
    cap: 14,
    bucket: "document_sharing_court_workflow",
    layer: "control",
    // "no_external_sharing" and "not_sure" clear the rest. "documented_controlled"
    // is a credit modifier (-4) that intentionally COMBINES with the sharing
    // selections — the engine floors the question at 0.
    mutuallyExclusive: ["no_external_sharing", "not_sure"],
    options: [
      { id: "external_counsel", label: "External senior counsel / briefing counsel", riskPoints: 4 },
      { id: "court_clerks", label: "Court clerks / filing agents", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "notary_stamp", label: "Notary / stamp / registration agents", riskPoints: 5 },
      { id: "translators", label: "Translators / transcription vendors", riskPoints: 5 },
      { id: "experts_ca_valuation", label: "Chartered accountants / valuation / expert consultants", riskPoints: 4 },
      { id: "opposite_mediator", label: "Opposite party / mediators / arbitrators / tribunals", riskPoints: 5 },
      { id: "govt_court_efiling", label: "Government portals / court e-filing systems", riskPoints: 3 },
      { id: "courier", label: "Courier / document delivery providers", riskPoints: 3 },
      { id: "legaltech", label: "Legal tech tools / e-discovery / document review platforms", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "documented_controlled", label: "We share only with documented purpose and controlled access", riskPoints: -4, badge: "GOOD", badgeColor: "green" },
      { id: "no_external_sharing", label: "We do not share client documents externally", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q8 Sensitive matter handling ──────────────────────────────────────
  {
    id: "q8",
    badge: "Sensitive Case File Risk",
    question: "How do you manage sensitive case files such as family, criminal, employment, medical, whistleblower, harassment or disciplinary matters?",
    helpText: "Choose the option closest to your current sensitive-matter access and classification practice.",
    whyThisMatters:
      "Certain legal matters contain highly sensitive personal stories, allegations, medical facts, employment records, family details and criminal claims. These need stricter access and handling.",
    type: "single",
    cap: 12,
    bucket: "case_evidence_sensitivity",
    layer: "control",
    options: [
      { id: "restricted_matter_team", label: "Sensitive matters are clearly marked and access is restricted to matter team only", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "senior_informal", label: "Senior lawyers control sensitive files, but the process is informal", riskPoints: 4 },
      { id: "stored_regular_files", label: "Sensitive files are stored with regular matter files", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "no_classification", label: "We do not separately classify or restrict sensitive case files", riskPoints: 12, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_applicable", label: "Not applicable — we do not handle such matters", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q9 Closed-matter retention ────────────────────────────────────────
  {
    id: "q9",
    badge: "Closed Matter Retention",
    question: "How long do you retain closed matter files, evidence records, ID proofs, drafts and client correspondence?",
    helpText: "The issue is not retention itself. The issue is uncontrolled indefinite retention without documented purpose, access review or archival rules.",
    whyThisMatters:
      "The issue is not that law firms retain files. The risk is indefinite retention without purpose, access review, archival rules or client-return/deletion handling.",
    type: "single",
    cap: 10,
    bucket: "retention_incident_readiness",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule based on legal, professional and limitation-period needs", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_convenience", label: "We retain most closed matter files for many years for convenience or reference", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most client files indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if client files, evidence, email inboxes, WhatsApp chats, cloud folders or legal software access are compromised or shared with the wrong person?",
    helpText: "This checks whether your firm can respond quickly to wrong-recipient sharing, exposed folders, unauthorised access or compromised matter files.",
    whyThisMatters:
      "Wrong-recipient emails, exposed cloud folders, misplaced case files, compromised WhatsApp accounts or ex-staff access can create serious client, professional and DPDPA exposure.",
    type: "single",
    cap: 10,
    bucket: "retention_incident_readiness",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_partner_it", label: "Partner/senior lawyer/IT vendor would handle it informally", riskPoints: 4 },
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
const hasSensitiveOrEvidence = (a: IAAnswers) => anyOf(a, "q2", SENSITIVE_OR_EVIDENCE);
const hasExternalWorkflowNoControl = (a: IAAnswers) =>
  anyOf(a, "q7", EXTERNAL_WORKFLOW) && !has(a, "q7", "documented_controlled");

// ── Overrides (raise-only) ────────────────────────────────────────────────────
// Max band reached here is High Risk — Critical is reachable purely via raw score.
// Override 5 (external sharing without controls) has a conditional minimum:
// Moderate alone, escalating to High with sensitive/evidence data — expressed as
// a paired entry sharing one flag text.

const OVERRIDES: IAOverride[] = [
  {
    id: "sensitive_files_unrestricted",
    minBand: "High Risk",
    severity: 9,
    test: (a) => anyOf(a, "q8", ["stored_regular_files", "no_classification"]),
    flag: "Sensitive case files (family, criminal, employment, medical, whistleblower) aren't separated or access-restricted from regular matter files.",
  },
  {
    id: "evidence_informal_intake",
    minBand: "High Risk",
    severity: 9,
    test: (a) => hasSensitiveOrEvidence(a) && anyOf(a, "q3", INFORMAL_INTAKE),
    flag: "Evidence or sensitive records arrive through WhatsApp, email or informal screenshots/chat exports — hard to govern, track or delete.",
  },
  {
    id: "ex_staff_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q5", "ex_staff_access"),
    flag: "Ex-staff, former interns or old associates may still have access to client files, cloud folders or legal-practice systems.",
  },
  {
    id: "no_notice_highrisk",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q6", "no_documentation") && anyOf(a, "q2", HIGH_RISK_MATTER),
    flag: "High-risk matter data (ID proofs, financial, employee, evidence or sensitive records) is held without clear client notice on how it's used and shared.",
  },
  {
    id: "indefinite_sensitive",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && hasSensitiveOrEvidence(a),
    flag: "Evidence and sensitive client files are kept indefinitely with no retention, archival or deletion rule.",
  },
  {
    id: "no_breach_scattered",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && anyOf(a, "q4", SCATTERED_STORAGE),
    flag: "Matter files are scattered across WhatsApp, inboxes, laptops and drives with no process for a wrong-recipient share or a system compromise.",
  },
  // Override 5 — external sharing without controls. Moderate alone; High with sensitive/evidence.
  {
    id: "external_no_control",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => hasExternalWorkflowNoControl(a),
    flag: "Client documents go to court clerks, notaries, translators or legal-tech tools without documented purpose or controlled access.",
  },
  {
    id: "external_no_control_sensitive",
    minBand: "High Risk",
    severity: 7,
    test: (a) => hasExternalWorkflowNoControl(a) && hasSensitiveOrEvidence(a),
    flag: "Client documents go to court clerks, notaries, translators or legal-tech tools without documented purpose or controlled access.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "data_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["id_proof", "financial_tax", "employee_hr", "evidence_files", "sensitive_records", "property_docs"]),
    flag: "Your firm may hold PAN/Aadhaar/passport, financial, employee, property, evidence and sensitive records without a clear matter-data map.",
  },
  {
    id: "informal_intake",
    severity: 6,
    test: (a) => anyOf(a, "q3", ["whatsapp", "email", "informal_evidence_exports", "shared_cloud", "multiple_no_standard"]),
    flag: "Client documents may enter through WhatsApp, email, shared folders and informal exports without a standard intake process.",
  },
  {
    id: "storage_sprawl",
    severity: 6,
    test: (a) => anyOf(a, "q4", SCATTERED_STORAGE),
    flag: "Matter files may be duplicated across email, laptops, WhatsApp, external drives and multiple places with no single source of truth.",
  },
  {
    id: "broad_access",
    severity: 6,
    test: (a) => anyOf(a, "q5", ["juniors_interns_access", "most_staff_access", "ex_staff_access"]),
    flag: "Juniors, interns, paralegals or former staff may have broader access to client files than necessary.",
  },
  {
    id: "external_sharing_breadth",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["external_counsel", "court_clerks", "notary_stamp", "translators", "experts_ca_valuation", "legaltech"]),
    flag: "Matter documents may be sent to external counsel, clerks, notaries, translators, experts or legal-tech tools without enough tracking.",
  },
  {
    id: "sensitive_handling_gap",
    severity: 6,
    test: (a) => anyOf(a, "q8", ["senior_informal", "stored_regular_files", "no_classification"]),
    flag: "Sensitive matters (family, criminal, employment, medical, whistleblower) may not be classified or access-restricted.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["many_years_convenience", "indefinitely"]),
    flag: "Closed matter files, evidence, drafts and ID proofs may be retained indefinitely without a documented schedule.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Map your client documents and matter-data flows — onboarding, KYC, contracts, notices, pleadings, affidavits, financial, employment and evidence records — and define who can access what.",
  "Restrict sensitive case files (family, criminal, employment, medical, whistleblower, harassment, disciplinary) to the matter team with clear marking and access control.",
  "Standardise WhatsApp / email / shared-folder usage for client documents — define approved intake and sharing channels and reduce informal evidence exports.",
  "Review matter-file access for juniors, interns, paralegals, clerks, external counsel and ex-staff — move to matter-based, need-based access and remove old access promptly.",
  "Define retention and incident-response rules for closed matter files, evidence, ID proofs, drafts, correspondence, cloud folders and WhatsApp/email incidents.",
];

const BUCKET_RECS: Record<string, string> = {
  case_evidence_sensitivity:
    "Create a sensitive-matter handling process. Mark family, criminal, employment, medical, whistleblower, harassment, disciplinary and evidence-heavy matters as restricted-access files.",
  client_matter_data:
    "Map your client and matter data across onboarding, KYC, contracts, notices, pleadings, affidavits, financial records, employment records and correspondence. Update engagement letters to explain data use, sharing, storage and retention.",
  document_sharing_court_workflow:
    "Standardise legal document sharing. Define approved channels for client uploads, court filing, external counsel, notaries, translators, experts, clerks and filing agents. Reduce uncontrolled WhatsApp and email sharing for sensitive records.",
  staff_junior_vendor_access:
    "Review matter-file access for juniors, interns, paralegals, external consultants, clerks and ex-staff. Remove old access and shift toward matter-based access rights.",
  retention_incident_readiness:
    "Define retention and incident-response rules for closed matters, evidence files, ID proofs, drafts, correspondence, cloud folders and WhatsApp/email incidents.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "case_evidence_sensitivity",
    "client_matter_data",
    "document_sharing_court_workflow",
    "staff_junior_vendor_access",
    "retention_incident_readiness",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your intake, access, sharing and sensitive-matter practices consistent, and set a periodic review of retention and incident response."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your law firm appears to have basic client and matter-data controls in place. Your next step is to document these practices, review sensitive-matter access, control external sharing and define closed-file retention and incident-response processes.",
  "Moderate Risk":
    "Your law firm has some client-data controls, but several practices may be informal. Focus first on matter intake, client notice, cloud access, junior/intern access, external sharing and closed-file retention.",
  "High Risk":
    "Your law firm may have significant DPDPA exposure across client identity documents, case files, evidence records, juniors/intern access, WhatsApp/email sharing, court/vendor workflows or old matter-file retention. Your first priority is to control sensitive files, matter access, external sharing and closed-file retention.",
  "Critical Risk":
    "Your law firm may have serious DPDPA exposure. This usually happens when client KYC, evidence files, sensitive matters, affidavits, court documents, WhatsApp instructions, email attachments, cloud folders, junior/intern access, external vendors and closed matter records are managed informally — without notice, access control, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const lawFirmsPack: IndustryPack = {
  industry: "law-firms",
  route: "/assessment/law-firms",
  reportType: "law-firm", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "Law Firm DPDPA Risk Scan",
    hero: "Your law firm does not just protect client confidentiality. It stores, shares and retains client data every day.",
    sub: "From client KYC, affidavits and contracts to evidence files, WhatsApp instructions, email attachments, court filings, junior access, external counsel, filing agents and closed matter records — legal practices handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise in your client and matter-data workflows. It collects no client documents — only your answers about your processes.",
    cta: "Start Law Firm Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Client KYC",
      "PAN / Aadhaar",
      "Case Files",
      "Evidence Records",
      "Affidavits",
      "WhatsApp Instructions",
      "Court Filing",
      "Junior Access",
      "External Counsel",
      "Closed Matters",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Law Firm DPDPA Starter Checklist",
    href: "/templates/law-firm-dpdpa-starter-checklist.pdf",
  },
};

export default lawFirmsPack;

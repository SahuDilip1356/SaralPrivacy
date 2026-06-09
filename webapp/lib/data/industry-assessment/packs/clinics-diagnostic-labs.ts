// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Clinics & Diagnostic Labs pack (5th industry)
// "Clinic & Diagnostic Lab DPDPA Risk Scan" — a patient-data movement risk scan.
// Caps for Q1–Q10 sum to 110; the engine normalises by Σ caps automatically.
// Built on the shared engine (zero engine changes). See:
//   docs/SaralPrivacy_Clinics_Diagnostic_Labs_Assessment_v2_Spec.md
//
// Thesis: most clinics don't have a patient-care problem — they have a
// patient-data *movement* problem (intake, report sharing, recipient
// verification, staff/vendor access, retention, incident readiness).
// Two-lens: exposure = Q1,Q2,Q3,Q7 (44) · control = Q4,Q5,Q6,Q8,Q9,Q10 (66).
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
    key: "patient_data_collection",
    label: "Patient data collection risk",
    meaning: "Patient data may enter through informal or scattered intake channels.",
  },
  {
    key: "health_data_sensitivity",
    label: "Health data sensitivity risk",
    meaning: "Reports, prescriptions or sensitive treatment data may require stronger controls.",
  },
  {
    key: "report_sharing_communication",
    label: "Report sharing & communication risk",
    meaning: "WhatsApp, email, family-member or partner sharing may create exposure.",
  },
  {
    key: "system_staff_vendor_access",
    label: "System, staff & vendor access risk",
    meaning: "Staff, software and vendor access may need review.",
  },
  {
    key: "retention_incident_readiness",
    label: "Retention & incident readiness risk",
    meaning: "Old reports and breach-response processes may not be mature.",
  },
];

// option-id groups reused by overrides/flags
const SENSITIVE_DATA = ["lab_reports", "radiology_images", "prescriptions_notes", "medical_history", "sensitive_treatment"];
const WHATSAPP_EMAIL_SHARING = ["whatsapp_patient", "whatsapp_family", "email_patient", "multiple_preference"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Healthcare profile ─────────────────────────────────────────────
  {
    id: "q1",
    badge: "Healthcare Profile",
    question: "What type of healthcare service do you provide?",
    helpText: "Select all that apply. This helps estimate your patient-data risk profile.",
    whyThisMatters:
      "Different healthcare models create different levels of data sensitivity. Fertility, mental health, radiology, diagnostic and home-collection workflows usually carry higher exposure.",
    type: "multi",
    cap: 8,
    bucket: "patient_data_collection",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "single_doctor", label: "Single-doctor clinic", riskPoints: 2 },
      { id: "multi_speciality", label: "Multi-speciality clinic", riskPoints: 4 },
      { id: "speciality_clinic", label: "Dental / eye / physiotherapy / speciality clinic", riskPoints: 3 },
      { id: "diagnostic_lab", label: "Diagnostic lab / pathology lab", riskPoints: 5 },
      { id: "radiology", label: "Radiology / imaging centre", riskPoints: 5 },
      { id: "home_collection", label: "Home sample collection service", riskPoints: 5 },
      { id: "fertility_ivf", label: "Fertility / IVF / reproductive health clinic", riskPoints: 7, badge: "SENSITIVE", badgeColor: "amber" },
      { id: "mental_health", label: "Mental health / counselling / psychiatry clinic", riskPoints: 7, badge: "SENSITIVE", badgeColor: "amber" },
      { id: "clinic_chain", label: "Clinic chain / multiple branches", riskPoints: 6 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Patient data ───────────────────────────────────────────────────
  {
    id: "q2",
    badge: "Patient Data Risk",
    question: "What patient data do you collect or store?",
    helpText: "Select all patient contact, medical, billing, report, insurance or family-contact data your clinic or lab collects.",
    whyThisMatters:
      "Patient data is not just contact information. Reports, prescriptions, diagnosis, images, insurance, family contacts and sensitive treatment details create much higher exposure.",
    type: "multi",
    cap: 14,
    bucket: "health_data_sensitivity",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact", label: "Patient name, phone number and email", riskPoints: 2 },
      { id: "demographic_address", label: "Age, gender and address", riskPoints: 3 },
      { id: "appointment_visit", label: "Appointment history and visit records", riskPoints: 3 },
      { id: "prescriptions_notes", label: "Prescriptions and doctor notes", riskPoints: 5 },
      { id: "lab_reports", label: "Lab reports or diagnostic test results", riskPoints: 6 },
      { id: "radiology_images", label: "Radiology images, scans or diagnostic images", riskPoints: 6 },
      { id: "billing_insurance", label: "Billing, payment or insurance details", riskPoints: 4 },
      { id: "emergency_family", label: "Emergency contact or family-member details", riskPoints: 4 },
      { id: "id_proof", label: "Aadhaar, PAN or other ID proof", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "medical_history", label: "Medical history, diagnosis or chronic condition details", riskPoints: 6 },
      { id: "sensitive_treatment", label: "Fertility, pregnancy, mental health or sensitive treatment data", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other patient data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q3 Patient intake ─────────────────────────────────────────────────
  {
    id: "q3",
    badge: "Patient Intake Risk",
    question: "How do patients usually share information or documents with your clinic/lab?",
    helpText: "Select all channels used by reception, doctors, lab staff or home collection teams.",
    whyThisMatters:
      "Unstructured patient intake through WhatsApp, phone calls, paper forms and home collection creates access, accuracy, retention and breach-response challenges.",
    type: "multi",
    cap: 10,
    bucket: "patient_data_collection",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "patient_portal", label: "Clinic/lab registration system or patient portal", riskPoints: 1, badge: "GOOD", badgeColor: "green" },
      { id: "paper_forms", label: "Paper registration forms later digitised", riskPoints: 3 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "email", label: "Email attachments", riskPoints: 4 },
      { id: "phone_reception", label: "Phone calls handled by reception staff", riskPoints: 3 },
      { id: "doctor_referral", label: "Doctor referral slips or prescriptions", riskPoints: 3 },
      { id: "home_collection_staff", label: "Home collection staff collect forms/documents", riskPoints: 5 },
      { id: "walkin_desk", label: "Walk-in desk entries by reception staff", riskPoints: 3 },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q4 Report sharing ─────────────────────────────────────────────────
  {
    id: "q4",
    badge: "Report Sharing Risk",
    question: "How are prescriptions, lab reports or diagnostic images shared with patients?",
    helpText: "Select all methods used to share reports, prescriptions, scans or diagnostic results.",
    whyThisMatters:
      "Diagnostic reports are often shared for convenience, but WhatsApp and family-member sharing create strong privacy and confidentiality risks if not controlled.",
    type: "multi",
    cap: 14,
    bucket: "report_sharing_communication",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "patient_portal", label: "Secure patient portal or app login", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "printed_patient", label: "Printed report handed to patient", riskPoints: 2 },
      { id: "email_patient", label: "Email to patient", riskPoints: 4 },
      { id: "whatsapp_patient", label: "WhatsApp to patient", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "whatsapp_family", label: "WhatsApp to family member/caregiver", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "referring_doctor", label: "Shared with referring doctor", riskPoints: 4 },
      { id: "software_link", label: "Shared through lab/clinic software link", riskPoints: 2 },
      { id: "field_staff", label: "Shared by home collection agent or field staff", riskPoints: 6 },
      { id: "multiple_preference", label: "Multiple methods depending on patient preference", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q5 Recipient verification ─────────────────────────────────────────
  {
    id: "q5",
    badge: "Recipient Verification",
    question: "How do you verify that reports or medical information are shared with the correct patient/person?",
    helpText: "Choose the option closest to your current report-sharing practice.",
    whyThisMatters:
      "A wrong WhatsApp number, email ID or family-recipient assumption can expose sensitive medical information.",
    type: "single",
    cap: 10,
    bucket: "report_sharing_communication",
    layer: "control",
    options: [
      { id: "verify_identity", label: "We verify patient identity/contact details before sharing reports", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_verification", label: "We verify in most cases, but the process is informal", riskPoints: 3 },
      { id: "rely_registered_contact", label: "We rely on the phone number or WhatsApp chat used during registration", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "share_on_request", label: "Reports are shared as requested by patient/family/doctor without formal verification", riskPoints: 9, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q6 Staff access ───────────────────────────────────────────────────
  {
    id: "q6",
    badge: "Staff Access Risk",
    question: "Who can access patient records inside your clinic or lab?",
    helpText: "This includes doctors, reception staff, billing teams, lab technicians, support staff and ex-staff.",
    whyThisMatters:
      "In clinics and labs, reception desks, lab technicians, billing teams and old staff accounts can become major privacy-risk points.",
    type: "single",
    cap: 12,
    bucket: "system_staff_vendor_access",
    layer: "control",
    options: [
      { id: "role_based_reviewed", label: "Access is role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "core_informal", label: "Doctors and core staff have access, but review is informal", riskPoints: 3 },
      { id: "broad_staff_access", label: "Reception, billing, lab and support staff can access most records", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "shared_logins", label: "Multiple staff share system logins or passwords", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_access", label: "Ex-staff access may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q7 Systems & vendors ──────────────────────────────────────────────
  {
    id: "q7",
    badge: "System, Tool & Vendor Risk",
    question: "Which systems, tools or vendors process patient data?",
    helpText: "Select all software, labs, partners, TPAs, home collection tools or IT vendors involved in patient-data processing.",
    whyThisMatters:
      "Patient data often moves to software providers, outsourced labs, home collection partners, TPAs and IT support teams. These must be visible and governed.",
    type: "multi",
    cap: 12,
    bucket: "system_staff_vendor_access",
    layer: "exposure",
    // Note: "not_sure" is intentionally NOT exclusive here — a clinic can know
    // some vendors but be unsure about others (keeps Override 4 live). Only the
    // "no external tools" answer clears the rest.
    mutuallyExclusive: ["no_external_tools"],
    options: [
      { id: "clinic_his", label: "Clinic management software / HIS", riskPoints: 2 },
      { id: "lis", label: "Lab Information System / LIS", riskPoints: 3 },
      { id: "pacs", label: "Radiology / PACS / imaging software", riskPoints: 4 },
      { id: "billing_payment", label: "Billing or payment software", riskPoints: 2 },
      { id: "appointment_platform", label: "Appointment booking platform", riskPoints: 3 },
      { id: "whatsapp_sms_email", label: "WhatsApp Business / SMS / email tool", riskPoints: 5 },
      { id: "outsourced_lab", label: "Outsourced lab / referral lab", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "home_collection_partner", label: "Home collection partner or field-agent app", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "insurance_tpa", label: "Insurance / TPA / corporate health partner", riskPoints: 5 },
      { id: "it_vendor", label: "IT vendor / software support team", riskPoints: 4 },
      { id: "no_external_tools", label: "We do not use external tools or vendors", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q8 External sharing ───────────────────────────────────────────────
  {
    id: "q8",
    badge: "Doctor / Partner Sharing",
    question: "Do you share patient data with doctors, hospitals, insurance/TPA, corporates or referral partners?",
    helpText: "This includes referring doctors, hospitals, insurance desks, TPAs, corporate health clients and referral networks.",
    whyThisMatters:
      "Healthcare workflows naturally involve referrals, but patient-data sharing must be controlled, purposeful and defensible.",
    type: "single",
    cap: 10,
    bucket: "report_sharing_communication",
    layer: "control",
    options: [
      { id: "authorised_purpose", label: "Yes, but only with patient authorisation or clear treatment/payment purpose", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_authorisation", label: "Yes, but authorisation/notice is informal", riskPoints: 4 },
      { id: "share_on_partner_request", label: "Yes, reports/details are shared when partners or referring doctors ask", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_external_sharing", label: "No, we do not share patient data externally", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Patient Record Retention",
    question: "How long do you retain old prescriptions, reports, images and patient records?",
    helpText: "The issue is not retention itself. The issue is uncontrolled indefinite retention without documented purpose, access control or review.",
    whyThisMatters:
      "The problem is not medical-record retention itself. The risk is uncontrolled indefinite retention without defined purpose, access control or review.",
    type: "single",
    cap: 10,
    bucket: "retention_incident_readiness",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule based on clinical, legal and operational requirements", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_convenience", label: "We retain old reports and patient records for many years for convenience", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most patient records indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if patient reports, prescriptions, WhatsApp chats, lab software or clinic systems are compromised or shared with the wrong person?",
    helpText: "This checks whether your clinic or lab can respond quickly to wrong-report sharing, unauthorised access or exposed patient data.",
    whyThisMatters:
      "Wrong report sharing, compromised WhatsApp accounts, exposed lab software or unauthorised access can quickly become a serious patient-trust and DPDPA issue.",
    type: "single",
    cap: 10,
    bucket: "retention_incident_readiness",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_senior_it", label: "Senior doctor/admin/IT vendor would handle it informally", riskPoints: 4 },
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
// Max band reached here is High Risk — no Critical override; the engine still
// allows Critical purely via raw score.

const OVERRIDES: IAOverride[] = [
  {
    id: "sensitive_whatsapp",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q2", "sensitive_treatment") && anyOf(a, "q4", ["whatsapp_patient", "whatsapp_family"]),
    flag: "Fertility, mental-health or other sensitive treatment data is being shared over WhatsApp — high confidentiality risk.",
  },
  {
    id: "family_share_no_verify",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q4", "whatsapp_family") && has(a, "q5", "share_on_request"),
    flag: "Reports go to family/caregivers over WhatsApp without verifying the recipient — a wrong-recipient exposure.",
  },
  {
    id: "breach_process_missing",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && anyOf(a, "q4", WHATSAPP_EMAIL_SHARING),
    flag: "Reports are shared via WhatsApp/email with no process for wrong-recipient sharing or a system compromise.",
  },
  {
    id: "indefinite_sensitive",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && anyOf(a, "q2", SENSITIVE_DATA),
    flag: "Lab reports, images and prescriptions are kept indefinitely with no retention or deletion rule.",
  },
  {
    id: "shared_or_exstaff_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q6", ["shared_logins", "ex_staff_access"]),
    flag: "Shared logins or ex-staff access to clinic/lab systems can expose patient records.",
  },
  {
    id: "vendor_uncertainty",
    minBand: "High Risk",
    severity: 7,
    test: (a) => anyOf(a, "q7", ["outsourced_lab", "home_collection_partner"]) && has(a, "q7", "not_sure"),
    flag: "Patient data goes to outsourced labs or home-collection partners with limited visibility over who processes it.",
  },
  {
    id: "external_on_request",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q8", "share_on_partner_request"),
    flag: "Patient details are shared whenever partners or referring doctors ask, without authorisation or notice.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "scattered_intake",
    severity: 6,
    test: (a) => anyOf(a, "q3", ["whatsapp", "phone_reception", "paper_forms", "home_collection_staff", "walkin_desk", "multiple_no_standard"]),
    flag: "Patient data may enter through paper forms, WhatsApp, phone calls, home collection and reception entries without a standard intake process.",
  },
  {
    id: "sensitive_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["sensitive_treatment", "medical_history", "lab_reports", "radiology_images"]),
    flag: "Lab reports, prescriptions, radiology images, diagnosis or chronic-condition details create high privacy sensitivity.",
  },
  {
    id: "informal_report_sharing",
    severity: 6,
    test: (a) => anyOf(a, "q4", WHATSAPP_EMAIL_SHARING),
    flag: "Patient reports may be shared through WhatsApp or email without enough verification of the recipient.",
  },
  {
    id: "broad_access",
    severity: 5,
    test: (a) => anyOf(a, "q6", ["broad_staff_access", "shared_logins", "ex_staff_access"]),
    flag: "Reception, billing, lab, support or home-collection staff may have broader patient-record access than necessary.",
  },
  {
    id: "vendor_sprawl",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["outsourced_lab", "home_collection_partner", "insurance_tpa", "it_vendor"]),
    flag: "Outsourced labs, home collection partners, TPAs or IT vendors may process patient data without clear visibility.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["many_years_convenience", "indefinitely"]),
    flag: "Old patient reports, prescriptions and diagnostic images may be retained indefinitely without a documented schedule.",
  },
  {
    id: "no_incident_process",
    severity: 5,
    test: (a) => anyOf(a, "q10", ["case_by_case", "no_standard_process"]),
    flag: "Your clinic or lab may not have a standard process for wrong-report sharing, system compromise or unauthorised access.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — brief §13.
const FIVE_CONTROLS = [
  "Standardise patient intake and registration channels — define approved ways to collect patient details, prescriptions, ID proof, billing and referral documents instead of scattered WhatsApp, phone and paper intake.",
  "Verify recipients before sharing reports by WhatsApp or email — confirm the patient's identity/contact, and set clear rules for sharing with family members or caregivers.",
  "Restrict access for reception, billing, lab and support staff — use role-based, need-based access, avoid shared logins, and remove ex-staff access promptly.",
  "Review outsourced labs, home collection agents, TPAs and IT vendors — keep a register of who processes patient data and put data-handling terms in place.",
  "Define retention and incident-response rules for reports, prescriptions and diagnostic images — including wrong-recipient sharing, WhatsApp exposure and system compromise.",
];

const BUCKET_RECS: Record<string, string> = {
  report_sharing_communication:
    "Control report sharing. Verify recipient details before sending reports, reduce informal WhatsApp sharing, define rules for family-member/caregiver sharing, and document when reports are shared with doctors or partners.",
  health_data_sensitivity:
    "Apply stronger controls to sensitive health data. Limit access to reports, prescriptions, diagnostic images, diagnosis details, and fertility, pregnancy, mental-health or chronic-condition information.",
  system_staff_vendor_access:
    "Create a system and vendor register covering clinic software, LIS/HIS, imaging tools, WhatsApp/SMS/email tools, outsourced labs, home collection agents, TPAs and IT vendors. Review access rights and remove ex-staff access.",
  patient_data_collection:
    "Standardise patient registration and intake. Define approved channels for collecting patient details, prescriptions, ID proof, billing and referral documents, and reduce scattered intake through WhatsApp, phone calls and paper forms.",
  retention_incident_readiness:
    "Define retention and incident-response rules for patient records — old reports, prescriptions, images, WhatsApp chats, emails, access incidents and wrong-recipient report sharing.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "report_sharing_communication",
    "health_data_sensitivity",
    "system_staff_vendor_access",
    "patient_data_collection",
    "retention_incident_readiness",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your report-sharing, access and vendor practices consistent, and set a periodic review of retention and incident response."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — brief §12 ────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your clinic or diagnostic lab appears to have basic patient-data controls in place. Your next step is to document these practices, review report-sharing channels, confirm staff access controls and maintain a clear retention and incident-response process.",
  "Moderate Risk":
    "Your clinic or diagnostic lab has some patient-data controls, but several practices may be informal. Focus first on standardising patient intake, controlling WhatsApp/email report sharing, reviewing staff access and defining retention rules for old reports and prescriptions.",
  "High Risk":
    "Your clinic or diagnostic lab may have significant DPDPA exposure across patient records, prescriptions, lab reports, WhatsApp sharing, staff access, vendor tools or old report retention. Your first priority is to control report sharing, verify recipients, restrict access and create a breach-response process.",
  "Critical Risk":
    "Your clinic or diagnostic lab may have serious DPDPA exposure. This usually happens when prescriptions, lab reports, diagnostic images, WhatsApp sharing, family-member access, software logins, outsourced labs, home collection workflows and old patient records are managed informally — without access control, consent/notice evidence, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const clinicsDiagnosticLabsPack: IndustryPack = {
  industry: "clinics-diagnostic-labs",
  route: "/assessment/clinics-diagnostic-labs",
  reportType: "clinic", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "Clinic & Diagnostic Lab DPDPA Risk Scan",
    hero: "Your clinic does not just treat patients. It collects, stores and shares health data every day.",
    sub: "From prescriptions and lab reports to WhatsApp sharing, family-member updates, diagnostic images, appointment records, billing details, home sample collection and clinic software — healthcare providers handle sensitive patient data at every step. This 3-minute scan shows where DPDPA exposure may arise in your patient-data workflows. It collects no patient data — only your answers about your processes.",
    cta: "Start Clinic / Lab Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Patient Reports",
      "Prescriptions",
      "Health Data",
      "WhatsApp Sharing",
      "Lab Software",
      "Reception Access",
      "Home Collection",
      "Doctor Referrals",
      "Insurance / TPA",
      "Old Reports",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Clinic & Diagnostic Lab DPDPA Starter Checklist",
    href: "/templates/clinic-diagnostic-lab-dpdpa-starter-checklist.pdf",
  },
};

export default clinicsDiagnosticLabsPack;

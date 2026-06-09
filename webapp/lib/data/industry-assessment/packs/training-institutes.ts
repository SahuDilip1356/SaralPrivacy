// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Training Institutes pack
// "Training Institute DPDPA Risk Scan" — a student-data risk scan, not a generic test.
// Caps for Q1–Q10 sum to 110; the engine normalises by Σ caps automatically.
// Built on the shared engine (zero engine changes). See:
//   docs/SaralPrivacy_Training_Institute_Assessment_v2_Spec.md
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
    key: "student_data_collection",
    label: "Student data collection risk",
    meaning: "Student and parent data may be collected across too many informal channels.",
  },
  {
    key: "minor_parental_consent",
    label: "Minor & parental consent risk",
    meaning: "Students below 18 may require stronger consent evidence and safeguards.",
  },
  {
    key: "communication_marketing",
    label: "Communication & marketing risk",
    meaning: "WhatsApp groups, photos, testimonials or recordings may create exposure.",
  },
  {
    key: "lms_vendor_platform",
    label: "LMS, vendor & platform risk",
    meaning: "Tools and partners may process student data without enough review.",
  },
  {
    key: "retention_rights",
    label: "Retention & rights readiness risk",
    meaning: "Old student records may be retained without a defined policy.",
  },
];

// ── Sensitive / high-impact ids (used by overrides) ──────────────────────────

const SENSITIVE_DATA = ["health_disability"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Institute profile ──────────────────────────────────────────────
  {
    id: "q1",
    badge: "Institute Profile",
    question: "What type of training business do you run?",
    helpText: "Select all that apply. This helps estimate your student-data risk profile.",
    whyThisMatters:
      "EdTech, hybrid and school-linked models pull in the most student and minor data across the most channels.",
    type: "multi",
    cap: 8,
    bucket: "student_data_collection",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "coaching_tuition", label: "Coaching centre / tuition centre", riskPoints: 2 },
      { id: "test_prep", label: "Test-prep institute", riskPoints: 3 },
      { id: "professional_certification", label: "Professional certification / upskilling institute", riskPoints: 2 },
      { id: "vocational", label: "Vocational / skill-development centre", riskPoints: 2 },
      { id: "edtech", label: "EdTech / online course platform", riskPoints: 4 },
      { id: "hybrid", label: "Hybrid offline + online training institute", riskPoints: 4 },
      { id: "school_college_linked", label: "School/college-linked training programme", riskPoints: 4 },
      { id: "corporate_training", label: "Corporate training provider", riskPoints: 2 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 4 },
    ],
  },

  // ─── Q2 Student data collected ─────────────────────────────────────────
  {
    id: "q2",
    badge: "Student Data Risk",
    question: "Which student or parent data do you collect?",
    helpText: "Select all student, parent, payment, performance or media data your institute collects or stores.",
    whyThisMatters:
      "Photos, recordings, health and special-need data are the highest-impact records — especially for minors.",
    type: "multi",
    cap: 14,
    bucket: "student_data_collection",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "student_contact", label: "Student name, phone number and email", riskPoints: 2 },
      { id: "parent_contact", label: "Parent/guardian name and phone number", riskPoints: 3 },
      { id: "education_details", label: "Age, class, school/college name or education details", riskPoints: 3 },
      { id: "address_location", label: "Address or location details", riskPoints: 3 },
      { id: "id_documents", label: "ID proof or documents", riskPoints: 4 },
      { id: "performance_data", label: "Marks, test scores, attendance or performance data", riskPoints: 4 },
      { id: "payment_data", label: "Fee receipts, payment status or instalment details", riskPoints: 3 },
      { id: "photos_videos", label: "Photos, videos or classroom recordings", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "health_disability", label: "Health, disability, special learning need or emergency contact data", riskPoints: 6, badge: "SENSITIVE", badgeColor: "red" },
      { id: "placement_data", label: "Resume, placement profile or career data", riskPoints: 4 },
      { id: "other", label: "Other student data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q3 Minors ─────────────────────────────────────────────────────────
  {
    id: "q3",
    badge: "Minor Student Risk",
    question: "Do you enrol students below 18 years of age?",
    helpText: "This helps identify whether additional consent and safeguard checks may be relevant.",
    whyThisMatters:
      "Processing a child's data needs verifiable parental consent under DPDPA — and children's-data breaches sit in the highest penalty tier.",
    type: "single",
    cap: 12,
    bucket: "minor_parental_consent",
    layer: "exposure",
    options: [
      { id: "no_all_adults", label: "No, all students are 18 or above", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "some_minors", label: "Yes, some students are below 18", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "mostly_minors", label: "Yes, most students are below 18", riskPoints: 12, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "age_not_recorded", label: "We do not consistently record student age", riskPoints: 10, badge: "RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q4 Parental consent ───────────────────────────────────────────────
  {
    id: "q4",
    badge: "Parent / Guardian Consent",
    question: "If students below 18 are enrolled, how do you obtain parent or guardian consent?",
    helpText: "Choose the option closest to your current admission or onboarding practice.",
    whyThisMatters:
      "DPDPA requires verifiable parental consent for minors — being able to confirm the consenter is genuinely the parent or guardian.",
    type: "single",
    cap: 12,
    bucket: "minor_parental_consent",
    layer: "control",
    options: [
      { id: "verifiable_consent", label: "We collect verifiable parent/guardian consent (we can confirm the consenter is the parent/guardian) and record it at admission", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "documented_not_verifiable", label: "We collect documented consent at admission, but don't separately verify the consenter is the parent/guardian", riskPoints: 3 },
      { id: "informal_consent", label: "Parent consent is taken, but mostly through informal WhatsApp/email communication", riskPoints: 4 },
      { id: "parents_aware_not_documented", label: "Parents are usually aware, but we do not document consent clearly", riskPoints: 8 },
      { id: "no_specific_process", label: "We do not have a specific consent process for minors", riskPoints: 12, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_applicable", label: "Not applicable — we do not enrol minors", riskPoints: 0 },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q5 Intake ─────────────────────────────────────────────────────────
  {
    id: "q5",
    badge: "Admission & Enquiry Intake",
    question: "How do students or parents usually share admission, enquiry or fee-related information with your institute?",
    helpText: "Select all channels used by counsellors, admission teams or centre staff.",
    whyThisMatters:
      "Unstructured intake across WhatsApp, spreadsheets and informal forms makes access, deletion and breach control much harder.",
    type: "multi",
    cap: 10,
    bucket: "student_data_collection",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "website_portal", label: "Website form or structured admission portal", riskPoints: 1, badge: "GOOD", badgeColor: "green" },
      { id: "google_forms", label: "Google Forms / Microsoft Forms", riskPoints: 2 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "phone_calls", label: "Phone calls captured by counsellors", riskPoints: 3 },
      { id: "email", label: "Email attachments", riskPoints: 4 },
      { id: "physical_digitised", label: "Physical admission forms later digitised", riskPoints: 3 },
      { id: "staff_spreadsheet", label: "Spreadsheet maintained by staff/counsellors", riskPoints: 5 },
      { id: "crm", label: "CRM or lead-management tool", riskPoints: 2 },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q6 WhatsApp ───────────────────────────────────────────────────────
  {
    id: "q6",
    badge: "Student / Parent Communication",
    question: "Do you use WhatsApp groups or broadcast lists for students or parents?",
    helpText: "This includes batch updates, homework, fee reminders, results, announcements and promotional messages.",
    whyThisMatters:
      "WhatsApp is convenient but can expose phone numbers and history, and rarely supports structured retention, deletion or access control.",
    type: "single",
    cap: 10,
    bucket: "communication_marketing",
    layer: "control",
    options: [
      { id: "controlled", label: "Yes, but groups/lists are controlled, purpose-specific and periodically reviewed", riskPoints: 2 },
      { id: "common_use", label: "Yes, for batch updates, homework, fees, results or announcements", riskPoints: 5 },
      { id: "numbers_visible", label: "Yes, and student/parent numbers are visible to others in groups", riskPoints: 8, badge: "RISK", badgeColor: "red" },
      { id: "no_whatsapp", label: "No, we do not use WhatsApp for student/parent communication", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q7 Marketing media ────────────────────────────────────────────────
  {
    id: "q7",
    badge: "Marketing Media Risk",
    question: "Do you use student photos, result screenshots, testimonials, classroom videos or demo-class recordings for marketing?",
    helpText: "This includes social media posts, brochures, ads, website pages, YouTube videos and parent testimonials.",
    whyThisMatters:
      "Using student photos, results or testimonials — especially of minors — without documented consent can create serious privacy exposure.",
    type: "single",
    cap: 12,
    bucket: "communication_marketing",
    layer: "control",
    options: [
      { id: "written_consent", label: "Yes, with written consent and a removal process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "inconsistent_consent", label: "Yes, consent is taken but not consistently documented", riskPoints: 4 },
      { id: "without_separate_consent", label: "Yes, we use them commonly for social media/ads without separate consent", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_marketing_media", label: "No, we do not use student photos/testimonials/videos for marketing", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q8 Tools / vendors ────────────────────────────────────────────────
  {
    id: "q8",
    badge: "LMS, Vendor & Platform Risk",
    question: "Which digital tools or vendors process student or parent data for your institute?",
    helpText: "Select all systems or third parties used for teaching, testing, payments, attendance, marketing or placements.",
    whyThisMatters:
      "LMS, CRM, attendance, payment and marketing tools are part of your data-processing chain under DPDPA — not just 'tools'.",
    type: "multi",
    cap: 12,
    bucket: "lms_vendor_platform",
    layer: "exposure",
    mutuallyExclusive: ["no_external_tools", "not_sure"],
    options: [
      { id: "lms", label: "LMS / learning platform", riskPoints: 3 },
      { id: "test_platform", label: "Online test platform", riskPoints: 3 },
      { id: "video_tools", label: "Zoom / Google Meet / Teams", riskPoints: 2 },
      { id: "google_classroom", label: "Google Classroom or similar tools", riskPoints: 2 },
      { id: "crm", label: "CRM / lead-management tool", riskPoints: 3 },
      { id: "payment_gateway", label: "Payment gateway / fee collection tool", riskPoints: 2 },
      { id: "attendance", label: "Attendance app / biometric / QR system", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "marketing_tool", label: "Email/SMS/WhatsApp marketing tool", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "placement_portal", label: "Placement portal or recruiter database", riskPoints: 4 },
      { id: "it_vendor", label: "IT vendor / outsourced support team", riskPoints: 4 },
      { id: "no_external_tools", label: "We do not use external tools", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8, badge: "RISK", badgeColor: "red" },
    ],
  },

  // ─── Q9 Placement / partner sharing ────────────────────────────────────
  {
    id: "q9",
    badge: "Placement / Partner Sharing",
    question: "Do you share student resumes, marks, attendance, performance data or contact details with recruiters, colleges, partners or franchisees?",
    helpText: "This applies to placement support, franchise operations, college tie-ups, corporate partners and recruiter databases.",
    whyThisMatters:
      "Placement and partner sharing is a major hidden data-flow risk — onward sharing needs clear notice or consent.",
    type: "single",
    cap: 10,
    bucket: "lms_vendor_platform",
    layer: "control",
    options: [
      { id: "documented_notice_consent", label: "Yes, but only with documented student/parent notice or consent", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_notice", label: "Yes, but consent/notice is informal", riskPoints: 4 },
      { id: "share_on_request", label: "Yes, we share data when partners or recruiters ask", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_external_sharing", label: "No, we do not share student data externally", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q10 Retention ─────────────────────────────────────────────────────
  {
    id: "q10",
    badge: "Retention & Deletion Risk",
    question: "How long do you retain student records after course completion?",
    helpText: "This includes old leads, admission records, test scores, attendance, payment records, student photos, recordings and placement profiles.",
    whyThisMatters:
      "Keeping student records indefinitely, with no policy or review, turns old files into standing risk.",
    type: "single",
    cap: 10,
    bucket: "retention_rights",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain records for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_convenience", label: "We retain old student records for many years for convenience, alumni or marketing", riskPoints: 7 },
      { id: "indefinitely", label: "We keep most student records indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },
];

// ── Override + flag helpers ──────────────────────────────────────────────────

const has = (a: IAAnswers, qid: string, optId: string) =>
  selectedIds(a[qid]).includes(optId);
const anyOf = (a: IAAnswers, qid: string, optIds: string[]) =>
  selectedIds(a[qid]).some((id) => optIds.includes(id));

// D2: "age_not_recorded" is treated as minors-present for override purposes —
// an institute that can't identify minors should still trigger minor escalations.
const hasMinors = (a: IAAnswers) =>
  anyOf(a, "q3", ["some_minors", "mostly_minors", "age_not_recorded"]);
const noRetention = (a: IAAnswers) =>
  anyOf(a, "q10", ["indefinitely", "not_sure"]);

// ── Overrides (raise-only) ────────────────────────────────────────────────────

const OVERRIDES: IAOverride[] = [
  {
    id: "minors_no_consent",
    minBand: "High Risk",
    severity: 10,
    test: (a) => hasMinors(a) && has(a, "q4", "no_specific_process"),
    flag: "Your institute enrols students below 18, but there is no specific parental-consent process for minors.",
  },
  {
    id: "minors_marketing_no_consent",
    minBand: "High Risk",
    severity: 9,
    test: (a) => hasMinors(a) && has(a, "q7", "without_separate_consent"),
    flag: "Photos, results or testimonials of minors may be used in marketing without documented parent/guardian consent.",
  },
  {
    id: "sensitive_data_no_retention",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q2", SENSITIVE_DATA) && noRetention(a),
    flag: "Health, disability or special-need data may be retained indefinitely with no deletion policy.",
  },
  {
    id: "external_sharing_on_request",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "share_on_request"),
    flag: "Student data is shared with recruiters or partners on request, without clear notice or consent.",
  },
  {
    id: "multi_channel_no_retention",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q5", "multiple_no_standard") && noRetention(a),
    flag: "Student data enters through multiple channels with no standard process and is retained indefinitely.",
  },
  // WhatsApp number exposure → Moderate base, raised to High when minors are involved.
  {
    id: "whatsapp_number_exposure",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => has(a, "q6", "numbers_visible"),
    flag: "Student/parent phone numbers are visible to others in WhatsApp groups.",
  },
  {
    id: "whatsapp_number_exposure_minors",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q6", "numbers_visible") && hasMinors(a),
    flag: "Minors' (and parents') phone numbers are visible to others in WhatsApp groups.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "minors_consent_gap",
    severity: 8,
    test: (a) =>
      hasMinors(a) &&
      anyOf(a, "q4", ["informal_consent", "parents_aware_not_documented", "no_specific_process"]),
    flag: "Your institute enrols students below 18, but parental consent may not be clearly documented or verifiable.",
  },
  {
    id: "age_not_tracked",
    severity: 8,
    test: (a) => has(a, "q3", "age_not_recorded"),
    flag: "Student age isn't consistently recorded, making it hard to identify minors and apply safeguards.",
  },
  {
    id: "marketing_media_consent",
    severity: 7,
    test: (a) => anyOf(a, "q7", ["inconsistent_consent", "without_separate_consent"]),
    flag: "Student photos, result screenshots, testimonials or recordings may be used for marketing without consistent consent evidence.",
  },
  {
    id: "whatsapp_exposure",
    severity: 6,
    test: (a) => anyOf(a, "q6", ["common_use", "numbers_visible"]),
    flag: "Student/parent WhatsApp groups may expose phone numbers and history without clear controls.",
  },
  {
    id: "vendor_sprawl",
    severity: 6,
    test: (a) =>
      selectedIds(a["q8"]).filter((id) => id !== "no_external_tools" && id !== "not_sure").length >= 3 ||
      anyOf(a, "q8", ["attendance", "marketing_tool"]),
    flag: "Multiple LMS, CRM, attendance, payment or marketing tools may process student data without a vendor review process.",
  },
  {
    id: "retention_indefinite",
    severity: 6,
    test: (a) => anyOf(a, "q10", ["many_years_convenience", "indefinitely"]),
    flag: "Old student records may be retained indefinitely without a documented retention policy.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical).
const FIVE_CONTROLS = [
  "Record whether each student is below 18, so minors can be identified and safeguarded.",
  "Capture verifiable parent/guardian consent where minors are involved — at admission, with evidence.",
  "Standardise student and parent data intake — reduce scattered WhatsApp, spreadsheet and informal collection.",
  "Review WhatsApp groups, student photos, testimonials and demo-class recordings, and document consent.",
  "Define retention rules for old leads, admission records, test scores, attendance and student photos.",
];

// Bucket-targeted recommendations (shown for Moderate / Controlled).
const BUCKET_RECS: Record<string, string> = {
  minor_parental_consent:
    "Create a minor-student consent workflow: capture verifiable parent/guardian consent at admission, record student age, and maintain evidence for digital comms, LMS, photos, recordings and marketing use.",
  communication_marketing:
    "Review student-facing communication and marketing: separate batch updates from promotional messaging, document consent for testimonials/photos/videos, and create a removal process for outdated content.",
  student_data_collection:
    "Standardise enquiry and admission data collection. Reduce scattered intake via WhatsApp, spreadsheets and informal forms, and define what student and parent data each purpose needs.",
  lms_vendor_platform:
    "Build a vendor and tool register covering LMS, CRM, payment, attendance, video, test, marketing tools and placement partners. Review what each stores and who can access it.",
  retention_rights:
    "Define a retention schedule for student records after course completion — leads, admission records, test scores, attendance, photos, recordings, payments and placement profiles.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }

  // Moderate / Controlled: target the highest-risk buckets, lighter tone.
  const s = r.bucketScores;
  const recs: string[] = [];
  // Priority order mirrors DPDPA stakes for this industry.
  for (const key of [
    "minor_parental_consent",
    "communication_marketing",
    "student_data_collection",
    "lms_vendor_platform",
    "retention_rights",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }

  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, set an annual consent, access and retention review, and keep evidence of how student data is handled."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) ───────────────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your training institute appears to have basic student-data controls in place. Your next step is to document these practices, review vendor tools, and ensure consent records are maintained for students, parents and marketing use.",
  "Moderate Risk":
    "Your training institute has some student-data controls, but several practices may be informal. Focus first on standardising admission data collection, documenting consent, reviewing WhatsApp groups, and defining retention rules for old student records.",
  "High Risk":
    "Your training institute may have significant DPDPA exposure across student data, minors, WhatsApp communication, marketing content, LMS tools or retention practices. Your first priority is to control student-data collection, parental consent, photos/testimonials, vendor access and old record retention.",
  "Critical Risk":
    "Your training institute may have serious DPDPA exposure. This usually happens when minors' data, WhatsApp groups, student photos, LMS tools, payment data, placement sharing and old records are managed informally — without documented consent, access control, retention or response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const trainingInstitutePack: IndustryPack = {
  industry: "training-institutes",
  route: "/assessment/training-institutes",
  reportType: "training", // short token — Appwrite `report_type` attr is string(10)
  positioning: {
    title: "Training Institute DPDPA Risk Scan",
    hero: "Your institute does not just teach students. It collects, shares and stores student data every day.",
    sub: "From enquiry forms and admission records to WhatsApp groups, parent phone numbers, student photos, LMS tools, attendance data, fee records and placement profiles — training institutes handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise.",
    cta: "Start Training Institute Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Student Data",
      "Parent Details",
      "Minors",
      "WhatsApp Groups",
      "LMS Tools",
      "Student Photos",
      "Testimonials",
      "Attendance",
      "Fee Records",
      "Placement Data",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Training Institute DPDPA Starter Checklist",
    href: "/templates/training-institute-dpdpa-starter-checklist.pdf",
  },
};

export default trainingInstitutePack;

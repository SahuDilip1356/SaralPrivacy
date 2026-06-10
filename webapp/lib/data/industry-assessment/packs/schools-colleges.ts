// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Schools & Colleges pack (6th industry)
// "School & College DPDPA Risk Scan" — a student-and-parent data risk scan.
// Caps for Q1–Q10 sum to 116; the engine normalises by Σ caps automatically.
// Built on the shared engine. Uses the engine's questionRisk floor-at-0 so Q8's
// "documented controls" credit option (-4) can reduce monitoring risk without a
// question going negative.
//
// Thesis: most schools don't have a teaching problem — they have a student-data
// movement problem (admissions, parent consent, school apps, communication,
// monitoring systems, vendors, photos, sharing, retention).
// Two-lens: exposure = Q1,Q2,Q3,Q5,Q8 (62) · control = Q4,Q6,Q7,Q9,Q10 (54).
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
    key: "student_parent_data",
    label: "Student & parent data risk",
    meaning: "Admission, academic, fee, health and parent data may need stronger mapping.",
  },
  {
    key: "children_consent",
    label: "Children & consent risk",
    meaning: "Students below 18 may require stronger parent notice and consent controls.",
  },
  {
    key: "monitoring_safety_systems",
    label: "Monitoring & safety-system risk",
    meaning: "CCTV, attendance, biometric, RFID or GPS tools may need governance.",
  },
  {
    key: "learning_vendor_platform",
    label: "Learning, vendor & platform risk",
    meaning: "School apps, ERP, LMS, fee portals and vendors may need review.",
  },
  {
    key: "retention_sharing_rights",
    label: "Retention, sharing & rights readiness risk",
    meaning: "Old records, student photos and external sharing may not be controlled.",
  },
];

// option-id groups reused by overrides/flags
const SENSITIVE_STUDENT_DATA = ["health_special_needs", "counselling_disciplinary"];
const HIGH_MONITORING = ["biometric_attendance", "transport_gps", "cctv_sensitive"];
const GROUP_CHANNELS = ["whatsapp_groups", "social_media_groups"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Institution profile ────────────────────────────────────────────
  {
    id: "q1",
    badge: "Institution Profile",
    question: "What type of educational institution do you operate?",
    helpText: "Select all that apply. This helps estimate your student and parent data risk profile.",
    whyThisMatters:
      "Schools and pre-schools usually involve children's data and parent consent. Colleges may involve more placement, hostel, exam, alumni and vendor-sharing risks.",
    type: "multi",
    cap: 8,
    bucket: "student_parent_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "preschool", label: "Pre-school / kindergarten", riskPoints: 6, badge: "MINORS", badgeColor: "amber" },
      { id: "k12_school", label: "K–12 school", riskPoints: 6, badge: "MINORS", badgeColor: "amber" },
      { id: "junior_college", label: "Junior college / senior secondary institution", riskPoints: 4 },
      { id: "degree_college", label: "Degree college", riskPoints: 3 },
      { id: "professional_university", label: "Professional college / university", riskPoints: 4 },
      { id: "residential_hostel", label: "Residential school / hostel-based institution", riskPoints: 6 },
      { id: "multi_branch", label: "Multi-branch school or college group", riskPoints: 6 },
      { id: "franchise_partner", label: "Franchise / partner-run education centre", riskPoints: 5 },
      { id: "other", label: "Other educational institution", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Student & parent data ──────────────────────────────────────────
  {
    id: "q2",
    badge: "Student & Parent Data Risk",
    question: "Which student or parent data do you collect or store?",
    helpText: "Select all admission, academic, fee, health, transport, hostel, placement or parent-contact data your institution collects.",
    whyThisMatters:
      "Student data is not only academic data. It can include health, behaviour, family, location, financial, safety and image-based data.",
    type: "multi",
    cap: 14,
    bucket: "student_parent_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "student_identity", label: "Student name, age, gender and class/course", riskPoints: 2 },
      { id: "parent_contact", label: "Parent/guardian name, phone number and email", riskPoints: 3 },
      { id: "address_emergency", label: "Address, location and emergency contact details", riskPoints: 3 },
      { id: "admission_id_birth", label: "Admission forms, ID proof or birth certificates", riskPoints: 5 },
      { id: "academic_attendance", label: "Marks, exam records, report cards and attendance", riskPoints: 4 },
      { id: "fee_scholarship", label: "Fee records, payment status and scholarship data", riskPoints: 4 },
      { id: "health_special_needs", label: "Health records, allergies, disability or special needs data", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "photos_videos_posts", label: "Student photos, videos, certificates or achievement posts", riskPoints: 5 },
      { id: "counselling_disciplinary", label: "Counselling, disciplinary or behaviour records", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "transport_hostel", label: "Transport, hostel or residential records", riskPoints: 5 },
      { id: "placement_alumni", label: "Placement, internship or alumni data", riskPoints: 4 },
      { id: "other", label: "Other student or parent data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q3 Minors ─────────────────────────────────────────────────────────
  {
    id: "q3",
    badge: "Children's Data Risk",
    question: "Do you enrol students below 18 years of age?",
    helpText: "This helps identify whether parent/guardian notice and consent controls may be relevant.",
    whyThisMatters:
      "If students below 18 are involved, the institution needs stronger parent/guardian communication, consent evidence and safeguards.",
    type: "single",
    cap: 12,
    bucket: "children_consent",
    layer: "exposure",
    options: [
      { id: "no_all_adults", label: "No, all students are 18 or above", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "some_minors", label: "Yes, some students are below 18", riskPoints: 8, badge: "MINORS", badgeColor: "amber" },
      { id: "mostly_minors", label: "Yes, most students are below 18", riskPoints: 12, badge: "MINORS", badgeColor: "red" },
      { id: "age_not_recorded", label: "We do not consistently record student age", riskPoints: 10 },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q4 Parent consent ─────────────────────────────────────────────────
  {
    id: "q4",
    badge: "Parent / Guardian Notice & Consent",
    question: "How do you provide notice and obtain parent/guardian consent where students are below 18?",
    helpText: "Choose the option closest to your admission, onboarding and parent-communication process.",
    whyThisMatters:
      "For schools, the practical control is not merely a website privacy policy. It is whether parents understand how student data, photos, apps, CCTV, transport, communication and vendors are used.",
    type: "single",
    cap: 12,
    bucket: "children_consent",
    layer: "control",
    options: [
      { id: "documented_notice_consent", label: "We provide clear notice and collect documented parent/guardian consent during admission/onboarding", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "forms_or_informal", label: "Parent/guardian consent is collected, but mostly through admission forms or informal communication", riskPoints: 4 },
      { id: "parents_aware_not_documented", label: "Parents are generally aware, but we do not clearly document data-use consent", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "no_specific_process", label: "We do not have a specific consent or notice process for minors", riskPoints: 12, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_applicable", label: "Not applicable — we do not enrol minors", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q5 Systems & vendors ──────────────────────────────────────────────
  {
    id: "q5",
    badge: "School App, ERP & Vendor Risk",
    question: "Which digital systems, apps or vendors process student or parent data?",
    helpText: "Select all ERP, LMS, app, fee, attendance, transport, CCTV, communication, hostel, placement or EdTech tools used by your institution.",
    whyThisMatters:
      "Schools and colleges often use many apps and vendors. Each system can create a separate data flow and access-control issue.",
    type: "multi",
    cap: 14,
    bucket: "learning_vendor_platform",
    layer: "exposure",
    mutuallyExclusive: ["no_external_systems", "not_sure"],
    options: [
      { id: "school_erp", label: "School ERP / student information system", riskPoints: 3 },
      { id: "lms", label: "LMS / online learning platform", riskPoints: 3 },
      { id: "mobile_parent_app", label: "Mobile school app / parent app", riskPoints: 4 },
      { id: "fee_portal", label: "Fee payment portal", riskPoints: 3 },
      { id: "online_exam", label: "Online exam / assessment platform", riskPoints: 4 },
      { id: "attendance_biometric_rfid", label: "Attendance system / RFID / biometric system", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "transport_gps", label: "Transport GPS / bus-tracking app", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "cctv_vendor", label: "CCTV system / surveillance vendor", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "communication_tools", label: "Email/SMS/WhatsApp communication tools", riskPoints: 5 },
      { id: "hostel_library_canteen", label: "Hostel / library / canteen management system", riskPoints: 4 },
      { id: "edtech_it_vendor", label: "EdTech, cloud, IT or outsourced support vendor", riskPoints: 5 },
      { id: "placement_alumni_platform", label: "Placement / internship / alumni platform", riskPoints: 4 },
      { id: "no_external_systems", label: "We do not use external systems or vendors", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q6 Communication channels ─────────────────────────────────────────
  {
    id: "q6",
    badge: "Parent / Student Communication Risk",
    question: "How do you communicate with parents and students?",
    helpText: "Select all channels used for circulars, updates, attendance, fees, results, emergency messages and general communication.",
    whyThisMatters:
      "WhatsApp groups and informal social channels can expose parent/student phone numbers, images, conversations and sensitive updates.",
    type: "multi",
    cap: 10,
    bucket: "children_consent",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "official_app_erp", label: "Official school/college app or ERP notifications", riskPoints: 1, badge: "GOOD", badgeColor: "green" },
      { id: "email", label: "Email", riskPoints: 3 },
      { id: "sms", label: "SMS", riskPoints: 3 },
      { id: "whatsapp_groups", label: "WhatsApp groups", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "whatsapp_broadcasts", label: "WhatsApp broadcast lists", riskPoints: 4 },
      { id: "phone_calls", label: "Phone calls by teachers/admin staff", riskPoints: 3 },
      { id: "paper_digital", label: "Paper circulars plus digital follow-up", riskPoints: 2 },
      { id: "social_media_groups", label: "Social media groups or pages", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "multiple_no_record", label: "Multiple channels, no central communication record", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q7 Student photos & publicity ─────────────────────────────────────
  {
    id: "q7",
    badge: "Student Photo & Publicity Risk",
    question: "Do you use student photos, videos, event coverage, testimonials, results or achievement posts for marketing or public communication?",
    helpText: "This includes website, brochures, social media, YouTube, advertisements, newsletters, event posts and topper/result announcements.",
    whyThisMatters:
      "Schools frequently publish event photos, topper posts, sports achievements, classroom videos and student testimonials. If minors are involved, this becomes a high-sensitivity workflow.",
    type: "single",
    cap: 12,
    bucket: "retention_sharing_rights",
    layer: "control",
    options: [
      { id: "documented_consent_removal", label: "Yes, with documented consent and a removal process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "inconsistent_consent", label: "Yes, consent is taken but not consistently documented", riskPoints: 4 },
      { id: "public_without_separate_consent", label: "Yes, we use photos/videos/results commonly for website/social media without separate consent", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_public_use", label: "No, we do not use student images or results publicly", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q8 Monitoring & safety systems ────────────────────────────────────
  {
    id: "q8",
    badge: "CCTV, Attendance & Transport Risk",
    question: "Do you use CCTV, biometric attendance, RFID cards, transport GPS or hostel monitoring systems?",
    helpText: "Select all safety, attendance, monitoring, location or visitor-management systems used by your institution. Tick the documented-controls option too if it applies — it lowers this risk.",
    whyThisMatters:
      "Safety systems are legitimate, but they can create continuous monitoring and location data risks if access, purpose, retention and visibility are not controlled.",
    type: "multi",
    cap: 14,
    bucket: "monitoring_safety_systems",
    layer: "exposure",
    // "no_monitoring" and "not_sure" clear the rest. "documented_controls" is a
    // credit modifier (-4) that intentionally COMBINES with the monitoring
    // selections — the engine floors the question at 0.
    mutuallyExclusive: ["no_monitoring", "not_sure"],
    options: [
      { id: "cctv_common", label: "CCTV in classrooms/corridors/common areas", riskPoints: 5 },
      { id: "cctv_sensitive", label: "CCTV in buses, hostel or sensitive areas", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "biometric_attendance", label: "Biometric attendance", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "rfid_attendance", label: "RFID / smart ID card attendance", riskPoints: 5 },
      { id: "transport_gps", label: "Transport GPS / bus tracking", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "hostel_monitoring", label: "Hostel entry/exit monitoring", riskPoints: 6 },
      { id: "visitor_management", label: "Visitor management system", riskPoints: 4 },
      { id: "documented_controls", label: "We use monitoring systems with documented purpose and access controls", riskPoints: -4, badge: "GOOD", badgeColor: "green" },
      { id: "no_monitoring", label: "We do not use monitoring systems", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q9 External sharing ───────────────────────────────────────────────
  {
    id: "q9",
    badge: "Vendor / Partner Sharing Risk",
    question: "Do you share student data with boards, universities, vendors, transport providers, hostel partners, placement recruiters or franchise partners?",
    helpText: "This includes statutory, academic, operational, placement, vendor, transport, hostel, franchise and partner sharing.",
    whyThisMatters:
      "Schools and colleges naturally share student data for academic, operational and statutory reasons. The risk is uncontrolled or poorly documented sharing.",
    type: "single",
    cap: 10,
    bucket: "retention_sharing_rights",
    layer: "control",
    options: [
      { id: "defined_purpose_controls", label: "Yes, but only with defined purpose, notice and access controls", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_notice_controls", label: "Yes, but notice/vendor controls are informal", riskPoints: 4 },
      { id: "share_on_request", label: "Yes, data is shared when partners, vendors or authorities ask", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "statutory_only", label: "No, we do not share student data externally except statutory requirements", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q10 Retention ─────────────────────────────────────────────────────
  {
    id: "q10",
    badge: "Student Record Retention",
    question: "How long do you retain old student records, photos, CCTV footage, app records and parent contact data?",
    helpText: "This includes admission files, certificates, transfer records, fee data, app data, photos, videos, CCTV footage, alumni records and parent contacts.",
    whyThisMatters:
      "Educational institutions often keep old student files forever. The problem is not retention itself. The issue is uncontrolled retention without purpose, review or access limitation.",
    type: "single",
    cap: 10,
    bucket: "retention_sharing_rights",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain records for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_convenience", label: "We retain old records, photos, app data or parent contacts for many years for convenience", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most student and parent data indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },
];

// ── Override + flag helpers ──────────────────────────────────────────────────

const has = (a: IAAnswers, qid: string, optId: string) =>
  selectedIds(a[qid]).includes(optId);
const anyOf = (a: IAAnswers, qid: string, optIds: string[]) =>
  selectedIds(a[qid]).some((id) => optIds.includes(id));
const hasMinors = (a: IAAnswers) => anyOf(a, "q3", ["some_minors", "mostly_minors"]);

// ── Overrides (raise-only) ────────────────────────────────────────────────────
// Max band reached here is High Risk — Critical is reachable purely via raw score.
// Spec overrides 5 & 7 have conditional minimums (Moderate, escalating to High
// with minors), expressed here as paired entries that share one flag text.

const OVERRIDES: IAOverride[] = [
  {
    id: "minors_no_consent",
    minBand: "High Risk",
    severity: 9,
    test: (a) => hasMinors(a) && has(a, "q4", "no_specific_process"),
    flag: "Students under 18 are enrolled but there's no clear parent/guardian notice or consent process for how their data is used.",
  },
  {
    id: "minors_public_photos",
    minBand: "High Risk",
    severity: 9,
    test: (a) => hasMinors(a) && has(a, "q7", "public_without_separate_consent"),
    flag: "Student photos, videos or results are published without separate consent, and minors are involved.",
  },
  {
    id: "sensitive_indefinite",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q2", SENSITIVE_STUDENT_DATA) && anyOf(a, "q10", ["indefinitely", "not_sure"]),
    flag: "Health, special-needs or counselling records are kept indefinitely (or with no defined retention).",
  },
  {
    id: "high_monitoring_no_controls",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q8", HIGH_MONITORING) && !has(a, "q8", "documented_controls"),
    flag: "Biometric, transport-GPS or sensitive-area CCTV is in use without documented purpose and access controls.",
  },
  {
    id: "external_on_request",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q9", "share_on_request"),
    flag: "Student data is shared whenever partners, vendors or authorities ask, without defined purpose or controls.",
  },
  // Override 5 — WhatsApp/social + minors. Moderate alone; High with no consent process.
  {
    id: "group_channels_minors",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => anyOf(a, "q6", GROUP_CHANNELS) && hasMinors(a),
    flag: "Parent/student communication runs through WhatsApp or social-media groups where minors' contacts and updates are exposed.",
  },
  {
    id: "group_channels_minors_no_consent",
    minBand: "High Risk",
    severity: 7,
    test: (a) => anyOf(a, "q6", GROUP_CHANNELS) && hasMinors(a) && has(a, "q4", "no_specific_process"),
    flag: "Parent/student communication runs through WhatsApp or social-media groups where minors' contacts and updates are exposed.",
  },
  // Override 7 — indefinite retention. Moderate alone; High with minors.
  {
    id: "indefinite_retention",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => has(a, "q10", "indefinitely"),
    flag: "Most student and parent data is kept indefinitely with no documented retention or deletion schedule.",
  },
  {
    id: "indefinite_retention_minors",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q10", "indefinitely") && hasMinors(a),
    flag: "Most student and parent data is kept indefinitely with no documented retention or deletion schedule.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "minors_present",
    severity: 6,
    test: (a) => hasMinors(a),
    flag: "Students under 18 are enrolled, so parent/guardian notice and consent controls are central to your DPDPA posture.",
  },
  {
    id: "sensitive_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["health_special_needs", "counselling_disciplinary", "transport_hostel"]),
    flag: "Student records may include sensitive health, counselling, disciplinary or location data that needs stronger controls.",
  },
  {
    id: "vendor_sprawl",
    severity: 6,
    test: (a) => anyOf(a, "q5", ["attendance_biometric_rfid", "transport_gps", "cctv_vendor", "edtech_it_vendor", "mobile_parent_app"]),
    flag: "School apps, ERP, LMS, fee portals, CCTV and EdTech vendors may process student data without a clear vendor register.",
  },
  {
    id: "comms_sprawl",
    severity: 5,
    test: (a) => anyOf(a, "q6", ["whatsapp_groups", "social_media_groups", "multiple_no_record"]),
    flag: "Parent/student communication is spread across WhatsApp, social groups and multiple channels with no central record.",
  },
  {
    id: "monitoring_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q8", ["cctv_common", "cctv_sensitive", "biometric_attendance", "rfid_attendance", "transport_gps", "hostel_monitoring"]),
    flag: "CCTV, biometric, RFID, transport GPS or hostel monitoring can create continuous-monitoring risk if purpose and access aren't defined.",
  },
  {
    id: "photo_publicity",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["inconsistent_consent", "public_without_separate_consent"]),
    flag: "Student photos, videos and results may be published online without consistent consent or a removal process.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q10", ["many_years_convenience", "indefinitely"]),
    flag: "Old student records, parent contacts, app data and photos may be retained for years without a documented schedule.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Map where student and parent data is collected and stored — across admission, fee, academic, health, transport, hostel, exam, app and communication workflows.",
  "Strengthen parent/guardian notice and consent for students below 18 — covering admission data, school apps, photos, CCTV, transport, LMS, communication channels and vendor platforms.",
  "Review how student photos, videos, results and achievements are used publicly — take consent and offer a removal process, especially where minors are involved.",
  "Govern CCTV, biometric, RFID, transport GPS and hostel monitoring — define purpose, access rights, retention duration and signage/notice.",
  "Create retention and deletion rules for old student records, parent contacts, app data, photos and CCTV footage.",
];

const BUCKET_RECS: Record<string, string> = {
  children_consent:
    "Create a parent/guardian notice and consent workflow for students below 18. Cover admission data, school apps, photos, CCTV, transport, LMS, communication channels and vendor platforms.",
  student_parent_data:
    "Map student and parent data across admission, fee, academic, health, transport, hostel, exam, app and communication workflows. Define what data is collected, why, and who can access it.",
  monitoring_safety_systems:
    "Review CCTV, biometric, RFID, transport GPS and hostel monitoring systems. Define purpose, access rights, retention duration, signage/notice and escalation rules.",
  learning_vendor_platform:
    "Create a school technology and vendor register covering ERP, LMS, parent app, fee portal, online exam tools, transport vendors, EdTech platforms, CCTV vendors and IT support providers.",
  retention_sharing_rights:
    "Define retention and sharing rules for old student files, parent contact details, photos, videos, certificates, app records, CCTV footage, placement data and alumni records.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "children_consent",
    "student_parent_data",
    "monitoring_safety_systems",
    "learning_vendor_platform",
    "retention_sharing_rights",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your consent, communication, monitoring and vendor practices consistent, and set a periodic review of retention and student-data sharing."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your school or college appears to have basic student-data controls in place. Your next step is to document these practices, review school apps and vendors, and ensure parent consent, student photos, CCTV and retention rules are clearly governed.",
  "Moderate Risk":
    "Your institution has some student-data controls, but several practices may be informal. Focus first on parent consent, school apps, WhatsApp groups, student photos, monitoring systems, vendor access and old record retention.",
  "High Risk":
    "Your school or college may have significant DPDPA exposure across children's data, parent records, school apps, CCTV, attendance, transport data, student photos, vendor platforms or old records. Your first priority is to control consent, communication, monitoring systems, vendor access and retention.",
  "Critical Risk":
    "Your school or college may have serious DPDPA exposure. This usually happens when children's data, parent details, student photos, CCTV, biometrics, transport GPS, school apps, WhatsApp groups, fee portals, vendors and old records are managed informally — without consent evidence, access controls, retention rules or incident readiness.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const schoolsCollegesPack: IndustryPack = {
  industry: "schools-colleges",
  route: "/assessment/schools-colleges",
  reportType: "school", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "School & College DPDPA Risk Scan",
    hero: "Your institution does not just educate students. It collects, monitors and shares student data every day.",
    sub: "From admission forms and parent records to school apps, WhatsApp groups, CCTV, attendance, transport GPS, fee portals, student photos, health records and old student files — schools and colleges handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise in your student and parent data workflows. It collects no student data — only your answers about your processes.",
    cta: "Start School / College Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Children's Data",
      "Parent Records",
      "School Apps",
      "CCTV",
      "Attendance",
      "Transport GPS",
      "Student Photos",
      "Fee Records",
      "LMS",
      "Old Student Files",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "School & College DPDPA Starter Checklist",
    href: "/templates/school-college-dpdpa-starter-checklist.pdf",
  },
};

export default schoolsCollegesPack;

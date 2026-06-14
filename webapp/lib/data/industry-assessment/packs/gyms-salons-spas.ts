// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Gyms, Salons & Spas (12th)
// "Gym, Salon & Spa DPDPA Risk Scan" — a wellness-customer data risk scan.
// Caps for Q1–Q10 sum to 110; the engine normalises by Σ caps automatically.
// Plain additive scoring — no credit options, so no engine interaction.
//
// Thesis: wellness businesses don't only manage appointments — they collect
// health/body data, consultation notes and customer photos that move across
// booking apps, WhatsApp, Instagram DMs, staff phones and old member databases.
// Two-lens: exposure = Q1,Q2,Q4,Q6,Q7 (54) · control = Q3,Q5,Q8,Q9,Q10 (56).
//
// LEGAL-COPY: "high-impact health data", never "sensitive"; photo use framed as
// DPDPA notice + consent + removal, not generic "image rights".
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
    key: "customer_membership_data",
    label: "Customer & membership data risk",
    meaning: "Member, booking, payment and preference data may need stronger mapping.",
  },
  {
    key: "health_body_consultation_data",
    label: "Health, body & consultation data risk",
    meaning: "Fitness, body, health or consultation notes may require stronger access control.",
  },
  {
    key: "photos_marketing_whatsapp",
    label: "Photos, marketing & WhatsApp risk",
    meaning: "Photos, testimonials and campaigns may need clearer consent and opt-out controls.",
  },
  {
    key: "app_staff_vendor_access",
    label: "App, staff & vendor access risk",
    meaning: "Appointment apps, staff phones, CRM and vendor access may need review.",
  },
  {
    key: "retention_rights_incident",
    label: "Retention & incident readiness risk",
    meaning: "Old photos, notes and customer records may be retained without clear rules.",
  },
];

// option-id groups reused by overrides/flags
const PHOTO_HEALTH_DATA = ["photos_videos", "fitness_body_data", "health_declaration", "consultation_notes"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Wellness business profile ──────────────────────────────────────
  {
    id: "q1",
    badge: "Wellness Business Profile",
    question: "What type of wellness or personal-care business do you operate?",
    helpText: "Select all that apply. This helps estimate your customer, health, photo and appointment-data risk profile.",
    whyThisMatters:
      "Fitness, spa, skin, hair and wellness services may collect health, body, image and preference data beyond basic contact details.",
    type: "multi",
    cap: 8,
    bucket: "customer_membership_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "gym", label: "Gym / fitness centre", riskPoints: 4 },
      { id: "yoga_pilates", label: "Yoga / Pilates / fitness studio", riskPoints: 3 },
      { id: "personal_training", label: "Personal training / coaching business", riskPoints: 5 },
      { id: "salon", label: "Salon / beauty parlour", riskPoints: 4 },
      { id: "spa_massage", label: "Spa / massage / therapy centre", riskPoints: 6 },
      { id: "skin_hair_wellness", label: "Skin / hair / aesthetic wellness centre", riskPoints: 6 },
      { id: "bridal_event", label: "Bridal makeup / event styling service", riskPoints: 5 },
      { id: "wellness_chain", label: "Wellness chain / multi-branch business", riskPoints: 6 },
      { id: "franchise_partner", label: "Franchise / partner-run centre", riskPoints: 5 },
      { id: "other", label: "Other wellness or personal-care service", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Customer & member data ─────────────────────────────────────────
  {
    id: "q2",
    badge: "Customer & Membership Data Risk",
    question: "What customer or member data do you collect or store?",
    helpText: "This scan never asks for any customer record, photo or health note — only your business's data categories. Select all customer, membership, appointment, payment, health, photo or consultation data your business collects.",
    whyThisMatters:
      "A gym, salon or spa may collect data that reveals health, body, appearance, lifestyle, treatment preferences and intimate personal choices.",
    type: "multi",
    cap: 12,
    bucket: "customer_membership_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact", label: "Customer/member name, phone number and email", riskPoints: 2 },
      { id: "address_emergency", label: "Address, age, gender or emergency contact", riskPoints: 4 },
      { id: "membership_appointment", label: "Membership plan, package or appointment history", riskPoints: 3 },
      { id: "payment_invoice", label: "Payment, invoice, refund or wallet details", riskPoints: 3 },
      { id: "service_preferences", label: "Service history, preferences or product recommendations", riskPoints: 4 },
      { id: "fitness_body_data", label: "Fitness goals, weight, BMI, body measurements or progress data", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "health_declaration", label: "Medical conditions, injuries, allergies or health declarations", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "consultation_notes", label: "Skin, hair, body, therapy or consultation notes", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "photos_videos", label: "Customer photos, videos or before-after images", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "family_group", label: "Family member / couple / group booking details", riskPoints: 4 },
      { id: "other", label: "Other customer data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q3 Health & body data ─────────────────────────────────────────────
  {
    id: "q3",
    badge: "Health, Body & Consultation Risk",
    question: "Do you collect health, fitness, body, skin, hair or therapy-related information?",
    helpText: "This includes body measurements, fitness goals, injuries, allergies, skin/hair notes, wellness notes and therapy-related information.",
    whyThisMatters:
      "Health and body-related information requires stronger care, even if the business is not a medical provider.",
    type: "single",
    cap: 12,
    bucket: "health_body_consultation_data",
    layer: "control",
    options: [
      { id: "necessary_restricted", label: "Yes, but only what is necessary and access is restricted", riskPoints: 2, badge: "GOOD", badgeColor: "green" },
      { id: "informal_controls", label: "Yes, collected by trainers/therapists/beauticians, but controls are informal", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "apps_whatsapp_notes_no_control", label: "Yes, recorded in apps, forms, WhatsApp or staff notes without clear access control", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "basic_only", label: "No, we collect only basic contact and appointment information", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q4 Data intake ────────────────────────────────────────────────────
  {
    id: "q4",
    badge: "Data Intake Risk",
    question: "How do customers usually share personal details, photos, health notes or appointment information?",
    helpText: "Select all channels used by customers, trainers, beauticians, therapists, front desk staff or social media teams.",
    whyThisMatters:
      "Photos, health notes, consultation data and appointment information often enter through WhatsApp, DMs and staff phones, which are difficult to govern.",
    type: "multi",
    cap: 10,
    bucket: "customer_membership_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "secure_form", label: "Secure app / website / booking form", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "in_person_form", label: "In-person membership or consultation form", riskPoints: 2 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "social_dms", label: "Instagram / Facebook DMs", riskPoints: 5 },
      { id: "phone_calls", label: "Phone calls handled by staff", riskPoints: 3 },
      { id: "staff_notes", label: "Trainer / beautician / therapist collects notes directly", riskPoints: 5 },
      { id: "forms_sheets", label: "Google Forms / spreadsheets", riskPoints: 5 },
      { id: "personal_phone_photos", label: "Staff collect photos or videos on personal phones", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q5 Photos & testimonials ──────────────────────────────────────────
  {
    id: "q5",
    badge: "Photo & Testimonial Consent",
    question: "Do you use customer photos, videos, before-after results, testimonials or transformation stories for marketing?",
    helpText: "This scan asks about your process, not your customers. Covers Instagram posts, reels, ads, website images, bridal photos, transformation posts and customer testimonials.",
    whyThisMatters:
      "Before-after images, transformation photos, bridal photos, skin/hair results and testimonials can expose appearance, body, treatment and lifestyle data — using them needs consent and a removal route under DPDPA.",
    type: "single",
    cap: 12,
    bucket: "photos_marketing_whatsapp",
    layer: "control",
    options: [
      { id: "documented_consent_removal", label: "Yes, with documented consent and a removal process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "inconsistent_consent", label: "Yes, consent is taken but not consistently documented", riskPoints: 4 },
      { id: "no_separate_consent", label: "Yes, photos/videos are often used for social media or ads without separate consent", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_photo_marketing", label: "No, we do not use customer photos/videos/testimonials for marketing", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q6 Communication channels ─────────────────────────────────────────
  {
    id: "q6",
    badge: "WhatsApp & Marketing Risk",
    question: "Which communication and marketing channels do you use?",
    helpText: "Select all channels used for appointment reminders, offers, campaigns, membership renewals and promotional communication.",
    whyThisMatters:
      "Marketing and appointment communication must be separated. Customers should be able to opt out of promotions without losing service updates.",
    type: "multi",
    cap: 10,
    bucket: "photos_marketing_whatsapp",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "whatsapp_reminders", label: "WhatsApp appointment reminders", riskPoints: 3 },
      { id: "whatsapp_promotions", label: "WhatsApp promotional campaigns", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "sms", label: "SMS offers or reminders", riskPoints: 4 },
      { id: "email", label: "Email offers or newsletters", riskPoints: 3 },
      { id: "social_dms", label: "Instagram / Facebook DMs", riskPoints: 5 },
      { id: "phone_calls", label: "Phone calls by sales/front desk team", riskPoints: 3 },
      { id: "push_notifications", label: "App push notifications", riskPoints: 3 },
      { id: "transactional_only", label: "We send only transactional appointment messages", riskPoints: 1, badge: "GOOD", badgeColor: "green" },
      { id: "multiple_no_preference", label: "Multiple channels, no central preference record", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q7 Apps & vendors ─────────────────────────────────────────────────
  {
    id: "q7",
    badge: "App, Tool & Vendor Risk",
    question: "Which systems, apps or vendors process customer data?",
    helpText: "Select all appointment, membership, CRM, payment, WhatsApp, fitness, CCTV, loyalty, marketing or IT vendors involved in your workflows.",
    whyThisMatters:
      "Wellness businesses often depend on appointment apps, membership tools, CRM, WhatsApp vendors, fitness devices and marketing agencies that may access customer data.",
    type: "multi",
    cap: 14,
    bucket: "app_staff_vendor_access",
    layer: "exposure",
    mutuallyExclusive: ["no_external_systems", "not_sure"],
    options: [
      { id: "appointment_app", label: "Appointment booking app / scheduling tool", riskPoints: 3 },
      { id: "gym_software", label: "Gym management / membership software", riskPoints: 4 },
      { id: "salon_spa_pos_crm", label: "Salon/spa POS or CRM software", riskPoints: 4 },
      { id: "payment_provider", label: "Payment gateway / wallet / billing provider", riskPoints: 2 },
      { id: "communication_platform", label: "WhatsApp Business / SMS / email platform", riskPoints: 5 },
      { id: "fitness_biometric_device", label: "Fitness tracking / body analysis / biometric device", riskPoints: 8, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "cctv_access_control", label: "CCTV / access-control system", riskPoints: 5 },
      { id: "franchise_platform", label: "Franchise / branch management platform", riskPoints: 5 },
      { id: "loyalty_referral", label: "Loyalty / referral / membership platform", riskPoints: 4 },
      { id: "marketing_agency", label: "Marketing agency / social media manager", riskPoints: 5 },
      { id: "it_vendor", label: "IT vendor / software support provider", riskPoints: 4 },
      { id: "no_external_systems", label: "We do not use external systems or vendors", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q8 Staff & vendor access ──────────────────────────────────────────
  {
    id: "q8",
    badge: "Staff, Branch & Vendor Access",
    question: "How is access controlled for trainers, beauticians, therapists, front desk staff, branch staff or vendors?",
    helpText: "This includes staff phones, WhatsApp accounts, appointment apps, CRM tools, branch systems, shared logins and ex-staff access.",
    whyThisMatters:
      "The biggest risk often sits with staff access, personal phones, shared accounts and ex-staff access to customer lists or photos.",
    type: "single",
    cap: 12,
    bucket: "app_staff_vendor_access",
    layer: "control",
    options: [
      { id: "role_based_reviewed", label: "Access is role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_review", label: "Core staff access is controlled, but review is informal", riskPoints: 3 },
      { id: "broad_staff_access", label: "Trainers/beauticians/therapists can access many customer profiles", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "personal_phone_whatsapp", label: "Staff use personal phones or personal WhatsApp for customer communication", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "shared_logins", label: "Multiple staff/branches/vendors share logins or accounts", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_vendor_access", label: "Ex-staff or old vendor/branch access may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Customer Record Retention",
    question: "How long do you retain old member records, consultation notes, photos, appointment history and WhatsApp chats?",
    helpText: "The issue is not retention itself. The issue is uncontrolled retention of old customer records, photos and consultation notes.",
    whyThisMatters:
      "Customer photos, consultation notes, body metrics and old appointment records should not be kept indefinitely without purpose, review and access controls.",
    type: "single",
    cap: 10,
    bucket: "retention_rights_incident",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_marketing", label: "We retain old customer records for years for repeat bookings or marketing", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most customer data, photos and consultation notes indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if customer photos, health notes, appointment records, WhatsApp chats, staff phones or app access are compromised or shared with the wrong person?",
    helpText: "This checks whether your business can respond quickly to wrong-photo sharing, exposed customer records, compromised staff phones or app access.",
    whyThisMatters:
      "Wrong-photo sharing, leaked transformation images, exposed health notes, compromised staff phones or app access can create serious privacy and trust damage.",
    type: "single",
    cap: 10,
    bucket: "retention_rights_incident",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_owner_it", label: "Owner/manager/IT vendor would handle it informally", riskPoints: 4 },
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

// "Photo or health/body data present" — reused by Overrides 3b/6/7.
const hasPhotoOrHealthData = (a: IAAnswers) =>
  anyOf(a, "q2", PHOTO_HEALTH_DATA) ||
  has(a, "q5", "no_separate_consent") ||
  anyOf(a, "q3", ["apps_whatsapp_notes_no_control", "informal_controls"]);

// ── Overrides (raise-only) ────────────────────────────────────────────────────
// Two conditional Moderate→High pairs (Override 3 and Override 5). Max reached
// here is High Risk — Critical remains reachable via raw score.

const OVERRIDES: IAOverride[] = [
  {
    id: "photos_no_consent",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q5", "no_separate_consent"),
    flag: "Customer photos, before-after images or testimonials are used for social media/ads without separate consent or a removal process.",
  },
  {
    id: "health_data_informal_channels",
    minBand: "High Risk",
    severity: 8,
    test: (a) =>
      (has(a, "q3", "apps_whatsapp_notes_no_control") || has(a, "q2", "health_declaration")) &&
      anyOf(a, "q4", ["whatsapp", "personal_phone_photos"]),
    flag: "Health/body declarations or notes are captured via WhatsApp or staff personal phones without clear access control.",
  },
  // Override 3 — staff personal phones. Moderate alone; High with photo/health data.
  {
    id: "staff_personal_phones",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => has(a, "q8", "personal_phone_whatsapp"),
    flag: "Staff use personal phones or personal WhatsApp for customer communication — customer data sits on devices outside any control.",
  },
  {
    id: "staff_personal_phones_with_sensitive",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q8", "personal_phone_whatsapp") && hasPhotoOrHealthData(a),
    flag: "Staff use personal phones for customer communication while the business holds customer photos or health/body data.",
  },
  {
    id: "shared_or_ex_staff_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q8", ["shared_logins", "ex_staff_vendor_access"]),
    flag: "Shared logins or ex-staff/vendor access mean customer lists, photos and notes may be reachable by people who no longer need them.",
  },
  // Override 5 — biometric/body-analysis device. Moderate alone; High with informal health controls.
  {
    id: "biometric_device",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => has(a, "q7", "fitness_biometric_device"),
    flag: "Fitness-tracking, body-analysis or biometric devices process customer body data — keep purpose clear and access restricted.",
  },
  {
    id: "biometric_device_informal_controls",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q7", "fitness_biometric_device") && has(a, "q3", "informal_controls"),
    flag: "Body-analysis or biometric device data is handled with informal controls over health/body information.",
  },
  {
    id: "indefinite_photo_health",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && hasPhotoOrHealthData(a),
    flag: "Customer photos, consultation notes and body metrics are kept indefinitely with no retention or deletion rule.",
  },
  {
    id: "no_incident_photo_health",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && hasPhotoOrHealthData(a),
    flag: "There's no process for a wrong-photo share or exposed health note, while the business holds customer photos or health/body data.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "customer_data_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["address_emergency", "service_preferences", "family_group"]),
    flag: "Member profiles, appointment history, preferences and emergency contacts may be collected without a clear customer-data map.",
  },
  {
    id: "health_body_breadth",
    severity: 7,
    test: (a) => anyOf(a, "q2", ["fitness_body_data", "health_declaration", "consultation_notes"]) || anyOf(a, "q3", ["informal_controls", "apps_whatsapp_notes_no_control"]),
    flag: "Fitness goals, weight, BMI, injuries, allergies, skin/hair or therapy notes are high-impact health data and may lack clear access control.",
  },
  {
    id: "photo_marketing",
    severity: 6,
    test: (a) => has(a, "q2", "photos_videos") || anyOf(a, "q5", ["inconsistent_consent", "no_separate_consent"]),
    flag: "Customer photos, before-after images, bridal photos or testimonials may be used for marketing without consistent consent evidence.",
  },
  {
    id: "intake_channels",
    severity: 6,
    test: (a) => anyOf(a, "q4", ["whatsapp", "social_dms", "personal_phone_photos", "multiple_no_standard"]),
    flag: "Customer details, photos and health notes may enter through WhatsApp, DMs and staff phones without one standard process.",
  },
  {
    id: "marketing_preference_gap",
    severity: 5,
    test: (a) => anyOf(a, "q6", ["whatsapp_promotions", "multiple_no_preference"]),
    flag: "Promotional WhatsApp/SMS campaigns may be sent without a central opt-out or preference record.",
  },
  {
    id: "vendor_access",
    severity: 6,
    test: (a) => anyOf(a, "q7", ["fitness_biometric_device", "cctv_access_control", "marketing_agency"]),
    flag: "Appointment apps, fitness/biometric devices, CCTV and marketing agencies may process customer data without a clear vendor register.",
  },
  {
    id: "broad_access",
    severity: 5,
    test: (a) => anyOf(a, "q8", ["broad_staff_access", "personal_phone_whatsapp", "shared_logins", "ex_staff_vendor_access"]),
    flag: "Trainers, beauticians, therapists, front desk staff or ex-staff may have broader customer-data access than necessary.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Map customer data across forms, booking apps, WhatsApp, Instagram DMs and staff notes — what's collected, why, and who can access it.",
  "Capture consent before using customer photos, before-after images or testimonials, and offer a simple removal process.",
  "Restrict access to health, body, consultation and transformation data — only the staff who genuinely need it.",
  "Review appointment apps, CRM, staff phones, shared logins, biometric devices and vendor access — remove ex-staff and old vendor access.",
  "Define retention and removal rules for old photos, customer records, consultation notes and WhatsApp chats, plus a wrong-recipient/breach response.",
];

const BUCKET_RECS: Record<string, string> = {
  customer_membership_data:
    "Map customer and membership data across booking, walk-in registration, WhatsApp, Instagram DMs, payment records, appointment history, emergency contacts and service preferences.",
  health_body_consultation_data:
    "Apply stronger controls to health, body and consultation data. Limit access to fitness goals, weight, BMI, injuries, allergies, skin/hair notes, therapy notes and transformation records.",
  photos_marketing_whatsapp:
    "Create a photo and marketing consent workflow. Capture consent before using customer photos, before-after images, bridal photos, testimonials or transformation posts, and provide a removal process and a marketing opt-out.",
  app_staff_vendor_access:
    "Review access to appointment apps, gym software, salon CRM, WhatsApp accounts, staff phones, franchise systems, payment tools, CCTV and vendor support accounts. Remove ex-staff and old vendor access.",
  retention_rights_incident:
    "Define retention and incident-response rules for old customer records, photos, consultation notes, body metrics, appointment history, WhatsApp chats and wrong-recipient sharing.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "health_body_consultation_data",
    "photos_marketing_whatsapp",
    "customer_membership_data",
    "app_staff_vendor_access",
    "retention_rights_incident",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your photo consent, health-data handling, staff access and retention practices consistent, and set a periodic review."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your gym, salon or spa appears to have basic customer-data controls in place. Your next step is to document these practices, review photo consent, control staff access and define retention rules for old customer records, photos and consultation notes.",
  "Moderate Risk":
    "Your gym, salon or spa has some customer-data controls, but several photo, WhatsApp, staff-access or retention practices may be informal. Focus first on customer photo consent, health/body data handling, promotional messaging, appointment app access and old record retention.",
  "High Risk":
    "Your gym, salon or spa may have significant DPDPA exposure across membership data, health/fitness details, body measurements, customer photos, appointment apps, WhatsApp campaigns, staff phones or old customer records. Your first priority is to control photo consent, staff access, health/body data and retention.",
  "Critical Risk":
    "Your gym, salon or spa may have serious DPDPA exposure. This usually happens when health details, body measurements, consultation notes, before-after photos, WhatsApp campaigns, appointment apps, staff phones, shared logins and old customer records are managed informally — without consent evidence, access control, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const gymsSalonsSpasPack: IndustryPack = {
  industry: "gyms-salons-spas",
  route: "/assessment/gyms-salons-spas",
  reportType: "wellness", // short token — "gyms-salons-spas" is 15 chars; Appwrite `report_type` is string(10)
  positioning: {
    title: "Gym, Salon & Spa DPDPA Risk Scan",
    hero: "Your wellness business does not just manage appointments. It stores health, body and image data every day.",
    sub: "From membership forms and appointment apps to body measurements, health notes, skin/hair consultations, customer photos, WhatsApp campaigns, staff phones and old customer records — gyms, salons and spas handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise in your customer-data workflows. It collects no customer photos, health notes or records — only your answers about your processes.",
    cta: "Start Gym / Salon / Spa Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Membership Data",
      "Health Details",
      "Body Measurements",
      "Customer Photos",
      "Before-After Images",
      "WhatsApp Campaigns",
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
    title: "Gym / Salon / Spa DPDPA Starter Checklist",
    href: "/templates/gyms-salons-spas-dpdpa-starter-checklist.pdf",
  },
};

export default gymsSalonsSpasPack;

// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Pharmacies / Online Pharmacies (10th)
// "Pharmacy DPDPA Risk Scan" — a prescription-and-medicine data risk scan.
// Caps for Q1–Q10 sum to 112; the engine normalises by Σ caps automatically.
// Plain additive scoring — no credit options, so no engine interaction.
//
// Thesis: pharmacies don't only sell medicines — they collect prescriptions,
// medicine history, doctor names, refill patterns and health indicators that
// move across WhatsApp, billing software, delivery partners and old folders.
// Two-lens: exposure = Q1,Q2,Q3,Q4,Q6 (58) · control = Q5,Q7,Q8,Q9,Q10 (54).
//
// LEGAL-COPY NOTE: DPDPA does not create a GDPR-style "sensitive personal data"
// tier. Copy says "high-impact health data" / "health indicators", never a
// statutory special-category claim — consistent with the published glossary.
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
    key: "customer_prescription_data",
    label: "Customer & prescription data risk",
    meaning: "Prescription images, customer contact and medicine-order data may need stronger mapping.",
  },
  {
    key: "health_indicator_medicine_history",
    label: "Health indicator & medicine-history risk",
    meaning: "Medicine history may reveal health conditions and needs stronger controls.",
  },
  {
    key: "order_delivery_vendor_sharing",
    label: "Order, delivery & vendor-sharing risk",
    meaning: "Delivery, telemedicine, marketplace and partner sharing may create exposure.",
  },
  {
    key: "system_staff_access",
    label: "System, staff & access risk",
    meaning: "Billing software, WhatsApp, staff phones and branch access may need review.",
  },
  {
    key: "retention_refill_incident",
    label: "Retention, refill & incident readiness risk",
    meaning: "Old prescriptions, refill reminders and incident processes may not be mature.",
  },
];

// option-id groups reused by overrides/flags
const SENSITIVE_MED_CATEGORIES = ["mental_health", "fertility_reproductive", "sexual_health", "oncology", "hiv_infectious", "chronic_care"];
const PRESCRIPTION_DATA = ["prescription_image", "medicine_history", "diagnosis_notes"];
const DELIVERY_VENDOR_SHARING = ["delivery_partner", "marketplace_aggregator", "telemedicine_platform"];
const SCATTERED_STORAGE = ["whatsapp", "email_inboxes", "staff_devices", "multiple_no_sot"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Pharmacy profile ───────────────────────────────────────────────
  {
    id: "q1",
    badge: "Pharmacy Profile",
    question: "What type of pharmacy business do you operate?",
    helpText: "Select all that apply. This helps estimate your prescription, medicine-history and delivery-risk profile.",
    whyThisMatters:
      "Online pharmacies, chronic-refill models and telemedicine-linked workflows create more data flows, vendor sharing and health profiling risk than walk-in retail models.",
    type: "multi",
    cap: 8,
    bucket: "customer_prescription_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "local_retail", label: "Local retail pharmacy / chemist shop", riskPoints: 3 },
      { id: "chain", label: "Pharmacy chain / multiple branches", riskPoints: 5 },
      { id: "online", label: "Online pharmacy / e-commerce pharmacy", riskPoints: 6 },
      { id: "hospital_clinic_attached", label: "Hospital-attached or clinic-attached pharmacy", riskPoints: 5 },
      { id: "home_delivery", label: "Home delivery / medicine delivery service", riskPoints: 5 },
      { id: "chronic_refill", label: "Chronic-care refill or subscription model", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "telemedicine_linked", label: "Telemedicine-linked pharmacy fulfilment", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "wellness_supplements", label: "Wellness / supplements / nutraceuticals seller", riskPoints: 3 },
      { id: "franchise_partner", label: "Franchise / partner-run pharmacy", riskPoints: 5 },
      { id: "other", label: "Other pharmacy model", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Customer & prescription data ───────────────────────────────────
  {
    id: "q2",
    badge: "Customer & Prescription Data Risk",
    question: "What customer or patient data do you collect or store?",
    helpText: "Select all prescription, medicine, payment, delivery, doctor or family-member data your pharmacy collects.",
    whyThisMatters:
      "Medicine history can reveal health conditions even where no diagnosis is explicitly collected.",
    type: "multi",
    cap: 12,
    bucket: "customer_prescription_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact", label: "Customer/patient name, phone number and email", riskPoints: 2 },
      { id: "delivery_address", label: "Delivery address and location details", riskPoints: 4 },
      { id: "prescription_image", label: "Prescription image or scanned prescription", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "doctor_details", label: "Doctor name, clinic or hospital details", riskPoints: 4 },
      { id: "medicine_history", label: "Medicine order history", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "billing_payment", label: "Billing, payment, refund or invoice data", riskPoints: 4 },
      { id: "family_caregiver", label: "Family member / caregiver order details", riskPoints: 4 },
      { id: "age_gender_profile", label: "Age, gender or patient profile details", riskPoints: 3 },
      { id: "diagnosis_notes", label: "Health condition notes or diagnosis information", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "loyalty_wallet", label: "Loyalty, wallet, coupon or membership data", riskPoints: 3 },
      { id: "other", label: "Other customer/patient data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q3 Medicine category / health indicators ──────────────────────────
  {
    id: "q3",
    badge: "Medicine History & Health Indicator Risk",
    question: "Which types of medicines or health categories do you regularly handle?",
    helpText: "This scan never asks for any patient name, prescription or order — only your business's medicine categories. Medicine categories can reveal health conditions even when diagnosis data is not directly collected.",
    whyThisMatters:
      "Even without diagnosis fields, medicine categories can reveal high-impact health indicators and long-term conditions.",
    type: "multi",
    cap: 14,
    bucket: "health_indicator_medicine_history",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "otc", label: "General OTC medicines", riskPoints: 1 },
      { id: "prescription_meds", label: "Prescription medicines", riskPoints: 5 },
      { id: "chronic_care", label: "Diabetes / BP / cardiac / chronic-care medicines", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "mental_health", label: "Mental health / psychiatric medicines", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "fertility_reproductive", label: "Fertility / pregnancy / reproductive health medicines", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "sexual_health", label: "Sexual health medicines", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "oncology", label: "Oncology / cancer-care medicines", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "hiv_infectious", label: "HIV / infectious disease medicines", riskPoints: 8, badge: "SENSITIVE", badgeColor: "red" },
      { id: "pain_controlled", label: "Pain management or controlled/scheduled medicines", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "elderly_disability", label: "Elderly care / home care / disability-related medicines", riskPoints: 6 },
      { id: "supplements_only", label: "Wellness, nutraceuticals or supplements only", riskPoints: 2 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q4 Prescription intake ────────────────────────────────────────────
  {
    id: "q4",
    badge: "Prescription Intake Risk",
    question: "How do customers share prescriptions or medicine requirements with you?",
    helpText: "Select all channels used for prescription images, medicine requests, refill orders and doctor-issued prescriptions.",
    whyThisMatters:
      "Prescription images on WhatsApp, email and delivery-agent phones can create high exposure if not controlled or deleted.",
    type: "multi",
    cap: 10,
    bucket: "customer_prescription_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "secure_upload", label: "Secure app / website upload", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "physical_prescription", label: "In-store physical prescription", riskPoints: 2 },
      { id: "whatsapp", label: "WhatsApp prescription image", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "email", label: "Email attachment", riskPoints: 5 },
      { id: "phone_call", label: "Phone call to pharmacist/staff", riskPoints: 3 },
      { id: "doctor_direct", label: "Doctor/clinic sends prescription directly", riskPoints: 4 },
      { id: "telemedicine_partner", label: "Telemedicine partner sends prescription", riskPoints: 5 },
      { id: "delivery_agent", label: "Delivery agent collects prescription/photo", riskPoints: 6 },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q5 Storage locations ──────────────────────────────────────────────
  {
    id: "q5",
    badge: "Storage & Access Risk",
    question: "Where are prescriptions, medicine history and customer order records stored?",
    helpText: "Select all software, chats, devices, folders, branch systems or physical files where prescription and order data is stored.",
    whyThisMatters:
      "Prescription and medicine data often sits in WhatsApp, billing systems, staff phones, delivery chats and physical files simultaneously.",
    type: "multi",
    cap: 12,
    bucket: "system_staff_access",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "pos_role_based", label: "Pharmacy billing/POS software with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "online_order_system", label: "Online pharmacy platform / order management system", riskPoints: 2 },
      { id: "whatsapp", label: "WhatsApp chats or groups", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "email_inboxes", label: "Email inboxes", riskPoints: 5 },
      { id: "staff_devices", label: "Staff phones or laptops", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "sheets_excel", label: "Google Sheets / Excel trackers", riskPoints: 5 },
      { id: "cloud_folders", label: "Cloud folders such as Google Drive / OneDrive / Dropbox", riskPoints: 5 },
      { id: "physical_files", label: "Physical prescription files", riskPoints: 4 },
      { id: "branch_systems", label: "Branch-level systems across multiple locations", riskPoints: 5 },
      { id: "multiple_no_sot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q6 External / delivery / vendor sharing ───────────────────────────
  {
    id: "q6",
    badge: "Delivery & Vendor Sharing Risk",
    question: "Which external parties receive customer, prescription or order data?",
    helpText: "Select all delivery, payment, telemedicine, hospital, platform, CRM, communication or IT vendors involved in your workflows.",
    whyThisMatters:
      "Prescription and medicine data often moves to delivery partners, platforms, telemedicine partners, payment providers, branches and communication tools.",
    type: "multi",
    cap: 14,
    bucket: "order_delivery_vendor_sharing",
    layer: "exposure",
    mutuallyExclusive: ["no_external_sharing", "not_sure"],
    options: [
      { id: "delivery_partner", label: "Delivery partner / courier / runner", riskPoints: 5 },
      { id: "payment_gateway", label: "Payment gateway or billing provider", riskPoints: 2 },
      { id: "marketplace_aggregator", label: "Online marketplace / pharmacy aggregator", riskPoints: 5 },
      { id: "telemedicine_platform", label: "Telemedicine platform or doctor network", riskPoints: 6 },
      { id: "hospital_clinic_partner", label: "Hospital / clinic partner", riskPoints: 5 },
      { id: "insurance_tpa", label: "Insurance / TPA / corporate health partner", riskPoints: 6 },
      { id: "communication_vendor", label: "WhatsApp/SMS/email communication vendor", riskPoints: 5 },
      { id: "crm_marketing", label: "Loyalty / CRM / marketing platform", riskPoints: 5 },
      { id: "franchise_branch", label: "Franchise / branch / partner pharmacy", riskPoints: 5 },
      { id: "it_vendor", label: "IT vendor / software support provider", riskPoints: 4 },
      { id: "no_external_sharing", label: "We do not share customer or prescription data externally", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q7 Refill / marketing messaging ───────────────────────────────────
  {
    id: "q7",
    badge: "Refill & Marketing Risk",
    question: "Do you send refill reminders, offers or health-related messages to customers?",
    helpText: "This includes WhatsApp, SMS, email or phone reminders based on medicine purchase history.",
    whyThisMatters:
      "Refill reminders can reveal health conditions. Promotional messages based on medicine history need careful handling.",
    type: "single",
    cap: 10,
    bucket: "retention_refill_incident",
    layer: "control",
    options: [
      { id: "optin_unsubscribe", label: "Yes, with opt-in and unsubscribe/preference process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_consent", label: "Yes, but consent or preference tracking is informal", riskPoints: 4 },
      { id: "based_on_history_no_consent", label: "Yes, based on purchase history or refill cycle without separate consent", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "no_messages", label: "No, we do not send refill or promotional messages", riskPoints: 0 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q8 Staff / branch / vendor access ─────────────────────────────────
  {
    id: "q8",
    badge: "Staff, Branch & Vendor Access",
    question: "How is access controlled for pharmacists, counter staff, delivery staff, branch staff or vendors?",
    helpText: "This includes billing software, WhatsApp accounts, branch systems, staff phones, delivery workflows and vendor support access.",
    whyThisMatters:
      "Pharmacy access is often operationally broad. Delivery staff and vendors should not see more prescription data than necessary.",
    type: "single",
    cap: 12,
    bucket: "system_staff_access",
    layer: "control",
    options: [
      { id: "role_based_reviewed", label: "Access is role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_review", label: "Core staff access is controlled, but review is informal", riskPoints: 3 },
      { id: "broad_pharmacy_access", label: "Pharmacists and counter staff can access most customer records", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "delivery_over_access", label: "Delivery staff or vendors can view prescription/order details beyond delivery need", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "shared_logins", label: "Multiple staff or branches share logins/passwords", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_vendor_access", label: "Ex-staff or old vendor/branch access may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Prescription Retention",
    question: "How long do you retain old prescriptions, medicine order history, WhatsApp chats and delivery records?",
    helpText: "The issue is not retention itself. The issue is uncontrolled indefinite retention of prescriptions and medicine-history data.",
    whyThisMatters:
      "Pharmacies often keep prescriptions, medicine history and WhatsApp orders long after the order is complete.",
    type: "single",
    cap: 10,
    bucket: "retention_refill_incident",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "years_refills", label: "We retain old prescriptions and order history for years for convenience/refills", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most customer and prescription records indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if prescriptions, medicine history, WhatsApp chats, delivery records or pharmacy software access are compromised or shared with the wrong person?",
    helpText: "This checks whether your pharmacy can respond quickly to wrong-prescription sharing, exposed WhatsApp orders or compromised billing software.",
    whyThisMatters:
      "Wrong-prescription sharing, exposed WhatsApp orders, compromised billing software or leaked medicine history can create serious privacy and trust exposure.",
    type: "single",
    cap: 10,
    bucket: "retention_refill_incident",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_owner_it", label: "Owner/pharmacist/IT vendor would handle it informally", riskPoints: 4 },
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
// Max band reached here is High Risk — Critical is reachable purely via raw score.
// Override 3 (medicine history + delivery/vendor sharing) is a conditional pair:
// Moderate alone, escalating to High when data also sits in WhatsApp/staff phones.

const OVERRIDES: IAOverride[] = [
  {
    id: "prescription_image_whatsapp",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q2", "prescription_image") && anyOf(a, "q4", ["whatsapp", "email"]),
    flag: "Prescription images are arriving over WhatsApp or email — easy to forward, hard to delete and control.",
  },
  {
    id: "sensitive_meds_refill_no_consent",
    minBand: "High Risk",
    severity: 9,
    test: (a) => anyOf(a, "q3", SENSITIVE_MED_CATEGORIES) && has(a, "q7", "based_on_history_no_consent"),
    flag: "Refill or promotional messages based on mental-health, fertility, chronic-care or other high-impact medicine history are sent without separate consent.",
  },
  // Override 3 — medicine history + delivery/vendor sharing. Moderate alone; High with scattered storage.
  {
    id: "medicine_history_sharing",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => has(a, "q2", "medicine_history") && anyOf(a, "q6", DELIVERY_VENDOR_SHARING),
    flag: "Medicine order history is shared with delivery partners, aggregators or telemedicine platforms — keep this purposeful and access-controlled.",
  },
  {
    id: "medicine_history_sharing_scattered",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q2", "medicine_history") && anyOf(a, "q6", DELIVERY_VENDOR_SHARING) && anyOf(a, "q5", ["whatsapp", "staff_devices"]),
    flag: "Medicine order history is shared with delivery partners, aggregators or telemedicine platforms — keep this purposeful and access-controlled.",
  },
  {
    id: "shared_or_ex_staff_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q8", ["shared_logins", "ex_staff_vendor_access"]),
    flag: "Shared logins or ex-staff/vendor access mean prescription and customer records may be reachable by people who no longer need them.",
  },
  {
    id: "indefinite_prescriptions",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && anyOf(a, "q2", PRESCRIPTION_DATA),
    flag: "Prescription images, medicine history or diagnosis notes are kept indefinitely with no retention or deletion rule.",
  },
  {
    id: "no_incident_scattered",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && anyOf(a, "q5", SCATTERED_STORAGE),
    flag: "Prescriptions and orders are scattered across WhatsApp, email, staff phones and multiple systems with no process for a wrong-recipient share or a breach.",
  },
  {
    id: "diagnosis_broad_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q2", "diagnosis_notes") && anyOf(a, "q8", ["broad_pharmacy_access", "delivery_over_access"]),
    flag: "Health condition / diagnosis notes are accessible to broad counter or delivery staff who don't need them.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "prescription_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["prescription_image", "medicine_history", "doctor_details", "diagnosis_notes"]),
    flag: "Prescription images, medicine history and doctor details may remain stored in WhatsApp, staff phones, inboxes or billing systems longer than necessary.",
  },
  {
    id: "health_indicator_breadth",
    severity: 7,
    test: (a) => anyOf(a, "q3", SENSITIVE_MED_CATEGORIES),
    flag: "Mental-health, fertility, sexual-health, chronic-care, oncology or HIV-related medicines can reveal high-impact health indicators if used for reminders or targeting.",
  },
  {
    id: "vendor_delivery_sharing",
    severity: 6,
    test: (a) => anyOf(a, "q6", ["delivery_partner", "marketplace_aggregator", "telemedicine_platform", "insurance_tpa"]),
    flag: "Prescription and order data may be shared with delivery partners, platforms, telemedicine partners or insurers without clear purpose and retention controls.",
  },
  {
    id: "storage_sprawl",
    severity: 6,
    test: (a) => anyOf(a, "q5", SCATTERED_STORAGE),
    flag: "Customer and prescription records may be scattered across billing software, WhatsApp, staff phones, sheets and branch systems.",
  },
  {
    id: "broad_access",
    severity: 5,
    test: (a) => anyOf(a, "q8", ["broad_pharmacy_access", "delivery_over_access", "shared_logins", "ex_staff_vendor_access"]),
    flag: "Pharmacists, counter staff, delivery staff or vendors may have broader access to prescription data than necessary.",
  },
  {
    id: "refill_consent_gap",
    severity: 6,
    test: (a) => anyOf(a, "q7", ["informal_consent", "based_on_history_no_consent"]),
    flag: "Refill reminders based on medicine history may be sent without clear opt-in, unsubscribe or preference controls.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["years_refills", "indefinitely"]),
    flag: "Old prescriptions, medicine order history and WhatsApp orders may be retained indefinitely without a documented schedule.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Standardise prescription collection and storage — define a secure way to receive prescription images instead of scattered WhatsApp and staff phones.",
  "Reduce WhatsApp and staff-phone handling of prescription images — prefer a secure app/upload and don't keep duplicate copies on personal devices.",
  "Limit delivery partner and vendor access to only what is needed for fulfilment — they should not see full prescription or medicine-history details.",
  "Review pharmacy billing/POS software, branch and staff access — remove ex-staff and old vendor access, and limit by role and need.",
  "Define retention and refill-message rules for old prescription and medicine-history data, plus a simple wrong-recipient/breach response.",
];

const BUCKET_RECS: Record<string, string> = {
  customer_prescription_data:
    "Map prescription and customer data across in-store orders, WhatsApp, website/app uploads, billing software, delivery workflows and family-member purchases. Define what is collected, why and who can access it.",
  health_indicator_medicine_history:
    "Apply stronger controls to medicine-history data. Avoid using high-impact medicine categories for promotional targeting without clear consent and preference controls.",
  order_delivery_vendor_sharing:
    "Create a vendor-sharing register covering delivery partners, payment gateways, online platforms, telemedicine partners, hospital/clinic partners, CRM tools, WhatsApp/SMS vendors and IT support providers.",
  system_staff_access:
    "Review access to pharmacy billing software, online pharmacy dashboards, WhatsApp accounts, staff phones, branch systems and vendor support accounts. Remove ex-staff and old vendor access.",
  retention_refill_incident:
    "Define retention and incident-response rules for old prescriptions, medicine order history, WhatsApp chats, delivery records, refill reminders and wrong-recipient prescription sharing.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "customer_prescription_data",
    "health_indicator_medicine_history",
    "order_delivery_vendor_sharing",
    "system_staff_access",
    "retention_refill_incident",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your prescription handling, vendor sharing, staff access and retention practices consistent, and set a periodic review."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your pharmacy appears to have basic prescription and customer-data controls in place. Your next step is to document these practices, review prescription storage, control vendor access and define retention rules for old prescription and medicine-history records.",
  "Moderate Risk":
    "Your pharmacy has some controls, but several prescription, order, refill or vendor-sharing practices may be informal. Focus first on WhatsApp prescription sharing, medicine-history handling, delivery partner access, refill reminders and old prescription retention.",
  "High Risk":
    "Your pharmacy may have significant DPDPA exposure across prescriptions, medicine history, health indicators, WhatsApp orders, delivery partners, refill reminders, staff access or old record retention. Your first priority is to control prescription intake, access, vendor sharing, refill messaging and retention.",
  "Critical Risk":
    "Your pharmacy may have serious DPDPA exposure. This usually happens when prescription images, medicine history, health indicators, WhatsApp orders, delivery records, refill reminders, billing software, shared staff access and old customer records are managed informally — without access control, preference management, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const pharmaciesPack: IndustryPack = {
  industry: "pharmacies",
  route: "/assessment/pharmacies",
  reportType: "pharmacy", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "Pharmacy DPDPA Risk Scan",
    hero: "Your pharmacy does not just sell medicines. It stores prescription and medicine-history data every day.",
    sub: "From prescription images and WhatsApp orders to medicine history, refill reminders, delivery partners, billing software, staff phones and old customer records — pharmacies handle health-linked personal data at every step. This 3-minute scan shows where DPDPA exposure may arise. It never asks for any patient name, prescription or medicine order — only your answers about your business processes.",
    cta: "Start Pharmacy Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Prescriptions",
      "Medicine History",
      "WhatsApp Orders",
      "Refill Reminders",
      "Delivery Partners",
      "Health Indicators",
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
    title: "Pharmacy DPDPA Starter Checklist",
    href: "/templates/pharmacy-dpdpa-starter-checklist.pdf",
  },
};

export default pharmaciesPack;

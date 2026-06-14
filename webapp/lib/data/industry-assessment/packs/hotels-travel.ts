// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Hotels, Hospitality & Travel (9th)
// "Hotels & Travel DPDPA Risk Scan" — a guest-and-travel data risk scan.
// Caps for Q1–Q10 sum to 112; the engine normalises by Σ caps automatically.
// Q8 offers a −4 "documented controls" credit; the engine floors questionRisk
// at 0, so no engine interaction is required (same precedent as clinics/schools).
//
// Thesis: hotels and travel agencies don't fail privacy from carelessness — guest
// and traveller data simply moves across too many parties (front desk, OTAs,
// WhatsApp, agents, visa processors, transport vendors, PMS, CCTV, old folders).
// Two-lens: exposure = Q1,Q2,Q3,Q4,Q6 (58) · control = Q5,Q7,Q8,Q9,Q10 (54).
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
    key: "guest_traveller_data",
    label: "Guest & traveller data risk",
    meaning: "Guest, companion, booking and travel details may need stronger mapping.",
  },
  {
    key: "id_passport_travel_document",
    label: "ID, passport & travel-document risk",
    meaning: "Aadhaar, passport, visa and travel documents may require stronger controls.",
  },
  {
    key: "booking_ota_vendor_sharing",
    label: "Booking, OTA & vendor-sharing risk",
    meaning: "OTAs, agents, vendors and partners may create onward-sharing exposure.",
  },
  {
    key: "system_staff_access",
    label: "System, staff & access risk",
    meaning: "PMS, CRM, OTA dashboards, CCTV and staff access may need review.",
  },
  {
    key: "retention_marketing_incident",
    label: "Retention & incident readiness risk",
    meaning: "Old ID copies, bookings and travel documents may be retained without clear rules.",
  },
];

// option-id groups reused by overrides/flags
const HIGH_IMPACT_ID_DOCS = ["aadhaar", "passport", "visa", "other_govt_id", "travel_insurance", "minor_docs"];
const SCATTERED_STORAGE = ["whatsapp", "email_inboxes", "staff_phones", "frontdesk_devices", "multiple_no_sot"];
const VISA_SHARING_PARTIES = ["visa_consultant", "travel_insurance", "partner_hotels"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Hospitality / travel profile ───────────────────────────────────
  {
    id: "q1",
    badge: "Hospitality / Travel Profile",
    question: "What type of hospitality or travel business do you operate?",
    helpText: "Select all that apply. This helps estimate your guest, traveller and document-risk profile.",
    whyThisMatters:
      "Hotels handle guest identity and stay records. Travel agencies handle deeper travel-document and itinerary data. Visa/passport services involve the highest document risk.",
    type: "multi",
    cap: 8,
    bucket: "guest_traveller_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "hotel_resort_guesthouse", label: "Hotel / resort / guest house", riskPoints: 4 },
      { id: "homestay_serviced_hostel", label: "Homestay / serviced apartment / hostel", riskPoints: 4 },
      { id: "travel_agency_tour", label: "Travel agency / tour operator", riskPoints: 5 },
      { id: "corporate_travel", label: "Corporate travel desk / business travel service", riskPoints: 5 },
      { id: "visa_passport_docs", label: "Visa / passport / travel-document assistance", riskPoints: 7, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "pilgrimage_group", label: "Pilgrimage / group travel / package tours", riskPoints: 5 },
      { id: "transport_coordination", label: "Transport / cab / airport transfer coordination", riskPoints: 4 },
      { id: "destination_management", label: "Destination management / local tour services", riskPoints: 4 },
      { id: "online_travel_platform", label: "Online travel or booking platform", riskPoints: 6 },
      { id: "other", label: "Other hospitality or travel service", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 5 },
    ],
  },

  // ─── Q2 Guest & traveller data ─────────────────────────────────────────
  {
    id: "q2",
    badge: "Guest & Traveller Data Risk",
    question: "What guest or traveller data do you collect or store?",
    helpText: "Select all guest, booking, payment, itinerary, companion, preference or special-assistance data your business collects.",
    whyThisMatters:
      "Guest and travel data can reveal location, movement, companions, travel dates, nationality, preferences, health needs and corporate activity.",
    type: "multi",
    cap: 12,
    bucket: "guest_traveller_data",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact", label: "Guest/traveller name, phone number and email", riskPoints: 2 },
      { id: "address_nationality", label: "Address, city, nationality or country of residence", riskPoints: 4 },
      { id: "booking_itinerary", label: "Stay dates, booking history or itinerary details", riskPoints: 4 },
      { id: "preferences_requests", label: "Room preference, food preference or special requests", riskPoints: 3 },
      { id: "companion_family_group", label: "Companion, family member or group traveller details", riskPoints: 4 },
      { id: "payment_billing", label: "Payment, invoice, refund or billing details", riskPoints: 4 },
      { id: "corporate_employee_travel", label: "Corporate booking details or employee travel records", riskPoints: 5 },
      { id: "loyalty_history", label: "Loyalty, membership or repeat-stay history", riskPoints: 3 },
      { id: "emergency_contact", label: "Emergency contact details", riskPoints: 4 },
      { id: "health_accessibility", label: "Health, accessibility, dietary, senior citizen or special assistance details", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other guest/traveller data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q3 ID, passport & travel documents ────────────────────────────────
  {
    id: "q3",
    badge: "ID, Passport & Travel Document Risk",
    question: "Which ID or travel documents do you collect or handle?",
    helpText: "Select all identity, passport, visa, ticket, insurance, foreign guest or child traveller documents your business receives or stores.",
    whyThisMatters:
      "Hotels and travel agencies commonly collect ID proofs and passport copies. These documents become high-impact when stored in WhatsApp, email, reception folders or staff devices.",
    type: "multi",
    cap: 14,
    bucket: "id_passport_travel_document",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "aadhaar", label: "Aadhaar copy", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "pan", label: "PAN copy", riskPoints: 4, badge: "HIGH IMPACT", badgeColor: "amber" },
      { id: "passport", label: "Passport copy", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "visa", label: "Visa documents", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other_govt_id", label: "Driver licence / voter ID / other government ID", riskPoints: 5 },
      { id: "tickets", label: "Flight, train or bus tickets", riskPoints: 4 },
      { id: "travel_insurance", label: "Travel insurance documents", riskPoints: 5 },
      { id: "foreign_guest_cform", label: "Foreign guest details / C-Form-related data", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "corporate_id", label: "Corporate employee ID or company authorisation", riskPoints: 4 },
      { id: "medical_assistance_docs", label: "Medical, accessibility or special assistance documents", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "minor_docs", label: "Minor/child traveller documents", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other identity or travel documents", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q4 Document intake ────────────────────────────────────────────────
  {
    id: "q4",
    badge: "Document Intake Risk",
    question: "How do guests or travellers usually share ID proofs, booking details or travel documents with you?",
    helpText: "Select all channels used by guests, OTAs, travel agents, front desk staff or corporate travel desks.",
    whyThisMatters:
      "ID proofs, passport copies and tickets often arrive through WhatsApp and email. That creates forwarding, storage and wrong-recipient risks.",
    type: "multi",
    cap: 10,
    bucket: "id_passport_travel_document",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "secure_upload", label: "Secure booking portal or document upload link", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "website_form", label: "Hotel/travel website form", riskPoints: 2 },
      { id: "email", label: "Email attachments", riskPoints: 4 },
      { id: "whatsapp", label: "WhatsApp messages", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "ota_booking_engine", label: "OTA platform / booking engine", riskPoints: 3 },
      { id: "frontdesk_scan", label: "Physical documents scanned at front desk", riskPoints: 4 },
      { id: "agent_field_collection", label: "Documents collected by travel agent / field staff", riskPoints: 5 },
      { id: "corporate_desk", label: "Corporate travel desk shares documents", riskPoints: 4 },
      { id: "multiple_no_standard", label: "Multiple channels, no standard process", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q5 Storage locations ──────────────────────────────────────────────
  {
    id: "q5",
    badge: "Storage & Access Risk",
    question: "Where are guest IDs, booking records and travel documents stored?",
    helpText: "Select all systems, folders, dashboards, chats, devices or physical records where guest and travel data is stored.",
    whyThisMatters:
      "Hospitality data usually gets duplicated across PMS, OTA dashboards, WhatsApp, front-desk computers, physical registers and email.",
    type: "multi",
    cap: 12,
    bucket: "system_staff_access",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "pms_crm", label: "Hotel PMS / booking system / travel CRM with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "ota_dashboard", label: "OTA dashboard / booking engine", riskPoints: 3 },
      { id: "sheets_excel", label: "Google Sheets / Excel trackers", riskPoints: 5 },
      { id: "email_inboxes", label: "Email inboxes", riskPoints: 5 },
      { id: "whatsapp", label: "WhatsApp chats or groups", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "frontdesk_devices", label: "Front-desk desktops or staff laptops", riskPoints: 6 },
      { id: "staff_phones", label: "Staff phones", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "physical_registers", label: "Physical guest registers or ID-copy files", riskPoints: 4 },
      { id: "cloud_folders", label: "Google Drive / OneDrive / Dropbox folders", riskPoints: 5 },
      { id: "multiple_no_sot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q6 External / OTA / vendor sharing ────────────────────────────────
  {
    id: "q6",
    badge: "OTA, Vendor & Partner Sharing",
    question: "Which external parties receive guest or traveller data?",
    helpText: "Select all OTAs, booking engines, transport vendors, travel partners, visa consultants, corporate clients or service providers involved in your workflows.",
    whyThisMatters:
      "Travel and hospitality workflows naturally involve external sharing. The risk is uncontrolled sharing without clarity, purpose limitation, access review or retention rules.",
    type: "multi",
    cap: 14,
    bucket: "booking_ota_vendor_sharing",
    layer: "exposure",
    mutuallyExclusive: ["no_external_sharing", "not_sure"],
    options: [
      { id: "ota_platforms", label: "OTA platforms such as MakeMyTrip, Booking.com, Agoda, Airbnb, etc.", riskPoints: 4 },
      { id: "payment_gateway", label: "Payment gateway / billing provider", riskPoints: 2 },
      { id: "transport_vendor", label: "Transport / cab / airport transfer vendor", riskPoints: 4 },
      { id: "tour_guide", label: "Tour guide / local experience provider", riskPoints: 4 },
      { id: "visa_consultant", label: "Visa/passport/documentation consultant", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "travel_insurance", label: "Travel insurance provider", riskPoints: 5 },
      { id: "corporate_client", label: "Corporate travel client / employer", riskPoints: 5 },
      { id: "partner_hotels", label: "Hotels, partner properties or destination vendors", riskPoints: 5 },
      { id: "government_portals", label: "Government portals / statutory reporting systems", riskPoints: 3 },
      { id: "marketing_vendor", label: "Marketing agency / CRM / email/SMS/WhatsApp vendor", riskPoints: 5 },
      { id: "outsourced_services", label: "Laundry, housekeeping, security or outsourced service providers", riskPoints: 4 },
      { id: "no_external_sharing", label: "We do not share guest/traveller data externally", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q7 Staff & vendor access ──────────────────────────────────────────
  {
    id: "q7",
    badge: "Staff & System Access Risk",
    question: "How is access controlled for front desk, reservations, travel agents, housekeeping, transport coordinators or vendors?",
    helpText: "This includes PMS, CRM, OTA dashboards, booking systems, WhatsApp accounts, staff devices and vendor access.",
    whyThisMatters:
      "Guest data is often accessed by front desk, reservation teams, travel coordinators, agents and vendors. Shared logins and ex-staff access are major control gaps.",
    type: "single",
    cap: 12,
    bucket: "system_staff_access",
    layer: "control",
    options: [
      { id: "role_based_reviewed", label: "Access is role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_review", label: "Core staff access is controlled, but review is informal", riskPoints: 3 },
      { id: "broad_staff_access", label: "Front desk/reservations/travel staff can access most guest records", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "shared_logins", label: "Multiple staff or vendors share logins/passwords", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_vendor_access", label: "Ex-staff or old vendor/agent access may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q8 CCTV & access logs ─────────────────────────────────────────────
  {
    id: "q8",
    badge: "CCTV, Visitor & Access Log Risk",
    question: "Do you use CCTV, visitor logs, key-card logs, Wi-Fi logs or access-control systems?",
    helpText: "Select all monitoring, premises, access, Wi-Fi or visitor systems used by your hotel or travel business.",
    whyThisMatters:
      "Hotels collect not just booking data but also presence, movement and access data. Monitoring systems need defined purpose, access and retention controls.",
    type: "multi",
    cap: 10,
    bucket: "system_staff_access",
    layer: "control",
    mutuallyExclusive: ["no_monitoring", "not_sure"],
    options: [
      { id: "cctv_common", label: "CCTV in reception, lobby, corridors or common areas", riskPoints: 4 },
      { id: "cctv_sensitive", label: "CCTV in sensitive areas such as lifts, parking, entry/exit points", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "visitor_logs", label: "Visitor logs or guest movement logs", riskPoints: 4 },
      { id: "keycard_logs", label: "Key-card / room-access logs", riskPoints: 5 },
      { id: "wifi_logs", label: "Wi-Fi login records", riskPoints: 5 },
      { id: "security_registers", label: "Staff/security registers", riskPoints: 3 },
      { id: "documented_controls", label: "We use monitoring systems with documented purpose and access controls", riskPoints: -4, badge: "GOOD", badgeColor: "green" },
      { id: "no_monitoring", label: "We do not use monitoring/access logs", riskPoints: 0 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Guest Record Retention",
    question: "How long do you retain guest ID copies, passport copies, booking records, travel documents, CCTV footage and WhatsApp chats?",
    helpText: "The issue is not retention itself. The issue is uncontrolled indefinite retention of guest IDs, passport copies, travel records and CCTV footage.",
    whyThisMatters:
      "Hotels and travel agencies often keep ID copies, booking records and travel documents long after the stay or trip is completed.",
    type: "single",
    cap: 10,
    bucket: "retention_marketing_incident",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_convenience", label: "We retain old records for many years for repeat bookings, audit or convenience", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "indefinitely", label: "We keep most guest/traveller data indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Incident readiness ────────────────────────────────────────────
  {
    id: "q10",
    badge: "Incident & Breach Readiness",
    question: "Do you have a process if guest IDs, passport copies, booking records, WhatsApp chats, CCTV footage or travel documents are compromised or sent to the wrong person?",
    helpText: "This checks whether your business can respond quickly to exposed guest IDs, wrong-recipient sharing, compromised PMS access or leaked CCTV footage.",
    whyThisMatters:
      "Wrong-recipient messages, exposed passport folders, compromised PMS access, forwarded IDs or leaked CCTV footage can create serious privacy and trust exposure.",
    type: "single",
    cap: 10,
    bucket: "retention_marketing_incident",
    layer: "control",
    options: [
      { id: "documented_incident", label: "Yes, we have a documented incident response process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_manager_it", label: "Owner/manager/IT vendor would handle it informally", riskPoints: 4 },
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
// Override 4 (visa-doc business + partner sharing) is a conditional pair: Moderate
// alone, escalating to High when documents also move over WhatsApp/email.
// Override 5 is the SOFTENED monitoring rule — Wi-Fi logs alone no longer force
// High; it requires CCTV-in-sensitive-areas or key-card logs without controls.

const OVERRIDES: IAOverride[] = [
  {
    id: "passport_visa_whatsapp",
    minBand: "High Risk",
    severity: 9,
    test: (a) => anyOf(a, "q3", ["passport", "visa"]) && anyOf(a, "q4", ["whatsapp", "email"]),
    flag: "Passport or visa documents are arriving over WhatsApp or email — easy to forward, hard to delete and control.",
  },
  {
    id: "foreign_guest_no_retention",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q3", "foreign_guest_cform") && anyOf(a, "q9", ["indefinitely", "not_sure"]),
    flag: "Foreign guest / C-Form data is held with no clear retention rule — these records shouldn't be kept indefinitely.",
  },
  {
    id: "shared_or_ex_staff_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q7", ["shared_logins", "ex_staff_vendor_access"]),
    flag: "Shared logins or ex-staff/vendor access mean guest records may be reachable by people who no longer need them.",
  },
  // Override 4 — visa/passport business + partner sharing. Moderate alone; High with WhatsApp/email intake.
  {
    id: "visa_business_sharing",
    minBand: "Moderate Risk",
    severity: 6,
    test: (a) => has(a, "q1", "visa_passport_docs") && anyOf(a, "q6", VISA_SHARING_PARTIES),
    flag: "Travel-document assistance data is shared with visa consultants, insurers or partner properties — keep this purposeful and access-controlled.",
  },
  {
    id: "visa_business_sharing_informal_intake",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q1", "visa_passport_docs") && anyOf(a, "q6", VISA_SHARING_PARTIES) && anyOf(a, "q4", ["whatsapp", "email"]),
    flag: "Travel-document assistance data is shared with visa consultants, insurers or partner properties — keep this purposeful and access-controlled.",
  },
  // Override 5 — SOFTENED: CCTV-sensitive or key-card logs without documented controls.
  {
    id: "monitoring_no_controls",
    minBand: "High Risk",
    severity: 7,
    test: (a) => anyOf(a, "q8", ["cctv_sensitive", "keycard_logs"]) && !has(a, "q8", "documented_controls"),
    flag: "CCTV in sensitive areas or key-card access logs are in use without documented purpose, access and retention controls.",
  },
  {
    id: "indefinite_id_docs",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q9", "indefinitely") && anyOf(a, "q3", HIGH_IMPACT_ID_DOCS),
    flag: "Aadhaar, passport, visa or other ID/travel documents are kept indefinitely with no retention or deletion rule.",
  },
  {
    id: "no_incident_scattered",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q10", "no_standard_process") && anyOf(a, "q5", SCATTERED_STORAGE),
    flag: "Guest IDs and bookings are scattered across WhatsApp, staff phones, email and front-desk devices with no process for a wrong-recipient share or a breach.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "guest_data_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["address_nationality", "companion_family_group", "corporate_employee_travel", "health_accessibility"]),
    flag: "Guest and travel data can reveal location, movement, companions, travel dates, nationality, corporate travel and personal preferences.",
  },
  {
    id: "id_doc_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q3", ["aadhaar", "passport", "visa", "foreign_guest_cform", "medical_assistance_docs", "minor_docs"]),
    flag: "Aadhaar, passport, visa, foreign guest or special-assistance documents create high exposure if stored in phones, inboxes or WhatsApp.",
  },
  {
    id: "informal_intake",
    severity: 6,
    test: (a) => anyOf(a, "q4", ["whatsapp", "email", "multiple_no_standard"]),
    flag: "ID proofs, passport copies and tickets may be exchanged through WhatsApp and email without enough control.",
  },
  {
    id: "storage_sprawl",
    severity: 6,
    test: (a) => anyOf(a, "q5", SCATTERED_STORAGE),
    flag: "Guest IDs and booking records may be scattered across PMS, OTA dashboards, WhatsApp, staff phones and email.",
  },
  {
    id: "vendor_sharing",
    severity: 6,
    test: (a) => anyOf(a, "q6", ["ota_platforms", "visa_consultant", "transport_vendor", "marketing_vendor"]),
    flag: "Guest or traveller data may be forwarded across OTAs, transport vendors, visa consultants and marketing tools without clear tracking.",
  },
  {
    id: "broad_access",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["broad_staff_access", "shared_logins", "ex_staff_vendor_access"]),
    flag: "Front desk, reservations, travel staff or vendors may have broader access to guest records than necessary.",
  },
  {
    id: "monitoring_breadth",
    severity: 5,
    test: (a) => anyOf(a, "q8", ["cctv_sensitive", "keycard_logs", "wifi_logs"]) && !has(a, "q8", "documented_controls"),
    flag: "CCTV, key-card and Wi-Fi logs may collect presence and movement data without defined access and retention controls.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["many_years_convenience", "indefinitely"]),
    flag: "Guest ID copies, passport scans, booking records and travel documents may be retained indefinitely after checkout.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical) — spec §13.
const FIVE_CONTROLS = [
  "Standardise ID, passport and travel-document collection — define a secure way to receive Aadhaar, passport, visa and ticket copies instead of scattered WhatsApp and email.",
  "Reduce WhatsApp and email sharing of guest IDs and passport copies — prefer a secure upload/portal and don't keep duplicate copies on staff phones.",
  "Review OTA, booking engine, transport, visa and destination vendor sharing — share only what each party needs, with a documented purpose.",
  "Restrict PMS, CRM, OTA dashboard, CCTV and staff-device access — remove ex-staff and old vendor access, and limit by role and need.",
  "Define retention and deletion rules for guest IDs, booking records, travel documents and CCTV footage, plus a simple wrong-recipient/breach response.",
];

const BUCKET_RECS: Record<string, string> = {
  id_passport_travel_document:
    "Standardise ID, passport and travel-document handling. Reduce WhatsApp/email collection of Aadhaar, passport, visa and ticket documents, and define secure collection, storage and deletion rules.",
  guest_traveller_data:
    "Map guest and traveller data across booking, check-in, payment, itinerary, special requests, companion details, corporate travel and loyalty workflows. Define what data is collected, why and who can access it.",
  booking_ota_vendor_sharing:
    "Create a vendor and sharing register covering OTAs, booking engines, payment gateways, transport vendors, tour guides, visa consultants, corporate clients, partner hotels and marketing tools.",
  system_staff_access:
    "Review access to PMS, CRM, OTA dashboards, booking engines, WhatsApp accounts, front-desk computers, staff phones, CCTV and Wi-Fi logs. Remove ex-staff and old vendor access.",
  retention_marketing_incident:
    "Define retention and incident-response rules for ID copies, passport scans, booking records, travel documents, WhatsApp chats, CCTV footage, visitor logs and wrong-recipient sharing.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "id_passport_travel_document",
    "guest_traveller_data",
    "booking_ota_vendor_sharing",
    "system_staff_access",
    "retention_marketing_incident",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your ID handling, OTA/vendor sharing, staff access and retention practices consistent, and set a periodic review."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) — spec §12 ─────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your hotel or travel business appears to have basic guest-data controls in place. Your next step is to document these practices, review OTA/vendor sharing, control staff access and define retention rules for guest IDs, travel documents and booking records.",
  "Moderate Risk":
    "Your hotel or travel business has some guest-data controls, but several practices may be informal. Focus first on ID/passport handling, WhatsApp/email sharing, OTA/vendor workflows, PMS/CRM access and old guest-record retention.",
  "High Risk":
    "Your hotel or travel business may have significant DPDPA exposure across guest IDs, passport copies, booking history, OTA sharing, travel documents, WhatsApp workflows, CCTV, staff access or old record retention. Your first priority is to control ID/document collection, vendor sharing, system access and retention.",
  "Critical Risk":
    "Your hotel or travel business may have serious DPDPA exposure. This usually happens when Aadhaar, passport copies, visa documents, booking history, travel itineraries, WhatsApp chats, OTA records, CCTV footage, staff logins and old guest databases are managed informally — without notice, access control, retention or incident-response processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const hotelsTravelPack: IndustryPack = {
  industry: "hotels-travel",
  route: "/assessment/hotels-travel",
  reportType: "hotel", // short token — "hotels-travel" is 13 chars; Appwrite `report_type` is string(10)
  positioning: {
    title: "Hotels & Travel DPDPA Risk Scan",
    hero: "Your hotel or travel business does not just manage bookings. It collects, shares and stores guest travel data every day.",
    sub: "From guest IDs and passport copies to booking records, OTA dashboards, travel documents, WhatsApp confirmations, CCTV footage, transport vendors and old guest databases — hotels and travel agencies handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise in your guest and traveller data workflows. It collects no guest documents — only your answers about your processes.",
    cta: "Start Hotels & Travel Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Guest IDs",
      "Passport Copies",
      "OTA Sharing",
      "Travel Documents",
      "WhatsApp Confirmations",
      "CCTV",
      "Old Guest Records",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Hotels & Travel DPDPA Starter Checklist",
    href: "/templates/hotels-travel-dpdpa-starter-checklist.pdf",
  },
};

export default hotelsTravelPack;

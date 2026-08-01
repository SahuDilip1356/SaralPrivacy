// Data groups a clinic or diagnostic lab holds about one patient.
//
// LANGUAGE LOCK: this map says "high-impact health data", never "sensitive
// personal data". The DPDPA does not create a separate statutory category of
// sensitive data the way the GDPR does, and using that phrase here would be a
// factual error dressed as rigour. The impact is real; the label must be ours.
//
// The three `derived` categories are the quiet half of the map: a clinical
// inference, a chronic-care risk score and a marketing segment are all CREATED
// by the practice and its tools. The patient never handed them over, has
// usually never seen them, and cannot correct what they cannot see.
//
// Sixteen categories, not forty. A long taxonomy stops communicating the moment
// every node renders a wall of tags - so the finer distinctions (fertility,
// mental health, genetic, infectious disease, paediatric) live as EXAMPLES
// inside these, where they carry their weight without breaking the legend.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const CLINICS_DIAGNOSTIC_LABS_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "patient-identity",
    name: "Patient identity",
    kind: "provided",
    examples: ["Name", "Patient ID / UHID", "Age and date of birth", "Sex", "Accession number"],
  },
  {
    id: "patient-contact",
    name: "Contact details",
    kind: "provided",
    examples: ["Mobile number", "WhatsApp number", "Email", "Home address", "Alternate contact"],
  },
  {
    id: "family-caregiver",
    name: "Family, caregiver & guardian details",
    kind: "provided",
    examples: [
      "Spouse or parent's number",
      "Emergency contact",
      "Guardian of a child patient",
      "Attendant who collects the report",
      "Shared family phone",
    ],
  },
  {
    id: "government-id",
    name: "Government identity documents",
    kind: "provided",
    examples: ["Aadhaar number or copy", "PAN", "Passport for a travel test", "Insurance or TPA card", "Scanned ID image"],
  },
  {
    id: "appointment-visit",
    name: "Appointment & visit records",
    kind: "provided",
    examples: ["Appointment slot", "Reason for visit", "Doctor preference", "Visit history", "Missed-appointment record"],
  },
  {
    id: "clinical-history",
    name: "Clinical history & examination",
    kind: "provided",
    examples: ["Symptoms", "Past medical history", "Allergies", "Vital signs", "Examination findings", "Family history"],
  },
  {
    id: "diagnosis-treatment",
    name: "Diagnosis & treatment (high-impact health data)",
    kind: "provided",
    examples: [
      "Diagnosis and clinical indication",
      "Treatment plan",
      "Chronic condition",
      "Mental-health consultation record",
      "Pregnancy or fertility status",
      "Infectious-disease status",
      "Procedure and consent record",
    ],
  },
  {
    id: "prescription-medication",
    name: "Prescriptions & medication",
    kind: "provided",
    examples: ["Prescribed medicines", "Dosage and schedule", "Repeat prescription", "Refill instruction", "Pharmacy referral"],
  },
  {
    id: "lab-order-result",
    name: "Test orders & laboratory results (high-impact health data)",
    kind: "provided",
    examples: [
      "Requested test panel",
      "Raw analyser result",
      "Validated result and reference range",
      "Critical-value flag",
      "Genetic or molecular test result",
      "Pathology report",
    ],
  },
  {
    id: "diagnostic-image",
    name: "Diagnostic images & imaging reports",
    kind: "provided",
    examples: ["X-ray, ultrasound, CT or MRI study", "Image metadata with patient identity", "Radiology report", "Procedure video or photograph"],
  },
  {
    id: "sample-specimen",
    name: "Physical samples & requisitions",
    kind: "provided",
    examples: ["Labelled blood or tissue sample", "Barcode linking specimen to patient", "Paper requisition form", "Retained or stored specimen", "Disposal record"],
  },
  {
    id: "billing-insurance",
    name: "Billing, payment & insurance",
    kind: "provided",
    examples: ["Invoice with procedure description", "Payment reference", "Insurance or TPA identifier", "Pre-authorisation file", "Claim and rejection record", "Corporate health-check billing line"],
  },
  {
    id: "communication-media",
    name: "Messages, calls & report copies",
    kind: "provided",
    examples: [
      "WhatsApp chat and forwarded report",
      "Call recording",
      "Email thread with an attached report",
      "Photographed prescription",
      "Printed report at a counter",
      "Report download link",
    ],
  },
  {
    id: "clinical-inference",
    name: "Clinical inferences & tool-generated findings",
    kind: "derived",
    examples: [
      "AI-generated consultation summary",
      "AI image-analysis flag",
      "Preliminary interpretation before validation",
      "Auto-calculated risk indicator",
      "Duplicate-patient match decision",
    ],
  },
  {
    id: "chronic-care-profile",
    name: "Chronic-care & adherence profile",
    kind: "derived",
    examples: ["Chronic-care classification", "Treatment-adherence note", "Missed-appointment score", "Recall or risk category", "Follow-up priority"],
  },
  {
    id: "marketing-segment",
    name: "Health-based marketing segments",
    kind: "derived",
    examples: ["Wellness campaign segment", "Package-upsell list", "Condition-based recall list", "Lapsed-patient audience", "Health-check renewal cohort"],
  },
];

// Data groups a retail chemist, an e-pharmacy or a hospital-linked chain holds.
// SIXTEEN, not the pasted spec's forty-eight: past ~16 the legend stops
// communicating and every node renders a wall of tags, so fine distinctions
// (government identifiers, age and gender, dosage instructions, call
// recordings, loyalty membership, fraud and authentication records, return and
// refund files) live in `examples` instead. Every one of the spec's forty-eight
// ids is covered here. Spec §4.
//
// Four categories do this sector's distinctive work:
//
//  · `medicine-history` - the sector's quiet centre. Nobody at the counter
//    records a diagnosis, and nobody has to: a list of what a person buys, and
//    how often, IS the condition. It is created as a by-product of billing and
//    kept because it makes the next sale easier.
//  · `health-inference` - `derived`, and the half nobody counts as personal
//    data. A refill cadence read as a chronic condition, a search history read
//    as a symptom, a substitution pattern read as an affordability band. The
//    business created every one of these about an identifiable person, and in
//    an e-pharmacy they are what gets uploaded to an ad platform.
//  · `prescription-image` - separate from `prescription` deliberately. The
//    structured prescription record is one thing; the photograph of it - sitting
//    in a chat thread, a scanner's local folder, an extraction vendor's queue, a
//    downloads folder and a printout - is a different problem with a different
//    fix.
//  · `controlled-medicine` - the one category on this map that is a REQUIRED
//    RECORD. It exists because other law says it must, which is exactly why it
//    cannot be treated like the rest of the file when someone asks for erasure.
//
// `family-caregiver` is kept separate from `customer-identity` for the reason
// hotels kept companions separate: most of the people in a pharmacy file never
// dealt with the pharmacy. The son who collects, the spouse whose number is on
// the account, the child on the paediatric prescription, the parent the
// medicine is actually for.
//
// ⛔ LANGUAGE LOCK (spec §8): the product label is "High-impact prescription and
// health-related data", NEVER "sensitive personal data" - the DPDPA creates no
// such statutory category. No medical, pharmacological, dosage or
// drug-interaction content anywhere in these examples: they name what is
// HELD, never what should be taken.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const PHARMACIES_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "customer-identity",
    name: "Customer & patient identity",
    kind: "provided",
    examples: [
      "Name, mobile & email",
      "Home & delivery address",
      "Age, date of birth & gender",
      "Identity document shown or copied at the counter",
      "Whether the buyer is the patient or someone else",
    ],
  },
  {
    id: "family-caregiver",
    name: "Family, caregiver & children",
    kind: "provided",
    examples: [
      "Spouse, parent or child the medicine is for",
      "Relative who collects on someone's behalf",
      "Caregiver named on an account",
      "Children's prescriptions under a parent's profile",
      "Shared household mobile number",
      "Emergency contact",
    ],
  },
  {
    id: "prescription",
    name: "Prescription & prescriber details",
    kind: "provided",
    examples: [
      "Patient name, age & prescription date",
      "Prescribing doctor, clinic or hospital",
      "Medicines and quantities prescribed",
      "Condition or indication where the prescriber wrote one",
      "Validity, repeat and expiry status",
      "Rejected or unreadable prescription",
    ],
  },
  {
    id: "prescription-image",
    name: "Prescription images & scanned copies",
    kind: "provided",
    examples: [
      "Photograph sent over WhatsApp",
      "Upload from a mobile camera, with its metadata",
      "Scanner's local folder and print queue",
      "Text pulled out of the image by extraction tooling",
      "Download saved to a laptop to attach to an email",
      "Printout kept in the prescription file",
    ],
  },
  {
    id: "medicine-order",
    name: "Order, dispensing & substitution record",
    kind: "provided",
    examples: [
      "Order & bill reference",
      "Medicines dispensed, quantity & batch",
      "Brand substituted for the one prescribed",
      "Pharmacist counselling & dispensing note",
      "Partial supply & pending items",
      "Cancelled, abandoned or rejected order",
    ],
  },
  {
    id: "medicine-history",
    name: "Medicine purchase history",
    kind: "provided",
    examples: [
      "Every medicine bought, with dates",
      "Purchase frequency & repeat cadence",
      "Cross-outlet and cross-account purchase record",
      "Frequently bought items list",
      "Items bought for a named family member",
      "Historic orders retained after the account closed",
    ],
  },
  {
    id: "health-inference",
    name: "Health conditions worked out from the data",
    kind: "derived",
    examples: [
      "Chronic-condition segment read off a refill cadence",
      "Condition interest inferred from searches and pages viewed",
      "Therapy-area affinity used for recommendations",
      "Care-gap or missed-refill alert",
      "Pregnancy, fertility, mental-health or infection-related segment",
      "Health audience uploaded to an advertising platform",
    ],
  },
  {
    id: "controlled-medicine",
    name: "Controlled & schedule-medicine records",
    kind: "provided",
    examples: [
      "Entry in the register: patient, prescriber, quantity, balance",
      "Pharmacist who dispensed & signature",
      "Prescription reference held against the entry",
      "Inspection and authority-facing record",
      "Misuse or monitoring flag raised internally",
      "Required record that is not freely deletable",
    ],
  },
  {
    id: "allergy-adverse-event",
    name: "Allergies, complaints & adverse events",
    kind: "provided",
    examples: [
      "Allergy or previous reaction the customer told you about",
      "Adverse-reaction report & description",
      "Complaint, escalation & investigation note",
      "Photograph of the strip, the pack or the reaction",
      "Batch number & recall record",
      "Return, refund & replacement file",
    ],
  },
  {
    id: "insurance-corporate",
    name: "Insurance, TPA & corporate health records",
    kind: "provided",
    examples: [
      "Policy, member & claim number",
      "Pre-authorisation and approval record",
      "Claim rejection & reason",
      "Employer or corporate health programme code",
      "Itemised medicine list sent with a claim",
      "Third-party administrator correspondence",
    ],
  },
  {
    id: "payment-financial",
    name: "Payment, invoice & credit ledger",
    kind: "provided",
    examples: [
      "Invoice & itemised medicine charges",
      "UPI, card & cash-on-delivery record",
      "Payment screenshot kept in a chat",
      "Khata or credit ledger: who owes for which medicine",
      "Refund, chargeback & dispute record",
      "Fraud & payment-risk score",
    ],
  },
  {
    id: "delivery-address",
    name: "Delivery address, route & proof of delivery",
    kind: "provided",
    examples: [
      "Delivery address & landmark",
      "Contact number given to the rider",
      "Route, GPS trail & delivery attempt",
      "Proof-of-delivery photograph & signature",
      "Person who actually received the package",
      "Failed delivery & return-to-origin reason",
    ],
  },
  {
    id: "communication-records",
    name: "Calls, chats & support records",
    kind: "provided",
    examples: [
      "WhatsApp order threads & forwarded images",
      "Call recordings from the order line",
      "SMS, email & push notification history",
      "Support ticket & chatbot transcript",
      "Message sent from a staff member's own number",
      "Public review and the pharmacy's reply",
    ],
  },
  {
    id: "digital-behaviour",
    name: "Website, app & device behaviour",
    kind: "provided",
    examples: [
      "IP address, device & advertising identifier",
      "Symptom and medicine searches",
      "Product pages viewed & compared",
      "Abandoned cart contents",
      "Session recording & heatmap",
      "Campaign source & attribution",
    ],
  },
  {
    id: "staff-access-record",
    name: "Staff, device & access records",
    kind: "provided",
    examples: [
      "Billing, pharmacy-management & console logins, often shared",
      "Who opened which customer's medicine history",
      "Exports and reports taken by staff",
      "Prescriptions saved to a personal phone",
      "Access still live after someone left",
      "Temporary and contract worker accounts",
    ],
  },
  {
    id: "refill-marketing-profile",
    name: "Refill, loyalty & marketing profile",
    kind: "derived",
    examples: [
      "Expected refill date & reminder history",
      "Adherence estimate & missed-refill status",
      "Loyalty tier, points & customer-value band",
      "Churn risk & win-back segment",
      "Campaign audience & broadcast list",
      "Communication preference & suppression state",
    ],
  },
];

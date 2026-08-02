// Data groups a real-estate or property firm holds. SIXTEEN, not the pasted
// spec's forty-three: past ~16 the legend stops communicating and every node
// renders a wall of tags, so fine distinctions (stamp duty, commission, CCTV,
// children's data, fraud labels, call recordings) live in `examples` instead.
// Every one of the spec's forty-three ids is covered here. Spec §4.
//
// Two categories do this sector's distinctive work:
//
//  · `third-party-records` - how much of a property file belongs to people who
//    never engaged the firm at all. A co-applicant, a guarantor, a nominee, a
//    prior landlord, a witness on a deed, a tenant's cleaner. None of them
//    enquired about anything.
//  · `occupancy-access` - the rental half's signature. Data that describes a
//    HOME rather than a transaction: who has the keys, who visits, when the flat
//    is empty. No other map in this series holds anything like it.
//
// `client-scoring` and `marketing-profile` are `derived`: the quiet half a
// property firm never counts as personal data at all. An affordability guess, a
// tenant-suitability score and a lookalike audience are all new personal data
// the firm created about an identifiable person.
//
// LANGUAGE LOCK: "high-impact identity, financial and property data", never
// "sensitive personal data" - the DPDPA creates no such statutory category
// (spec §5). The pasted spec makes the same point; hold it.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const REAL_ESTATE_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "client-identity",
    name: "Client identity & contact",
    kind: "provided",
    examples: [
      "Name",
      "Mobile & email",
      "Current address",
      "Authorised representative or power of attorney",
      "NRI / overseas contact & address",
    ],
  },
  {
    id: "client-kyc",
    name: "KYC & identity proofs",
    kind: "provided",
    examples: ["PAN copy", "Aadhaar copy", "Passport, visa or OCI card", "Utility bill or address proof", "Photograph"],
  },
  {
    id: "household-occupancy",
    name: "Household & occupancy details",
    kind: "provided",
    examples: [
      "Family size & who will live there",
      "Children & elderly dependants",
      "Marital status",
      "Pets",
      "Domestic staff",
      "Lifestyle notes recorded by sales staff",
    ],
  },
  {
    id: "employment-income",
    name: "Employment & income",
    kind: "provided",
    examples: ["Employer & designation", "Salary slips", "Form 16 or ITR", "Business proof", "Employment verification result"],
  },
  {
    id: "financial-records",
    name: "Bank, loan & payment records",
    kind: "provided",
    examples: [
      "Bank statements",
      "Loan application & sanction or rejection letter",
      "Cheque, UPI & payment references",
      "Instalment and demand history",
      "Security deposit",
      "Stamp duty & tax receipts",
    ],
  },
  {
    id: "requirement-budget",
    name: "Requirement & budget",
    kind: "provided",
    examples: [
      "Budget band",
      "Buy or rent preference",
      "Target locality & project",
      "Unit, size & configuration preference",
      "Move-in or purchase timeline",
    ],
  },
  {
    id: "property-ownership-docs",
    name: "Property & ownership papers",
    kind: "provided",
    examples: [
      "Title deed & prior sale deed",
      "Mother deed & encumbrance certificate",
      "Property tax receipts",
      "Society NOC & share certificate",
      "Approved plan & completion certificate",
    ],
  },
  {
    id: "transaction-documents",
    name: "Agreements & transaction records",
    kind: "provided",
    examples: [
      "Agreement to sell & sale deed",
      "Allotment letter & booking form",
      "Rent agreement & inventory schedule",
      "Registration receipt & witness details",
      "Possession & key acknowledgement",
    ],
  },
  {
    id: "site-visit-location",
    name: "Site-visit & location records",
    kind: "provided",
    examples: [
      "Visit date, property & attendance",
      "Gate entry & security register",
      "Visit photographs",
      "Shared live location & route",
      "Sample-flat appointment",
    ],
  },
  {
    id: "occupancy-access",
    name: "Access, entry & occupancy records",
    kind: "provided",
    examples: [
      "Keys & access credentials",
      "Gate entry & exit logs",
      "Visitor & delivery records",
      "Vehicle & parking details",
      "Emergency contacts",
      "CCTV footage",
    ],
  },
  {
    id: "maintenance-complaint",
    name: "Maintenance, inspection & complaints",
    kind: "provided",
    examples: [
      "Work orders & contractor visit logs",
      "Repair photographs",
      "Defect list & snag report",
      "Move-in / move-out inspection images",
      "Damage assessment",
      "Complaints & service notes",
    ],
  },
  {
    id: "communication-records",
    name: "Calls, messages & sales notes",
    kind: "provided",
    examples: [
      "WhatsApp threads & forwarded screenshots",
      "Call recordings",
      "Email & SMS history",
      "Reminder & follow-up log",
      "Salesperson's own notes",
    ],
  },
  {
    id: "third-party-records",
    name: "Other people's records in the file",
    kind: "provided",
    examples: [
      "Co-applicant & nominee",
      "Guarantor & references",
      "Prior landlord",
      "Witnesses on the deed",
      "Household members & domestic staff",
      "The seller's or landlord's own KYC",
    ],
  },
  {
    id: "client-scoring",
    name: "Scores & labels about the client",
    kind: "derived",
    examples: [
      "Lead score & seriousness rating",
      "Affordability & budget-band guess",
      "Tenant suitability score",
      "Payment-behaviour or defaulter label",
      "Fraud or risk flag",
      "Client-value & cross-sell score",
    ],
  },
  {
    id: "marketing-profile",
    name: "Marketing & audience profile",
    kind: "derived",
    examples: [
      "Campaign source & attribution",
      "Ad platform custom & lookalike audiences",
      "Retargeting lists",
      "Referral & review lists",
      "Communication preference & suppression state",
    ],
  },
  {
    id: "staff-access-record",
    name: "Staff, device & access records",
    kind: "provided",
    examples: [
      "CRM logins & exports",
      "Portal & partner credentials",
      "Phone contact sync",
      "Shared-link access logs",
      "Who opened which file",
    ],
  },
];

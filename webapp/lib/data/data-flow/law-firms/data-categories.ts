// Data groups a law firm holds. SIXTEEN, not the pasted spec's fifty-one:
// past ~16 the legend stops communicating and every node renders a wall of
// tags, so fine distinctions (notarisation, chain of custody, expert reports,
// hearing records) live in `examples` instead. Spec §4.
//
// `third-party-records` is the category doing this sector's distinctive work.
// In every other map the data belongs to the person the map follows. Here most
// of the personal data in a matter belongs to people who never engaged the firm
// at all - the opposing party, witnesses, family members, a target company's
// employees - and who cannot practically be notified.
//
// `legal-work-product` and `case-assessment` are `derived`: the quiet half a
// firm rarely counts as personal data. A settlement position and a predicted
// outcome are new personal data the firm created about identifiable people.
//
// LANGUAGE LOCK: "high-impact client data", never "sensitive personal data" -
// the DPDPA creates no such statutory category (spec §5).

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const LAW_FIRMS_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "client-identity",
    name: "Client identity & contact",
    kind: "provided",
    examples: ["Name", "Mobile & email", "Address", "Authorised representative", "Signature"],
  },
  {
    id: "client-kyc",
    name: "KYC & identity proofs",
    kind: "provided",
    examples: ["PAN", "Aadhaar", "Passport", "Company KYC & incorporation papers", "Beneficial-owner declarations"],
  },
  {
    id: "matter-metadata",
    name: "Matter details",
    kind: "provided",
    examples: ["Matter type", "Parties & related parties", "Court or forum", "Conflict-check result", "Matter status"],
  },
  {
    id: "instructions-communications",
    name: "Instructions & communications",
    kind: "provided",
    examples: ["Emails", "WhatsApp threads", "Voice notes", "Attendance & call notes", "Client comments on drafts"],
  },
  {
    id: "financial-records",
    name: "Financial & banking records",
    kind: "provided",
    examples: ["Bank statements", "Tax filings", "Salary slips", "Loan and funds-flow records", "Investment papers"],
  },
  {
    id: "property-corporate-docs",
    name: "Property & corporate documents",
    kind: "provided",
    examples: ["Title deeds & sale agreements", "Rent agreements", "Board resolutions", "MCA filings", "Shareholder registers"],
  },
  {
    id: "employment-hr-records",
    name: "Employment & HR records",
    kind: "provided",
    examples: ["Employee files", "Salary schedules", "Disciplinary records", "Termination letters", "Contractor lists"],
  },
  {
    id: "health-records",
    name: "Medical & health records",
    kind: "provided",
    examples: ["Medical reports", "Injury & disability records", "Hospital bills", "Mental-health material", "Post-mortem reports"],
  },
  {
    id: "allegation-records",
    name: "Allegations & personal circumstances",
    kind: "provided",
    examples: ["Criminal allegations", "Harassment complaints", "Matrimonial & custody facts", "Whistleblower reports", "Disciplinary charges"],
  },
  {
    id: "evidence-media",
    name: "Evidence files & media",
    kind: "provided",
    examples: ["Screenshots of messages", "Photographs & video", "Call recordings", "Device extractions", "CCTV clips"],
  },
  {
    id: "third-party-records",
    name: "Other people's records",
    kind: "provided",
    examples: [
      "Opposing party's documents",
      "Witness details & statements",
      "Family members named in the file",
      "A target company's employees",
      "Customers listed in a contract",
    ],
  },
  {
    id: "court-filings",
    name: "Filings & orders",
    kind: "provided",
    examples: ["Pleadings & petitions", "Affidavits", "Annexures & exhibits", "Court orders", "Regulatory & MCA submissions"],
  },
  {
    id: "legal-work-product",
    name: "Advice, drafts & strategy",
    kind: "derived",
    examples: ["Legal opinions", "Draft agreements & pleadings", "Case theory notes", "Settlement positions", "Issue lists"],
  },
  {
    id: "case-assessment",
    name: "Assessments & predictions",
    kind: "derived",
    examples: ["Matter risk rating", "Predicted outcome", "Witness assessment", "AI-generated summaries", "Client profitability score"],
  },
  {
    id: "billing-time",
    name: "Time, billing & expenses",
    kind: "provided",
    examples: ["Time entries & narratives", "Invoices", "Expense receipts", "Counsel and filing fees", "Payment records"],
  },
  {
    id: "staff-access-record",
    name: "Staff access & credentials",
    kind: "provided",
    examples: ["DMS logins & access logs", "Portal credentials", "Digital signature tokens", "Device records", "Data-room access groups"],
  },
];

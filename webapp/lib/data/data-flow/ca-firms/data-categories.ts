// Data groups a CA firm holds. `discoveryItems` reuses the exact item wording
// of the Discovery `ca-firms` niche so both tools speak the same language.
// Two categories have no analogue in recruitment and are the most serious on
// this map: portal credentials, and the DSC (signing authority, not just data).
// The computed tax position is `derived` - views render it visibly different.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const CA_FIRMS_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "identity",
    name: "Identity data",
    kind: "provided",
    examples: ["PAN", "Aadhaar", "Photograph", "Date of birth", "Signature"],
  },
  {
    id: "contact",
    name: "Contact data",
    kind: "provided",
    examples: ["Mobile number", "Email", "Address", "WhatsApp number"],
  },
  {
    id: "bank-financial",
    name: "Bank & financial statements",
    kind: "provided",
    examples: ["Bank statements", "Passbook copies", "Financial statements", "Cash-flow records"],
  },
  {
    id: "tax-documents",
    name: "Tax documents",
    kind: "provided",
    examples: ["ITR acknowledgements", "Form 16", "26AS / AIS / TIS", "Tax computations"],
  },
  {
    id: "payroll",
    name: "Payroll & salary data",
    kind: "provided",
    examples: ["Salary sheets", "Employee bank accounts", "PF / ESIC records", "Employee PAN"],
  },
  {
    id: "gst-data",
    name: "GST & indirect-tax data",
    kind: "provided",
    examples: ["GST returns", "Sales / purchase invoices", "E-way bills", "TDS statements"],
  },
  {
    id: "corporate-kyc",
    name: "Corporate & MCA records",
    kind: "provided",
    examples: ["Company KYC", "MCA / ROC filings", "Board resolutions", "Director documents"],
  },
  {
    id: "investment",
    name: "Investment & loan documents",
    kind: "provided",
    examples: ["Investment proofs", "Loan documents", "Property papers", "Capital-gains records"],
  },
  {
    id: "health-insurance",
    name: "Medical & insurance data",
    kind: "provided",
    examples: ["Medical insurance documents", "Reimbursement claims", "Section 80D proofs"],
  },
  {
    id: "credentials",
    name: "Portal credentials",
    kind: "provided",
    examples: ["Income Tax portal password", "GST portal login", "TRACES login", "Bank net-banking (sometimes)"],
  },
  {
    id: "dsc",
    name: "Digital Signature Certificate",
    kind: "provided",
    examples: ["DSC token (USB)", "DSC PIN", "e-verification authority"],
  },
  {
    id: "derived",
    name: "Computed tax position",
    kind: "derived",
    examples: ["Assessed income", "Tax liability", "Refund due", "Risk / scrutiny flags"],
  },
];

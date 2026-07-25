// CA firm lifecycle - 10 canonical stages.
// A client's financial data does not flow through once like a candidate's - it
// RETURNS every financial year and accumulates. Stage 10 (archive) feeds back
// into stage 2 (intake) the next year; the map shows that loop.

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const CA_FIRMS_STAGES: FlowStage[] = [
  {
    id: "onboarding",
    name: "Client onboarding & engagement",
    sequence: 1,
    summary:
      "A new client is signed. Basic identity, contact and engagement details are captured - often over email or WhatsApp before any secure system exists.",
    dpdpaNote: "Tell the client what you collect and why, at or before collection, and record the engagement's purpose.",
  },
  {
    id: "kyc",
    name: "KYC collection",
    sequence: 2,
    summary:
      "PAN, Aadhaar, and for companies the MCA and board documents are collected to establish identity for filings and portal access.",
    dpdpaNote: "Collect only the identity documents the filing actually needs; Aadhaar is high-impact and often over-collected.",
  },
  {
    id: "documents",
    name: "Document collection",
    sequence: 3,
    summary:
      "Bank statements, Form 16, salary sheets, invoices and investment proofs arrive - by email, WhatsApp, a shared drive or a portal - and copies scatter immediately.",
    dpdpaNote: "Prefer one controlled intake channel; every extra copy is a place a deletion request must later reach.",
  },
  {
    id: "accounting",
    name: "Accounting & bookkeeping",
    sequence: 4,
    summary:
      "Transactions are entered into Tally or Busy. For business clients this pulls in employee payroll - salary, bank and PF data for people who are not your clients.",
    dpdpaNote: "Payroll data belongs to the client's employees; you are handling it on the client's instructions, so agree the terms in writing.",
  },
  {
    id: "tax-prep",
    name: "Tax preparation & computation",
    sequence: 5,
    summary:
      "Returns and computations are prepared in Winman or ClearTax. Working papers, drafts and the computed tax position are created and copied to laptops.",
    dpdpaNote: "The computed position is derived personal data about the client - protect it like the source documents.",
  },
  {
    id: "gst-tds",
    name: "GST / TDS compliance",
    sequence: 6,
    summary:
      "GST returns and TDS statements are prepared and uploaded to the GST portal and TRACES, using credentials the firm holds on the client's behalf.",
    dpdpaNote: "Portal credentials held for a client are a serious custody responsibility - store them like the data they unlock.",
  },
  {
    id: "itr-filing",
    name: "ITR filing",
    sequence: 7,
    summary:
      "Returns are filed on the Income Tax portal, e-verified with the client's DSC or OTP. The firm often holds the DSC token physically.",
    dpdpaNote: "A DSC is signing authority, not just data - holding it means you can act legally as the client, so control it tightly.",
  },
  {
    id: "review",
    name: "Client review & sign-off",
    sequence: 8,
    summary:
      "Drafts and filed returns are sent back to the client for confirmation - usually as email or WhatsApp attachments, creating another copy outside the firm.",
    dpdpaNote: "Share the minimum needed for sign-off, over a channel you can later account for.",
  },
  {
    id: "govt",
    name: "Government submission",
    sequence: 9,
    summary:
      "Filings reach the Income Tax department, GSTN and MCA. Documents may also go to banks or statutory auditors who receive them without a processing contract.",
    dpdpaNote: "Statutory disclosures are lawful, but a bank or auditor receiving data without a contract needs minimisation and a protected channel.",
  },
  {
    id: "archive",
    name: "Archive, retention & deletion",
    sequence: 10,
    summary:
      "Everything is retained - and then kept. A decade of ITRs, Form 16s and bank statements accumulates in folders and inboxes that are never cleared, and next year the cycle starts again.",
    dpdpaNote: "Keep records only as long as the law or the engagement needs; set a deletion schedule, because the default here is 'forever'.",
  },
];

// Data groups a digital lender, a payments or wallet fintech or a multi-product
// NBFC holds. SIXTEEN, not the pasted spec's sixty-two: past ~16 the legend
// stops communicating and every node renders a wall of tags, so fine
// distinctions (occupation, e-sign certificates, insurance records, chargebacks,
// staff access logs, call recordings, incident records) live in `examples`
// instead. Every one of the spec's §8 ids is covered here. Spec §4.
//
// Four categories do this sector's distinctive work:
//
//  · `derived-score` and `automated-decision` are the sector's centre, and both
//    are `derived`. Nobody hands a lender a risk grade; the lender manufactures
//    one out of everything else on this list and then acts on it. Splitting the
//    two is deliberate: a SCORE is a number about the person, a DECISION is a
//    thing that happened TO them. They have different lifespans, different
//    review routes and different correction stories, and merging them is how a
//    business ends up unable to say why somebody was refused.
//  · `contact-sms-location` - kept apart from `device-app-signal` on purpose.
//    A device fingerprint is about the handset; a contact list, an SMS inbox and
//    a precise location are about the person's relationships and movements, and
//    in digital lending they are collected as a SUBSTITUTE for credit history.
//    The people in that contact list never applied for anything.
//  · `related-party` - the co-applicant, guarantor, nominee, reference and
//    alternate contact. Most of the humans in a lending file are not the
//    borrower, and almost none of them is stored as a person in their own right.
//  · `repayment-collection` - the record that outlives the loan. A missed EMI
//    from four years ago is still readable, still feeds a segment, and still
//    turns up in a model's training set.
//
// ⛔ LANGUAGE LOCKS (spec §8): the product label is "High-impact identity,
// financial and behavioural data", NEVER "sensitive personal data" - the DPDPA
// creates no such statutory category. No financial, lending, investment, credit
// or regulatory advice anywhere in these examples: they name what is HELD, never
// what should be collected, retained or decided. Fraud suspicion is never
// written as confirmed fraud.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const FINTECH_NBFC_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "identity-contact",
    name: "Customer identity & contact",
    kind: "provided",
    examples: [
      "Name, mobile number & email",
      "Residence & communication address",
      "Date of birth, gender & photograph",
      "Occupation & employer name",
      "Customer ID & account status",
    ],
  },
  {
    id: "government-id",
    name: "PAN, KYC & identity documents",
    kind: "provided",
    examples: [
      "PAN & PAN verification result",
      "Aadhaar-derived KYC data & CKYC reference",
      "Identity & address proof documents",
      "Verification outcome & exception reason",
      "Failed or abandoned KYC attempts",
    ],
  },
  {
    id: "video-kyc-face",
    name: "Video KYC, face & liveness data",
    kind: "provided",
    examples: [
      "Video-KYC session recording",
      "Face image & photo-match result",
      "Liveness check outcome",
      "Agent-assisted verification notes",
    ],
  },
  {
    id: "related-party",
    name: "Co-applicant, guarantor & reference data",
    kind: "provided",
    examples: [
      "Co-applicant identity, KYC & income",
      "Guarantor details & guarantee record",
      "Nominee & beneficial-owner details",
      "References, neighbours & alternate contacts",
      "Relationship to the applicant",
    ],
  },
  {
    id: "bank-income-data",
    name: "Bank, income & Account Aggregator data",
    kind: "provided",
    examples: [
      "Bank account number, IFSC & cancelled cheque",
      "Bank statements & Account Aggregator extracts",
      "Salary slips, income proof & payroll verification",
      "GST, turnover & business financials",
      "Consent artefact & its expiry",
    ],
  },
  {
    id: "bureau-credit",
    name: "Credit bureau data",
    kind: "provided",
    examples: [
      "Credit bureau report & enquiry record",
      "Bureau score",
      "Existing loans, limits & obligations",
      "Historic repayment conduct reported by others",
    ],
  },
  {
    id: "payment-instrument",
    name: "Payment instruments & mandates",
    kind: "provided",
    examples: [
      "UPI ID / VPA & linked bank handle",
      "Card token & wallet identifier",
      "Saved payees & beneficiary list",
      "e-mandate / NACH authorisation",
      "Account-validation result",
    ],
  },
  {
    id: "transaction-history",
    name: "Transaction & payment history",
    kind: "provided",
    examples: [
      "Payer, payee, merchant & amount",
      "Timestamp, device reference & location",
      "Payment remark or narration",
      "Failure codes, reversals & settlement entries",
      "Merchant category & spend pattern",
    ],
  },
  {
    id: "device-app-signal",
    name: "Device & app signals",
    kind: "provided",
    examples: [
      "Device ID, model & operating system",
      "IP address, SIM data & app version",
      "Device-binding & session history",
      "Permissions granted & app integrity result",
    ],
  },
  {
    id: "contact-sms-location",
    name: "Contact list, SMS & precise location",
    kind: "provided",
    examples: [
      "Phone contact list read from the handset",
      "SMS-derived transaction and balance data",
      "Precise or continuous location",
      "Installed-application inventory",
    ],
  },
  {
    id: "derived-score",
    name: "Scores, grades & eligibility profiles",
    kind: "derived",
    examples: [
      "Credit score, risk grade & income confidence",
      "Fraud, device-risk & transaction-risk scores",
      "Eligible amount, pricing tier & credit limit",
      "Debt-service and loan-to-value ratios",
      "Contactability & collection-risk band",
    ],
  },
  {
    id: "automated-decision",
    name: "Automated & assisted decisions",
    kind: "derived",
    examples: [
      "Approval, rejection or lower-amount outcome",
      "Transaction block, step-up or account freeze",
      "Reason codes & adverse-action record",
      "Model or rule version & decision log",
      "Manual-review status & reviewer rationale",
    ],
  },
  {
    id: "loan-collateral",
    name: "Loan, agreement & collateral records",
    kind: "provided",
    examples: [
      "Sanction letter, agreement & e-sign certificate",
      "Loan account, EMI schedule & disbursal record",
      "Security document, guarantee & registry filing",
      "Collateral details, valuation & photographs",
      "Bundled insurance record",
    ],
  },
  {
    id: "repayment-collection",
    name: "Repayment, delinquency & collection records",
    kind: "provided",
    examples: [
      "Repayment history, failed debits & outstanding balance",
      "Delinquency status & days past due",
      "Collection notes, promise-to-pay & field-visit result",
      "Call recordings & agency assignment log",
      "Settlement, restructuring & recovery status",
    ],
  },
  {
    id: "marketing-profile",
    name: "Cross-sell & marketing profiles",
    kind: "derived",
    examples: [
      "Customer-value band & propensity score",
      "Pre-approved offer & cross-sell segment",
      "Cashback, rewards & lifestyle segment",
      "Advertising audience & lookalike upload",
      "Channel preferences & suppression status",
    ],
  },
  {
    id: "complaint-dispute",
    name: "Support, complaint & dispute records",
    kind: "provided",
    examples: [
      "Support ticket, chat transcript & screenshots",
      "Dispute, chargeback & transaction evidence",
      "Grievance, escalation & resolution record",
      "Agent notes & customer-risk observations",
    ],
  },
];

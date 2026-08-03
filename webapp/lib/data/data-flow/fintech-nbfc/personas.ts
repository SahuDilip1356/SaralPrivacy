// Everyone who can read the customer's data at some point in the journey -
// inside the company, at a partner, at a vendor and outside all of them.
//
// Two entries carry the sector's second signature (spec §3): `related-person`
// and `payee-merchant`. Neither of them applied for anything. A guarantor, a
// nominee, a reference, an alternate contact, the neighbour a field officer
// spoke to, the person on the other end of a UPI transfer - all of them are data
// principals whose details sit inside somebody else's file, and none of them was
// given a notice. Modelling them as people rather than as fields is the point.
//
// `dsa-agent`, `recovery-agent` and `field-officer` are deliberately separated.
// A field officer is usually on the company's own rolls; a DSA and a recovery
// agent are not, and that difference is exactly what decides whether a control
// is a policy you can enforce or a contract you have to police.
//
// ⛔ No accusation (spec §8). DSAs, field officers, call centres and recovery
// agencies are how this trade reaches customers who would otherwise not be
// reached at all. These entries describe what each role can SEE, not what each
// role does wrong.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const FINTECH_NBFC_PERSONAS: FlowPersona[] = [
  // ---- The people whose data this is --------------------------------------
  {
    id: "customer",
    name: "Customer / borrower",
    boundary: "candidate",
    description:
      "The data principal. Applies, transacts, repays or is refused - and is the only person in this list who cannot see most of what is held about them.",
  },
  {
    id: "related-person",
    name: "Co-applicant, guarantor, nominee or reference",
    boundary: "candidate",
    description:
      "A separate data principal who is in the file because of a relationship, not an application. Their identity, income and phone number sit as fields on somebody else's record, and they are usually contacted only when something has gone wrong.",
  },
  {
    id: "payee-merchant",
    name: "Payee, merchant or counterparty",
    boundary: "candidate",
    description:
      "The person or business on the other side of a transfer. Their name, handle and the amount become part of the customer's history - and the customer becomes part of theirs.",
  },

  // ---- Inside the company -------------------------------------------------
  {
    id: "sales-telecaller",
    name: "Sales, telecalling & relationship staff",
    boundary: "agency",
    description:
      "Works the lead list, calls the applicant, chases the drop-off and later sells the next product. Sees identity, product interest, application status and - once the account exists - repayment behaviour.",
  },
  {
    id: "kyc-ops",
    name: "KYC & onboarding operations",
    boundary: "agency",
    description:
      "Opens documents, resolves name and address mismatches, watches video-KYC recordings and clears exceptions. The team with the most routine access to identity documents in the business.",
  },
  {
    id: "credit-underwriter",
    name: "Credit analyst & underwriter",
    boundary: "agency",
    description:
      "Reads the statements, the bureau report and the field notes and decides - or overrides what the model decided. Genuinely needs the whole file; often keeps access to it long after the case closes.",
  },
  {
    id: "risk-fraud-analyst",
    name: "Risk & fraud operations",
    boundary: "agency",
    description:
      "Reviews blocks, freezes and flagged transactions, and can see device history, location, transaction patterns and previous investigations across accounts.",
  },
  {
    id: "data-science-team",
    name: "Data science & analytics",
    boundary: "agency",
    description:
      "Builds and retrains the models and the segments. Usually works on the widest dataset in the company, assembled from every other system, and rarely on data that has been narrowed to a purpose.",
  },
  {
    id: "support-agent",
    name: "Customer support & call-centre agent",
    boundary: "agency",
    description:
      "Answers the query, and to do it opens a console showing the whole account - identity, statements, transactions, notes and previous complaints - regardless of what was actually asked.",
  },
  {
    id: "collections-officer",
    name: "In-house collections & recovery staff",
    boundary: "agency",
    description:
      "Runs the delinquency book, assigns accounts to agencies and field teams, and works from contact data that includes the borrower's family and workplace.",
  },
  {
    id: "field-officer",
    name: "Field officer & branch staff",
    boundary: "agency",
    description:
      "Visits the house or the shop, verifies, collects documents and cash, and services walk-ins at the branch. Carries an application - and sometimes a printed list - out of the office.",
  },
  {
    id: "compliance-officer",
    name: "Compliance & grievance officer",
    boundary: "agency",
    description:
      "Handles complaints, lawful requests and audits. Needs to see what was disclosed to whom, which is only possible if somebody wrote it down at the time.",
  },
  {
    id: "it-admin",
    name: "IT & platform administrator",
    boundary: "agency",
    description:
      "Holds the database, backup and integration credentials. Can reach every record in the business without appearing in any business-level access log.",
  },

  // ---- Partners, agents and vendors ---------------------------------------
  {
    id: "dsa-agent",
    name: "DSA, dealer & channel partner",
    boundary: "third-party",
    description:
      "Introduces the customer and often collects the first set of documents. Works for several lenders at once, on their own device, and keeps a copy of the lead either way.",
  },
  {
    id: "recovery-agent",
    name: "Collection agency & recovery agent",
    boundary: "third-party",
    description:
      "Receives an assignment with the borrower's identity, balance, address, alternate contacts and history, and works it from a dialler, a field app or a personal phone.",
  },
  {
    id: "partner-lender-team",
    name: "Partner lender, bank & network staff",
    boundary: "client",
    description:
      "Receives the file to make its own decision or move the money. Holds a complete copy under its own retention rules, including at the institutions that declined.",
  },
  {
    id: "bureau-aa-operator",
    name: "Credit bureau & Account Aggregator",
    boundary: "third-party",
    description:
      "Supplies the bureau report and the consented bank data, and records the enquiry itself. What they hold about the customer is largely outside the company's control to correct.",
  },
  {
    id: "vendor-support",
    name: "Technology & platform vendor staff",
    boundary: "vendor",
    description:
      "KYC, scoring, statement-analysis, communication, cloud and analytics providers. Support engineers can usually see live customer data while fixing a ticket.",
  },
  {
    id: "legal-valuation-vendor",
    name: "Legal, valuation & repossession vendor",
    boundary: "third-party",
    description:
      "Appointed when a case needs enforcement or an asset needs a value. Receives borrower, guarantor and collateral details, and keeps the matter file after the engagement ends.",
  },
  {
    id: "authority",
    name: "Regulator, court or authority",
    boundary: "government",
    description:
      "Receives records under a lawful request or as part of proceedings. Once data is here it is no longer the company's to correct or delete, and that has to be said plainly.",
  },
];

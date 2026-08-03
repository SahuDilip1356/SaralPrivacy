// Customer & financial-decision journey - 16 stages in the union, MODEL-GATED
// to 13 / 12 / 15. Spec: docs/SaralPrivacy_FintechNbfc_DataFlow_Spec.md §4.
//
// Every map in this series names its sector's shape before writing stages. A
// candidate's data flows once. A CA client's returns every year. A law firm's
// matter file becomes public by design. A hotel knows where the guest's body
// is. A pharmacy's parcel announces the diagnosis.
//
// A FINTECH OR NBFC IS THE ONLY BUSINESS IN THIS SERIES WHOSE PRODUCT IS A
// JUDGEMENT ABOUT THE PERSON. Everywhere else the business holds records ABOUT
// somebody and the risk is that a record escapes. Here the records are fed into
// a model that DECIDES - approve, refuse, price, limit, block, freeze - and the
// decision itself becomes a new, permanent, shareable fact about that person,
// one they usually cannot see, cannot check the inputs of, and cannot appeal.
// A pharmacy's parcel discloses a condition that already existed. A lender's
// rejection creates one. That is why `risk-decision` carries the rank-1 hotspot
// rather than a storage system.
//
// The second half of the signature: THE PEOPLE WHO NEVER APPLIED ARE IN THE
// FILE TOO. The contact list read off the phone at onboarding, the co-applicant,
// the guarantor, the nominee, the "alternate contact", the payee on a transfer,
// the neighbour a field officer asked about. None of them applied for anything,
// none was given a notice, and every one of them can be telephoned when the
// account goes bad. Hence `related-party` as a stage in both lending models and
// `contact-sms-location` as a first-class category.
//
// The three models are genuinely different processes, not one journey with
// different systems (spec §2):
//   digital-lending - app or DSA lead, device permissions standing in for credit
//                     history, an Account Aggregator pull, a bureau hit, a model
//                     that scores in seconds, and a FAN-OUT: the same file goes
//                     to several lenders, each of which keeps its own copy and
//                     makes its own decision.
//   payments        - the customer is never underwritten. Device binding, a KYC
//                     tier, bank/card/UPI linking, and then a continuous stream
//                     of transactions each screened in real time by a fraud
//                     model that can block or freeze without warning. The
//                     relationship map - who paid whom, where, when - is the
//                     asset.
//   nbfc            - branch, DSA, dealer and field officer intake; the
//                     co-applicant, guarantor and nominee are part of the file
//                     from the start; a valuer and a field officer visit the
//                     house; a committee decides; a physical file exists; and
//                     recovery can end in repossession and a public auction.
//
// ⚠️ THERE IS NO SUPERSET, AND ONE IS NOT MANUFACTURED (map #8 established that a
// superset is a convention, not a schema rule). `nbfc` is NOT a superset of
// `digital-lending`: an NBFC lending on its own book does not fan one
// application out to several competing lenders and does not harvest a contact
// list or SMS inbox as a substitute for credit history. `nbfc` is NOT a superset
// of `payments`: no UPI rail, no card tokenisation, no merchant acquiring, no
// settlement or chargeback workflow. Each variant-specific entity therefore tags
// itself with exactly the models it honestly appears in.
//
// ELEVEN of the sixteen stages are ALL-MODEL. That is load-bearing: all eight
// hotspots sit on eight DISTINCT all-model stages, so the journey's red flags
// reconcile with the hotspot counter by arithmetic in every model (spec §5,
// guard test (a)). Do not gate an all-model stage without re-deriving §5.
//
// ⚠️ SEQUENCE ORDER IS LOAD-BEARING, NOT JUST GATING (learned on map #10). A node
// resolves to the EARLIEST of its stages visible in the selected model, so the
// order has to follow the real order of events or a stage renders with no system
// at all in one model. Invisible to `validatePack` and to both guard tests -
// only the framework's §5 script catches it. Two orderings here are deliberate:
//  · `related-party` (4) sits before `bank-bureau-data` (6) because the
//    co-applicant and guarantor are identified while KYC is being done, not
//    after the bureau comes back.
//  · `adverse-recovery` (13) sits before `marketing-crosssell` (15) because a
//    delinquency record is what feeds the segment, not the other way round.
//
// Two merges worth recording:
//  · The pasted spec's payments §10.9 (account restrictions, recovery, lawful
//    requests) and its lending §9.10 / NBFC §11.7 (delinquency, collections,
//    recovery) are ONE all-model stage here. All three models genuinely have an
//    adverse path; the systems on it differ completely, which is what gating is
//    for. Keeping them apart would have cost an all-model stage and left seven
//    for eight hotspots.
//  · The spec's separate income/bank and bureau/underwriting stages merge into
//    `bank-bureau-data`, because in both lending models the Account Aggregator
//    pull, the statement analysis and the bureau hit happen as one gathering act
//    before any human opens the file.
//
// Per-model counts are DERIVED from this union - one shared array filtered by
// model - so they cannot be set independently. The pasted spec asked for 10
// stages in each of the three variants; the honest derived answer is 13 / 12 /
// 15 (spec §4).

import type { FlowStage } from "../../../data-flow/schemas.ts";

/** Lends on its own book or a partner's; underwrites a person. */
const LENDING = ["digital-lending", "nbfc"];
const PAYMENTS = ["payments"];
const NBFC = ["nbfc"];

export const FINTECH_NBFC_STAGES: FlowStage[] = [
  {
    id: "lead-acquisition",
    name: "Lead generation, DSA & partner referral",
    sequence: 1,
    summary:
      "The enquiry arrives long before any account exists - a campaign click, an app install, a comparison-site lead, a DSA who already holds a photographed PAN card, a dealer, an employer tie-up, a call-centre callback or a branch walk-in. Within minutes the same person sits in a CRM, an attribution platform, a partner's portal and somebody's own phone.",
    dpdpaNote:
      "Someone asking what a loan would cost has not agreed to be marketed to for the next three years. Give a notice at the point the enquiry is taken, collect only what the enquiry needs, keep the partner who introduced them from keeping their own copy, and decide when a lead that never converted is deleted.",
  },
  {
    id: "registration-device",
    name: "Registration, device binding & app permissions",
    sequence: 2,
    summary:
      "The customer registers: a mobile number, an OTP, a device bound to the account, and a permission dialogue asking for rather more than the account needs. A device fingerprint, an IP, an app inventory and often a location go to a device-intelligence vendor before any financial data has been given at all.",
    dpdpaNote:
      "Security signals and marketing signals are different purposes and should not travel together. Ask for the permissions the service genuinely needs and say what each one is for, keep device data out of profiling that has nothing to do with fraud, and make a permission withdrawable without the account breaking.",
  },
  {
    id: "identity-kyc",
    name: "KYC, identity verification & video KYC",
    sequence: 3,
    summary:
      "PAN, an identity document, an address, a photograph, a CKYC reference, and for many flows a video-KYC session with a face match and a liveness check. Copies land with the verification provider, in a document repository, in a manual-review queue when something does not match, and on the device of whoever collected them.",
    dpdpaNote:
      "A verification outcome is usually all you need to keep; the underlying document often is not. Decide which copy is the master, restrict who can open a video-KYC recording, never let an agent's own device be where a KYC document rests, and set a retention rule for the attempts that failed as well as the ones that passed.",
  },
  {
    id: "related-party",
    name: "Co-applicant, guarantor, nominee & references",
    sequence: 4,
    summary:
      "The file grows to include people who are not the applicant: a co-applicant, a guarantor and their income proof, a nominee, a spouse or parent as the alternate contact, two references and their phone numbers, and in some products a beneficial owner. Most of them are stored as fields on somebody else's record.",
    dpdpaNote:
      "Each of these is a separate data principal, and the applicant's consent is not theirs. Create a distinct record for each person with their role written down, give each of them a notice appropriate to that role, restrict who can see a related party's details, and support correction and unlinking when a relationship ends.",
    businessModels: LENDING,
  },
  {
    id: "account-linking",
    name: "Bank, card, wallet & UPI linking",
    sequence: 5,
    summary:
      "One app is connected to the customer's money: a bank account validated and linked, a UPI ID or VPA created, a card tokenised, a wallet opened, a mandate authorised, and a list of saved payees that grows every time somebody is paid.",
    dpdpaNote:
      "A saved beneficiary list is a record of the customer's relationships, not just their payment methods. Tokenise where the rail allows it, restrict who inside the business can read a bank identifier, remove payment methods and payees that have gone stale, and keep the evidence of what was authorised separate from the operational record.",
    businessModels: PAYMENTS,
  },
  {
    id: "bank-bureau-data",
    name: "Bank statements, Account Aggregator, income & bureau",
    sequence: 6,
    summary:
      "The heaviest collection in the sector, and the fastest. Bank statements uploaded or pulled through an Account Aggregator, parsed by an analysis vendor into salary credits, existing EMIs and cash-flow patterns; income or GST data verified; and a credit bureau report pulled that lists every other loan the person holds.",
    dpdpaNote:
      "Raw statements and the figures derived from them are two different things with two different lifespans, and the raw ones rarely need to survive the decision. Use a purpose-bound consent, keep transaction-level detail away from anything that is not underwriting, delete the copies taken for applications that were refused, and give the customer a route to correct a derived figure as well as a factual one.",
    businessModels: LENDING,
  },
  {
    id: "field-verification",
    name: "Field verification, collateral & valuation",
    sequence: 7,
    summary:
      "A field officer visits the house and the workplace, photographs the property, records a geo-tag, and writes down what a neighbour or a reference said. A valuer inspects a flat, a vehicle or gold and produces a report. Both create records about the applicant's household that the applicant never wrote.",
    dpdpaNote:
      "Asking a neighbour about somebody discloses that they applied. Keep third-party enquiries to the minimum the product genuinely requires, collect field photographs and locations on a managed application rather than a personal camera roll, keep the notes factual rather than characterful, and send a valuer only the details the valuation needs.",
    businessModels: NBFC,
  },
  {
    id: "risk-decision",
    name: "Fraud screening, scoring & the automated decision",
    sequence: 8,
    summary:
      "Everything collected so far is combined and judged. A fraud engine, a rules engine and a model produce a risk grade, an eligibility, a price, a limit or a block - and a reason code. A human may review it; often nothing does. The decision, the score and the model version are written to a log and, later, back into the training data.",
    dpdpaNote:
      "This is the point where data stops describing the person and starts deciding for them. Record what the model was for and which categories it read, keep a human able to review a material adverse decision, give a reason the customer can actually act on, let them correct a factual input, and keep a fraud suspicion clearly distinct from confirmed wrongdoing.",
  },
  {
    id: "partner-disclosure",
    name: "Lender allocation, partner banks & networks",
    sequence: 9,
    summary:
      "The file leaves. A routing engine sends the same application to several lenders, each of which makes its own decision and keeps its own copy; a payment business hands identity and transaction data to a partner bank and a network; an NBFC discloses to a co-lender, an insurer and a registry. Each recipient becomes a separate holder of the record.",
    dpdpaNote:
      "The customer generally cannot name everyone who now holds their file, and the ones who said no keep it too. Keep a register of who received what, send each recipient the minimum their decision needs rather than the whole application, be clear about which organisation is actually making the decision, and track deletion at the recipients who declined.",
  },
  {
    id: "agreement-activation",
    name: "Agreement, e-sign, mandate & activation",
    sequence: 10,
    summary:
      "The relationship is executed: an agreement generated and e-signed, a repayment mandate registered, an account or limit activated, sometimes an insurance policy bundled alongside, and for a secured loan a security document, a guarantee and a registry filing. Several systems now hold a signed package containing the customer's identity and bank details.",
    dpdpaNote:
      "Decide which system is the final record and delete the working drafts everywhere else. Keep an optional product like insurance a genuine choice rather than a pre-ticked line in the same package, restrict who can open an executed agreement, and make sure the customer keeps a copy they can actually reach.",
  },
  {
    id: "money-movement",
    name: "Disbursal, payment processing & settlement",
    sequence: 11,
    summary:
      "Money moves, and every movement writes a record somewhere else: a disbursal instruction to a bank, a payment through a gateway and a network, an authorisation, a settlement entry, a reconciliation file, a failure code, a reversal, a merchant payout and an accounting posting.",
    dpdpaNote:
      "A ledger entry has grounds to exist for a long time; the metadata bolted onto it usually does not. Keep the transaction record and the behavioural detail on separate clocks, restrict who can export a reconciliation file, and know which of these systems belong to somebody else so a later request is answered honestly.",
  },
  {
    id: "servicing-support",
    name: "Servicing, statements, support & disputes",
    sequence: 12,
    summary:
      "The everyday relationship: statements, EMI schedules and balances, a failed auto-debit, a foreclosure request, a chargeback, a complaint. A support agent opens a console that shows the whole account history, a call is recorded, a screenshot arrives on WhatsApp, and a note is typed about the customer.",
    dpdpaNote:
      "An agent handling one question rarely needs the whole file to answer it. Scope the console to what the query needs, verify who is actually asking before disclosing anything, keep notes factual rather than judgemental, set a retention period for call recordings, and make sure a correction made here reaches the systems downstream.",
  },
  {
    id: "adverse-recovery",
    name: "Adverse action, restriction & recovery",
    sequence: 13,
    summary:
      "The path when things go wrong, and it looks different in each model: a delinquency assigned to an agency with a dialler and a field app; a frozen wallet, a negative balance and an investigation; a branch collection team and a printed list of borrowers. In all three, the customer's details - and their family's - reach people outside the core systems.",
    dpdpaNote:
      "This is where the most contact data travels to the least controlled places. Use managed systems rather than personal phones, send an agency the minimum it needs to make contact, keep alternate contacts and family members out of it unless there is a genuine reason, log every assignment and visit, revoke an agent's access the day they leave, and log every disclosure made to an authority.",
  },
  {
    id: "legal-enforcement",
    name: "Legal recovery, repossession & proceedings",
    sequence: 14,
    summary:
      "External counsel, a repossession agent, a valuer, an auction platform and a tribunal each receive a slice of the borrower's file - identity, balance, address, payment history, the guarantor's details and the collateral - and some of what they publish is open to anyone.",
    dpdpaNote:
      "Once a matter is in an authority's hands the record stops being yours to correct or delete, and that has to be said plainly rather than promised away. Keep a register of who received what, send each vendor only the recovery dataset it needs, control what identifying detail appears in a public listing, and close vendor access when the matter ends.",
    businessModels: NBFC,
  },
  {
    id: "marketing-crosssell",
    name: "Cross-sell, offers, audiences & analytics",
    sequence: 15,
    summary:
      "Repayment behaviour, transaction history and spend categories become a customer-value band, a propensity score, a pre-approved offer, a cashback segment and an audience uploaded to an advertising platform - reaching the customer by SMS, push, WhatsApp, a call-centre campaign, a DSA follow-up list or a branch sales sheet.",
    dpdpaNote:
      "A service message and a promotion are different things and need different choices. Keep one suppression list that every channel checks, be able to explain what a segment was built from, keep financial-distress and transaction-category signals out of advertising audiences, and make a withdrawal reach the partner and agency lists too, not just your own database.",
  },
  {
    id: "archive-deletion",
    name: "Closure, rejected applications, archive & deletion",
    sequence: 16,
    summary:
      "Everything settles: the closed loan, the shut wallet, the branch's physical file, the data warehouse, the model-training set, the vendor and DSA copies, the backups - and the fullest file of all, belonging to the people who were refused and never became customers at all.",
    dpdpaNote:
      "Retention has to be decided per record, not per person. A ledger entry, a live account and a record another law requires you to hold have grounds to stay; a bank statement pulled for an application that was refused two years ago does not. Separate what must be kept from what has merely never been deleted, suppress cross-sell the day an account closes, and write down the copies you know you cannot reach.",
  },
];

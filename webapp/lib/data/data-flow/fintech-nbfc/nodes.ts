// Systems, repositories, devices, physical stores and people that hold customer
// data in a typical Indian digital lender, payments or wallet fintech, or
// multi-product NBFC - NOT any specific business's environment (reference-model
// rule).
//
// Real things are named - the DSA's own handset with a photographed PAN on it,
// the permission dialogue that asks for the contact list, the Account
// Aggregator consent, the statement-analysis vendor's queue, the bureau hit, the
// routing engine that sends one file to five lenders, the e-mandate, the
// dialler, the field-collection app's route history, the printed borrower list,
// the audience uploaded to an ad platform, the rejected-application store -
// because a generic "loan origination system" fails the "that's my business"
// test. Storage, devices and chat channels are SPANNING nodes: they attach
// across stages, because that is where data sits over the whole relationship
// rather than at one step.
//
// ⚠️ WHERE A HOTSPOT NODE STARTS IS LOAD-BEARING.
//
// The journey paints one red flag per DISTINCT stage a hotspot node resolves
// to - the FIRST of its stageIds visible in the selected model - while the
// counter prints `pack.hotspots.length`. If two hotspot nodes share a first
// stage they collapse into one flag; if a hotspot node is gated away it flags
// nothing. Either way the map's red flags stop agreeing with its own counter,
// which is the defect that recurred across maps #1-#3 and is now caught by the
// `hotspots reconcile with the counter` guard test.
//
// THE CONSTRUCTION HERE (spec §5): all eight hotspot nodes are UNGATED, and each
// one's EARLIEST stage is a distinct ALL-MODEL stage:
//
//   agent-personal-phone ..... lead-acquisition (1)   support-console ......... servicing-support (12)
//   device-permission-layer .. registration-device(2) collections-agency ...... adverse-recovery (13)
//   decision-engine .......... risk-decision (8)      cross-sell-audience ..... marketing-crosssell (15)
//   partner-bank-lender ...... partner-disclosure (9) rejected-application-archive archive-deletion (16)
//
// A hotspot node may span LATER stages - the decision engine genuinely resurfaces
// at partner disclosure and again in collections segmentation - but must never
// acquire an EARLIER one. Four traps specific to this pack:
//  · `device-permission-layer` must NOT list `lead-acquisition`. The app really
//    is the acquisition channel too - that is what `app-website` is for - but
//    adding stage 1 here would collide its flag with `agent-personal-phone` in
//    all three models at once.
//  · `partner-bank-lender` must NOT list `risk-decision`. Lenders do receive the
//    file while the decision is being made in a routing model; the DISCLOSURE is
//    what stage 9 is for, and giving this node stage 8 would collide it with
//    `decision-engine`.
//  · `support-console` must NOT list any stage before `servicing-support`.
//    Support genuinely helps during onboarding; that is `call-centre-platform`.
//  · `collections-agency` legitimately spans `legal-enforcement`, which is
//    NBFC-only. That is safe: the node itself is ungated, so its earliest
//    VISIBLE stage is `adverse-recovery` in every model.
//
// Deliberately NOT hotspots, because they sit on model-gated stages: the
// contact-list and SMS store, the Account Aggregator pull, the statement-analysis
// vendor, the bureau, the downloaded statements on a staff laptop, the field
// verification app, the valuer, the credit committee, the repossession agent and
// the public auction listing. Each is authored as a high- or critical-risk node
// instead, and renders in full wherever it exists (spec §5). Between them they
// carry every one of the 34 per-variant hotspots the pasted spec asked for.
//
// Risk ratio is deliberately controlled: no fearmongering. Ten critical and
// thirty-three high out of eighty - a first pass came back at forty-seven high,
// which would have made most of the map red and therefore meaningless. Systems
// that are genuinely well-controlled in this sector (the regulated verification
// provider, the e-sign platform, the core lending book, the reconciliation
// platform, the master record) sit at medium and keep their `riskWhy` and
// `riskAction` anyway. If most of the map is red, nothing is.
//
// ⛔ Fraud suspicion is never written as confirmed fraud, anywhere in this file.

import type { FlowNode } from "../../../data-flow/schemas.ts";

/** Underwrites a person and lends against that judgement. */
const LENDING = ["digital-lending", "nbfc"];
/** App-first digital lender only - the contact-list and routing behaviours. */
const DIGITAL = ["digital-lending"];
const PAYMENTS = ["payments"];
const NBFC = ["nbfc"];

export const FINTECH_NBFC_NODES: FlowNode[] = [
  // ---- The people ---------------------------------------------------------
  {
    id: "customer-person",
    name: "Customer / borrower",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["lead-acquisition", "registration-device", "identity-kyc", "risk-decision", "agreement-activation", "money-movement", "servicing-support"],
    description:
      "The data principal. One identity, one financial history - everything below is a copy, a derivative, or something the business worked out about them and then acted on.",
    dataCategoryIds: ["identity-contact", "government-id", "bank-income-data", "transaction-history"],
    accessPersonaIds: ["customer"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "related-party-person",
    name: "Co-applicant, guarantor, nominee or reference",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["related-party", "identity-kyc", "field-verification", "agreement-activation", "adverse-recovery"],
    description:
      "The spouse who co-signs, the guarantor whose income proof is in the file, the nominee, the two references whose numbers were written down at application, the parent listed as the alternate contact. Separate data principals, stored as fields on somebody else's record.",
    dataCategoryIds: ["related-party", "identity-contact", "government-id", "bank-income-data"],
    accessPersonaIds: ["related-person", "kyc-ops", "credit-underwriter", "collections-officer", "dsa-agent"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "None of these people applied for anything and most were never given a notice, yet their identity and income sit in the file and their phone numbers are the ones dialled when the account goes bad. Because they are stored as fields rather than as people, a request from any of them has nothing to search on.",
    riskAction:
      "Create a separate record per person with their role and authority written down, give each a notice appropriate to that role, and support correction and unlinking when the relationship ends.",
    businessModels: LENDING,
  },
  {
    id: "payee-merchant-person",
    name: "Payee, merchant or counterparty",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["account-linking", "money-movement", "servicing-support"],
    description:
      "The person or shop on the other side of a transfer. Their handle, name and the amount become a permanent line in somebody else's history - and vice versa.",
    dataCategoryIds: ["payment-instrument", "transaction-history", "identity-contact"],
    accessPersonaIds: ["payee-merchant", "customer", "support-agent", "risk-fraud-analyst"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: PAYMENTS,
  },
  {
    id: "dsa-agent-person",
    name: "DSA, dealer & channel partner",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["lead-acquisition", "identity-kyc", "related-party", "agreement-activation"],
    description:
      "Introduces the customer, often collects the first documents, and works for several lenders at once. The first person to hold a PAN card photograph, and rarely the last to delete it.",
    dataCategoryIds: ["identity-contact", "government-id", "bank-income-data", "related-party"],
    accessPersonaIds: ["dsa-agent", "sales-telecaller"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The documents are collected on the agent's own device, before the customer has any relationship with the business, and the agent has a commercial reason to keep the lead whether or not the application succeeds.",
    riskAction:
      "Make the agent submit through a managed portal that keeps nothing locally, contract for deletion and check it, and log which agent touched which application.",
  },
  {
    id: "underwriter-person",
    name: "Credit analyst & underwriter",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["bank-bureau-data", "field-verification", "risk-decision", "partner-disclosure"],
    description:
      "Reads the statements, the bureau report and the field notes, and either confirms or overrides what the model decided. The one role that genuinely needs the whole file.",
    dataCategoryIds: ["bank-income-data", "bureau-credit", "derived-score", "automated-decision"],
    accessPersonaIds: ["credit-underwriter", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: LENDING,
  },
  {
    id: "support-agent-person",
    name: "Support & call-centre agent",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["lead-acquisition", "servicing-support", "adverse-recovery"],
    description:
      "Answers the question - and to answer it opens the entire account, including statements, transactions, previous complaints and whatever the last agent typed about this customer.",
    dataCategoryIds: ["identity-contact", "transaction-history", "complaint-dispute", "repayment-collection"],
    accessPersonaIds: ["support-agent", "sales-telecaller"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "High-turnover roles with the widest routine read access in the business, usually with no restriction tied to what the customer actually asked about, and often able to export a list.",
    riskAction:
      "Scope the agent view to the query type, verify the caller before disclosing anything, and alert on bulk reads and exports rather than only on failed logins.",
  },
  {
    id: "collections-agent-person",
    name: "Recovery & field-collection agent",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["adverse-recovery", "legal-enforcement"],
    description:
      "Receives an assignment listing the borrower, the balance, the address, the alternate contacts and the history - and works it from a dialler, a field app, a printed sheet or a personal phone.",
    dataCategoryIds: ["repayment-collection", "identity-contact", "related-party", "loan-collateral"],
    accessPersonaIds: ["recovery-agent", "collections-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The most contact data in the business travels to the least controlled environment, and it includes people who never borrowed anything. An agent who leaves usually still has the list.",
    riskAction:
      "Assign through a managed application with no export, send only the contacts needed to reach the borrower, log every assignment and visit, and revoke access the day an agent stops working the book.",
    businessModels: LENDING,
  },
  {
    id: "field-officer-person",
    name: "Field officer & branch staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["lead-acquisition", "identity-kyc", "field-verification", "servicing-support", "adverse-recovery"],
    description:
      "Visits the house and the workplace, verifies the address, photographs the collateral, carries the file back to the branch and services the customer who walks in.",
    dataCategoryIds: ["identity-contact", "government-id", "loan-collateral", "related-party"],
    accessPersonaIds: ["field-officer", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: NBFC,
  },
  {
    id: "it-admin-person",
    name: "IT & platform administrator",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["registration-device", "risk-decision", "servicing-support", "archive-deletion"],
    description:
      "Holds the database, integration and backup credentials. Can reach every record in the business without appearing in any business-level access log.",
    dataCategoryIds: ["identity-contact", "government-id", "bank-income-data", "transaction-history"],
    accessPersonaIds: ["it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Administrative access sits outside the permissions the business thinks it has granted, and it is usually the only route by which a whole-database copy can be made in one action.",
    riskAction:
      "Separate administrative access from data access, require a named reason for production reads, and keep an audit trail the administrator cannot edit.",
  },

  // ---- Stage 1: lead acquisition ------------------------------------------
  {
    id: "app-website",
    name: "Mobile app & website",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["lead-acquisition", "registration-device", "account-linking", "agreement-activation", "servicing-support"],
    description:
      "The front door and, for most of these businesses, the whole relationship: the enquiry form, the eligibility check, the sign-up, the account, the statement and the support chat.",
    dataCategoryIds: ["identity-contact", "device-app-signal", "transaction-history"],
    accessPersonaIds: ["customer", "sales-telecaller", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "ad-attribution",
    name: "Advertising & attribution platforms",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["lead-acquisition", "marketing-crosssell"],
    description:
      "Campaign platforms, install-attribution SDKs and analytics tags that know a device looked at a loan or a wallet, which advert brought it, and what it did next - before any account exists.",
    dataCategoryIds: ["device-app-signal", "identity-contact", "marketing-profile"],
    accessPersonaIds: ["sales-telecaller", "vendor-support", "data-science-team"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Someone comparing loan options has disclosed something about their finances, and the disclosure is happening to advertising infrastructure rather than to the lender, before any notice has been given or any choice offered.",
    riskAction:
      "Separate the analytics you need to run the product from advertising tags, ask before the advertising ones load, and never send an application outcome back to an ad platform as a conversion signal.",
  },
  {
    id: "lead-crm",
    name: "CRM & lead-management system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["lead-acquisition", "servicing-support", "marketing-crosssell", "archive-deletion"],
    description:
      "Where every enquiry lands and stays: name, number, product interest, indicative amount, source, DSA attribution, call disposition, follow-up status - and, later, the whole account relationship.",
    dataCategoryIds: ["identity-contact", "marketing-profile", "complaint-dispute"],
    accessPersonaIds: ["sales-telecaller", "support-agent", "collections-officer", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "The CRM accumulates everyone who ever asked a question and almost never lets anyone go. Most of these people never became customers, and a large export is a single click for a very large number of staff.",
    riskAction:
      "Set a deletion clock for leads that never converted, separate marketing consent from application support, and restrict and alert on bulk export.",
  },
  {
    id: "dsa-partner-portal",
    name: "DSA, dealer & partner portal",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["lead-acquisition", "identity-kyc", "related-party", "agreement-activation", "archive-deletion"],
    description:
      "The channel partner's own workspace - a portal, a shared sheet, an API or a dealer's back office - where leads are submitted, documents uploaded and status tracked. The partner's copy is theirs, not yours.",
    dataCategoryIds: ["identity-contact", "government-id", "bank-income-data", "related-party"],
    accessPersonaIds: ["dsa-agent", "sales-telecaller", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Partners usually work for several lenders, so one applicant's documents can be submitted to more than one of them, and the partner keeps a full copy either way. What they retain and who else they show it to is outside your systems entirely.",
    riskAction:
      "Contract for what a partner may retain and for how long, make submission flow through a portal that keeps nothing on their side, and audit a sample of partners rather than assuming.",
  },
  {
    id: "agent-personal-phone",
    name: "Staff & agent personal phones and WhatsApp",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["lead-acquisition", "identity-kyc", "servicing-support", "adverse-recovery"],
    description:
      "The handset the DSA photographs the PAN card on, the telecaller's WhatsApp thread with the applicant, the branch officer's camera roll of documents, the recovery officer's own number - the least managed and most used surface in the sector.",
    dataCategoryIds: ["government-id", "identity-contact", "bank-income-data", "repayment-collection"],
    accessPersonaIds: ["dsa-agent", "sales-telecaller", "field-officer", "recovery-agent", "support-agent"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Identity documents, bank statements and borrower lists end up in a personal camera roll and a personal chat backup that the business does not own, cannot search and cannot wipe. When the person leaves, all of it leaves with them - and this happens at four separate stages, which is why one node carries the whole journey.",
    riskAction:
      "Give every customer-facing role a managed application that submits without storing, use business numbers rather than personal ones for customer contact, prohibit document photographs on personal devices in writing, and revoke access the day someone stops working the account.",
  },
  {
    id: "call-centre-platform",
    name: "Call-centre & dialler platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["lead-acquisition", "servicing-support", "adverse-recovery", "marketing-crosssell"],
    description:
      "The outbound dialler and inbound queue: campaign lists, screen-pops showing the customer's file, dispositions, and a recording of every call, held by a vendor.",
    dataCategoryIds: ["identity-contact", "complaint-dispute", "repayment-collection", "marketing-profile"],
    accessPersonaIds: ["sales-telecaller", "support-agent", "collections-officer", "vendor-support"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "Campaign lists are uploaded and rarely deleted, recordings accumulate without a retention rule, and the same platform serves sales, service and collections - so a suppression in one does not necessarily reach the others.",
    riskAction:
      "Set a retention period for recordings and enforce it, upload only the fields a campaign needs, and make one suppression list that every campaign type checks before it dials.",
  },
  {
    id: "branch-register",
    name: "Branch walk-in register & counter file",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["lead-acquisition", "identity-kyc", "servicing-support"],
    description:
      "The paper trail of a branch: the visitor register at the desk, the enquiry slips, the photocopies taken 'for the file' and the tray of applications waiting to be keyed in.",
    dataCategoryIds: ["identity-contact", "government-id", "related-party"],
    accessPersonaIds: ["field-officer", "sales-telecaller", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: NBFC,
  },

  // ---- Stage 2: registration & device -------------------------------------
  {
    id: "device-permission-layer",
    name: "Device binding & app-permission layer",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["registration-device", "risk-decision"],
    description:
      "The permission dialogue and the binding record: device ID, operating system, IP, SIM data, app version, integrity result, location, and whatever else the app asked for at install - collected before any financial information has been given.",
    dataCategoryIds: ["device-app-signal", "contact-sms-location", "derived-score"],
    accessPersonaIds: ["risk-fraud-analyst", "data-science-team", "it-admin", "vendor-support"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Permissions granted for security are routinely reused for profiling, the request is usually bundled into sign-up so refusing means not having the product at all, and in app-first lending these signals are collected as a substitute for credit history - which makes a handset a proxy for a person's creditworthiness.",
    riskAction:
      "Ask only for permissions the service genuinely needs and state the purpose of each one separately, keep security signals out of credit and marketing models unless that use is disclosed, and make every permission withdrawable without the account breaking.",
  },
  {
    id: "device-intelligence-vendor",
    name: "Device-intelligence & fingerprinting vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["registration-device", "risk-decision", "adverse-recovery"],
    description:
      "A third-party service that scores the handset - emulator detection, rooting, velocity, reuse of the same device across accounts - and keeps its own record of every device it has ever seen.",
    dataCategoryIds: ["device-app-signal", "derived-score", "identity-contact"],
    accessPersonaIds: ["risk-fraud-analyst", "vendor-support", "data-science-team"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The vendor builds a cross-customer view of the device that no single business controls, and a signal generated for one client can influence an outcome at another. A shared household handset can carry a mark that belongs to somebody else.",
    riskAction:
      "Contract for what the vendor may retain and whether your data feeds its cross-client models, and make sure a device signal can never be the sole reason for an adverse decision.",
  },
  {
    id: "contact-sms-store",
    name: "Contact-list & SMS-derived data store",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["registration-device", "risk-decision", "adverse-recovery"],
    description:
      "Where the phone's address book, the transactional SMS inbox and the installed-app list land when the app has asked for them - parsed into balances, other lenders' messages, and a network of names and numbers.",
    dataCategoryIds: ["contact-sms-location", "derived-score", "identity-contact"],
    accessPersonaIds: ["risk-fraud-analyst", "data-science-team", "collections-officer", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Everyone in that contact list is a data principal who never applied for anything, was never told, and cannot ask for their number to be removed because they do not know it is there. It is also the store that turns into a contactability list the moment an account goes bad.",
    riskAction:
      "Do not read the contact list or the SMS inbox for credit or collections purposes. Where a business believes it has a genuine need for any part of this, it should be able to state the purpose in one sentence, keep it out of collections entirely, and delete it when the decision it supported is made.",
    businessModels: DIGITAL,
  },
  {
    id: "customer-master",
    name: "Customer master database",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["registration-device", "identity-kyc", "servicing-support", "marketing-crosssell", "archive-deletion"],
    description:
      "The single record the whole business joins on: customer ID, identity, contact details, account status, KYC state, linked products and every relationship the person has with the company.",
    dataCategoryIds: ["identity-contact", "government-id", "payment-instrument", "marketing-profile"],
    accessPersonaIds: ["kyc-ops", "support-agent", "sales-telecaller", "it-admin", "data-science-team"],
    retentionDefined: true,
    riskLevel: "medium",
    riskWhy:
      "Because everything joins here, a read on this record is a read on the whole relationship, and the access lists tend to grow with every new team rather than being reviewed.",
    riskAction:
      "Review who can read the master record twice a year, separate the fields needed to serve a customer from the ones needed to underwrite them, and make correction here propagate to the systems downstream.",
  },
  {
    id: "consent-record",
    name: "Consent & permission record",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["registration-device", "bank-bureau-data", "marketing-crosssell"],
    description:
      "The evidence of what the customer was told and what they agreed to - notice version, timestamp, channel choices, the Account Aggregator consent artefact and its expiry, and any later withdrawal.",
    dataCategoryIds: ["identity-contact", "bank-income-data", "marketing-profile"],
    accessPersonaIds: ["compliance-officer", "kyc-ops", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // ---- Stage 3: KYC -------------------------------------------------------
  {
    id: "kyc-provider",
    name: "KYC, CKYC & PAN verification provider",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["identity-kyc", "archive-deletion"],
    description:
      "The service that checks the PAN, pulls or writes the CKYC record, matches the name and address and returns a verification result - holding a copy of what it verified.",
    dataCategoryIds: ["government-id", "identity-contact", "related-party"],
    accessPersonaIds: ["kyc-ops", "vendor-support", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "The provider retains identity documents and results under its own rules, often for longer than the business assumes, and the same provider frequently serves the applicant's other lenders too.",
    riskAction:
      "Keep the verification outcome rather than the document wherever the workflow allows, contract for the provider's retention and deletion, and name the provider in your notice so the customer knows who holds a copy.",
  },
  {
    id: "video-kyc-platform",
    name: "Video-KYC, face & liveness platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["identity-kyc", "archive-deletion"],
    description:
      "The recorded verification session: the customer's face, their voice, the room behind them, the document held up to the camera, a liveness result and an agent's note - stored as a video file.",
    dataCategoryIds: ["video-kyc-face", "government-id", "identity-contact"],
    accessPersonaIds: ["kyc-ops", "compliance-officer", "vendor-support", "risk-fraud-analyst"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A face recording is the one item in the file that a person can never change if it escapes, and access to the recording library is usually far wider than the handful of people who ever need to review a session. Reuse of the face data for unrelated fraud models is common and rarely disclosed.",
    riskAction:
      "Restrict the recording library to named reviewers, set and enforce a retention period, keep face data out of any model that is not the identity check it was collected for, and monitor how often verification fails for particular groups of customers.",
  },
  {
    id: "kyc-document-repository",
    name: "KYC document repository & review queue",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["identity-kyc", "related-party", "archive-deletion"],
    description:
      "Where the uploaded documents rest - PAN cards, address proofs, photographs, co-applicant papers - alongside the exception queue of everything a machine could not match and a human has to look at.",
    dataCategoryIds: ["government-id", "identity-contact", "related-party", "video-kyc-face"],
    accessPersonaIds: ["kyc-ops", "credit-underwriter", "compliance-officer", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "This is the densest concentration of identity documents in the business, and it usually holds the failed and abandoned attempts alongside the successful ones - files belonging to people who never became customers at all.",
    riskAction:
      "Decide which copy is the master and delete the rest, mask identifiers on screen by default, and set a separate short retention clock for abandoned and failed attempts.",
  },
  {
    id: "physical-kyc-file",
    name: "Branch physical KYC & application file",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["identity-kyc", "related-party", "agreement-activation", "archive-deletion"],
    description:
      "The paper file: the signed application, photocopies of every identity document, the co-applicant's and guarantor's papers, the photograph stapled to the form - in a drawer, then a cupboard, then a warehouse.",
    dataCategoryIds: ["government-id", "identity-contact", "related-party", "loan-collateral"],
    accessPersonaIds: ["field-officer", "kyc-ops", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Paper cannot be searched, so nobody knows what is in it, and it cannot be selectively deleted when somebody asks. Branch storage is usually shared, unlocked during working hours and visible to staff with no reason to see it.",
    riskAction:
      "Keep the physical file locked and logged, index what each file contains so a request can be answered, and record destruction rather than assuming it happened.",
    businessModels: NBFC,
  },

  // ---- Stage 4: related parties -------------------------------------------
  {
    id: "related-party-record",
    name: "Co-applicant, guarantor & nominee records",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["related-party", "agreement-activation", "adverse-recovery", "archive-deletion"],
    description:
      "How the business stores the people around the borrower - usually as additional fields on the application rather than as customers in their own right, with their KYC, income and relationship attached.",
    dataCategoryIds: ["related-party", "government-id", "bank-income-data", "identity-contact"],
    accessPersonaIds: ["kyc-ops", "credit-underwriter", "collections-officer", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The borrower's agreement is treated as covering everybody on the form. When a guarantor asks what is held about them, or a co-applicant separates from the borrower, there is no record to act on because they were never a record.",
    riskAction:
      "Give every related party their own record and role, provide each with a notice suited to that role, and support unlinking and correction independently of the borrower.",
    businessModels: LENDING,
  },
  {
    id: "reference-contact-list",
    name: "References & alternate contacts",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["related-party", "adverse-recovery"],
    description:
      "The two names and numbers asked for at application 'in case we cannot reach you' - a colleague, a neighbour, a relative - held until the day somebody decides to call them.",
    dataCategoryIds: ["related-party", "identity-contact"],
    accessPersonaIds: ["collections-officer", "recovery-agent", "sales-telecaller"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "These people were never asked and never told, and calling them about somebody else's account discloses that the account exists and is in trouble. It is the single most complained-about disclosure in the sector.",
    riskAction:
      "Collect a reference only where the product genuinely needs one, tell the customer what it will be used for, and keep references out of collections campaigns entirely - contact them only where the borrower cannot be reached at all and the contact is limited to a request to call back.",
    businessModels: LENDING,
  },

  // ---- Stage 5: linking (payments) ----------------------------------------
  {
    id: "bank-linking-service",
    name: "Bank-account validation & linking service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["account-linking", "money-movement"],
    description:
      "Checks the account number and IFSC, confirms the name on the account and links it to the app - and keeps a record of every attempt, successful or not.",
    dataCategoryIds: ["payment-instrument", "identity-contact", "bank-income-data"],
    accessPersonaIds: ["vendor-support", "risk-fraud-analyst", "support-agent"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: PAYMENTS,
  },
  {
    id: "upi-rail",
    name: "UPI rail & partner PSP",
    nodeType: "system",
    boundary: "client",
    stageIds: ["account-linking", "money-movement", "servicing-support"],
    description:
      "The payment infrastructure and the sponsor bank behind the app's UPI handle: the mapping between the customer, their VPA and their bank account, and every transaction that passes through it.",
    dataCategoryIds: ["payment-instrument", "transaction-history", "identity-contact"],
    accessPersonaIds: ["partner-lender-team", "risk-fraud-analyst", "compliance-officer"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: PAYMENTS,
  },
  {
    id: "wallet-ledger",
    name: "Wallet & prepaid instrument ledger",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["account-linking", "money-movement", "adverse-recovery", "archive-deletion"],
    description:
      "The balance, the load and spend history, the KYC tier that sets the limit, and the entries that survive an account closure because a ledger has to reconcile.",
    dataCategoryIds: ["payment-instrument", "transaction-history", "identity-contact"],
    accessPersonaIds: ["support-agent", "risk-fraud-analyst", "compliance-officer", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: PAYMENTS,
  },
  {
    id: "beneficiary-store",
    name: "Saved payees & beneficiary list",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["account-linking", "money-movement", "marketing-crosssell"],
    description:
      "Everyone the customer has ever paid, kept for convenience: names, handles, account references, nicknames typed by the customer, and how often each one is paid.",
    dataCategoryIds: ["payment-instrument", "identity-contact", "transaction-history"],
    accessPersonaIds: ["customer", "support-agent", "risk-fraud-analyst", "data-science-team"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "A payee list is a map of the customer's relationships - family, landlord, employer, lender, shopkeeper - and it holds personal data about people who never used the app. It is rarely pruned and often available to analytics.",
    riskAction:
      "Let customers remove payees easily and age out ones that have not been used, keep the list out of recommendation and marketing models, and treat the nickname field as free text a customer may want corrected.",
    businessModels: PAYMENTS,
  },

  // ---- Stage 6: bank, AA, income & bureau ---------------------------------
  {
    id: "account-aggregator",
    name: "Account Aggregator",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["bank-bureau-data"],
    description:
      "The consented route by which bank data reaches the lender: the customer approves a request for a defined purpose and period, and the data flows without documents being emailed around.",
    dataCategoryIds: ["bank-income-data", "identity-contact"],
    accessPersonaIds: ["bureau-aa-operator", "credit-underwriter", "compliance-officer"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: LENDING,
  },
  {
    id: "statement-analysis",
    name: "Statement-analysis & extraction vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["bank-bureau-data", "risk-decision"],
    description:
      "Reads the full statement line by line and returns salary credits, existing EMIs, bounce counts, average balances and a cash-flow profile - having seen every transaction the customer made, including the ones that have nothing to do with the loan.",
    dataCategoryIds: ["bank-income-data", "derived-score", "transaction-history"],
    accessPersonaIds: ["vendor-support", "credit-underwriter", "data-science-team"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The vendor receives the raw statement, not the summary, so the transaction descriptions - which name the customer's landlord, doctor, school and the people they transfer money to - leave the business in full.",
    riskAction:
      "Send the narrowest window the decision needs, contract for the vendor to hold the raw statement no longer than the parse, and keep only the derived figures once the decision is made.",
    businessModels: LENDING,
  },
  {
    id: "credit-bureau",
    name: "Credit bureau",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["bank-bureau-data", "risk-decision", "archive-deletion"],
    description:
      "Returns the report and the score, listing every other loan and card the person holds and how they have repaid them - and records the enquiry itself, which other lenders can then see.",
    dataCategoryIds: ["bureau-credit", "identity-contact", "repayment-collection"],
    accessPersonaIds: ["bureau-aa-operator", "credit-underwriter", "risk-fraud-analyst"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "The bureau record is largely outside the business's control to correct, an error in it propagates to every lender the person approaches, and the fact of the enquiry is itself visible to others.",
    riskAction:
      "Record the purpose of every pull, restrict who can open a report, and give the customer a clear route to raise a bureau dispute rather than telling them the score is not yours.",
    businessModels: LENDING,
  },
  {
    id: "financial-document-store",
    name: "Uploaded statements & income documents",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["bank-bureau-data", "risk-decision", "archive-deletion"],
    description:
      "Where the PDFs land when the customer uploads rather than consents: bank statements, salary slips, GST returns, business financials - filed against the application, kept against the customer.",
    dataCategoryIds: ["bank-income-data", "identity-contact", "related-party"],
    accessPersonaIds: ["credit-underwriter", "kyc-ops", "it-admin", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A raw statement is the most revealing document in the file and the least necessary to keep once the figures have been extracted - yet it usually survives the application, including for applications that were refused.",
    riskAction:
      "Separate the retention of raw documents from the retention of derived figures, delete the raw copy once the decision is made, and start with the refused applications.",
    businessModels: LENDING,
  },
  {
    id: "staff-download-folder",
    name: "Downloaded statements on staff laptops",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["bank-bureau-data", "risk-decision", "adverse-recovery"],
    description:
      "The copies that leave the system to be worked on: a statement downloaded to check a figure, a spreadsheet of applications pulled for a review, an email attachment forwarded to a colleague, a folder called 'cases' on a desktop.",
    dataCategoryIds: ["bank-income-data", "government-id", "derived-score", "identity-contact"],
    accessPersonaIds: ["credit-underwriter", "risk-fraud-analyst", "collections-officer", "it-admin"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "These copies are invisible to every access control and retention rule the business has, they contain the rawest financial data it holds, and they persist on machines long after the case, the role and sometimes the employee have gone.",
    riskAction:
      "Make the work possible inside the system so there is no reason to download, block or log downloads of statements and bulk exports, and check what is actually on the machines rather than assuming the policy is being followed.",
    businessModels: LENDING,
  },

  // ---- Stage 7: field verification (NBFC) ---------------------------------
  {
    id: "field-verification-app",
    name: "Field-verification & site-visit application",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["field-verification", "adverse-recovery"],
    description:
      "What the officer carries to the house and the workplace: the applicant's details, a checklist, a camera, a geo-tag, and a form for what the visit found - including photographs of the home and its contents.",
    dataCategoryIds: ["identity-contact", "loan-collateral", "related-party"],
    accessPersonaIds: ["field-officer", "credit-underwriter", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The visit collects far more than the verification needs - photographs of a home, a location trail, and observations about a household - and the same application is often reused for collections visits later.",
    riskAction:
      "Define exactly which photographs and fields a verification requires, keep location capture to the visit itself, set a retention period for the images, and keep the verification record separate from the collections one.",
    businessModels: NBFC,
  },
  {
    id: "valuation-vendor",
    name: "Property, vehicle & gold valuation vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["field-verification", "legal-enforcement"],
    description:
      "The external valuer who inspects the asset and produces a report - and who is usually sent the whole application file rather than the details the valuation actually needs.",
    dataCategoryIds: ["loan-collateral", "identity-contact", "government-id"],
    accessPersonaIds: ["legal-valuation-vendor", "credit-underwriter", "field-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "A valuer needs the asset and an address; they routinely receive the applicant's identity documents and income papers as well, and they keep the file after the engagement ends.",
    riskAction:
      "Send a valuation instruction containing only the asset and the contact needed to arrange access, and contract for return or deletion when the report is delivered.",
    businessModels: NBFC,
  },
  {
    id: "neighbour-reference-note",
    name: "Residence & reference verification notes",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["field-verification", "risk-decision"],
    description:
      "What the officer wrote after asking at the door and around it: whether the applicant lives there, what the neighbours said, how the household looked, and a subjective note that then travels into the credit file.",
    dataCategoryIds: ["related-party", "identity-contact", "derived-score"],
    accessPersonaIds: ["field-officer", "credit-underwriter", "collections-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Asking a neighbour discloses that the person applied for credit, the neighbour's own details end up in the file, and an impression written in a sentence can change a decision without ever being shown to the applicant.",
    riskAction:
      "Minimise third-party enquiries, record only verifiable facts rather than characterisations, and treat anything written here as something the applicant can ask to see and correct.",
    businessModels: NBFC,
  },

  // ---- Stage 8: the decision ----------------------------------------------
  {
    id: "decision-engine",
    name: "Scoring, rules & decision engine",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["risk-decision", "partner-disclosure", "adverse-recovery"],
    description:
      "Where everything collected so far becomes a judgement. Identity, bank data, bureau history, device signals, behaviour and field notes go in; a risk grade, an eligible amount, a price, a limit, a block and a reason code come out - in seconds, and usually without a human.",
    dataCategoryIds: ["derived-score", "automated-decision", "bureau-credit", "device-app-signal"],
    accessPersonaIds: ["data-science-team", "credit-underwriter", "risk-fraud-analyst", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the sector's signature: the decision is the product. It becomes a permanent fact about the person - shared with lenders, written into a bureau record, reused in collections segmentation and fed back into training data - while they usually cannot see which inputs were used, cannot tell whether one of them was wrong, and have no route to ask a human to look again.",
    riskAction:
      "Record what each model is for, which data categories it reads and which version decided, keep a human able to review any material adverse outcome, give a reason the customer can act on, let them correct a factual input and re-run the decision, and never present a suspicion as a finding.",
  },
  {
    id: "fraud-platform",
    name: "Fraud & transaction-monitoring platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["risk-decision", "money-movement", "adverse-recovery"],
    description:
      "Screens applications and transactions in real time against rules, velocity checks and models, producing a risk score and a decision to allow, challenge, hold or block - and a case file for anything a reviewer must look at.",
    dataCategoryIds: ["derived-score", "automated-decision", "transaction-history", "device-app-signal"],
    accessPersonaIds: ["risk-fraud-analyst", "vendor-support", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A false positive stops somebody's money with no warning and often no explanation, and a flag raised once tends to stay attached to the customer long after the review concluded there was nothing in it.",
    riskAction:
      "Keep a route to a human within a stated time, tell the customer what they can do rather than only that something is blocked, distinguish an open suspicion from a confirmed finding in the data model itself, and expire flags that were not substantiated.",
  },
  {
    id: "review-workstation",
    name: "Manual review & underwriting workstation",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["risk-decision", "adverse-recovery"],
    description:
      "The screen where a person looks at what the model produced - the full application, the statements, the bureau report, the device history and the score - and confirms, modifies or overturns it.",
    dataCategoryIds: ["derived-score", "automated-decision", "bank-income-data", "bureau-credit"],
    accessPersonaIds: ["credit-underwriter", "risk-fraud-analyst", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "The review screen shows the whole customer rather than the question at hand, and access granted for a busy period is rarely taken away afterwards.",
    riskAction:
      "Scope the review view to the decision being reviewed, require the reviewer's reasoning to be recorded, and re-certify who holds this access every quarter.",
  },
  {
    id: "decision-log",
    name: "Decision & model-version log",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["risk-decision", "partner-disclosure", "archive-deletion"],
    description:
      "The record of what was decided, by which rule or model version, on which inputs, at what time, and whether a human reviewed it - the only thing that makes an explanation possible months later.",
    dataCategoryIds: ["automated-decision", "derived-score", "identity-contact"],
    accessPersonaIds: ["compliance-officer", "data-science-team", "credit-underwriter"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "credit-committee-record",
    name: "Credit committee & exception record",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["risk-decision", "agreement-activation"],
    description:
      "Minutes, deviation approvals and the note explaining why a case outside policy was sanctioned anyway - containing the applicant's financials, the collateral and the committee's opinion of both.",
    dataCategoryIds: ["automated-decision", "bank-income-data", "loan-collateral", "related-party"],
    accessPersonaIds: ["credit-underwriter", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: NBFC,
  },
  {
    id: "model-training-dataset",
    name: "Model-training datasets",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["risk-decision", "marketing-crosssell", "archive-deletion"],
    description:
      "The copies kept so the next model can be trained: historic applications, statements, bureau pulls, device signals, decisions and outcomes - including from people who were refused and never became customers.",
    dataCategoryIds: ["derived-score", "automated-decision", "bank-income-data", "repayment-collection"],
    accessPersonaIds: ["data-science-team", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Training data is the copy that outlives every retention rule, because deleting it feels like losing the model. It is also the copy nobody thinks of when a customer asks to be erased.",
    riskAction:
      "Govern training datasets as a named purpose with their own retention, remove or aggregate the identifiers that the training does not need, and include them in the checklist when an erasure request is worked.",
  },
  {
    id: "data-warehouse",
    name: "Central data warehouse & analytics stack",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["risk-decision", "marketing-crosssell", "archive-deletion"],
    description:
      "Where every system's data is copied so it can be reported on: applications, decisions, transactions, repayments, complaints, collections and campaigns, joined on the customer ID.",
    dataCategoryIds: ["transaction-history", "repayment-collection", "derived-score", "marketing-profile"],
    accessPersonaIds: ["data-science-team", "compliance-officer", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The warehouse holds a copy of everything and is usually governed as infrastructure rather than as personal data, so deletions applied in source systems do not reach it and access is granted by team rather than by purpose.",
    riskAction:
      "Propagate deletion from source into the warehouse on a schedule, restrict raw personal-data tables to named purposes, and keep the analytics that only need aggregates away from the row-level copies.",
  },

  // ---- Stage 9: partner disclosure ----------------------------------------
  {
    id: "partner-bank-lender",
    name: "Partner lenders, banks & payment networks",
    nodeType: "system",
    boundary: "client",
    stageIds: ["partner-disclosure", "agreement-activation", "money-movement", "archive-deletion"],
    description:
      "The institutions the file goes to so somebody else can decide or move the money: the lenders an application is routed to, the sponsor bank behind a wallet or UPI handle, the card network, a co-lending partner. Each one keeps its own copy under its own rules.",
    dataCategoryIds: ["identity-contact", "government-id", "bureau-credit", "derived-score"],
    accessPersonaIds: ["partner-lender-team", "compliance-officer", "credit-underwriter"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "One application can be sent to several lenders at once, and the ones that decline keep the full file too - identity, statements, bureau report and score. The customer usually cannot name a single recipient, and a later erasure request cannot reach any of them without a register that says who received what.",
    riskAction:
      "Keep a disclosure register per application, send each recipient only the fields its decision needs rather than the whole file, be explicit with the customer about who is actually lending, and contract for deletion at the institutions that declined - then check it.",
  },
  {
    id: "lender-routing-engine",
    name: "Lender allocation & routing engine",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["partner-disclosure"],
    description:
      "Decides which lenders see the application and in what order, based on the score, the product and commercial terms - and often submits to more than one at the same time to improve the chance of an approval.",
    dataCategoryIds: ["derived-score", "automated-decision", "identity-contact", "bureau-credit"],
    accessPersonaIds: ["credit-underwriter", "data-science-team", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Routing multiplies the number of organisations holding a complete application, and the customer experiences it as one enquiry. Each submission may also register as a separate bureau enquiry.",
    riskAction:
      "Tell the customer, before submission, which lenders their application may be sent to, submit sequentially where the product allows it, and record every submission as a disclosure.",
    businessModels: DIGITAL,
  },
  {
    id: "insurance-partner",
    name: "Insurance partner",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["partner-disclosure", "agreement-activation", "legal-enforcement"],
    description:
      "The insurer behind a credit-protection or asset policy bundled with the loan, receiving the borrower's identity, the loan details, the nominee and sometimes health or asset declarations.",
    dataCategoryIds: ["identity-contact", "loan-collateral", "related-party", "government-id"],
    accessPersonaIds: ["partner-lender-team", "credit-underwriter", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: LENDING,
  },
  {
    id: "disclosure-register",
    name: "Recipient & disclosure register",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["partner-disclosure", "adverse-recovery", "archive-deletion"],
    description:
      "The list of who received what, when and why - the only artefact that makes an access request answerable and an erasure request actionable beyond the company's own systems.",
    dataCategoryIds: ["identity-contact", "automated-decision", "repayment-collection"],
    accessPersonaIds: ["compliance-officer", "it-admin"],
    retentionDefined: true,
    riskLevel: "low",
  },

  // ---- Stage 10: agreement & activation -----------------------------------
  {
    id: "esign-platform",
    name: "E-sign & agreement platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["agreement-activation", "archive-deletion"],
    description:
      "Generates the agreement, sends it for signature, records the signing certificate and stores the executed package - which typically has the borrower's KYC documents bound into it.",
    dataCategoryIds: ["loan-collateral", "government-id", "identity-contact", "related-party"],
    accessPersonaIds: ["vendor-support", "credit-underwriter", "compliance-officer", "customer"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "The signed package is usually the single most complete document in the file, it is held by a vendor, and copies of it circulate by email to the borrower, the guarantor, the partner and the branch.",
    riskAction:
      "Bind only the documents the agreement genuinely requires, name one system as the record of the executed copy and delete the drafts elsewhere, and give the customer a durable way to fetch their own copy instead of emailing it.",
  },
  {
    id: "mandate-nach",
    name: "E-mandate & NACH registration",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["agreement-activation", "money-movement", "adverse-recovery"],
    description:
      "The repayment authorisation registered against the customer's bank account: the account details, the amount, the frequency, the authentication record - and every presentation and failure afterwards.",
    dataCategoryIds: ["payment-instrument", "identity-contact", "repayment-collection"],
    accessPersonaIds: ["vendor-support", "collections-officer", "support-agent"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "agreement-repository",
    name: "Executed agreements & sanction letters",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["agreement-activation", "servicing-support", "archive-deletion"],
    description:
      "The company's own store of what was sanctioned and signed - the offer, the terms, the security documents, the guarantee - joined to the customer for the life of the relationship and well beyond it.",
    dataCategoryIds: ["loan-collateral", "identity-contact", "related-party"],
    accessPersonaIds: ["credit-underwriter", "compliance-officer", "support-agent", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "loan-management-system",
    name: "Loan-management & core lending system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["agreement-activation", "money-movement", "servicing-support", "adverse-recovery", "archive-deletion"],
    description:
      "The book: the loan account, the schedule, every instalment due and paid, part-payments, foreclosure, restructuring, and the running record of how this borrower has behaved.",
    dataCategoryIds: ["loan-collateral", "repayment-collection", "identity-contact", "payment-instrument"],
    accessPersonaIds: ["credit-underwriter", "collections-officer", "support-agent", "field-officer", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
    riskWhy:
      "The repayment record is the most reused item in the business - it drives collections, cross-sell segments, model training and the bureau report - so a mistake in it follows the customer everywhere at once.",
    riskAction:
      "Make correction here the single point that propagates outwards, restrict who can read the full conduct history as opposed to the current balance, and separate the operational record from the analytical copies.",
    businessModels: LENDING,
  },
  {
    id: "collateral-registry",
    name: "Collateral & security registry filing",
    nodeType: "system",
    boundary: "government",
    stageIds: ["agreement-activation", "legal-enforcement"],
    description:
      "The registration of a charge over property, a vehicle or another asset with the relevant registry - a filing that names the borrower and the asset and is not the company's to withdraw or amend at will.",
    dataCategoryIds: ["loan-collateral", "identity-contact", "related-party"],
    accessPersonaIds: ["authority", "legal-valuation-vendor", "compliance-officer"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: NBFC,
  },

  // ---- Stage 11: money movement -------------------------------------------
  {
    id: "disbursal-payment-system",
    name: "Disbursal & payment-instruction system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["money-movement", "adverse-recovery"],
    description:
      "Issues the instruction that moves money - the disbursal to the borrower's account, the payout to a merchant, the refund - and records the beneficiary, the amount, the reference and whether it succeeded.",
    dataCategoryIds: ["payment-instrument", "transaction-history", "identity-contact"],
    accessPersonaIds: ["it-admin", "compliance-officer", "support-agent"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway & aggregator",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["money-movement", "servicing-support"],
    description:
      "Processes collections and payouts on the company's behalf, holding the customer identifier, the instrument reference, the amount and the outcome of every attempt including the failed ones.",
    dataCategoryIds: ["payment-instrument", "transaction-history", "identity-contact"],
    accessPersonaIds: ["vendor-support", "support-agent", "risk-fraud-analyst"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "settlement-reconciliation",
    name: "Settlement & reconciliation platform",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["money-movement", "servicing-support", "archive-deletion"],
    description:
      "Matches what was instructed against what settled: files from banks and networks, merchant payouts, fees, reversals and the exception list of everything that did not tie out - usually as downloadable spreadsheets.",
    dataCategoryIds: ["transaction-history", "payment-instrument", "identity-contact"],
    accessPersonaIds: ["it-admin", "compliance-officer", "vendor-support"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "Reconciliation runs on bulk files containing customer identifiers and full transaction detail, they are routinely exported to spreadsheets and mailboxes to be worked on, and finance teams keep them indefinitely.",
    riskAction:
      "Use references rather than customer identity in reconciliation files wherever the match allows it, keep the files inside the platform instead of in mailboxes, and set a retention period for the exception exports.",
  },

  // ---- Stage 12: servicing & support --------------------------------------
  {
    id: "support-console",
    name: "Support & servicing console",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["servicing-support", "adverse-recovery", "marketing-crosssell"],
    description:
      "The single screen an agent opens to answer any question: identity, KYC status, statements, every transaction, the score, the decision, the collection notes and what the previous three agents typed about this person.",
    dataCategoryIds: ["identity-contact", "transaction-history", "complaint-dispute", "repayment-collection"],
    accessPersonaIds: ["support-agent", "sales-telecaller", "collections-officer", "vendor-support"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The widest routine access in the business sits with its highest-turnover role, scoped to the customer rather than to the question. A caller is often verified by details the caller supplied, agent notes become permanent characterisations, and a list can usually be exported.",
    riskAction:
      "Scope the console to the query type and reveal the rest only on a recorded reason, verify the customer against something they did not just tell you, keep notes factual and reviewable by the customer, and alert on bulk reads and exports.",
  },
  {
    id: "ticketing-platform",
    name: "Ticketing & helpdesk platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["servicing-support", "adverse-recovery", "archive-deletion"],
    description:
      "Holds the complaint, the chat transcript, the screenshots the customer sent, the internal comments and the resolution - with attachments that frequently include statements and identity documents.",
    dataCategoryIds: ["complaint-dispute", "identity-contact", "bank-income-data", "transaction-history"],
    accessPersonaIds: ["support-agent", "vendor-support", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "Attachments sent to resolve one problem stay attached to the ticket forever, and a customer sending a screenshot to prove a transaction usually sends several unrelated ones with it.",
    riskAction:
      "Ask for the narrowest evidence that answers the question, redact or delete attachments once the ticket closes, and set a retention rule for tickets that is separate from the account record.",
  },
  {
    id: "call-recording-store",
    name: "Call-recording store",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["servicing-support", "adverse-recovery"],
    description:
      "Every sales, service and collections call, kept as audio - containing whatever the customer said about their circumstances and whatever the agent said back.",
    dataCategoryIds: ["complaint-dispute", "identity-contact", "repayment-collection"],
    accessPersonaIds: ["support-agent", "compliance-officer", "collections-officer", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Recordings are kept indefinitely because storage is cheap and nobody owns the decision to delete them, and they capture far more than the transaction - including third parties who happened to be on the call.",
    riskAction:
      "Set a retention period by call type and enforce it automatically, restrict playback to named roles with a recorded reason, and tell customers plainly that the call is recorded and why.",
  },
  {
    id: "whatsapp-support-channel",
    name: "WhatsApp & chat support channel",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["servicing-support", "adverse-recovery", "marketing-crosssell"],
    description:
      "Where a lot of real support happens: a customer sends a screenshot of a failed payment, an agent sends a statement back, a reminder goes out, and the thread sits on both phones indefinitely.",
    dataCategoryIds: ["identity-contact", "transaction-history", "complaint-dispute", "repayment-collection"],
    accessPersonaIds: ["support-agent", "collections-officer", "sales-telecaller", "vendor-support"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The channel is convenient precisely because it is outside the systems - documents and account details flow through it, the history is not searchable for a rights request, and a reminder about arrears lands on a phone the borrower may share.",
    riskAction:
      "Route chat through a managed business channel that logs into the ticketing system, never send documents or account detail over it, and keep the wording of any reminder neutral about what the account is.",
  },
  {
    id: "dispute-chargeback-system",
    name: "Dispute & chargeback system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["servicing-support", "adverse-recovery"],
    description:
      "Manages a contested transaction end to end: the customer's claim, the evidence gathered, the merchant's response, the network's decision - and the note that goes onto the customer's risk profile either way.",
    dataCategoryIds: ["complaint-dispute", "transaction-history", "derived-score", "identity-contact"],
    accessPersonaIds: ["support-agent", "risk-fraud-analyst", "partner-lender-team", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "Evidence packs travel to the merchant and the network and often expose transactions unrelated to the dispute, and a customer who raises several disputes tends to acquire a risk label as a by-product.",
    riskAction:
      "Send only the disputed transaction and redact the rest, keep a dispute outcome separate from a fraud finding in the data, and give the customer a route to challenge a label applied this way.",
    businessModels: PAYMENTS,
  },

  // ---- Stage 13: adverse action & recovery --------------------------------
  {
    id: "collections-agency",
    name: "Collection & recovery agency",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["adverse-recovery", "legal-enforcement", "archive-deletion"],
    description:
      "The external agency the account is handed to: it receives the borrower's identity, address, balance, days past due, alternate contacts, references and history, and works them through its own dialler, field staff and personal phones.",
    dataCategoryIds: ["repayment-collection", "identity-contact", "related-party", "loan-collateral"],
    accessPersonaIds: ["recovery-agent", "collections-officer", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the largest transfer of contact data in the sector, to the environment with the least control, and it includes people who never borrowed - references, guarantors, family and employers. Agencies work for several lenders, staff turn over constantly, and lists routinely survive the end of the engagement.",
    riskAction:
      "Send the minimum needed to make contact and never the whole file, require work to happen inside a managed application with export disabled, log every assignment, contact and visit, keep third-party contacts out of the assignment unless the borrower genuinely cannot be reached, revoke access the day an account is recalled, and get written confirmation of deletion when the engagement ends.",
  },
  {
    id: "collections-system",
    name: "Collections & recovery management system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["adverse-recovery", "archive-deletion"],
    description:
      "The company's own delinquency book: buckets, assignment to teams and agencies, promise-to-pay records, contactability scores, field-visit outcomes, settlement offers and escalations.",
    dataCategoryIds: ["repayment-collection", "identity-contact", "related-party", "derived-score"],
    accessPersonaIds: ["collections-officer", "recovery-agent", "credit-underwriter", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Collection notes are written quickly and read for years, they routinely include judgements about the borrower and their household, and the same record is what later feeds segmentation and model training.",
    riskAction:
      "Restrict notes to what happened rather than what the officer thought, make the notes visible to the customer on request, and set a retention period for the collections record that is separate from the loan account.",
    businessModels: LENDING,
  },
  {
    id: "field-collection-app",
    name: "Field-collection app & route tool",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["adverse-recovery"],
    description:
      "What the recovery officer carries: today's list of borrowers, their addresses and balances, a map, a receipt function, a camera for proof of visit, and a location trail of where the officer went.",
    dataCategoryIds: ["repayment-collection", "identity-contact", "contact-sms-location"],
    accessPersonaIds: ["recovery-agent", "field-officer", "collections-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A day's list of delinquent borrowers on a device that leaves the office is the highest-consequence export in the business, and visit photographs and location trails accumulate with no purpose after the visit.",
    riskAction:
      "Show one assignment at a time rather than the whole list, disable export and screenshots, retain visit evidence only as long as the dispute window requires, and wipe the device remotely when an officer leaves.",
    businessModels: LENDING,
  },
  {
    id: "account-restriction-system",
    name: "Account restriction & investigation workflow",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["adverse-recovery", "archive-deletion"],
    description:
      "Freezes, holds, limit reductions and negative-balance cases: the reason, the evidence, the investigation notes, the review decision and whether the restriction was ever lifted.",
    dataCategoryIds: ["automated-decision", "transaction-history", "complaint-dispute", "derived-score"],
    accessPersonaIds: ["risk-fraud-analyst", "compliance-officer", "support-agent"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A restriction stops a person using their own money, often with an explanation that says nothing they can act on, and the record of an investigation that found nothing usually stays attached to the account anyway.",
    riskAction:
      "Give a reason and a route to review within a stated time, mark a closed investigation as unsubstantiated rather than leaving an open flag, and never describe a suspicion in the customer's record as though it were established.",
    businessModels: PAYMENTS,
  },
  {
    id: "authority-request-log",
    name: "Lawful-request & disclosure log",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["adverse-recovery", "legal-enforcement", "archive-deletion"],
    description:
      "The record of what was disclosed to an authority, under what request, by whom and when - and the copy of what was actually sent.",
    dataCategoryIds: ["identity-contact", "transaction-history", "automated-decision"],
    accessPersonaIds: ["compliance-officer", "authority", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // ---- Stage 14: legal enforcement (NBFC) ---------------------------------
  {
    id: "legal-recovery-vendor",
    name: "External counsel & legal-recovery vendor",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["legal-enforcement", "archive-deletion"],
    description:
      "The firm running the recovery matter, holding the borrower's and guarantor's identity, the loan history, the security documents, the correspondence and the notices issued.",
    dataCategoryIds: ["loan-collateral", "identity-contact", "related-party", "repayment-collection"],
    accessPersonaIds: ["legal-valuation-vendor", "compliance-officer", "credit-underwriter"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "A matter file at an external firm persists long after the recovery concludes and is outside the company's systems entirely, and the guarantor's records travel with it whether or not the guarantee was ever called.",
    riskAction:
      "Send a defined recovery dataset rather than the whole customer file, agree what the firm keeps and for how long at engagement, and close vendor access when the matter ends.",
    businessModels: NBFC,
  },
  {
    id: "repossession-agency",
    name: "Repossession & asset-custody agent",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["legal-enforcement"],
    description:
      "The agent instructed to take custody of an asset - given the borrower's name, address, vehicle or property details, the outstanding balance and often a photograph of the borrower.",
    dataCategoryIds: ["loan-collateral", "identity-contact", "repayment-collection"],
    accessPersonaIds: ["legal-valuation-vendor", "recovery-agent", "collections-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Repossession happens in public, in front of neighbours and colleagues, and the instruction usually carries more identifying detail than locating an asset requires.",
    riskAction:
      "Limit the instruction to the asset and the minimum needed to identify it lawfully, log what was shared, and require the agent to return or destroy the instruction once custody is resolved.",
    businessModels: NBFC,
  },
  {
    id: "auction-listing",
    name: "Public auction & asset listing",
    nodeType: "system",
    boundary: "public",
    stageIds: ["legal-enforcement"],
    description:
      "The notice or listing that puts a repossessed asset up for sale - and, depending on how it is drafted, the borrower's name and address along with it, permanently and publicly.",
    dataCategoryIds: ["loan-collateral", "identity-contact"],
    accessPersonaIds: ["authority", "legal-valuation-vendor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Once published this is indexed, copied and beyond recall, and it links a named individual to a default for anyone who searches their name afterwards.",
    riskAction:
      "Keep identifying detail in a public listing to what the process actually requires, and never add contact details or account particulars for convenience.",
    businessModels: NBFC,
  },

  // ---- Stage 15: cross-sell & marketing -----------------------------------
  {
    id: "cross-sell-audience",
    name: "Cross-sell, offers & audience engine",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["marketing-crosssell", "archive-deletion"],
    description:
      "Turns behaviour into a target: a customer-value band, a propensity score, a pre-approved offer, a cashback segment, a top-up eligibility, a branch sales list and a lookalike audience - built from repayment conduct and transaction categories.",
    dataCategoryIds: ["marketing-profile", "derived-score", "repayment-collection", "transaction-history"],
    accessPersonaIds: ["data-science-team", "sales-telecaller", "support-agent", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Segments are built from data collected to lend or to move money, not to advertise, and the most commercially attractive signals are the ones about financial pressure. The customer cannot see what they were put in or why the offer arrived.",
    riskAction:
      "Get a separate choice for marketing that is not bundled into the account, keep distress and transaction-category signals out of targeting, be able to explain what a segment was built from, and honour a withdrawal across every channel including partner and branch lists.",
  },
  {
    id: "marketing-automation",
    name: "Campaign & communication platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["marketing-crosssell", "servicing-support"],
    description:
      "Sends the SMS, the push notification, the email and the WhatsApp template - holding the contact list, the segment membership, the send history and who opened what.",
    dataCategoryIds: ["marketing-profile", "identity-contact"],
    accessPersonaIds: ["sales-telecaller", "vendor-support", "data-science-team"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "ad-audience-upload",
    name: "Advertising audience upload",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["marketing-crosssell"],
    description:
      "Customer lists pushed to advertising platforms so they can be targeted or used to find similar people - typically as hashed phone numbers and emails, with the segment name attached.",
    dataCategoryIds: ["marketing-profile", "identity-contact", "derived-score"],
    accessPersonaIds: ["sales-telecaller", "data-science-team", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "This sends customer data outside the business to a platform that keeps it under its own terms, the segment name can itself disclose something about the person's finances, and a later withdrawal rarely reaches the audience that was already uploaded.",
    riskAction:
      "Do not upload segments derived from repayment difficulty or transaction categories, refresh audiences from the suppression list rather than appending, and set an expiry on every uploaded list.",
  },
  {
    id: "merchant-analytics",
    name: "Merchant & spend analytics",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["marketing-crosssell", "archive-deletion"],
    description:
      "Reads transaction history as behaviour: spend categories, merchant affinity, location patterns, time-of-day habits, churn risk and lifestyle segments - shared in aggregate with merchant partners.",
    dataCategoryIds: ["transaction-history", "marketing-profile", "derived-score"],
    accessPersonaIds: ["data-science-team", "sales-telecaller", "partner-lender-team"],
    retentionDefined: false,
    riskLevel: "medium",
    riskWhy:
      "Merchant categories reveal things about a person that they never disclosed - where they get treatment, what they drink, who they support - and 'aggregate' reporting on small merchant sets can identify individuals.",
    riskAction:
      "Exclude revealing merchant categories from profiling, set a minimum group size before anything is shared with a partner, and keep spend analytics on a separate purpose and access list from fraud and servicing.",
    businessModels: PAYMENTS,
  },

  // ---- Stage 16: archive & deletion ---------------------------------------
  {
    id: "rejected-application-archive",
    name: "Rejected & abandoned application store",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive-deletion"],
    description:
      "The file left behind by everyone who was refused, dropped out halfway, or was approved and did not take it: KYC documents, bank statements, the bureau report, the device profile, the score and the rejection reason - held for people who never became customers.",
    dataCategoryIds: ["government-id", "bank-income-data", "bureau-credit", "automated-decision"],
    accessPersonaIds: ["credit-underwriter", "risk-fraud-analyst", "data-science-team", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "These are the fullest files in the business held about the people with the least relationship to it. There is usually no retention rule because nobody owns non-customers, the same file also sits with every lender the application was routed to, and it quietly feeds model training and future marketing.",
    riskAction:
      "Set a short operational retention for refused and abandoned applications and delete the raw documents first, keep a narrow exception for cases with a genuine fraud or legal reason and record it, suppress these people from marketing immediately, exclude them from training data unless that use is disclosed, and ask the lenders it was routed to for deletion.",
  },
  {
    id: "core-archive",
    name: "Closed-account & loan archive",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive-deletion"],
    description:
      "Where a finished relationship goes: the closed loan or wallet, the no-dues record, the collateral release, the ledger entries, the accounting postings and the correspondence.",
    dataCategoryIds: ["loan-collateral", "repayment-collection", "transaction-history", "identity-contact"],
    accessPersonaIds: ["compliance-officer", "credit-underwriter", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "backup-store",
    name: "Backups & disaster recovery",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["archive-deletion"],
    description:
      "Point-in-time copies of every system, held so the business can be restored - which means they also hold every record as it stood before anything was ever deleted.",
    dataCategoryIds: ["identity-contact", "government-id", "bank-income-data", "transaction-history"],
    accessPersonaIds: ["it-admin", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Deletion applied to live systems does not reach backups, so a record the business believes is gone is recoverable for as long as the backup cycle runs - and few businesses can say how long that is.",
    riskAction:
      "Document the backup cycle and the point at which a deleted record genuinely ages out, do not restore selectively from a backup to recover data a customer asked to have erased, and tell the customer plainly that this is the limit.",
  },
  {
    id: "vendor-residual-copies",
    name: "Vendor, partner & DSA residual copies",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["archive-deletion"],
    description:
      "What everyone else still holds after the relationship ends: the KYC provider's verification record, the scoring vendor's inputs, the ticketing vendor's attachments, the agency's old assignment list, the DSA's lead file.",
    dataCategoryIds: ["government-id", "bank-income-data", "repayment-collection", "complaint-dispute"],
    accessPersonaIds: ["vendor-support", "dsa-agent", "recovery-agent", "compliance-officer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "These copies are the reason an erasure request cannot honestly be answered 'done'. Nobody keeps a list of them, contracts rarely specify deletion in a checkable way, and a former partner has no reason to act.",
    riskAction:
      "Keep a live register of every processor and partner that has received customer data, put a deletion obligation and a confirmation step into each contract, and work the register as part of every erasure request rather than assuming.",
  },
  {
    id: "physical-warehouse",
    name: "Physical file warehouse",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["archive-deletion"],
    description:
      "Boxes of closed branch files in offsite storage: applications, identity photocopies, guarantee documents, security papers and correspondence, indexed by box rather than by customer.",
    dataCategoryIds: ["government-id", "loan-collateral", "related-party", "identity-contact"],
    accessPersonaIds: ["compliance-officer", "field-officer", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Nobody can say which customer's documents are in which box, so an access request cannot be answered from it and an erasure request cannot be executed against it. Destruction is often assumed rather than recorded.",
    riskAction:
      "Index physical storage to the customer so a request can at least be answered, set a destruction schedule per record type, and keep a certificate for each destruction rather than trusting the vendor's word.",
    businessModels: NBFC,
  },
];

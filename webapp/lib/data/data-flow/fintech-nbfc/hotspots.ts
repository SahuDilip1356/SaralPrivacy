// The eight places a fintech, NBFC or payments business most often loses
// control of customer data, ranked worst-first. NOT the full risk inventory -
// that lives in the nodes' risk levels. Spec §5.
//
// ⚠️ THE COUNT AND THE FLAGS RECONCILE BY CONSTRUCTION, NOT BY LUCK.
//
// The journey paints one red flag per DISTINCT stage a hotspot's node resolves
// to; the counter and the legend print `pack.hotspots.length`, pack-level and
// never filtered. So every hotspot node here is UNGATED and each one's EARLIEST
// stage is a distinct ALL-MODEL stage - see the map in nodes.ts. Eight hotspots,
// eight stages, eight flags, in all three models. Guard test (a) asserts it.
//
// Rank 1 is the sector's signature (spec §3): the decision. Every other map in
// this series ranks a place where a record escapes. This one ranks the place
// where a record becomes a judgement - because that judgement is what follows
// the person to every other lender, and it is the thing they are least able to
// see, check or challenge.
//
// The pasted spec's §9.12, §10.12 and §11.12 ask for per-variant hotspot sets of
// 11 / 11 / 12. Not possible: the counter is pack-level and unfiltered, and the
// schema caps the band at 5-8. All 34 of those items are authored - eight as
// hotspots, the rest as high- or critical-risk nodes with their own `riskWhy`
// and `riskAction`, which the engine renders in full.
//
// `assessmentBucket` must be one of the pack's own `assessmentBuckets`, and the
// deep-link guard test asserts the assessment client handles every key sent from
// here. All five of the fintech-nbfc buckets are used.
//
// ⛔ Language locks (spec §8): no financial, lending, credit or regulatory
// advice; fraud suspicion is never written as confirmed fraud; and nothing here
// accuses the trade - DSAs, agencies and field officers are how this business
// reaches people, and the point is where control breaks, not that the work is
// illegitimate.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const FINTECH_NBFC_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-automated-decision",
    rank: 1,
    nodeId: "decision-engine",
    title: "A machine decides, and the customer cannot see how",
    whatHappens:
      "Identity, bank statements, bureau history, device signals, behaviour and - in a branch model - a field officer's written impression are combined by a scoring model and a rules engine. Out comes an approval, a refusal, an amount, a price, a limit or a block, usually in seconds and usually without a human. The output is stored as a fact about the person and reused: sent to the lenders the file is routed to, written into their credit record, read again when the account goes into arrears, and folded back into the data the next model is trained on.",
    whyItMatters:
      "This is the one thing this sector does that no other in this series does: the product is a judgement about the person. Everywhere else a business holds records and the risk is that a record escapes. Here a refusal, a lower limit or a higher price becomes a new and durable fact that follows the customer to every other lender - and they typically cannot find out which inputs were used, cannot tell whether one of them was simply wrong, and have no route to ask a person to look again. A stale bureau entry, a shared household handset or a mis-parsed statement line can decide an outcome that nobody ever explains.",
    dataCategoryIds: ["derived-score", "automated-decision", "bureau-credit", "device-app-signal"],
    action:
      "For every decision that materially affects a customer, record what the model or rule was for, which data categories it read and which version decided. Keep a human able to review any adverse outcome within a stated time, and give a reason the customer can actually act on rather than a code. Let them correct a factual input and have the decision re-run. Keep an open suspicion clearly marked as unproven in the data itself, so it is never read later as an established finding.",
    assessmentBucket: "profiling_underwriting",
  },
  {
    id: "hs-device-permissions",
    rank: 2,
    nodeId: "device-permission-layer",
    title: "The phone is asked for more than the account needs",
    whatHappens:
      "At registration the app requests permissions and binds the device: identifier, operating system, IP, SIM data, app version, integrity result and location. In app-first lending the request often extends to the phone's contact list, its transactional SMS inbox and the list of installed applications, and the whole set is passed to a device-intelligence vendor. All of this is collected before any financial information has been given, and refusing usually means not having the product at all.",
    whyItMatters:
      "Signals gathered to stop fraud are routinely reused to judge creditworthiness and to target offers, which turns a handset into a proxy for a person. The sharpest form is the contact list: everyone in it becomes a data principal in a lender's systems, none of them applied for anything, none was told, and none can ask to be removed because they do not know they are there. That same list is what turns into a contactability sheet the day the account goes bad - which is how a borrower's colleagues and relatives end up receiving calls about a loan that is not theirs.",
    dataCategoryIds: ["device-app-signal", "contact-sms-location", "derived-score"],
    action:
      "Ask only for the permissions the service genuinely needs and state the purpose of each one separately rather than bundling them into sign-up. Do not read the contact list or the SMS inbox for credit or collections purposes. Keep security signals out of credit and marketing models unless that use is disclosed, contract for what the device vendor may retain, and make every permission withdrawable without the account breaking.",
    assessmentBucket: "kyc_financial_data",
  },
  {
    id: "hs-collections-agency",
    rank: 3,
    nodeId: "collections-agency",
    title: "Recovery partners get the borrower's file — and their family's",
    whatHappens:
      "When an account goes past due it is assigned to an external agency, and the assignment carries far more than the balance: the borrower's identity and address, days past due, the loan or wallet history, the alternate contacts, the references given at application and often the guarantor. The agency works it from its own dialler, its own field staff and, frequently, personal phones. In a branch model the same account may also go to an in-house field team with a printed list.",
    whyItMatters:
      "This is the largest transfer of contact data in the sector, going to the environment with the least control over it - and a large share of the people in it never borrowed anything. A reference given at application, a guarantor, a spouse listed as an alternate contact, an employer's switchboard: each call to them discloses that somebody has a loan and that it is in trouble. Agencies work for several lenders at once, staff turn over constantly, and assignment lists routinely outlive the engagement on devices nobody can reach.",
    dataCategoryIds: ["repayment-collection", "identity-contact", "related-party", "loan-collateral"],
    action:
      "Send the minimum needed to make contact with the borrower, never the whole file, and keep third-party contacts out of the assignment unless the borrower genuinely cannot be reached at all. Require the work to happen inside a managed application with export disabled, log every assignment, contact and visit, revoke access the day an account is recalled, and get written confirmation of deletion when an engagement ends - then sample it rather than trusting it.",
    assessmentBucket: "vendor_partner_agent_sharing",
  },
  {
    id: "hs-partner-fanout",
    rank: 4,
    nodeId: "partner-bank-lender",
    title: "One application, several institutions, one customer who cannot name them",
    whatHappens:
      "The file leaves the business to be acted on elsewhere. A routed application goes to several lenders at once so that one of them says yes; a wallet or UPI handle sits behind a sponsor bank and a payment network; a secured loan is disclosed to a co-lender, an insurer and a registry. Each recipient receives identity, KYC, bank data, the bureau report and the score, makes its own decision, and keeps its own copy under its own rules - including the ones that said no.",
    whyItMatters:
      "The customer experienced one enquiry and cannot usually name a single organisation that now holds their financial file. The institutions that declined keep it too, and they have no relationship with the customer through which anything could be corrected or deleted. Without a register recording who received what and when, an access request cannot be answered honestly and an erasure request cannot travel any further than your own database.",
    dataCategoryIds: ["identity-contact", "government-id", "bureau-credit", "derived-score"],
    action:
      "Keep a disclosure register per application - who received it, which fields, when and why. Send each recipient only what its decision requires rather than the whole file, and tell the customer before submission which institutions it may go to. Be explicit about which organisation is actually lending or holding the money. Contract for deletion at the institutions that declined, and check it.",
    assessmentBucket: "vendor_partner_agent_sharing",
  },
  {
    id: "hs-agent-personal-phone",
    rank: 5,
    nodeId: "agent-personal-phone",
    title: "The documents live on somebody's own phone",
    whatHappens:
      "A DSA photographs a PAN card at the customer's kitchen table. A telecaller runs the follow-up on a personal WhatsApp thread. A branch officer keeps a camera roll of application documents. A recovery officer calls from their own number. The same handset touches the journey at four separate points - the lead, the KYC, the servicing conversation and the arrears call - and none of it is a system the business owns.",
    whyItMatters:
      "Identity documents, bank statements and borrower lists end up in a personal camera roll and a personal chat backup that the company cannot search, cannot audit and cannot wipe. When the person moves on - and in these roles they move on often - the data goes with them, along with the relationship. It is also the copy that never surfaces when someone asks what is held about them, because nobody counted it as a system in the first place.",
    dataCategoryIds: ["government-id", "identity-contact", "bank-income-data", "repayment-collection"],
    action:
      "Give every customer-facing role a managed application that submits documents without storing them, and business numbers rather than personal ones for customer contact. Put the prohibition on photographing documents to personal devices in writing, in the partner contract as well as the staff policy. Revoke access the day someone stops working the account, and make the managed route genuinely easier than the phone or it will not be used.",
    assessmentBucket: "vendor_partner_agent_sharing",
  },
  {
    id: "hs-support-console",
    rank: 6,
    nodeId: "support-console",
    title: "One question opens the entire account",
    whatHappens:
      "A customer asks why a payment failed. The agent opens a console showing identity, KYC status, statements, every transaction, the risk score, the decision that was made about them, the collection notes and whatever the previous three agents typed. The call is recorded, a screenshot may travel over WhatsApp, and a new note is added to the file.",
    whyItMatters:
      "The widest routine access in the business sits with its highest-turnover role, and it is scoped to the customer rather than to the question. Callers are often verified using details the caller themselves supplied. Notes written in a hurry become permanent characterisations that influence how the next agent, and sometimes the next decision, treats the person. And in most of these systems a list can be exported by anyone who can read it.",
    dataCategoryIds: ["identity-contact", "transaction-history", "complaint-dispute", "repayment-collection"],
    action:
      "Scope the console to the type of query and reveal the rest only on a recorded reason. Verify the customer against something they did not just tell you. Keep notes factual and remember the customer can ask to see them. Set and enforce a retention period for call recordings, and alert on bulk reads and exports rather than only on failed logins.",
    assessmentBucket: "access_retention_incident",
  },
  {
    id: "hs-cross-sell-profiling",
    rank: 7,
    nodeId: "cross-sell-audience",
    title: "How they repay becomes how they are targeted",
    whatHappens:
      "Repayment conduct, transaction categories and account behaviour are turned into a customer-value band, a propensity score, a pre-approved offer, a cashback segment, a branch sales list and a lookalike audience uploaded to an advertising platform. The customer receives an SMS, a push, a WhatsApp message, a call-centre campaign or a DSA follow-up they never asked for.",
    whyItMatters:
      "The data was collected to lend money or to move it, not to advertise - and the signals with the most commercial value are the ones about financial pressure. Being profiled as a person who might need a top-up is a conclusion drawn from a missed instalment. The customer cannot see which segment they are in or what put them there, and a withdrawal given to the app rarely reaches the partner lists, the agency lists, the branch sheets and the audiences already uploaded.",
    dataCategoryIds: ["marketing-profile", "derived-score", "repayment-collection", "transaction-history"],
    action:
      "Take a separate, unbundled choice for marketing and keep it apart from the service messages the customer must receive. Keep financial-distress and transaction-category signals out of targeting altogether. Hold one suppression list that every channel checks before it sends - app, SMS, call centre, WhatsApp, partner, branch and ad platform - and set an expiry on every audience you have uploaded.",
    assessmentBucket: "consent_notice_rights",
  },
  {
    id: "hs-rejected-applications",
    rank: 8,
    nodeId: "rejected-application-archive",
    title: "The fullest files belong to the people you refused",
    whatHappens:
      "Applications that were refused, abandoned halfway or approved and never taken up leave behind a complete file: KYC documents, bank statements or Account Aggregator extracts, the bureau report, the device profile, the score and the rejection reason. It sits in the archive, it is often included in model-training data, it stays on the marketing list, and the same file is also held by every lender the application was routed to.",
    whyItMatters:
      "These are the most complete records the business holds about the people with the least relationship to it - and there is usually no retention rule at all, because nobody owns non-customers. The person got nothing, has no account to close and often does not know the file exists. Meanwhile the refusal itself keeps working: it trains the next model and, in some businesses, brings the next marketing call.",
    dataCategoryIds: ["government-id", "bank-income-data", "bureau-credit", "automated-decision"],
    action:
      "Set a short operational retention for refused and abandoned applications and delete the raw documents first - the statements and the identity copies, not just the record. Keep a narrow, recorded exception where there is a genuine fraud or legal reason. Suppress these people from marketing immediately, exclude them from training data unless that use has been disclosed, and ask the lenders the file was routed to for deletion as part of the same job.",
    assessmentBucket: "access_retention_incident",
  },
];

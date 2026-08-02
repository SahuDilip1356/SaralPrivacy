// "What happens when someone asks" + "When it has already gone wrong".
//
// Shared, opt-in engine sections (lib/data-flow/schemas.ts) driven entirely by
// this content - no components are specific to real estate. Together they are
// the engine's answer to the pasted spec's §22 client-rights simulator and §23
// incident simulator, and they cover all nine request types and all ten incident
// scenarios it lists (spec §6).
//
// ⛔ LANGUAGE LOCKS (spec §5).
//
//  · "High-impact identity, financial and property data", never "sensitive
//    personal data" - the DPDPA creates no such statutory category.
//  · NO property, title, tax, registration, lending or investment advice. This
//    describes custody and control of personal data, nothing else.
//  · RETENTION IS NOT UNIFORMLY DELETABLE. Tax and commission records, an
//    executed agreement and a registered instrument have genuine grounds to be
//    kept. `rs-delete-my-kyc-after-registration` and `rs-delete-my-old-enquiry`
//    exist to separate what must be KEPT from what has merely never been
//    DELETED - that distinction is the whole value of the section.
//  · NO ACCUSATION. Broker networks, channel partners and co-broking are how
//    this industry works. Show where control breaks; do not tell a broker their
//    trade is a violation.
//
// `blockedNodeIds` is the honest half, and it carries unusual weight here.
// Three things a real firm genuinely cannot reach: the registered instrument at
// the sub-registrar, the co-brokers' and partners' own phones and CRMs, and the
// society or RWA systems after handover. A walkthrough that implied otherwise
// would be worse than no walkthrough.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

const PM = ["property-management"];
const SALES = ["brokerage", "developer"];

export const REAL_ESTATE_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-who-has-my-number",
    request: "Four brokers I never contacted have called me. Where did they get my number?",
    requestType: "access",
    who: "Someone who made one enquiry and is now being called by people they have never heard of",
    reachesNodeIds: [
      "sales-crm",
      "shared-lead-sheet",
      "property-portal-dashboard",
      "lead-ad-platform",
      "staff-whatsapp",
      "marketing-reuse-platform",
      "old-lead-database",
    ],
    blockedNodeIds: ["co-broker-group", "co-broker-person-node", "marketing-agency-dashboard", "ex-staff-device"],
    steps: [
      "Confirm who is asking, using the number or email the enquiry came in on.",
      "Find every record of them: the CRM, the lead sheet, the portal dashboard and the historic database - the same person is usually in all four.",
      "Establish which enquiry started it, when, and through which channel.",
      "List where their requirement was shared onward - the broker group, a partner, the marketing agency - and say so plainly.",
      "Give them what you hold, including the notes and scores, not just the contact fields.",
      "Suppress them everywhere at the same time if they ask you to stop.",
    ],
    hardPart:
      "The honest answer has two halves. You can account for what is inside your systems. You cannot account for the broker group - once a requirement was posted there, the recipients cannot be listed and nothing obliges any of them to delete it.",
  },
  {
    id: "rs-delete-my-old-enquiry",
    request: "I enquired two years ago and never bought anything. Delete everything you have.",
    requestType: "erasure",
    who: "A past enquirer who has just been called about a new launch",
    reachesNodeIds: [
      "sales-crm",
      "shared-lead-sheet",
      "old-lead-database",
      "marketing-reuse-platform",
      "staff-whatsapp",
      "cloud-backup",
    ],
    blockedNodeIds: ["co-broker-person-node", "ex-staff-device", "lead-ad-platform"],
    steps: [
      "Check whether a transaction ever completed. If it did not, there is very little you have grounds to keep.",
      "Delete the CRM record, the lead-sheet rows and the historic-database entry - all three, not just the one you were looking at.",
      "Remove them from campaign lists, broadcast groups and any audience already uploaded.",
      "Clear the documents they sent while they were being qualified, including the ones sitting in chat.",
      "Keep a minimal suppression entry so they are not re-imported next time a list is loaded.",
      "Tell them what was deleted, what remains and why.",
    ],
    hardPart:
      "This is the request the business model resists. An unconverted enquiry is exactly what the old-lead database exists to hold, so deleting it feels like destroying an asset - which is why it needs to be a retention rule that runs on a clock, not a decision taken case by case.",
  },
  {
    id: "rs-stop-calling-me",
    request: "Stop calling me about new projects. The deal closed months ago.",
    requestType: "withdraw-marketing",
    who: "A past client still receiving launch broadcasts, review requests and referral chases",
    reachesNodeIds: [
      "marketing-reuse-platform",
      "sales-crm",
      "lead-ad-platform",
      "review-referral-platform",
      "staff-whatsapp",
      "marketing-agency-dashboard",
    ],
    blockedNodeIds: ["co-broker-group", "ex-staff-device"],
    steps: [
      "Record the withdrawal against the master record, not against the campaign it came from.",
      "Add them to a single suppression list that every channel has to check before it sends.",
      "Remove them from the ad platform's custom and lookalike audiences - unsubscribing from email does not touch these.",
      "Tell the marketing agency to drop them from its own exports and stop re-importing them.",
      "Stop the automated review and referral prompts.",
      "Tell staff not to include them in broadcast lists sent from personal numbers.",
    ],
    hardPart:
      "Withdrawal has to travel further than anyone expects. The CRM flag is the easy part; the uploaded audience, the agency's spreadsheet and the broadcast list on a salesperson's own phone are three separate places that will keep sending unless each is dealt with.",
  },
  {
    id: "rs-delete-my-kyc-after-registration",
    request: "The property is registered. Delete my PAN, Aadhaar and bank statements.",
    requestType: "erasure",
    who: "A buyer or tenant whose transaction has completed",
    reachesNodeIds: [
      "kyc-document-folder",
      "staff-whatsapp",
      "staff-laptop",
      "physical-file-cupboard",
      "cloud-backup",
      "sales-crm",
    ],
    blockedNodeIds: ["public-property-record", "sub-registrar-office", "documentation-vendor"],
    steps: [
      "Separate the documents by why they were collected: identity verification, lender requirement, the instrument itself, and tax or commission records.",
      "Delete the working copies - the ones in chat, the downloads on a laptop, the duplicate scans in the folder.",
      "Keep what the transaction and the tax record genuinely require, and write down which those are.",
      "Shred or return the surplus hard copies rather than leaving them in the cupboard.",
      "Deal with backup and version history explicitly instead of assuming deletion reached it.",
      "Confirm to the client exactly what was destroyed and what was retained, with the reason.",
    ],
    hardPart:
      "\"Delete everything\" is not the right answer here and saying so is part of the job. The executed agreement and the tax records have grounds to stay. What has no grounds is the fourth copy of an Aadhaar card in a WhatsApp thread - and that is the copy nobody thinks to look for.",
  },
  {
    id: "rs-correct-my-details",
    request: "My address is wrong, and you have spelled my co-applicant's name incorrectly.",
    requestType: "correction",
    who: "A client who has spotted an error on a document or a communication",
    reachesNodeIds: [
      "sales-crm",
      "kyc-document-folder",
      "shared-lead-sheet",
      "site-visit-scheduler",
      "marketing-reuse-platform",
      "accounting-system",
    ],
    blockedNodeIds: ["public-property-record", "co-broker-group"],
    steps: [
      "Verify who is asking and which person the correction is about - the client, the co-applicant or an occupant.",
      "Fix the master record first, then the places that copied from it: the sheet, the folder metadata, the scheduler, the campaign list.",
      "Correct the requirement or preference if that is what is wrong, not only the contact fields.",
      "Tell any recipient who is acting on the wrong version - a lender, a documentation agent, a society.",
      "Keep a record of what was changed and when, rather than overwriting silently.",
      "Confirm back to the client, naming what was corrected where.",
    ],
    hardPart:
      "A correction only propagates as far as you can list the copies. If the detail was already circulated in a broker group or written into a registered instrument, the correction reaches your systems and stops there - and the client should be told that rather than left to discover it.",
  },
  {
    id: "rs-change-who-speaks-for-me",
    request: "My father held the power of attorney. I am handling this myself now.",
    requestType: "authorisation-change",
    who: "An NRI or absent owner taking back direct control, or a family member being removed from a transaction",
    reachesNodeIds: [
      "sales-crm",
      "kyc-document-folder",
      "staff-whatsapp",
      "documentation-vendor",
      "commission-tracker",
      "co-applicant",
    ],
    blockedNodeIds: ["public-property-record"],
    steps: [
      "Verify the new authority and the identity of the person asserting it before changing anything.",
      "Update who the authorised contact is on the master record, and stop sending to the previous one.",
      "Remove the former representative from the chat threads and groups the transaction runs through.",
      "Tell the documentation agent, the lender and the owner's side who they should now be dealing with.",
      "Keep the earlier authorisation on file as history rather than deleting it, so past actions stay explicable.",
      "Confirm the change and the date it took effect.",
    ],
    hardPart:
      "Most of this transaction happens in chat threads that were set up around whoever was available at the time. Changing the authorised contact in the CRM does nothing about the group where the deal is actually being discussed.",
  },
  {
    id: "rs-my-file-went-to-five-lenders",
    request: "My salary slips and bank statements went to lenders I never chose. Get them back.",
    requestType: "complaint",
    who: "A buyer who has started receiving calls from banks they never applied to",
    reachesNodeIds: ["loan-desk-file", "kyc-document-folder", "sales-crm"],
    blockedNodeIds: ["loan-agent-node", "bank-nbfc", "credit-marketplace"],
    steps: [
      "Establish exactly which lenders and intermediaries the file was sent to, and on what date.",
      "Check what the client actually instructed - most files are circulated on an assumption rather than an instruction.",
      "Ask every recipient who declined or was never chosen to confirm deletion in writing.",
      "Stop any further circulation of the file immediately.",
      "Record the outcome, including which recipients did not respond.",
      "Tell the client the full list, including the ones you could not get a confirmation from.",
    ],
    hardPart:
      "The file was sent to several lenders precisely so one of them would say yes. Getting it back from the four who did not is a request, not a control - and the loan agent's personal copy is usually the one nobody can account for.",
    businessModels: SALES,
  },
  {
    id: "rs-i-moved-out-a-year-ago",
    request: "I moved out a year ago. Why does the society app still list my visitors and my cleaner?",
    requestType: "erasure",
    who: "A former tenant who has discovered they are still on a resident system",
    reachesNodeIds: [
      "sales-crm",
      "landlord-property-file",
      "exit-inspection-record",
      "maintenance-work-order-app",
      "key-handover-register",
      "deposit-ledger",
    ],
    blockedNodeIds: [
      "society-app-gate",
      "domestic-staff-register",
      "society-whatsapp-group",
      "police-verification-portal",
      "site-gate-register",
    ],
    steps: [
      "Close the tenancy properly in your own systems: access records, work-order history, key register and inspection photographs.",
      "Keep the agreement, the deposit settlement and the tax records, and say why those stay.",
      "Ask the society and the facility contractor in writing to deregister the former resident and their household staff.",
      "Ask for the gate and visitor history to be dealt with under the society's own retention rule.",
      "Tell the former tenant which systems belong to the society rather than to you, and who to approach there.",
      "Record what you did and what you asked for, including anything the society refused.",
    ],
    hardPart:
      "Most of what the tenant is objecting to is not yours. The society app, the gate log and the domestic-staff register belong to the RWA, and the police verification is an authority record. Being straight about that boundary is more useful than promising a deletion you cannot deliver.",
    businessModels: PM,
  },
];

export const REAL_ESTATE_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "inc-id-to-wrong-whatsapp",
    title: "A PAN and Aadhaar copy went to the wrong WhatsApp contact",
    trigger: "A stranger replies \"I think you've sent me someone's documents\" - or the client rings, having been told by them",
    severity: "critical",
    involvedNodeIds: ["staff-whatsapp", "kyc-document-folder", "field-exec-phone", "sales-crm"],
    containment: [
      "Delete for everyone immediately - it only works inside the window, so this is the first action, not the third.",
      "Ask the recipient to delete the media from their phone and their gallery, and confirm.",
      "Check whether it was forwarded on before you got to it.",
      "Stop any further documents going out on that thread.",
    ],
    thenWhat: [
      "Write down exactly which documents went to which number and when.",
      "Tell the client plainly, including what you were able to confirm and what you were not.",
      "Advise them of the practical step available to them - masking or re-issuing the identifier where that is possible.",
      "Log it as an incident with the cause, not just the fix.",
    ],
    prevention:
      "Take identity documents through a secure upload link rather than chat, and turn off media auto-download so a mis-sent file is not already in someone's gallery.",
  },
  {
    id: "inc-lead-sheet-open-link",
    title: "The shared lead sheet is open to anyone with the link",
    trigger: "A client asks how a competitor knew their budget, or the sheet turns up in a search result",
    severity: "critical",
    involvedNodeIds: ["shared-lead-sheet", "marketing-agency-dashboard", "co-broker-person-node", "sales-crm"],
    containment: [
      "Change the link sharing to restricted immediately, before working out who had it.",
      "Pull the access and activity log to see who opened it and when.",
      "Check whether copies were downloaded or the sheet was duplicated.",
      "Look for the same file existing under another name or in another account.",
    ],
    thenWhat: [
      "Establish how many people are on the sheet and what fields it carried - budget and household notes matter more than names.",
      "Decide, on the numbers, whether the affected clients need to be told.",
      "Re-issue access by named account only, to the people who actually need it.",
      "Sweep every other shared file in the account for the same setting.",
    ],
    prevention:
      "Never share a client file by open link. Named access only, reviewed monthly - and move intake into the CRM so the sheet stops being the master copy.",
  },
  {
    id: "inc-ex-staff-crm-export",
    title: "A departed salesperson kept a copy of the client base",
    trigger: "Past clients report being contacted by the same person at a different firm",
    severity: "high",
    involvedNodeIds: ["ex-staff-device", "sales-crm", "shared-lead-sheet", "staff-whatsapp"],
    containment: [
      "Revoke CRM, sheet, portal, drive and group access if any of it is still live.",
      "Pull the export log to see what was downloaded, and when relative to the resignation.",
      "Remove them from every WhatsApp group the business runs.",
      "Change any shared credentials they knew.",
    ],
    thenWhat: [
      "Establish which clients are affected and what fields left with them.",
      "Write to the individual setting out what must be deleted, and keep the reply.",
      "Tell affected clients if the data that left is more than a name and a number.",
      "Fix the exit process, because this happens on a predictable schedule.",
    ],
    prevention:
      "Restrict exports to the owner, revoke everything on the last working day rather than the following week, and reconcile who holds shared links monthly.",
  },
  {
    id: "inc-bank-statement-to-lenders",
    title: "A client's financial file went to lenders they never chose",
    trigger: "The client starts getting calls from banks they did not apply to",
    severity: "high",
    involvedNodeIds: ["loan-desk-file", "loan-agent-node", "bank-nbfc", "credit-marketplace", "kyc-document-folder"],
    containment: [
      "Stop any further circulation of the file straight away.",
      "Establish the full list of recipients from the agent and the aggregator, in writing.",
      "Ask the lenders who were not chosen to close and delete the application.",
      "Check whether the co-applicant's documents went with it.",
    ],
    thenWhat: [
      "Record what the client actually instructed, and where the gap between that and what happened opened up.",
      "Get deletion confirmations and note which recipients did not reply.",
      "Tell the client the complete list, including the ones outside your control.",
      "Move to sending on written instruction only, per lender.",
    ],
    prevention:
      "Send the financial pack to one lender at a time on the client's instruction, record each recipient, and use a lender-specific folder rather than a WhatsApp album.",
    businessModels: SALES,
  },
  {
    id: "inc-wrong-agreement-draft",
    title: "The wrong client's draft agreement was sent out",
    trigger: "A client says \"this isn't my name\" - or worse, does not say anything",
    severity: "high",
    involvedNodeIds: ["documentation-vendor", "staff-whatsapp", "staff-laptop", "estamp-esign-platform"],
    containment: [
      "Recall or delete the message and ask the recipient to delete their copy.",
      "Confirm nothing was executed or stamped on the wrong draft.",
      "Check which version is now with the drafter, the notary and the registration agent.",
      "Remove the superseded drafts from laptops and chat threads.",
    ],
    thenWhat: [
      "Work out whose details were exposed - it is usually a third client, not either of the two in the conversation.",
      "Tell the affected client what was disclosed and to whom.",
      "Reissue the correct draft through a named channel.",
      "Label draft and final versions so the next one cannot be confused.",
    ],
    prevention:
      "Keep one folder per transaction, never a general drafts folder, and send documents from the transaction record rather than from a chat history.",
  },
  {
    id: "inc-site-register-photographed",
    title: "A page of the site-visit register was photographed and circulated",
    trigger: "A client reports being called by an agent they never met, quoting their visit",
    severity: "medium",
    involvedNodeIds: ["site-gate-register", "field-exec-phone", "site-cctv"],
    containment: [
      "Secure the register so earlier entries are no longer visible to the next visitor.",
      "Find out who had access to that page - site staff, security, other visitors, a co-broker.",
      "Ask for the photograph to be deleted and confirm it was not forwarded on.",
      "Check whether the same practice is running at other sites.",
    ],
    thenWhat: [
      "Establish how many visitors' details were on the page.",
      "Raise it with the site owner or society, whose register it usually is.",
      "Agree a retention period for completed registers instead of leaving them in a drawer.",
      "Decide whether the affected visitors need to be told.",
    ],
    prevention:
      "Use a register that conceals previous entries, or a tablet-based visitor system, and stop collecting details the entry decision does not need.",
  },
  {
    id: "inc-tenant-kyc-in-society-group",
    title: "A tenant's KYC was posted into the society WhatsApp group",
    trigger: "The tenant sees their own Aadhaar in a group of a hundred neighbours",
    severity: "critical",
    involvedNodeIds: ["society-whatsapp-group", "kyc-document-folder", "field-exec-person", "society-app-gate"],
    containment: [
      "Delete for everyone at once - the window is short and the group is large.",
      "Ask the group admin to confirm removal and to check nobody has forwarded it.",
      "Establish who posted it and whether the same was done for other tenants.",
      "Stop any further documents going to the group.",
    ],
    thenWhat: [
      "Tell the tenant immediately, before they hear it from a neighbour, and be specific about what was visible.",
      "Give the committee a verification status instead of the document, and put that in writing.",
      "Review whether the society is asking for more than it needs at move-in.",
      "Log the incident and the corrective step.",
    ],
    prevention:
      "Never send resident or tenant documents to a group. Use a named committee contact, and share the fact of verification rather than the underlying identity document.",
    businessModels: PM,
  },
  {
    id: "inc-lost-field-phone",
    title: "A field executive's phone with client documents was lost",
    trigger: "The executive reports the phone missing, usually a day later",
    severity: "high",
    involvedNodeIds: ["field-exec-phone", "staff-whatsapp", "kyc-document-folder", "sales-crm"],
    containment: [
      "Remote-wipe the work profile and revoke the sessions if the device was managed.",
      "Log the person out of WhatsApp, the CRM and the drive from another device.",
      "Change any shared credentials the phone held.",
      "Establish what was actually on it: documents, photographs, the contact list, the group history.",
    ],
    thenWhat: [
      "List the clients whose documents or contact details were on the device.",
      "Decide on the substance whether those clients need to be told.",
      "Re-issue a managed device rather than restoring a personal backup.",
      "Record it, including how much of the file was on the handset in the first place.",
    ],
    prevention:
      "Keep documents in the folder rather than the gallery, turn off media auto-download and contact sync on work accounts, and use a work profile that can be wiped independently.",
  },
];

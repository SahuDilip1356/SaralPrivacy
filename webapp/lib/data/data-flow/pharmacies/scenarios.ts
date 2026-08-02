// "What happens when someone asks" + "When it has already gone wrong".
//
// Shared, opt-in engine sections (lib/data-flow/schemas.ts) driven entirely by
// this content - no components are specific to pharmacies. Together they are the
// engine's answer to the pasted spec's §22 customer-rights simulator and §23
// incident simulator, and they cover all ten request types and all eleven
// incident scenarios it lists (spec §6).
//
// ⛔ LANGUAGE LOCKS - the tightest in this series so far (spec §8).
//
//  · "High-impact prescription and health-related data", never "sensitive
//    personal data" - the DPDPA creates no such statutory category.
//  · NO medical, pharmacological, dosage, substitution or drug-interaction
//    advice. Not one word. Where a step touches a clinical judgement it says
//    "the pharmacist decides", never what the decision should be.
//  · NO advice on drug-licensing, schedule-register or pharmacy-regulatory
//    obligations. Where a record must be maintained under other law, these say
//    only that it is a REQUIRED RECORD and therefore not freely deletable -
//    never what must be kept, or for how long.
//  · RETENTION IS NOT UNIFORMLY DELETABLE, and this is sharper here than
//    anywhere else in the series. `rs-delete-order-history` and
//    `rs-erase-but-register` exist specifically to separate what must be KEPT
//    from what has merely never been DELETED. That distinction is the whole
//    value of the section, and a walkthrough promising erasure of everything
//    would be worse than no walkthrough.
//  · NO ACCUSATION. WhatsApp orders, a photographed prescription, a khata
//    ledger and a delivery boy are how this trade works. Show where control
//    breaks; do not tell a chemist their trade is a violation.
//
// `blockedNodeIds` is the honest half, and it carries unusual weight here. Five
// things a real pharmacy genuinely cannot reach: the prescriber's own records,
// a marketplace or aggregator platform's copy, the delivery partner's manifest,
// an insurer's or administrator's claim file, and anything in a register it is
// required to maintain. A walkthrough implying otherwise would mislead.
//
// Scenarios gated to a model must reference only nodes visible in that model -
// the §5 verification script checks this, and validatePack fails on an id that
// does not resolve at all. Everything ungated below uses only ungated nodes.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

const ONLINE = ["online"];
const CHAIN = ["chain-hospital"];
const COUNTER = ["retail", "chain-hospital"];
const WAREHOUSED = ["online", "chain-hospital"];

export const PHARMACIES_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-what-do-you-have",
    request: "What do you actually hold about me, and who else has it?",
    requestType: "access",
    who: "A customer who has started getting refill messages they never asked for, and wants to know how much you know",
    reachesNodeIds: [
      "customer-medicine-history",
      "prescription-image-store",
      "billing-pos-system",
      "staff-phone-whatsapp",
      "refill-marketing-platform",
      "complaint-adverse-event-file",
      "accounting-tax-system",
      "pharmacy-archive",
    ],
    blockedNodeIds: ["ex-staff-device", "cloud-backup", "distributor-manufacturer", "prescriber-person"],
    steps: [
      "Confirm who is asking, using the number the orders were placed on - and check whether that number belongs to the patient or to a relative who buys for them.",
      "Search on more than the name: the same person is usually in the billing system, the chat thread, the archive and the reminder list under slightly different spellings.",
      "Include the purchase history in full. It is the largest thing you hold about them, and it is the part they are usually asking about.",
      "Include what you created rather than collected - the review and substitution notes, the refill segment, the value band, any score.",
      "Include the prescription images, and say where each copy is: the order, the folder, the chat, the printout, the download.",
      "Name who it was shared with - the delivery partner, the platform the order came through, the insurer, the distributor a complaint went to.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "The chat thread. A year of orders, prescription photographs and 'do you have this' messages sits on a staff member's own phone, and there is no way to search it, export it or be sure you have found all of it. The honest answer either admits that or quietly pretends the channel does not exist.",
  },
  {
    id: "rs-delete-order-history",
    request: "Delete my order history. It shows what I take.",
    requestType: "erasure",
    who: "A long-standing customer who has realised the shop holds a complete record of their medication",
    reachesNodeIds: [
      "customer-medicine-history",
      "billing-pos-system",
      "refill-marketing-platform",
      "shared-drive-folder",
      "staff-laptop",
      "pharmacy-archive",
      "staff-phone-whatsapp",
    ],
    blockedNodeIds: ["accounting-tax-system", "cloud-backup", "ex-staff-device"],
    steps: [
      "Separate the request into parts, because the answer is genuinely different for each: the marketing profile, the purchase history, the prescription images, the financial record and anything you are required to maintain.",
      "Stop the reminders and the profiling first - that part can be done immediately and is usually what actually prompted the request.",
      "Delete the purchase history you have no continuing reason to hold, and record that you did it and when.",
      "Keep the invoice and tax record, and say so plainly rather than implying everything has gone. That record has grounds to be kept and the customer is entitled to a straight answer about it.",
      "Check the copies outside the main system: the export in the shared folder, the download on the laptop, the list on the phone.",
      "Note how long the deletion takes to clear the backup cycle, and tell them.",
      "Write down the exceptions and the reason for each, so the same answer can be given again next time.",
    ],
    hardPart:
      "Saying no to part of it, clearly. A pharmacy genuinely cannot delete everything - some records must be kept, and it is not the shop's choice. The failure is not usually refusing; it is refusing vaguely, so the customer hears 'we keep it all' and the parts that could have been deleted quietly never are.",
  },
  {
    id: "rs-delete-prescription-photo",
    request: "Delete the photo of my prescription. You filled it months ago.",
    requestType: "erasure",
    who: "A customer who sent a prescription over chat and has since realised it is still there",
    reachesNodeIds: [
      "staff-phone-whatsapp",
      "prescription-image-store",
      "staff-laptop",
      "shared-email-inbox",
      "shared-drive-folder",
      "pharmacy-archive",
      "cloud-backup",
    ],
    blockedNodeIds: ["ex-staff-device", "distributor-manufacturer"],
    steps: [
      "Find every copy, not the first one: the chat thread it arrived in, the order it was attached to, the scanner's own default folder, the download made to print it, the printout in the file, the backup.",
      "Delete each of them and record that you did.",
      "Check whether the prescription was refused rather than filled - if it was, there is very rarely any reason for the image to exist at all.",
      "Keep the dispensing record itself if you have grounds to; that is a different question from keeping the photograph of the prescription.",
      "Turn off automatic media backup on the shop's phones, or the next copy will survive this one.",
      "Set the retention rule that stops the next image outliving the order, so this is a change rather than a favour.",
    ],
    hardPart:
      "There are almost always more copies than anyone expects, and the one that gets missed is the scanner's local folder or the chat thread the image first arrived in. A prescription collected once through three channels leaves at least five copies, and nobody in the shop has a list of them.",
  },
  {
    id: "rs-correct-patient-linkage",
    request: "These medicines are my father's, not mine. Take them off my record.",
    requestType: "correction",
    who: "A customer who buys for a parent and has found their own record showing a condition that is not theirs",
    reachesNodeIds: [
      "customer-medicine-history",
      "billing-pos-system",
      "prescription-image-store",
      "pharmacist-review-record",
      "refill-marketing-platform",
      "pharmacy-archive",
    ],
    blockedNodeIds: ["accounting-tax-system", "cloud-backup", "ex-staff-device"],
    steps: [
      "Log the request properly rather than handling it verbally at the counter, with an owner and a date.",
      "Establish who the patient actually is and who the purchaser is - these have been the same field, which is how the problem happened.",
      "Create a separate record for the patient rather than moving the rows to a note, and re-attach the prescriptions and purchases to the right person.",
      "Keep the amendment history visible rather than overwriting it, so the correction can be shown to have happened.",
      "Correct everything built on the wrong linkage: the refill segment, the reminder list, the recommendation, any score.",
      "Leave the financial record as it stands, because the sale really was made to the purchaser - and explain that distinction rather than leaving it to be discovered.",
      "Confirm to the customer what changed and what did not.",
    ],
    hardPart:
      "The inference has already travelled. By the time anyone notices, the wrong medicine history has produced a refill segment, a recommendation and possibly a marketing audience - and correcting the purchase rows does not automatically unwind any of them. It is also the correction most likely to be waved away at the counter as 'not a problem', because nobody sees the record it created.",
  },
  {
    id: "rs-stop-refill-reminders",
    request: "Stop the refill reminders. My family reads my phone.",
    requestType: "withdraw-marketing",
    who: "A customer whose reminder messages name the medicine, on a handset other people in the house pick up",
    reachesNodeIds: [
      "refill-marketing-platform",
      "messaging-broadcast-service",
      "staff-phone-whatsapp",
      "customer-medicine-history",
      "pharmacy-archive",
    ],
    blockedNodeIds: ["ex-staff-device", "cloud-backup"],
    steps: [
      "Record the withdrawal against the master customer record, not against the campaign it came from.",
      "Put them on one suppression list that every channel has to check before it sends - including the one a person sends by hand.",
      "Take them off the broadcast list on the owner's or the counter staff member's own phone, which is a separate place from all of the above.",
      "Ask whether they want service messages about an order they have already placed to continue, and keep those clearly separate from promotion.",
      "Stop the profiling as well as the sending: a person can be off the send list and still be scored as a chronic user every night.",
      "Confirm what has stopped, and by when.",
    ],
    hardPart:
      "Withdrawal has to travel further than anyone expects, and the last stop is always a person rather than a system. The CRM flag is easy; the list in the owner's phone, the agency's spreadsheet and the segment that keeps being rebuilt from purchase history are three separate places that will each keep going unless dealt with individually.",
  },
  {
    id: "rs-wrong-person-collected",
    request: "Someone else collected my medicine. Who did you give it to?",
    requestType: "authorisation-change",
    who: "A customer who found out from a relative or a neighbour that their package had already been taken",
    reachesNodeIds: [
      "proof-of-delivery-store",
      "dispensed-package-label",
      "billing-pos-system",
      "customer-medicine-history",
      "complaint-adverse-event-file",
    ],
    blockedNodeIds: ["family-caregiver-person", "ex-staff-device", "distributor-manufacturer"],
    steps: [
      "Establish what actually happened from the delivery record: who took it, when, and what was visible on the package when they did.",
      "Tell the customer honestly what was disclosed, including what the label and the invoice showed.",
      "Record who the customer authorises to collect on their behalf as a specific, separate permission - not as a phone number in a contact field.",
      "Change the default so a familiar face at the counter is not enough to release a package, and tell the counter staff.",
      "Fix the packaging so the next handover does not disclose the contents regardless of who takes it.",
      "Log it as an incident even though nothing was lost, because the disclosure was real.",
    ],
    hardPart:
      "It cannot be undone. Whoever took the package has already seen what was in it, and no process change reaches them. This is the one failure on this map that cannot be recalled - which is exactly why the packaging and the authorised-collector question should have been settled before it happened.",
  },
  {
    id: "rs-unlink-family-account",
    request: "Take my prescriptions off my son's account. He can see everything.",
    requestType: "authorisation-change",
    who: "A parent whose orders were placed under an adult child's login, and who did not realise the profile was shared",
    reachesNodeIds: [
      "customer-account-service",
      "pharmacy-app-website",
      "customer-medicine-history",
      "prescription-image-store",
      "refill-marketing-platform",
    ],
    blockedNodeIds: ["marketplace-platform", "ex-staff-device", "cloud-backup"],
    steps: [
      "Verify the person asking, which is harder than usual because the account is not in their name.",
      "Create a separate profile for them rather than hiding rows on the existing one - visibility is the whole point of the request.",
      "Move the prescriptions, the order history and the saved address across, and remove them from the profile they were on.",
      "Check what the account holder can still see afterwards, on the app and in the order history, and confirm it honestly.",
      "Take the moved history out of any household-level reminder or recommendation that was built from it.",
      "Where the order came through a marketplace rather than your own app, say plainly that the platform's copy is not yours to change.",
    ],
    hardPart:
      "What has already been seen. A household account discloses continuously and silently - every order confirmation, every reminder, every 'buy it again' suggestion - so by the time anyone asks, the disclosure has been happening for months. Unlinking stops the next one; it does not undo any of them.",
    businessModels: ONLINE,
  },
  {
    id: "rs-erase-but-register",
    request: "Delete everything you have on me.",
    requestType: "erasure",
    who: "A customer who wants a clean break, including the medicines that went into the separate register",
    reachesNodeIds: [
      "customer-medicine-history",
      "billing-pos-system",
      "prescription-image-store",
      "physical-prescription-file",
      "pharmacy-archive",
    ],
    blockedNodeIds: ["controlled-medicine-register", "drug-authority-record", "accounting-tax-system"],
    steps: [
      "Split the request before answering it: what you keep by choice, what you keep for the accounts, and what you are required to maintain as a record.",
      "Delete what you hold by choice - the purchase history you have no continuing reason for, the marketing profile, the working copies of prescriptions.",
      "Explain that certain dispensing records are REQUIRED RECORDS: they exist because other law says they must, they are not the pharmacy's to remove, and that is not a decision the shop is making.",
      "Do not soften that by promising a review or a future deletion date you cannot commit to - say what is retained and that you cannot delete it.",
      "Make the fact that a record cannot be deleted a reason to restrict it more tightly, not less: check who can open the register and whether informal duplicates of it exist anywhere.",
      "Record the exceptions in writing so the same customer gets the same answer next year.",
    ],
    hardPart:
      "Holding the line honestly without over-claiming in either direction. It is tempting either to promise full deletion and quietly not do it, or to treat 'we have obligations' as a reason to keep everything. Both are wrong, and the second is the more common: the required record is narrow, and most of what sits beside it is retained purely because nobody decided otherwise.",
    businessModels: COUNTER,
  },
];

export const PHARMACIES_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "is-wrong-customer-package",
    title: "The medicine went to the wrong customer",
    trigger:
      "Someone calls to say the package they received has another person's name and medicines on the label - or the right customer calls to say theirs never arrived.",
    severity: "critical",
    involvedNodeIds: [
      "dispensed-package-label",
      "billing-pos-system",
      "proof-of-delivery-store",
      "pharmacist-review-record",
      "complaint-adverse-event-file",
    ],
    containment: [
      "Find out where the package physically is now and get it back before anything else.",
      "Identify both customers - the one who received it and the one who should have - from the order and the delivery record.",
      "Establish what the person who opened it could see: the label, the invoice, the medicine itself.",
      "Check whether the same mix-up affected any other order in that batch or on that round.",
      "Have the pharmacist confirm what was actually dispensed to whom before anyone is told anything.",
    ],
    thenWhat: [
      "Tell the customer whose medicine it was what happened, what was on the package and who saw it - promptly and without minimising it.",
      "Re-dispense correctly, and let the pharmacist decide anything clinical about the returned stock.",
      "Record it as an incident with the sequence of events, not just the outcome.",
      "Work out which step failed - a label, a name search, a handover - rather than treating it as one person's mistake.",
      "Take the decision on whether this needs to be reported anywhere with your own advisers; the map does not make that call for you.",
    ],
    prevention:
      "Check the name and the order reference at handover as a separate step from taking payment, and pack in outer packaging that does not disclose the contents - so that when this does happen, what the wrong person learns is much less.",
  },
  {
    id: "is-package-revealed-condition",
    title: "The package told the neighbour what the medicine was",
    trigger:
      "A customer complains that a parcel left with a neighbour, at a gate or at an office reception had the medicine visible on the label or on the invoice taped to it.",
    severity: "high",
    involvedNodeIds: [
      "dispensed-package-label",
      "proof-of-delivery-store",
      "complaint-adverse-event-file",
      "customer-medicine-history",
    ],
    containment: [
      "Establish exactly what was visible from the outside: the label, the invoice, the pack shape, the pharmacy's own branding.",
      "Find out who received it and whether the package was opened.",
      "Check whether the same packaging is going out on every other order right now - because it almost certainly is.",
      "Stop attaching itemised invoices to the outside of packages today, before anything else is decided.",
    ],
    thenWhat: [
      "Tell the customer what was visible and to whom, without arguing about whether it counts as a disclosure. It does.",
      "Change the packaging standard rather than treating this as one bad delivery.",
      "Review what the delivery partner is sent alongside the package - an order reference is usually enough where a medicine list is currently going.",
      "Record it as an incident, because this is a disclosure even though nothing was lost or stolen.",
    ],
    prevention:
      "Treat what is printed on the outside of a package as a disclosure decision rather than a logistics one: neutral outer packaging, the invoice sealed inside, and an order reference rather than a medicine name in whatever the courier can see.",
  },
  {
    id: "is-staff-phone-lost",
    title: "The phone with the prescription photos is gone",
    trigger:
      "A staff member reports their handset lost or stolen - the one the shop's order number runs on, holding years of prescription images and customer chats.",
    severity: "critical",
    involvedNodeIds: [
      "staff-phone-whatsapp",
      "prescription-image-store",
      "cloud-backup",
      "complaint-adverse-event-file",
    ],
    containment: [
      "Get the number and the messaging account disabled immediately, before anything else.",
      "Work out what was on it: how far back the threads went, whether media was saved to the device, whether it was backed up to a personal account.",
      "Change the passwords for any shop system that phone was signed in to.",
      "Establish whether the device was locked, and whether anyone else knew the passcode.",
      "Find out whose prescriptions were in the threads, at least approximately, from the order records.",
    ],
    thenWhat: [
      "Decide what customers need to be told, based on what was actually recoverable from the device rather than on the best case.",
      "Move the order number onto a business account that can be revoked centrally, and do it now rather than after a review.",
      "Turn off automatic media backup on every other shop device.",
      "Write the incident up with what was on the phone and what was done, and keep it.",
      "Take any reporting decision with your own advisers.",
    ],
    prevention:
      "The exposure is the years of history, not the handset. Keep order intake on a business number and account, direct prescription images to one upload route instead of chat, and clear historic threads on a schedule so a lost phone costs a week rather than a decade.",
  },
  {
    id: "is-refill-message-exposed",
    title: "The refill reminder told the family",
    trigger:
      "A customer complains - often angrily - that a message naming their medicine appeared on a phone their spouse, parent or child reads, and that they had never told them.",
    severity: "high",
    involvedNodeIds: [
      "refill-marketing-platform",
      "messaging-broadcast-service",
      "staff-phone-whatsapp",
      "customer-medicine-history",
    ],
    containment: [
      "Stop all outbound messages to that number immediately, across every channel including the ones sent by hand.",
      "Find out what was actually sent and how many times, not just the message being complained about.",
      "Check whether the number on file belongs to the customer at all, or to a relative who once placed an order.",
      "Look at whether the same message template is scheduled to go to anyone else today.",
    ],
    thenWhat: [
      "Apologise for the disclosure specifically, rather than for the inconvenience.",
      "Change the wording of reminders so they do not name the medicine - a due date and a reference are enough to prompt a call.",
      "Ask every customer separately whether they want reminders at all, instead of treating a purchase as agreement to them.",
      "Record the withdrawal in one suppression list that every channel checks, and confirm the personal handset is on it too.",
    ],
    prevention:
      "A reminder that names a medicine is a disclosure to whoever is holding the phone. Word them so they cannot be read as a condition, and get an explicit choice for reminders separately from the sale.",
  },
  {
    id: "is-ex-staff-export",
    title: "A former employee still has the customer list",
    trigger:
      "A customer mentions being contacted by a new shop nearby that already knew their name and what they buy - or a departing staff member's export turns up somewhere it should not.",
    severity: "critical",
    involvedNodeIds: [
      "ex-staff-device",
      "customer-medicine-history",
      "shared-drive-folder",
      "refill-marketing-platform",
      "pharmacy-archive",
    ],
    containment: [
      "Close every account and shared login that person could still reach, including the shared mailbox and the shared drive.",
      "Change any password that was known to more than one person rather than only theirs.",
      "Work out what could have been exported and when, from whatever access logs exist.",
      "Check whether the shop's order number and messaging account were ever on their device.",
    ],
    thenWhat: [
      "Establish what is actually in the wrong hands before deciding what to tell anyone - the list, the medicine history, the prescriptions, or all three.",
      "Ask for the export back and its deletion in writing, and keep the reply.",
      "Tell affected customers if their medicine history is involved, because that is the part they would want to know about.",
      "Record the incident and take the reporting decision with your own advisers.",
      "Review who else currently holds an export that has served its purpose.",
    ],
    prevention:
      "Give people their own accounts rather than shared logins, restrict who can export at all, close access on the last day rather than the following month, and make the return and deletion of any export an explicit condition of leaving.",
  },
  {
    id: "is-register-exposed",
    title: "The register was left where anyone could read it",
    trigger:
      "Someone notices the controlled-medicine register open on the counter, in an unlocked drawer, or photographed - naming patients, prescribers and quantities.",
    severity: "high",
    involvedNodeIds: ["controlled-medicine-register", "physical-prescription-file", "pharmacy-archive"],
    containment: [
      "Secure the register physically, and establish who has had access to it and for how long.",
      "Find out whether it was photographed or copied, and by whom.",
      "Check whether informal duplicates of it exist - a notebook, a spreadsheet, a photo taken 'to make it easier'.",
      "Establish which patients appear in the exposed pages.",
    ],
    thenWhat: [
      "Destroy the informal duplicates. They were never required, and they carry the same information with none of the protection.",
      "Do not alter the register itself to respond to this: it is a required record, and correcting an exposure is not a reason to change what it says.",
      "Restrict who can open it to the dispensing role, and write that down.",
      "Record the incident, and take any reporting decision with your own advisers.",
    ],
    prevention:
      "A record you are required to keep and cannot delete is a reason for tighter access, not looser. Keep the register secured and restricted to the people who must sign it, and never maintain a convenience copy of it anywhere.",
    businessModels: COUNTER,
  },
  {
    id: "is-vendor-retains-prescriptions",
    title: "The extraction service kept the prescription images",
    trigger:
      "A contract review, a vendor security notice or a support conversation reveals that uploaded prescriptions are being retained by the service that reads them - including the ones that were refused.",
    severity: "critical",
    involvedNodeIds: [
      "ocr-extraction-vendor",
      "prescription-image-store",
      "prescription-upload-portal",
      "complaint-adverse-event-file",
    ],
    containment: [
      "Establish what the vendor actually holds, for how long, where, and whether any of it has been used for anything beyond processing your orders.",
      "Stop sending new images until you know the answer.",
      "Check whether refused and abandoned uploads were sent as well as accepted ones - they usually were.",
      "Find out whether any subprocessor of theirs also holds copies.",
    ],
    thenWhat: [
      "Require deletion in writing with a date, and confirmation once it is done.",
      "Put retention, no-reuse-for-training and subprocessor terms into the contract rather than relying on a support reply.",
      "Reduce what is sent in the first place - the whole image is rarely necessary, and refused uploads never are.",
      "Record the incident and take the reporting decision with your own advisers.",
    ],
    prevention:
      "Treat any service that reads a prescription as holding high-impact prescription data on your behalf: agree retention before you send anything, send the minimum, delete refused uploads at source, and check periodically that what was agreed is what is happening.",
    businessModels: ONLINE,
  },
  {
    id: "is-health-audience-uploaded",
    title: "A condition-based audience was uploaded to an ad platform",
    trigger:
      "Somebody notices a campaign targeting customers of one therapy area, or a customer asks why they are seeing adverts for something they only ever bought at your shop.",
    severity: "critical",
    involvedNodeIds: [
      "ad-audience-platform",
      "refill-marketing-platform",
      "marketing-agency-export",
      "customer-medicine-history",
    ],
    containment: [
      "Pause the campaign and stop any scheduled uploads immediately.",
      "Establish which lists went up, when, how they were built and how many people are on them.",
      "Check whether the agency holds its own copy and whether it has uploaded anything separately.",
      "Find out whether the platform has already used the list to build a lookalike audience from it.",
    ],
    thenWhat: [
      "Delete the audiences at the platform and confirm the match has been dropped, not just that the campaign has stopped.",
      "Get the agency's copy deleted in writing.",
      "Stop building segments from medicine or condition data at all, rather than restricting how they are used.",
      "Tell the people involved if their data was matched, and record the incident.",
      "Take the reporting decision with your own advisers.",
    ],
    prevention:
      "A list built from what people buy is a health inference regardless of what the field is called. Keep purchase-derived segments out of advertising entirely, and give the agency a segment in your own tool rather than a file it can keep.",
    businessModels: WAREHOUSED,
  },
  {
    id: "is-wrong-patient-merge",
    title: "Two patients were merged into one record",
    trigger:
      "A pharmacist or a customer notices medicines in a record that belong to somebody else - usually two people sharing a household number, or a common name.",
    severity: "critical",
    involvedNodeIds: [
      "central-patient-index",
      "customer-medicine-history",
      "insurance-tpa-portal",
      "pharmacist-review-record",
      "complaint-adverse-event-file",
    ],
    containment: [
      "Stop dispensing against the merged record until the pharmacist has confirmed which entries belong to whom.",
      "Establish when the merge happened and what has been done on the strength of it since.",
      "Check whether the merged history was used for a claim, a reminder or an automated check.",
      "Find out whether the same matching rule has merged anyone else.",
    ],
    thenWhat: [
      "Unmerge the records and keep the amendment history visible rather than overwriting it.",
      "Correct everything downstream: the claim, the reminder segment, any score built on the combined history.",
      "Tell both people what was combined and what each of them may have been shown about the other.",
      "Tighten the matching rules and make merges reviewable rather than automatic.",
      "Record it as an incident - it is a disclosure between two customers as well as a data-quality failure.",
    ],
    prevention:
      "Do not match on a phone number alone, because households share them. Require a second matching signal, make merges auditable and reversible, and let a pharmacist confirm a merge before it affects dispensing.",
    businessModels: CHAIN,
  },
];

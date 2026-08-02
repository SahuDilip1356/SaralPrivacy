// "What happens when someone asks" + "When it has already gone wrong".
//
// Shared, opt-in engine sections (lib/data-flow/schemas.ts) driven entirely by
// this content - no components are specific to hospitality. Together they are
// the engine's answer to the pasted spec's §22 guest-rights simulator and §23
// incident simulator, and they cover all ten request types and all eleven
// incident scenarios it lists (spec §6).
//
// ⛔ LANGUAGE LOCKS (spec §5).
//
//  · "High-impact identity, travel and location data", never "sensitive
//    personal data" - the DPDPA creates no such statutory category.
//  · NO immigration, visa, travel-safety, hospitality-licensing or
//    foreign-national-reporting advice. Where a record has been filed with an
//    authority the map says only that it is authority-controlled and therefore
//    not the business's to amend or withdraw. It does not say what must be
//    filed, or when.
//  · RETENTION IS NOT UNIFORMLY DELETABLE. Tax and invoice records, a filed
//    government report and a ticketed booking have genuine grounds to be kept.
//    `rs-delete-my-passport-copy` and `rs-delete-cancelled-booking` exist to
//    separate what must be KEPT from what has merely never been DELETED - that
//    distinction is the whole value of the section.
//  · NO ACCUSATION. Taking an ID copy at the desk, briefing a guide over
//    WhatsApp and selling through an OTA are how this industry works. Show where
//    control breaks; do not tell a hotelier their trade is a violation.
//
// `blockedNodeIds` is the honest half, and it carries unusual weight here.
// Four things a real business genuinely cannot reach: the OTA's own copy of the
// booking, a ticketed record in a carrier's or GDS system, the long tail of
// guides, drivers and local vendors who were sent a list over WhatsApp, and a
// report already filed with an authority. A walkthrough that implied otherwise
// would be worse than no walkthrough.
//
// Scenarios gated to a model must reference only nodes visible in that model -
// the §5 verification script checks this, and validatePack fails on an id that
// does not resolve at all.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

const HOTEL = ["hotel", "integrated"];
const TRAVEL = ["travel-agency", "integrated"];

export const HOTELS_TRAVEL_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-what-do-you-have",
    request: "What do you actually hold about me, and who else has it?",
    requestType: "access",
    who: "A past guest who has started getting calls and offers from businesses they never dealt with",
    reachesNodeIds: [
      "guest-profile-system",
      "id-document-store",
      "enquiry-lead-sheet",
      "staff-phone-whatsapp",
      "loyalty-marketing-platform",
      "guest-history-archive",
      "accounting-finance-system",
      "movement-access-trail",
    ],
    blockedNodeIds: ["booking-channel-platform", "partner-vendor-network", "ex-staff-device", "ad-analytics-platform"],
    steps: [
      "Confirm who is asking, using the number or email the booking was made on.",
      "Search on more than the name - the same person is usually in the reservation system, the lead sheet, the archive and the loyalty record under slightly different spellings.",
      "Include what you created about them, not only what they gave you: the preference notes, the value band, the complaint history and any behaviour flag.",
      "Include the identity documents you still hold, and say where each copy is.",
      "List who the booking was shared with - the platform it came from, the transfer vendor, the partners who delivered the service.",
      "Say plainly which of those recipients you can reach and which you cannot.",
    ],
    hardPart:
      "The honest answer has two halves. You can account for what is inside your systems. You cannot account for the platform that collected them in the first place, or for the guides, drivers and local vendors who were sent a list over WhatsApp - and those are the recipients the guest is usually asking about.",
  },
  {
    id: "rs-delete-my-passport-copy",
    request: "Delete the copy of my passport. I stayed with you once, two years ago.",
    requestType: "erasure",
    who: "A former guest who has realised their identity document is still sitting somewhere",
    reachesNodeIds: [
      "id-document-store",
      "passport-scanner-desktop",
      "staff-phone-whatsapp",
      "physical-file-store",
      "staff-laptop",
      "guest-history-archive",
      "cloud-backup",
    ],
    blockedNodeIds: ["booking-channel-platform", "ex-staff-device"],
    steps: [
      "Find every copy, not the first one: the document folder, the scanner's own memory and default folder, the chat thread it arrived in, the printout in the file, the download on somebody's laptop.",
      "Delete each of them, and record that you did.",
      "Check what was legitimately required to be retained or filed and keep only that - not the working copies that were made alongside it.",
      "Keep the booking and the invoice if you have grounds to; that is a different question from keeping the identity document.",
      "Note how long the deletion takes to clear the backup cycle, and tell them.",
      "Set the retention rule that stops the next copy surviving the stay, so this is not a one-off favour.",
    ],
    hardPart:
      "There is almost never a reason to still hold it, and almost always more copies than anyone expects. A document collected once through four channels leaves four copies, and the one that gets missed is usually the scanner's local folder or the chat thread it first arrived in. Anything already filed with an authority is not yours to withdraw, and should be described as such rather than promised away.",
  },
  {
    id: "rs-stop-marketing",
    request: "Stop sending me offers. I stayed once and I do not want to hear from you again.",
    requestType: "withdraw-marketing",
    who: "A past guest still receiving campaign emails, WhatsApp broadcasts and cross-brand launch offers",
    reachesNodeIds: [
      "loyalty-marketing-platform",
      "guest-profile-system",
      "guest-messaging-platform",
      "ad-analytics-platform",
      "marketing-agency-export",
      "staff-phone-whatsapp",
      "loyalty-programme",
      "enquiry-lead-sheet",
    ],
    blockedNodeIds: ["booking-channel-platform", "ex-staff-device"],
    steps: [
      "Record the withdrawal against the master guest record, not against the campaign it came from.",
      "Put them on one suppression list that every channel has to check before it sends.",
      "Remove them from the ad platform's custom and lookalike audiences - unsubscribing from email does not touch these.",
      "Tell the agency to drop them from its own export and stop re-importing the version it holds.",
      "Take them off the broadcast list on the manager's personal phone, which is a separate place from all of the above.",
      "Keep sending booking and service messages if they still have a stay coming, and keep those clearly separate from promotion.",
    ],
    hardPart:
      "Withdrawal has to travel further than anyone expects. The CRM flag is the easy part; the uploaded audience, the agency's spreadsheet, the loyalty campaign and the WhatsApp broadcast list on somebody's own handset are four separate places that will each keep sending unless dealt with individually.",
  },
  {
    id: "rs-correct-passport-name",
    request: "My name is spelled wrong on the booking and it does not match my passport.",
    requestType: "correction",
    who: "A traveller who has spotted the mismatch, often the day before departure",
    reachesNodeIds: [
      "guest-profile-system",
      "id-document-store",
      "guest-document-pack",
      "booking-channel-platform",
      "accounting-finance-system",
      "loyalty-programme",
      "guest-history-archive",
    ],
    blockedNodeIds: ["partner-vendor-network"],
    steps: [
      "Verify the correct spelling against the document rather than against what the guest typed the second time.",
      "Correct the master guest record first, then every downstream copy - the platform booking, the invoice, the loyalty profile and the archive entry.",
      "Reissue the itinerary or confirmation pack rather than leaving the old version circulating.",
      "Tell each supplier and partner that already holds the wrong version, and confirm each has updated it.",
      "Keep a note of what was changed and when, so the amendment history stays intact.",
      "Correct the duplicate records too - the same guest usually exists in three systems with three spellings.",
    ],
    hardPart:
      "A correction is only as good as the number of copies it reaches, and this sector makes copies faster than any other in the series. A ticketed record in a carrier's system may not be amendable at all, and the transfer vendor and the partner hotel will keep using whatever was in the sheet they were sent.",
  },
  {
    id: "rs-delete-cancelled-booking",
    request: "I cancelled the booking and never stayed. Why do you still have my details?",
    requestType: "erasure",
    who: "Someone who enquired or booked, cancelled, and is now being marketed to",
    reachesNodeIds: [
      "guest-profile-system",
      "enquiry-lead-sheet",
      "id-document-store",
      "loyalty-marketing-platform",
      "staff-phone-whatsapp",
      "guest-history-archive",
      "cloud-backup",
    ],
    blockedNodeIds: ["booking-channel-platform", "ad-analytics-platform"],
    steps: [
      "Check whether a stay or a trip ever happened. If it did not, there is very little you have grounds to keep.",
      "Delete the enquiry record, the lead-sheet rows and the archive entry - all three, not only the one you were looking at.",
      "Clear any documents that were sent during booking, including the ones sitting in the chat thread.",
      "Remove them from campaign lists and any audience already uploaded.",
      "Keep the refund or cancellation-fee record if money actually moved, and only that.",
      "Keep a minimal suppression entry so they are not re-imported the next time a list is loaded.",
    ],
    hardPart:
      "This is the request the business model resists. An unconverted enquiry is exactly what the guest-history archive exists to hold, so deleting it feels like destroying an asset - which is why it needs to be a retention rule running on a clock, not a decision taken guest by guest.",
  },
  {
    id: "rs-corporate-coordinator",
    request: "I have changed jobs. Stop sending my travel details to my old company's travel desk.",
    requestType: "authorisation-change",
    who: "An employee whose bookings were made and paid for by an employer who should no longer receive them",
    reachesNodeIds: [
      "guest-profile-system",
      "corporate-travel-account",
      "corporate-expense-platform",
      "accounting-finance-system",
      "loyalty-marketing-platform",
      "guest-messaging-platform",
    ],
    steps: [
      "Confirm the request comes from the traveller, not from either employer.",
      "Separate the person from the corporate account: the traveller record stays, the employer link and the billing instruction do not.",
      "Stop the itemised folio and expense export going to the old travel desk from the next booking onwards.",
      "Check whether their loyalty profile is tied to the corporate account, and untie it if it is.",
      "Keep the historic invoices that were genuinely issued to the employer - those are the employer's records, not something you can rewrite.",
      "Confirm to the traveller what will continue to be visible to the old employer and what will not.",
    ],
    hardPart:
      "Corporate and personal travel are usually the same record with a billing flag, so unpicking them means deciding which past trips were the employer's business and which were never theirs to see. The itemised folio is the part that causes the complaint: an employer needs an amount, and what they were sent was a line-by-line account of the bar, the spa and the second guest.",
  },
  {
    id: "rs-cctv-wifi-record",
    request: "What CCTV, Wi-Fi and door-entry records do you have of my stay?",
    requestType: "access",
    who: "A guest who has realised how much of the stay was recorded, sometimes after a dispute",
    reachesNodeIds: [
      "movement-access-trail",
      "cctv-archive",
      "wifi-captive-portal",
      "visitor-parking-register",
      "guest-profile-system",
      "refund-dispute-file",
    ],
    blockedNodeIds: ["operations-whatsapp-group"],
    steps: [
      "Establish the dates and the room, then work out which systems could hold anything for that window.",
      "Check what still exists - much of it may already have been overwritten, and saying so is a legitimate answer.",
      "Tell them what each system records and how long it is kept, in plain terms.",
      "Where footage shows other guests, give what can be given without disclosing them.",
      "Say who has viewed or exported anything relating to them, if you can establish it.",
      "Use the request as the prompt to set the retention period you did not have.",
    ],
    hardPart:
      "Most properties cannot answer this without going and looking, because nobody set a retention period and nobody logs who views what. And the honest answer is uncomfortable: the systems know which door was opened at what time far more precisely than anyone realised when they were installed.",
    businessModels: HOTEL,
  },
  {
    id: "rs-group-list-exposure",
    request: "Why did everybody on the tour get a sheet with my room number and my mother's medical details?",
    requestType: "complaint",
    who: "A traveller who received the group pack and found their own private details in everyone else's copy",
    reachesNodeIds: [
      "guest-document-pack",
      "staff-phone-whatsapp",
      "guest-profile-system",
      "complaint-support-desk",
      "physical-file-store",
    ],
    blockedNodeIds: ["partner-vendor-network", "ex-staff-device"],
    steps: [
      "Establish exactly which version went out, to whom, and through how many channels.",
      "Stop the circulating version: revoke the link, remove the file from the group, and recall the printed copies you can.",
      "Reissue traveller-specific documents so nobody needs the combined sheet.",
      "Tell the affected travellers what was disclosed - they will find out anyway, and the group chat is where they will discuss it.",
      "Take the health, accessibility and emergency details out of the shared pack permanently and keep them on a need-to-know sheet.",
      "Record it as an incident even if nobody escalates it further.",
    ],
    hardPart:
      "The sheet cannot be recalled. It was emailed, forwarded, dropped in a group and printed, and every recipient still has it. The fix is not retrieval - it is never producing a combined document again, which means changing how the trip is packed rather than apologising for one instance of it.",
    businessModels: TRAVEL,
  },
];

export const HOTELS_TRAVEL_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "is-passport-wrong-number",
    title: "A passport copy was sent to the wrong WhatsApp number",
    trigger: "A stranger replies to say they have received somebody's passport, or the guest calls having been told by a friend",
    severity: "critical",
    involvedNodeIds: ["staff-phone-whatsapp", "id-document-store", "guest-profile-system", "complaint-support-desk"],
    containment: [
      "Delete the message for everyone immediately - the window is short, so do this before anything else.",
      "Establish exactly what was sent, to which number, and whether it was forwarded on.",
      "Ask the recipient to delete it, in writing, and keep their reply.",
      "Check whether the same file was sent to any other wrong recipient in the same thread.",
    ],
    thenWhat: [
      "Tell the guest what happened, what was in it and what you have done - before they hear it from someone else.",
      "Write down the facts: the file, the recipient, the time, the steps taken and the outcome.",
      "Assess whether the exposure needs to be escalated, and record the reasoning either way.",
      "Check whether the document needed to be held at all, and delete the remaining copies if not.",
    ],
    prevention:
      "Stop sending identity documents through personal chat in either direction. A controlled upload link into the booking record removes both the wrong-number risk and the copy that stays on the handset.",
  },
  {
    id: "is-room-disclosed",
    title: "A guest's room number was given to someone who should not have had it",
    trigger: "The guest reports an unexpected caller or visitor at the door, or complains at the desk",
    severity: "critical",
    involvedNodeIds: ["guest-profile-system", "movement-access-trail", "operations-whatsapp-group", "visitor-parking-register", "complaint-support-desk"],
    containment: [
      "Move the guest to another room straight away if they want it, and reissue the key.",
      "Cancel the old key credential so it opens nothing.",
      "Establish who disclosed it and through which channel - the desk, a phone call, a delivery, or the shift group.",
      "Check the visitor register and door log for what actually happened.",
    ],
    thenWhat: [
      "Support the guest first, including involving the authorities if they want that.",
      "Review who can see room allocations and why so many people currently can.",
      "Record the incident, the disclosure route and the corrective action.",
      "Brief the team on never confirming a guest's presence or room to a caller.",
    ],
    prevention:
      "Treat the room number as the most operationally sensitive field you hold. Never confirm a guest's presence to anyone, keep room allocations out of the shift chat, and make refusing a caller the default rather than a judgement call.",
    businessModels: HOTEL,
  },
  {
    id: "is-itinerary-wrong-recipient",
    title: "A full itinerary or arrival pack was emailed to the wrong guest",
    trigger: "A guest replies saying the attachment is not theirs - and lists what it contains",
    severity: "high",
    involvedNodeIds: ["guest-document-pack", "guest-profile-system", "staff-phone-whatsapp", "complaint-support-desk"],
    containment: [
      "Recall the message where the system allows it, and ask the recipient to delete it and confirm.",
      "Work out exactly whose details were in the file - usually more people than the one it was addressed to.",
      "Check whether the same pack went to any other wrong recipient in the same send.",
      "Send the correct document to the person who should have had it.",
    ],
    thenWhat: [
      "Tell everyone whose details were in the attachment, not only the person it was addressed to.",
      "Record what was disclosed and to whom.",
      "Check whether the pack needed to contain everybody's details in the first place.",
      "Review how documents are addressed and attached before sending.",
    ],
    prevention:
      "Generate traveller-specific documents from the system rather than editing a master file per booking, and use expiring links instead of attachments so a misdirected document can be switched off.",
  },
  {
    id: "is-ex-staff-export",
    title: "A departed employee still has the guest list",
    trigger: "Former guests report being contacted by a competitor, or a colleague mentions the export was taken",
    severity: "critical",
    involvedNodeIds: ["ex-staff-device", "ex-staff-person", "loyalty-marketing-platform", "enquiry-lead-sheet", "staff-phone-whatsapp", "guest-history-archive"],
    containment: [
      "Close every account, extranet login and shared credential the person had, including the ones nobody remembers.",
      "Establish what was exported and when, from the system logs if they exist.",
      "Remove them from every operational and vendor WhatsApp group.",
      "Write to them setting out what must be deleted and ask for confirmation.",
    ],
    thenWhat: [
      "Work out whose data is in what they hold - guests, companions and identity documents, not just contact numbers.",
      "Record the incident and what you were and were not able to recover.",
      "Review who else currently holds an export nobody approved.",
      "Decide whether affected guests should be told, and record the reasoning.",
    ],
    prevention:
      "Prevent the copy rather than chasing it: restrict who can export, block media auto-save on work chat accounts, and make a documented offboarding - accounts closed, groups cleared, work profile wiped - a condition of the last working day.",
  },
  {
    id: "is-open-booking-sheet",
    title: "The shared booking spreadsheet turned out to be open to anyone with the link",
    trigger: "Someone outside the business mentions they can see it, or it surfaces in a search result",
    severity: "high",
    involvedNodeIds: ["enquiry-lead-sheet", "guest-profile-system", "staff-laptop", "loyalty-marketing-platform"],
    containment: [
      "Change the sharing setting to named access immediately - do not wait to work out who saw it.",
      "Check the file's own access history for who opened it and from where.",
      "Look for copies and downloads that were made while it was open.",
      "Check whether any other operational sheet has the same setting.",
    ],
    thenWhat: [
      "Work out how many guests were in it and what fields it carried.",
      "Record what was exposed, for how long, and what you could establish about access.",
      "Move the intake record into the reservation system so the sheet stops being the master.",
      "Decide whether guests need to be told, based on what the sheet actually contained.",
    ],
    prevention:
      "Shared sheets default to convenience, not to safety. Keep guest data out of them entirely, and audit the sharing settings of every operational file rather than assuming the default was safe.",
  },
  {
    id: "is-group-list-public",
    title: "A group or rooming list was posted where anyone could see it",
    trigger: "A traveller finds it in a public group, on a noticeboard or attached to a shared album",
    severity: "high",
    involvedNodeIds: ["guest-document-pack", "partner-vendor-network", "staff-phone-whatsapp", "physical-file-store", "complaint-support-desk"],
    containment: [
      "Take it down from wherever it is posted and ask any partner who reposted it to do the same.",
      "Establish which version it was and how many travellers it named.",
      "Collect and destroy the printed copies at the hotel desk and with the guides.",
      "Stop the same file circulating for the remainder of the trip.",
    ],
    thenWhat: [
      "Tell the travellers named on it what was visible, including the room allocations.",
      "Record the incident, the partners involved and what each has confirmed.",
      "Remove health, accessibility and emergency details from any shared operational document.",
      "Review what each partner genuinely needs and reduce what they are sent.",
    ],
    prevention:
      "Never produce a document that lists every traveller. Give each partner only the rows relevant to their part of the trip, and keep medical and emergency details on a separate sheet that goes to one named person.",
    businessModels: TRAVEL,
  },
  {
    id: "is-cctv-forwarded",
    title: "CCTV footage of a guest was forwarded outside security",
    trigger: "The guest hears about it, or the clip surfaces in a staff group",
    severity: "high",
    involvedNodeIds: ["cctv-archive", "movement-access-trail", "operations-whatsapp-group", "staff-phone-whatsapp", "complaint-support-desk"],
    containment: [
      "Get the clip removed from every chat and device it reached, and ask for confirmation.",
      "Establish who exported it, when, and on whose instruction.",
      "Check whether it was shared beyond the business.",
      "Restrict export rights on the recorder immediately.",
    ],
    thenWhat: [
      "Tell the guest what was recorded, who saw it and what has been done.",
      "Check whether other guests appear in the footage and were disclosed alongside them.",
      "Record the incident and the access route that allowed it.",
      "Review who holds recorder credentials and remove the ones nobody can justify.",
    ],
    prevention:
      "Surveillance needs a written purpose, named accounts and an export log. Requests for footage should go through one person, be recorded with a reason, and never be met by sending a clip to a phone.",
    businessModels: HOTEL,
  },
  {
    id: "is-vendor-retains-documents",
    title: "A partner or guide is still holding guests' passports and lists",
    trigger: "A guest is contacted directly by a vendor, or a partner mentions having the file when asked for something else",
    severity: "high",
    involvedNodeIds: ["partner-vendor-network", "guest-document-pack", "id-document-store", "staff-phone-whatsapp", "complaint-support-desk"],
    containment: [
      "Ask what they hold, in writing, and get a list rather than an assurance.",
      "Ask for deletion and keep the confirmation.",
      "Stop sending that partner anything beyond what the job needs, starting today.",
      "Check which other partners were sent the same file.",
    ],
    thenWhat: [
      "Work out how many guests are affected and what was in what each partner received.",
      "Record the incident and what each partner has confirmed.",
      "Add deletion terms to the agreements of the partners you use repeatedly.",
      "Decide whether the affected guests should be told, and record the reasoning.",
    ],
    prevention:
      "This is the hardest thing in the sector to fix afterwards and the easiest to prevent. Send each partner only the rows and fields their job needs, use a booking reference instead of the guest's number where they have no reason to call, and never forward identity documents into a vendor group.",
  },
];

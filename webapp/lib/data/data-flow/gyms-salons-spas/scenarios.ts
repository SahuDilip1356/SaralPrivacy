// What happens when someone asks - and what happens when it has already gone
// wrong. Both are shared, optional sections driven entirely by pack content.
//
// The honest half of every rights scenario is `blockedNodeIds`. A walkthrough
// that implied every copy was reachable would be worse than no walkthrough at
// all - the whole point of this map is that a gym, salon or spa usually CANNOT
// reach the staff member's personal phone, the freelancer's camera roll, the
// photographer's raw archive, the franchisee's own export, the re-shares of an
// Instagram post, or the backups.
//
// A note on WHO may ask. Most requests here come from the customer themselves -
// but this sector also hears from a bride about an album, a parent about a
// minor member, and one half of a couple booking about the other half's
// details. The `who` field carries that.
//
// Scenarios referencing model-gated systems are gated to the same models, so a
// salon is never shown a walkthrough about a biometric turnstile it does not
// have. Union: 10 rights + 11 incidents, landing 8/7/7 and 9/7/8 per model.
//
// ⛔ Language locks (spec §8): no medical, fitness or beauty advice; no
// accusation - the walkthroughs describe how requests meet reality, not how the
// trade misbehaves.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

const GYM = ["gym"];
const SALON = ["salon"];
const SPA = ["spa"];
const GYM_SPA = ["gym", "spa"];

export const GYMS_SALONS_SPAS_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-remove-photo",
    request: "Take my before-and-after photos off Instagram",
    requestType: "remove-media",
    who: "A customer who said yes to a camera once - often years ago, often before a job, a marriage or a change of circumstances made a public body photo genuinely unwelcome.",
    reachesNodeIds: ["photo-media-library", "social-media-pages", "marketing-agency", "management-software"],
    blockedNodeIds: ["staff-personal-phone", "cloud-backup"],
    steps: [
      "Record the withdrawal against the customer and mark their publication choice as withdrawn, so the image cannot be re-used in next season's campaign.",
      "Take the posts down from every channel and every surface - the feed, the reels, the story highlights, the website gallery, the pinned testimonials.",
      "Pull the image from any advertisement it seeded and pause the audiences built from it.",
      "Tell the marketing agency in writing to delete their working copies, and get confirmation.",
      "Remove the pair from the internal library and the draft folders, so it cannot resurface through habit.",
      "Confirm to the customer what was removed - and say plainly what cannot be.",
    ],
    hardPart:
      "The copies that are already loose. A transformation post that performed well has been re-shared, screenshotted and cached; the original shot is still in whichever staff phone took it; and the backup keeps the gallery for a cycle nobody documented. Removal is real but partial, and saying so honestly beats implying the image is gone.",
  },
  {
    id: "rs-access-everything",
    request: "Show me everything you hold about me",
    requestType: "access",
    who: "A customer or member - often after a dispute, sometimes simply after realising how much the business has seen over the years.",
    reachesNodeIds: [
      "management-software",
      "booking-app",
      "health-declaration-forms",
      "body-assessment-records",
      "service-history-register",
      "photo-media-library",
      "pos-billing",
      "whatsapp-business-inbox",
    ],
    blockedNodeIds: [
      "staff-personal-phone",
      "staff-notebook",
      "staff-whatsapp-group",
      "booking-marketplace",
      "cloud-backup",
    ],
    steps: [
      "Verify who is asking against the record - not just the number the message came from.",
      "Pull the profile and appointment history from the management software and the booking app.",
      "Retrieve the health declaration, the assessment and measurement records, and the running service history - including the staff observations, which the customer is entitled to see.",
      "Collect the photographs and videos held in the library, published or not, and the consent status of each.",
      "Add the billing history and the WhatsApp thread with the business number.",
      "Name the third parties the data has gone to - the marketplace, the franchise platform, the agency, the campaign tools - and say plainly which places you could not search.",
    ],
    hardPart:
      "The places that are nobody's system. The trainer's notebook, the stylist's phone, the staff group's history - the realest record of the relationship is exactly the part the business cannot query, so the honest answer lists what was searched and admits what was not.",
  },
  {
    id: "rs-correct-health",
    request: "My health record with you is wrong - correct it",
    requestType: "correction",
    who: "A customer whose declaration has gone stale - the injury that healed, the medication that stopped, the allergy that was recorded against the wrong person.",
    reachesNodeIds: ["health-declaration-forms", "management-software", "body-assessment-records", "service-history-register"],
    blockedNodeIds: ["staff-whatsapp-group", "staff-personal-phone", "staff-notebook"],
    steps: [
      "Verify the requester, then correct the declaration itself - a fresh form, not a margin note on the old one.",
      "Update the copy typed into the management software, so the profile every login shows carries the corrected answer.",
      "Correct the assessment records and any caution notes derived from the old answer.",
      "Check the service history for entries that repeat the outdated detail, and amend them.",
      "Tell the professionals who serve this customer that the record changed - the correction is pointless if the team keeps working from memory.",
      "Record what was corrected and when.",
    ],
    hardPart:
      "The copies that do not sync. The caution posted to the staff group months ago, the photo of the old form in someone's camera roll, the note in a personal diary - each still says the old thing, and no correction workflow reaches them. The fix that works is habit: the team checks the record, not their memory.",
  },
  {
    id: "rs-trainer-left",
    request: "My trainer left and still has my number - and apparently my records",
    requestType: "complaint",
    who: "A member being messaged by a former staff member's new business - offers from a gym they never joined, referencing goals they never told it.",
    reachesNodeIds: ["management-software", "booking-app", "staff-whatsapp-group"],
    blockedNodeIds: ["staff-personal-phone", "staff-notebook"],
    steps: [
      "Log the complaint formally, with a named owner - this is a disclosure incident, not a staffing anecdote.",
      "Confirm what the former staff member could reach while employed, and revoke anything still open: software logins, the booking app, shared credentials.",
      "Remove them from the staff group and any channel that still carries customer information.",
      "Write to the former staff member requiring deletion of customer data taken on exit, referencing whatever the employment terms say.",
      "Tell the member honestly what the business can and cannot enforce, and offer to re-key their preferences to a new professional.",
      "Fix the leak for next time: exit checklist, access revocation on the day, and the client-list question settled in writing at hiring.",
    ],
    hardPart:
      "The phone is theirs. The numbers, the chat threads and the notes were on a personal device all along, so there is nothing to revoke - only a demand letter with whatever force the contract gives it. The real fix happened, or did not happen, on the day they were hired.",
  },
  {
    id: "rs-delete-measurements",
    request: "Delete my body measurements - I only came for three months",
    requestType: "erasure",
    who: "A former member who tried the gym, left, and does not want a time series of their body sitting in a business they no longer visit.",
    reachesNodeIds: [
      "body-assessment-records",
      "body-composition-machine",
      "trainer-workout-app",
      "member-app",
      "management-software",
    ],
    blockedNodeIds: ["staff-personal-phone", "staff-notebook", "wearable-integration", "cloud-backup"],
    steps: [
      "Separate what must be kept from what merely has been: the invoice has retention grounds, the body-fat trend of a lapsed member has none.",
      "Delete the assessment records - the measurements, the printouts, the trend.",
      "Clear the member's profile from the body-composition machine, and ask the device vendor to delete the copy in its cloud app.",
      "Delete the programme and logs in the workout app, and close the member-app account rather than suspending it.",
      "Remove the measurement fields from the management-software profile, keeping only what billing genuinely needs.",
      "Confirm to the member what was deleted, what was kept and why, and when the backup cycle will clear the rest.",
    ],
    hardPart:
      "The vendor copies. The machine's cloud app and the wearable platform each hold their own version under their own terms, and the business can request deletion but not perform it. The honest confirmation says 'deleted here, requested there' - with dates.",
    businessModels: GYM,
  },
  {
    id: "rs-stop-whatsapp",
    request: "Stop the WhatsApp offers",
    requestType: "withdraw-marketing",
    who: "A customer - current or long gone - whose lock screen keeps announcing festival packages from a business they visited twice.",
    reachesNodeIds: [
      "whatsapp-broadcast",
      "sms-email-platform",
      "ad-platform",
      "loyalty-program",
      "lead-spreadsheet",
      "management-software",
    ],
    blockedNodeIds: ["marketing-agency", "franchise-dashboard", "staff-personal-phone"],
    steps: [
      "Record the withdrawal against the person, permanently - not against one campaign.",
      "Add them to the suppression list and make every channel check it before sending: WhatsApp, SMS, email, the loyalty platform.",
      "Remove them from the broadcast lists and delete their row from the follow-up spreadsheets, so the next export does not resurrect them.",
      "Take them out of any ad audience already uploaded, and out of the lookalike seeds.",
      "Keep the service messages working - the appointment reminder is not marketing and should not break.",
      "Confirm the withdrawal and what it does not cover.",
    ],
    hardPart:
      "The saved copies. Campaigns get built from old exports on the agency's laptop, the franchise platform and someone's phone, and each of those lists still contains the customer. Unless every send starts from the live suppressed base, the opt-out lasts exactly until the next Diwali blast.",
  },
  {
    id: "rs-remove-fingerprint",
    request: "Remove my fingerprint from the turnstile",
    requestType: "erasure",
    who: "A member leaving the gym - or one who has read about a biometric leak and realised what they enrolled.",
    reachesNodeIds: ["biometric-access", "rfid-card-system", "management-software"],
    blockedNodeIds: ["cctv-dvr", "cloud-backup"],
    steps: [
      "Delete the biometric template from the access device and its admin console - not just deactivate the membership.",
      "Ask the access-control vendor in writing to confirm no template copy remains on its servers or in its backups.",
      "Close the access-card record and the locker assignment.",
      "Keep the plain attendance history only as long as billing genuinely needs it.",
      "Offer the card alternative if the member is staying but withdrawing the biometric.",
      "Record the deletion and the vendor's confirmation.",
    ],
    hardPart:
      "Proving a negative. The template lives in a vendor-managed device the gym does not administer deeply, and 'deleted' is a claim the gym passes on rather than verifies. A credential the member cannot change deserves better - which is the argument for enrolling fewer of them.",
    businessModels: GYM,
  },
  {
    id: "rs-couple-separate",
    request: "We booked together - separate my record from theirs",
    requestType: "authorisation-change",
    who: "One half of a couple booking or family membership, usually after the relationship has changed - and with it, what the other person should be able to see or book.",
    reachesNodeIds: ["management-software", "booking-app", "pos-billing"],
    blockedNodeIds: ["whatsapp-business-inbox", "cloud-backup"],
    steps: [
      "Verify the requester and take the instruction from them alone - the other party's convenience is not a reason to keep the records joined.",
      "Split the shared profile: separate contact details, separate appointment histories, separate preferences.",
      "Unlink the billing so one person's payments and packages stop appearing on the other's record.",
      "Remove the other party as an emergency or authorised contact where the requester says so.",
      "Check who the booking confirmations and reminders actually go to, and repoint them.",
      "Record the change so a helpful receptionist does not quietly re-merge the records later.",
    ],
    hardPart:
      "The history. Years of joint bookings, one WhatsApp thread carrying both people's messages, invoices naming them together - the past cannot be unshared, only the future. The workable promise is that from today, each record stands alone.",
  },
  {
    id: "rs-bridal-portfolio",
    request: "I never agreed to be in the bridal portfolio",
    requestType: "remove-media",
    who: "A bride - months after the wedding, on finding her makeup trial and ceremony photographs presented as the salon's showcase, sometimes on a freelancer's page too.",
    reachesNodeIds: ["photo-media-library", "social-media-pages", "photographer-archive", "marketing-agency"],
    blockedNodeIds: ["freelancer-phone", "staff-personal-phone"],
    steps: [
      "Record the objection and check what consent was actually taken for the event - usually a booking form that never mentioned marketing at all.",
      "Remove the images from the salon's pages, gallery, highlights and website portfolio.",
      "Tell the photographer in writing to stop using the frames and to confirm deletion of the unselected raws.",
      "Tell the marketing agency to pull the images from drafts and scheduled posts.",
      "Write to the freelance artists on the booking requiring the images off their portfolios and pages.",
      "Confirm to the bride what came down, what deletion was confirmed where - and what sits beyond the salon's reach.",
    ],
    hardPart:
      "The freelancers' pages. The artist and the photographer treat wedding work as their portfolio by trade custom, their contracts rarely say otherwise, and their copies are on their own devices. The salon can demand, follow up and stop rebooking them - but it cannot reach into their galleries.",
    businessModels: SALON,
  },
  {
    id: "rs-hotel-privacy",
    request: "Don't tell the hotel - or my employer - what treatment I had",
    requestType: "complaint",
    who: "A spa guest whose visit came through a hotel concierge or a corporate wellness programme, and who assumed the treatment itself was between them and the therapist.",
    reachesNodeIds: ["pos-billing", "management-software"],
    blockedNodeIds: ["hotel-pms", "corporate-wellness-portal"],
    steps: [
      "Check what the folio line and the programme report actually say today - the complaint is usually right.",
      "Change the billing descriptions to neutral wording: a spa service, an amount, nothing more.",
      "Strip treatment names from the corporate usage report; the employer paying for attendance is owed attendance, not detail.",
      "Mark the guest's record so future charges and reports stay neutral.",
      "Ask the hotel and the programme coordinator to correct the entries already made, and record the request.",
      "Tell the guest what was changed and what the partner systems still hold.",
    ],
    hardPart:
      "The entries already posted. The hotel's folio and the employer's report are their systems, not the spa's - the spa can ask for a correction and can stop feeding detail from today, but yesterday's line item is now part of someone else's record.",
    businessModels: SPA,
  },
];

export const GYMS_SALONS_SPAS_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-photo-posted",
    title: "A customer's before-and-after went up without approval",
    trigger:
      "The customer sees themselves on the business's Instagram - or a friend sends it to them - and calls, upset, because nobody asked about that photo, that channel, or that crop.",
    severity: "critical",
    involvedNodeIds: ["photo-media-library", "social-media-pages", "staff-personal-phone", "marketing-agency"],
    containment: [
      "Take the post down immediately, from every channel, story highlight and gallery page it appears on.",
      "Stop any advertisement using the image and pause the audience built from it.",
      "Check what else from the same shoot is queued in drafts or with the agency, and freeze it.",
    ],
    thenWhat: [
      "Tell the agency in writing to delete their copies, and get confirmation.",
      "Record the customer's publication choice as refused, so the image cannot resurface next campaign.",
      "Tell the customer exactly what was removed and what cannot be - re-shares, screenshots, caches.",
      "Fix the gap: no post without a recorded, channel-specific consent checked first.",
    ],
    prevention:
      "A per-customer publication choice - purpose, channel, identity visibility, expiry - recorded at capture and checked before every post, with one named person owning the checking.",
  },
  {
    id: "in-staff-left-list",
    title: "A departing staff member took the client list",
    trigger:
      "Customers start reporting messages from a competitor that knows their name, their usual service and their renewal date - three weeks after a trainer or stylist resigned.",
    severity: "high",
    involvedNodeIds: ["staff-personal-phone", "service-history-register", "management-software", "whatsapp-business-inbox"],
    containment: [
      "Revoke every access the former staff member still has - software logins, the booking app, shared credentials, the staff group.",
      "Check the access logs for exports and bulk reads in the weeks before the exit.",
      "Write to the former staff member requiring deletion of customer data and cessation of contact, on whatever terms the contract gives.",
    ],
    thenWhat: [
      "Work out what actually left: a software export, or simply the phone they always worked from.",
      "Tell affected customers honestly that a former staff member retained their contact details, and what the business is doing.",
      "Rotate the shared logins that made the export invisible, and replace them with named accounts.",
      "Put the client-list question - and the exit checklist - into the employment terms for everyone hired next.",
    ],
    prevention:
      "Business-owned channels for customer contact from day one, named logins with export alerts, and staff exit treated as a data event with access revoked the same day.",
  },
  {
    id: "in-health-form-exposed",
    title: "A health declaration was posted into the staff group",
    trigger:
      "A customer learns that staff who never treat them know about a condition they declared in confidence - the caution note travelled further than the treatment ever did.",
    severity: "high",
    involvedNodeIds: ["health-declaration-forms", "staff-whatsapp-group", "management-software"],
    containment: [
      "Delete the message from the group and ask every member to confirm deletion from their own chat history.",
      "Check what else about this customer - and others - has been posted to the group over time.",
      "Move the operational need (the caution the therapist genuinely required) into the official record, scoped to the treating professional.",
    ],
    thenWhat: [
      "Tell the customer what was shared, with whom, and what has been done.",
      "Audit group membership and remove everyone who has left the business.",
      "Set the written rule: rosters and logistics in the group, never a named customer joined to health detail.",
      "Log it as an incident with a cause and an owner - not as chat that went slightly wrong.",
    ],
    prevention:
      "Health cautions travel person-to-person in the official tool, scoped and logged; the staff group carries schedules, not customers.",
  },
  {
    id: "in-wrong-photo",
    title: "A progress photo was sent to the wrong customer",
    trigger:
      "Two customers with similar names, one WhatsApp thread each - and one of them opens a photograph of a stranger's body, taken in a changing area they recognise.",
    severity: "high",
    involvedNodeIds: ["whatsapp-business-inbox", "staff-personal-phone", "photo-media-library"],
    containment: [
      "Ask the recipient to delete the image and confirm - and check whether anything else went to the wrong thread before it.",
      "Verify the correct customer's details and fix whatever mismatch caused the swap - a duplicate contact, an autofilled name.",
      "Check the sending device: if it was a personal phone, the photo is also in that camera roll now.",
    ],
    thenWhat: [
      "Tell the customer whose photo travelled - they are the injured party, and they should hear it from the business first.",
      "Record the incident with its cause: usually a gallery full of unlabelled bodies and a chat app full of similar names.",
      "Move progress photos out of general galleries and chat threads into per-customer records.",
      "Retrain on the habit: photos are records, not attachments.",
    ],
    prevention:
      "Photographs stored against the customer record with names attached, sent only from the business account, with a second-glance rule before anything leaves a thread.",
  },
  {
    id: "in-cctv-clip",
    title: "A CCTV clip ended up in the staff WhatsApp group",
    trigger:
      "Something funny or dramatic on the gym floor gets exported from the DVR and shared 'internally' - and a member recognises themselves in a clip that is now in a dozen camera rolls.",
    severity: "high",
    involvedNodeIds: ["cctv-dvr", "staff-whatsapp-group", "staff-personal-phone"],
    containment: [
      "Ask everyone who received the clip to delete it and confirm, and stop any further forwarding.",
      "Preserve the original footage and the DVR access log before the loop overwrites them.",
      "Change the DVR credentials - if the export happened casually, the password is common knowledge.",
    ],
    thenWhat: [
      "Establish who exported it, how, and whether an export route should exist at all.",
      "Tell the member who was identifiable in the clip.",
      "Set the written rule: footage never enters chat apps, and every export needs a recorded reason.",
      "Check camera placement while you are at it - the incident is a free audit prompt.",
    ],
    prevention:
      "Named DVR accounts with logged exports, a short configured retention, no DVR app on personal phones, and a standing rule that footage moves only through a recorded release process.",
    businessModels: GYM_SPA,
  },
  {
    id: "in-biometric-exposed",
    title: "The biometric attendance database was exposed",
    trigger:
      "The access-control vendor reports a breach - or the gym discovers the turnstile's admin panel has been reachable from the internet with a default password all along.",
    severity: "critical",
    involvedNodeIds: ["biometric-access", "management-software", "cloud-backup"],
    containment: [
      "Take the admin panel off the open internet and change every credential on the device and its vendor account.",
      "Establish what the system actually stored - templates, photos, entry logs - and for how many members, current and lapsed.",
      "Get the vendor's incident detail in writing: what was reachable, since when, any evidence of access.",
    ],
    thenWhat: [
      "Tell affected members plainly: a fingerprint or face template is a credential they cannot change, and they deserve to know it was exposed.",
      "Delete the templates of every lapsed member the system was still holding - the breach is smaller for every record that should not have been there.",
      "Reassess whether biometric entry is needed at all, and offer the card alternative to anyone who asks.",
      "Record the incident, the vendor's answers, and the deletions.",
    ],
    prevention:
      "Templates deleted on membership exit, named admin accounts, the vendor's retention and security terms in writing - and biometrics enrolled only where a card genuinely will not do.",
    businessModels: GYM,
  },
  {
    id: "in-community-numbers",
    title: "The members' group published everyone's number",
    trigger:
      "A member complains about being messaged privately by a stranger from the gym's community group - two hundred people they never chose to share a number with.",
    severity: "medium",
    involvedNodeIds: ["member-community-group", "staff-personal-phone"],
    containment: [
      "Stop adding members to the group and stop posting member names, results or photos into it.",
      "Acknowledge the complaint and remove the member from the group on request - without removing their access to anything real.",
      "Check what has been posted historically: weigh-ins, rankings, transformation shout-outs with names attached.",
    ],
    thenWhat: [
      "Move announcements to a broadcast channel where members cannot see each other's details.",
      "Get a recorded yes before any member's name, progress or photo appears in community content.",
      "Tell the group what is changing and why - it doubles as the privacy notice nobody read.",
      "Retire the open group rather than trying to moderate it into privacy.",
    ],
    prevention:
      "Broadcast channels for announcements, opt-in for any named recognition, and community built around sessions rather than a phone-number roster.",
    businessModels: GYM,
  },
  {
    id: "in-freelancer-portfolio",
    title: "A freelancer published a client's wedding photos as portfolio",
    trigger:
      "The bride finds her trial and ceremony images on the freelance artist's Instagram - posted from the artist's own copies, promoting the artist's own business.",
    severity: "high",
    involvedNodeIds: ["freelancer-phone", "photo-media-library", "social-media-pages"],
    containment: [
      "Write to the freelancer requiring the posts down and their copies deleted, citing the booking terms.",
      "Check the salon's own pages for images from the same event and the consent behind them.",
      "Freeze further assignments to the freelancer until it is resolved.",
    ],
    thenWhat: [
      "Tell the bride what the salon has demanded, what has come down, and what sits on accounts the salon does not control.",
      "Fix the paperwork: portfolio use, deletion after the event and the customer's choice, written into every freelancer engagement from now on.",
      "Share assignment details through revocable channels rather than WhatsApp forwards, so the next event leaves less behind.",
      "Record the incident and the freelancer's response - it decides who gets booked again.",
    ],
    prevention:
      "Freelancer terms that settle portfolio use and deletion before the first booking, minimum data shared per assignment, and the customer's publication choice travelling with the job.",
    businessModels: SALON,
  },
  {
    id: "in-campaign-reveals",
    title: "A campaign told everyone what its recipients had done",
    trigger:
      "A 'we miss you at your slimming sessions' blast goes to a segmented list - and lands on lock screens, in front of families and colleagues, announcing exactly what each recipient had been buying.",
    severity: "high",
    involvedNodeIds: ["whatsapp-broadcast", "management-software", "service-history-register"],
    containment: [
      "Stop the campaign and any scheduled follow-ups built on the same segment.",
      "Establish who received it and what the message revealed about them.",
      "Check which other saved lists encode service categories the same way.",
    ],
    thenWhat: [
      "Acknowledge complaints honestly - the message put a private purchase on a public screen.",
      "Rewrite campaign rules: neutral wording, no service or health category in segment definitions or message text.",
      "Rebuild lists from the live opted-in base and delete the segmented exports.",
      "Log the incident and the rule change.",
    ],
    prevention:
      "Segments built on recency and value rather than treatment type, neutral message copy, and one person who reads every campaign as its least sympathetic recipient before it sends.",
  },
  {
    id: "in-hotel-folio",
    title: "A treatment appeared on a shared hotel folio",
    trigger:
      "A guest's spouse settles the room bill and reads the treatment name on the folio - a disclosure the guest never imagined when the concierge booked them in.",
    severity: "medium",
    involvedNodeIds: ["hotel-pms", "pos-billing", "corporate-wellness-portal"],
    containment: [
      "Ask the hotel to correct the folio line to neutral wording, and check how the charge was described at source.",
      "Change the spa's billing descriptions so the next charge posts as a generic spa service.",
      "Review what the corporate programme reports carry, while the same wording habit is in view.",
    ],
    thenWhat: [
      "Apologise to the guest without restating the detail, and tell them what has changed.",
      "Agree neutral line-item wording with the hotel as a standing arrangement, not a one-off favour.",
      "Strip treatment names from partner-facing reports; attendance and amount are all a payer needs.",
      "Record the incident and the new wording standard.",
    ],
    prevention:
      "Neutral billing descriptions everywhere a charge leaves the spa - folio, programme report, invoice - so discretion survives the accounting.",
    businessModels: SPA,
  },
  {
    id: "in-shared-login-export",
    title: "Someone exported the customer base on the shared login",
    trigger:
      "The software's activity report shows a full customer export at 11pm - attributed to the one shared account the whole team uses, which is to say attributed to nobody.",
    severity: "high",
    involvedNodeIds: ["management-software", "old-customer-archive"],
    containment: [
      "Change the shared password immediately and check for exports and bulk reads before this one.",
      "Establish what the export contained - profiles alone, or health notes, measurements and photos with them.",
      "Narrow who could have run it from shift records, and preserve what the logs do show.",
    ],
    thenWhat: [
      "Replace the shared login with named accounts, role-scoped, with export permissions removed from most of them.",
      "Decide honestly whether affected customers should be told - an export of health and photo data is not an internal matter.",
      "Purge the archive while you are in it: the export was as big as it was because nothing is ever deleted.",
      "Record the incident, the response and the access redesign.",
    ],
    prevention:
      "Named logins, export rights restricted to one accountable role, alerts on bulk reads - and an archive small enough that an export is not a catastrophe.",
  },
];

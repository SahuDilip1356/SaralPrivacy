// What happens when someone asks - and what happens when it has already gone
// wrong. Optional shared sections (lib/data-flow/schemas.ts); fourth pack to
// author them, after schools-colleges, clinics-diagnostic-labs and d2c-brands.
//
// CONTENT ONLY. No component, route or schema work.
//
// THE TRAINING-INSTITUTE DIFFERENCE. The relationship has a defined end - a
// course finishes - and almost nothing stops at that end. The institute's single
// most valuable asset is the STUDENT'S RESULT, and its entire marketing model
// runs on publishing it: the rank, the photograph, the score, the placement, on
// a hoarding, a broadcast list and a social feed. So the sharpest request here
// is not "delete my data", it is "stop using my achievement to sell your
// course". That is `rs-remove-result-post`, and it has no real equivalent in the
// other packs.
//
// The second difference is the enquiry list. A coaching enquiry is a commodity
// that gets forwarded between institutes and agents, which is why
// `in-enquiry-list-shared` is ranked as severely as it is.
//
// LANGUAGE LOCK: DPDPA scope only. No claims about what an education board,
// university, skilling authority or examination body requires to be retained,
// and no "sensitive personal data" - the DPDPA creates no such statutory
// category. The incident section is an OPERATIONAL response reference.
//
// Model gating: a classroom institute never sees the proctoring walkthrough, and
// a purely online institute never sees biometrics or CCTV.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const TRAINING_INSTITUTES_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-access-everything",
    request: "Show me everything you hold about me",
    requestType: "access",
    who: "A current or former student - or a parent, who at most institutes is treated as entitled to everything by default.",
    reachesNodeIds: [
      "admission-erp",
      "fee-spreadsheet",
      "certificate-system",
      "placement-portal",
      "cloud-drive",
      "old-records",
      "payment-gateway",
    ],
    blockedNodeIds: ["whatsapp", "staff-devices", "backups", "employer"],
    steps: [
      "Verify who is asking. If the student is an adult, their parent is a separate person with no automatic entitlement to marks, attendance or fee behaviour.",
      "Pull the admission record, fee history, attendance, assessment results and any certificate issued.",
      "Include what the institute created rather than collected: batch ranking, predicted score, follow-up notes made by a counsellor.",
      "Include the enquiry record from before they enrolled - it is usually still there, and they usually do not know it.",
      "Name where the data has gone: employers through placement, the payment provider, any partner institute or agent the enquiry was shared with.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "The counsellor's phone. Enquiries, fee negotiations, doubt-clearing and result announcements all live in WhatsApp threads and personal contacts that cannot be searched, exported or deleted centrally - and when a counsellor moves to a competing institute, that history goes with them.",
  },
  {
    id: "rs-stop-marketing",
    request: "Stop calling and messaging me about your courses",
    requestType: "withdraw-marketing",
    who: "A former student, a parent, or someone who only ever walked in to ask about fees and never enrolled.",
    reachesNodeIds: ["admission-erp", "whatsapp", "old-records", "cloud-drive"],
    blockedNodeIds: ["staff-devices", "employer", "backups"],
    steps: [
      "Record the withdrawal against the person, permanently, rather than against the batch campaign that prompted it.",
      "Suppress across every channel: calls, SMS, WhatsApp broadcast lists and the counsellor's own follow-up list are four different things.",
      "Remove them from the enquiry pool that gets re-worked before every new admission cycle.",
      "Tell counsellors individually - the numbers are saved as contacts on their phones and no central switch reaches those.",
      "Keep genuine course communication working for current students.",
      "Confirm what has stopped, and be honest about what may not.",
    ],
    hardPart:
      "The enquiry list has usually already left. Coaching enquiries are traded between institutes, agents and franchise partners, so a person who asked one institute about fees starts hearing from three - and no suppression you apply reaches the copies already passed on.",
  },
  {
    id: "rs-remove-result-post",
    request: "Take my photo, rank and marks out of your publicity",
    requestType: "remove-media",
    who: "A student or parent - very often years later, when the hoarding is gone but the posts and forwards are not.",
    reachesNodeIds: ["whatsapp", "cloud-drive", "admission-erp", "certificate-system"],
    blockedNodeIds: ["staff-devices", "backups", "old-records", "employer"],
    steps: [
      "Stop any current use immediately - posts, creatives, hoarding artwork, brochures and the batch WhatsApp broadcast.",
      "Record the withdrawal against the student so the next admission season does not reuse the same asset.",
      "Remove the image and result from the shared drive folders campaigns are built from, not just from the live post.",
      "Ask franchise partners, agents and coaching aggregators who reposted it to take it down.",
      "Be clear about what cannot be pulled back - forwards, screenshots and printed material already distributed.",
    ],
    hardPart:
      "Publishing the result IS the business model, so the asset has usually been copied into every campaign folder, forwarded through dozens of parent groups and reposted by partners. And the original permission, if it exists at all, was a line in the admission form signed before the student had any result to publish.",
  },
  {
    id: "rs-now-an-adult",
    request: "I am an adult - stop discussing my marks with my parents",
    requestType: "authorisation-change",
    who: "A student who enrolled as a minor, or whose parent pays the fees and is therefore treated as the account holder.",
    reachesNodeIds: ["admission-erp", "whatsapp", "fee-spreadsheet", "certificate-system"],
    blockedNodeIds: ["parent", "staff-devices", "backups"],
    steps: [
      "Confirm the student's age from the admission record and make them the primary contact.",
      "Separate what the fee-payer legitimately needs - that a payment is due - from what they do not, which is attendance, marks and counselling notes.",
      "Change the number results and attendance alerts are sent to.",
      "Remove the student from parent broadcast groups, or stop posting individual results into them at all.",
      "Tell counsellors, because this is a conversation that happens verbally far more often than it happens in a system.",
      "Record the change so it is not quietly reversed at the next renewal.",
    ],
    hardPart:
      "Whoever pays is treated as the account holder, and nothing in the systems distinguishes the fee-payer from the data principal. There is usually one phone number on the record, and it is the parent's.",
  },
  {
    id: "rs-employer-sharing",
    request: "Do not send my profile to employers",
    requestType: "authorisation-change",
    who: "A student on a placement-linked course who did not realise their whole batch profile was circulated.",
    reachesNodeIds: ["placement-portal", "certificate-system", "admission-erp", "cloud-drive"],
    blockedNodeIds: ["employer", "backups", "old-records"],
    steps: [
      "Remove them from the current batch profile sheet before the next employer share.",
      "Make participation a per-opportunity choice rather than automatic enrolment into placement.",
      "Log which employers have already received their marks, attendance and contact details.",
      "Ask those employers to delete the profile where the student did not apply to them.",
      "Confirm what was already shared and with whom.",
    ],
    hardPart:
      "Placement profiles go out as a batch spreadsheet, so a student who applied nowhere is still in the file every employer received - and each of those employers keeps it indefinitely under no agreement the student ever saw.",
  },
  {
    id: "rs-delete-after-course",
    request: "My course finished two years ago - delete my data",
    requestType: "erasure",
    who: "A former student, usually prompted by still receiving messages about new batches.",
    reachesNodeIds: [
      "admission-erp",
      "old-records",
      "cloud-drive",
      "fee-spreadsheet",
      "placement-portal",
      "whatsapp",
    ],
    blockedNodeIds: ["backups", "employer", "staff-devices", "payment-gateway", "certificate-system"],
    steps: [
      "Separate what has a genuine reason to persist - the certificate record, so it can be verified later - from what merely has never been deleted.",
      "Delete the marketing and enquiry layers first, and suppress the identifiers so a re-import cannot resurrect them.",
      "Clear the batch folders on the shared drive: photographs, result sheets, scanned documents.",
      "Ask staff to remove the student's contact and chat history from personal devices, and confirm.",
      "Write down what is kept, on what ground and for how long.",
      "Give the student that list rather than a blanket yes.",
    ],
    hardPart:
      "Certificate verification is a real reason to keep a core record, and it is also the excuse for keeping everything else. Most institutes have never separated the two, so the honest answer is a short kept list and a long deleted one - and backups and staff phones sit outside both.",
  },
  {
    id: "rs-proctoring-footage",
    request: "Delete the exam recording of me at home",
    requestType: "erasure",
    who: "An online student who has realised the proctoring tool recorded their room, their face and their screen.",
    reachesNodeIds: ["proctoring", "video-platform", "lms", "data-warehouse"],
    blockedNodeIds: ["backups", "cloud-drive"],
    steps: [
      "Establish what was captured and how long the vendor keeps it - most institutes have never asked.",
      "Delete the recordings for that student where the vendor's console allows it.",
      "Check whether an automated suspicion flag was raised, and whether a human ever reviewed it before it affected a result.",
      "Remove the behavioural signals derived from the session if they fed any ranking or profile.",
      "Set a retention period with the vendor in writing rather than relying on their default.",
    ],
    hardPart:
      "It is video of the inside of someone's home, held on a vendor's infrastructure under a setting nobody chose, and the derived suspicion score has usually already been copied into the results system where deleting the video does not reach it.",
    businessModels: ["online", "hybrid"],
  },
  {
    id: "rs-biometric-attendance",
    request: "Delete my fingerprint - I have left the institute",
    requestType: "erasure",
    who: "A former classroom student, often after realising the device is still enrolled with their template.",
    reachesNodeIds: ["biometric-device", "admission-erp", "physical-file", "cctv"],
    blockedNodeIds: ["backups", "old-records"],
    steps: [
      "Confirm whether the template sits on the device, with the vendor, or both.",
      "Delete the enrolment on the device and ask the vendor to confirm removal of any copy they hold.",
      "Detach the biometric identifier from the attendance history you legitimately keep.",
      "Check whether CCTV footage of the student is still retained beyond any defined period, and apply that period.",
      "Make template deletion a standing step when any student leaves, not a request-driven one.",
    ],
    hardPart:
      "A fingerprint cannot be reissued if it leaks, it was usually taken because the device was cheap rather than because attendance required it, and almost no institute has a deletion step at exit - so templates for students who left years ago are still enrolled.",
    businessModels: ["classroom", "hybrid"],
  },
];

export const TRAINING_INSTITUTES_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-enquiry-list-shared",
    title: "The enquiry list was passed to another institute or an agent",
    trigger:
      "A parent asks how a competing institute got their number within a day of them walking into yours.",
    severity: "critical",
    involvedNodeIds: ["admission-erp", "cloud-drive", "staff-devices", "whatsapp"],
    containment: [
      "Establish which list left, how many people were on it, and who sent it.",
      "Ask the recipient to delete it in writing, and confirm.",
      "Stop any ongoing sharing arrangement with agents or partner institutes until it is reviewed.",
    ],
    thenWhat: [
      "Find out whether this was one person's shortcut or an established practice - at coaching institutes it is very often the latter.",
      "Tell the affected families that their enquiry details were passed on, and to whom.",
      "Put a written rule in place: enquiry data does not leave the institute, and counsellors do not keep personal copies.",
      "Restrict who can export the enquiry pool, and log exports.",
    ],
    prevention:
      "Enquiry records held in one system with export restricted and logged, a written prohibition on sharing with agents or partner institutes, and notice at enquiry that says who the data will and will not go to.",
  },
  {
    id: "in-batch-group-exposure",
    title: "A batch WhatsApp group exposed every family's number",
    trigger:
      "A parent complains after being contacted privately by another parent - or by a competing institute.",
    severity: "high",
    involvedNodeIds: ["whatsapp", "staff-devices", "admission-erp"],
    containment: [
      "Stop posting anything about an individual student into the group.",
      "Identify what has already been posted there - results, fee reminders, attendance, absence reasons.",
      "Move essential announcements to a channel where recipients cannot see each other.",
    ],
    thenWhat: [
      "Retire the group rather than trying to repair it: the disclosure happened when it was created.",
      "Set a written rule on what staff may post, about whom, and where.",
      "Tell affected families what was exposed and to whom.",
      "Check the other batches, because they are almost certainly configured the same way.",
    ],
    prevention:
      "Broadcast lists rather than groups so numbers stay hidden, nothing about an individual student posted to any group, and course communication run from an institute-controlled channel rather than a counsellor's handset.",
  },
  {
    id: "in-result-published",
    title: "A student's result and photograph were published without permission",
    trigger:
      "The student or parent sees themselves on a hoarding, a social post or a forwarded creative and objects.",
    severity: "high",
    involvedNodeIds: ["cloud-drive", "whatsapp", "admission-erp", "certificate-system"],
    containment: [
      "Take the post down and stop any print or hoarding run still in progress.",
      "Pull the asset from the campaign folder so it is not picked up again next season.",
      "Ask franchise partners, agents and aggregators who reposted it to remove it.",
    ],
    thenWhat: [
      "Check what permission actually exists - usually a clause in the admission form signed before there was any result.",
      "Make publication a separate, specific and withdrawable choice, captured after the result exists.",
      "Tell the student what has been removed and what cannot be recalled.",
      "Review what is still live from previous years.",
    ],
    prevention:
      "A recorded, per-student publication choice taken at the point of publishing rather than at admission, a working removal route, and asset folders that carry the permission status with the image.",
  },
  {
    id: "in-fee-sheet-forwarded",
    title: "The fee and dues sheet was forwarded outside finance",
    trigger:
      "A teacher or counsellor is found chasing dues from a spreadsheet, or the file surfaces in a staff group.",
    severity: "high",
    involvedNodeIds: ["fee-spreadsheet", "staff-devices", "cloud-drive", "whatsapp"],
    containment: [
      "Recall the file where possible and ask every holder to delete it.",
      "Stop the practice of circulating dues lists to teaching staff.",
      "Check whether it has reached anyone outside the institute.",
    ],
    thenWhat: [
      "Establish what the sheet carried beyond the amount - concession reasons, family circumstances, negotiation notes.",
      "Give staff an action rather than a household's financial position.",
      "Tell affected families if their circumstances were disclosed beyond finance.",
      "Move dues tracking into the system with restricted access.",
    ],
    prevention:
      "Fee records restricted to finance roles, reminders sent from the system rather than a forwarded file, and concession reasoning never leaving finance.",
  },
  {
    id: "in-staff-left-with-data",
    title: "A counsellor left and took the student data with them",
    trigger:
      "Former students start hearing from a competing institute, or a departed counsellor is still in batch groups.",
    severity: "high",
    involvedNodeIds: ["staff-devices", "whatsapp", "cloud-drive", "admission-erp"],
    containment: [
      "Disable their access to the ERP, the shared drive and every institute account immediately.",
      "Remove them from all batch and staff groups.",
      "Ask in writing for deletion of student contacts, chat history and any downloaded files, and get confirmation.",
    ],
    thenWhat: [
      "Check the export and download logs for the period before they left.",
      "Establish how many other former staff still hold access or data - there are usually several.",
      "Tell students and families if their details have demonstrably been used elsewhere.",
      "Make account closure and data deletion a checked step in every exit.",
    ],
    prevention:
      "Institute-owned numbers and accounts rather than personal handsets, restricted and logged exports, named logins throughout, and a departure checklist that someone actually owns.",
  },
  {
    id: "in-certificate-misissued",
    title: "A certificate or verification went to the wrong person",
    trigger:
      "An employer verification call is answered for a student who did not authorise it, or a duplicate certificate is issued to an impostor.",
    severity: "medium",
    involvedNodeIds: ["certificate-system", "old-records", "employer", "admission-erp"],
    containment: [
      "Stop issuing on that request and establish what was released and to whom.",
      "Contact the student whose record was disclosed.",
      "Check whether the same requester has asked about other students.",
    ],
    thenWhat: [
      "Define who may request a verification and what proof of authorisation is required.",
      "Log every verification response - most institutes answer these by phone with no record at all.",
      "Restrict duplicate issuance to identity-verified requests.",
      "Record the incident and the corrective control.",
    ],
    prevention:
      "A written verification process with recorded student authorisation, a log of every response, and identity checks before any duplicate certificate is issued.",
  },
  {
    id: "in-proctoring-leak",
    title: "Exam recordings were viewable by more people than intended",
    trigger:
      "A student mentions that a recording of them was discussed by staff who had no role in the exam.",
    severity: "high",
    involvedNodeIds: ["proctoring", "video-platform", "lms", "support-desk"],
    containment: [
      "Restrict access to the proctoring console to named exam staff only.",
      "Establish who has been viewing recordings and on what basis.",
      "Stop any sharing of clips into staff channels.",
    ],
    thenWhat: [
      "Confirm what the vendor retains, where, and for how long.",
      "Set and configure a retention period rather than leaving the default.",
      "Tell affected students what was accessible and to whom.",
      "Require a documented reason for any review of a recording.",
    ],
    prevention:
      "Named access to the proctoring console with a viewing log, a configured retention limit, no clips leaving the tool, and a human-reviewed process before any flag affects a result.",
    businessModels: ["online", "hybrid"],
  },
  {
    id: "in-cctv-shared",
    title: "Classroom CCTV footage was shared outside the institute",
    trigger:
      "A clip reaches a parent group, or is used to settle a dispute in a way the student objects to.",
    severity: "high",
    involvedNodeIds: ["cctv", "staff-devices", "whatsapp", "printed-marks"],
    containment: [
      "Ask everyone who received the clip to delete it and confirm.",
      "Review who currently has viewing access and remove anyone who does not need it.",
      "Preserve the original and its access log before anything is overwritten.",
    ],
    thenWhat: [
      "Establish who exported it and whether an export route should exist at all.",
      "Tell the students identifiable in the footage.",
      "Set a written rule that footage never goes into messaging apps, with a defined release process for the rare exceptions.",
      "Confirm the retention period is configured rather than merely intended.",
    ],
    prevention:
      "Named individual viewing accounts with a log, no camera app on personal phones, a configured retention limit, and an authorised release process with a recorded reason.",
    businessModels: ["classroom", "hybrid"],
  },
];

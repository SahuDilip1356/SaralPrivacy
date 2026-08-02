// What happens when someone asks - and what happens when it has already gone
// wrong. Both are optional shared sections (schemas.ts); this is the first pack
// to author them.
//
// The honest half of every rights scenario is `blockedNodeIds`. A walkthrough
// that implied every copy was reachable would be worse than no walkthrough at
// all - the whole point of the map is that most institutions cannot reach the
// backups, the vendor platforms, the personal devices, the messaging groups or
// the authority that already received the submission.
//
// A note on WHO may ask. For a student below 18 the guardian exercises the
// child's rights, so almost every request here arrives from a parent. That
// stops being true at 18 - at which point the parent is a third party with no
// automatic entitlement to marks, attendance or counselling records - and
// institutions almost never change anything when a student turns 18. That
// transition is a scenario in its own right rather than a footnote.
//
// Scenarios referencing model-gated systems are gated to the same models, so a
// K-12 school is never shown a walkthrough about a placement portal it does not
// have.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const SCHOOLS_COLLEGES_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-access-everything",
    request: "Show me everything you hold about my child",
    requestType: "access",
    who: "A parent or guardian of a current student - or, once the student is 18, the student themselves.",
    reachesNodeIds: [
      "student-erp",
      "admissions-crm",
      "document-upload",
      "lms",
      "attendance-system",
      "health-record",
      "exam-system",
      "fee-portal",
      "parent-app",
      "paper-admission-file",
    ],
    blockedNodeIds: [
      "reception-whatsapp",
      "teacher-device",
      "parent-whatsapp-group",
      "public-ai-tool",
      "cloud-backup",
      "photography-vendor",
      "board-university-portal",
    ],
    steps: [
      "Verify who is asking and confirm they are the authorised guardian for that student - not simply the number on the record.",
      "Pull the master record from the ERP, and the linked records from the LMS, attendance, examinations, health and fees.",
      "Retrieve the admission file and the documents that were uploaded, including the ones you no longer had a reason to keep.",
      "Include what the institution created rather than collected: teacher observations, ability bands, support plans and any score a platform generated.",
      "Name the third parties the data has been shared with - the board or university, the learning platforms, the photographer, the messaging and payment vendors.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "The parts nobody can search. A year of WhatsApp messages on a counsellor's phone, marks and photographs on a teacher's personal laptop, a class group containing every family's number, and whatever a public AI tool retained - none of these can be queried, so the answer is either incomplete or silently pretends they do not exist.",
  },
  {
    id: "rs-correct-record",
    request: "Correct my child's name, date of birth or my contact details",
    requestType: "correction",
    who: "A parent or guardian, usually after spotting an error on a report card or a board registration.",
    reachesNodeIds: [
      "student-erp",
      "parent-app",
      "identity-provider",
      "exam-system",
      "report-card",
      "attendance-system",
      "id-card-system",
      "class-register",
    ],
    blockedNodeIds: [
      "board-university-portal",
      "teacher-marks-sheet",
      "authority-export",
      "cloud-backup",
      "paper-admission-file",
    ],
    steps: [
      "Verify the requester and the guardian relationship before changing anything.",
      "Correct the master ERP record first, so everything downstream derives from the right value.",
      "Push the correction to the systems that copied it: the LMS, attendance, examinations, the parent app and the ID card.",
      "Re-issue any document already produced with the wrong value - the report card, the identity card, the class list.",
      "Where the wrong value has already been submitted to a board or university, start their correction process, which the institution does not control.",
      "Record what was corrected, when, and who was notified.",
    ],
    hardPart:
      "A correction reaches the systems that sync and stops at the ones that do not. The marks spreadsheet that was emailed around, the export sitting in someone's downloads folder, the printed file in the cupboard and the board's own record all keep the old value - and the board's is the one that will follow the student for years.",
  },
  {
    id: "rs-remove-photo",
    request: "Take my child's photograph off your website and social media",
    requestType: "remove-media",
    who: "A parent or guardian - very often after a change in family circumstances that makes a public image genuinely unsafe.",
    reachesNodeIds: [
      "public-website-social",
      "parent-app",
      "assignment-drive",
      "marketing-platform",
      "consent-record",
    ],
    blockedNodeIds: [
      "photography-vendor",
      "parent-whatsapp-group",
      "teacher-device",
      "cloud-backup",
    ],
    steps: [
      "Record the request against the student and mark the publication choice as withdrawn, so it is not re-published next term.",
      "Remove the images from the website, every social channel and the app, including album and archive pages.",
      "Pull the image from any advertisement or campaign it was used in, and stop the audience it seeded.",
      "Tell the event photographer in writing to delete their copies, and confirm they have.",
      "Check the yearbook, newsletters and printed material already distributed, and stop further distribution.",
      "Confirm to the family what has been removed and what genuinely cannot be.",
    ],
    hardPart:
      "Everything already copied. Parents in the class group have the photograph on their own phones, the photographer keeps the raw files, search engines and social platforms have cached it, and printed material is already in homes. Removal is real but partial, and saying so honestly is better than implying the image is gone.",
  },
  {
    id: "rs-now-an-adult",
    request: "I am 18 now - this is my record, not my parents'",
    requestType: "authorisation-change",
    who: "The student, once they reach adulthood - the request institutions are least prepared for.",
    reachesNodeIds: [
      "student-erp",
      "parent-app",
      "consent-record",
      "identity-provider",
      "report-card",
      "counselling-notes",
      "fee-portal",
    ],
    blockedNodeIds: ["bulk-messaging", "alumni-crm", "cloud-backup"],
    steps: [
      "Confirm the student's date of birth from the master record and mark the account as an adult's.",
      "Move the primary relationship to the student: their contact details, their login, their notice.",
      "Re-confirm directly with the student which uses they agree to, rather than carrying the guardian's admission-form signature forward.",
      "Decide with the student what the parent may still see - fee status is usually reasonable where the parent pays; counselling notes and attendance are usually not.",
      "Reduce or close the parent app access accordingly, and tell the parent it has changed.",
      "Record the transition, so nobody quietly restores the old access later.",
    ],
    hardPart:
      "Almost nothing is built for it. The parent app has one login with one level of access and no concept of a student who is now an adult, the original consent record has no expiry, and the institution keeps sending results and attendance to the parent because that is who the record has always pointed at.",
  },
  {
    id: "rs-stop-marketing",
    request: "Stop using our details for admissions and fundraising campaigns",
    requestType: "withdraw-marketing",
    who: "A parent, a former student, or a family whose child never even enrolled.",
    reachesNodeIds: [
      "admissions-crm",
      "bulk-messaging",
      "alumni-crm",
      "marketing-platform",
      "consent-record",
    ],
    blockedNodeIds: ["education-portal", "reception-whatsapp", "cloud-backup"],
    steps: [
      "Record the withdrawal against the person permanently, not against a single campaign.",
      "Suppress them in the CRM, the alumni list and the broadcast platform so the next export does not pick them up again.",
      "Remove them from any advertising audience already uploaded, and stop the lookalike audiences built from it.",
      "Keep the essential communication - fee notices, safety and academic messages - separate and still working.",
      "Confirm to the family that the withdrawal is permanent and what it does not stop.",
    ],
    hardPart:
      "The next export. Suppression is usually applied to one list rather than to the person, so the following campaign is built from a fresh pull and contacts them again. The education portal that originally sold the lead is also still holding it, and had already sold the same family to other institutions.",
  },
  {
    id: "rs-erase-after-leaving",
    request: "My child has left - delete what you no longer need",
    requestType: "erasure",
    who: "A parent of a former student, or a former student themselves.",
    reachesNodeIds: [
      "erp-archive",
      "alumni-crm",
      "parent-app",
      "identity-provider",
      "lms",
      "admissions-crm",
      "public-website-social",
      "assignment-drive",
    ],
    blockedNodeIds: [
      "board-university-portal",
      "cloud-backup",
      "physical-archive",
      "photography-vendor",
      "edtech-app",
      "teacher-device",
    ],
    steps: [
      "Separate what must be kept from what merely has been: an academic transcript is a genuine retention case, an enquiry record and a marketing profile are not.",
      "Close the student and parent accounts and the institutional identity, rather than suspending them.",
      "Delete the optional layers first - marketing profiles, alumni carry-over, enquiry records, analytics segments.",
      "Ask every vendor in writing to delete their copy and require confirmation.",
      "Review and remove what is still publicly visible from the years the student was there.",
      "Write down what could not be deleted, why, and when it will be - and tell the family that, rather than a blanket yes.",
    ],
    hardPart:
      "Almost everything durable. The board or university holds its own record and answers to nobody here. Backups keep the data for a cycle nobody has documented. Vendors have copies the institution has never asked about. The paper file is in a store room. An honest answer is a list of what was deleted and a list of what was not.",
  },
  {
    id: "rs-challenge-flag",
    request: "The exam flag against my name is wrong - I want it reviewed",
    requestType: "complaint",
    who: "A student, after an automatically raised suspicion flag or a plagiarism score led to a consequence.",
    reachesNodeIds: ["proctoring-vendor", "exam-system", "student-erp", "report-card", "lms"],
    blockedNodeIds: ["cloud-backup", "board-university-portal"],
    steps: [
      "Log the challenge formally, with an owner and a date, rather than handling it in a corridor conversation.",
      "Retrieve what the tool actually recorded and what specifically triggered the flag.",
      "Have a human review the underlying evidence rather than the score - which should have happened before any consequence.",
      "Correct the examination record and the student's master record if the flag does not hold.",
      "Tell everyone who received the earlier result, including any authority already notified.",
      "Record the outcome and how long the recording will be kept.",
    ],
    hardPart:
      "Explaining the decision. The score came from a vendor's model nobody at the institution has reviewed, so the reasoning cannot be shown to the student - and by the time the challenge is heard, the result has often already gone to the board.",
    businessModels: ["college", "integrated"],
  },
];

export const SCHOOLS_COLLEGES_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-wrong-parent",
    title: "A report card reached the wrong parent",
    trigger:
      "A parent calls to say they received another child's report - or, more seriously, a separated parent received a record they were not supposed to have.",
    severity: "high",
    involvedNodeIds: ["report-card", "student-erp", "parent-app", "bulk-messaging"],
    containment: [
      "Ask the recipient to delete it and confirm they have, and stop any remaining sends in the same batch.",
      "Suspend the parent app login that is wrongly attached until the relationship is verified.",
      "Check whether the same wrong link has sent anything else - attendance alerts, fee notices, bus location.",
    ],
    thenWhat: [
      "Find out whether the cause was a duplicate student record, a shared mobile number or a stale login, and fix the master record.",
      "Verify and record the guardian relationship properly rather than re-typing the number.",
      "Tell the family whose data was disclosed what was sent, to whom, and what you have done.",
      "Log it as an incident with a cause, an owner and a closure date - not as an administrative slip.",
    ],
    prevention:
      "One master student identifier with verified, recorded guardian relationships and scoped access per guardian, plus duplicate detection - so a shared phone number can never resolve to the wrong adult.",
  },
  {
    id: "in-photo-published",
    title: "A child's photograph was published when it should not have been",
    trigger:
      "A parent sees their child on the institution's social feed - often a family for whom a public image is genuinely unsafe.",
    severity: "critical",
    involvedNodeIds: ["public-website-social", "photography-vendor", "marketing-platform", "consent-record"],
    containment: [
      "Take the post down immediately, across every channel and every album or archive page it appears on.",
      "Stop any advertisement using the image and pause the audience built from it.",
      "Check whether the same shoot has been published elsewhere - the website, a newsletter, the yearbook.",
    ],
    thenWhat: [
      "Tell the photographer in writing to delete their copies of that child, and get confirmation.",
      "Record the publication choice as withdrawn against the student so it cannot recur next term.",
      "Tell the family exactly what was removed and what cannot be - cached copies, parents' own phones, printed material.",
      "Review why the check failed, and whether anyone was actually checking at all.",
    ],
    prevention:
      "A publication choice recorded per channel against each student, checked before anything is posted, with a named owner for the removal route and a written retention limit on the photographer's raw files.",
  },
  {
    id: "in-group-numbers",
    title: "A class group exposed every parent's phone number",
    trigger:
      "A parent objects after being contacted privately by another parent, or after their number appeared in an unrelated group.",
    severity: "medium",
    involvedNodeIds: ["parent-whatsapp-group", "class-teacher", "teacher-device"],
    containment: [
      "Stop adding anyone else to the group and stop posting anything about individual children in it.",
      "Identify what has already been posted about named children - absences, fee reminders, medical instructions, discipline.",
      "Move essential communication to a channel that does not expose contact details to other families.",
    ],
    thenWhat: [
      "Retire the group rather than trying to fix it - the disclosure happened when it was created and cannot be undone.",
      "Set a written rule for what staff may share, about whom, and where.",
      "Tell the affected families what was exposed and to whom.",
      "Check whether transport, activity and year groups have the same problem, because they usually do.",
    ],
    prevention:
      "Institution-run broadcast messaging where recipients cannot see each other, with a standing rule that nothing about an individual child is ever posted to a group.",
  },
  {
    id: "in-ai-upload",
    title: "Student work was pasted into a public AI tool",
    trigger:
      "A teacher mentions it in passing, or an unusually polished set of report-card comments prompts a question.",
    severity: "high",
    involvedNodeIds: ["public-ai-tool", "teacher-device", "lms", "counselling-notes"],
    containment: [
      "Establish what was actually pasted - work alone, or names, classes and support needs alongside it.",
      "Delete the conversation history and any stored files in the account, and turn off training or history where the tool allows it.",
      "Tell staff to stop immediately, and say what they should do instead so the need does not simply go underground.",
    ],
    thenWhat: [
      "Treat it as a disclosure to a third party: record which students were affected and what was disclosed.",
      "Decide, with advice, whether the families need to be told - and lean towards telling them where support needs were included.",
      "Publish a plain list of approved and prohibited tools, and provide an approved alternative.",
      "Check whether anything the tool produced has already been written into a child's permanent record.",
    ],
    prevention:
      "A named, approved tool that meets the need, an explicit prohibition on pasting identifiable student work anywhere else, and training on why a free tool is not a private one.",
  },
  {
    id: "in-route-exposed",
    title: "A bus route sheet with children's home addresses was exposed",
    trigger:
      "A sheet is found left on a seat or at a stop, photographed and circulated in a parent group, or a driver leaves and takes the list with them.",
    severity: "critical",
    involvedNodeIds: ["route-sheet", "driver-phone", "transport-system", "bus-gps"],
    containment: [
      "Recover every printed copy in circulation and account for them.",
      "Revoke the driver's and attendant's access to the tracking app and any institutional account immediately.",
      "Ask for photographs of the list to be deleted and for it to be removed from any group it reached.",
    ],
    thenWhat: [
      "Identify exactly which children's names, addresses and parent numbers were on the sheet.",
      "Tell the affected families directly - a home address and a fixed daily timing is the kind of exposure a parent needs to know about, and they may want to change arrangements.",
      "Reissue routes with stop names rather than full addresses where the route allows.",
      "Review what else the transport contractor holds and on what written terms.",
    ],
    prevention:
      "A managed driver app instead of paper and personal phones, masked calling so parent numbers are never visible, printed stops rather than full addresses, and access revocation as a standing step in every driver handover.",
    businessModels: ["school", "integrated"],
  },
  {
    id: "in-cctv-shared",
    title: "CCTV footage was shared outside the authorised team",
    trigger:
      "A clip of an incident appears in a staff group or reaches a parent, usually forwarded with good intentions.",
    severity: "high",
    involvedNodeIds: ["cctv-system", "teacher-device", "parent-whatsapp-group", "cloud-backup"],
    containment: [
      "Ask everyone who received the clip to delete it and confirm, and stop it spreading further.",
      "Review who currently has viewing access and remove everyone who does not need it.",
      "Preserve the original footage and the access log for the investigation before anything is overwritten.",
    ],
    thenWhat: [
      "Establish who exported it and why, and whether an export route should exist at all.",
      "Tell the families of the children identifiable in the footage.",
      "Set a written rule that footage is never shared into messaging apps, with a defined process for the rare cases where it must be released.",
      "Confirm the retention period is actually configured, not merely intended.",
    ],
    prevention:
      "Named individual viewing accounts with a log of every view and export, no general app access on personal phones, a configured retention limit, and an authorised release process with a recorded reason.",
  },
  {
    id: "in-stale-access",
    title: "A former teacher and a finished vendor still have access",
    trigger:
      "Discovered during an audit, when an old login appears in a report - or when someone who left months ago is still in a staff group.",
    severity: "high",
    involvedNodeIds: ["student-erp", "lms", "identity-provider", "edtech-app", "teacher-device"],
    containment: [
      "Disable the accounts immediately across the ERP, LMS, identity provider and every connected platform.",
      "Revoke the vendor's remote access and any shared credential it was using.",
      "Check the access logs for what was viewed or exported after the person or contract ended.",
    ],
    thenWhat: [
      "Establish what data left on personal devices, and require its deletion in writing.",
      "Find out how many other stale accounts exist - there are almost always more.",
      "Make account closure and device handover a mandatory, checked step in every exit and contract end.",
      "Replace shared logins with named ones so this is answerable next time.",
    ],
    prevention:
      "Provisioning and de-provisioning tied to the staff and contract records rather than to someone remembering, named logins throughout, and a scheduled access review that someone actually owns.",
  },
];

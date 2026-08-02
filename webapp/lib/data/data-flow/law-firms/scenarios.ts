// "What happens when someone asks" + "When it has already gone wrong".
//
// Shared, opt-in engine sections (lib/data-flow/schemas.ts) driven entirely by
// this content - no components are specific to law firms.
//
// ⛔ LANGUAGE LOCKS, TIGHTER HERE THAN ANY OTHER PACK (spec §5).
// The audience are lawyers, and an overclaim will be spotted on the first read.
//
//  · "High-impact client data", never "sensitive personal data" - the DPDPA
//    creates no such statutory category.
//  · DPDPA scope ONLY. No Bar Council rules, no advocate-client PRIVILEGE
//    doctrine, no professional-conduct or court-rule retention claims. Privilege
//    is real and important; this map simply does not opine on it. Describe
//    CUSTODY AND CONTROL, never legal status.
//  · No legal advice and no accusation. "Where the file is" is a fact; "you are
//    in breach" is not ours to say.
//  · ERASURE NEEDS UNUSUAL CARE. Unlike every other sector in this series, a
//    litigation file has genuine grounds to be kept. Never imply everything
//    should be deletable. `rs-delete-my-closed-matter` separates what must be
//    KEPT from what has merely never been DELETED - that distinction is the
//    whole value of the scenario.
//
// `blockedNodeIds` carries more weight here than anywhere else in the series.
// A walkthrough implying a firm can un-file a document, or reach into the other
// side's copy, would be worse than no walkthrough at all.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const LAW_FIRMS_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-return-my-documents",
    request: "I'm changing lawyers. Give me my file back.",
    requestType: "access",
    who: "A client moving to another firm, usually mid-matter and usually in a hurry",
    reachesNodeIds: [
      "physical-file-room",
      "matter-dms",
      "kyc-id-folder",
      "client-portal",
      "firm-email",
      "returned-documents-log",
    ],
    blockedNodeIds: ["court-filing-portal", "public-case-record", "external-counsel", "ex-staff-device"],
    steps: [
      "Confirm who is asking and that they are authorised to receive the file for this matter.",
      "Identify what is the client's own property - the originals they gave you - and hand those back.",
      "Produce the matter documents the client is entitled to a copy of, in a usable form rather than as a box.",
      "Record what was returned and what the firm retained, and why, in the return record.",
      "Tell the client plainly which material stays with the firm and which is already outside it.",
      "Close portal access and stop new material being added to the matter.",
    ],
    hardPart:
      "The originals go back and every scan, working copy, email attachment and printout stays. Most firms cannot say how many copies that is, so the honest answer to \"do you still have my documents\" is usually yes.",
  },
  {
    id: "rs-annexure-not-redacted",
    request: "You filed my bank statements without redacting them.",
    requestType: "correction",
    who: "A client who has seen the filed set, or been told about it by the other side",
    reachesNodeIds: ["matter-dms", "court-filing-portal", "brief-to-counsel-pack", "firm-email"],
    blockedNodeIds: ["public-case-record", "opposing-counsel", "registry-counter"],
    steps: [
      "Establish exactly what was filed, in which version, and on what date.",
      "Check what the forum's own procedure allows by way of a corrected or restricted filing.",
      "Prepare a properly minimised version and file it through the route the forum provides.",
      "Correct the firm's own copies so the unredacted version is not served again.",
      "Tell the client precisely what can and cannot be undone, without softening it.",
      "Record what happened so the same annexure is not filed the same way next time.",
    ],
    hardPart:
      "The firm's copies can be fixed. The record cannot. Whatever is already public has been indexed and may have been copied, and no request made to the firm reaches any of that. This is the one place on this map where the honest answer is that it cannot be put back.",
  },
  {
    id: "rs-delete-my-closed-matter",
    request: "The matter ended two years ago. Delete my file.",
    requestType: "erasure",
    who: "A former client, often after seeing the firm still holds their identity documents",
    reachesNodeIds: [
      "matter-dms",
      "firm-archive-backup",
      "kyc-id-folder",
      "physical-file-room",
      "offsite-record-storage",
      "legal-hold-register",
    ],
    blockedNodeIds: [
      "court-filing-portal",
      "public-case-record",
      "external-counsel",
      "ex-staff-device",
      "accounting-software",
    ],
    steps: [
      "Separate the file into what there is a current reason to keep and what there is not.",
      "Write the reason down against each category - an appeal period, a live related matter, a financial record - with an end date rather than \"indefinitely\".",
      "Delete what has no reason: duplicate scans, working copies, superseded drafts, identity documents the engagement never needed.",
      "Include the archive, the backups and the boxes in offsite storage, not only the live system.",
      "Record what was deleted, what was kept, and when the retained material will be reviewed again.",
      "Tell the client which parts are outside the firm entirely and cannot be reached at all.",
    ],
    hardPart:
      "A litigation file genuinely can have grounds to be retained - so this is not a request that should simply be granted or simply refused. The real problem is that most firms have never drawn the line, so they cannot tell the client what is being kept for a reason and what is being kept because nobody ever deleted anything.",
  },
  {
    id: "rs-correct-my-details",
    request: "My address on the record is wrong.",
    requestType: "correction",
    who: "A client, or someone named in the matter, who has moved or whose details were mistyped",
    reachesNodeIds: [
      "matter-management-system",
      "matter-dms",
      "client-portal",
      "engagement-letter-store",
      "billing-narrative",
      "accounting-software",
    ],
    blockedNodeIds: ["public-case-record", "court-filing-portal", "offsite-record-storage"],
    steps: [
      "Verify who is asking and which record they mean.",
      "Separate a factual correction - a name, an address, a date of birth - from a disagreement about the firm's assessment, which is a different conversation.",
      "Correct the client master record so downstream systems pick it up.",
      "Correct the matter file, the billing contact and the portal so notices stop going to the old address.",
      "Where a corrected detail also sits on a filing, use the forum's own amendment route rather than editing your copy alone.",
      "Keep the amendment history - what it was, what it is, and when it changed.",
    ],
    hardPart:
      "Correcting the firm's systems is straightforward. Correcting something already on a public record depends entirely on the forum's own procedure, and a firm that has told the client \"we've fixed it\" has usually only fixed its own half.",
  },
  {
    id: "rs-opposing-party-asks",
    request: "Your client's lawyers have my bank statements and my medical report. Where did you get them, and delete them.",
    requestType: "access",
    who: "The person on the other side of the dispute, who never engaged the firm and never gave it anything",
    reachesNodeIds: ["evidence-media-store", "matter-dms", "private-investigator"],
    blockedNodeIds: ["case-assessment-note", "brief-to-counsel-pack", "external-counsel", "court-filing-portal"],
    steps: [
      "Confirm the identity of the person asking before disclosing anything at all about what is held.",
      "Establish where each item actually came from - the client, a public source, an authority, an investigator - and whether that is recorded.",
      "Review whether the matter still needs every item, or whether some were taken in bulk and never filtered.",
      "Remove what the matter does not need from the working file.",
      "Answer at the level of custody and process, without discussing the matter's substance.",
      "Note the request and the response on the file.",
    ],
    hardPart:
      "This is the request the sector is least ready for, because it comes from someone the firm has no relationship with, about data it holds specifically in order to use against them. Most of the file cannot be handed over or deleted while the matter is live - and saying that clearly is more useful than pretending otherwise. What the firm can do is know where each item came from, which is usually the thing that has never been recorded.",
    businessModels: ["litigation", "full-service"],
  },
  {
    id: "rs-hr-file-in-data-room",
    request: "My employment file was shown to a company that was thinking of buying us.",
    requestType: "access",
    who: "An employee of a target company, who was never told the transaction existed",
    reachesNodeIds: ["virtual-data-room", "target-hr-fileset", "dd-review-export", "matter-dms"],
    blockedNodeIds: ["bidder-advisor", "closing-set-repository", "firm-archive-backup"],
    steps: [
      "Establish whether the firm or its client is answerable for the disclosure, and say so rather than passing the person between the two.",
      "Identify which of their documents were uploaded, in which version, and to which access group.",
      "Check the room's access log for who actually opened or downloaded them.",
      "Remove or redact anything that should not have been in the room in the first place.",
      "Confirm whether the room has been closed and whether deletion confirmations were obtained.",
      "Give the person a straight account of what was shared and with whom.",
    ],
    hardPart:
      "A bidder who walked away still has whatever they downloaded. Access can be revoked; copies cannot. Unless deletion confirmation was built into the process at the start, there is no mechanism afterwards - and by then the individual is asking a firm they have never heard of about a transaction they were never told about.",
    businessModels: ["corporate", "full-service"],
  },
  {
    id: "rs-stop-firm-marketing",
    request: "Stop sending me the firm's newsletters and event invitations.",
    requestType: "withdraw-marketing",
    who: "A former client, or a contact who was added after a single meeting",
    reachesNodeIds: ["firm-email", "matter-management-system", "client-portal"],
    blockedNodeIds: ["partner-personal-phone"],
    steps: [
      "Record the withdrawal against the person, not just the one list they mentioned.",
      "Separate marketing communication from matter communication so the second keeps working.",
      "Remove them from event, seminar and newsletter lists across the firm rather than one partner's copy.",
      "Confirm back to them that it is done, and by when.",
      "Make sure the next export from the matter system does not quietly re-add them.",
    ],
    hardPart:
      "The list that actually causes the problem is usually a partner's own contacts, exported once into a mailing tool and never reconciled. Removing someone centrally does nothing about the copy that gets re-uploaded before the next seminar.",
  },
  {
    id: "rs-intern-read-my-file",
    request: "Someone at your office discussed my case outside the firm.",
    requestType: "complaint",
    who: "A client in a matrimonial, criminal or employment matter, who heard about it from a third party",
    reachesNodeIds: ["matter-dms", "associate-laptop", "firm-email", "matter-management-system"],
    blockedNodeIds: ["public-ai-tool", "ex-staff-device", "staff-personal-drive"],
    steps: [
      "Take the complaint seriously in writing, and give it an owner who is not the person complained about.",
      "Establish who actually had access to the matter - including interns, clerks and anyone with a general login.",
      "Check the document system's access log for who opened the file and when.",
      "Restrict the matter to the named team immediately, whatever the finding turns out to be.",
      "Tell the client what was found and what has changed, without describing other people's conduct.",
      "Record the outcome and use it to review who can open high-impact matters generally.",
    ],
    hardPart:
      "In most firms the answer to \"who could see this file\" is \"everyone with a login\", which makes the access log almost useless as evidence and makes the complaint impossible to resolve either way. The fix is not the investigation - it is that the matter should never have been open to the whole office.",
  },
];

export const LAW_FIRMS_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "inc-unredacted-annexure",
    title: "An annexure was filed without redaction",
    trigger: "The other side points it out, or the client sees the filed set and calls",
    severity: "critical",
    involvedNodeIds: ["court-filing-portal", "matter-dms", "public-case-record", "registry-counter"],
    containment: [
      "Establish exactly what was filed, in which version, and whether it is already publicly visible.",
      "Stop the same set being served or filed again anywhere else in the matter.",
      "Check whether the forum offers a corrected, sealed or restricted filing route, and use it immediately if it does.",
      "Preserve the original submission and the acknowledgement rather than overwriting them.",
    ],
    thenWhat: [
      "File the properly minimised version through the route the forum provides.",
      "Correct the firm's own copies and the brief pack so it cannot be re-served.",
      "Tell the client what has been done and, plainly, what cannot be undone.",
      "Record the incident, what was exposed and to whom, on the matter file.",
    ],
    prevention:
      "Make redaction an explicit step on the filing checklist, so the question \"what does the forum actually require\" is answered separately from \"what did the client send us\".",
  },
  {
    id: "inc-wrong-recipient",
    title: "The draft went to the other side",
    trigger: "A reply arrives from an address nobody meant to include, or autocomplete picked the wrong name",
    severity: "critical",
    involvedNodeIds: ["firm-email", "opposing-counsel", "brief-to-counsel-pack", "matter-dms"],
    containment: [
      "Identify precisely what was sent, to whom, and whether it included the strategy note or only the draft.",
      "Ask for its return or deletion in writing, immediately and without argument about it.",
      "Recall the message if the system supports it, but do not assume the recall worked.",
      "Stop further circulation of that version until the recipient list has been checked.",
    ],
    thenWhat: [
      "Tell the client what went out and to whom, before they hear it from anyone else.",
      "Consider with the client whether anything about the matter's handling needs to change.",
      "Record what was disclosed, to whom and when, on the file.",
      "Review whether the pack should have contained the strategy note at all.",
    ],
    prevention:
      "Separate the brief pack from the internal assessment note, and turn on a delay-send or external-recipient warning so the wrong name is caught before it leaves.",
  },
  {
    id: "inc-ai-tool-upload",
    title: "Matter facts were pasted into a public AI tool",
    trigger: "A junior mentions how quickly they drafted something, or it appears in a browser history review",
    severity: "high",
    involvedNodeIds: ["public-ai-tool", "chronology-issue-tracker", "staff-personal-drive", "matter-dms"],
    containment: [
      "Establish what was pasted - names, allegations, figures, whole documents - and from which matter.",
      "Delete the conversation and any stored history in the account used, and check whether it was a personal account.",
      "Check whether the same was done on other matters by the same person or team.",
      "Stop further use of the tool on matter content while this is worked out.",
    ],
    thenWhat: [
      "Decide, with the partner on the matter, whether the client needs to be told and record the reasoning either way.",
      "Check whether anything the tool produced has been relied on without being verified.",
      "Record what was disclosed and to which service.",
      "Give the team a tool they can actually use, or the same thing will happen again next week.",
    ],
    prevention:
      "Name an approved assistant with written terms, say plainly that client facts must not go into consumer AI services, and cover it in the first week of every intern's induction.",
  },
  {
    id: "inc-open-share-link",
    title: "A matter folder is still open on a live link",
    trigger: "Someone forwards a link that still works, months after the task it was created for",
    severity: "high",
    involvedNodeIds: ["secure-share-link", "shared-cloud-folder", "matter-dms", "external-counsel"],
    containment: [
      "Revoke the link straight away rather than changing what is behind it.",
      "Check the access log for who opened it and when, and whether anything was downloaded.",
      "Look for other links created on the same matter and revoke those too.",
      "Move the material into the matter file so there is a controlled copy.",
    ],
    thenWhat: [
      "Establish what the folder actually contained - working links usually hold more than the sender remembers.",
      "Tell the client if third-party or high-impact material was reachable.",
      "Record the exposure and the period it was open for.",
      "Review every other open link on live matters, not just this one.",
    ],
    prevention:
      "Set expiry and named-recipient access as the default on file sharing, and review open links as a step in matter closure.",
  },
  {
    id: "inc-ex-associate-access",
    title: "Someone who left still has the files",
    trigger: "A former colleague refers to a live matter, or an old login shows up in an access review",
    severity: "high",
    involvedNodeIds: ["ex-staff-device", "matter-dms", "staff-personal-drive", "firm-email"],
    containment: [
      "Disable every account, portal login and shared credential the person had, including the ones they set up themselves.",
      "Check the document system's log for downloads in their final weeks.",
      "Establish what was on their laptop and in personal storage, and whether the device was ever wiped.",
      "Ask in writing for confirmation that firm material has been deleted.",
    ],
    thenWhat: [
      "Work out which matters are affected, especially anything high-impact or restricted.",
      "Tell the affected clients where matter material has genuinely left the firm.",
      "Record what was taken, so far as it can be established.",
      "Change any shared credential the person knew rather than assuming it is fine.",
    ],
    prevention:
      "Make access revocation and device wipe a step in every exit that someone signs off - and do not rely on people having been careful on their own.",
  },
  {
    id: "inc-lost-case-bundle",
    title: "A file or bundle has gone missing",
    trigger: "It is not in the file room when it is needed, or a clerk reports it was left behind",
    severity: "high",
    involvedNodeIds: ["physical-file-room", "courier-dispatch", "print-room", "registry-counter"],
    containment: [
      "Retrace the movement - office, clerk, courier, chambers, counter, car - and establish where it was last accounted for.",
      "Check with the registry and the courier before assuming it is lost.",
      "Establish what was actually in it, including annexures and originals.",
      "Secure any remaining physical copies of the same matter.",
    ],
    thenWhat: [
      "Rebuild the file from the document system and identify anything that existed only on paper.",
      "Tell the client, particularly where originals or third-party records were in the bundle.",
      "Record the loss, what it contained and what has been reconstructed.",
      "Review whether original documents should have been travelling at all.",
    ],
    prevention:
      "Keep a movement register for original files and bundles, and travel with copies rather than originals wherever the forum allows.",
  },
  {
    id: "inc-data-room-export",
    title: "A bidder downloaded employee files after the deal died",
    trigger: "The access log is reviewed at closure, or the target's HR team asks who has their records",
    severity: "critical",
    involvedNodeIds: ["virtual-data-room", "bidder-advisor", "target-hr-fileset", "dd-review-export"],
    containment: [
      "Close the room and revoke every remaining access immediately.",
      "Pull the full download log - who took what, and when.",
      "Ask every party who downloaded material for written confirmation of deletion.",
      "Identify the firm's own exports sitting on laptops and in working folders.",
    ],
    thenWhat: [
      "Tell the client which individuals' records were downloaded and by whom.",
      "Agree with the client who tells the affected employees, and make sure someone does.",
      "Delete the firm's working exports and record that it was done.",
      "Record what left the room and what confirmation was obtained.",
    ],
    prevention:
      "Minimise and redact before upload rather than after, disable bulk download by default, and make deletion confirmation a condition of access from day one.",
    businessModels: ["corporate", "full-service"],
  },
  {
    id: "inc-whatsapp-wrong-group",
    title: "Matter details went to the wrong chat",
    trigger: "Someone replies who should not have been in the conversation",
    severity: "medium",
    involvedNodeIds: ["client-whatsapp", "partner-personal-phone", "matter-management-system"],
    containment: [
      "Delete the message for everyone if the app still allows it, and note that this is not reliable.",
      "Establish exactly who was in the chat and what they saw.",
      "Ask the recipients not to forward it, in writing.",
      "Stop matter updates going to that chat.",
    ],
    thenWhat: [
      "Tell the client what was disclosed and to whom.",
      "Check the verified contact for the matter and use only that going forward.",
      "Record the disclosure on the file.",
      "Look at whether other live matters are being discussed in mixed groups.",
    ],
    prevention:
      "Keep one verified contact per matter, never discuss matters in group chats, and give clients a channel that does not depend on the right name being tapped.",
  },
];

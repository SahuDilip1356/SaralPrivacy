// What happens when someone asks - and what happens when it has already gone
// wrong. Optional shared sections (lib/data-flow/schemas.ts); fifth pack to
// author them, after schools-colleges, clinics, d2c-brands and
// training-institutes.
//
// CONTENT ONLY. No component, route or schema work.
//
// CA firms declare ONE business model, so nothing here is gated - every
// scenario shows for every visitor.
//
// THE CA DIFFERENCE, and it is a big one. In every other pack the firm holds
// data ABOUT its client. A CA firm holds something stronger: the ability to ACT
// AS the client. The DSC token in the drawer is the client's legal signature,
// and the password sheet is every portal login they have. No other sector in
// this series has that, which is why `rs-dsc-and-credentials` exists and why
// `in-dsc-used-without-instruction` is the most severe incident.
//
// The second difference: a large share of the personal data here belongs to
// people who never engaged the firm at all - the client's own employees, whose
// salary, PAN and bank details sit in the firm's payroll files. That is
// `rs-client-employee-data`.
//
// The third: the relationship ENDS by transfer, not by lapse. A client leaves by
// moving to another CA, and the handover is the moment the data question
// actually gets asked - `rs-changing-my-ca`.
//
// LANGUAGE LOCK: DPDPA scope only. NO ICAI claims, no professional-conduct or
// professional-body retention schedules, no statements about what tax law
// requires to be retained or for how long, and no tax or legal advice. Where a
// retention obligation is referred to, it is framed as something the firm
// determines with its own advisers. No "sensitive personal data" - the DPDPA
// creates no such statutory category. The audience are practising professionals
// and an overclaim will be spotted instantly.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const CA_FIRMS_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-access-everything",
    request: "Show me everything you hold about me",
    requestType: "access",
    who: "A client - an individual taxpayer, or the proprietor or director of a business the firm acts for.",
    reachesNodeIds: [
      "client-portal",
      "tally",
      "winman",
      "physical-files",
      "shared-drive",
      "firm-server",
      "old-itr-folders",
      "email-archive",
    ],
    blockedNodeIds: [
      "personal-whatsapp",
      "staff-laptop",
      "cloud-backup",
      "income-tax-portal",
      "outsourced-data-entry",
    ],
    steps: [
      "Verify the requester and their authority - for a company, the person asking is not automatically the person entitled to everything.",
      "Pull the engagement record, the documents they gave you, and the working papers and computations you produced from them.",
      "Include the books: the accounting file holds far more about the business and its people than the client usually pictures.",
      "Include the returns and statements filed on their behalf, and what was submitted with them.",
      "Name where their data has gone: the government portals, the bank, a statutory auditor, any outsourced processing, the backup provider.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "Everything outside the practice software. Documents arrived as WhatsApp images on a partner's personal phone, working copies were downloaded onto staff laptops, and years of attachments sit in an email archive nobody indexes. None of that can be searched, so an answer assembled only from Tally and the filing software is tidy and incomplete.",
  },
  {
    id: "rs-changing-my-ca",
    request: "I am moving to another CA - give me my records and delete yours",
    requestType: "erasure",
    who: "A departing client, usually mid-year and usually in a hurry.",
    reachesNodeIds: [
      "client-portal",
      "tally",
      "winman",
      "shared-drive",
      "physical-files",
      "firm-server",
      "email-archive",
    ],
    blockedNodeIds: [
      "cloud-backup",
      "staff-laptop",
      "personal-whatsapp",
      "income-tax-portal",
      "old-itr-folders",
      "outsourced-data-entry",
    ],
    steps: [
      "Separate three different things the client is asking for at once: return of their own documents, a copy of what you produced, and deletion of what you keep.",
      "Return the originals you hold - the physical file is usually the part that actually matters to them.",
      "Hand over the accounting data in a usable form rather than a locked export.",
      "Remove your access to their portals and credentials as a deliberate step, not something that lapses.",
      "Decide what you must retain and for how long, with your own advisers, and tell the client that figure rather than leaving it vague.",
      "Delete the rest, including the working copies on the drive and in email, and record what was deleted and when.",
    ],
    hardPart:
      "Nobody has decided in advance what a departing client is entitled to. Retention is treated as indefinite by default, working copies are scattered across the drive, staff laptops and email, and the practical handover usually consists of a Tally backup and a box of papers - after which the firm quietly keeps everything else forever.",
  },
  {
    id: "rs-dsc-and-credentials",
    request: "Return my digital signature token and my portal passwords",
    requestType: "authorisation-change",
    who: "Any client who has realised the firm can sign and file as them, and often keeps the token in a drawer.",
    reachesNodeIds: ["dsc-token", "password-sheet", "client-portal", "firm-email", "staff-laptop"],
    blockedNodeIds: ["cloud-backup", "personal-whatsapp", "email-archive"],
    steps: [
      "Physically return the DSC token and record the handover, with a date and a signature.",
      "Remove the client's credentials from the password sheet, the browser stores and anywhere staff saved them locally.",
      "Tell the client to change every portal password themselves once you have relinquished access - a password you delete from your sheet is not a password that has changed.",
      "Remove the firm's registration as an authorised representative where a portal supports it.",
      "Check who in the firm has used those credentials and from where, if the portal keeps a log.",
      "Confirm to the client, in writing, exactly what you no longer hold.",
    ],
    hardPart:
      "This is the one place a firm holds not just data about a client but the ability to BE the client. The token is often stored centrally, shared between staff, sometimes left plugged into a machine - and a password sheet copied into a personal note or an old email keeps working long after the sheet itself is cleaned up.",
  },
  {
    id: "rs-client-employee-data",
    request: "Your firm holds my salary and PAN - I never hired you",
    requestType: "access",
    who: "An employee of a client company, whose payroll the firm processes. They have no relationship with the firm at all.",
    reachesNodeIds: ["tally", "busy", "shared-drive", "physical-files", "firm-server", "email-archive"],
    blockedNodeIds: ["outsourced-data-entry", "cloud-backup", "staff-laptop", "traces"],
    steps: [
      "Recognise the position: you are processing this person's data on the employer's instructions, and they are entitled to be told where it sits.",
      "Refer them to their employer as the party that decides, but do not use that as a reason to give no answer at all.",
      "Establish with the employer what is held, where, and who has touched it.",
      "Confirm whether payroll data has gone anywhere further - an outsourced data-entry provider, a spreadsheet emailed for review, a backup.",
      "Agree with the employer what is returned or deleted at the end of the engagement, and write it into the engagement terms.",
    ],
    hardPart:
      "These people are invisible in most firms' thinking. Salary, PAN, bank account and deduction details for every employee of every client sit in the accounting files, get emailed as spreadsheets and go to outsourced processors - and no one at the firm has ever considered them data principals with their own rights.",
  },
  {
    id: "rs-stop-whatsapp-documents",
    request: "Stop collecting my documents on your staff's personal phones",
    requestType: "authorisation-change",
    who: "A client who has noticed their bank statements and PAN card sitting in a WhatsApp thread on someone's handset.",
    reachesNodeIds: ["personal-whatsapp", "client-portal", "firm-email", "staff-laptop", "shared-drive"],
    blockedNodeIds: ["cloud-backup", "email-archive"],
    steps: [
      "Move that client's document collection onto the portal or a firm-controlled channel.",
      "Ask the staff member to delete the media and the chat history for that client, and confirm they have.",
      "Check the phone's own auto-backup, which has usually copied every image to a personal cloud account.",
      "Save whatever is genuinely needed into the client file first, so deletion does not lose the record.",
      "Set the same rule for the rest of the firm, not just this client.",
    ],
    hardPart:
      "It is the fastest way to collect documents and everyone knows it, so it persists. The images are also auto-backed-up to the staff member's own cloud account, which the firm has no rights over and usually never thinks about - and when that person leaves, the whole history goes with them.",
  },
  {
    id: "rs-correct-filed-detail",
    request: "A detail you filed for me is wrong",
    requestType: "correction",
    who: "A client who has spotted an error in a return, a challan or a company filing.",
    reachesNodeIds: ["winman", "tally", "client-portal", "firm-email", "shared-drive"],
    blockedNodeIds: ["income-tax-portal", "gst-portal", "traces", "mca-portal", "email-archive"],
    steps: [
      "Log the request properly rather than fixing it in passing during a call.",
      "Correct the source first - the accounting file and the working papers - so the error does not simply repeat next period.",
      "Establish what has already been submitted with the wrong value and to which portal.",
      "Follow the relevant correction or revision route for that filing, which is a matter for the firm's own professional judgement.",
      "Tell anyone else who received the incorrect figure - a bank, an auditor, the client's own team.",
      "Record what was corrected, when, and by whom.",
    ],
    hardPart:
      "Once a figure has been submitted to a government portal, the record sits with a separate controller and the firm cannot simply edit it. Meanwhile the wrong value is usually also in a spreadsheet that was emailed to a bank and in the working file a colleague copied last week.",
  },
  {
    id: "rs-delete-old-years",
    request: "Delete my files from years I am no longer concerned with",
    requestType: "erasure",
    who: "A long-standing client who has realised the firm still holds a decade of their financial life.",
    reachesNodeIds: ["old-itr-folders", "shared-drive", "physical-files", "email-archive", "firm-server"],
    blockedNodeIds: ["cloud-backup", "staff-laptop", "income-tax-portal", "outsourced-data-entry"],
    steps: [
      "Decide what the firm is genuinely required to retain and for how long, with your own advisers - and write that policy down once rather than per request.",
      "Separate that from what has simply accumulated: duplicate scans, superseded drafts, forwarded attachments.",
      "Clear the year folders on the drive and the server for periods outside the policy.",
      "Deal with the paper: old files in a cupboard are the copy most often forgotten and most easily walked off with.",
      "Ask the backup provider how long deleted data persists, and tell the client honestly.",
      "Record what was deleted and what was kept, with the reason.",
    ],
    hardPart:
      "There is usually no retention policy at all, so 'we might need it' has quietly meant 'forever'. And the layer nobody can clear is the backup: a full second copy of every year, retained on a schedule the firm has typically never asked about.",
  },
];

export const CA_FIRMS_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-dsc-used-without-instruction",
    title: "A filing was made with a client's DSC that they had not instructed",
    trigger:
      "The client queries a filing they did not authorise, or an acknowledgement arrives for something they never saw.",
    severity: "critical",
    involvedNodeIds: ["dsc-token", "password-sheet", "income-tax-portal", "mca-portal"],
    containment: [
      "Stop all use of that client's token immediately and secure it physically.",
      "Establish exactly what was filed, when, from which machine and by whom.",
      "Tell the client the same day - this is their legal signature, not a clerical matter.",
    ],
    thenWhat: [
      "Work out how it was possible: a token left plugged in, a shared drawer, credentials on the password sheet that anyone could use.",
      "Deal with the filing itself through the appropriate route, as a matter for the firm's professional judgement with the client.",
      "Introduce a check-out record for every token, so use is always attributable to a person.",
      "Log the incident with a cause and an owner, and review every other client token held.",
    ],
    prevention:
      "Tokens stored under individual custody with a signed check-out log, never left connected, credentials out of a shared sheet, and a written instruction from the client on file before anything is signed on their behalf.",
  },
  {
    id: "in-password-sheet-exposed",
    title: "The client password sheet was exposed",
    trigger:
      "Found on a shared drive with open access, attached to an internal email, or discovered on a departed employee's laptop.",
    severity: "critical",
    involvedNodeIds: ["password-sheet", "shared-drive", "staff-laptop", "firm-email"],
    containment: [
      "Establish which clients and which portals were on the sheet.",
      "Change what the firm controls immediately, and ask clients to change the rest themselves.",
      "Remove the file from the drive and every mailbox it was attached to.",
    ],
    thenWhat: [
      "Check portal access logs where available for use that does not match your own records.",
      "Tell the affected clients what was exposed - these are credentials to their tax, GST and company filings.",
      "Replace the sheet with a password manager that has per-user access and an audit trail.",
      "Review who had access to the drive folder and for how long.",
    ],
    prevention:
      "No shared credential file at all: a managed password store with named access and logging, credentials never emailed, and access reviewed whenever anyone joins or leaves.",
  },
  {
    id: "in-wrong-client-attachment",
    title: "One client's financials were sent to another client",
    trigger:
      "The recipient tells you - or, less comfortably, does not, and the client whose data it was finds out later.",
    severity: "high",
    involvedNodeIds: ["firm-email", "shared-drive", "personal-whatsapp", "staff-laptop"],
    containment: [
      "Ask the recipient to delete it and confirm, and recall the message where the system allows.",
      "Check whether the same attachment went to anyone else in the same thread or batch.",
      "Stop any scheduled follow-up that would resend it.",
    ],
    thenWhat: [
      "Tell the client whose data was disclosed what went out, to whom, and what you have done - they are entitled to know, and they will find out anyway.",
      "Look at why it happened: similar client names, a mis-selected contact, a reused draft.",
      "Introduce a check before any financial attachment leaves - a second pair of eyes on client-name matching is usually enough.",
      "Log it as an incident rather than an embarrassment.",
    ],
    prevention:
      "Sending client documents through the portal rather than as email attachments, distinct naming for similar clients, and a verification step before any financial file is sent.",
  },
  {
    id: "in-staff-left-with-files",
    title: "A departing staff member kept client files",
    trigger:
      "Discovered at handover, or when a former employee turns up at another firm with familiar clients.",
    severity: "high",
    involvedNodeIds: ["staff-laptop", "shared-drive", "personal-whatsapp", "firm-server"],
    containment: [
      "Disable their accounts across the drive, server, email and practice software immediately.",
      "Recover the device if it belongs to the firm; if it is personal, ask in writing for deletion and confirmation.",
      "Remove them from client WhatsApp threads and groups.",
    ],
    thenWhat: [
      "Check download and export logs for the weeks before departure.",
      "Establish which clients' data was on the device and whether any of it has demonstrably been used elsewhere.",
      "Tell affected clients where there is evidence their data left.",
      "Make device return, account closure and deletion a checked step in every exit.",
    ],
    prevention:
      "Firm-issued devices where possible, restricted and logged downloads, client communication through firm channels rather than personal numbers, and an exit checklist someone owns.",
  },
  {
    id: "in-whatsapp-document-store",
    title: "Client documents accumulated on a personal phone",
    trigger:
      "Noticed when a staff member changes handset, loses one, or leaves - and years of client documents go with it.",
    severity: "high",
    involvedNodeIds: ["personal-whatsapp", "staff-laptop", "shared-drive", "physical-files"],
    containment: [
      "Establish whose documents are in the thread and over what period.",
      "Save anything genuinely needed into the client file first, then delete the media and history.",
      "Check the phone's automatic cloud backup, which has usually copied every image already.",
    ],
    thenWhat: [
      "Move document collection onto the portal or a firm-controlled number.",
      "Set a rule that identity and bank documents are never collected on personal handsets.",
      "Decide, with advice, whether affected clients should be told, and lean towards telling them where identity documents were involved.",
      "Check whether other staff have the same accumulation - they will.",
    ],
    prevention:
      "A firm-controlled collection channel that is genuinely as easy to use, a prohibition on personal handsets for client documents, and a deletion rule for media once it is filed.",
  },
  {
    id: "in-outsourced-vendor-scope",
    title: "An outsourced provider received far more than the task needed",
    trigger:
      "Noticed when reviewing what was shared, or when the provider asks a question that reveals what they can see.",
    severity: "high",
    involvedNodeIds: ["outsourced-data-entry", "shared-drive", "tally", "firm-server"],
    containment: [
      "Restrict the provider's access to the specific client and period the work covers.",
      "Establish what they have already downloaded or retained.",
      "Pause further sharing until the scope is defined.",
    ],
    thenWhat: [
      "Define per engagement exactly what a provider needs, and share only that.",
      "Put confidentiality, retention and deletion terms in writing if they are not already.",
      "Require confirmation of deletion when a job closes.",
      "Tell clients that outsourced processing happens at all - many assume it does not.",
    ],
    prevention:
      "Scoped, time-limited access per engagement rather than a folder share, written processing terms with every provider, and deletion confirmed at close.",
  },
  {
    id: "in-it-vendor-access",
    title: "The IT support vendor had standing access to everything",
    trigger:
      "Surfaces during a review, or after a support session where the engineer clearly browsed client files.",
    severity: "medium",
    involvedNodeIds: ["it-support-vendor", "firm-server", "shared-drive", "cloud-backup"],
    containment: [
      "Revoke standing administrative access and any shared credential the vendor was using.",
      "Check what was accessed during recent sessions if logs exist.",
      "Move to access granted per request rather than permanently held.",
    ],
    thenWhat: [
      "Put written terms in place covering confidentiality and what the vendor may access.",
      "Introduce named accounts so activity is attributable to a person.",
      "Review who else holds standing access to the server and backups.",
      "Record the change.",
    ],
    prevention:
      "Time-bound, request-based vendor access with named accounts and logging, no shared administrator credentials, and written terms before any engagement.",
  },
  {
    id: "in-old-files-exposed",
    title: "Years of old client files were left accessible",
    trigger:
      "An open drive folder, an unlocked cupboard during an office move, or a backup no one had reviewed.",
    severity: "medium",
    involvedNodeIds: ["old-itr-folders", "physical-files", "cloud-backup", "email-archive"],
    containment: [
      "Restrict access to the folder or secure the physical storage immediately.",
      "Establish what was reachable and by whom, and for how long.",
      "Check whether anything was copied or removed.",
    ],
    thenWhat: [
      "Determine what the firm should be retaining at all, with your own advisers, and write it down.",
      "Dispose of what falls outside that policy, securely, and record the disposal.",
      "Tell clients where there is evidence their old records were accessed.",
      "Set a review date rather than treating this as a one-off tidy-up.",
    ],
    prevention:
      "A written retention policy applied on a schedule, restricted access to archive folders, secure physical storage with controlled keys, and a known backup retention period.",
  },
];

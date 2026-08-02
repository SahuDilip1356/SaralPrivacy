// What happens when someone asks - and what happens when it has already gone
// wrong. Both are optional shared sections (lib/data-flow/schemas.ts), first
// authored on schools-colleges and added here second.
//
// CONTENT ONLY. No component, route or schema work: the engine already renders
// these for any pack that declares them.
//
// The honest half of every rights scenario is `blockedNodeIds`. For a clinic or
// a laboratory that list is unusually long and unusually important - the report
// has already been sent, the referring doctor keeps his own copy, the insurer's
// file is a separate controller's, the backup runs nightly, and the specimen is
// in a freezer. A walkthrough implying all of that is reachable would be worse
// than no walkthrough at all.
//
// LANGUAGE LOCK (same as the rest of this pack): "high-impact health data",
// never "sensitive personal data" - the DPDPA creates no such statutory
// category. DPDPA scope only: no NDHM/ABDM, no professional-body retention
// schedules, and no medical or legal advice. The incident section is an
// OPERATIONAL response reference; whether something must be reported is a
// decision the practice takes with its own advisers, and the shared component
// says so.
//
// Model gating: a standalone clinic never sees the sample-disposal or
// chain-of-custody walkthroughs, and a laboratory never sees the AI-scribe one.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const CLINICS_DIAGNOSTIC_LABS_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-access-record",
    request: "Show me everything you hold about me",
    requestType: "access",
    who: "The patient - or a relative asking on their behalf, which is the first thing you have to test rather than assume.",
    reachesNodeIds: [
      "appointment-register",
      "id-document-store",
      "report-generation",
      "report-delivery-channel",
      "billing-system",
      "shared-drive",
      "physical-file-room",
      "grievance-register",
    ],
    blockedNodeIds: [
      "reception-whatsapp",
      "archive-backup",
      "tpa-claims-portal",
      "hospital-partner",
      "government-reporting",
    ],
    steps: [
      "Verify the requester against the record before disclosing anything - a relative who booked the appointment is not automatically entitled to the result.",
      "Pull the registration record, the visit history and every report issued under that patient ID.",
      "Include the identity documents you took at registration, and notice how many of them you had no reason to keep.",
      "Include what the practice created rather than collected: interpretations, risk flags, recall categories and any tool-generated finding.",
      "Name the third parties the data went to - the referring doctor, the hospital, the insurer or TPA, the employer who paid for a health check, the reference lab.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "The channels nobody can query. A year of symptom descriptions and forwarded reports sits in a WhatsApp thread on a staff member's phone; results were emailed as attachments; a doctor keeps working copies on a personal laptop. None of it can be searched, so the answer is either incomplete or it quietly pretends those places do not exist.",
  },
  {
    id: "rs-correct-report",
    request: "This report is wrong, or it is not mine",
    requestType: "correction",
    who: "The patient, a treating doctor who spotted an implausible value, or the practice itself after an internal check.",
    reachesNodeIds: [
      "report-generation",
      "report-delivery-channel",
      "referral-packet",
      "billing-system",
      "grievance-register",
      "incident-file",
    ],
    blockedNodeIds: ["hospital-partner", "tpa-claims-portal", "archive-backup", "shared-drive"],
    steps: [
      "Log the request formally, with an owner and a date, rather than handling it verbally at the counter.",
      "Establish whether this is a wrong value or a wrong patient - the second is a clinical safety incident as well as a privacy one, and is handled differently.",
      "Amend the authoritative record and keep the amendment history visible rather than overwriting it.",
      "Re-issue the corrected report with a clear version marker so it cannot be confused with what came before.",
      "Work out exactly who received the superseded version, and send every one of them the correction.",
      "Correct anything downstream that was built on it - the invoice, the claim, the referral, the recall category.",
    ],
    hardPart:
      "Catching up with the copies. The first report was already sent to the patient, the referring doctor and often an insurer, and each of them acted on it. A correction that reaches only your own system leaves a superseded result in circulation - and someone is still treating against it.",
  },
  {
    id: "rs-change-who-receives",
    request: "Stop sending my results to that number",
    requestType: "authorisation-change",
    who: "The patient - very often after a result reached a spouse, a parent or an adult child they had not told.",
    reachesNodeIds: [
      "appointment-register",
      "booking-platform",
      "id-document-store",
      "report-delivery-channel",
      "reception-whatsapp",
      "grievance-register",
    ],
    blockedNodeIds: ["family-member", "archive-backup", "referring-doctor"],
    steps: [
      "Record who the patient authorises to receive their information as a specific, separate permission - not as a phone number in a contact field.",
      "Change the delivery number on the master record and on every channel that reads from it.",
      "Check the booking history: if a relative made the appointments, their number is probably the one on file everywhere.",
      "Set the default channel to something that requires identity at the point of collection.",
      "Tell reception, so a familiar voice at the counter is not enough to release a report.",
      "Confirm to the patient what has changed and what has already gone out.",
    ],
    hardPart:
      "What has already been delivered. The relative holding the previous report cannot be made to forget it, and this is the one mistake on this map that cannot be recalled - which is exactly why the emergency contact and the authorised recipient should never have been the same field.",
  },
  {
    id: "rs-employer-health-check",
    request: "My employer paid for the test - that does not entitle them to the result",
    requestType: "complaint",
    who: "An employee tested under a corporate health-check or pre-employment programme.",
    reachesNodeIds: ["report-generation", "report-delivery-channel", "billing-system", "grievance-register"],
    blockedNodeIds: ["corporate-client", "archive-backup", "tpa-claims-portal"],
    steps: [
      "Establish what was actually agreed with the employer, in writing, about what they receive.",
      "Separate the two things a corporate programme conflates: confirmation that a test was done, and the clinical result of it.",
      "Stop any further individual-level disclosure under that programme until the position is settled.",
      "Tell the patient exactly what has already been sent to their employer.",
      "Change the standing arrangement so the employer receives only what they are entitled to - usually a fitness conclusion or an aggregate, not a report.",
      "Record the complaint and the outcome.",
    ],
    hardPart:
      "The employer already has it, and they are a separate controller you cannot audit or delete from. Paying for a test is not the same as being entitled to the result, but by the time anyone asks the question the file is usually already in an HR folder.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "rs-stop-recalls",
    request: "Stop the health-package and recall messages",
    requestType: "withdraw-marketing",
    who: "A patient who is being contacted about a condition they were treated for - sometimes on a shared family phone.",
    reachesNodeIds: ["crm-reminder", "appointment-register", "reception-whatsapp", "grievance-register"],
    blockedNodeIds: ["archive-backup", "shared-drive"],
    steps: [
      "Record the withdrawal against the person permanently, not against one campaign.",
      "Separate clinical communication from promotion: a repeat-prescription or follow-up reminder is care, a wellness package is marketing, and the patient can refuse the second without losing the first.",
      "Remove them from condition-based segments and recall lists, so the next export does not pick them up again.",
      "Review the wording of what does still go out - a message should not disclose a condition to whoever picks up the phone.",
      "Confirm to the patient what has stopped and what has not.",
    ],
    hardPart:
      "Health-based segmentation is usually the thing generating the message, and suppression is applied to a list rather than to the person - so the next campaign is built from a fresh pull of everyone with that condition, and contacts them again.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "rs-erase-after-care",
    request: "I am not coming back - delete my records",
    requestType: "erasure",
    who: "A former patient, or someone who used the practice once for a single test.",
    reachesNodeIds: [
      "appointment-register",
      "id-document-store",
      "report-delivery-channel",
      "shared-drive",
      "grievance-register",
      "billing-system",
    ],
    blockedNodeIds: [
      "archive-backup",
      "physical-file-room",
      "government-reporting",
      "tpa-claims-portal",
      "hospital-partner",
      "reception-whatsapp",
    ],
    steps: [
      "Separate what you are genuinely required to keep from what you have simply never deleted - a clinical record and a financial record have different grounds, an identity-document scan usually has none.",
      "Delete the layers with no retention case first: the identity copies, the marketing and recall profiles, the working files on the shared drive.",
      "Close the portal or app account rather than deactivating it.",
      "Ask every vendor holding a copy to delete it, and require confirmation.",
      "Write down what could not be deleted, on what grounds, and when it will be.",
      "Give the patient that list rather than a blanket yes - it is a better answer and it is the true one.",
    ],
    hardPart:
      "Most of the durable copies. Nightly backups keep the record for a cycle nobody has documented, the insurer and the referring hospital hold their own files, statutory reporting has already happened for some results, and there is a paper file in a rack. An honest response is two lists: deleted, and not deleted with a reason.",
  },
  {
    id: "rs-destroy-sample",
    request: "Destroy my sample - do not keep it or use it for anything else",
    requestType: "erasure",
    who: "A patient who has realised the specimen itself still exists, long after the result was issued.",
    reachesNodeIds: ["stored-samples", "sample-tube", "lis", "technician-worksheet"],
    blockedNodeIds: ["reference-lab", "analyser", "archive-backup"],
    steps: [
      "Find out whether the specimen still exists, where, and under whose name it is labelled.",
      "Establish why it is being retained - a defined re-test window is a reason, 'the freezer has space' is not.",
      "Dispose of it under your documented process and record the disposal against the patient.",
      "Remove the linkage in the laboratory system so the barcode no longer resolves to a named person.",
      "Check whether an aliquot went to a reference or specialist lab, and ask them in writing to do the same.",
      "Confirm to the patient what was destroyed and what you could not reach.",
    ],
    hardPart:
      "A labelled specimen is personal data sitting in a physical place that no database query reaches, and an aliquot sent to a reference lab is now in someone else's freezer under an arrangement that probably never mentioned disposal. Instrument memory may also still hold the run.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
];

export const CLINICS_DIAGNOSTIC_LABS_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-wrong-number",
    title: "A report was sent to the wrong number",
    trigger:
      "Someone calls to say they have received a stranger's result - or the patient calls because theirs reached a relative they had not told.",
    severity: "critical",
    involvedNodeIds: ["report-delivery-channel", "reception-whatsapp", "appointment-register", "incident-file"],
    containment: [
      "Ask the recipient to delete it and confirm they have, and stop any remaining sends in the same batch.",
      "If it went out as a link, revoke or expire the link immediately.",
      "Check whether the same wrong number is attached to anything else - other reports, invoices, appointment reminders.",
    ],
    thenWhat: [
      "Establish how the number got onto the record: a relative who booked, a shared family handset, a transcription error at registration.",
      "Tell the patient whose result was disclosed exactly what was sent and to whom - they may need to act on it in their own life.",
      "Correct the record and separate the emergency contact from the authorised recipient.",
      "Log it as an incident with a cause, an owner and a closure date.",
    ],
    prevention:
      "Verify the recipient against the record before anything is sent, make an authenticated portal the default channel, use expiring links where a link is unavoidable, require identity at counter collection, and log every delivery so a wrong send can be traced.",
  },
  {
    id: "in-relative-collected",
    title: "A relative collected a report the patient had not authorised",
    trigger:
      "The patient objects afterwards, or a family member mentions a result the patient had not shared with them.",
    severity: "high",
    involvedNodeIds: ["report-delivery-channel", "family-member", "id-document-store", "grievance-register"],
    containment: [
      "Establish what was handed over and to whom, from the counter record if there is one.",
      "Stop further release on that patient until the authorised recipient is confirmed with them directly.",
      "Brief reception that familiarity is not authorisation.",
    ],
    thenWhat: [
      "Speak to the patient about what was disclosed, without involving the relative in that conversation.",
      "Record who the patient authorises, as a specific permission with a scope rather than a phone number.",
      "Review whether counter collection is logged at all - in most practices it is not.",
      "Log the incident and the corrective action.",
    ],
    prevention:
      "A recorded authorisation per patient, identity checked at the counter, and a delivery log - so 'who collected this?' has an answer that does not depend on whoever was at the desk that morning.",
  },
  {
    id: "in-swapped-result",
    title: "A result was attached to the wrong patient",
    trigger:
      "A clinician queries an implausible value, or two patients with similar names are reconciled during a check.",
    severity: "critical",
    involvedNodeIds: ["report-generation", "id-document-store", "referral-packet", "hospital-partner", "incident-file"],
    containment: [
      "Withdraw both reports immediately and mark them as not to be relied on.",
      "Tell any clinician who has already acted on either one - this is a clinical safety event, not only a privacy one.",
      "Freeze the records involved so no further copies are generated while it is investigated.",
    ],
    thenWhat: [
      "Trace the point of divergence: registration, labelling, accession or reporting.",
      "Re-issue corrected reports with a clear version history, and reach every recipient the wrong versions went to.",
      "Tell both patients what happened, what each of them was told, and what has been corrected.",
      "Check for duplicate or wrongly merged records for both, because there usually are some.",
    ],
    prevention:
      "Confirm against more than one identifier before matching or merging, run duplicate detection, restrict who can merge records, audit every merge, and label in the patient's presence.",
  },
  {
    id: "in-staff-phone-left",
    title: "A staff member left, and the practice WhatsApp went with them",
    trigger:
      "Noticed when patients keep messaging a number nobody is answering - or when a former employee is still in a staff group.",
    severity: "high",
    involvedNodeIds: ["reception-whatsapp", "appointment-register", "shared-drive"],
    containment: [
      "Establish whether the advertised number is a personal handset or a business account you control.",
      "If it is a business account, transfer control and remove the former staff member's access.",
      "If it is personal, ask in writing for the patient conversations and media to be deleted, and get confirmation.",
    ],
    thenWhat: [
      "Work out what was in it: symptom descriptions, photographed prescriptions, forwarded reports, identity documents.",
      "Redirect the advertised number to a channel that routes into the practice system.",
      "Decide, with advice, whether affected patients should be told - lean towards telling them where reports or identity documents were involved.",
      "Make account and device handover a checked step in every exit.",
    ],
    prevention:
      "An official business number that routes into the practice system, a rule that patient conversations never happen on personal handsets, a deletion rule for media, and handover as a standing part of leaving.",
  },
  {
    id: "in-shared-link",
    title: "A link to a folder of reports was forwarded on",
    trigger:
      "Someone outside the practice mentions being able to open more than their own result, or a link turns up in a group.",
    severity: "high",
    involvedNodeIds: ["shared-drive", "report-delivery-channel", "report-generation", "archive-backup"],
    containment: [
      "Revoke the link immediately and switch the folder to named access only.",
      "Check the access log for who opened it and how many times, if the platform records that.",
      "Look for other open links on the same drive - there is rarely only one.",
    ],
    thenWhat: [
      "Establish exactly whose reports were reachable through it, not just whose was intended.",
      "Tell the affected patients what was exposed and for how long.",
      "Move report delivery off shared folders onto a channel that identifies the recipient.",
      "Log the incident and review who can create sharing links at all.",
    ],
    prevention:
      "No open links for anything containing a result, named access with expiry on the drive, delivery through an authenticated channel, and a periodic review of existing shares.",
  },
  {
    id: "in-tpa-overshare",
    title: "A full report was uploaded to a claim that needed a summary",
    trigger:
      "Usually found during a review, or when a patient asks why an insurer knows something unrelated to their claim.",
    severity: "medium",
    involvedNodeIds: ["tpa-claims-portal", "billing-system", "report-generation", "incident-file"],
    containment: [
      "Stop the practice for that claim type immediately and identify what is already uploaded.",
      "Ask the administrator to remove the excess documents where their process allows it.",
      "Check whether the same over-disclosure is standard across other claims - it usually is.",
    ],
    thenWhat: [
      "Define, per claim type, the minimum the insurer actually requires.",
      "Separate financial access from clinical access so a billing role cannot attach a whole report by default.",
      "Tell patients where a disclosure went beyond what the claim needed.",
      "Record every disclosure made to an insurer or administrator from now on.",
    ],
    prevention:
      "A documented minimum per claim type, clinical detail kept off invoices, separate finance and clinical permissions, and a disclosure log.",
  },
  {
    id: "in-sample-identity-split",
    title: "A sample and its identity came apart in transit",
    trigger:
      "Found at the accession desk - a tube with an illegible or missing label, or a manifest that does not match the box.",
    severity: "critical",
    involvedNodeIds: ["sample-tube", "transport-box", "courier-partner", "collection-desk", "lis"],
    containment: [
      "Quarantine the affected samples rather than guessing which is which.",
      "Stop processing anything from that consignment until the chain of custody is reconstructed.",
      "Contact the collection point for their record of what went into the box.",
    ],
    thenWhat: [
      "Decide honestly whether identity can be re-established - and if it cannot, recollect rather than assume.",
      "Tell the affected patients, and the referring doctors waiting on those results.",
      "Review what the manifest actually prints: a full name and condition on a transport document is a disclosure to everyone who handles the box.",
      "Record it and review the courier arrangement in writing.",
    ],
    prevention:
      "Accession numbers rather than full identity on manifests and transport paperwork, labelling in the patient's presence, an auditable chain of custody, and written responsibilities where a courier moves samples for you.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "in-ai-scribe-consult",
    title: "An AI scribe recorded a consultation nobody had agreed to",
    trigger:
      "A patient notices the microphone, or asks why the notes contain something they only mentioned in passing.",
    severity: "high",
    involvedNodeIds: ["ai-scribe", "emr", "doctor-device", "shared-drive"],
    containment: [
      "Stop using the tool for consultations until the position is settled.",
      "Establish what it captured and where it is held - the audio, the transcript, or both.",
      "Delete the recordings and transcripts for consultations where there was no notice, if the tool allows it.",
    ],
    thenWhat: [
      "Check what the vendor retains, where, and whether the audio is used to improve their models.",
      "Separate what the scribe generated from what the clinician actually verified - an unreviewed suggestion should never have entered the record as a finding.",
      "Give notice before the consultation, not after, and make it refusable without affecting care.",
      "Record the review and the decision.",
    ],
    prevention:
      "Approve any tool that processes a consultation before it is used, give notice at the point of care, require a clinician to verify anything it produces, and set a retention limit on recordings with the vendor in writing.",
    businessModels: ["integrated", "clinic"],
  },
];

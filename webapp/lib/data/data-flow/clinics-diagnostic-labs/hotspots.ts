// The curated 8 hotspots for a clinic or diagnostic lab, ranked worst-first.
// Buckets map to the clinics-diagnostic-labs assessment pack
// (patient_data_collection / health_data_sensitivity / report_sharing_communication
// / system_staff_vendor_access / retention_incident_readiness) - all five are
// reachable from the map.
//
// ⚠️ WHY THIS IS EXACTLY 8, AND WHY EACH NODE IS PINNED TO ONE STAGE
//
// The journey flags a stage red when a hotspot's node resolves to it, where a
// node resolves to the FIRST of its stageIds that is visible in the selected
// model - and a node with no visible stage is skipped silently. The counter and
// the legend, however, print `pack.hotspots.length`, which is pack-level and
// does NOT vary by model. So two things break the reconciliation:
//   (a) two hotspot nodes sharing a primary stage  -> flags < counter
//   (b) a hotspot node hidden in one model         -> flags < counter there
// That is the "the flow shows 6, the counter says 8" defect, and it is still
// open on ca-firms and recruitment.
//
// This pack removes both failure modes by construction: every hotspot node is
// UNGATED and pinned to EXACTLY ONE of the eight ALL-MODEL stages (booking,
// registration, orders, reporting, delivery, billing, grievance, archive), one
// hotspot per stage. Eight all-model stages is therefore why the count is eight.
// flags = 8 = counter in all three models, by arithmetic rather than by luck.
//
// ⚠️ If you add, remove or re-point a hotspot, re-run the reconciliation script
// in the spec (§12) for ALL THREE models before pushing.
//
// The laboratory's own signature exposures - home-collection staff carrying
// addresses on a personal phone, sample and identity separating in transit,
// analysers retaining results outside the LIS, reference labs receiving
// excessive identifiers - sit on laboratory-only stages and therefore cannot be
// hotspots without breaking the count. They are NOT dropped: each is authored as
// a critical-risk node with its own riskWhy and riskAction, rendered in full in
// the models where it exists. The hotspot rail is the curated "start here" list,
// not the risk inventory.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const CLINICS_DIAGNOSTIC_LABS_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-report-delivery",
    rank: 1,
    nodeId: "report-delivery-channel",
    title: "The report is sent without knowing who will receive it",
    whatHappens:
      "The result goes out to whatever number is on the record - a WhatsApp message, an unauthenticated download link by SMS, an email attachment, or a printout handed to whoever comes to the counter. The number frequently belongs to a spouse or parent, the handset is often shared, and the link can be forwarded by anyone who has it.",
    whyItMatters:
      "This is the sector's signature exposure: the practice's most sensitive artefact leaves the building at exactly the moment nobody checks identity. A pregnancy, an HIV status, a mental-health referral or a cancer finding can reach a family member the patient had not told - and unlike almost every other mistake on this map, a wrong send cannot be recalled.",
    dataCategoryIds: ["lab-order-result", "diagnosis-treatment", "diagnostic-image", "communication-media"],
    action:
      "Verify the recipient against the record before anything is sent, make the authenticated portal the default channel, use expiring links where a link is unavoidable, require identity at counter collection, and log every delivery so a wrong send can be traced and contained.",
    assessmentBucket: "report_sharing_communication",
  },
  {
    id: "hs-reception-whatsapp",
    rank: 2,
    nodeId: "reception-whatsapp",
    title: "Symptoms arrive on a personal phone before any record exists",
    whatHappens:
      "Patients describe their condition, photograph old prescriptions and forward previous reports to the number the practice advertises - which is very often a staff member's own handset rather than a business account. Relatives message on the patient's behalf, and that number quietly becomes the one results are later sent to.",
    whyItMatters:
      "Health information is disclosed before there is any patient record to govern it, into a channel with no access control, no retention rule and no export. When a patient asks what you hold about them, this channel cannot be searched; when the staff member leaves, the entire history walks out with the phone.",
    dataCategoryIds: ["clinical-history", "patient-contact", "communication-media", "diagnosis-treatment"],
    action:
      "Move enquiries onto an official business number that routes into the practice system, forbid patient conversations on personal handsets, give notice at first contact, set a deletion rule for media, and record separately who the patient authorises to receive information.",
    assessmentBucket: "patient_data_collection",
  },
  {
    id: "hs-identity-master",
    rank: 3,
    nodeId: "id-document-store",
    title: "Identity is collected by default and matched by hand",
    whatHappens:
      "A full Aadhaar or insurance card is photocopied at registration because it has always been asked for, and the patient is matched to an existing record by eye across a paper form, a scan and a screen. Similar names, a shared family mobile number or a mistyped date of birth create a second profile for the same person.",
    whyItMatters:
      "Two harms compound here. Identity documents nobody could justify collecting are retained indefinitely - and duplicate or wrongly merged records are precisely the condition in which one patient's result gets attached to another patient's name, which is a clinical safety failure as much as a privacy one.",
    dataCategoryIds: ["government-id", "patient-identity", "patient-contact", "family-caregiver"],
    action:
      "Define the minimum registration set and stop retaining identity-document copies you cannot justify, confirm against more than one identifier before matching, run duplicate detection, restrict who can merge records, and audit every merge.",
    assessmentBucket: "patient_data_collection",
  },
  {
    id: "hs-report-versions",
    rank: 4,
    nodeId: "report-generation",
    title: "Draft, final and corrected reports all exist at once",
    whatHappens:
      "A preliminary result is released, a validated version replaces it, and sometimes an amended version replaces that - but each was a separate file that had already been sent to a patient, a referring doctor or an insurer before the next one existed. Alongside this, an AI-suggested finding passes into the report without a documented human check.",
    whyItMatters:
      "Someone is acting on a superseded result: a treating doctor prescribing against a value that has since been corrected, or a patient told something that is no longer true. And a tool-generated interpretation that nobody separately verified becomes, in the record, indistinguishable from a clinical conclusion.",
    dataCategoryIds: ["lab-order-result", "diagnosis-treatment", "clinical-inference"],
    action:
      "Keep one authoritative version with a visible amendment history, require documented human validation before release, and make issuing a correction automatically notify every recipient the earlier version reached.",
    assessmentBucket: "health_data_sensitivity",
  },
  {
    id: "hs-referral-history",
    rank: 5,
    nodeId: "referral-packet",
    title: "A referral discloses far more history than the question needs",
    whatHappens:
      "One test request goes out with the full case history, prior reports and the working diagnosis attached - typically as a WhatsApp message or an email to a lab, an imaging centre or a specialist, with no record kept of what was sent or to whom.",
    whyItMatters:
      "The recipient is a separate organisation that now holds a complete clinical picture it never needed, keeps it permanently, and is under no written obligation about what happens to it next. The patient is almost never told the disclosure took place, so they cannot object to it or trace it later.",
    dataCategoryIds: ["clinical-history", "diagnosis-treatment", "lab-order-result", "communication-media"],
    action:
      "Send only the clinical indication the recipient needs to act on, use a recorded channel rather than a forwarded chat, tell the patient where their information is going, keep a register of referral destinations, and put confidentiality and retention terms in writing with regular partners.",
    assessmentBucket: "report_sharing_communication",
  },
  {
    id: "hs-tpa-claims",
    rank: 6,
    nodeId: "tpa-claims-portal",
    title: "Diagnosis reaches finance staff, insurers and employers",
    whatHappens:
      "Claims and pre-authorisations are filed with diagnosis codes and full supporting reports uploaded as evidence. Invoices print the procedure or test name. Corporate health-check results go back to the employer that paid for them, and rejected claim files sit in the portal indefinitely.",
    whyItMatters:
      "The patient's condition travels well beyond the people treating them - to billing staff who only needed an amount, to insurers and administrators the practice cannot audit or delete from, and to an employer who has no clinical relationship with their employee at all. Paying for a test is not the same as being entitled to the result.",
    dataCategoryIds: ["billing-insurance", "diagnosis-treatment", "lab-order-result", "patient-identity"],
    action:
      "Upload the minimum a claim requires rather than the whole report, separate financial access from clinical access, keep clinical detail off invoices where it is not needed, agree in writing exactly which summary an employer receives, tell patients before you disclose, and log every disclosure.",
    assessmentBucket: "system_staff_vendor_access",
  },
  {
    id: "hs-grievance-loop",
    rank: 7,
    nodeId: "grievance-register",
    title: "Corrections and wrong-recipient incidents stay in the chat",
    whatHappens:
      "A patient asks to see their records, disputes a result or reports that their report went to the wrong person. The request arrives on WhatsApp or at the desk, someone deals with it verbally, and the master record is never amended - nor are the people who already received the wrong version.",
    whyItMatters:
      "A correction that is agreed but not made leaves the wrong information in circulation and in every copy already sent. And because nothing was logged, the practice cannot show what it was asked, what it did, or how quickly - which is the record that matters most when a patient escalates.",
    dataCategoryIds: ["communication-media", "patient-identity", "lab-order-result", "diagnosis-treatment"],
    action:
      "Run one register for every access, correction, erasure and grievance request with an owner and a closure date, link each correction back to the master record with its history preserved, notify everyone who received the superseded version, and treat a wrong-recipient disclosure as an incident with a recorded response.",
    assessmentBucket: "retention_incident_readiness",
  },
  {
    id: "hs-deletion-gap",
    rank: 8,
    nodeId: "archive-backup",
    title: "Deleting the record reaches almost none of the copies",
    whatHappens:
      "Removing a patient from the clinical or laboratory system leaves them intact in nightly backups, years of email, the WhatsApp history, the doctor's laptop, the shared drive, the imaging archive, analyser memory, the reference lab, the insurer's file, the paper racks and the specimen still in the freezer.",
    whyItMatters:
      "This is the question the whole map exists to answer. If a patient asked you tomorrow to find every copy of their data, the honest answer for most practices is that they do not know where the copies are - and of the ones they can name, most they cannot reach.",
    dataCategoryIds: ["lab-order-result", "diagnosis-treatment", "diagnostic-image", "communication-media", "sample-specimen"],
    action:
      "List every place patient data lands, write a retention rule per record type, separate what you are genuinely required to keep from what is merely never deleted, build an erasure path that reaches devices, vendors, chats, backups and physical samples - and record honestly where it cannot reach and why.",
    assessmentBucket: "retention_incident_readiness",
  },
];

// Patient journey - a 14-stage superset, projected per operating model.
//
// This is the FIRST map in the series whose stage spine is itself model-gated.
// D2C and training institutes share one spine and only repopulate the systems;
// here that would be dishonest - a diagnostic lab has no consultation, and a
// standalone clinic has no analyser. Recruitment set the precedent (permanent
// sees 10 of 12 stages, staffing sees all 12).
//
//   integrated      -> all 14
//   clinic          -> 10 (no collection/home-collection/transport/processing)
//   diagnostic-lab  -> 12 (no consultation, no follow-up)
//
// EIGHT stages are all-model: booking, registration, orders, reporting,
// delivery, billing, grievance, archive. That number is load-bearing, not
// cosmetic - the eight hotspots are pinned one per all-model stage, which is
// what makes the journey's red flags reconcile with the hotspot counter in
// every model (see hotspots.ts).

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const CLINICS_DIAGNOSTIC_LABS_STAGES: FlowStage[] = [
  {
    id: "booking",
    name: "Appointment, enquiry & test booking",
    sequence: 1,
    summary:
      "A patient calls, walks in, sends a WhatsApp message, books online, or is referred by a doctor, a hospital or an employer's health-check programme. Symptoms and test names are described before any patient record exists to hold them.",
    dpdpaNote:
      "Give notice at the first point of contact, not at registration. Collect only what a booking needs - a clinical history is not required to reserve a slot - and keep enquiry channels inside systems you can search, restrict and delete from.",
  },
  {
    id: "registration",
    name: "Registration, identity & consent",
    sequence: 2,
    summary:
      "The patient is registered and given an ID. Name, contact, age, address, an emergency or family contact and - very often by default - a full identity document copy are captured across a paper form, the software and a document folder at once.",
    dpdpaNote:
      "Ask for the minimum registration needs and stop retaining identity-document copies you cannot justify. Record who the patient authorises to receive their information as a separate, specific permission - not as a phone number in a contact field.",
  },
  {
    id: "consultation",
    name: "Consultation & clinical documentation",
    sequence: 3,
    summary:
      "The doctor takes a history, examines, records vitals and reaches a diagnosis. Notes are split across the clinical system, paper case sheets, the doctor's own laptop and, increasingly, an AI scribe that hears the whole consultation.",
    dpdpaNote:
      "Keep clinical records in approved systems with role-based access, and approve any AI tool before it processes a consultation. Notes should be factual and clinical - and the patient must be able to have an inaccurate record corrected.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "orders",
    name: "Prescriptions, test orders & referrals",
    sequence: 4,
    summary:
      "A prescription is written, tests are ordered and the patient is referred onward - to an external lab, an imaging centre, a specialist or a pharmacy. Each of those carries a clinical reason out of the practice.",
    dpdpaNote:
      "Share the minimum the recipient needs to act: one test does not require a full history. Tell the patient where their information is being sent, and keep referrals inside recorded channels rather than forwarded chat messages.",
  },
  {
    id: "collection",
    name: "Sample collection & imaging",
    sequence: 5,
    summary:
      "A sample is drawn and labelled, or an image is taken. Physical specimens and image files are created that carry the patient's identity into places a database query will never reach.",
    dpdpaNote:
      "A labelled sample and a stored image are personal data in a physical place. Label in the patient's presence, keep visible identifiers to the minimum, and define who may access imaging systems and for how long images are kept.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "home-collection",
    name: "Home collection & field staff",
    sequence: 6,
    summary:
      "A phlebotomist travels to the patient's home carrying their name, number, address, test list and often the clinical reason - on a field app, and frequently on a personal phone alongside a maps and route history.",
    dpdpaNote:
      "A field worker is carrying patient data outside every system you control. Use managed devices, mask clinical detail where the visit does not need it, and remove patient contacts and route history when a collection closes or a staff member leaves.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "transport",
    name: "Transport, chain of custody & accession",
    sequence: 7,
    summary:
      "Samples move from a collection point to the main laboratory through transport boxes, manifests and couriers, and are logged in at an accession desk. Identity and specimen travel together, and can come apart.",
    dpdpaNote:
      "Use accession numbers rather than full identity on manifests and transport paperwork wherever the process allows, keep an auditable chain of custody, and set out responsibilities in writing where a courier moves samples for you.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "processing",
    name: "Laboratory processing, devices, outsourcing & AI",
    sequence: 8,
    summary:
      "The sample is run on analysers, results land in the laboratory system, and some tests are sent onward to a reference or specialist lab. Devices, middleware, technician worksheets and AI tools each keep their own copy.",
    dpdpaNote:
      "Inventory what your instruments and their middleware retain, use named rather than shared logins, control vendor remote access, and define exactly which identifiers travel with an outsourced test and what happens to the sample afterwards.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "reporting",
    name: "Validation, report generation & correction",
    sequence: 9,
    summary:
      "A result becomes a report: validated, interpreted, signed, sometimes corrected and re-issued. Draft, final and amended versions of the same report can exist at once, and an AI suggestion can quietly become a conclusion.",
    dpdpaNote:
      "Keep one authoritative version with an auditable amendment history, require a human to validate anything a tool suggested, and make sure a corrected report reaches everyone who received the wrong one.",
  },
  {
    id: "delivery",
    name: "Report delivery, family & third-party sharing",
    sequence: 10,
    summary:
      "The report goes out - to the patient, a spouse or parent, a referring doctor, a hospital, an employer who paid for a health check, or an insurer. Often over WhatsApp, an open link, or a printout collected at a counter.",
    dpdpaNote:
      "Verify who is receiving a report before it is sent, and treat a family member as a recipient the patient must specifically authorise. Use channels that can be limited and logged, and record every disclosure you make to an employer or insurer.",
  },
  {
    id: "billing",
    name: "Billing, insurance & TPA",
    sequence: 11,
    summary:
      "The visit or test is invoiced, paid and often claimed. Diagnosis codes, procedure descriptions and supporting clinical evidence travel to finance staff, insurers, third-party administrators and pre-authorisation portals.",
    dpdpaNote:
      "Keep clinical detail off an invoice unless it is genuinely needed, separate financial access from clinical access, send a claim the minimum it requires rather than the full record, and hold financial records under their own retention rule.",
  },
  {
    id: "followup",
    name: "Follow-up, chronic care & engagement",
    sequence: 12,
    summary:
      "The relationship continues: reminders, adherence checks, chronic-care programmes and wellness campaigns - increasingly segmented by the condition the patient was treated for.",
    dpdpaNote:
      "Keep care communication separate from marketing, use wording that does not disclose a condition to whoever picks up the phone, and let a patient step out of health-based segmentation without losing their clinical reminders.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "grievance",
    name: "Complaints, corrections & incidents",
    sequence: 13,
    summary:
      "A patient disputes a result, asks for a correction, or a report reaches the wrong person. The request usually arrives in the channel it was raised in and stays there.",
    dpdpaNote:
      "Run a formal register for access, correction and grievance requests, link every correction back to the master record with its history preserved, and treat a wrong-recipient disclosure as an incident with a recorded response.",
  },
  {
    id: "archive",
    name: "Archive, retention, sample disposal & deletion",
    sequence: 14,
    summary:
      "Long after the episode of care, the patient still exists in the clinical system, the laboratory system, imaging archives, analyser memory, email, WhatsApp, doctor devices, the reference lab, backups, paper racks and stored specimens.",
    dpdpaNote:
      "Write retention rules per record type, separate what you are required to keep from what is merely never deleted, and build an erasure path that reaches devices, vendors, communication channels, backups and physical samples - or record honestly why it cannot.",
  },
];

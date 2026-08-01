// Systems, repositories, devices, physical stores and people that hold patient
// data in a typical Indian clinic or diagnostic laboratory - NOT any specific
// practice (reference-model rule). Real categories of software are named (HIS,
// LIS, PACS, analyser middleware, remote-reporting portal, TPA pre-auth portal)
// because a generic "practice management system" fails the "that's my clinic"
// recognition test.
//
// GATING - the three operating models:
//   - no `businessModels`            -> shared core: all three models
//   - ["integrated","clinic"]        -> consultation-led surfaces
//   - ["integrated","diagnostic-lab"] -> sample- and instrument-led surfaces
//   - ["integrated"]                 -> only the fully integrated operation
// `integrated` appears in EVERY gated tag because it is both the default and the
// superset: it genuinely runs consultation AND diagnostics AND home collection,
// so it renders the full union while the other two render their honest, smaller
// picture.
//
// THE EIGHT HOTSPOT NODES are marked below. Each is ungated and pinned to
// EXACTLY ONE all-model stage. That is deliberate and load-bearing - see the
// header of hotspots.ts for why the count only reconciles if it stays that way.
//
// Physical samples, paper case sheets, file rooms and transport boxes are drawn
// as real nodes with the `physical_storage` type: a labelled specimen is
// personal data sitting in a place, and a map that only showed databases would
// miss the half of this sector that a database query can never reach.

import type { FlowNode } from "../../../data-flow/schemas.ts";

export const CLINICS_DIAGNOSTIC_LABS_NODES: FlowNode[] = [
  // ==== People ==============================================================
  {
    id: "patient",
    name: "Patient",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["booking", "registration", "consultation", "collection", "delivery"],
    description:
      "The data principal. One person with one name, one number and one body - everything else on this page is a copy, an observation, a specimen or an inference drawn from that.",
    dataCategoryIds: ["patient-identity", "patient-contact", "clinical-history", "government-id"],
    accessPersonaIds: ["patient"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "family-member",
    name: "Family member or caregiver",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["booking", "delivery", "billing"],
    description:
      "A spouse, parent, adult child or attendant who books the appointment, pays the bill or collects the report. They are a separate person receiving another adult's health data - and their number is very often the one saved on the record.",
    dataCategoryIds: ["family-caregiver", "patient-contact", "lab-order-result", "diagnosis-treatment"],
    accessPersonaIds: ["family-member"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A family contact stored for emergencies is routinely treated as standing permission to disclose diagnoses and reports, which is a decision only the patient can make.",
    riskAction:
      "Record who the patient specifically authorises to receive information, keep that separate from the emergency contact field, and verify identity before handing anything to a relative.",
  },
  {
    id: "phlebotomist",
    name: "Phlebotomist / collection staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["collection", "home-collection"],
    description:
      "Draws and labels the sample. In home collection this is the only role that routinely carries a patient's name, address, phone number and test list physically outside the practice.",
    dataCategoryIds: ["patient-identity", "patient-contact", "sample-specimen", "lab-order-result"],
    accessPersonaIds: ["phlebotomist"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Field staff hold live patient identity and address data away from every system the practice can audit, and often on equipment the practice does not own.",
    riskAction:
      "Issue managed devices and accounts, restrict what clinical detail the collection task displays, and revoke access and wipe local data the day someone leaves.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "referring-doctor",
    name: "Referring doctor",
    nodeType: "person",
    boundary: "client",
    stageIds: ["orders", "delivery"],
    description:
      "Orders the test or receives the referral, and keeps a copy of everything sent. Portal or WhatsApp access granted for one episode of care very often stays live long after that episode has ended.",
    dataCategoryIds: ["patient-identity", "diagnosis-treatment", "lab-order-result", "diagnostic-image"],
    accessPersonaIds: ["referring-doctor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A referring doctor is outside the practice, keeps their own copy indefinitely, and frequently retains standing access to a report list they no longer have a reason to see.",
    riskAction:
      "Send only the report the referral concerns, review who still has portal access each quarter, and close access when the episode of care closes.",
  },
  {
    id: "remote-pathologist",
    name: "Remote pathologist / radiologist",
    nodeType: "person",
    boundary: "vendor",
    stageIds: ["reporting"],
    description:
      "Validates results or reads images from outside the laboratory through a reporting portal - increasingly a contracted teleradiology or telepathology service rather than an employee.",
    dataCategoryIds: ["lab-order-result", "diagnostic-image", "patient-identity", "clinical-inference"],
    accessPersonaIds: ["pathologist", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Reporting happens on equipment and networks the practice does not control, and studies downloaded for reading routinely remain on the reader's machine.",
    riskAction:
      "Contract for no local retention, restrict downloads in the portal, and log which studies each remote reader opened.",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 1 · Appointment, enquiry & test booking =======================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `booking` only.
    id: "reception-whatsapp",
    name: "Reception phone & personal WhatsApp",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["booking"],
    description:
      "The number patients actually use. Symptoms, photographs of prescriptions, old reports and requests to 'send it on WhatsApp' arrive here - frequently on a staff member's own handset rather than a business account.",
    dataCategoryIds: ["patient-contact", "clinical-history", "communication-media", "diagnosis-treatment"],
    accessPersonaIds: ["reception-staff", "doctor"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Health information is disclosed before any patient record exists to govern it, into a channel with no access control, no retention rule and no way to export or search when the patient asks what you hold.",
    riskAction:
      "Move enquiries onto an official business number routed into the practice system, forbid patient conversations on personal handsets, set a media deletion rule, and give notice at first contact.",
  },
  {
    id: "appointment-register",
    name: "Appointment register & calendar",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["booking"],
    description:
      "The paper register on the desk or the shared calendar behind it, listing today's patients with their reason for visiting - readable by anyone standing at reception or passing the screen.",
    dataCategoryIds: ["patient-identity", "patient-contact", "appointment-visit", "clinical-history"],
    accessPersonaIds: ["reception-staff", "nurse", "doctor"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "booking-platform",
    name: "Online booking & call centre",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["booking"],
    description:
      "The website form, app or call desk that takes appointments and test bookings, capturing contact details, the test or specialism wanted and often a free-text description of the problem.",
    dataCategoryIds: ["patient-identity", "patient-contact", "appointment-visit", "clinical-history"],
    accessPersonaIds: ["reception-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "corporate-client",
    name: "Corporate health-check client & roster",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["booking", "delivery"],
    description:
      "An employer that pays for staff health checks, supplies a roster of employees to be tested, and expects results back. The employee is the patient; the employer is not.",
    dataCategoryIds: ["patient-identity", "patient-contact", "lab-order-result", "billing-insurance"],
    accessPersonaIds: ["tpa-coordinator", "reception-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Paying for a test is routinely treated as entitlement to the result, so full reports reach an employer who has no clinical relationship with the employee and no basis to hold their diagnosis.",
    riskAction:
      "Agree in writing exactly which summary the employer receives, send the full report only to the patient, and log every employer disclosure.",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 2 · Registration, identity & consent ==========================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `registration` only.
    id: "id-document-store",
    name: "Identity documents & patient master",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["registration"],
    description:
      "The registration form, the scanned Aadhaar or insurance card, and the master patient index they feed. Paper, scan and database record become three competing versions of who this patient is.",
    dataCategoryIds: ["government-id", "patient-identity", "patient-contact", "family-caregiver"],
    accessPersonaIds: ["reception-staff", "billing-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Full identity documents are collected by default rather than by necessity and then kept indefinitely, while manual matching across paper and screen creates duplicate profiles - the condition in which a result gets attached to the wrong person.",
    riskAction:
      "Define the minimum registration set, stop retaining ID copies you cannot justify, verify against more than one identifier, run duplicate detection, and audit every patient-record merge.",
  },
  {
    id: "clinic-software",
    name: "Clinic software / HIS patient record",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["registration", "consultation", "orders", "billing"],
    description:
      "The practice's core record: registration, visit history, clinical notes, orders and billing in one place - which is also why reception and finance users routinely see clinical detail they do not need.",
    dataCategoryIds: [
      "patient-identity",
      "patient-contact",
      "appointment-visit",
      "clinical-history",
      "diagnosis-treatment",
      "billing-insurance",
    ],
    accessPersonaIds: ["reception-staff", "doctor", "nurse", "billing-staff", "it-admin"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "One shared record with broad roles means the whole clinical history is reachable by anyone logged in, and small practices commonly share a single administrator login.",
    riskAction:
      "Apply role-based access so finance and reception cannot open clinical notes, give every user a named account, and review the access log for record openings without a matching visit.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "lis",
    name: "Laboratory information system (LIS)",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["registration", "orders", "processing", "reporting"],
    description:
      "The laboratory's spine: patient master, accession numbers, test orders, results and report status. Everything the lab does is keyed to the accession it creates here.",
    dataCategoryIds: [
      "patient-identity",
      "patient-contact",
      "lab-order-result",
      "sample-specimen",
      "billing-insurance",
    ],
    accessPersonaIds: ["reception-staff", "lab-technician", "pathologist", "it-admin", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "The LIS holds every result the laboratory has ever produced, and its vendor typically retains remote support access that can reach live patient data without the lab seeing when it is used.",
    riskAction:
      "Use named logins, restrict who can export or merge patients, and put vendor remote access behind explicit approval with a log the lab can read.",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 3 · Consultation & clinical documentation =====================
  {
    id: "emr",
    name: "Electronic medical record & clinical notes",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["consultation", "orders", "reporting"],
    description:
      "Where the history, examination findings, diagnosis, allergies and treatment plan are written - the highest-impact record the practice creates, and the one the patient has least visibility of.",
    dataCategoryIds: ["clinical-history", "diagnosis-treatment", "prescription-medication", "patient-identity"],
    accessPersonaIds: ["doctor", "nurse", "it-admin"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "Clinical notes carry diagnoses a patient may never have discussed with anyone else, and are frequently readable by staff whose role does not require them.",
    riskAction:
      "Restrict clinical notes to the care team, log access, keep notes factual rather than editorial, and give patients a route to have an inaccurate record corrected.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "doctor-device",
    name: "Doctor's laptop, tablet & downloads",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["consultation", "reporting", "archive"],
    description:
      "The personal machine a consultant actually works on: notes typed offline, reports downloaded to read, images saved 'temporarily' to a desktop folder, and a WhatsApp Web session open beside them.",
    dataCategoryIds: ["clinical-history", "diagnosis-treatment", "lab-order-result", "diagnostic-image"],
    accessPersonaIds: ["doctor"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Patient records accumulate on a device the practice does not administer, cannot wipe, and would not be able to search if a patient asked what is held about them.",
    riskAction:
      "Work inside the clinical system rather than local copies, disable or time-limit downloads, encrypt any device that holds patient data, and clear local folders on a schedule.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "ai-scribe",
    name: "AI scribe & dictation tool",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["consultation"],
    description:
      "A transcription or summarisation tool that listens to the consultation and drafts the note. Often adopted by an individual doctor, on a consumer plan, without the practice knowing it is in use.",
    dataCategoryIds: ["clinical-history", "diagnosis-treatment", "clinical-inference", "patient-identity"],
    accessPersonaIds: ["doctor", "vendor-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The entire consultation - including everything the patient said in confidence - is sent to an outside processor with no contract, no stated retention, and frequently no restriction on the recording being used to improve the vendor's model.",
    riskAction:
      "Approve clinical AI tools before use, contract for no training on your data and a defined retention period, tell patients when a consultation is being transcribed, and require the doctor to review the draft before it enters the record.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "paper-case-file",
    name: "Paper case sheets & prescription pad",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["consultation", "archive"],
    description:
      "The physical file that still runs alongside the software in most Indian clinics - case sheets, carbon copies of prescriptions and referral slips, stacked at the desk during the day.",
    dataCategoryIds: ["clinical-history", "diagnosis-treatment", "prescription-medication", "patient-identity"],
    accessPersonaIds: ["doctor", "nurse", "reception-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["integrated", "clinic"],
  },

  // ==== Stage 4 · Prescriptions, test orders & referrals ====================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `orders` only.
    id: "referral-packet",
    name: "Referral letters & shared history",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["orders"],
    description:
      "What actually leaves the practice with a referral: a letter, a prescription photograph, prior reports and often the whole case history - sent by email or WhatsApp to a lab, an imaging centre or a specialist.",
    dataCategoryIds: ["diagnosis-treatment", "clinical-history", "lab-order-result", "communication-media"],
    accessPersonaIds: ["doctor", "reception-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "One test request routinely carries a complete clinical history to an outside organisation, through a channel with no delivery control - and the patient is usually never told what was disclosed or to whom.",
    riskAction:
      "Send only the clinical indication the recipient needs to act on, use a recorded channel rather than a forwarded chat, tell the patient where their information is going, and keep a register of referral destinations.",
  },
  {
    id: "e-prescription",
    name: "Prescription issue & copies",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["orders"],
    description:
      "The prescription as issued and as it then multiplies - printed, photographed by the patient, forwarded to a relative, saved in the staff phone's gallery and re-sent months later as a repeat.",
    dataCategoryIds: ["prescription-medication", "diagnosis-treatment", "patient-identity", "communication-media"],
    accessPersonaIds: ["doctor", "reception-staff", "patient"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "order-entry",
    name: "Test order entry & accessioning",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["orders", "collection"],
    description:
      "Where a requested panel becomes a numbered order with a barcode, fasting status, priority and collection instructions - the point at which the patient becomes an accession number.",
    dataCategoryIds: ["lab-order-result", "patient-identity", "sample-specimen", "clinical-history"],
    accessPersonaIds: ["reception-staff", "lab-technician", "phlebotomist"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "external-lab-imaging",
    name: "External lab & imaging centre",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["orders", "reporting"],
    description:
      "The laboratory or imaging centre a clinic refers out to. It receives the patient's identity, contact and clinical reason, and returns a report - keeping its own permanent copy of both.",
    dataCategoryIds: ["patient-identity", "patient-contact", "diagnosis-treatment", "lab-order-result", "diagnostic-image"],
    accessPersonaIds: ["vendor-staff", "doctor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A referral partner holds a full copy of the patient's identity and results indefinitely, usually with no written terms on retention, onward sharing or deletion, and often pays or receives a referral commission that creates a second record of the patient.",
    riskAction:
      "Put retention, confidentiality and deletion terms in writing with every referral partner, send the minimum identifiers, and ask what they still hold for patients you referred last year.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["orders"],
    description:
      "Where the prescription is filled - in-house, next door or online. Receives the medicines, the dose and, printed on the same slip, the diagnosis that explains them.",
    dataCategoryIds: ["prescription-medication", "diagnosis-treatment", "patient-identity", "patient-contact"],
    accessPersonaIds: ["patient", "family-member"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["integrated", "clinic"],
  },

  // ==== Stage 5 · Sample collection & imaging ===============================
  {
    id: "collection-desk",
    name: "Collection desk, barcodes & requisitions",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["collection"],
    description:
      "The counter where samples are drawn and labelled. Barcode labels, paper requisitions and the day's collection log sit on an open surface with the next patient standing at it.",
    dataCategoryIds: ["sample-specimen", "patient-identity", "lab-order-result"],
    accessPersonaIds: ["phlebotomist", "lab-technician", "reception-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "sample-tube",
    name: "Labelled sample & requisition form",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["collection", "transport"],
    description:
      "The specimen itself, carrying a label that ties it to a named person - and sometimes prints the test name in full, so what is being tested for is visible to everyone who handles it.",
    dataCategoryIds: ["sample-specimen", "patient-identity", "lab-order-result"],
    accessPersonaIds: ["phlebotomist", "lab-technician"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Physical identity and physical specimen are joined by a label applied by hand; pre-labelling, re-labelling or a mix-up at this point is how a result reaches the wrong patient, and the test name printed on the tube discloses the condition to anyone handling it.",
    riskAction:
      "Label in the patient's presence after confirming two identifiers, print the accession rather than the test name where the workflow allows, and record every re-labelling and recollection.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "imaging-modality",
    name: "Imaging equipment & modality console",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["collection"],
    description:
      "The X-ray, ultrasound, CT or MRI machine and the workstation beside it. The study carries patient identity inside the image file itself, and the console keeps a local worklist of who was scanned.",
    dataCategoryIds: ["diagnostic-image", "patient-identity", "diagnosis-treatment"],
    accessPersonaIds: ["lab-technician", "pathologist", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Identity is embedded in the image metadata and cached on the console, so a device that is serviced, resold or accessed by a vendor engineer carries named patient studies with it.",
    riskAction:
      "Set the console to purge local studies on a schedule, control physical and remote access to the workstation, and require secure wipe in the service and disposal contract.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "pacs",
    name: "Imaging archive (PACS)",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["collection", "processing", "reporting", "archive"],
    description:
      "Where studies are stored and read from, usually for as long as the storage lasts. Images are rarely covered by any retention rule, and are often the oldest patient data a practice still holds.",
    dataCategoryIds: ["diagnostic-image", "patient-identity", "diagnosis-treatment"],
    accessPersonaIds: ["pathologist", "doctor", "lab-technician", "it-admin", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Imaging archives accumulate indefinitely by default, are frequently reachable by every clinical login, and are almost never included when a practice tries to answer a deletion request.",
    riskAction:
      "Define an image retention period per study type, restrict archive access to those reading or treating, log study opens, and include imaging in every access and erasure workflow.",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 6 · Home collection & field staff =============================
  {
    id: "home-collection-app",
    name: "Home-collection app & task list",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["home-collection"],
    description:
      "The field application that assigns visits: patient name, mobile number, full home address, the tests booked and any special instruction, pushed to whoever is on route that morning.",
    dataCategoryIds: ["patient-identity", "patient-contact", "lab-order-result", "appointment-visit"],
    accessPersonaIds: ["phlebotomist", "reception-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "phlebotomist-phone",
    name: "Collection staff's personal phone",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["home-collection"],
    description:
      "The handset the visit actually runs on: the patient saved as a contact, the address in the maps history, a WhatsApp thread to confirm timing, a photo of the requisition, and a payment screenshot.",
    dataCategoryIds: ["patient-contact", "patient-identity", "communication-media", "billing-insurance"],
    accessPersonaIds: ["phlebotomist"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A home address, a phone number and the fact that someone is being tested for something end up on a personal device the practice cannot audit or wipe - and stay there when the staff member changes job.",
    riskAction:
      "Move field work onto managed devices and accounts, forbid saving patients as personal contacts, mask clinical detail the visit does not need, and enforce a wipe-and-revoke step in the exit process.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "route-maps",
    name: "Route planning & maps service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["home-collection"],
    description:
      "The navigation and route-optimisation tooling that turns the morning's patients into a sequence of stops - building a record of which homes were visited, when, and in what order.",
    dataCategoryIds: ["patient-contact", "appointment-visit", "patient-identity"],
    accessPersonaIds: ["phlebotomist", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A history of addresses visited by a diagnostic service is itself health-revealing, and it accumulates inside a third-party mapping account nobody treats as a patient-data system.",
    riskAction:
      "Use a business account with retention controls rather than a personal one, avoid passing patient names into the mapping tool, and clear route history on a defined schedule.",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 7 · Transport, chain of custody & accession ===================
  {
    id: "transport-box",
    name: "Transport box, manifest & custody log",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["transport"],
    description:
      "Samples in transit between a collection centre and the main lab, with a manifest listing patient names and tests, and a custody log recording dispatch, receipt, temperature and any rejection.",
    dataCategoryIds: ["sample-specimen", "patient-identity", "lab-order-result"],
    accessPersonaIds: ["phlebotomist", "lab-technician"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The manifest is a printed list of named people and what they are being tested for, travelling in a vehicle - and a break in custody is how a specimen and an identity come apart.",
    riskAction:
      "Print accession numbers rather than names and test titles on manifests, keep an auditable custody record with named handovers, and destroy transport paperwork once receipt is confirmed.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "courier-partner",
    name: "Courier & logistics partner",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["transport", "processing"],
    description:
      "The third party that physically moves samples between centres, or onward to a reference laboratory - holding pickup addresses, consignment records and the patient identifiers on the packaging.",
    dataCategoryIds: ["sample-specimen", "patient-identity", "patient-contact"],
    accessPersonaIds: ["vendor-staff", "lab-technician"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 8 · Laboratory processing, devices, outsourcing & AI ==========
  {
    id: "analyser",
    name: "Analysers, middleware & instrument memory",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["processing"],
    description:
      "Haematology, biochemistry, microbiology and molecular instruments, and the middleware between them and the LIS. Each keeps its own local store of results, quality-control runs and reruns.",
    dataCategoryIds: ["lab-order-result", "patient-identity", "sample-specimen"],
    accessPersonaIds: ["lab-technician", "vendor-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Patient results live inside instruments and middleware that nobody counts as a patient-data system - reachable by shared technician logins and by vendor engineers on remote support, exportable to USB, and untouched by any deletion the practice performs in the LIS.",
    riskAction:
      "Inventory what each instrument and its middleware retains and for how long, replace shared logins with named accounts, restrict USB and file export, gate vendor remote access behind approval and logging, and include instruments in the retention and disposal policy.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "technician-worksheet",
    name: "Technician worksheets & spreadsheets",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["processing"],
    description:
      "The parallel record the bench actually runs on: printed worklists, an Excel file tracking pending and repeat tests, and handwritten notes on borderline results.",
    dataCategoryIds: ["lab-order-result", "patient-identity", "clinical-inference"],
    accessPersonaIds: ["lab-technician", "pathologist"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A second, unmanaged copy of live results sits outside the LIS, is shared and forwarded freely, and is invisible to every access, correction and deletion request made against the real system.",
    riskAction:
      "Replace tracking spreadsheets with a permissioned view in the LIS, restrict who can export results, and shred or delete printed worklists at the end of each run.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "reference-lab",
    name: "Reference & specialist laboratory",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["processing", "reporting"],
    description:
      "Where tests the lab cannot run itself are sent - histopathology, molecular panels, genetic testing. Both the sample and the patient's identifiers leave, and the sample may be stored there afterwards.",
    dataCategoryIds: ["sample-specimen", "lab-order-result", "patient-identity", "diagnosis-treatment"],
    accessPersonaIds: ["vendor-staff", "pathologist"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The highest-impact results a laboratory handles - including genetic findings that also imply things about the patient's family - are processed by an outside organisation, usually with more identifiers than the test needs, unnamed sub-processors, and no stated rule on how long the physical sample is kept.",
    riskAction:
      "Send the minimum identifiers the test requires, contract for named sub-processors, a defined report and specimen retention period and a deletion or disposal confirmation, and tell patients when a sample is being sent onward.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "ai-diagnostic",
    name: "AI result & image analysis tool",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["processing"],
    description:
      "Software that pre-reads an image or flags an abnormal result before a human looks at it, returning a suggested finding that then travels with the case.",
    dataCategoryIds: ["diagnostic-image", "lab-order-result", "clinical-inference", "patient-identity"],
    accessPersonaIds: ["pathologist", "lab-technician", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Identifiable studies and results are sent to an outside processor whose retention and model-training terms are rarely checked, and its suggestion can harden into a conclusion that no human separately verified.",
    riskAction:
      "Keep an approved-tool register with written processing terms, contract against training on your data, require documented human validation of every AI-assisted finding, and record which tool contributed to a report.",
    businessModels: ["integrated", "diagnostic-lab"],
  },

  // ==== Stage 9 · Validation, report generation & correction ================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `reporting` only.
    id: "report-generation",
    name: "Report drafts, versions & corrections",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["reporting"],
    description:
      "The validation queue and the report it produces - preliminary, final, and sometimes amended. Each version is a separate PDF that has usually already been sent somewhere by the time the next one exists.",
    dataCategoryIds: ["lab-order-result", "diagnosis-treatment", "clinical-inference", "patient-identity"],
    accessPersonaIds: ["pathologist", "doctor", "lab-technician", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Draft, final and corrected versions of the same report coexist across systems, inboxes and chats, so a patient or a treating doctor can be acting on a superseded result - and an unreviewed tool-generated interpretation can pass into the record as fact.",
    riskAction:
      "Keep one authoritative version with a visible amendment history, require documented human validation before release, and make re-issuing a correction automatically notify everyone the earlier version reached.",
  },
  {
    id: "remote-reporting-portal",
    name: "Remote reporting portal",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["reporting"],
    description:
      "The teleradiology or telepathology platform through which an outside specialist opens the study, dictates a finding and returns a signed report.",
    dataCategoryIds: ["diagnostic-image", "lab-order-result", "patient-identity", "clinical-inference"],
    accessPersonaIds: ["pathologist", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Full studies leave the practice for a platform and a reader it does not control, and downloaded copies routinely remain on the reader's own machine after the report is filed.",
    riskAction:
      "Contract for no local retention and defined platform retention, disable download where viewing is enough, and review the portal's access log against the cases actually reported.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "inbound-report-inbox",
    name: "Inbound reports by email & WhatsApp",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["reporting"],
    description:
      "How reports come back to a clinic that referred out: as attachments in an inbox and a chat thread, downloaded to read, and sometimes filed into the patient record afterwards.",
    dataCategoryIds: ["lab-order-result", "diagnostic-image", "communication-media", "patient-identity"],
    accessPersonaIds: ["doctor", "reception-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Results for many patients accumulate in a general inbox and a chat history that reception can also see, with the wrong report occasionally attached to the wrong patient and no record of which copy is authoritative.",
    riskAction:
      "Import reports into the patient record on arrival and delete the working copy, restrict who can open the clinical inbox, and confirm patient identity on the report before filing it.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "shared-drive",
    name: "Shared drive & staff folders",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["reporting", "archive"],
    description:
      "The practice's general storage - scanned reports, exported lists, old templates and a folder of PDFs someone needed once. Access was granted by convenience and has never been reviewed.",
    dataCategoryIds: ["lab-order-result", "diagnostic-image", "patient-identity", "billing-insurance"],
    accessPersonaIds: ["reception-staff", "billing-staff", "doctor", "it-admin"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Patient reports sit in general-purpose folders that most of the staff can open, that ex-staff accounts often still reach, and that nobody searches when an access or deletion request arrives.",
    riskAction:
      "Inventory what patient data the drive holds, restrict folders to the roles that need them, remove accounts at exit, and clear out ad-hoc exports on a schedule.",
  },
  {
    id: "government-reporting",
    name: "Statutory disease notification",
    nodeType: "system",
    boundary: "government",
    stageIds: ["reporting"],
    description:
      "The separate, legally required route by which certain notifiable conditions are reported to public health authorities - distinct from anything the practice shares by choice.",
    dataCategoryIds: ["diagnosis-treatment", "patient-identity", "lab-order-result"],
    accessPersonaIds: ["doctor", "pathologist"],
    retentionDefined: true,
    riskLevel: "low",
  },

  // ==== Stage 10 · Report delivery, family & third-party sharing ============
  {
    // ★ HOTSPOT NODE - ungated, pinned to `delivery` only.
    id: "report-delivery-channel",
    name: "Report delivery - WhatsApp, link, email & counter",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["delivery"],
    description:
      "How the report actually reaches people: a WhatsApp message to the number on file, an unauthenticated download link by SMS, an email attachment, or a printout collected by whoever comes to the desk.",
    dataCategoryIds: ["lab-order-result", "diagnosis-treatment", "diagnostic-image", "communication-media"],
    accessPersonaIds: ["reception-staff", "patient", "family-member", "referring-doctor"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the moment the practice's most sensitive artefact leaves, and it is usually sent without establishing who will receive it - a shared family handset, a mistyped number, a link anyone can forward, or a counter collection by an unverified relative. A wrong send cannot be recalled.",
    riskAction:
      "Verify the recipient against the record before sending, make the authenticated portal the default channel, use expiring links where a link is unavoidable, require identity at counter collection, and log every delivery so a wrong send can be traced.",
  },
  {
    id: "patient-portal",
    name: "Patient portal & report download",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["delivery"],
    description:
      "The authenticated account where a patient can see and download their reports - the safest channel available, and frequently the one bypassed because sending a WhatsApp message is faster.",
    dataCategoryIds: ["lab-order-result", "diagnostic-image", "patient-identity", "patient-contact"],
    accessPersonaIds: ["patient", "it-admin", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: ["integrated", "diagnostic-lab"],
  },
  {
    id: "hospital-partner",
    name: "Hospital & specialist recipient",
    nodeType: "system",
    boundary: "client",
    stageIds: ["delivery"],
    description:
      "A hospital or specialist receiving the patient onward, together with the reports, images and history that came before - and keeping all of it in their own record permanently.",
    dataCategoryIds: ["lab-order-result", "diagnostic-image", "diagnosis-treatment", "patient-identity"],
    accessPersonaIds: ["referring-doctor", "doctor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A complete clinical picture is transferred to another organisation that the practice has no visibility into, frequently in a single bundle rather than the part the referral concerns.",
    riskAction:
      "Share what the onward episode requires rather than the whole file, record the disclosure against the patient record, and tell the patient what was sent and to whom.",
  },

  // ==== Stage 11 · Billing, insurance & TPA =================================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `billing` only.
    id: "tpa-claims-portal",
    name: "Insurer, TPA & pre-authorisation portal",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["billing"],
    description:
      "Where a claim is filed: diagnosis codes, procedure detail, and supporting reports and images uploaded as evidence - into systems run by insurers and third-party administrators.",
    dataCategoryIds: ["billing-insurance", "diagnosis-treatment", "lab-order-result", "patient-identity"],
    accessPersonaIds: ["billing-staff", "tpa-coordinator"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Full reports are uploaded where a summary would settle the claim, to separate controllers the practice cannot audit or delete from; rejected claim files sit there indefinitely; and the patient is rarely told how much of their record was disclosed.",
    riskAction:
      "Upload the minimum the claim requires, tell the patient what is being shared before filing, restrict claim-file access inside the practice, and ask insurers and administrators what they retain and for how long.",
  },
  {
    id: "billing-system",
    name: "Billing system & invoices",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["billing"],
    description:
      "Invoices, receipts and payment records - which routinely print the procedure or test name, and therefore the condition, on a document handed to whoever is paying.",
    dataCategoryIds: ["billing-insurance", "patient-identity", "diagnosis-treatment", "patient-contact"],
    accessPersonaIds: ["billing-staff", "reception-staff", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway & bank",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["billing"],
    description:
      "Where the money moves - UPI, card or online payment, carrying the patient's name, the amount and a reference that frequently names the practice's specialism.",
    dataCategoryIds: ["billing-insurance", "patient-identity", "patient-contact"],
    accessPersonaIds: ["billing-staff", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "accounting-archive",
    name: "Accounting records & finance exports",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["billing", "archive"],
    description:
      "The finance side's own copy: ledgers, reconciliation spreadsheets and exported patient-wise billing lists that are kept for tax purposes long after the clinical record would have been closed.",
    dataCategoryIds: ["billing-insurance", "patient-identity", "diagnosis-treatment"],
    accessPersonaIds: ["billing-staff", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // ==== Stage 12 · Follow-up, chronic care & engagement =====================
  {
    id: "crm-reminder",
    name: "Reminder & campaign platform",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["followup"],
    description:
      "The messaging tool that sends appointment reminders, test-due recalls and health-package offers - segmented, increasingly, by what the patient was previously treated for.",
    dataCategoryIds: ["patient-contact", "chronic-care-profile", "marketing-segment", "appointment-visit"],
    accessPersonaIds: ["reception-staff", "it-admin", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Clinical history becomes a marketing segment, and a message naming a test or condition arrives on a phone that may be shared with the family - disclosing the condition to whoever reads it.",
    riskAction:
      "Keep care reminders separate from promotional campaigns, use wording that does not name the condition, take a separate permission for marketing, and let a patient leave health-based segmentation without losing clinical recalls.",
    businessModels: ["integrated", "clinic"],
  },
  {
    id: "care-management",
    name: "Chronic-care & wellness programme",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["followup"],
    description:
      "A programme that tracks patients with ongoing conditions across branches - adherence, missed visits, risk category and who to call next - building a profile the patient has never seen.",
    dataCategoryIds: ["chronic-care-profile", "diagnosis-treatment", "patient-contact", "clinical-inference"],
    accessPersonaIds: ["doctor", "nurse", "reception-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Risk categories and adherence scores are inferences the practice created, not facts the patient supplied - they shape how the person is treated and contacted, and there is usually no way for them to see or challenge one.",
    riskAction:
      "Write down how a category is assigned and reviewed, restrict who can see it, disclose that the profiling happens, and give patients a route to see and correct it.",
    businessModels: ["integrated"],
  },

  // ==== Stage 13 · Complaints, corrections & incidents ======================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `grievance` only.
    id: "grievance-register",
    name: "Complaints, corrections & rights requests",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["grievance"],
    description:
      "Where a patient's request to see, correct or erase their data actually lands - usually a WhatsApp message to reception, a phone call, or a complaint made at the desk, and rarely a register at all.",
    dataCategoryIds: ["communication-media", "patient-identity", "diagnosis-treatment", "lab-order-result"],
    accessPersonaIds: ["reception-staff", "doctor", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Requests are answered in the channel they arrived in and never reach the master record, so a correction is agreed but not made, the earlier version stays in circulation, and the practice cannot show what it was asked or what it did.",
    riskAction:
      "Run one register for every access, correction, erasure and grievance request with owner and closure date, link each correction to the record with its history preserved, and notify everyone who received the superseded version.",
  },
  {
    id: "incident-file",
    name: "Incident file & investigation evidence",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["grievance", "archive"],
    description:
      "What a wrong-recipient disclosure or a disputed result leaves behind: screenshots, the chat that proves what was sent, staff statements and the report versions involved - kept indefinitely, just in case.",
    dataCategoryIds: ["communication-media", "diagnosis-treatment", "lab-order-result", "patient-identity"],
    accessPersonaIds: ["it-admin", "doctor", "reception-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ==== Stage 14 · Archive, retention, disposal & deletion ==================
  {
    // ★ HOTSPOT NODE - ungated, pinned to `archive` only.
    id: "archive-backup",
    name: "Backups, email archive & chat history",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "The layer nobody administers: nightly backups of the clinical and laboratory systems, years of email, and a WhatsApp history containing reports sent to hundreds of patients.",
    dataCategoryIds: [
      "lab-order-result",
      "diagnosis-treatment",
      "diagnostic-image",
      "communication-media",
      "patient-identity",
    ],
    accessPersonaIds: ["it-admin", "reception-staff", "doctor", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the question the whole map exists to answer: deleting a patient from the clinical system reaches none of this, nor the analysers, the reference lab, the doctor's laptop, the imaging archive or the stored specimen - and most practices cannot even list where the copies are.",
    riskAction:
      "List every place patient data lands, set a retention rule per record type, separate what you are required to keep from what is merely never deleted, build an erasure path that reaches devices, vendors, chats, backups and samples, and record honestly where it cannot reach.",
  },
  {
    id: "physical-file-room",
    name: "Paper file room & printed reports",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "Racks of case sheets, uncollected printed reports and old registration forms - typically stored until the space runs out rather than until a retention period expires.",
    dataCategoryIds: ["clinical-history", "diagnosis-treatment", "lab-order-result", "government-id"],
    accessPersonaIds: ["reception-staff", "doctor", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "stored-samples",
    name: "Retained specimens & disposal records",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "Samples kept after testing - for repeats, for quality control, or because nobody decided otherwise - each still labelled with the person it came from, alongside the log of what was disposed of and when.",
    dataCategoryIds: ["sample-specimen", "patient-identity", "lab-order-result"],
    accessPersonaIds: ["lab-technician", "pathologist"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A stored specimen is identifiable personal data in a freezer, retained by default rather than by decision, and it is never included when a practice answers a request to erase someone's data.",
    riskAction:
      "Set a storage period per specimen type with documented disposal, tell patients when a sample will be retained, and include physical specimens in the retention policy and every erasure workflow.",
    businessModels: ["integrated", "diagnostic-lab"],
  },
];

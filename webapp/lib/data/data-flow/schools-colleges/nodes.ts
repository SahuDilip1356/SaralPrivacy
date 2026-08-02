// Every place one student's data lands in a school, college or campus group.
//
// NAMING THE REAL THINGS. A map that says "student information system" and stops
// there fails the "that is my school" test. This one names the parent WhatsApp
// group, the teacher's own laptop, the fingerprint terminal at the gate, the bus
// GPS unit and the driver's personal phone, the counsellor's notebook, the marks
// spreadsheet that never gets deleted, the board portal export, the event
// photographer's raw files, and the record room nobody has opened in nine years.
//
// PHYSICAL THINGS ARE NODES. `physical_storage` covers the admission file, the
// class register, the emergency contact sheet, the printed route list and the
// archive room. A map showing only databases would miss the half of an
// institution that no database query can reach.
//
// ⚠️ HOTSPOT NODES. Eight nodes below are hotspot anchors, and each one's
// EARLIEST stage (by sequence) is an ALL-MODEL stage, unique among the eight:
//   consent-record -> admission(2)   student-erp -> enrolment(3)
//   public-ai-tool -> learning(4)    cctv-system -> monitoring(5)
//   counselling-notes -> wellbeing(8)  fee-portal -> fees(10)
//   public-website-social -> communication(13)  erp-archive -> exit(15)
// They may span LATER stages (the ERP genuinely does), but never an earlier one
// - the journey resolves a node to the first of its stages visible in the chosen
// model, so an earlier gated stage would move the flag in some models and break
// the reconciliation. See hotspots.ts.

import type { FlowNode } from "../../../data-flow/schemas.ts";

export const SCHOOLS_COLLEGES_NODES: FlowNode[] = [
  // ==== People ==============================================================
  // Actors, not systems: they are excluded from the "places your data ends up"
  // count and exist so a movement has an honest starting point. The guardian
  // sits in the `candidate` boundary because for a minor they exercise the
  // child's rights - see personas.ts for why that stops being true at 18.
  {
    id: "student",
    name: "Student",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "admission", "enrolment", "learning", "monitoring", "assessment", "communication", "exit"],
    description:
      "The data principal. Present for almost every entry in the record and the author of almost none of it - and for most of the years covered by this map, not the person who can consent to any of it.",
    dataCategoryIds: ["student-identity", "student-contact", "academic-record", "learning-activity"],
    accessPersonaIds: ["student"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "parent-guardian",
    name: "Parent or guardian",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "admission", "enrolment", "monitoring", "fees", "communication", "exit"],
    description:
      "Enquires, applies, signs, pays and receives everything the institution sends about the child. Which guardian is authorised for what is usually assumed from whichever number answered the phone.",
    dataCategoryIds: ["guardian-family", "student-contact", "fee-financial", "government-id"],
    accessPersonaIds: ["parent-guardian"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "class-teacher",
    name: "Class teacher / faculty",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["learning", "assessment", "wellbeing", "communication"],
    description:
      "Observes, marks, records and communicates - producing much of what ends up permanently attached to a child, on tools they largely choose themselves, and moving to another institution every few years.",
    dataCategoryIds: ["academic-record", "attendance-behaviour", "learner-profile", "health-support"],
    accessPersonaIds: ["teacher"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 1. Enquiry, prospectus & campus visit
  // -------------------------------------------------------------------------
  {
    id: "enquiry-form",
    name: "Website enquiry & prospectus form",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry"],
    description:
      "The form on the institution's website that a parent fills in to ask about fees, availability or a campus visit. Typically asks for the child's name, age and current school alongside the parent's contact details and occupation.",
    dataCategoryIds: ["student-identity", "guardian-family", "student-contact", "academic-record"],
    accessPersonaIds: ["admissions-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "admissions-crm",
    name: "Admissions CRM & enquiry register",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry", "admission"],
    description:
      "Where every enquiry is tracked: source, counsellor notes, follow-up status and an admission-likelihood rating. Holds families who enrolled, families who chose another institution, and families who only ever asked a question.",
    dataCategoryIds: ["student-identity", "guardian-family", "student-contact", "engagement-segment"],
    accessPersonaIds: ["admissions-staff", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A child who never joined the institution still has a profile here years later, complete with the family's contact details and a rating of how likely they were to pay. Nobody ever set a date for deleting it, and the list is the one most often exported when a new campaign is planned.",
    riskAction:
      "Set a retention period for enquiries that do not convert and enforce it, keep counsellor notes factual, and separate admission follow-up from promotional marketing so a declined family stops being contacted.",
  },
  {
    id: "reception-whatsapp",
    name: "Reception & counsellor WhatsApp",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["enquiry", "admission", "communication"],
    description:
      "The number printed on the hoarding and the admission counsellor's own handset. Parents send the child's details, photograph their previous report card and forward birth certificates here, and the thread stays on a personal phone.",
    dataCategoryIds: ["student-identity", "guardian-family", "government-id", "academic-record", "media-content"],
    accessPersonaIds: ["admissions-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A child's identity documents and academic history arrive in a channel with no access control, no retention rule and no way to search or export it. When a parent asks what the institution holds, this cannot be answered - and when the counsellor changes jobs, the entire history leaves with the phone.",
    riskAction:
      "Move admission enquiries onto an official business number that routes into the CRM, forbid document collection over personal handsets, give notice at first contact, and set a deletion rule for media received during admissions.",
  },
  {
    id: "education-portal",
    name: "Education portal & listing aggregator",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["enquiry"],
    description:
      "The school-finder or course-comparison site that generated the lead. It captured the parent's details first, keeps its own copy, and resells the same enquiry to competing institutions.",
    dataCategoryIds: ["student-identity", "guardian-family", "student-contact", "engagement-segment"],
    accessPersonaIds: ["admissions-staff", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The family's first disclosure happened somewhere the institution does not control, under a notice the institution did not write, and the same record has usually been sold to several other institutions before the first call is made.",
    riskAction:
      "Record which portals you receive leads from and on what terms, give your own notice at the first direct contact rather than relying on theirs, and do not re-upload portal leads into marketing audiences.",
  },
  {
    id: "marketing-platform",
    name: "Advertising & campaign platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "communication"],
    description:
      "The ad platform where parent contact lists are uploaded to build audiences and lookalikes for admission campaigns - often including families whose only interaction was an enquiry about a six-year-old.",
    dataCategoryIds: ["guardian-family", "student-contact", "engagement-segment"],
    accessPersonaIds: ["admissions-staff", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Uploading a parent list to build an advertising audience is a disclosure to a third party for a purpose no family was asked about, and it is derived from data collected to answer a question about admission. Once uploaded, it cannot be recalled from the audience it seeded.",
    riskAction:
      "Do not upload contact lists collected for admission into advertising platforms without a specific, refusable choice, exclude enquiries about young children entirely, and keep a record of every audience built and when it was deleted.",
  },

  // -------------------------------------------------------------------------
  // 2. Application, documents & guardian authorisation
  // -------------------------------------------------------------------------
  {
    id: "admission-portal",
    name: "Online admission & application portal",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["admission"],
    description:
      "Where the formal application is completed: student and family detail, previous education, health declaration, transport interest and document uploads, plus the interview or entrance schedule.",
    dataCategoryIds: [
      "student-identity",
      "student-contact",
      "guardian-family",
      "government-id",
      "academic-record",
      "health-support",
    ],
    accessPersonaIds: ["admissions-staff", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The application asks for more than admission needs - full identity documents, a health declaration and family occupation - and the record persists identically whether the student joined or was rejected.",
    riskAction:
      "Reduce the application to what the admission decision genuinely requires, make optional fields visibly optional, and define and enforce a retention period for unsuccessful applications.",
  },
  {
    id: "document-upload",
    name: "Admission document store",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["admission"],
    description:
      "The folder or drive holding scanned birth certificates, Aadhaar copies, category and domicile certificates, previous transfer certificates and passport-size photographs for every applicant.",
    dataCategoryIds: ["government-id", "student-identity", "academic-record", "guardian-family"],
    accessPersonaIds: ["admissions-staff", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the single densest concentration of children's identity documents the institution will ever hold, it is usually a shared drive that most of the office can open, and copies collected only to verify a detail at admission are kept permanently.",
    riskAction:
      "Define exactly which documents must be retained rather than merely seen, delete the rest once verification is recorded, restrict the folder to named admission staff, and log access.",
  },
  {
    id: "consent-record",
    name: "Guardian authorisation & notice record",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["admission", "enrolment", "communication"],
    description:
      "What the institution can actually show about permission: usually a signature on the admission form, sometimes a tick box, occasionally nothing. Rarely records which guardian signed, what they were told, or which uses they agreed to separately.",
    dataCategoryIds: ["guardian-family", "student-identity", "media-content"],
    accessPersonaIds: ["admissions-staff", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "One signature at admission is treated as permission for the app, the photographs, the CCTV, the bus tracker, the third-party learning platforms and the marketing - for a decade. None of those were separately explained, none can be refused without appearing to refuse the admission, and there is no record of what the family was actually shown.",
    riskAction:
      "Split what admission requires from what is optional, capture each optional use as its own choice that can be declined and later withdrawn, record the notice version, date and which guardian gave it, and re-confirm when the student becomes an adult.",
  },
  {
    id: "paper-admission-file",
    name: "Physical admission files",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["admission", "exit"],
    description:
      "The paper file per student in the admission office cupboard: signed forms, photocopied certificates, photographs and correspondence. Frequently the only copy of the original signed authorisation.",
    dataCategoryIds: ["government-id", "student-identity", "guardian-family", "academic-record"],
    accessPersonaIds: ["admissions-staff", "academic-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "esign-vendor",
    name: "Form & e-signature vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["admission"],
    description:
      "The third-party form builder or e-signature service that collects the application and the signed undertakings, and keeps its own copy of every submission on its own infrastructure.",
    dataCategoryIds: ["student-identity", "guardian-family", "government-id", "health-support"],
    accessPersonaIds: ["admissions-staff", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 3. Student identity, ERP & account creation
  // -------------------------------------------------------------------------
  {
    id: "student-erp",
    name: "School ERP / Student Information System",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enrolment", "learning", "monitoring", "assessment", "fees", "authority", "exit"],
    description:
      "The master record: admission number, class and section, guardian links, attendance, marks, fees and transport allocation. Everything else in the institution is meant to derive from it, and in practice several things do not.",
    dataCategoryIds: [
      "student-identity",
      "student-contact",
      "guardian-family",
      "academic-record",
      "attendance-behaviour",
      "fee-financial",
    ],
    accessPersonaIds: ["academic-admin", "teacher", "admissions-staff", "finance-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "One student ends up existing several times over - in the ERP, the LMS, the parent app, the transport list and the exam system - created separately and reconciled by eye. A sibling's record, a shared family mobile number or a mis-keyed date of birth quietly attaches a child to the wrong adult, and a separated parent's login is almost never removed.",
    riskAction:
      "Define one master student identifier that every other system derives from, verify and record the guardian relationship rather than inferring it from a phone number, provision and remove accounts through a controlled workflow, run duplicate detection, and audit every record merge.",
  },
  {
    id: "parent-app",
    name: "Parent & student mobile app",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enrolment", "monitoring", "assessment", "communication"],
    description:
      "The app a family logs into for attendance, homework, marks, fee status, bus location and announcements. Access is granted per login rather than per relationship, and a login almost never expires.",
    dataCategoryIds: [
      "student-identity",
      "attendance-behaviour",
      "academic-record",
      "fee-financial",
      "location-transport",
      "media-content",
    ],
    accessPersonaIds: ["parent-guardian", "student", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Whoever holds the login sees the child's attendance, marks, fee position and live bus location - regardless of whether they are the authorised guardian, still live with the child, or left the household two years ago.",
    riskAction:
      "Tie app access to a recorded guardian authorisation rather than a shared password, support more than one guardian with different scopes, remove access when a relationship or enrolment ends, and give an adult student control of their own account.",
  },
  {
    id: "identity-provider",
    name: "Student email & login accounts",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enrolment", "learning", "exit"],
    description:
      "The institutional email address and single sign-on identity issued to each student, used to reach the LMS, exam platforms, library systems and every third-party learning tool the institution has adopted.",
    dataCategoryIds: ["student-identity", "student-contact", "learning-activity"],
    accessPersonaIds: ["student", "it-admin", "teacher"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "id-card-system",
    name: "ID card & RFID issuance",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enrolment", "monitoring"],
    description:
      "The vendor that prints identity cards and encodes the RFID or barcode used for attendance, library issue, gate access and canteen payments. Holds a photograph and identity record for every student on the campus.",
    dataCategoryIds: ["student-identity", "monitoring-biometric", "media-content"],
    accessPersonaIds: ["academic-admin", "security-staff", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "class-register",
    name: "Class registers & roll lists",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["enrolment", "monitoring"],
    description:
      "The printed roll list, attendance register and class notice board - carrying names, roll numbers, and frequently a marker against children with a medical condition, a fee concession or a transport route.",
    dataCategoryIds: ["student-identity", "attendance-behaviour", "health-support", "fee-financial"],
    accessPersonaIds: ["teacher", "academic-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 4. Classroom, LMS & EdTech activity
  // -------------------------------------------------------------------------
  {
    id: "lms",
    name: "Learning management system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["learning", "assessment"],
    description:
      "Where coursework, assignments, submissions, quiz attempts, teacher feedback and progress tracking live. Records not just what a student produced but when they logged in, how long they stayed and what they did not finish.",
    dataCategoryIds: ["learning-activity", "academic-record", "student-identity", "learner-profile"],
    accessPersonaIds: ["teacher", "student", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "edtech-app",
    name: "EdTech & smart-class platforms",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["learning"],
    description:
      "The reading app, adaptive-practice platform, coding tool or smart-class provider a department signed up for. Each holds student accounts, performance history and a proprietary profile of what the child is judged to be weak at.",
    dataCategoryIds: ["learning-activity", "student-identity", "learner-profile", "academic-record"],
    accessPersonaIds: ["teacher", "student", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "These are adopted class by class rather than centrally, so the institution often cannot list them all. Each one holds a behavioural profile of a child built by a model nobody has reviewed, and several reserve the right to use the work to improve their own products.",
    riskAction:
      "Keep a register of approved learning tools with an owner for each, check what the vendor retains and whether student work trains their models before a class uses it, ban unregistered adoptions, and require deletion on contract end.",
  },
  {
    id: "teacher-device",
    name: "Teacher's own laptop & phone",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["learning", "assessment", "communication"],
    description:
      "The personal device a teacher marks on, stores photographs of the class on, keeps a downloaded marks sheet on, and messages parents from. Not issued by the institution, not backed up by it, and not wiped when the teacher leaves.",
    dataCategoryIds: [
      "academic-record",
      "student-identity",
      "media-content",
      "attendance-behaviour",
      "guardian-family",
    ],
    accessPersonaIds: ["teacher"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Marks, class photographs, parent numbers and written observations about children sit on a device the institution has no rights over. When the teacher leaves - and teachers move often - none of it is recovered or deleted, and nobody can say what was on it.",
    riskAction:
      "Give teachers a managed way to do the same work, restrict bulk download from the ERP and LMS, require parent contact through official channels, and make device handover and data deletion part of the exit process.",
  },
  {
    id: "public-ai-tool",
    name: "Public AI assistant used on student work",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["learning", "assessment"],
    description:
      "The general-purpose chatbot a teacher pastes student work into to draft feedback, summarise a report card comment, or check an essay - alongside the student's name, class and sometimes their support needs.",
    dataCategoryIds: ["learning-activity", "student-identity", "academic-record", "health-support", "learner-profile"],
    accessPersonaIds: ["teacher"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A child's work and name are disclosed to a service the institution has no contract with, no notice covers and no deletion route reaches. There is no record it happened, so it cannot be told to a parent, included in an access response, or stopped after the fact.",
    riskAction:
      "State plainly which tools may and may not be used on student work, provide an approved alternative so the need does not go underground, require identifying detail to be removed before anything is pasted anywhere, and train staff on why a free tool is not a private one.",
  },
  {
    id: "assignment-drive",
    name: "Shared drive of student work",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["learning", "assessment"],
    description:
      "The department drive holding submitted assignments, project files, photographs of classwork, recorded presentations and years of accumulated folders that no longer have an owner.",
    dataCategoryIds: ["learning-activity", "academic-record", "student-identity", "media-content"],
    accessPersonaIds: ["teacher", "academic-admin", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 5. Attendance, CCTV, biometrics & campus access
  // -------------------------------------------------------------------------
  {
    id: "attendance-system",
    name: "Attendance register & ERP attendance",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["monitoring"],
    description:
      "Daily and period-wise attendance, late arrivals, early departures and the reasons a parent gave for an absence - visible to teachers, the academic office and the family through the app.",
    dataCategoryIds: ["attendance-behaviour", "student-identity", "health-support"],
    accessPersonaIds: ["teacher", "academic-admin", "parent-guardian"],
    retentionDefined: false,
    riskLevel: "low",
  },
  {
    id: "biometric-device",
    name: "Biometric & RFID attendance terminal",
    nodeType: "device",
    boundary: "vendor",
    stageIds: ["monitoring"],
    description:
      "The fingerprint or face-recognition unit at the gate or classroom door, or the RFID card reader that replaced it. Stores a biometric template or card identity for every student, on a device supplied and maintained by a vendor.",
    dataCategoryIds: ["monitoring-biometric", "student-identity", "attendance-behaviour"],
    accessPersonaIds: ["security-staff", "academic-admin", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A biometric template taken from a child cannot be reissued if it leaks, is usually collected because it was convenient rather than because attendance genuinely required it, sits on vendor hardware nobody has assessed, and is almost never deleted when the student leaves.",
    riskAction:
      "Justify biometrics against a less intrusive alternative before deploying them and record that assessment, offer a non-biometric option, confirm how and where the vendor stores templates, and delete a student's template on exit as a defined step.",
  },
  {
    id: "cctv-system",
    name: "Campus CCTV & recordings",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["monitoring"],
    description:
      "Cameras across corridors, gates, playgrounds, buses and - in many institutions - classrooms, recording continuously to a local recorder or a vendor's cloud, with footage viewable on a phone by whoever was given the app.",
    dataCategoryIds: ["monitoring-biometric", "student-identity", "attendance-behaviour"],
    accessPersonaIds: ["security-staff", "it-admin", "edtech-vendor", "academic-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Combined with card taps and gate logs, this is a continuous, timestamped record of where every child was and who they were with, held indefinitely because no one set a retention period. Access is typically an app on several personal phones with no log of who watched what, and clips get shared into staff groups when something happens.",
    riskAction:
      "Write down the purpose of each camera and remove the ones that fail it, set and enforce a retention period, restrict viewing to named individuals, log every view and export, ban sharing footage into messaging groups, and display clear notice at every entrance.",
  },
  {
    id: "gate-visitor-system",
    name: "Gate entry & visitor management",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["monitoring"],
    description:
      "The register or tablet at the gate recording who entered, when, and which child they came for - linking an adult's identity and phone number to a named student, with a photograph in many systems.",
    dataCategoryIds: ["monitoring-biometric", "guardian-family", "student-identity"],
    accessPersonaIds: ["security-staff", "admissions-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 6. School transport & live location  (school + integrated)
  // -------------------------------------------------------------------------
  {
    id: "transport-system",
    name: "Transport & route management",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["transport"],
    description:
      "Route allocation, stop assignment, bus number, timings and the fee attached - built from every travelling child's home address and a parent contact number.",
    dataCategoryIds: ["location-transport", "student-identity", "guardian-family", "fee-financial"],
    accessPersonaIds: ["academic-admin", "transport-staff", "finance-staff"],
    retentionDefined: false,
    riskLevel: "high",
    businessModels: ["school", "integrated"],
    riskWhy:
      "This is where a child's home address is joined to their daily timing and handed to people outside the institution. The allocation list is regularly shared as a spreadsheet with the transport contractor and updated by email.",
    riskAction:
      "Share only the stop and timing a contractor needs rather than the full address list where the route allows it, exchange allocations through a controlled channel rather than email attachments, and review who holds a copy each term.",
  },
  {
    id: "bus-gps",
    name: "Bus GPS & driver app",
    nodeType: "device",
    boundary: "vendor",
    stageIds: ["transport"],
    description:
      "The tracker on the vehicle and the app the driver or attendant uses to mark boarding and drop-off. Produces a continuous location trail tied to named children, streamed to a parent app and stored by the vendor.",
    dataCategoryIds: ["location-transport", "student-identity", "monitoring-biometric"],
    accessPersonaIds: ["transport-staff", "parent-guardian", "edtech-vendor", "academic-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    businessModels: ["school", "integrated"],
    riskWhy:
      "A live and historical record of where a named child is, twice a day, held by a tracking vendor with no defined retention. Where the parent view is not properly scoped, one family can see other children's boarding events - and the history reveals which days a child was not collected as usual.",
    riskAction:
      "Limit location history to the period the safety purpose needs, scope the parent view strictly to their own child, confirm what the tracking vendor retains and delete on contract end, and treat the boarding record as attendance data rather than an open feed.",
  },
  {
    id: "driver-phone",
    name: "Driver & attendant's personal phone",
    nodeType: "device",
    boundary: "vendor",
    stageIds: ["transport"],
    description:
      "The handset a driver or bus attendant actually uses: the route list photographed, parents' numbers saved as contacts, and a WhatsApp group per bus used to tell families the vehicle is running late.",
    dataCategoryIds: ["location-transport", "guardian-family", "student-identity", "media-content"],
    accessPersonaIds: ["transport-staff", "parent-guardian"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    businessModels: ["school", "integrated"],
    riskWhy:
      "Children's names, home addresses and their parents' personal numbers sit on the phone of a contractor's employee the institution has never vetted for this, in a group that exposes every parent's number to every other parent. When the driver changes - which happens often - none of it is removed.",
    riskAction:
      "Give drivers a managed app rather than relying on a personal handset, use masked calling so numbers are never revealed, prohibit route lists being photographed, run parent transport communication through the institution's own channel, and make deletion part of every driver handover.",
  },
  {
    id: "route-sheet",
    name: "Printed route & pickup sheets",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["transport"],
    description:
      "The laminated list carried on each bus and pinned in the transport office: child name, class, stop, home address and a parent's mobile number, in order of pickup.",
    dataCategoryIds: ["location-transport", "student-identity", "guardian-family"],
    accessPersonaIds: ["transport-staff", "academic-admin", "security-staff"],
    retentionDefined: false,
    riskLevel: "high",
    businessModels: ["school", "integrated"],
    riskWhy:
      "A single sheet that maps named children to their home addresses and their parents' numbers, left on a vehicle dashboard and reprinted every term without the old copies being destroyed.",
    riskAction:
      "Print stop names rather than full addresses where the route allows, keep sheets out of public view on the vehicle, collect and destroy superseded versions, and re-issue rather than annotate when a route changes.",
  },

  // -------------------------------------------------------------------------
  // 7. Hostel, library & campus services  (college + integrated)
  // -------------------------------------------------------------------------
  {
    id: "hostel-system",
    name: "Hostel & room allocation",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["residential"],
    description:
      "Room and roommate allocation, mess registration, leave applications, late returns, visitor entries and disciplinary notes for every resident student.",
    dataCategoryIds: ["residential-campus", "student-identity", "guardian-family", "attendance-behaviour"],
    accessPersonaIds: ["hostel-warden", "academic-admin", "security-staff"],
    retentionDefined: false,
    riskLevel: "high",
    businessModels: ["college", "integrated"],
    riskWhy:
      "A record of a young adult's private life - when they came in, who visited, when they were away - kept alongside their academic file and readable by staff whose role has nothing to do with residence. Room lists are frequently posted publicly on a notice board or a group.",
    riskAction:
      "Separate residential access from academic access, state the purpose of recording entry and exit, stop publishing room allocation lists, restrict disciplinary notes to the people handling them, and set a retention period per record type.",
  },
  {
    id: "campus-access",
    name: "Hostel & campus access control",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["residential"],
    description:
      "Card or biometric readers on residence and building entrances, producing a timestamped movement history for each student across the campus, held by the access-control vendor.",
    dataCategoryIds: ["residential-campus", "monitoring-biometric", "student-identity"],
    accessPersonaIds: ["security-staff", "hostel-warden", "edtech-vendor", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    businessModels: ["college", "integrated"],
    riskWhy:
      "Entry and exit logs accumulate into a detailed picture of an individual's routine and associations, retained indefinitely by default and readily pulled to answer questions about conduct rather than safety.",
    riskAction:
      "Define what the access log is for and set a retention limit accordingly, restrict who may query historical movement, require a recorded reason for any conduct-related lookup, and confirm what the vendor holds.",
  },
  {
    id: "library-system",
    name: "Library & borrowing records",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["residential"],
    description:
      "Issue and return history, reservations, fines and reading history for each student - retained long after the book has come back.",
    dataCategoryIds: ["residential-campus", "student-identity", "learning-activity"],
    accessPersonaIds: ["academic-admin", "student", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["college", "integrated"],
  },

  // -------------------------------------------------------------------------
  // 8. Health, counselling & special support
  // -------------------------------------------------------------------------
  {
    id: "health-record",
    name: "Infirmary & health record",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["wellbeing"],
    description:
      "Allergies, chronic conditions, medication administered during the day, injuries, infirmary visits and the emergency medical information collected at admission.",
    dataCategoryIds: ["health-support", "student-identity", "guardian-family"],
    accessPersonaIds: ["counsellor-nurse", "academic-admin", "teacher"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Medical detail collected for an emergency ends up visible to every teacher who opens the class list, when what a teacher needs to know is the action to take rather than the diagnosis behind it.",
    riskAction:
      "Separate the classroom-facing summary - what to do, and when to call - from the underlying medical record, restrict the full record to the health and safeguarding roles, and keep it out of shared registers and staff groups.",
  },
  {
    id: "counselling-notes",
    name: "Counsellor & special-support files",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["wellbeing"],
    description:
      "Session notes, learning-support and individual education plans, assessment reports, disability documentation and safeguarding concerns - typically in a notebook, a personal drive folder or an email thread rather than a controlled system.",
    dataCategoryIds: ["health-support", "student-identity", "guardian-family", "learner-profile"],
    accessPersonaIds: ["counsellor-nurse", "academic-admin", "teacher"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The most sensitive thing an institution will ever record about a young person is held in the least controlled place it has. Diagnoses circulate in staff rooms and class groups, a support need becomes a label that follows the child through every subsequent year, and a family that disagrees with what was written has no way to see it or correct it.",
    riskAction:
      "Move counselling and support records into a system with named, restricted access and an audit trail, share only the classroom support a teacher must provide rather than the underlying diagnosis, never disclose a condition in a staff or parent group, set a retention rule, and give the family a route to see and correct what is held.",
  },
  {
    id: "emergency-contact-sheet",
    name: "Emergency contact & medical sheets",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["wellbeing", "monitoring"],
    description:
      "The printed list in the staff room, the infirmary and on the bus: names, conditions, allergies, medication and parents' numbers - kept visible precisely so it can be grabbed in a hurry.",
    dataCategoryIds: ["health-support", "guardian-family", "student-identity"],
    accessPersonaIds: ["counsellor-nurse", "teacher", "security-staff", "transport-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Its usefulness depends on being immediately visible, which is exactly what makes it a disclosure: every child's medical condition is readable by anyone who walks past, including other parents and visitors.",
    riskAction:
      "Reduce the posted sheet to the minimum needed to act in an emergency, keep the detail in the health record instead, place sheets where staff can reach them but visitors cannot, and reprint rather than let superseded copies accumulate.",
  },

  // -------------------------------------------------------------------------
  // 9. Examinations, proctoring & results
  // -------------------------------------------------------------------------
  {
    id: "exam-system",
    name: "Examination & result processing",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["assessment"],
    description:
      "Where marks are consolidated, weighted, moderated and turned into grades, ranks and promotion decisions - including the record of any examination misconduct.",
    dataCategoryIds: ["academic-record", "student-identity", "attendance-behaviour", "learner-profile"],
    accessPersonaIds: ["academic-admin", "teacher", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "teacher-marks-sheet",
    name: "Teacher marks spreadsheets",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["assessment"],
    description:
      "The working file where marks actually start life - emailed between staff, copied onto a personal laptop, versioned by filename, and never deleted once the results are published.",
    dataCategoryIds: ["academic-record", "student-identity", "learner-profile"],
    accessPersonaIds: ["teacher", "academic-admin"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Every student's marks exist in an uncontrolled file that circulates by email and sits on personal devices, so a correction made in the official system never reaches the copies - and years of whole-class results persist with no owner.",
    riskAction:
      "Enter marks directly into the examination system rather than a spreadsheet, restrict export, delete working files once results are finalised, and make corrections only in the authoritative record.",
  },
  {
    id: "proctoring-vendor",
    name: "Online exam & proctoring platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["assessment"],
    description:
      "The remote-examination service that records the student's webcam, screen and browser activity, scores their behaviour for suspicion, and runs their submitted work through plagiarism detection.",
    dataCategoryIds: ["learning-activity", "student-identity", "learner-profile", "academic-record"],
    accessPersonaIds: ["academic-admin", "teacher", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "critical",
    businessModels: ["college", "integrated"],
    riskWhy:
      "Far more is captured than the answers: video of the inside of a student's home, their face, their room, and an automatically generated suspicion score that can trigger an academic consequence. Recordings are retained on vendor infrastructure with no defined limit, and the flag is frequently acted on without a human reviewing it.",
    riskAction:
      "Use the least intrusive assessment method that works, tell students exactly what is recorded and for how long before the exam, delete recordings on a defined schedule, require a human decision and a documented review before any consequence, and give the student an appeal route.",
  },
  {
    id: "report-card",
    name: "Report cards & transcripts",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["assessment", "exit"],
    description:
      "The generated document a family receives and a future institution or employer relies on: marks, grades, attendance summary, teacher comments and the promotion decision.",
    dataCategoryIds: ["academic-record", "student-identity", "attendance-behaviour"],
    accessPersonaIds: ["academic-admin", "teacher", "parent-guardian", "student"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 10. Fees, scholarships & financial aid
  // -------------------------------------------------------------------------
  {
    id: "fee-portal",
    name: "Fee & payment portal",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["fees"],
    description:
      "Fee schedules, payments, outstanding dues, concessions and refunds - with the family's bank reference, and a dues report that gets exported whenever a reminder round begins.",
    dataCategoryIds: ["fee-financial", "student-identity", "guardian-family", "engagement-segment"],
    accessPersonaIds: ["finance-staff", "academic-admin", "parent-guardian", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A family's financial position becomes visible well beyond finance: defaulter lists are read out in class, pinned to notice boards, circulated in staff and parent groups, and used to hold back a report card. A child is identified to their peers by what their family could not pay.",
    riskAction:
      "Restrict fee records to finance roles, never publish or circulate a defaulters list in any form, keep reminders private to the family and out of class-level channels, separate fee status from anything a teacher or classmate can see, and set a retention rule for financial records.",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway & bank",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["fees"],
    description:
      "The gateway and banking rails that process fee payments, holding the payer's identity, bank or card reference and the full transaction history against the student's admission number.",
    dataCategoryIds: ["fee-financial", "guardian-family", "student-identity"],
    accessPersonaIds: ["finance-staff", "edtech-vendor"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "scholarship-portal",
    name: "Scholarship & financial-aid portal",
    nodeType: "system",
    boundary: "government",
    stageIds: ["fees"],
    description:
      "The government or trust portal where an aid application is filed with the family's income certificate, category certificate, bank details and supporting documents attached.",
    dataCategoryIds: ["fee-financial", "government-id", "guardian-family", "student-identity"],
    accessPersonaIds: ["finance-staff", "academic-admin", "education-authority"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Income and category documents are among the most consequential things a family hands over, they pass through institutional staff on the way to an authority the institution cannot audit, and copies stay behind in the finance office indefinitely.",
    riskAction:
      "Handle income and category documents through named staff only, submit rather than retain where the portal keeps the record, delete local copies once the application is processed, and tell families exactly who will see the file.",
  },
  {
    id: "finance-spreadsheet",
    name: "Fee dues & concession spreadsheets",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["fees"],
    description:
      "The working file finance actually runs on: outstanding dues by class, concession and waiver decisions, notes about a family's circumstances, and the list that gets forwarded to class teachers to chase.",
    dataCategoryIds: ["fee-financial", "student-identity", "guardian-family", "engagement-segment"],
    accessPersonaIds: ["finance-staff", "academic-admin", "teacher"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The most sensitive judgements about a household - what they earn, what they could not pay, why a waiver was given - sit in an uncontrolled file that is forwarded to teaching staff to act on, and is never deleted.",
    riskAction:
      "Keep concession reasoning inside the finance system with restricted access, send teachers an action rather than a household's financial circumstances, stop forwarding dues files by email, and delete superseded working copies.",
  },

  // -------------------------------------------------------------------------
  // 11. Boards, universities & regulator submissions
  // -------------------------------------------------------------------------
  {
    id: "board-university-portal",
    name: "Board, university & regulator portal",
    nodeType: "system",
    boundary: "government",
    stageIds: ["authority"],
    description:
      "The examination board, affiliating university, accreditation body or scholarship authority that receives student registrations, attendance, category data and results as a condition of operating.",
    dataCategoryIds: ["student-identity", "academic-record", "attendance-behaviour", "government-id"],
    accessPersonaIds: ["academic-admin", "education-authority"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Once submitted, the record is held by a separate controller the institution cannot audit, correct at will or delete from. A mistake in a name or date of birth becomes a problem the student carries for years, through a correction process the institution does not control.",
    riskAction:
      "Keep a register of what is disclosed to which authority and why, validate submissions against the master record before sending, restrict who holds portal credentials, and have a defined route for pushing a correction through after the fact.",
  },
  {
    id: "authority-export",
    name: "Submission working files & exports",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["authority"],
    description:
      "The spreadsheet exported from the ERP to satisfy a board or university format - reshaped by hand, emailed between staff for checking, uploaded, and then left in a downloads folder.",
    dataCategoryIds: ["student-identity", "academic-record", "government-id", "attendance-behaviour"],
    accessPersonaIds: ["academic-admin", "it-admin"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A full extract of every student's identity and results leaves the controlled system as a file, travels by email, and persists on several machines with no owner and no deletion date - and the version that was actually submitted is often not the version anyone kept.",
    riskAction:
      "Generate submissions directly from the ERP rather than by hand-editing exports, exchange them through a controlled channel rather than email, keep one record of exactly what was submitted and when, and delete the working copies afterwards.",
  },

  // -------------------------------------------------------------------------
  // 12. Internships, research & placements  (college + integrated)
  // -------------------------------------------------------------------------
  {
    id: "placement-portal",
    name: "Placement & internship portal",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["placement"],
    description:
      "CVs, marks, aptitude scores, shortlists, interview outcomes and offer details for every student registered with the placement cell - together with the batch's outcomes as a whole.",
    dataCategoryIds: ["placement-alumni", "academic-record", "student-identity", "learner-profile"],
    accessPersonaIds: ["academic-admin", "student", "employer-partner"],
    retentionDefined: false,
    riskLevel: "high",
    businessModels: ["college", "integrated"],
    riskWhy:
      "Profiles are shared with employers as a batch rather than per opportunity, so a student who applied to one company finds their marks and CV with several. Interview outcomes and rejections stay attached to the profile long after the process ends.",
    riskAction:
      "Make sharing a per-opportunity choice the student makes, log which profile went to which employer and when, share the minimum needed to shortlist, and remove interview outcomes on a defined schedule.",
  },
  {
    id: "employer-recipient",
    name: "Employer & internship partner",
    nodeType: "system",
    boundary: "client",
    stageIds: ["placement"],
    description:
      "The company that receives the CV batch, runs its own assessment, keeps its own copy of every profile it was sent - including the students it did not hire - and is under no obligation the student ever saw.",
    dataCategoryIds: ["placement-alumni", "academic-record", "student-identity", "student-contact"],
    accessPersonaIds: ["employer-partner", "academic-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    businessModels: ["college", "integrated"],
    riskWhy:
      "The institution's control ends the moment the file is sent. An employer holds academic records and contact details for an entire batch, retains them indefinitely, may use them for future hiring rounds or marketing, and cannot be made to delete them without an agreement nobody put in place.",
    riskAction:
      "Agree in writing what an employer may keep and for how long before sharing anything, send only the students who chose that opportunity, share the minimum needed to shortlist, and require confirmation of deletion when a process closes.",
  },
  {
    id: "research-repository",
    name: "Research & project repository",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["placement"],
    description:
      "Project files, dissertations, supervisor feedback and - where a student's project collected data from other people - the survey responses and participant records gathered along the way.",
    dataCategoryIds: ["placement-alumni", "learning-activity", "student-identity", "academic-record"],
    accessPersonaIds: ["teacher", "academic-admin", "student", "employer-partner"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ["college", "integrated"],
  },

  // -------------------------------------------------------------------------
  // 13. Communication, photographs & public content
  // -------------------------------------------------------------------------
  {
    id: "public-website-social",
    name: "Website, social media & public results",
    nodeType: "system",
    boundary: "public",
    stageIds: ["communication"],
    description:
      "The institution's website, Instagram, Facebook and YouTube presence: event photographs, classroom videos, prize-day footage, toppers' names with their marks, and the students used in admission campaigns.",
    dataCategoryIds: ["media-content", "student-identity", "academic-record", "placement-alumni"],
    accessPersonaIds: ["public-audience", "admissions-staff", "academic-admin", "teacher"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the sector's signature exposure: no other kind of business publishes its data principals' faces and names as a matter of routine. A named child, in uniform, at an identifiable place, on a known daily schedule, is visible to anyone - and their marks are frequently published alongside. The permission for it was a line on an admission form years earlier, there is usually no working way to ask for removal, and material stays up long after the student has left.",
    riskAction:
      "Make publication a specific, separate and withdrawable choice per channel rather than part of the admission form, run a removal route that actually works and is told to families, avoid publishing a full name next to results or a location and routine, and review and prune what is still visible from previous years.",
  },
  {
    id: "parent-whatsapp-group",
    name: "Parent & class WhatsApp groups",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["communication"],
    description:
      "The class group where the teacher posts homework, photographs of the day, reminders and results - and where every parent's mobile number is visible to every other parent.",
    dataCategoryIds: ["media-content", "student-identity", "guardian-family", "academic-record", "health-support"],
    accessPersonaIds: ["teacher", "parent-guardian", "academic-admin"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Creating the group discloses every family's phone number to every other family, permanently. Photographs of all the children reach parents who have no relationship with them, and staff routinely post things that identify an individual child - a fee reminder, an absence, a medical instruction, a disciplinary matter - to the whole class.",
    riskAction:
      "Use the institution's own app or a broadcast channel that does not expose numbers to each other, never post anything about an individual child to a group, keep photographs to channels a family specifically agreed to, and set a rule for what staff may share and where.",
  },
  {
    id: "photography-vendor",
    name: "Event photographer & yearbook vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["communication"],
    description:
      "The photographer engaged for annual day, sports day and the yearbook, who keeps every raw file - including the children in the background of every shot - on their own drives and portfolio.",
    dataCategoryIds: ["media-content", "student-identity"],
    accessPersonaIds: ["edtech-vendor", "admissions-staff", "academic-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Thousands of images of identifiable children sit with a contractor under no written obligation, are commonly reused in the photographer's own portfolio or samples, and are never deleted after the event they were taken for.",
    riskAction:
      "Put in writing what the photographer may keep, for how long and what they may never reuse, require deletion of raw files after delivery, prohibit portfolio use, and hold the delivered set inside your own controlled library.",
  },
  {
    id: "bulk-messaging",
    name: "SMS & email broadcast platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["communication"],
    description:
      "The bulk messaging service used for announcements, absence alerts, fee reminders and admission campaigns - holding the parent contact list and every message sent to it.",
    dataCategoryIds: ["guardian-family", "student-contact", "student-identity", "engagement-segment"],
    accessPersonaIds: ["admissions-staff", "academic-admin", "finance-staff", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // -------------------------------------------------------------------------
  // 14. Group analytics & cross-campus profiling  (integrated)
  // -------------------------------------------------------------------------
  {
    id: "data-warehouse",
    name: "Group data warehouse",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["analytics"],
    description:
      "The central store that pulls admissions, academics, attendance, fees, transport and campus data from every branch into one place, so the group can be reported on as a whole.",
    dataCategoryIds: [
      "student-identity",
      "academic-record",
      "attendance-behaviour",
      "fee-financial",
      "engagement-segment",
      "learner-profile",
    ],
    accessPersonaIds: ["academic-admin", "finance-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    businessModels: ["integrated"],
    riskWhy:
      "Data collected at a campus for running that campus is consolidated centrally for purposes nobody at the campus described to families, and the warehouse retains records long after the source system has archived or deleted them.",
    riskAction:
      "State the purpose of the central store and limit what is copied into it to what that purpose needs, restrict access to named group roles, apply the same retention rules as the source systems, and keep campus-level operational data out of group marketing use.",
  },
  {
    id: "bi-analytics",
    name: "Group BI & AI analytics",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["analytics"],
    description:
      "The reporting and modelling layer over the warehouse: branch performance comparisons, dropout and fee-default predictions, re-enrolment scoring, campaign audiences and alumni prospect lists.",
    dataCategoryIds: ["engagement-segment", "learner-profile", "student-identity", "fee-financial", "academic-record"],
    accessPersonaIds: ["academic-admin", "finance-staff", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "critical",
    businessModels: ["integrated"],
    riskWhy:
      "Children are scored and classified by models nobody outside the vendor has reviewed - a dropout risk, a fee-default likelihood, an ability band - and those labels feed decisions about them. The family has never seen the score, was never told it exists, and has no way to challenge it.",
    riskAction:
      "Justify each analysis against a stated purpose and stop the ones that have none, require human review before an automated classification affects a student, be able to explain a score to a family in plain language, keep operational analytics separate from marketing audiences, and do not profile children for commercial targeting.",
  },

  // -------------------------------------------------------------------------
  // 15. Transfer, graduation, alumni & archive
  // -------------------------------------------------------------------------
  {
    id: "erp-archive",
    name: "Archived student records",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["exit"],
    description:
      "What remains after a student leaves: the ERP record marked inactive, the LMS history, the parent app login, the attendance and fee history, the photographs, and the accounts nobody closed.",
    dataCategoryIds: [
      "student-identity",
      "academic-record",
      "attendance-behaviour",
      "fee-financial",
      "media-content",
      "health-support",
    ],
    accessPersonaIds: ["academic-admin", "it-admin", "finance-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the question the whole map exists to answer. Marking a student inactive changes almost nothing: they remain in the LMS, the parent app, the photo library, the camera archive, the transport system, the board's records, the vendor platforms, the backups and a physical file - and most institutions could not produce that list if a family asked for it.",
    riskAction:
      "List every place student data lands and write a retention rule for each, separate what you are genuinely required to keep from what is merely never deleted, close student and parent accounts as a defined exit step, remove optional marketing and analytics profiles, chase vendor deletion, and record honestly where an erasure cannot reach and why.",
  },
  {
    id: "alumni-crm",
    name: "Alumni database & outreach",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["exit"],
    description:
      "Former students carried forward into a contact list for reunions, fundraising, placement referrals and admission testimonials - usually built automatically from the student record rather than by anyone opting in.",
    dataCategoryIds: ["placement-alumni", "student-contact", "student-identity", "engagement-segment"],
    accessPersonaIds: ["admissions-staff", "academic-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Leaving the institution converts a student into a marketing contact without anyone asking, using details collected for their education. Requests to stop are handled informally, so the same person is contacted again from the next export.",
    riskAction:
      "Make alumni participation something a leaver actively chooses rather than a default carry-over, keep the alumni list separate from the student record, honour a withdrawal permanently rather than per campaign, and set a retention rule.",
  },
  {
    id: "cloud-backup",
    name: "Backups & vendor copies",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["exit"],
    description:
      "Nightly backups of the ERP, LMS and file shares, plus the copies each vendor holds on its own infrastructure - the layer where a deleted student record continues to exist.",
    dataCategoryIds: ["student-identity", "academic-record", "health-support", "fee-financial", "media-content"],
    accessPersonaIds: ["it-admin", "edtech-vendor"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Deleting a record from a live system does not remove it from backups or from a vendor's own copies, and most institutions have never asked a vendor what it retains, where, or how a deletion request is executed.",
    riskAction:
      "Document your backup cycle and how long a deleted record persists in it, ask every vendor in writing what they retain and how deletion works, require deletion on contract end, and tell families honestly what an erasure can and cannot reach.",
  },
  {
    id: "physical-archive",
    name: "Record room & old files",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["exit"],
    description:
      "The cupboard or store room holding admission files, mark ledgers, attendance registers, transfer certificate counterfoils and medical forms going back years, for students who left long ago.",
    dataCategoryIds: ["government-id", "academic-record", "student-identity", "health-support", "guardian-family"],
    accessPersonaIds: ["academic-admin", "admissions-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
];

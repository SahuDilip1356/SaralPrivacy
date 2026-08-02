// The curated 8 hotspots for a school, college or campus group, ranked
// worst-first. Buckets map to the schools-colleges assessment pack
// (student_parent_data / children_consent / monitoring_safety_systems /
// learning_vendor_platform / retention_sharing_rights) - all five are reachable
// from the map.
//
// ⚠️ WHY THIS IS EXACTLY 8, AND WHY THE COUNT IS DERIVED RATHER THAN CHOSEN
//
// The journey flags a stage red when a hotspot's node resolves to it, where a
// node resolves to the FIRST of its stageIds visible in the selected model - and
// a node with no visible stage is skipped silently. The counter and the legend
// copy, however, print `pack.hotspots.length`, which is pack-level and does NOT
// vary by model. Two things therefore break the reconciliation:
//   (a) two hotspot nodes sharing a primary stage -> flags < counter
//   (b) a hotspot node hidden in one model        -> flags < counter there only
// That is the "the flow shows 6, the counter says 8" defect, still open on
// ca-firms, recruitment and two of training institutes' three models.
//
// This pack removes both failure modes by construction. Every hotspot node is
// UNGATED, and each one's EARLIEST stage is a distinct ALL-MODEL stage:
//
//   2  admission     -> consent-record
//   3  enrolment     -> student-erp
//   4  learning      -> public-ai-tool
//   5  monitoring    -> cctv-system
//   8  wellbeing     -> counselling-notes
//   10 fees          -> fee-portal
//   13 communication -> public-website-social
//   15 exit          -> erp-archive
//
// Eight distinct all-model stages, therefore eight hotspots - by arithmetic
// rather than by luck, in all three models. There are eleven all-model stages;
// enquiry, assessment and authority carry no hotspot, which is fine. What is NOT
// fine is a ninth hotspot sharing one of the eight, or any hotspot node acquiring
// a stage EARLIER than the one above.
//
// ⚠️ If you add, remove or re-point a hotspot, re-run the reconciliation script
// in the spec for ALL THREE models before pushing.
//
// The sector's other signature exposures - the driver's personal phone carrying
// children's home addresses, online proctoring recording the inside of a
// student's home, an employer keeping a whole batch's CVs, group analytics
// scoring children - sit on model-gated stages and therefore cannot be hotspots
// without breaking the count. They are NOT dropped: each is authored as a
// critical-risk node with its own riskWhy and riskAction, rendered in full in the
// models where it exists. The hotspot rail is the curated "start here" list, not
// the risk inventory.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const SCHOOLS_COLLEGES_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-public-child",
    rank: 1,
    nodeId: "public-website-social",
    title: "The child's face is the institution's marketing asset",
    whatHappens:
      "Event photographs, classroom videos, prize-day footage and toppers' names with their marks go onto the website, Instagram and YouTube - and into admission advertising. The permission for it was a line on an admission form signed years earlier by one parent, there is usually no working way to ask for removal, and material stays up long after the student has left.",
    whyItMatters:
      "No other kind of business publishes its data principals' faces and names as a matter of routine. A named child, in uniform, at an identifiable place, on a known daily schedule, is visible to anyone - and their academic results are frequently published beside them. Unlike almost everything else on this map, a family that changes its mind cannot undo it: the image has been copied, cached and indexed.",
    dataCategoryIds: ["media-content", "student-identity", "academic-record"],
    action:
      "Make publication a specific, separate and withdrawable choice per channel rather than part of the admission form, run a removal route that actually works and tell families it exists, stop publishing a full name next to results or alongside a location and routine, put in writing what an event photographer may keep, and review and prune what is still visible from previous years.",
    assessmentBucket: "retention_sharing_rights",
  },
  {
    id: "hs-bundled-consent",
    rank: 2,
    nodeId: "consent-record",
    title: "One signature at admission is treated as permission for everything",
    whatHappens:
      "A parent signs the admission form. That signature is subsequently relied on for the parent app, the classroom photographs, the CCTV, the biometric attendance, the bus tracker, every third-party learning platform the institution later adopts, and the marketing - for as long as the student stays.",
    whyItMatters:
      "None of those uses was separately explained, none can be refused without appearing to jeopardise the admission, and several did not exist when the form was signed. There is usually no record of which guardian signed, what they were shown, or what they agreed to - so if a family asks the institution to stop one of these things, it has nothing to act on and no way to prove what was permitted.",
    dataCategoryIds: ["guardian-family", "student-identity", "media-content", "monitoring-biometric"],
    action:
      "Separate what admission genuinely requires from what is optional, capture each optional use as its own choice that can be declined without consequence and withdrawn later, record the notice version, the date and which guardian gave it, and re-confirm directly with the student once they are an adult.",
    assessmentBucket: "children_consent",
  },
  {
    id: "hs-monitoring-stack",
    rank: 3,
    nodeId: "cctv-system",
    title: "Cameras, fingerprints and card taps build a continuous record of a child",
    whatHappens:
      "CCTV records corridors, gates and - in many institutions - classrooms. A fingerprint or face marks attendance. An RFID card logs every gate crossing, and a visitor book links an adult to a child. Retention is whatever the recorder defaults to, access is an app on several personal phones, and clips get shared into staff groups when something happens.",
    whyItMatters:
      "Separately each looks like a safety measure; together they are a timestamped record of where a named child was, when, and who they were with, held indefinitely because nobody set a limit. A biometric template taken from a child cannot be reissued if it leaks, is usually collected because it was convenient rather than necessary, and is almost never deleted when the student leaves.",
    dataCategoryIds: ["monitoring-biometric", "student-identity", "attendance-behaviour"],
    action:
      "Write down the purpose of each camera and each reader and remove the ones that fail it, justify biometrics against a less intrusive alternative and offer a non-biometric option, set and enforce a retention period, restrict viewing to named individuals with a log, ban sharing footage into messaging groups, and delete templates and access records when a student leaves.",
    assessmentBucket: "monitoring_safety_systems",
  },
  {
    id: "hs-wellbeing-exposure",
    rank: 4,
    nodeId: "counselling-notes",
    title: "The most sensitive record is kept in the least controlled place",
    whatHappens:
      "Allergies, medication, a disability, a learning-support plan, counselling sessions and safeguarding concerns are recorded in a notebook, a personal drive folder or an email thread. The emergency medical sheet is pinned up where staff - and anyone walking past - can read it, and conditions get mentioned in staff and class groups.",
    whyItMatters:
      "This is the highest-impact data an institution holds about a young person, and it is held with less control than the fee ledger. A support need becomes a label that follows the child through every subsequent year, a diagnosis reaches people who only needed to know what to do in an emergency, and a family that disagrees with what was written has no way to see it or have it corrected.",
    dataCategoryIds: ["health-support", "student-identity", "learner-profile", "guardian-family"],
    action:
      "Move counselling and support records into a system with named, restricted access and an audit trail, give teachers the classroom action rather than the underlying diagnosis, never disclose a condition in a staff or parent group, reduce the posted emergency sheet to the minimum needed to act, set a retention rule, and give families a route to see and correct what is held.",
    assessmentBucket: "student_parent_data",
  },
  {
    id: "hs-unapproved-tools",
    rank: 5,
    nodeId: "public-ai-tool",
    title: "Student work goes into tools the institution never approved",
    whatHappens:
      "A teacher pastes a child's essay into a public chatbot to draft feedback or a report-card comment, along with their name and sometimes their support needs. Elsewhere a department has signed up to a learning app on its own, and the institution cannot produce a list of every platform holding student data.",
    whyItMatters:
      "A child's work and name are disclosed to a service the institution has no contract with, no notice covers and no deletion route reaches. There is no record it happened, so it cannot be told to a parent, included in an access response, or stopped afterwards. The adopted platforms are barely better: each holds a profile of what the child is judged to be weak at, built by a model nobody has reviewed.",
    dataCategoryIds: ["learning-activity", "student-identity", "learner-profile", "health-support"],
    action:
      "State plainly which tools may and may not be used on student work and provide an approved alternative so the need does not go underground, keep a register of approved learning platforms with an owner for each, check what a vendor retains and whether student work trains their models before a class uses it, and require deletion when a contract ends.",
    assessmentBucket: "learning_vendor_platform",
  },
  {
    id: "hs-identity-fragmentation",
    rank: 6,
    nodeId: "student-erp",
    title: "One student, several records - and the wrong adult attached",
    whatHappens:
      "The same child is created separately in the ERP, the LMS, the parent app, the transport list and the exam system, and the records are reconciled by eye. A sibling's details, a shared family mobile number or a mis-keyed date of birth quietly links a child to the wrong adult, and a separated parent's login is almost never removed.",
    whyItMatters:
      "This is how a report card, an attendance alert, a counselling outcome or a live bus location reaches someone who should not have it - including, in the worst cases, a parent a court has restricted. It is also why a correction made in one system never reaches the others, and why nobody can answer confidently when a family asks what the institution holds.",
    dataCategoryIds: ["student-identity", "guardian-family", "academic-record", "student-contact"],
    action:
      "Define one master student identifier that every other system derives from, verify and record the guardian relationship rather than inferring it from a phone number, support more than one guardian with different scopes, provision and remove accounts through a controlled workflow, run duplicate detection, and audit every record merge.",
    assessmentBucket: "student_parent_data",
  },
  {
    id: "hs-fee-exposure",
    rank: 7,
    nodeId: "fee-portal",
    title: "What a family could not pay becomes known to the classroom",
    whatHappens:
      "A dues report is exported at the start of every reminder round and forwarded to class teachers to chase. Names get read out in class, pinned to notice boards or circulated in staff and parent groups, and a report card is held back until the fee is cleared. Alongside this, income and category certificates submitted for a scholarship sit in the finance folder indefinitely.",
    whyItMatters:
      "A child is identified to their classmates by their family's financial position - something they did not choose, cannot change, and will carry socially for the rest of the year. The underlying documents are among the most consequential a family ever hands over, and they are handled as routine paperwork rather than as high-impact data.",
    dataCategoryIds: ["fee-financial", "guardian-family", "government-id", "student-identity"],
    action:
      "Restrict fee records to finance roles and never publish or circulate a defaulters list in any form, send teachers an action rather than a household's financial circumstances, keep reminders private to the family and out of class-level channels, handle income and category documents through named staff only and delete local copies once processed, and set a retention rule for financial records.",
    assessmentBucket: "student_parent_data",
  },
  {
    id: "hs-exit-persistence",
    rank: 8,
    nodeId: "erp-archive",
    title: "The student leaves. The record does not.",
    whatHappens:
      "A transfer certificate or a degree is issued and the student is marked inactive. They remain in the ERP, the LMS, the parent app, the photo library, the camera archive, the transport system, the alumni list, the board's records, every vendor platform, the nightly backups and a paper file in a store room - and are carried into alumni outreach without anyone asking.",
    whyItMatters:
      "This is the question the whole map exists to answer. If a former student asked tomorrow for every copy of their data, most institutions could not produce the list - and of the places they could name, most they cannot reach. An education record is one of the few that genuinely must be kept in part, which makes it all the more important to know which part that actually is.",
    dataCategoryIds: ["student-identity", "academic-record", "health-support", "media-content", "fee-financial"],
    action:
      "List every place student data lands and write a retention rule for each, separate what you are genuinely required to keep - a transcript - from what is merely never deleted, close student and parent accounts as a defined exit step, make alumni participation something a leaver chooses rather than a default, ask every vendor in writing what they retain and how deletion works, and record honestly where an erasure cannot reach and why.",
    assessmentBucket: "retention_sharing_rights",
  },
];

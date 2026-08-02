// The student journey - a 15-stage superset, projected per operating model.
//
// THE SECTOR'S SHAPE: a permanent record accumulated by proxy. Recruitment is a
// pipeline that flows once, CA a loop that recurs yearly, clinics a record that
// outlives the visit. Education is the only one where the record STARTS before
// the person can consent to it, is added to every single day for a decade or
// more by people who are not the institution's own staff - teachers, drivers,
// app vendors - and then follows the person out as an alumnus. Nobody chose most
// of what is in it, and by the time the subject can ask about it, the people who
// created it have moved on.
//
// The spine is MODEL-GATED, following recruitment and clinics: a K-12 school
// genuinely has no placement cell and a degree college genuinely does not run a
// school bus route, and pretending otherwise to keep the counts tidy would be
// dishonest. Counts are free in this framework.
//
//   school      -> 12 (no hostel/library, no placement, no group analytics)
//   college     -> 13 (no school transport, no group analytics)
//   integrated  -> all 15
//
// ELEVEN stages are all-model: enquiry, admission, enrolment, learning,
// monitoring, wellbeing, assessment, fees, authority, communication, exit.
// The EIGHT hotspots are pinned one each to eight of those eleven, which is what
// makes the journey's red flags reconcile with the hotspot counter in every
// model. See hotspots.ts for why that construction is load-bearing.

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const SCHOOLS_COLLEGES_STAGES: FlowStage[] = [
  {
    id: "enquiry",
    name: "Enquiry, prospectus & campus visit",
    sequence: 1,
    summary:
      "A parent calls, fills in a website form, messages on WhatsApp, walks in on an open day or arrives through an education portal. A child's name, age and current school are recorded - along with the family's address and the parents' occupations - before anyone has applied for anything.",
    dpdpaNote:
      "Give notice at the first point of contact, not at admission. An enquiry needs far less than an application does: a child's full date of birth, sibling details and a parent's occupation are not required to answer a question about fees. Keep enquiries in systems you can search, restrict and delete from, and set a retention rule for families who never enrol.",
  },
  {
    id: "admission",
    name: "Application, documents & guardian authorisation",
    sequence: 2,
    summary:
      "The application is submitted with birth certificates, identity documents, previous school records and a health declaration. One parent signs one form - and that signature is subsequently treated as permission for the school app, the photographs, the CCTV, the bus tracker and the marketing, for as long as the student stays.",
    dpdpaNote:
      "Separate what admission genuinely requires from what is optional, and record each optional use as its own choice that can be refused without affecting the admission. Record which guardian is authorised for what, keep the notice version and timestamp with the record, and define how long a rejected application is kept.",
  },
  {
    id: "enrolment",
    name: "Student identity, ERP & account creation",
    sequence: 3,
    summary:
      "The student becomes a record: an admission number, a roll number, a class and section, a parent login, a student email, an ID card and an entry in every system the institution runs. The same person is created several times over, and the link to the right adult is made by hand.",
    dpdpaNote:
      "Define one master student identifier that every other system derives from, verify the guardian relationship rather than assuming it, and provision and de-provision accounts through a controlled workflow. Duplicate students and stale parent logins are how the wrong adult ends up receiving a child's records.",
  },
  {
    id: "learning",
    name: "Classroom, LMS & EdTech activity",
    sequence: 4,
    summary:
      "Teaching generates data continuously: attendance in a register, work submitted to a portal, reading levels, participation notes, quiz scores, device activity, and free-text comments about a child written by an adult who will not be there in three years.",
    dpdpaNote:
      "Keep an approved-tool register and check what each vendor does with student work before a class uses it. Teacher observations become part of a child's record: keep them factual, keep them in institutional systems rather than personal devices, and make sure a parent can see and challenge what has been written.",
  },
  {
    id: "monitoring",
    name: "Attendance, CCTV, biometrics & campus access",
    sequence: 5,
    summary:
      "Cameras record corridors and classrooms, a fingerprint or face marks attendance, an RFID card logs each gate crossing, and a visitor book links an adult to a child. Together these produce a continuous, timestamped record of where a child was and who they were with.",
    dpdpaNote:
      "Use the least intrusive method that achieves the safety purpose, and be able to state that purpose per system. A biometric template needs a genuine necessity case and a deletion path on exit; CCTV needs defined camera placement, a retention limit, named access and a viewing log. Convenience is not a purpose.",
  },
  {
    id: "transport",
    name: "School transport & live location",
    sequence: 6,
    summary:
      "A child's name, home address, pickup stop, timings and a parent's mobile number are handed to a transport office, a driver and an attendant - and a GPS unit begins producing a live location trail that a parent app can watch.",
    dpdpaNote:
      "This is the point where a child's home address and daily routine leave your buildings. Minimise what a driver can see, use masked contact numbers where the route allows, limit how long location history is kept, make sure a parent sees only their own child, and revoke access the day a driver or attendant stops working for you.",
    businessModels: ["school", "integrated"],
  },
  {
    id: "residential",
    name: "Hostel, library & campus services",
    sequence: 7,
    summary:
      "A resident student's room, roommate, entry and exit times, visitors, late returns, library borrowing and mess registration are all recorded - producing a picture of private life that has nothing to do with academic performance.",
    dpdpaNote:
      "Keep residential and academic access separate: a faculty member marking coursework has no need for a student's entry-and-exit history. Define the purpose of hostel monitoring, avoid publishing room allocation lists, keep borrowing history only as long as circulation needs it, and restrict who can see disciplinary records.",
    businessModels: ["college", "integrated"],
  },
  {
    id: "wellbeing",
    name: "Health, counselling & special support",
    sequence: 8,
    summary:
      "Allergies, medication, a disability, a learning-support plan, an infirmary visit, a counselling session or a safeguarding concern is recorded - very often in a notebook, a personal drive or a message to a staff group rather than a controlled system.",
    dpdpaNote:
      "This is the highest-impact data an institution holds about a young person. Restrict it to the staff who genuinely need it, keep counselling records separate from the academic file, never disclose a condition in a class or staff group, share only the classroom support a teacher must know about rather than the diagnosis, and give the family a way to correct it.",
  },
  {
    id: "assessment",
    name: "Examinations, proctoring & results",
    sequence: 9,
    summary:
      "Marks begin life in a teacher's own spreadsheet, move into the examination system, become a report card or a transcript, and - where exams are online - are accompanied by a webcam recording, browser activity and an automatically raised suspicion flag.",
    dpdpaNote:
      "Keep one authoritative version of a result with an auditable correction history, and delete the working copies that were never meant to persist. Where a tool monitors a student during an exam or flags them automatically, define how long the recording is kept, require a human decision before any consequence, and give the student a route to challenge it.",
  },
  {
    id: "fees",
    name: "Fees, scholarships & financial aid",
    sequence: 10,
    summary:
      "Payment history, outstanding dues, bank details, a family's income certificate, a category certificate and a loan or scholarship file are processed - and the list of families who have not paid tends to circulate far more widely than the finance office.",
    dpdpaNote:
      "Restrict financial records to finance roles, and treat a family's income documents as high-impact data rather than routine paperwork. Share the minimum a scholarship body needs, never publish or circulate a defaulters list, keep fee reminders private to the family, and hold financial records under their own retention rule.",
  },
  {
    id: "authority",
    name: "Boards, universities & regulator submissions",
    sequence: 11,
    summary:
      "Student identity, attendance, marks, category and eligibility data are submitted to an education board, an affiliating university, a scholarship authority or an inspection body - usually as a spreadsheet exported from the ERP and emailed or uploaded by hand.",
    dpdpaNote:
      "Keep a register of what is disclosed, to which authority and under what obligation. Validate an export before it is submitted rather than after a correction is needed, restrict who holds portal credentials, delete the working files afterwards, and have a route to push a correction through to every authority that already received the wrong version.",
  },
  {
    id: "placement",
    name: "Internships, research & placements",
    sequence: 12,
    summary:
      "CVs, marks, aptitude scores, project work and faculty assessments are shared with employers, internship hosts and research partners - typically as a batch, for every student on a list, rather than per opportunity.",
    dpdpaNote:
      "Make participation a per-opportunity choice rather than a blanket one, share the minimum an employer needs to shortlist, log who received which profile, agree how long a partner keeps it, and keep placement support separate from using student outcomes as marketing material.",
    businessModels: ["college", "integrated"],
  },
  {
    id: "communication",
    name: "Communication, photographs & public content",
    sequence: 13,
    summary:
      "Announcements, fee reminders, results and event invitations go out through parent groups, apps and bulk messaging - and photographs, videos, award lists and toppers' marks go out onto the website and social media, where they stay.",
    dpdpaNote:
      "Treat publication as a separate, specific and revocable choice per channel, not part of the admission form. Keep a working removal route for a family that changes its mind, avoid publishing a child's full name alongside their results or a location and routine, control what an event photographer keeps, and review what is still visible from previous years.",
  },
  {
    id: "analytics",
    name: "Group analytics & cross-campus profiling",
    sequence: 14,
    summary:
      "Records from every campus are consolidated into a central warehouse and scored: performance comparisons between branches, dropout-risk and fee-default predictions, campaign audiences and alumni prospect lists - about children, across years.",
    dpdpaNote:
      "State the purpose of each analysis and stop the ones that have none. Behavioural profiling of children needs a much stronger justification than adult analytics does, automated classifications that affect a student need human review and an explanation the family can understand, and operational reporting should not quietly become a marketing audience.",
    businessModels: ["integrated"],
  },
  {
    id: "exit",
    name: "Transfer, graduation, alumni & archive",
    sequence: 15,
    summary:
      "The student leaves with a transfer certificate or a degree - and stays behind in the ERP, the LMS, the parent app, the photo library, the CCTV archive, the transport system, the board's records, the alumni database, the vendor platforms, the backups and a physical record room.",
    dpdpaNote:
      "Write a retention rule per record type and separate what you are genuinely required to keep - an academic transcript - from what is merely never deleted. Close student and parent accounts, remove optional marketing and analytics profiles, chase vendor deletion, review what is still public, and record honestly where an erasure cannot reach and why.",
  },
];

// People who touch student data in a school, college or multi-campus group.
// Rendered in the node detail panels as access lists.
//
// A NOTE ON THE GUARDIAN, because it is the modelling decision this map turns
// on. The parent or guardian sits in the `candidate` boundary - the data
// principal's own side - because for a student below 18 the guardian exercises
// the child's rights, and a report card reaching the right parent is not a
// disclosure outside the institution. That stops being true the moment the
// student is an adult: at a degree college the same parent is a third party with
// no automatic entitlement to marks, attendance or counselling records, and
// institutions very rarely change anything when a student turns 18. The map
// carries that as a rights scenario rather than a second persona, because the
// person has not changed - only their standing has.
//
// Four of these are not the institution's staff at all: the EdTech vendor whose
// platform holds the classwork, the driver carrying a home address, the board or
// university receiving the submissions, and the employer receiving a CV. Those
// are where "who can see this?" stops having an answer the institution controls.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const SCHOOLS_COLLEGES_PERSONAS: FlowPersona[] = [
  {
    id: "student",
    name: "Student",
    boundary: "candidate",
    description:
      "The data principal - one young person whose identity, learning, movements, health and results this map follows. Almost nothing in the record was created by them, and for most of it they were never asked.",
  },
  {
    id: "parent-guardian",
    name: "Parent or guardian",
    boundary: "candidate",
    description:
      "Applies, signs, pays, receives communication and exercises the child's rights while the student is a minor. Which guardian is authorised for what is very often assumed from a phone number rather than recorded - and once the student is an adult, the parent's standing changes but the access rarely does.",
  },
  {
    id: "admissions-staff",
    name: "Admissions & front office",
    boundary: "agency",
    description:
      "Handles enquiries, applications, documents and campus visits. Holds identity documents and family detail for every family that applied, including the ones who never enrolled.",
  },
  {
    id: "teacher",
    name: "Teacher / faculty",
    boundary: "agency",
    description:
      "Teaches, marks, records attendance and writes observations about a child that become part of a permanent record. Chooses classroom tools, and typically keeps working copies of marks and student work on a personal device.",
  },
  {
    id: "academic-admin",
    name: "Academic administration & examinations",
    boundary: "agency",
    description:
      "Registrar, examination controller and academic office - assemble results, run promotions, produce transcripts and prepare board or university submissions. Usually hold the broadest academic access in the institution.",
  },
  {
    id: "counsellor-nurse",
    name: "Counsellor, nurse & special-support staff",
    boundary: "agency",
    description:
      "Holds the highest-impact records in the institution: health conditions, medication, disability and learning-support plans, counselling notes and safeguarding concerns. Frequently keeps them outside any controlled system.",
  },
  {
    id: "security-staff",
    name: "Security & campus operations",
    boundary: "agency",
    description:
      "Operates gates, visitor registration, CCTV and access control. Often has continuous access to camera footage of children with no viewing log and no defined limit on what may be reviewed or exported.",
  },
  {
    id: "transport-staff",
    name: "Driver, attendant & transport office",
    boundary: "vendor",
    description:
      "Carries a list of children, their home addresses, pickup timings and parents' mobile numbers - routinely on a personal phone, and frequently retained after the contract or the route ends.",
  },
  {
    id: "hostel-warden",
    name: "Hostel warden & residence staff",
    boundary: "agency",
    description:
      "Records room allocation, entry and exit, visitors, late returns and disciplinary matters - a picture of a student's private life that sits alongside their academic file.",
  },
  {
    id: "finance-staff",
    name: "Finance & fee office",
    boundary: "agency",
    description:
      "Processes fees, dues, concessions, scholarships and loans. Sees family income documents and category certificates, and is the source of the defaulters list that tends to travel further than intended.",
  },
  {
    id: "it-admin",
    name: "IT & systems administrator",
    boundary: "agency",
    description:
      "Administers the ERP, LMS, accounts, cameras and backups. Can reach every student record in the institution, and is usually the only person who could prove who else did.",
  },
  {
    id: "edtech-vendor",
    name: "EdTech, ERP & platform vendor staff",
    boundary: "vendor",
    description:
      "Support and engineering staff for the ERP, LMS, learning apps, attendance devices, cameras, proctoring tools and analytics - typically with remote access that reaches live student records.",
  },
  {
    id: "education-authority",
    name: "Board, university & regulator",
    boundary: "government",
    description:
      "Receives student identity, attendance, category and result data as a condition of affiliation, examination or funding. A separate controller: the institution cannot audit, correct or delete what sits in their systems.",
  },
  {
    id: "employer-partner",
    name: "Employer, internship & research partner",
    boundary: "client",
    description:
      "Receives CVs, assessment scores and project work through the placement cell or a faculty arrangement. Keeps the profile indefinitely, and is under no obligation the student ever saw.",
  },
  {
    id: "public-audience",
    name: "Anyone who sees a public post",
    boundary: "public",
    description:
      "Parents, prospective families, former staff, strangers and search engines. A named child photographed at a known location on a known daily schedule is visible to all of them, permanently and without any way to take it back.",
  },
];

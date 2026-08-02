// Data groups an educational institution holds about one student.
//
// LANGUAGE LOCK: this map says "high-impact student data", never "sensitive
// personal data". The DPDPA creates no such statutory category - that is
// GDPR-tier language, and using it here would be a factual error dressed as
// rigour. DPDPA scope only: no education-board or university retention
// schedules, no claims about what a regulator requires, no legal advice.
//
// The two `derived` categories are the quiet half. A learner profile and a
// household segment are CREATED by the institution and its tools - a child was
// banded, scored, predicted or labelled. The family never handed those over, has
// usually never seen them, and cannot correct what they cannot see. That is why
// they render differently.
//
// Sixteen categories, not the forty a full taxonomy would give. Past about
// sixteen the legend stops communicating and every node renders a wall of tags,
// so the finer distinctions - caste and category certificates, safeguarding
// concerns, mess registration, viva recordings - live as EXAMPLES inside these,
// where they carry their weight without breaking the page.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const SCHOOLS_COLLEGES_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "student-identity",
    name: "Student identity",
    kind: "provided",
    examples: [
      "Name and photograph",
      "Admission number / enrolment number",
      "Roll number, class and section",
      "Date of birth and age",
      "Gender",
      "House or batch",
    ],
  },
  {
    id: "student-contact",
    name: "Contact & address details",
    kind: "provided",
    examples: [
      "Residential address",
      "Student mobile and institutional email",
      "Emergency contact",
      "Locality used for transport routing",
    ],
  },
  {
    id: "guardian-family",
    name: "Parent, guardian & family details",
    kind: "provided",
    examples: [
      "Parent or guardian name and relationship",
      "Parent mobile, WhatsApp number and email",
      "Occupation and employer",
      "Sibling links within the institution",
      "Custody or separated-guardian arrangements",
      "Who is authorised to collect the child",
    ],
  },
  {
    id: "government-id",
    name: "Identity & eligibility documents",
    kind: "provided",
    examples: [
      "Birth certificate",
      "Aadhaar number or copy",
      "Category or community certificate",
      "Domicile or residence proof",
      "Passport for an overseas programme",
      "Scanned document images in an upload folder",
    ],
  },
  {
    id: "academic-record",
    name: "Academic record & admission history",
    kind: "provided",
    examples: [
      "Previous school records and transfer certificate",
      "Entrance or admission test score",
      "Marks, grades and rank",
      "Report card and transcript",
      "Promotion or detention decision",
      "Teacher comments on performance",
    ],
  },
  {
    id: "attendance-behaviour",
    name: "Attendance & behaviour records",
    kind: "provided",
    examples: [
      "Daily attendance and late arrivals",
      "Absence reasons given by a parent",
      "Discipline notes and incident reports",
      "Detention or suspension record",
      "Examination misconduct record",
    ],
  },
  {
    id: "health-support",
    name: "Health, counselling & special support (high-impact student data)",
    kind: "provided",
    examples: [
      "Allergies and medical conditions",
      "Medication administered at school",
      "Disability and accessibility needs",
      "Learning-support or individual education plan",
      "Counselling and wellbeing session notes",
      "Safeguarding concern record",
      "Infirmary or medical-centre visit",
    ],
  },
  {
    id: "monitoring-biometric",
    name: "CCTV, biometric & campus-access records",
    kind: "provided",
    examples: [
      "CCTV footage of corridors, classrooms and gates",
      "Fingerprint or face template used for attendance",
      "RFID card tap events",
      "Gate entry and exit timestamps",
      "Visitor log linking an adult to a child",
    ],
  },
  {
    id: "location-transport",
    name: "Transport & location data",
    kind: "provided",
    examples: [
      "Home pickup address and bus stop",
      "Route, bus number and timings",
      "Live GPS position and route history",
      "Boarding and drop-off events",
      "Missed-bus and delay alerts",
    ],
  },
  {
    id: "residential-campus",
    name: "Hostel, library & campus-service records",
    kind: "provided",
    examples: [
      "Hostel room and roommate allocation",
      "Entry, exit and late-return history",
      "Visitor records at a residence",
      "Library borrowing history",
      "Mess and facility registration",
    ],
  },
  {
    id: "fee-financial",
    name: "Fees, scholarships & family finances",
    kind: "provided",
    examples: [
      "Fee status, dues and payment history",
      "Bank account and payment reference",
      "Family income certificate",
      "Scholarship or financial-aid application",
      "Education-loan file",
      "Fee concession and waiver record",
    ],
  },
  {
    id: "learning-activity",
    name: "Learning-platform & exam activity",
    kind: "provided",
    examples: [
      "LMS logins and time on task",
      "Assignments and submitted work",
      "Quiz and practice attempts",
      "Device and app usage during class",
      "Online-exam webcam recording and browser activity",
      "Plagiarism-check report",
    ],
  },
  {
    id: "media-content",
    name: "Photographs, video & messages",
    kind: "provided",
    examples: [
      "Classroom and event photographs",
      "Annual-day and sports video",
      "Yearbook entry",
      "Parent group and broadcast messages",
      "Award and achievement post",
      "Raw photographer files",
    ],
  },
  {
    id: "placement-alumni",
    name: "Placement, internship & alumni records",
    kind: "provided",
    examples: [
      "CV and skills profile",
      "Aptitude and assessment scores",
      "Employer shortlist and interview outcome",
      "Offer and salary detail",
      "Internship and project evaluation",
      "Alumni contact record",
    ],
  },
  {
    id: "learner-profile",
    name: "Learner profiles & tool-generated judgements",
    kind: "derived",
    examples: [
      "Ability banding or streaming decision",
      "Dropout or academic-risk score",
      "AI-generated feedback on submitted work",
      "Automatically raised exam-suspicion flag",
      "Behaviour or attitude label",
      "Predicted grade",
    ],
  },
  {
    id: "engagement-segment",
    name: "Household segments & institutional analytics",
    kind: "derived",
    examples: [
      "Admission-likelihood score for an enquiry",
      "Fee-default risk classification",
      "Marketing and lookalike audience built from parent contacts",
      "Cross-campus performance comparison",
      "Alumni donation prospect list",
      "Re-enrolment retention score",
    ],
  },
];

// Training institute lifecycle - 10 canonical stages.
// A student's data enters at enquiry and accumulates through admission, fees,
// classes, assessment, certification and placement - then sits in archives,
// alumni lists and backups long after the course ends. The stage spine is the
// SAME for all three operating models (classroom / hybrid / online); only the
// SYSTEMS at each stage differ, and that difference is carried by node gating,
// not by changing the stages - so the selector never reshuffles the journey.

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const TRAINING_INSTITUTES_STAGES: FlowStage[] = [
  {
    id: "enquiry",
    name: "Marketing & enquiry",
    sequence: 1,
    summary:
      "A prospective student or parent responds to an ad, a banner, a website or a referral. Contact details are captured on paper, on WhatsApp or through a web form before any controlled system exists.",
    dpdpaNote: "Give a short notice at the point of collection, take only what counselling needs, and never begin tracking a minor before a parent can see the notice.",
  },
  {
    id: "counselling",
    name: "Counselling & course guidance",
    sequence: 2,
    summary:
      "A counsellor discusses courses, fees and eligibility - capturing career goals, academic background and parent contact in notebooks, spreadsheets, CRM notes and WhatsApp chats.",
    dpdpaNote: "Keep counselling notes factual and relevant, move documents off personal chat, and avoid collecting family or financial detail the course does not need.",
  },
  {
    id: "admission",
    name: "Admission, documents & consent",
    sequence: 3,
    summary:
      "The student enrols. Identity, education records, photographs, guardian details and often ID proof are collected - and admission consent frequently bundles marketing, photography and communication into one signature.",
    dpdpaNote: "Separate what is mandatory from what is optional, avoid Aadhaar unless genuinely required, and record verifiable parental consent for a minor.",
  },
  {
    id: "fees",
    name: "Fees, instalments & payments",
    sequence: 4,
    summary:
      "Fees are paid by cash, UPI, a payment gateway or a subscription. Payment references, instalment plans and screenshots spread across receipt books, gateways, spreadsheets and phones.",
    dpdpaNote: "Restrict finance access, do not share fee status in open groups, and stop keeping payment screenshots once a payment is reconciled.",
  },
  {
    id: "learning",
    name: "Learning delivery",
    sequence: 5,
    summary:
      "Teaching happens in a classroom, on an LMS, in live video sessions or all three. The student becomes several parallel records - a roster entry, an LMS login, a video participant.",
    dpdpaNote: "Map the learner's identifiers across systems, restrict recording access, and set an expiry on session recordings rather than keeping them forever.",
  },
  {
    id: "attendance",
    name: "Attendance & engagement",
    sequence: 6,
    summary:
      "Attendance is taken on a register, a biometric device or login telemetry. Engagement, watch history and participation are logged - sometimes on cameras, sometimes as behavioural analytics.",
    dpdpaNote: "Use the least intrusive attendance method, define a CCTV and biometric purpose and retention, and do not publicly display attendance.",
  },
  {
    id: "assessment",
    name: "Tests, proctoring & performance",
    sequence: 7,
    summary:
      "Tests generate marks, ranks and performance profiles. Online exams may add proctoring - webcam, microphone and browser monitoring - and AI evaluation that infers weak areas and predicts outcomes.",
    dpdpaNote: "Share results individually, keep proctoring proportionate and explained, retain human review of AI scoring, and allow correction of an inaccurate record.",
  },
  {
    id: "communication",
    name: "Student & parent communication",
    sequence: 8,
    summary:
      "The institute reaches students and parents through WhatsApp groups, broadcasts, SMS, email and support desks. Numbers, complaints and behavioural notes accumulate in mixed, open channels.",
    dpdpaNote: "Prefer managed groups or broadcasts, keep parent and student channels separate, and never disclose fees, marks or disciplinary detail in an open group.",
  },
  {
    id: "certification",
    name: "Certification & placement",
    sequence: 9,
    summary:
      "Completion produces certificates, and placement support shares CVs and profiles with employers and internship partners - often across many opportunities without an opportunity-level confirmation.",
    dpdpaNote: "Confirm each employer share, log the transfer, share the minimum a role needs, and keep certificate records to a minimal verification set.",
  },
  {
    id: "retention",
    name: "Alumni, retention & deletion",
    sequence: 10,
    summary:
      "Everything is kept - admission files, payments, recordings, results, alumni contacts, backups and analytics. There is rarely a retention schedule, and deleting a record from one system misses the copies in the others.",
    dpdpaNote: "Set record-specific retention, wipe devices before disposal, remove former-staff access, and build a deletion path that reaches vendors, backups and analytics.",
  },
];

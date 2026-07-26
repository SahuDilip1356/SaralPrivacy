// People who touch student data in a training institute. Rendered in node detail
// panels as access lists. The parent/guardian is a linked principal, not staff -
// for a minor, their data and consent ride alongside the student's throughout.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const TRAINING_INSTITUTES_PERSONAS: FlowPersona[] = [
  { id: "student", name: "Student", boundary: "candidate", description: "The data principal - the learner whose personal data this map follows. Often a minor." },
  { id: "parent", name: "Parent / guardian", boundary: "client", description: "A linked principal for a minor; supplies consent and contact details and receives communication." },
  { id: "owner", name: "Institute owner / admin", boundary: "agency", description: "Runs the institute; has broad access to admissions, finance and records." },
  { id: "counsellor", name: "Counsellor / admissions", boundary: "agency", description: "Handles enquiries, counselling and admission; first to collect student data." },
  { id: "faculty", name: "Faculty / trainer", boundary: "agency", description: "Teaches, marks and comments; often receives full learner lists and keeps local copies." },
  { id: "finance", name: "Finance / accounts", boundary: "agency", description: "Handles fees, instalments, receipts and refunds." },
  { id: "placement-cell", name: "Placement cell", boundary: "agency", description: "Prepares CVs and shares learner profiles with employers and internship partners." },
  { id: "it-support", name: "IT / admin support", boundary: "agency", description: "Manages devices, drives, the LMS, backups and platform logins - broad technical access." },
  { id: "vendor-staff", name: "Platform / vendor staff", boundary: "vendor", description: "LMS, video, proctoring, billing and support vendors whose staff can reach learner data on their platforms." },
  { id: "employer", name: "Employer / hiring partner", boundary: "third-party", description: "Receives CVs and placement profiles, usually without a processing contract." },
];

// Data groups a training institute holds. The four `derived` categories are the
// quiet ones - attendance, performance, behavioural analytics and employability
// scores are CREATED by the institute and its platforms, not handed over, and
// the views render them visibly different from provided data. `parent-guardian`
// and the photo/recording data are what make this the first map where the data
// principal is often a minor.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const TRAINING_INSTITUTES_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "student-identity",
    name: "Student identity",
    kind: "provided",
    examples: ["Name", "Date of birth", "Age", "Photograph", "Gender"],
  },
  {
    id: "parent-guardian",
    name: "Parent / guardian details",
    kind: "provided",
    examples: ["Parent name", "Guardian contact", "Relationship", "Parent email"],
  },
  {
    id: "contact",
    name: "Contact data",
    kind: "provided",
    examples: ["Mobile number", "Email", "Address", "WhatsApp number"],
  },
  {
    id: "education-eligibility",
    name: "Education & eligibility",
    kind: "provided",
    examples: ["Class / year", "School or college name", "Marksheets", "Prior qualification", "Course interest"],
  },
  {
    id: "id-document",
    name: "ID documents",
    kind: "provided",
    examples: ["Aadhaar", "ID proof", "Address proof", "Scanned certificates"],
  },
  {
    id: "financial-payment",
    name: "Fees & payment data",
    kind: "provided",
    examples: ["Fee amount", "UPI / card reference", "Instalment plan", "Payment screenshots", "Refund status"],
  },
  {
    id: "photos-recordings",
    name: "Photos, videos & recordings",
    kind: "provided",
    examples: ["Classroom photos", "CCTV footage", "Live-session recordings", "Transcripts", "Event videos"],
  },
  {
    id: "attendance",
    name: "Attendance records",
    kind: "derived",
    examples: ["Attendance %", "Biometric log", "Login history", "Absence history"],
  },
  {
    id: "assessment-performance",
    name: "Marks & performance",
    kind: "derived",
    examples: ["Test scores", "Rank", "Weak-topic profile", "Faculty comments", "Performance band"],
  },
  {
    id: "behavioural-derived",
    name: "Behavioural & learning analytics",
    kind: "derived",
    examples: ["Watch history", "Engagement score", "Dropout prediction", "Proctoring flags", "AI recommendation"],
  },
  {
    id: "placement-employability",
    name: "Placement & employability data",
    kind: "derived",
    examples: ["CV", "Skills profile", "Employability score", "Interview result", "Placement status"],
  },
];

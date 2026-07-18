// 11 data groups (spec §8, A–K). `discoveryItems` reuses the exact item
// wording of the Discovery niche `recruitment-staffing` (lib/discovery,
// taxonomy v3.0) so both tools speak the same language. Derived/inferred
// data (K) is a distinct kind — views must render it visibly different.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const RECRUITMENT_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "identity",
    name: "Identity data",
    kind: "provided",
    examples: ["Name", "Photograph", "Date of birth", "PAN", "Aadhaar-related records", "Passport", "Signature"],
    discoveryItems: ["Name and basic identity", "PAN/KYC, bank and financial proof data", "Client/candidate identity and contact records"],
  },
  {
    id: "contact",
    name: "Contact data",
    kind: "provided",
    examples: ["Mobile number", "Email", "Address", "WhatsApp number", "Emergency contact"],
    discoveryItems: ["Contact details", "Address/location contact fields"],
  },
  {
    id: "professional",
    name: "Professional data",
    kind: "provided",
    examples: ["Resume / CV", "Employment history", "Designation", "Skills", "Notice period", "References"],
    discoveryItems: ["Job applicant CVs & interview notes", "Professional documents and case files", "Candidate lifecycle and recruitment records"],
  },
  {
    id: "education",
    name: "Education data",
    kind: "provided",
    examples: ["Institution", "Qualification", "Marks", "Certificates", "Graduation year"],
  },
  {
    id: "financial",
    name: "Financial data",
    kind: "provided",
    examples: ["Current salary", "Expected salary", "Payslips", "Bank account details", "Tax information"],
    discoveryItems: ["Financial, salary and tax records", "PAN/KYC, bank and financial proof data"],
  },
  {
    id: "assessment",
    name: "Assessment data",
    kind: "provided",
    examples: ["Test scores", "Psychometric profile", "Interview feedback", "Video interview recordings", "Proctoring logs"],
    discoveryItems: ["Interview, assessment and advisory notes"],
  },
  {
    id: "verification",
    name: "Verification data",
    kind: "provided",
    examples: ["Employment verification", "Education verification", "Address verification", "Reference feedback", "BGV reports"],
    discoveryItems: ["Background verification and due diligence data"],
  },
  {
    id: "communication",
    name: "Communication data",
    kind: "provided",
    examples: ["Email threads", "WhatsApp chats", "Call notes", "Voice recordings"],
    discoveryItems: ["WhatsApp/email attachments and shared folders"],
  },
  {
    id: "device-technical",
    name: "Device & technical data",
    kind: "provided",
    examples: ["IP address", "Device ID", "Browser metadata", "Login history", "Application source URL"],
    discoveryItems: ["Account/profile identifiers", "Processor access logs and client data handling evidence"],
  },
  {
    id: "employment",
    name: "Employment data (deployed staff)",
    kind: "provided",
    examples: ["Employee ID", "Attendance", "Payroll", "PF / ESI", "Leave", "Performance notes", "Exit details"],
    discoveryItems: ["Employee & staff identity records", "Payroll, attendance & statutory records (PF/ESI)", "Ex-employee records & lingering access"],
  },
  {
    id: "derived",
    name: "Derived & inferred data",
    kind: "derived",
    examples: ["Candidate ranking", "Role-fit score", "AI summary", "Salary estimate", "Rehire eligibility", "Recruiter recommendation"],
    discoveryItems: ["AI screening, lead scoring and profiling", "AI-generated scores, inferences and summaries"],
  },
];

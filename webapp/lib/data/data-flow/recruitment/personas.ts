// People who touch candidate data (spec §10 accessor concept).
// Rendered in node detail panels as access lists - not graph nodes in P0.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const RECRUITMENT_PERSONAS: FlowPersona[] = [
  { id: "candidate", name: "Candidate", boundary: "candidate", description: "The data principal - the person the record is about." },
  { id: "recruiter", name: "Recruiter", boundary: "agency", description: "Sources, screens and submits candidates; creates most copies day-to-day." },
  { id: "recruitment-lead", name: "Recruitment lead", boundary: "agency", description: "Reviews shortlists, approves submissions, owns team trackers." },
  { id: "ops-head", name: "Operations head", boundary: "agency", description: "Owns the ATS, process and recruiter workflows." },
  { id: "hr-compliance", name: "HR / compliance owner", boundary: "agency", description: "Handles consent evidence, rights requests and vendor obligations." },
  { id: "finance", name: "Finance executive", boundary: "agency", description: "Touches offer, payroll and settlement data." },
  { id: "it-admin", name: "IT administrator", boundary: "agency", description: "Manages accounts, drives, devices and backups - broad technical access." },
  { id: "client-hr", name: "Client HR", boundary: "client", description: "Receives submitted profiles; circulates them inside the client organisation." },
  { id: "client-hiring-manager", name: "Client hiring manager", boundary: "client", description: "Evaluates candidates; often receives forwarded CVs and feedback threads." },
  { id: "bgv-analyst", name: "BGV vendor analyst", boundary: "vendor", description: "Handles identity and employment documents during verification." },
  { id: "payroll-executive", name: "Payroll vendor executive", boundary: "vendor", description: "Processes salary, bank and statutory data for deployed staff." },
];

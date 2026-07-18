// Recruitment lifecycle — 12 canonical stages (spec §7).
// Stages 10–11 apply only to staffing/RPO (employee lifecycle).

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const RECRUITMENT_STAGES: FlowStage[] = [
  {
    id: "sourcing",
    name: "Candidate sourcing",
    sequence: 1,
    summary:
      "Profiles arrive from job portals, LinkedIn, referrals, walk-ins and old databases — often before the candidate has spoken to anyone.",
    dpdpaNote: "Tell the candidate what you collect and why, at or before collection.",
  },
  {
    id: "registration",
    name: "Registration & consent",
    sequence: 2,
    summary:
      "A profile is created in the ATS. Notice shown, consent captured — including whether the CV may be shared with clients.",
    dpdpaNote: "Keep evidence of what the candidate agreed to, and make withdrawal as easy as consent.",
  },
  {
    id: "screening",
    name: "Resume screening",
    sequence: 3,
    summary:
      "Recruiters download, shortlist and enrich profiles — notes, scores and AI summaries are added, and copies land in trackers and laptops.",
    dpdpaNote: "Use the profile only for the hiring purpose it was collected for.",
  },
  {
    id: "engagement",
    name: "Candidate engagement",
    sequence: 4,
    summary:
      "Calls, email and WhatsApp: salary expectations, notice periods and documents move through chat threads and inboxes.",
    dpdpaNote: "Candidate data on personal devices is still your responsibility — keep it in managed systems.",
  },
  {
    id: "assessment",
    name: "Assessment",
    sequence: 5,
    summary:
      "Tests and recorded video interviews run on vendor platforms — scores, recordings and proctoring logs are created outside your systems.",
    dpdpaNote: "Vendors processing candidate data need clear responsibilities and limits.",
  },
  {
    id: "client-submission",
    name: "Client submission",
    sequence: 6,
    summary:
      "CVs, salary details and recruiter notes go to client HR by email, portal upload or WhatsApp — and get forwarded inside the client.",
    dpdpaNote: "Share only what the client needs, after the candidate has agreed to be submitted.",
  },
  {
    id: "interview",
    name: "Interview management",
    sequence: 7,
    summary:
      "Scheduling, panel feedback and recordings — subjective comments and evaluations accumulate against the profile.",
    dpdpaNote: "Interview notes are the candidate's personal data too — keep them professional and correctable.",
  },
  {
    id: "bgv",
    name: "Background verification",
    sequence: 8,
    summary:
      "PAN, ID documents, payslips and certificates flow to BGV vendors, who contact past employers and institutions.",
    dpdpaNote: "High-impact identity and financial documents need a clear basis, minimum copies and protected transfer.",
  },
  {
    id: "offer",
    name: "Offer management",
    sequence: 9,
    summary:
      "Offer letters, bank details and joining documents move through e-sign tools, email and shared drives.",
    dpdpaNote: "Collect joining documents only when the offer is real, and review what you keep if the candidate declines.",
  },
  {
    id: "onboarding",
    name: "Onboarding & employment",
    sequence: 10,
    summary:
      "For deployed staff: employee master, payroll, attendance and statutory filings — data now lives in agency, client and vendor systems at once.",
    dpdpaNote: "Be clear who is responsible for employee data shared between agency, client and payroll vendors.",
    businessModels: ["staffing", "rpo"],
  },
  {
    id: "exit",
    name: "Exit & redeployment",
    sequence: 11,
    summary:
      "Deployment ends: settlements, experience letters, and profiles moved back into the pool 'for future opportunities'.",
    dpdpaNote: "Remove access on exit, and keep ex-employee records only with a defined reason and period.",
    businessModels: ["staffing", "rpo"],
  },
  {
    id: "archive",
    name: "Archive, retention & deletion",
    sequence: 12,
    summary:
      "Copies remain in ATS archives, mailboxes, drives, laptops, backups and print — long after the hiring purpose has ended.",
    dpdpaNote: "When the purpose ends, review retention — and be able to erase every copy when asked.",
  },
];

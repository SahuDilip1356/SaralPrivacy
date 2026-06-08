// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Recruitment Agencies pack (3rd industry)
// "Recruitment Agency DPDPA Risk Scan" — a candidate-data movement risk scan.
// Caps for Q1–Q10 sum to 110; the engine normalises by Σ caps automatically.
// Built on the shared engine (zero engine changes). See:
//   docs/SaralPrivacy_Recruitment_Assessment_v2_Spec.md
// ─────────────────────────────────────────────────────────────────────────────

import {
  IndustryPack,
  IAQuestion,
  IABucket,
  IAOverride,
  IAFlagRule,
  IAResult,
  IAAnswers,
  selectedIds,
} from "../core";
import type { BandLabel } from "../bands";

// ── Buckets (5) ────────────────────────────────────────────────────────────────

const BUCKETS: IABucket[] = [
  {
    key: "candidate_sourcing",
    label: "Candidate sourcing risk",
    meaning: "Profiles may enter through multiple informal or poorly documented channels.",
  },
  {
    key: "candidate_document",
    label: "Candidate document risk",
    meaning: "Identity, salary or BGV documents may be collected or stored without enough control.",
  },
  {
    key: "client_sharing",
    label: "Client sharing risk",
    meaning: "CVs may be forwarded, bulk-shared or accessed by clients without proper safeguards.",
  },
  {
    key: "ats_tool_access",
    label: "ATS, tool & access risk",
    meaning: "Candidate data may sit across ATS, Excel, email, WhatsApp and recruiter devices.",
  },
  {
    key: "retention_rights",
    label: "Retention & rights readiness risk",
    meaning: "Old or rejected candidate profiles may be retained without defined deletion rules.",
  },
];

// high-impact document ids (used by overrides/flags)
const HIGH_IMPACT_DOCS = ["id_proof", "salary_bank_docs", "bgv_docs", "sensitive_category"];
const SCATTERED_STORAGE = ["whatsapp", "recruiter_devices", "external_drives", "multiple_no_sot"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Agency profile ─────────────────────────────────────────────────
  {
    id: "q1",
    badge: "Agency Profile",
    question: "What type of recruitment or staffing work do you handle?",
    helpText: "Select all that apply. This helps estimate your candidate-data risk profile.",
    whyThisMatters:
      "Payroll-linked staffing, RPO and overseas recruitment usually involve more candidate data, more third-party sharing and more operational exposure.",
    type: "multi",
    cap: 8,
    bucket: "candidate_sourcing",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "permanent_hiring", label: "Permanent hiring / placement", riskPoints: 2 },
      { id: "executive_search", label: "Executive search / leadership hiring", riskPoints: 3 },
      { id: "contract_staffing", label: "Contract staffing / manpower supply", riskPoints: 4 },
      { id: "blue_collar", label: "Blue-collar / field-force hiring", riskPoints: 4 },
      { id: "campus_hiring", label: "Campus hiring / fresher hiring", riskPoints: 3 },
      { id: "overseas_recruitment", label: "Overseas recruitment", riskPoints: 6, badge: "CROSS-BORDER", badgeColor: "amber" },
      { id: "rpo", label: "Recruitment Process Outsourcing / RPO", riskPoints: 5 },
      { id: "payroll_staffing", label: "Payroll-linked staffing services", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "freelance", label: "Freelance / independent recruiting", riskPoints: 2 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 4 },
    ],
  },

  // ─── Q2 Candidate sourcing ─────────────────────────────────────────────
  {
    id: "q2",
    badge: "Candidate Sourcing Risk",
    question: "Where do candidate profiles usually come from?",
    helpText: "Select all sources used by your recruiters, clients or hiring teams.",
    whyThisMatters:
      "Risk increases when profiles come from informal, reused, scraped or poorly documented sources.",
    type: "multi",
    cap: 12,
    bucket: "candidate_sourcing",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "job_portals", label: "Job portals such as Naukri, Indeed, Monster, Apna", riskPoints: 2 },
      { id: "linkedin", label: "LinkedIn or other professional networks", riskPoints: 2 },
      { id: "email_applications", label: "Direct email applications", riskPoints: 3 },
      { id: "whatsapp_referrals", label: "WhatsApp referrals or candidate groups", riskPoints: 5 },
      { id: "referrals", label: "Employee/client referrals", riskPoints: 3 },
      { id: "campus_walkin", label: "Campus drives or walk-in drives", riskPoints: 3 },
      { id: "previous_database", label: "Candidate database from previous hiring mandates", riskPoints: 5 },
      { id: "scraped_profiles", label: "Public internet search or scraped profiles", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "client_lists", label: "Client-provided candidate lists", riskPoints: 3 },
      { id: "multiple_no_sot", label: "Multiple channels, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q3 Candidate data ─────────────────────────────────────────────────
  {
    id: "q3",
    badge: "Candidate Document Risk",
    question: "Which candidate data or documents do you collect or store?",
    helpText: "Select all CV, identity, salary, education, assessment or background-verification data your agency collects or stores.",
    whyThisMatters:
      "A CV alone is already personal data. Salary slips, PAN, Aadhaar, BGV records, psychometric scores and health/diversity data create much higher exposure.",
    type: "multi",
    cap: 14,
    bucket: "candidate_document",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "cv_resume", label: "CV / resume", riskPoints: 2 },
      { id: "contact_location", label: "Phone number, email and location", riskPoints: 2 },
      { id: "work_history", label: "Current employer, designation and work history", riskPoints: 2 },
      { id: "ctc_notice", label: "Current CTC, expected CTC, notice period", riskPoints: 4 },
      { id: "id_proof", label: "PAN, Aadhaar or other ID proof", riskPoints: 5, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "salary_bank_docs", label: "Salary slips, bank details or payroll documents", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "employment_letters", label: "Offer letters, relieving letters or experience letters", riskPoints: 4 },
      { id: "education_docs", label: "Education certificates or marksheets", riskPoints: 4 },
      { id: "bgv_docs", label: "Background verification documents", riskPoints: 6, badge: "HIGH IMPACT", badgeColor: "red" },
      { id: "references", label: "References and emergency contact details", riskPoints: 4 },
      { id: "assessment_data", label: "Candidate assessment scores, interview feedback or psychometric results", riskPoints: 5 },
      { id: "sensitive_category", label: "Disability, health, diversity or special category information", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "other", label: "Other candidate documents", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q4 Early collection ───────────────────────────────────────────────
  {
    id: "q4",
    badge: "Early Collection Risk",
    question: "At what stage do you collect identity, salary or background verification documents?",
    helpText: "Choose the option closest to your current recruitment process.",
    whyThisMatters:
      "Agencies should avoid collecting high-impact documents too early unless clearly required for the hiring process.",
    type: "single",
    cap: 10,
    bucket: "candidate_document",
    layer: "control",
    options: [
      { id: "after_offer_needed", label: "Only after shortlist/offer stage and when needed", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "after_screening", label: "After the first screening call for selected candidates", riskPoints: 3 },
      { id: "initial_registration", label: "During initial registration for most candidates", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "whenever_shared", label: "We collect these documents whenever candidates share them", riskPoints: 8, badge: "RISK", badgeColor: "red" },
      { id: "do_not_collect", label: "We do not collect identity/salary/BGV documents", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q5 Candidate notice ───────────────────────────────────────────────
  {
    id: "q5",
    badge: "Candidate Notice & Consent",
    question: "How do you inform candidates before storing or sharing their profile?",
    helpText: "This may be through a job application form, email, WhatsApp message, privacy notice or candidate consent statement.",
    whyThisMatters:
      "For recruitment, the practical question is whether the candidate knows how their profile will be stored, used and shared — not just whether you have a privacy policy.",
    type: "single",
    cap: 10,
    bucket: "candidate_sourcing",
    layer: "control",
    options: [
      { id: "clear_notice", label: "We provide a clear notice or consent statement before storing/sharing profiles", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "inconsistent_notice", label: "We mention it in forms, emails or job posts, but not consistently", riskPoints: 4 },
      { id: "verbal_whatsapp", label: "We usually explain verbally or over WhatsApp/call", riskPoints: 7 },
      { id: "no_documented_notice", label: "We store/share profiles without a documented notice or consent process", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q6 Client sharing ─────────────────────────────────────────────────
  {
    id: "q6",
    badge: "Client Sharing Risk",
    question: "How do you share candidate profiles with clients?",
    helpText: "Select all methods used to share CVs, trackers, shortlists or candidate documents with client HR teams and hiring managers.",
    whyThisMatters:
      "Recruitment risk often peaks when candidate CVs are forwarded, reshared or stored by clients without visibility or control.",
    type: "multi",
    cap: 14,
    bucket: "client_sharing",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "ats_portal", label: "Through ATS/client portal with controlled access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "email_attachments", label: "Email attachments to HR or hiring managers", riskPoints: 4 },
      { id: "whatsapp", label: "WhatsApp messages or groups", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "shared_cloud", label: "Shared Google Drive / OneDrive / Dropbox folders", riskPoints: 5 },
      { id: "excel_trackers", label: "Excel trackers with candidate details", riskPoints: 5 },
      { id: "bulk_cv_folders", label: "Bulk CV folders shared with multiple client users", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "client_ats_access", label: "Client gets access to our ATS or candidate database", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "shortlisted_after_confirmation", label: "Only shortlisted profiles are shared after candidate confirmation", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "multiple_client_preference", label: "Multiple sharing methods depending on client preference", riskPoints: 7 },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q7 Recruiter access ───────────────────────────────────────────────
  {
    id: "q7",
    badge: "Recruiter Access Risk",
    question: "Who can access candidate records inside your agency?",
    helpText: "This includes recruiters, team leads, freelancers, interns, external recruiters and ex-staff.",
    whyThisMatters:
      "Recruitment databases often become long-lived candidate repositories. Access control is one of the most important practical safeguards.",
    type: "single",
    cap: 12,
    bucket: "ats_tool_access",
    layer: "control",
    options: [
      { id: "role_based_reviewed", label: "Access is role-based, need-based and reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "informal_review", label: "Current recruiters have access, but access review is informal", riskPoints: 4 },
      { id: "most_recruiters", label: "Most recruiters can access most candidate records", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "freelancers_interns", label: "Freelancers, interns or external recruiters can access candidate trackers/folders", riskPoints: 9, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_access", label: "Ex-recruiter or ex-staff access may not always be removed immediately", riskPoints: 12, badge: "CRITICAL", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 10 },
    ],
  },

  // ─── Q8 Tools / storage ────────────────────────────────────────────────
  {
    id: "q8",
    badge: "ATS, Tool & Storage Risk",
    question: "Which tools or locations store candidate data?",
    helpText: "Select all systems, folders, chats, devices or platforms where candidate data is stored or processed.",
    whyThisMatters:
      "Candidate data becomes hard to govern when scattered across ATS, Excel, WhatsApp, email, job portals and recruiter devices.",
    type: "multi",
    cap: 12,
    bucket: "ats_tool_access",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "ats_crm", label: "ATS or recruitment CRM with role-based access", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "excel_sheets", label: "Excel / Google Sheets candidate trackers", riskPoints: 5 },
      { id: "shared_cloud", label: "Google Drive / OneDrive / Dropbox folders", riskPoints: 5 },
      { id: "email_inboxes", label: "Email inboxes", riskPoints: 5 },
      { id: "whatsapp", label: "WhatsApp chats or groups", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "recruiter_devices", label: "Recruiter laptops or desktops", riskPoints: 6 },
      { id: "job_portal_dashboards", label: "Job portal dashboards", riskPoints: 2 },
      { id: "bgv_vendor", label: "BGV vendor platforms", riskPoints: 4 },
      { id: "ai_tools", label: "AI screening, CV parsing or ranking tools", riskPoints: 5, badge: "AI", badgeColor: "amber" },
      { id: "external_drives", label: "External hard drives / pen drives", riskPoints: 7, badge: "RISK", badgeColor: "red" },
      { id: "multiple_no_sot", label: "Multiple places, no single source of truth", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q9 Retention ──────────────────────────────────────────────────────
  {
    id: "q9",
    badge: "Rejected Candidate Retention",
    question: "How long do you retain rejected or inactive candidate profiles?",
    helpText: "This includes old CVs, phone numbers, salary details, interview notes, documents and future hiring databases.",
    whyThisMatters:
      "Rejected profiles often become the biggest hidden database in recruitment firms. Retention without purpose, review or deletion creates avoidable exposure.",
    type: "single",
    cap: 10,
    bucket: "retention_rights",
    layer: "control",
    options: [
      { id: "documented_retention", label: "We have a documented retention schedule and deletion/archive process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We retain for a defined period, but it is not formally documented", riskPoints: 3 },
      { id: "many_years_future_roles", label: "We retain profiles for future openings for many years", riskPoints: 7 },
      { id: "indefinitely", label: "We keep most candidate profiles indefinitely / forever", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Candidate rights ──────────────────────────────────────────────
  {
    id: "q10",
    badge: "Candidate Rights Handling",
    question: "Can candidates request correction, deletion or withdrawal from your database?",
    helpText: "This checks whether candidates have a practical way to update, remove or withdraw their profile from future hiring use.",
    whyThisMatters:
      "Data-principal rights apply to candidate data: correction, deletion, opt-out or withdrawal from the candidate database.",
    type: "single",
    cap: 8,
    bucket: "retention_rights",
    layer: "control",
    options: [
      { id: "defined_process", label: "Yes, we have a defined process to handle correction, deletion or withdrawal requests", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "case_by_case", label: "Recruiters handle such requests case-by-case", riskPoints: 3 },
      { id: "update_not_delete", label: "We update records if candidates ask, but deletion is not systematic", riskPoints: 5 },
      { id: "no_standard_process", label: "We do not have a standard process", riskPoints: 8, badge: "RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },
];

// ── Override + flag helpers ──────────────────────────────────────────────────

const has = (a: IAAnswers, qid: string, optId: string) =>
  selectedIds(a[qid]).includes(optId);
const anyOf = (a: IAAnswers, qid: string, optIds: string[]) =>
  selectedIds(a[qid]).some((id) => optIds.includes(id));

// ── Overrides (raise-only) ────────────────────────────────────────────────────

const OVERRIDES: IAOverride[] = [
  {
    id: "scraped_sourcing",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q2", "scraped_profiles"),
    flag: "Public-search or scraped candidate profiles can create high DPDPA exposure if candidates aren't clearly informed.",
  },
  {
    id: "scraped_no_notice",
    minBand: "Critical Risk",
    severity: 10,
    test: (a) => has(a, "q2", "scraped_profiles") && has(a, "q5", "no_documented_notice"),
    flag: "Scraped/public profiles are stored and shared with no documented candidate notice or consent.",
  },
  {
    id: "high_impact_early",
    minBand: "High Risk",
    severity: 9,
    test: (a) =>
      anyOf(a, "q3", HIGH_IMPACT_DOCS) &&
      anyOf(a, "q4", ["initial_registration", "whenever_shared"]),
    flag: "PAN/Aadhaar, salary slips, bank details or BGV documents may be collected earlier than necessary.",
  },
  {
    id: "bulk_client_sharing",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q6", ["bulk_cv_folders", "client_ats_access"]),
    flag: "Bulk CV folders or client access to your candidate database create serious onward-sharing exposure.",
  },
  {
    id: "informal_sharing_no_notice",
    minBand: "High Risk",
    severity: 8,
    test: (a) =>
      anyOf(a, "q6", ["whatsapp", "email_attachments"]) &&
      has(a, "q5", "no_documented_notice"),
    flag: "Candidate CVs are shared via WhatsApp/email without a documented notice or consent process.",
  },
  {
    id: "ex_recruiter_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q7", "ex_staff_access"),
    flag: "Ex-recruiter or ex-staff access to candidate records may not be revoked promptly — a serious control gap.",
  },
  {
    id: "retain_forever",
    minBand: "Moderate Risk",
    severity: 5,
    test: (a) => has(a, "q9", "indefinitely"),
    flag: "Candidate profiles are kept indefinitely with no retention or deletion policy.",
  },
  {
    id: "retain_forever_no_rights",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q9", "indefinitely") && has(a, "q10", "no_standard_process"),
    flag: "Candidates are retained forever with no way to correct, delete or withdraw their profile.",
  },
  {
    id: "sensitive_scattered",
    minBand: "High Risk",
    severity: 7,
    test: (a) =>
      anyOf(a, "q3", ["salary_bank_docs", "bgv_docs", "sensitive_category"]) &&
      anyOf(a, "q8", SCATTERED_STORAGE),
    flag: "Salary, BGV or sensitive candidate data is stored across WhatsApp, laptops, drives or scattered locations.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "multi_source",
    severity: 7,
    test: (a) => has(a, "q2", "multiple_no_sot"),
    flag: "Candidate profiles are collected from multiple channels without a single source of truth or consistent notice.",
  },
  {
    id: "reused_db",
    severity: 6,
    test: (a) => has(a, "q2", "previous_database"),
    flag: "Old candidate databases are reused for new mandates without clear consent, notice or opt-out visibility.",
  },
  {
    id: "doc_breadth",
    severity: 6,
    test: (a) => anyOf(a, "q3", ["id_proof", "salary_bank_docs", "bgv_docs", "sensitive_category"]),
    flag: "Salary, identity and background-verification documents may be stored without clear purpose, retention and access controls.",
  },
  {
    id: "informal_sharing",
    severity: 6,
    test: (a) => anyOf(a, "q6", ["email_attachments", "whatsapp", "shared_cloud", "excel_trackers"]),
    flag: "Candidate CVs may be shared with clients through email, WhatsApp, shared folders or Excel trackers without enough control.",
  },
  {
    id: "scattered_storage",
    severity: 6,
    test: (a) => anyOf(a, "q8", ["multiple_no_sot", "recruiter_devices", "whatsapp", "external_drives"]),
    flag: "Candidate data may be scattered across ATS, Excel sheets, email inboxes, WhatsApp chats and recruiter laptops.",
  },
  {
    id: "ai_tools",
    severity: 5,
    test: (a) => has(a, "q8", "ai_tools"),
    flag: "AI screening or CV-parsing tools may process candidate data without a clear governance or disclosure process.",
  },
  {
    id: "ex_or_freelancer_access",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["freelancers_interns", "most_recruiters"]),
    flag: "Freelancers, interns, external recruiters or most staff may access candidate trackers or folders.",
  },
  {
    id: "retention_no_rights",
    severity: 5,
    test: (a) => anyOf(a, "q9", ["many_years_future_roles", "indefinitely"]),
    flag: "Rejected or inactive candidate profiles may be retained for years without a documented retention policy.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical).
const FIVE_CONTROLS = [
  "Standardise candidate sourcing and consent/notice language — candidates should know how their profile is stored, used, shared and retained.",
  "Reduce early collection of PAN, Aadhaar, salary slips, bank details and BGV files — collect only when needed.",
  "Control CV sharing with clients — avoid bulk folders and uncontrolled WhatsApp/email forwarding; share only relevant shortlisted profiles through controlled channels.",
  "Review ATS, Google Drive, Excel, WhatsApp and recruiter-laptop access — restrict it and remove ex-recruiter/freelancer access.",
  "Define retention and deletion rules for rejected candidate profiles, with a way for candidates to correct, delete or withdraw.",
];

const BUCKET_RECS: Record<string, string> = {
  candidate_document:
    "Reduce early collection of high-impact candidate documents. Collect PAN, Aadhaar, salary slips, bank details and BGV files only when needed, and apply stronger access and retention controls.",
  client_sharing:
    "Control CV sharing with clients. Move away from bulk folders and uncontrolled WhatsApp/email forwarding. Share only relevant shortlisted profiles through controlled channels with clear client-side handling expectations.",
  candidate_sourcing:
    "Standardise candidate sourcing and notice. Define approved sourcing channels, avoid unmanaged scraping, and make sure candidates understand how their profiles will be stored, used, shared and retained.",
  ats_tool_access:
    "Create a candidate-data system map across ATS, Excel, Google Drive, email, WhatsApp, laptops and job portals, then restrict access and remove ex-staff access.",
  retention_rights:
    "Define a rejected-candidate retention and deletion process. Candidates should have a clear way to correct, delete or withdraw their profile from your database.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "candidate_document",
    "client_sharing",
    "candidate_sourcing",
    "ats_tool_access",
    "retention_rights",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, set an annual sourcing, access and retention review, and keep evidence of how candidate data is handled."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) ───────────────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your recruitment agency appears to have basic candidate-data controls in place. Your next step is to document your candidate sourcing, CV sharing, ATS access, retention and candidate-request processes so they remain consistent across recruiters and clients.",
  "Moderate Risk":
    "Your recruitment agency has some candidate-data controls, but several practices may be informal. Focus first on standardising candidate notice, reducing uncontrolled CV sharing, reviewing ATS/folder access, and defining rejected-candidate retention rules.",
  "High Risk":
    "Your recruitment agency may have significant DPDPA exposure across candidate sourcing, CV sharing, identity documents, ATS access, client sharing or rejected-candidate retention. Your first priority is to control how candidate profiles are collected, shared with clients, stored by recruiters and deleted when no longer needed.",
  "Critical Risk":
    "Your recruitment agency may have serious DPDPA exposure. This usually happens when CVs, PAN/Aadhaar, salary slips, BGV records, WhatsApp sharing, client folders, recruiter laptops and old candidate databases are managed informally — without notice, access control, retention or candidate-request processes.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const recruitmentAgenciesPack: IndustryPack = {
  industry: "recruitment-agencies",
  route: "/assessment/recruitment",
  reportType: "recruit", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "Recruitment Agency DPDPA Risk Scan",
    hero: "Your recruitment agency does not just forward CVs. It moves candidate data across clients, tools and teams.",
    sub: "From job portals, LinkedIn, WhatsApp and email to ATS tools, Excel trackers, client hiring managers, background-verification vendors and old candidate databases — recruitment agencies handle personal data at every step. This 3-minute scan shows where DPDPA exposure may arise.",
    cta: "Start Recruitment Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "CVs",
      "Candidate Consent",
      "Job Portals",
      "LinkedIn",
      "ATS",
      "WhatsApp",
      "Client Sharing",
      "BGV",
      "Salary Slips",
      "Rejected Profiles",
      "AI Screening",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "Recruitment Agency DPDPA Starter Checklist",
    href: "/templates/recruitment-agency-dpdpa-starter-checklist.pdf",
  },
};

export default recruitmentAgenciesPack;

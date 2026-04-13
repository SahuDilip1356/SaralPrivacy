// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — DPDPA General Readiness Assessment
// Scoring engine, action engine, question config
// Pure TypeScript — zero React imports
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  text: string;
  badge?: string;       // e.g. "HIGH FREQUENCY", "CRITICAL CLASSIFICATION"
  badgeColor?: string;  // "red" | "amber" | "green"
}

export interface QuestionDef {
  id: string;
  key: keyof DPDPAAnswers;
  text: string;
  subtext?: string;
  helpText?: string;
  type: "single" | "multi";
  options: QuestionOption[];
  mutuallyExclusive?: string[]; // option ids that are mutually exclusive with all others
  isOptional?: boolean;
}

export interface DPDPAAnswers {
  q1_sector?: string;
  q2_footprint?: string;
  q3_digital_data?: string;
  q4_data_types?: string[];
  q5_storage?: string[];
  q6_controls?: string[];
  q7_rights?: string;
  q8_consent?: string;
  q9_ownership?: string;
  q10_readiness?: string;
  q11_blocker?: string;
  q12_resource?: string;
}

export interface PerQuestionScores {
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
}

export interface CategoryScores {
  noticeConsent: number;
  accessControl: number;
  retentionDeletion: number;
  ownershipGovernance: number;
  vendorPartnerRisk: number;
  incidentReadiness: number;
}

export interface ActionCTA {
  label: string;
  href: string;
}

export interface DPDPAScoreResult {
  perQ: PerQuestionScores;
  rawScore: number;
  redFlagsTriggered: string[];
  penaltyTotal: number;
  finalScore: number;
  verdictBand: string;
  verdictColor: string;
  verdictDescription: string;
  // 3 sub-scores (shown on score preview)
  dataExposure: number;
  controlMaturity: number;
  operationalReadiness: number;
  // 6 category bars (shown on report screen)
  categoryScores: CategoryScores;
  // Actions
  immediateActions: string[];   // max 3
  thirtyDayActions: string[];   // max 3
  resourceCTA: ActionCTA;
  blockerNote?: string;
  // Flags
  skippedQ4Q5: boolean;
  hasSensitiveData: boolean;
}

// ── Verdict Bands ─────────────────────────────────────────────────────────────

export interface VerdictBand {
  min: number;
  max: number;
  label: string;
  color: string;      // hex
  tailwind: string;   // tailwind bg class
  textClass: string;  // tailwind text class
  description: string;
}

export const VERDICT_BANDS: VerdictBand[] = [
  {
    min: 0, max: 24,
    label: "Not Started",
    color: "#EF4444",
    tailwind: "bg-red-500",
    textClass: "text-red-600",
    description: "Your business shows high exposure or very weak controls. Immediate action is needed on the fundamentals before your risk compounds.",
  },
  {
    min: 25, max: 44,
    label: "Early Stage",
    color: "#F97316",
    tailwind: "bg-orange-500",
    textClass: "text-orange-600",
    description: "You have some awareness of DPDPA obligations but important gaps remain. A focused 30-day effort will close most of the critical gaps.",
  },
  {
    min: 45, max: 64,
    label: "Building Foundations",
    color: "#EAB308",
    tailwind: "bg-yellow-500",
    textClass: "text-yellow-600",
    description: "Basic elements exist but are not applied consistently across your business. Focus on ownership, consent, and operational readiness.",
  },
  {
    min: 65, max: 79,
    label: "Progressing Well",
    color: "#86EFAC",
    tailwind: "bg-green-300",
    textClass: "text-green-700",
    description: "Good momentum and some operational maturity. Tighten documentation, vendor controls, and test your incident response.",
  },
  {
    min: 80, max: 100,
    label: "Operationally Strong",
    color: "#22C55E",
    tailwind: "bg-green-500",
    textClass: "text-green-700",
    description: "Strong readiness signals across most areas. This is not a legal certification, but your controls are well above average for Indian MSMEs.",
  },
];

// ── Question Definitions ──────────────────────────────────────────────────────

export const QUESTIONS: QuestionDef[] = [
  // ─── Q1 Sector ──────────────────────────────────────────────────────────
  {
    id: "q1",
    key: "q1_sector",
    text: "Which sector best describes your business?",
    helpText: "This helps us understand your regulatory context and compliance complexity.",
    type: "single",
    options: [
      { id: "manufacturing",        text: "Manufacturing" },
      { id: "trading",              text: "Trading / Distribution" },
      { id: "professional-services",text: "Professional Services" },
      { id: "it-saas",              text: "IT / SaaS / Digital" },
      { id: "ecommerce",            text: "E-commerce / D2C / Retail" },
      { id: "healthcare",           text: "Healthcare / Pharma",   badge: "Higher regulation", badgeColor: "amber" },
      { id: "financial-services",   text: "Financial Services",    badge: "Higher regulation", badgeColor: "amber" },
      { id: "other",                text: "Other" },
    ],
  },

  // ─── Q2 Footprint ───────────────────────────────────────────────────────
  {
    id: "q2",
    key: "q2_footprint",
    text: "Where do you mainly operate?",
    helpText: "More operating spread means more data movement and compliance complexity.",
    type: "single",
    options: [
      { id: "one-city",     text: "One city" },
      { id: "one-state",    text: "One state" },
      { id: "multi-state",  text: "Multiple states" },
      { id: "pan-india",    text: "Pan-India" },
      { id: "india-plus",   text: "India + overseas", badge: "Higher complexity", badgeColor: "amber" },
    ],
  },

  // ─── Q3 Digital Data ────────────────────────────────────────────────────
  {
    id: "q3",
    key: "q3_digital_data",
    text: "Does your business collect or store personal data digitally?",
    helpText: "Examples: customer contacts, employee records, lead forms, WhatsApp data, website forms, KYC records, HR/payroll information.",
    type: "single",
    options: [
      { id: "yes-regularly", text: "Yes, regularly",   badge: "HIGH FREQUENCY",  badgeColor: "red"   },
      { id: "yes-sometimes", text: "Yes, sometimes",   badge: "MODERATE",        badgeColor: "amber" },
      { id: "very-little",   text: "Very little",      badge: "LOW FREQUENCY",   badgeColor: "green" },
      { id: "no",            text: "No",               badge: "EXPOSURE AUDIT",  badgeColor: "green" },
      { id: "not-sure",      text: "Not sure",         badge: "NEEDS REVIEW",    badgeColor: "amber" },
    ],
  },

  // ─── Q4 Data Types ──────────────────────────────────────────────────────
  {
    id: "q4",
    key: "q4_data_types",
    text: "Which personal data does your business handle?",
    subtext: "Select all that apply.",
    type: "multi",
    mutuallyExclusive: ["not-sure"],
    options: [
      { id: "customer-data",  text: "Customer data" },
      { id: "employee-data",  text: "Employee data" },
      { id: "vendor-data",    text: "Vendor / Partner data" },
      { id: "leads-data",     text: "Leads / Website visitor data" },
      { id: "financial-kyc",  text: "Financial / KYC documents",     badge: "CRITICAL CLASSIFICATION", badgeColor: "red" },
      { id: "cctv-biometric", text: "CCTV / Biometric data",         badge: "CRITICAL CLASSIFICATION", badgeColor: "red" },
      { id: "health-children",text: "Health-related or Children's data", badge: "CRITICAL CLASSIFICATION", badgeColor: "red" },
      { id: "not-sure",       text: "Not sure" },
    ],
  },

  // ─── Q5 Storage ─────────────────────────────────────────────────────────
  {
    id: "q5",
    key: "q5_storage",
    text: "Where is this data mainly stored or processed today?",
    subtext: "Select all that apply.",
    type: "multi",
    mutuallyExclusive: ["not-sure"],
    options: [
      { id: "whatsapp-email", text: "WhatsApp / Email",           badge: "HIGH RISK", badgeColor: "red"   },
      { id: "excel-sheets",   text: "Excel / Google Sheets",      badge: "HIGH RISK", badgeColor: "red"   },
      { id: "shared-drives",  text: "Shared drives / Cloud storage" },
      { id: "website-forms",  text: "Website / App forms" },
      { id: "erp-crm",        text: "ERP / CRM / HRMS" },
      { id: "accounting",     text: "Accounting / Payroll tools" },
      { id: "saas-tools",     text: "Third-party SaaS tools" },
      { id: "paper-digitised",text: "Paper records later digitised", badge: "HIGH RISK", badgeColor: "red" },
      { id: "not-sure",       text: "Not sure" },
    ],
  },

  // ─── Q6 Controls ────────────────────────────────────────────────────────
  {
    id: "q6",
    key: "q6_controls",
    text: "Which of these are already in place in your business?",
    subtext: "Select all that apply.",
    type: "multi",
    mutuallyExclusive: ["none", "not-sure"],
    options: [
      { id: "privacy-notice",   text: "Privacy notice on website or forms" },
      { id: "consent-capture",  text: "Consent capture" },
      { id: "access-controls",  text: "Access controls / role-based access" },
      { id: "retention",        text: "Data retention / deletion practice" },
      { id: "vendor-clauses",   text: "Vendor / processor clauses" },
      { id: "incident-response",text: "Incident / breach response process" },
      { id: "privacy-owner",    text: "One person owns privacy / compliance" },
      { id: "data-inventory",   text: "Data inventory / mapping" },
      { id: "none",             text: "None of these" },
      { id: "not-sure",         text: "Not sure" },
    ],
  },

  // ─── Q7 Rights Handling ─────────────────────────────────────────────────
  {
    id: "q7",
    key: "q7_rights",
    text: "How well can your business handle data rights requests today?",
    helpText: "If someone asks to access, correct, or delete their personal data.",
    type: "single",
    options: [
      { id: "no-process",      text: "Not handled",                          badge: "LEVEL 1", badgeColor: "red"   },
      { id: "manual",          text: "Handled manually if asked",             badge: "LEVEL 1", badgeColor: "amber" },
      { id: "partial",         text: "Partially defined",                     badge: "LEVEL 2", badgeColor: "amber" },
      { id: "defined",         text: "Documented & operational",              badge: "LEVEL 2", badgeColor: "green" },
      { id: "operational",     text: "Documented and operational process",    badge: "LEVEL 3", badgeColor: "green" },
    ],
  },

  // ─── Q8 Consent Quality ─────────────────────────────────────────────────
  {
    id: "q8",
    key: "q8_consent",
    text: "How does your business ask for permission before collecting personal data?",
    type: "single",
    options: [
      { id: "no-ask",     text: "We usually do not ask formally",                          badge: "LEVEL 1", badgeColor: "red"   },
      { id: "implied",    text: "We rely on implied or verbal understanding",              badge: "LEVEL 1", badgeColor: "amber" },
      { id: "generic",    text: "We use generic wording or broad terms",                   badge: "LEVEL 2", badgeColor: "amber" },
      { id: "inconsistent",text: "We ask in some places, but not consistently",           badge: "LEVEL 2", badgeColor: "amber" },
      { id: "clear",      text: "Clear, specific consent with records where needed",       badge: "LEVEL 3", badgeColor: "green" },
    ],
  },

  // ─── Q9 Ownership ───────────────────────────────────────────────────────
  {
    id: "q9",
    key: "q9_ownership",
    text: "Who is primarily responsible for privacy or data protection in your business today?",
    type: "single",
    options: [
      { id: "no-owner",    text: "No clear owner" },
      { id: "founder",     text: "Founder or business head" },
      { id: "ops-admin",   text: "Operations or admin" },
      { id: "legal-hr",    text: "Legal or compliance" },
      { id: "shared-team", text: "Shared across teams" },
    ],
  },

  // ─── Q10 Readiness ──────────────────────────────────────────────────────
  {
    id: "q10",
    key: "q10_readiness",
    text: "Which statement best describes your current DPDPA readiness?",
    helpText: "Your self-assessment helps us compare perceived readiness with actual controls.",
    type: "single",
    options: [
      { id: "not-started",   text: "Not started" },
      { id: "aware",         text: "Early awareness" },
      { id: "first-actions", text: "First actions underway" },
      { id: "basic-structure",text: "Basic structure in place" },
      { id: "mostly-prepared",text: "Mostly prepared" },
    ],
  },

  // ─── Q11 Blocker (optional) ─────────────────────────────────────────────
  {
    id: "q11",
    key: "q11_blocker",
    text: "What is your biggest blocker right now?",
    isOptional: true,
    type: "single",
    options: [
      { id: "not-clear",     text: "Not clear what applies to us" },
      { id: "no-time",       text: "No time" },
      { id: "no-budget",     text: "No budget" },
      { id: "no-owner",      text: "No internal owner" },
      { id: "manual-process",text: "Too many manual processes" },
      { id: "team-awareness",text: "Team awareness is low" },
      { id: "vendor-risk",   text: "Vendor / third-party risk" },
      { id: "need-help",     text: "Need legal or implementation help" },
    ],
  },

  // ─── Q12 Resource (optional) ────────────────────────────────────────────
  {
    id: "q12",
    key: "q12_resource",
    text: "What would help you most right now?",
    isOptional: true,
    type: "single",
    options: [
      { id: "checklist",       text: "Simple readiness checklist",    badge: "Most popular", badgeColor: "green" },
      { id: "notice-template", text: "Privacy notice template" },
      { id: "consent-template",text: "Consent wording template" },
      { id: "vendor-checklist",text: "Vendor assessment checklist" },
      { id: "awareness-kit",   text: "Employee awareness material" },
      { id: "consultation",    text: "Expert consultation" },
    ],
  },
];

// ── Sensitive Data Constants ──────────────────────────────────────────────────

const SENSITIVE_DATA_IDS = ["financial-kyc", "cctv-biometric", "health-children"];
const INFORMAL_STORAGE_IDS = ["whatsapp-email", "excel-sheets", "shared-drives", "paper-digitised"];

// ── Per-Question Scoring Functions ────────────────────────────────────────────

function scoreQ1(answer: string): number {
  const map: Record<string, number> = {
    "manufacturing": 5, "trading": 5, "professional-services": 5,
    "it-saas": 4, "ecommerce": 4, "other": 4,
    "healthcare": 2, "financial-services": 2,
  };
  return map[answer] ?? 0;
}

function scoreQ2(answer: string): number {
  const map: Record<string, number> = {
    "one-city": 5, "one-state": 4, "multi-state": 3, "pan-india": 2, "india-plus": 1,
  };
  return map[answer] ?? 0;
}

function scoreQ3(answer: string): number {
  const map: Record<string, number> = {
    "no": 8, "very-little": 6, "yes-sometimes": 4, "not-sure": 3, "yes-regularly": 2,
  };
  return map[answer] ?? 0;
}

function scoreQ4(answers: string[]): number {
  if (!answers || answers.length === 0) return 14;
  const deductions: Record<string, number> = {
    "customer-data": 1, "employee-data": 2, "vendor-data": 1, "leads-data": 1,
    "financial-kyc": 4, "cctv-biometric": 4, "health-children": 5, "not-sure": 4,
  };
  const total = answers.reduce((sum, a) => sum + (deductions[a] ?? 0), 0);
  return Math.max(0, 14 - total);
}

function scoreQ5(answers: string[]): number {
  if (!answers || answers.length === 0) return 12;
  const deductions: Record<string, number> = {
    "whatsapp-email": 3, "excel-sheets": 2, "shared-drives": 1, "website-forms": 1,
    "erp-crm": 0, "accounting": 1, "saas-tools": 1, "paper-digitised": 3, "not-sure": 3,
  };
  const total = answers.reduce((sum, a) => sum + (deductions[a] ?? 0), 0);
  return Math.max(0, 12 - total);
}

function scoreQ6(answers: string[]): number {
  if (!answers || answers.length === 0) return 0;
  if (answers.includes("none") || answers.includes("not-sure")) return 0;
  const points: Record<string, number> = {
    "privacy-notice": 2, "consent-capture": 3, "access-controls": 3, "retention": 3,
    "vendor-clauses": 2, "incident-response": 2, "privacy-owner": 2, "data-inventory": 1,
  };
  const total = answers.reduce((sum, a) => sum + (points[a] ?? 0), 0);
  return Math.min(18, total);
}

function scoreQ7(answer: string): number {
  const map: Record<string, number> = {
    "no-process": 0, "manual": 3, "partial": 5, "defined": 7, "operational": 10,
  };
  return map[answer] ?? 0;
}

function scoreQ8(answer: string): number {
  const map: Record<string, number> = {
    "no-ask": 0, "implied": 2, "generic": 4, "inconsistent": 7, "clear": 10,
  };
  return map[answer] ?? 0;
}

function scoreQ9(answer: string): number {
  const map: Record<string, number> = {
    "no-owner": 0, "founder": 3, "ops-admin": 4, "legal-hr": 4, "shared-team": 8,
  };
  return map[answer] ?? 0;
}

function scoreQ10(answer: string): number {
  const map: Record<string, number> = {
    "not-started": 0, "aware": 2, "first-actions": 4, "basic-structure": 6, "mostly-prepared": 9,
  };
  return map[answer] ?? 0;
}

// ── Red-Flag Penalty Engine ───────────────────────────────────────────────────

interface RedFlagResult {
  flags: string[];
  total: number;
}

function applyRedFlagPenalties(
  answers: DPDPAAnswers,
  q: PerQuestionScores,
): RedFlagResult {
  const flags: string[] = [];
  let total = 0;

  const hasSensitive = (answers.q4_data_types || []).some(d => SENSITIVE_DATA_IDS.includes(d));
  const informalCount = (answers.q5_storage || []).filter(s => INFORMAL_STORAGE_IDS.includes(s)).length;
  const q6 = answers.q6_controls || [];

  // RF1: sensitive data + no rights process
  if (hasSensitive && q.q7 === 0) {
    flags.push("Sensitive data handled with no rights process");
    total += 10;
  }

  // RF2: sensitive data + weak consent
  if (hasSensitive && (q.q8 === 0 || q.q8 === 2)) {
    flags.push("Sensitive data collected without adequate consent");
    total += 10;
  }

  // RF3: sensitive data + no owner
  if (hasSensitive && q.q9 === 0) {
    flags.push("Sensitive data handled with no accountable owner");
    total += 8;
  }

  // RF4: 3+ informal storage channels
  if (informalCount >= 3) {
    flags.push("Personal data spread across 3+ informal storage channels");
    total += 6;
  }

  // RF5: no controls at all
  if (q6.includes("none")) {
    flags.push("No privacy controls currently in place");
    total += 12;
  }

  // RF6: repeated uncertainty across critical questions
  const uncertaintyCount = [
    answers.q3_digital_data === "not-sure",
    (answers.q4_data_types || []).includes("not-sure"),
    (answers.q5_storage || []).includes("not-sure"),
    (answers.q6_controls || []).includes("not-sure"),
  ].filter(Boolean).length;
  if (uncertaintyCount >= 2) {
    flags.push("Limited visibility into data practices across multiple areas");
    total += 6;
  }

  // RF7: no rights process + missing retention and inventory
  if (q.q7 === 0 && !q6.includes("retention") && !q6.includes("data-inventory")) {
    flags.push("No rights process and no retention or data inventory controls");
    total += 5;
  }

  // RF8: no consent asking + missing consent capture and privacy notice
  if (q.q8 === 0 && !q6.includes("consent-capture") && !q6.includes("privacy-notice")) {
    flags.push("No consent practice and no consent capture or privacy notice in place");
    total += 5;
  }

  return { flags, total };
}

// ── Sub-Score Derivation ──────────────────────────────────────────────────────

function deriveDataExposure(q3: number, q4: number, q5: number): number {
  return Math.round(((q3 + q4 + q5) / 34) * 100);
}

function deriveControlMaturity(q6: number, q9: number): number {
  return Math.round(((q6 + q9) / 26) * 100);
}

function deriveOperationalReadiness(q7: number, q8: number, q10: number): number {
  return Math.round(((q7 + q8 + q10) / 29) * 100);
}

function deriveCategoryScores(q: PerQuestionScores, q6: string[]): CategoryScores {
  const noticeScore   = (q6.includes("privacy-notice") ? 2 : 0) + (q6.includes("consent-capture") ? 3 : 0);
  const accessScore   = q6.includes("access-controls") ? 3 : 0;
  const retentionScore= q6.includes("retention") ? 3 : 0;
  const vendorScore   = q6.includes("vendor-clauses") ? 2 : 0;
  const incidentScore = (q6.includes("incident-response") ? 2 : 0) + q.q7;

  return {
    noticeConsent:       Math.round((noticeScore / 5)  * 100),
    accessControl:       Math.round((accessScore  / 3)  * 100),
    retentionDeletion:   Math.round((retentionScore / 3)* 100),
    ownershipGovernance: Math.round((q.q9 / 8)         * 100),
    vendorPartnerRisk:   Math.round((vendorScore / 2)   * 100),
    incidentReadiness:   Math.round((incidentScore / 12)* 100),
  };
}

// ── Verdict Band Lookup ───────────────────────────────────────────────────────

export function getVerdictBand(score: number): VerdictBand {
  return VERDICT_BANDS.find(b => score >= b.min && score <= b.max) ?? VERDICT_BANDS[0];
}

// ── Action Engine ─────────────────────────────────────────────────────────────

const IMMEDIATE_ACTION_POOL: Array<{ condition: (a: DPDPAAnswers, q: PerQuestionScores, flags: string[]) => boolean; text: string; weight: number }> = [
  {
    weight: 10,
    condition: (a, q) => q.q9 === 0,
    text: "Appoint one accountable person to own privacy and data protection in your business.",
  },
  {
    weight: 9,
    condition: (a, q) => q.q8 === 0,
    text: "Standardize consent wording at every point where personal data is collected.",
  },
  {
    weight: 9,
    condition: (a, q) => q.q7 === 0,
    text: "Create a basic process for access, correction, and deletion requests.",
  },
  {
    weight: 8,
    condition: (a) => (a.q6_controls || []).includes("none"),
    text: "Launch a minimum viable privacy programme: appoint owner, map data, add consent, post notice, define deletion rules.",
  },
  {
    weight: 7,
    condition: (a) => !(a.q6_controls || []).includes("data-inventory"),
    text: "Create a simple inventory of all personal data, systems, and users who have access.",
  },
  {
    weight: 6,
    condition: (a) => !(a.q6_controls || []).includes("access-controls"),
    text: "Limit access to personal data by role and job need — not everyone needs to see everything.",
  },
  {
    weight: 6,
    condition: (a) => !(a.q6_controls || []).includes("incident-response"),
    text: "Create a basic incident escalation and response playbook before a breach happens.",
  },
  {
    weight: 5,
    condition: (_, __, flags) => flags.some(f => f.includes("informal storage")),
    text: "Reduce personal data on WhatsApp, email, and spreadsheets — centralise into controlled systems.",
  },
  {
    weight: 5,
    condition: (_, __, flags) => flags.some(f => f.includes("visibility")),
    text: "Run a 1-week internal discovery to understand what data is collected, where it sits, and who has access.",
  },
];

const THIRTY_DAY_ACTION_POOL: Array<{ condition: (a: DPDPAAnswers, q: PerQuestionScores) => boolean; text: string; weight: number }> = [
  {
    weight: 9,
    condition: (a) => !(a.q6_controls || []).includes("privacy-notice"),
    text: "Publish or update privacy notices on your website and all data collection forms.",
  },
  {
    weight: 8,
    condition: (a) => !(a.q6_controls || []).includes("consent-capture"),
    text: "Add explicit consent capture to relevant forms and workflows.",
  },
  {
    weight: 8,
    condition: (a) => !(a.q6_controls || []).includes("retention"),
    text: "Define how long each data category is kept and when it is deleted.",
  },
  {
    weight: 7,
    condition: (a) => !(a.q6_controls || []).includes("vendor-clauses"),
    text: "Add data processing clauses to vendor and processor agreements.",
  },
  {
    weight: 6,
    condition: (_, q) => q.q8 >= 4 && q.q8 < 7,
    text: "Tighten and standardize consent language across all channels — inconsistency creates risk.",
  },
  {
    weight: 6,
    condition: (_, q) => q.q7 === 3,
    text: "Map which systems support rights requests and define a documented workflow.",
  },
  {
    weight: 5,
    condition: (_, q) => q.q9 >= 3 && q.q9 < 8,
    text: "Formalize privacy responsibility with a written role definition and accountability charter.",
  },
  {
    weight: 4,
    condition: (_, q) => q.q6 >= 5 && q.q6 <= 10,
    text: "Fill remaining control gaps by prioritising retention, vendor clauses, and breach readiness.",
  },
];

function getImmediateActions(answers: DPDPAAnswers, q: PerQuestionScores, flags: string[]): string[] {
  return IMMEDIATE_ACTION_POOL
    .filter(a => a.condition(answers, q, flags))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(a => a.text);
}

function get30DayActions(answers: DPDPAAnswers, q: PerQuestionScores): string[] {
  return THIRTY_DAY_ACTION_POOL
    .filter(a => a.condition(answers, q))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(a => a.text);
}

// ── Resource + Blocker CTAs ───────────────────────────────────────────────────

export function getResourceCTA(q12: string | undefined): ActionCTA {
  const map: Record<string, ActionCTA> = {
    "checklist":        { label: "Download Readiness Checklist",    href: "/resources" },
    "notice-template":  { label: "Get Notice Template Pack",        href: "/resources" },
    "consent-template": { label: "Get Consent Toolkit",             href: "/resources" },
    "vendor-checklist": { label: "Get Vendor Toolkit",              href: "/resources" },
    "awareness-kit":    { label: "Download Awareness Kit",          href: "/resources" },
    "consultation":     { label: "Book Expert Consultation",        href: "/contact"   },
  };
  return map[q12 ?? ""] ?? { label: "Download Readiness Checklist", href: "/resources" };
}

export function getBlockerCTA(q11: string | undefined): ActionCTA {
  const map: Record<string, ActionCTA> = {
    "not-clear":      { label: "Download Readiness Checklist",    href: "/resources" },
    "no-time":        { label: "Get 30-Day Action Plan",          href: "/contact"   },
    "no-budget":      { label: "Get Low-Cost Starter Pack",       href: "/resources" },
    "no-owner":       { label: "Use Governance Checklist",        href: "/resources" },
    "manual-process": { label: "Get Process Cleanup Guide",       href: "/resources" },
    "team-awareness": { label: "Download Staff Awareness Kit",    href: "/resources" },
    "vendor-risk":    { label: "Use Vendor Assessment Checklist", href: "/resources" },
    "need-help":      { label: "Book Expert Consultation",        href: "/contact"   },
  };
  return map[q11 ?? ""] ?? { label: "Book Expert Consultation", href: "/contact" };
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export function calculateFullResult(answers: DPDPAAnswers): DPDPAScoreResult {
  const skippedQ4Q5 = answers.q3_digital_data === "no";
  const q4arr = skippedQ4Q5 ? [] : (answers.q4_data_types ?? []);
  const q5arr = skippedQ4Q5 ? [] : (answers.q5_storage ?? []);
  const q6arr = answers.q6_controls ?? [];

  const perQ: PerQuestionScores = {
    q1:  scoreQ1(answers.q1_sector ?? ""),
    q2:  scoreQ2(answers.q2_footprint ?? ""),
    q3:  scoreQ3(answers.q3_digital_data ?? ""),
    q4:  skippedQ4Q5 ? 14 : scoreQ4(q4arr),
    q5:  skippedQ4Q5 ? 12 : scoreQ5(q5arr),
    q6:  scoreQ6(q6arr),
    q7:  scoreQ7(answers.q7_rights ?? ""),
    q8:  scoreQ8(answers.q8_consent ?? ""),
    q9:  scoreQ9(answers.q9_ownership ?? ""),
    q10: scoreQ10(answers.q10_readiness ?? ""),
  };

  const rawScore = Object.values(perQ).reduce((s, v) => s + v, 0);

  const { flags, total: penaltyTotal } = applyRedFlagPenalties(answers, perQ);

  const finalScore = Math.min(100, Math.max(0, rawScore - penaltyTotal));

  const band = getVerdictBand(finalScore);

  const dataExposure         = deriveDataExposure(perQ.q3, perQ.q4, perQ.q5);
  const controlMaturity      = deriveControlMaturity(perQ.q6, perQ.q9);
  const operationalReadiness = deriveOperationalReadiness(perQ.q7, perQ.q8, perQ.q10);
  const categoryScores       = deriveCategoryScores(perQ, q6arr);

  const hasSensitiveData = q4arr.some(d => SENSITIVE_DATA_IDS.includes(d));

  const immediateActions = getImmediateActions(answers, perQ, flags);
  const thirtyDayActions = get30DayActions(answers, perQ);

  const resourceCTA = getResourceCTA(answers.q12_resource);
  const blockerNote = answers.q11_blocker
    ? getBlockerCTA(answers.q11_blocker).label
    : undefined;

  return {
    perQ,
    rawScore,
    redFlagsTriggered: flags,
    penaltyTotal,
    finalScore,
    verdictBand:        band.label,
    verdictColor:       band.color,
    verdictDescription: band.description,
    dataExposure,
    controlMaturity,
    operationalReadiness,
    categoryScores,
    immediateActions,
    thirtyDayActions,
    resourceCTA,
    blockerNote,
    skippedQ4Q5,
    hasSensitiveData,
  };
}

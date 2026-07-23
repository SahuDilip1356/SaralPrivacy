// Honest two-force retention lookup for the Discovery Pack (Retention Matrix).
// LOCKED 2026-07-23. Keyed on the engine TAG_GROUP tag keys (see engine.ts).
//
// Design principle — DPDPA sets NO retention period. It requires only: retain
// while the purpose is live, then erase (s.8-style erasure duty). A firm number
// EVER comes from another Indian law, and DPDPA's erasure duty expressly yields
// to "any law for the time being in force" (commonly cited as s.8(7) — confirm
// with counsel). So every suggestion carries a status flag:
//   - `statutory_floor`      → a retention law applies → firm period + citation.
//   - `dpdpa_determination`  → NO other law → show NO hard number; the fiduciary
//                              sets and justifies the period.
// This is editorial guidance to start a conversation — NOT legal advice. Every
// citation is marked "confirm with counsel"; the DPDP Rules are still settling.

export type RetentionStatus = "statutory_floor" | "dpdpa_determination";

export interface RetentionSuggestion {
  /** When the retention clock starts — the single most-misunderstood field. */
  trigger: string;
  /** The DPDPA minimise rule — category-appropriate phrasing. Never a number. */
  dpdpaBaseline: string;
  /** The statutory floor, if any law applies — else null. */
  otherLaw: { period: string; citation: string } | null;
  status: RetentionStatus;
  /** The actionable line the UI shows the user. */
  guidance: string;
}

// The only categories where an Indian statute sets a retention floor.
const STATUTORY: Record<string, RetentionSuggestion> = {
  FINANCIAL_DATA: {
    trigger: "Financial-year close",
    dpdpaBaseline: "Erase once the payment/financial purpose is served.",
    otherLaw: { period: "~8 years", citation: "Companies Act 2013 s.128 / IT Act Rule 6F — confirm with counsel" },
    status: "statutory_floor",
    guidance: "Keep ~8 years, then erase. DPDPA defers to this. Validate scope for your entity.",
  },
  TRANSACTION_DATA: {
    trigger: "Transaction / financial-year close",
    dpdpaBaseline: "Erase once the order/transaction is fulfilled.",
    otherLaw: { period: "6–8 years", citation: "GST (72 months) / Companies Act 2013 s.128 — confirm with counsel" },
    status: "statutory_floor",
    guidance: "Keep 6–8 years, then erase. Validate scope.",
  },
  EMPLOYMENT_DATA: {
    trigger: "Employment exit",
    dpdpaBaseline: "Erase once the employment purpose ends.",
    otherLaw: { period: "7–8 years post-exit", citation: "IT Act / EPF / ESI / Payment of Wages / Companies Act — confirm with counsel" },
    status: "statutory_floor",
    guidance: "Keep 7–8 years post-exit, then erase. Validate per record type.",
  },
  // Sector-conditional: health providers only. Non-health businesses fall back
  // to determination — reflected in the guidance line.
  HEALTH_DATA: {
    trigger: "Last service / discharge",
    dpdpaBaseline: "Erase once the service purpose is served.",
    otherLaw: { period: "~3 years (health providers)", citation: "Clinical Establishments Rules / ICMR — providers only, confirm with counsel" },
    status: "statutory_floor",
    guidance: "Health providers: ~3 years (sector rules). Non-health businesses: no retention law — erase when the service purpose ends. Validate applicability.",
  },
};

// Categories governed by DPDPA minimisation alone — NO statutory number shown.
const DETERMINATION: Record<string, RetentionSuggestion> = {
  IDENTITY: {
    trigger: "Relationship ends",
    dpdpaBaseline: "Erase once the purpose is served or the relationship ends.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance:
      "No retention law on its own — erase after the relationship ends (plus a short window to handle disputes). You set and justify the period. Regulated entities: PMLA (~5 years after the relationship ends) may apply to KYC records — validate.",
  },
  CHILD_DATA: {
    trigger: "Purpose served / age-out",
    dpdpaBaseline: "Minimise, keep strictly purpose-bound, then erase.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance:
      "Heightened duty — verifiable parental consent and minimisation. No fixed retention number; erase when the purpose is served. Education/board rules may apply to academic records.",
  },
  BEHAVIOURAL_DATA: {
    trigger: "Consent withdrawal / inactivity",
    dpdpaBaseline: "Erase on consent withdrawal.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "No retention law — delete on consent withdrawal, or after a period of inactivity you define (e.g. 12–24 months).",
  },
  AI_INFERENCE: {
    trigger: "Source-data purpose served",
    dpdpaBaseline: "Erase when the purpose is served.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "Profiles and scores stay bound by the original purpose of the source data — erase when that purpose is served. No separate retention law.",
  },
  DEVICE_NETWORK_DATA: {
    trigger: "Purpose served",
    dpdpaBaseline: "Erase when the purpose is served.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "No general retention law — erase when the purpose is served. Intermediaries under the IT Rules 2021 may have a ~180-day log-retention duty — validate.",
  },
  LOCATION_DATA: {
    trigger: "Purpose served",
    dpdpaBaseline: "Erase when the purpose is served.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "No retention law — erase when the purpose is served. Minimise precision wherever possible.",
  },
  BIOMETRIC_SURVEILLANCE: {
    trigger: "Capture date",
    dpdpaBaseline: "Erase when the security purpose is served.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "No general retention law — minimise hard; typically 30–90 days, then delete.",
  },
  VENDOR_SHARED: {
    trigger: "Underlying purpose served",
    dpdpaBaseline: "Erase when the purpose is served.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "Retention follows the underlying data category and your data-processing agreement — not a separate clock.",
  },
  DARK_DATA: {
    trigger: "Purpose served",
    dpdpaBaseline: "Should not persist past its purpose.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "Duplicates and exports — these shouldn't outlive their purpose. Delete them.",
  },
  COMMUNICATION_DATA: {
    trigger: "Interaction resolved",
    dpdpaBaseline: "Erase after the interaction is resolved.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "No retention law — a 1–2 year business-judgement window is typical, then erase (unless tied to a financial dispute).",
  },
  CONSENT_RECORD: {
    trigger: "Consent given / request handled",
    dpdpaBaseline: "Keep proof while processing continues.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "Retain proof of consent for the duration of processing plus a reasonable window to demonstrate compliance.",
  },
  SENSITIVE_CONTEXT: {
    trigger: "Purpose served",
    dpdpaBaseline: "Minimise, then erase when the purpose is served.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "DPDPA has no special-category retention tier — minimise and erase when the purpose is served.",
  },
  RETENTION_RISK: {
    trigger: "Purpose served",
    dpdpaBaseline: "Purpose likely served — erase.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "Flagged as kept past need — erase now, unless one of the statutory floors applies.",
  },
  ACCESS_CONTROL_RISK: {
    trigger: "Underlying category trigger",
    dpdpaBaseline: "Retention follows the underlying data category.",
    otherLaw: null,
    status: "dpdpa_determination",
    guidance: "The risk here is access, not duration — retention follows the underlying data category.",
  },
};

export const RETENTION_SUGGESTIONS: Record<string, RetentionSuggestion> = {
  ...STATUTORY,
  ...DETERMINATION,
};

// Any item whose category is missing from the lookup resolves here — no item
// can fall through, and the default is always the conservative DPDPA rule.
export const RETENTION_FALLBACK: RetentionSuggestion = {
  trigger: "Purpose served",
  dpdpaBaseline: "Erase when the purpose is served.",
  otherLaw: null,
  status: "dpdpa_determination",
  guidance: "No retention law identified — under DPDPA, erase when the purpose is served. You set and justify any period.",
};

/** Look up a retention suggestion by engine TAG_GROUP key. Never throws. */
export function retentionFor(tagKey: string): RetentionSuggestion {
  return RETENTION_SUGGESTIONS[tagKey] ?? RETENTION_FALLBACK;
}

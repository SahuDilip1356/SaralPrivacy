// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment Engine · Core
// Reusable, pack-agnostic scoring. A new industry = a new PACK (data),
// not new engine logic.
//
// Scoring model (hybrid composite — see portfolio spec §4):
//  • Additive risk points + per-question caps           (transparent)
//  • Red-flag overrides that may only RAISE the band    (replaces multipliers)
//  • Two-lens reporting: Data Exposure vs Control Maturity (additive sub-scores)
//  • Engine returns RISK; UI shows READINESS (100 − risk) + risk-band label.
//
// Pure TypeScript — zero React/Next imports.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BandLabel,
  getBandByScore,
  getBandByLabel,
  maxBand,
} from "./bands";

// ── Question / option model ────────────────────────────────────────────────

export interface IAOption {
  id: string;
  label: string;
  riskPoints: number; // additive; higher = worse
  badge?: string;
  badgeColor?: "red" | "amber" | "green";
}

export type QuestionLayer = "exposure" | "control";

export interface IAQuestion {
  id: string; // "q0".."q10"
  question: string;
  helpText?: string;
  whyThisMatters?: string; // collapsible note in UI
  badge: string; // category badge shown in UI
  type: "single" | "multi";
  cap: number; // max risk points this question can contribute
  bucket: string; // pack-defined bucket key
  layer: QuestionLayer; // for two-lens reporting
  optional?: boolean; // optional questions only count when answered
  mutuallyExclusive?: string[]; // option ids that clear all others when picked
  options: IAOption[];
}

export interface IABucket {
  key: string;
  label: string;
  meaning: string; // shown on the result risk-map
}

// ── Answers ────────────────────────────────────────────────────────────────

export type IAAnswerValue = string | string[] | undefined;
export type IAAnswers = Record<string, IAAnswerValue>;

// ── Overrides + soft flags ───────────────────────────────────────────────────

export interface IAOverride {
  id: string;
  minBand: BandLabel; // raise the band to at least this
  test: (a: IAAnswers) => boolean;
  flag: string; // human-readable red flag if triggered
  severity: number; // ranking weight for "top 3"
}

export interface IAFlagRule {
  id: string;
  test: (a: IAAnswers) => boolean;
  flag: string;
  severity: number;
}

// ── Pack ─────────────────────────────────────────────────────────────────────

export interface IndustryPack {
  industry: string; // "ca-firms"
  route: string; // "/assessment/ca-firms"
  reportType: string; // payload report_type, e.g. "ca-firm"
  positioning: {
    title: string;
    hero: string;
    sub: string;
    cta: string;
    chips: string[];
    microline: string;
  };
  buckets: IABucket[]; // exactly 5
  questions: IAQuestion[]; // 10 (+ optional Q0)
  overrides: IAOverride[];
  softFlags: IAFlagRule[];
  recommend: (r: IAResult, a: IAAnswers) => string[]; // dynamic remediation
  bandCopy?: Record<BandLabel, string>; // per-pack result-band description (report + client + email share it)
  leadMagnet?: { title: string; href: string };
}

// ── Result ───────────────────────────────────────────────────────────────────

export type BucketStatus = "Low" | "Moderate" | "High";

export interface IAResult {
  riskScore: number; // 0–100, high = bad
  readinessScore: number; // 100 − risk (drives the gauge)
  band: BandLabel;
  bandColor: string;
  bandDescription: string;
  dataExposure: number; // 0–100, high = MORE exposure (bad)
  controlMaturity: number; // 0–100, high = BETTER controls (good)
  bucketScores: Record<string, number>; // 0–100 risk per bucket
  bucketStatus: Record<string, BucketStatus>;
  redFlags: string[]; // top 3 by severity
  overridesApplied: string[];
  recommendations: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function selectedIds(value: IAAnswerValue): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Risk contributed by one question = capped sum of selected option points,
 * floored at 0. Flooring lets a pack offer "credit" options with negative
 * riskPoints (e.g. "we use these systems with documented access controls")
 * without a question ever going negative. No-op for packs that have no
 * negative options.
 */
export function questionRisk(q: IAQuestion, value: IAAnswerValue): number {
  const ids = selectedIds(value);
  let sum = 0;
  for (const id of ids) {
    const opt = q.options.find((o) => o.id === id);
    if (opt) sum += opt.riskPoints;
  }
  return Math.max(0, Math.min(q.cap, sum));
}

function isAnswered(value: IAAnswerValue): boolean {
  return selectedIds(value).length > 0;
}

/**
 * Rebuild a human-readable Q→A summary from stored answers, using the pack's
 * own questions/options. Used by the public report page and the admin view so
 * industry submissions show what the user actually selected.
 */
export function summarizeAnswers(
  pack: IndustryPack,
  answers: IAAnswers
): Array<{ question: string; answer: string }> {
  const out: Array<{ question: string; answer: string }> = [];
  for (const q of pack.questions) {
    const ids = selectedIds(answers[q.id]);
    if (!ids.length) continue;
    const labels = ids
      .map((id) => q.options.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    if (labels.length) out.push({ question: q.question, answer: labels.join(", ") });
  }
  return out;
}

function bucketStatusFromScore(score: number): BucketStatus {
  if (score < 34) return "Low";
  if (score < 67) return "Moderate";
  return "High";
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ── Main entry point ─────────────────────────────────────────────────────────

export function calculateIndustryResult(
  pack: IndustryPack,
  answers: IAAnswers
): IAResult {
  // Only score questions that are required OR (optional AND answered).
  const scored = pack.questions.filter(
    (q) => !q.optional || isAnswered(answers[q.id])
  );

  let rawRisk = 0;
  let maxRisk = 0;
  let expRisk = 0;
  let expCap = 0;
  let ctrlRisk = 0;
  let ctrlCap = 0;
  const bucketRisk: Record<string, number> = {};
  const bucketCap: Record<string, number> = {};

  for (const b of pack.buckets) {
    bucketRisk[b.key] = 0;
    bucketCap[b.key] = 0;
  }

  for (const q of scored) {
    const r = questionRisk(q, answers[q.id]);
    rawRisk += r;
    maxRisk += q.cap;

    if (q.layer === "exposure") {
      expRisk += r;
      expCap += q.cap;
    } else {
      ctrlRisk += r;
      ctrlCap += q.cap;
    }

    if (bucketRisk[q.bucket] !== undefined) {
      bucketRisk[q.bucket] += r;
      bucketCap[q.bucket] += q.cap;
    }
  }

  let riskScore = maxRisk > 0 ? clamp(Math.round((rawRisk / maxRisk) * 100)) : 0;

  // Band from math, then apply overrides (raise-only).
  let band: BandLabel = getBandByScore(riskScore).label;
  const overridesApplied: string[] = [];
  const overrideFlags: Array<{ flag: string; severity: number }> = [];

  for (const ov of pack.overrides) {
    if (ov.test(answers)) {
      band = maxBand(band, ov.minBand);
      overridesApplied.push(ov.id);
      overrideFlags.push({ flag: ov.flag, severity: ov.severity });
    }
  }

  // Keep the number consistent with an overridden band (floor risk to band.min).
  const finalBand = getBandByLabel(band);
  if (riskScore < finalBand.min) riskScore = finalBand.min;
  const readinessScore = 100 - riskScore;

  // Two-lens sub-scores.
  const dataExposure = expCap > 0 ? clamp(Math.round((expRisk / expCap) * 100)) : 0;
  // Control questions accrue risk when controls are WEAK → maturity is the inverse.
  const controlWeakness = ctrlCap > 0 ? (ctrlRisk / ctrlCap) * 100 : 0;
  const controlMaturity = clamp(Math.round(100 - controlWeakness));

  // Bucket scores + status.
  const bucketScores: Record<string, number> = {};
  const bucketStatus: Record<string, BucketStatus> = {};
  for (const b of pack.buckets) {
    const score =
      bucketCap[b.key] > 0
        ? clamp(Math.round((bucketRisk[b.key] / bucketCap[b.key]) * 100))
        : 0;
    bucketScores[b.key] = score;
    bucketStatus[b.key] = bucketStatusFromScore(score);
  }

  // Red flags: overrides + soft flags, deduped by text, top 3 by severity.
  const softFlags = pack.softFlags
    .filter((f) => f.test(answers))
    .map((f) => ({ flag: f.flag, severity: f.severity }));
  const seen = new Set<string>();
  const redFlags = [...overrideFlags, ...softFlags]
    .sort((a, b) => b.severity - a.severity)
    .filter((f) => (seen.has(f.flag) ? false : (seen.add(f.flag), true)))
    .slice(0, 3)
    .map((f) => f.flag);

  const result: IAResult = {
    riskScore,
    readinessScore,
    band,
    bandColor: finalBand.color,
    bandDescription: finalBand.description,
    dataExposure,
    controlMaturity,
    bucketScores,
    bucketStatus,
    redFlags,
    overridesApplied,
    recommendations: [],
  };

  result.recommendations = pack.recommend(result, answers);
  return result;
}

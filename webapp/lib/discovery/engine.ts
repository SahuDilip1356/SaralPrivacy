// Pure scoring engine for the discovery tool. No React, no DOM — unit-testable.
// Faithful port of the prototype engine.js (dpdpa_personal_data_map_v3.2 Scoring_Model),
// extended to aggregate DPDPA obligations from selected items.
import { denormNiche, getNiche, TAG_LIB, SCORING } from "./data";
import type {
  Answers,
  Bucket,
  ItemGroup,
  Obligation,
  ResolvedItem,
  RiskBand,
  ConfidenceLevel,
  ScoreResult,
  Role,
} from "./types";

// Friendly category names derived from scoring tags.
const TAG_GROUP: Record<string, string> = {
  IDENTITY: "Customer identity & contact",
  FINANCIAL_DATA: "Payment & financial data",
  TRANSACTION_DATA: "Order & transaction data",
  HEALTH_DATA: "Health & medical data",
  CHILD_DATA: "Children's & student data",
  BEHAVIOURAL_DATA: "Behavioural & tracking data",
  AI_INFERENCE: "Profiles, scores & inferences",
  DEVICE_NETWORK_DATA: "Device & online identifiers",
  LOCATION_DATA: "Location & address data",
  BIOMETRIC_SURVEILLANCE: "Biometric, CCTV & access logs",
  VENDOR_SHARED: "Vendor & platform-shared data",
  DARK_DATA: "Shadow data (chats, exports, drives)",
  RETENTION_RISK: "Over-retained records",
  ACCESS_CONTROL_RISK: "Broad-access data",
  COMMUNICATION_DATA: "Communication & support records",
  CONSENT_RECORD: "Consent & rights records",
  SENSITIVE_CONTEXT: "Sensitive-context data",
  EMPLOYMENT_DATA: "Employee & workforce data",
};

// Cross-cutting UI-group short labels shown per item.
const UIGROUP_SHORT: Record<string, string> = {
  "Customer & user data": "Customer",
  "Employee & staff data": "Staff",
  "Visitor & premises data": "Premises",
  "Client-entrusted data": "Client",
  "Vendor & partner data": "Vendor",
};

// Canonical order for displaying obligations.
const OBLIGATION_ORDER: Obligation[] = [
  "Notice",
  "Consent",
  "Security safeguards",
  "Retention & erasure",
  "Vendor controls",
  "Children (verifiable consent)",
];

function tagWeight(tag: string): number {
  return (TAG_LIB[tag] && TAG_LIB[tag].weight) || 1;
}

// Highest tag weight on an item (tags do NOT stack) × bucket multiplier.
export function itemWeight(tags: string[], bucket: Bucket): number {
  const maxTag = tags && tags.length ? Math.max(...tags.map(tagWeight)) : 1;
  const mult = SCORING.bucketMult[bucket] || 1;
  return maxTag * mult;
}

const GROUP_DEFS: { key: ItemGroup["key"]; bucket: Bucket; title: string; sub: string }[] = [
  {
    key: "core",
    bucket: "Core",
    title: "Core personal data",
    sub: "The identity and contact data you almost certainly hold.",
  },
  {
    key: "operational",
    bucket: "Operational",
    title: "Operational personal data",
    sub: "Generated as you serve, bill, deliver, employ and support people.",
  },
  {
    key: "hidden",
    bucket: "Hidden",
    title: "Hidden / often-missed data",
    sub: "The data most businesses forget they hold — and where exposure usually sits.",
  },
];

// Resolve a niche's items into the three buckets the business thinks in.
export function resolveGroups(nicheId: string): ItemGroup[] {
  const raw = denormNiche(nicheId);
  if (!raw.length) return [];
  const stamped: ResolvedItem[] = raw.map((it) => ({
    ...it,
    id: `${nicheId}:${it.seq}`,
    weight: itemWeight(it.tags, it.bucket),
    uiShort: UIGROUP_SHORT[it.uiGroup] || it.uiGroup,
  }));
  return GROUP_DEFS.map((g) => ({
    ...g,
    items: stamped.filter((i) => i.bucket === g.bucket),
  })).filter((g) => g.items.length > 0);
}

export function band(score: number): RiskBand {
  return (SCORING.bands.find((b) => score < b.max)?.label as RiskBand) || "Critical";
}
export function confidenceLabel(share: number): ConfidenceLevel {
  return (SCORING.confidence.find((b) => share < b.max)?.label as ConfidenceLevel) || "Low";
}

const ROUND1 = (n: number) => Math.round(n * 10) / 10;

// selectedIds = item ids the user confirmed ("yes"). answers = q1/q2/q3.
export function score(nicheId: string, selectedIds: Set<string>, answers: Answers): ScoreResult {
  const n = getNiche(nicheId);
  const role: Role = (n && n.role) || "F";
  const groups = resolveGroups(nicheId);
  const allItems = groups.flatMap((g) => g.items);
  const selected = allItems.filter((i) => selectedIds.has(i.id));

  // Steps 1–3: raw → normalized
  const raw = selected.reduce((s, i) => s + i.weight, 0);
  const normalized = ROUND1(Math.min(raw, 100));

  // Step 4: modifier (no channel questions in this lightweight flow) = 1.0
  const modifier = 1.0;

  // Steps 5–8: control multiplier (product of the three, capped)
  const m1 = SCORING.q1[answers.q1 as string] ?? 1;
  const m2 = SCORING.q2[answers.q2 as string] ?? 1;
  const m3 = SCORING.q3[answers.q3 as string] ?? 1;
  const control = Math.min(m1 * m2 * m3, SCORING.controlCap);
  const combined = Math.min(modifier * control, SCORING.totalCap);

  // Step 9: final
  const final = ROUND1(Math.min(normalized * combined, 100));
  const riskBand = band(final);

  // Confidence: share of "not sure" control answers
  const notSure = (["q1", "q2", "q3"] as const).filter((k) => answers[k] === "notsure").length;
  const confidence = confidenceLabel(notSure / 3);

  // Categories present (friendly groups), ordered by total weight
  const catWeight: Record<string, number> = {};
  selected.forEach((i) =>
    (i.tags || []).forEach((t) => {
      const g = TAG_GROUP[t];
      if (!g) return;
      catWeight[g] = (catWeight[g] || 0) + i.weight;
    }),
  );
  const categories = Object.keys(catWeight).sort((a, b) => catWeight[b] - catWeight[a]);

  // DPDPA obligations triggered by selected items, in canonical order
  const obSet = new Set<Obligation>();
  selected.forEach((i) => (i.obligations || []).forEach((o) => obSet.add(o)));
  const obligations = OBLIGATION_ORDER.filter((o) => obSet.has(o));

  // Hidden / often-missed
  const hiddenSelected = selected.filter((i) => i.bucket === "Hidden");
  const hiddenAvailable = allItems.filter((i) => i.bucket === "Hidden").length;

  // Precautions: heaviest first, Hidden tie-break, unique text. Keep the full
  // deduped set (fixCount) and surface the top 5.
  const seen = new Set<string>();
  const allPrecautions = selected
    .slice()
    .sort((a, b) => b.weight - a.weight || (b.bucket === "Hidden" ? 1 : -1))
    .map((i) => i.precaution)
    .filter((p) => p && !seen.has(p) && (seen.add(p), true));
  const precautions = allPrecautions.slice(0, 5);

  // High-value items needing priority safeguards: selected items whose top tag
  // weight ≥ 3 (financial, health, children's, biometric, location, AI, dark data).
  const highValueCount = selected.filter((i) => {
    const w = i.tags && i.tags.length ? Math.max(...i.tags.map(tagWeight)) : 1;
    return w >= 3;
  }).length;

  return {
    role,
    raw: ROUND1(raw),
    normalized,
    modifier,
    control: Math.round(control * 1000) / 1000,
    final,
    riskBand,
    confidence,
    notSure,
    selectedCount: selected.length,
    totalCount: allItems.length,
    categories,
    hiddenSelected,
    hiddenAvailable,
    precautions,
    fixCount: allPrecautions.length,
    highValueCount,
    obligations,
    answers,
  };
}

const BAND_COLORS: Record<RiskBand, string> = {
  Low: "#07B981",
  Moderate: "#E8AB42",
  High: "#E8704A",
  Critical: "#C2413A",
};
export function bandColor(b: RiskBand): string {
  return BAND_COLORS[b];
}

export { TAG_GROUP };

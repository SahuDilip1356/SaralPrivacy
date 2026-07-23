// buildRegister — the pure derivation that turns confirmed Discovery items into the
// three-report Discovery Pack (Master Register + Retention Matrix + Risk Register)
// plus a Prioritised Action Summary and completion counts.
//
// PURE BY DESIGN: this module imports only types + the retention lookup. It does NOT
// import engine.ts (which drags an extensionless `./data` import that Node 24's
// strip-types can't resolve). The two engine-derived helpers it needs — tag weights
// and the tag→category-name map — are INJECTED by the caller (ResultPanel builds them
// from engine imports, which the Next bundler resolves fine). That keeps buildRegister
// unit-testable with plain fixtures and keeps the reports a derivation, not a new
// source of truth. Engine scoring is untouched.
import type { ItemGroup, ResolvedItem, RiskBand, ScoreResult } from "./types.ts";
import { retentionFor, type RetentionStatus } from "./retention-suggestions.ts";

// ---- Report types -----------------------------------------------------------

export type RowStatus = "Suggested" | "Confirmed" | "Unknown";

export interface RegisterRow {
  id: string;
  // core (visible)
  dataItem: string;
  description: string;
  dataPrincipal: string;
  dataCategory: string;
  purpose: string;
  collectionSource: string;
  storedAt: string;
  riskLevel: RiskBand;
  riskReason: string;
  recommendedAction: string;
  status: RowStatus;
  // advanced (in model, hidden by default)
  categoryKey: string;
  processingGround?: string;
  noticeStatus: "Needs Confirmation" | "In place" | "Unknown";
  externalRecipients: string[];
  retentionRuleId: string;
  linkedRiskIds: string[];
  provenance: "engine-suggested";
}

export interface RetentionRule {
  retentionRuleId: string;
  category: string;
  dataItem: string; // the category, representing the grouped items
  dataPrincipal: string;
  process: string;
  purpose: string;
  retentionTrigger: string;
  dpdpaBaseline: string;
  otherLaw: { period: string; citation: string } | null;
  status: RetentionStatus;
  guidance: string;
  systemsAffected: string[];
  disposalMethod: string;
  confirmationStatus: "unconfirmed" | "accepted" | "edited";
  label: "Suggested — validate";
}

// The twelve DPDPA risk categories.
export type RiskCategory =
  | "Collection"
  | "Notice & consent"
  | "Access"
  | "Storage"
  | "Sharing"
  | "Vendor"
  | "Retention"
  | "Deletion"
  | "Security"
  | "Children"
  | "Cross-border"
  | "Governance";

export type RiskPriority = "Immediate" | "High" | "Medium";

export interface RiskRow {
  riskId: string;
  risk: string;
  affectedData: string[];
  locationOrFlow: string;
  reason: string;
  severity: RiskBand;
  priority: RiskPriority;
  recommendedControl: string;
  category: RiskCategory;
  // bridge into Data Mapping
  relatedDataItems: string[];
  relatedStorage?: string;
  relatedRecipient?: string;
  suggestedMappingQuestion: string;
  mappingPriority: "high" | "medium" | "low";
  linkedFlowNodeId?: string;
}

export interface ActionItem {
  action: string;
  reason: string;
  relatedRiskIds: string[];
  effort: "low" | "medium" | "high";
}

export interface DiscoveryRegister {
  nicheId: string;
  nicheName: string;
  generatedAt: string;
  rows: RegisterRow[];
  retention: RetentionRule[];
  risks: RiskRow[];
  actions: { immediate: ActionItem[]; days30: ActionItem[]; days90: ActionItem[] };
  counts: {
    items: number;
    categories: number;
    storageLocations: number;
    recipients: number;
    highRisk: number;
    retentionToConfirm: number;
  };
}

export interface RegisterDeps {
  tagWeight: (tag: string) => number;
  categoryName: (tagKey: string) => string | undefined;
}

export interface RegisterInput {
  nicheId: string;
  nicheName: string;
  groups: ItemGroup[];
  selectedIds: Set<string>;
  /** The score result — accepted for continuity; cut-1 derivation doesn't read it. */
  result?: ScoreResult;
  deps: RegisterDeps;
  now?: () => string; // injectable clock for deterministic tests
}

// ---- helpers ----------------------------------------------------------------

const BANDS: RiskBand[] = ["Low", "Moderate", "High", "Critical"];
const bandRank = (b: RiskBand) => BANDS.indexOf(b);
const RECIPIENT_LABEL = "Third-party / vendor (confirm)";

const uniq = (xs: string[]) => [...new Set(xs.filter((x) => x && x.trim().length))];
const splitSources = (s: string) =>
  (s || "").split(/[;,/]/).map((x) => x.trim()).filter(Boolean);

function maxTagWeight(item: ResolvedItem, tagWeight: RegisterDeps["tagWeight"]): number {
  return item.tags && item.tags.length ? Math.max(...item.tags.map(tagWeight)) : 1;
}

// Dominant tag = highest-weight tag that maps to a known category; falls back to the
// heaviest tag, then to a generic bucket. Deterministic (stable on ties by tag order).
function dominantTag(
  item: ResolvedItem,
  { tagWeight, categoryName }: RegisterDeps,
): { key: string; name: string } {
  const tags = item.tags ?? [];
  const known = tags.filter((t) => categoryName(t));
  const pool = known.length ? known : tags;
  if (!pool.length) return { key: "OTHER", name: "Other personal data" };
  let best = pool[0];
  for (const t of pool) if (tagWeight(t) > tagWeight(best)) best = t;
  return { key: best, name: categoryName(best) ?? "Other personal data" };
}

function itemRiskBand(item: ResolvedItem, tagWeight: RegisterDeps["tagWeight"]): RiskBand {
  const w = maxTagWeight(item, tagWeight);
  let level = w >= 3 ? 3 : w >= 2 ? 2 : 1; // 1=Low 2=Moderate 3=High
  if (item.bucket === "Hidden") level = Math.min(level + 1, 4); // often-missed → bump
  if (w >= 3 && item.bucket === "Hidden") level = 4; // Critical
  return BANDS[level - 1];
}

function itemRiskReason(item: ResolvedItem, w: number): string {
  if (w >= 3 && item.bucket === "Hidden") return "High-value data held in an often-missed place — priority exposure.";
  if (w >= 3) return "High-value data — needs priority safeguards.";
  if (item.bucket === "Hidden") return "Often-missed data — commonly uncontrolled.";
  return "Standard personal data — baseline controls apply.";
}

const priorityFor = (severity: RiskBand): RiskPriority =>
  bandRank(severity) >= bandRank("High") ? "Immediate" : severity === "Moderate" ? "High" : "Medium";
const mappingPriorityFor = (p: RiskPriority) =>
  p === "Immediate" ? "high" : p === "High" ? "medium" : "low";

// ---- the build --------------------------------------------------------------

export function buildRegister(input: RegisterInput): DiscoveryRegister {
  const { nicheId, nicheName, groups, selectedIds, deps } = input;
  const generatedAt = (input.now ?? (() => new Date().toISOString()))();

  const selected: ResolvedItem[] = groups
    .flatMap((g) => g.items)
    .filter((i) => selectedIds.has(i.id));

  // --- Master Register rows ---
  const rows: RegisterRow[] = selected.map((item) => {
    const cat = dominantTag(item, deps);
    const w = maxTagWeight(item, deps.tagWeight);
    const riskLevel = itemRiskBand(item, deps.tagWeight);
    const sources = item.sources || "";
    const isShared = (item.tags ?? []).includes("VENDOR_SHARED");
    return {
      id: item.id,
      dataItem: item.item,
      description: item.examples || "",
      dataPrincipal: item.dataSubjects || "—",
      dataCategory: cat.name,
      purpose: item.processingPurposes || "—",
      collectionSource: splitSources(sources)[0] || "Suggested — confirm source",
      storedAt: sources || "Suggested — confirm location",
      riskLevel,
      riskReason: itemRiskReason(item, w),
      recommendedAction: item.precaution || "Review and confirm controls.",
      status: "Suggested",
      categoryKey: cat.key,
      noticeStatus: "Needs Confirmation",
      externalRecipients: isShared ? [RECIPIENT_LABEL] : [],
      retentionRuleId: `ret:${cat.key}`,
      linkedRiskIds: [], // filled after risks are built
      provenance: "engine-suggested",
    } satisfies RegisterRow;
  });

  // --- Retention Matrix: one rule per distinct category present ---
  const byCategory = new Map<string, RegisterRow[]>();
  for (const row of rows) {
    const arr = byCategory.get(row.categoryKey) ?? [];
    arr.push(row);
    byCategory.set(row.categoryKey, arr);
  }
  const retention: RetentionRule[] = [...byCategory.entries()].map(([key, groupRows]) => {
    const sug = retentionFor(key);
    const items = selected.filter((i) => dominantTag(i, deps).key === key);
    const disposal =
      key === "BIOMETRIC_SURVEILLANCE" || key === "BEHAVIOURAL_DATA" || key === "DARK_DATA"
        ? "Permanent deletion"
        : "Secure deletion";
    return {
      retentionRuleId: `ret:${key}`,
      category: key,
      dataItem: groupRows[0].dataCategory,
      dataPrincipal: uniq(items.map((i) => i.dataSubjects)).slice(0, 4).join("; ") || "—",
      process: uniq(items.map((i) => i.uiGroup)).slice(0, 3).join("; ") || "General handling",
      purpose: uniq(items.map((i) => i.processingPurposes)).slice(0, 3).join("; ") || "—",
      retentionTrigger: sug.trigger,
      dpdpaBaseline: sug.dpdpaBaseline,
      otherLaw: sug.otherLaw,
      status: sug.status,
      guidance: sug.guidance,
      systemsAffected: uniq(items.flatMap((i) => splitSources(i.sources))).slice(0, 6),
      disposalMethod: disposal,
      confirmationStatus: "unconfirmed",
      label: "Suggested — validate",
    } satisfies RetentionRule;
  });

  // --- Risk Register: bounded, themed, deterministic; each carries bridge fields ---
  const risks = buildRisks(rows, deps);

  // back-link rows ↔ risks
  for (const risk of risks) {
    for (const row of rows) {
      if (risk.relatedDataItems.includes(row.id)) row.linkedRiskIds.push(risk.riskId);
    }
  }

  // --- Prioritised Action Summary (≤5 / ≤5 / ≤5, no penalties) ---
  const actions = buildActions(risks);

  // --- counts ---
  const counts = {
    items: rows.length,
    categories: new Set(rows.map((r) => r.dataCategory)).size,
    storageLocations: uniq(rows.flatMap((r) => splitSources(r.storedAt))).length,
    recipients: uniq(rows.flatMap((r) => r.externalRecipients)).length,
    highRisk: rows.filter((r) => bandRank(r.riskLevel) >= bandRank("High")).length,
    retentionToConfirm: retention.length,
  };

  return { nicheId, nicheName, generatedAt, rows, retention, risks, actions, counts };
}

// Themed risk derivation. Each theme fires only if its condition holds, so an empty
// or low-risk register honestly yields few/no risks.
function buildRisks(rows: RegisterRow[], deps: RegisterDeps): RiskRow[] {
  if (!rows.length) return [];
  const rowsWith = (pred: (r: RegisterRow) => boolean) => rows.filter(pred);
  const sevOf = (rs: RegisterRow[]): RiskBand =>
    rs.reduce<RiskBand>((acc, r) => (bandRank(r.riskLevel) > bandRank(acc) ? r.riskLevel : acc), "Low");
  const topStorage = (rs: RegisterRow[]) => splitSources(rs.map((r) => r.storedAt).join("; "))[0];

  const highValue = rowsWith((r) => bandRank(r.riskLevel) >= bandRank("High"));
  const hiddenish = rowsWith((r) => /often-missed/i.test(r.riskReason));
  const shared = rowsWith((r) => r.externalRecipients.length > 0);
  const children = rowsWith((r) => r.categoryKey === "CHILD_DATA");
  const statutory = rowsWith((r) => ["FINANCIAL_DATA", "TRANSACTION_DATA", "EMPLOYMENT_DATA"].includes(r.categoryKey));

  const themes: Array<Omit<RiskRow, "riskId" | "severity" | "priority" | "mappingPriority"> & { pool: RegisterRow[] }> = [];

  if (highValue.length) {
    themes.push({
      risk: "High-value personal data without confirmed safeguards",
      pool: highValue,
      affectedData: uniq(highValue.map((r) => r.dataItem)),
      locationOrFlow: topStorage(highValue) || "Multiple systems",
      reason: "Financial, health, children's, biometric or location data carries the highest exposure if mishandled.",
      recommendedControl: "Apply role-based access, encryption at rest, and a documented handling standard.",
      category: "Security",
      relatedDataItems: highValue.map((r) => r.id),
      relatedStorage: topStorage(highValue),
      suggestedMappingQuestion: "Where does this high-value data travel after collection — which systems, people and outside parties touch it?",
    });
  }
  if (shared.length) {
    themes.push({
      risk: "Personal data shared externally without confirmed controls",
      pool: shared,
      affectedData: uniq(shared.map((r) => r.dataItem)),
      locationOrFlow: "Third-party / vendor transfer",
      reason: "Data leaving your systems needs a processing agreement and deletion terms with each recipient.",
      recommendedControl: "Map every recipient and put a data-processing agreement in place before sharing.",
      category: "Sharing",
      relatedDataItems: shared.map((r) => r.id),
      relatedRecipient: RECIPIENT_LABEL,
      suggestedMappingQuestion: "Which outside parties receive this data, through what channel, and what are they contractually required to do with it?",
    });
  }
  if (hiddenish.length) {
    themes.push({
      risk: "Often-missed / shadow data outside managed systems",
      pool: hiddenish,
      affectedData: uniq(hiddenish.map((r) => r.dataItem)),
      locationOrFlow: topStorage(hiddenish) || "Email, exports, personal devices",
      reason: "Exports, chats and copies on personal devices are the data most owners forget they hold.",
      recommendedControl: "Locate the copies, bring them into managed storage, and delete the strays.",
      category: "Governance",
      relatedDataItems: hiddenish.map((r) => r.id),
      relatedStorage: topStorage(hiddenish),
      suggestedMappingQuestion: "Which copies of this data exist outside your core systems — inboxes, spreadsheets, drives, devices?",
    });
  }
  if (statutory.length) {
    themes.push({
      risk: "Data under a statutory retention floor — deletion must be scheduled, not ad hoc",
      pool: statutory,
      affectedData: uniq(statutory.map((r) => r.dataItem)),
      locationOrFlow: topStorage(statutory) || "Finance / HR systems",
      reason: "This data must be kept for a legal period, then deleted — the deletion step is the one most often missed.",
      recommendedControl: "Set a retention clock per record and a scheduled deletion once the statutory period lapses.",
      category: "Retention",
      relatedDataItems: statutory.map((r) => r.id),
      relatedStorage: topStorage(statutory),
      suggestedMappingQuestion: "Where are all the copies of this record, so deletion can happen everywhere once the retention period ends?",
    });
  }
  if (children.length) {
    themes.push({
      risk: "Children's data — heightened DPDPA duty",
      pool: children,
      affectedData: uniq(children.map((r) => r.dataItem)),
      locationOrFlow: topStorage(children) || "Enrolment / account systems",
      reason: "Children's data requires verifiable parental consent and prohibits tracking or targeted advertising.",
      recommendedControl: "Add verifiable parental-consent capture and switch off any behavioural tracking for minors.",
      category: "Children",
      relatedDataItems: children.map((r) => r.id),
      relatedStorage: topStorage(children),
      suggestedMappingQuestion: "Where does children's data flow, and is verifiable parental consent captured before each use?",
    });
  }

  return themes.map((t, i) => {
    const severity = sevOf(t.pool);
    const priority = priorityFor(severity);
    const { pool, ...rest } = t;
    return { riskId: `risk:${i + 1}`, ...rest, severity, priority, mappingPriority: mappingPriorityFor(priority) };
  });
}

function buildActions(risks: RiskRow[]): DiscoveryRegister["actions"] {
  const effortFor = (c: RiskCategory): ActionItem["effort"] =>
    c === "Sharing" || c === "Vendor" ? "high" : c === "Governance" || c === "Retention" ? "medium" : "medium";
  const toAction = (r: RiskRow): ActionItem => ({
    action: r.recommendedControl,
    reason: r.reason,
    relatedRiskIds: [r.riskId],
    effort: effortFor(r.category),
  });
  const pick = (p: RiskPriority) => risks.filter((r) => r.priority === p).map(toAction).slice(0, 5);
  return { immediate: pick("Immediate"), days30: pick("High"), days90: pick("Medium") };
}

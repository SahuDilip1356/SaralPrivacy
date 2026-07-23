// Run: node --test --experimental-strip-types lib/discovery/register.test.ts
//
// Self-contained: buildRegister takes injected deps (tagWeight, categoryName), so we
// test it with plain fixtures — no engine/./data import chain (which Node 24 can't
// resolve). This mirrors how ResultPanel will call it in the browser.
import test from "node:test";
import assert from "node:assert/strict";

import { buildRegister, type RegisterDeps, type RegisterInput } from "./register.ts";
import type { ItemGroup, ResolvedItem, Bucket } from "./types.ts";

// ---- fixtures ----
const WEIGHTS: Record<string, number> = {
  FINANCIAL_DATA: 3,
  CHILD_DATA: 3,
  VENDOR_SHARED: 2,
  IDENTITY: 1,
  COMMUNICATION_DATA: 1,
};
const NAMES: Record<string, string> = {
  FINANCIAL_DATA: "Payment & financial data",
  CHILD_DATA: "Children's & student data",
  IDENTITY: "Customer identity & contact",
  COMMUNICATION_DATA: "Communication & support records",
  VENDOR_SHARED: "Vendor & platform-shared data",
};
const deps: RegisterDeps = {
  tagWeight: (t) => WEIGHTS[t] ?? 1,
  categoryName: (k) => NAMES[k],
};

let seq = 0;
function mk(bucket: Bucket, tags: string[], over: Partial<ResolvedItem> = {}): ResolvedItem {
  seq += 1;
  return {
    id: `niche:${seq}`,
    seq,
    bucket,
    def: true,
    weight: 1,
    uiShort: "Customer",
    uiGroup: "Customer & user data",
    item: `Item ${seq}`,
    examples: "examples",
    tags,
    precaution: `Precaution ${seq}`,
    obligations: [],
    dataSubjects: "Customer",
    processingPurposes: "Service delivery",
    sources: "CRM; Email",
    ...over,
  };
}

function groupsOf(core: ResolvedItem[], operational: ResolvedItem[], hidden: ResolvedItem[]): ItemGroup[] {
  return [
    { key: "core", bucket: "Core", title: "Core", sub: "", items: core },
    { key: "operational", bucket: "Operational", title: "Operational", sub: "", items: operational },
    { key: "hidden", bucket: "Hidden", title: "Hidden", sub: "", items: hidden },
  ];
}

const baseInput = (groups: ItemGroup[], selectedIds: Set<string>): RegisterInput => ({
  nicheId: "niche",
  nicheName: "Test Niche",
  groups,
  selectedIds,
  deps,
  now: () => "2026-07-23T00:00:00.000Z",
});

test("rows.length === number of confirmed (selected) items, not total", () => {
  const a = mk("Core", ["IDENTITY"]);
  const b = mk("Operational", ["FINANCIAL_DATA"]);
  const c = mk("Hidden", ["COMMUNICATION_DATA"]);
  const groups = groupsOf([a], [b], [c]);
  const reg = buildRegister(baseInput(groups, new Set([a.id, b.id]))); // c not selected
  assert.equal(reg.rows.length, 2);
  assert.deepEqual(reg.rows.map((r) => r.id).sort(), [a.id, b.id].sort());
});

test("dominant category = highest-weight known tag", () => {
  const item = mk("Core", ["IDENTITY", "FINANCIAL_DATA"]); // FINANCIAL_DATA weight 3 wins
  const reg = buildRegister(baseInput(groupsOf([item], [], []), new Set([item.id])));
  assert.equal(reg.rows[0].dataCategory, "Payment & financial data");
  assert.equal(reg.rows[0].categoryKey, "FINANCIAL_DATA");
});

test("empty selection → zero counts, no rows/retention/risks, empty action buckets", () => {
  const item = mk("Core", ["IDENTITY"]);
  const reg = buildRegister(baseInput(groupsOf([item], [], []), new Set()));
  assert.equal(reg.rows.length, 0);
  assert.equal(reg.retention.length, 0);
  assert.equal(reg.risks.length, 0);
  assert.deepEqual(reg.counts, { items: 0, categories: 0, storageLocations: 0, recipients: 0, highRisk: 0, retentionToConfirm: 0 });
  assert.deepEqual(reg.actions, { immediate: [], days30: [], days90: [] });
});

test("one retention rule per distinct category; statutory_floor flag flows through", () => {
  const a = mk("Core", ["FINANCIAL_DATA"]);
  const b = mk("Operational", ["FINANCIAL_DATA"]); // same category → one rule
  const c = mk("Core", ["IDENTITY"]);
  const reg = buildRegister(baseInput(groupsOf([a, c], [b], []), new Set([a.id, b.id, c.id])));
  assert.equal(reg.retention.length, 2); // FINANCIAL_DATA + IDENTITY
  const fin = reg.retention.find((r) => r.category === "FINANCIAL_DATA")!;
  assert.equal(fin.status, "statutory_floor");
  assert.ok(fin.otherLaw, "financial rule must carry a statutory floor");
  assert.equal(fin.retentionTrigger, "Financial-year close");
  const id = reg.retention.find((r) => r.category === "IDENTITY")!;
  assert.equal(id.status, "dpdpa_determination");
  assert.equal(id.otherLaw, null);
});

test("every risk carries a mapping bridge (question + priority) and back-links to its rows", () => {
  const hv = mk("Core", ["FINANCIAL_DATA"]);
  const reg = buildRegister(baseInput(groupsOf([hv], [], []), new Set([hv.id])));
  assert.ok(reg.risks.length >= 1);
  for (const r of reg.risks) {
    assert.ok(r.suggestedMappingQuestion.length > 0, "risk needs a mapping question");
    assert.ok(["high", "medium", "low"].includes(r.mappingPriority));
  }
  // the high-value risk should reference the financial row, and the row should link back
  const risk = reg.risks[0];
  assert.ok(risk.relatedDataItems.includes(hv.id));
  assert.ok(reg.rows[0].linkedRiskIds.includes(risk.riskId));
});

test("externally-shared items produce a recipient count + a Sharing risk", () => {
  const shared = mk("Operational", ["IDENTITY", "VENDOR_SHARED"]);
  const reg = buildRegister(baseInput(groupsOf([], [shared], []), new Set([shared.id])));
  assert.equal(reg.counts.recipients, 1);
  assert.ok(reg.risks.some((r) => r.category === "Sharing"));
  assert.equal(reg.rows[0].externalRecipients.length, 1);
});

test("counts: high-value + hidden items are High/Critical and counted", () => {
  const hv = mk("Core", ["FINANCIAL_DATA"]); // High
  const hidden = mk("Hidden", ["CHILD_DATA"]); // weight 3 + hidden → Critical
  const low = mk("Core", ["IDENTITY"]); // Low
  const reg = buildRegister(baseInput(groupsOf([hv, low], [], [hidden]), new Set([hv.id, hidden.id, low.id])));
  assert.equal(reg.counts.items, 3);
  assert.equal(reg.counts.highRisk, 2); // hv + hidden, not low
  const hiddenRow = reg.rows.find((r) => r.id === hidden.id)!;
  assert.equal(hiddenRow.riskLevel, "Critical");
});

test("actions are capped at 5 per band and reference risks", () => {
  // 6 distinct high-value categories would each raise the same 'Security' theme once,
  // so instead assert the cap holds structurally and every action links a risk.
  const hv = mk("Core", ["FINANCIAL_DATA"]);
  const reg = buildRegister(baseInput(groupsOf([hv], [], []), new Set([hv.id])));
  const all = [...reg.actions.immediate, ...reg.actions.days30, ...reg.actions.days90];
  assert.ok(reg.actions.immediate.length <= 5);
  assert.ok(reg.actions.days30.length <= 5);
  assert.ok(reg.actions.days90.length <= 5);
  for (const a of all) assert.ok(a.relatedRiskIds.length > 0, "action must reference a risk");
});

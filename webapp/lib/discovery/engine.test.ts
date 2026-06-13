// Run: node --test --experimental-strip-types lib/discovery/engine.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { band, confidenceLabel, itemWeight, resolveGroups, score } from "./engine.ts";
import { denormNiche, NICHES, ITEM_DEFS, NICHE_ITEMS, SCORING } from "./data.ts";
import { checklistFor } from "./checklist-map.ts";
import type { ResolvedItem } from "./types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDEN = JSON.parse(
  readFileSync(join(HERE, "..", "..", "tools", "data", "niche-items.golden.json"), "utf8"),
) as Record<string, unknown[]>;

// ---- Golden round-trip: dedup/ref normalization is lossless for all 276 niches ----
test("golden: denormalized items match the raw xlsx read for every niche", () => {
  const ids = Object.keys(GOLDEN);
  assert.equal(ids.length, 276, "expected 276 niches in golden fixture");
  for (const id of ids) {
    assert.deepEqual(denormNiche(id), GOLDEN[id], `mismatch for niche ${id}`);
  }
});

test("data integrity: counts and ref validity", () => {
  assert.equal(NICHES.length, 276);
  const totalRows = Object.values(NICHE_ITEMS).reduce((s, a) => s + a.length, 0);
  assert.equal(totalRows, 4771);
  // every ref points into ITEM_DEFS
  for (const refs of Object.values(NICHE_ITEMS)) {
    for (const r of refs) assert.ok(r.ref >= 0 && r.ref < ITEM_DEFS.length, "ref out of range");
  }
});

// ---- itemWeight: tags do NOT stack (max), times bucket multiplier ----
test("itemWeight: highest tag wins, bucket multiplier applied", () => {
  // HEALTH_DATA=4, IDENTITY=1 → max 4
  assert.equal(itemWeight(["HEALTH_DATA", "IDENTITY"], "Core"), 4 * 1.0);
  assert.equal(itemWeight(["HEALTH_DATA", "IDENTITY"], "Operational"), 4 * 1.2);
  assert.equal(itemWeight(["HEALTH_DATA", "IDENTITY"], "Hidden"), 4 * 1.5);
  // no tags → weight 1
  assert.equal(itemWeight([], "Core"), 1);
  // FINANCIAL_DATA=3 beats IDENTITY=1
  assert.equal(itemWeight(["IDENTITY", "FINANCIAL_DATA"], "Core"), 3);
});

// ---- band thresholds: <35 Low | <55 Moderate | <80 High | else Critical ----
test("band: threshold boundaries", () => {
  assert.equal(band(0), "Low");
  assert.equal(band(34.9), "Low");
  assert.equal(band(35), "Moderate");
  assert.equal(band(54.9), "Moderate");
  assert.equal(band(55), "High");
  assert.equal(band(79.9), "High");
  assert.equal(band(80), "Critical");
  assert.equal(band(100), "Critical");
});

// ---- confidence: share of not-sure answers <0.1 High | <0.25 Medium | else Low ----
test("confidenceLabel: buckets", () => {
  assert.equal(confidenceLabel(0), "High");
  assert.equal(confidenceLabel(1 / 3), "Low"); // one "not sure" of three
  assert.equal(confidenceLabel(0.2), "Medium");
  assert.equal(confidenceLabel(1), "Low");
});

// ---- score: empty selection ----
test("score: empty selection is zero / Low / empty", () => {
  const r = score("d2c-brands", new Set(), {});
  assert.equal(r.raw, 0);
  assert.equal(r.normalized, 0);
  assert.equal(r.final, 0);
  assert.equal(r.riskBand, "Low");
  assert.equal(r.selectedCount, 0);
  assert.deepEqual(r.categories, []);
  assert.deepEqual(r.obligations, []);
  assert.deepEqual(r.precautions, []);
});

const allIds = (nicheId: string) =>
  new Set(resolveGroups(nicheId).flatMap((g: { items: ResolvedItem[] }) => g.items.map((i) => i.id)));

// ---- score: control multiplier is capped at 1.5 ----
test("score: control multiplier respects the 1.5 cap", () => {
  // worst case: q1 no 1.25 * q2 yes 1.15 * q3 no 1.20 = 1.725 → capped to 1.5
  const r = score("d2c-brands", allIds("d2c-brands"), { q1: "no", q2: "yes", q3: "no" });
  assert.equal(r.control, SCORING.controlCap);
  assert.ok(r.final <= 100, "final never exceeds 100");
});

// ---- score: all "not sure" → Low confidence, notSure=3 ----
test("score: all not-sure yields Low confidence", () => {
  const r = score("d2c-brands", allIds("d2c-brands"), { q1: "notsure", q2: "notsure", q3: "notsure" });
  assert.equal(r.notSure, 3);
  assert.equal(r.confidence, "Low");
});

// ---- score: a clean operator (all yes) scores no higher than an unsure one ----
test("score: stronger controls lower the score", () => {
  const sel = allIds("d2c-brands");
  const good = score("d2c-brands", sel, { q1: "yes", q2: "no", q3: "yes" });
  const bad = score("d2c-brands", sel, { q1: "no", q2: "yes", q3: "no" });
  assert.ok(good.final < bad.final, "documented controls reduce risk");
  assert.ok(good.control < 1 && bad.control > 1);
});

// ---- score: precautions deduped and capped at 5; obligations ordered subset ----
test("score: precautions ≤5 unique; obligations ordered & valid", () => {
  const r = score("d2c-brands", allIds("d2c-brands"), { q1: "no", q2: "yes", q3: "no" });
  assert.ok(r.precautions.length <= 5);
  assert.equal(new Set(r.precautions).size, r.precautions.length, "precautions unique");
  // fixCount = full deduped set ≥ shown top-5; highValueCount within selected bounds
  assert.ok(r.fixCount >= r.precautions.length, "fixCount is the full deduped set");
  assert.ok(r.highValueCount >= 0 && r.highValueCount <= r.selectedCount, "highValueCount within bounds");
  const order = ["Notice", "Consent", "Security safeguards", "Retention & erasure", "Vendor controls", "Children (verifiable consent)"];
  let last = -1;
  for (const o of r.obligations) {
    const idx = order.indexOf(o);
    assert.ok(idx > last, "obligations in canonical order");
    last = idx;
  }
});

// ---- resolveGroups: unknown niche is empty (guards the UI) ----
test("resolveGroups: unknown niche returns []", () => {
  assert.deepEqual(resolveGroups("not-a-real-niche"), []);
  assert.deepEqual(denormNiche("not-a-real-niche"), []);
});

// ---- checklist-map ----
test("checklistFor: dedicated packs, category defaults, generic fallback", () => {
  assert.equal(checklistFor("ca-firms").slug, "ca-firm");
  assert.equal(checklistFor("ca-firms").dedicated, true);
  assert.equal(checklistFor("law-firms").slug, "law-firm");
  assert.equal(checklistFor("schools").slug, "school-college");
  assert.equal(checklistFor("training-institutes").slug, "training-institute");
  assert.equal(checklistFor("recruitment-staffing").slug, "recruitment-agency");
  assert.equal(checklistFor("d2c-brands").slug, "d2c-brand"); // retail default
  // manufacturing niche → no override, no category default → generic
  const generic = checklistFor("pharma-chemical-mfg");
  assert.equal(generic.slug, null);
  assert.equal(generic.dedicated, false);
  assert.equal(generic.pdfPath, "/templates/dpdpa-starter-checklist.pdf");
});

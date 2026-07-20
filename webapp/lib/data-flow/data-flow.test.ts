// Gate 2 completeness tests - Recruitment Personal Data Flow pack.
// Run: node --test --experimental-strip-types lib/data-flow/data-flow.test.ts
// Minimums from docs/SaralPrivacy_Recruitment_DataFlow_Spec_v1.1_Build_Addendum.md §F.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  ASSESSMENT_BUCKETS,
  BOUNDARIES,
  EXTERNAL_BOUNDARIES,
  computePackSummary,
  dataFlowPackSchema,
  filterByBusinessModel,
  validatePack,
} from "./schemas.ts";
import { stageDataRollup } from "./stage-data.ts";
import { recruitmentDataFlowPack as pack } from "../data/data-flow/recruitment/index.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

test("schema: pack parses against the Zod contract", () => {
  const parsed = dataFlowPackSchema.safeParse(pack);
  assert.ok(
    parsed.success,
    parsed.success ? "ok" : JSON.stringify(parsed.error.issues, null, 2),
  );
});

test("referential integrity: no orphans, no drift, consistent boundaries", () => {
  const issues = validatePack(pack);
  assert.deepEqual(issues, []);
});

test("gate 2 minimums (v1.1 §F)", () => {
  assert.equal(pack.stages.length, 12, "12 lifecycle stages");
  assert.ok(pack.nodes.length >= 28, `nodes >= 28 (got ${pack.nodes.length})`);
  assert.ok(pack.edges.length >= 40, `edges >= 40 (got ${pack.edges.length})`);

  const copies = pack.edges.filter((e) => e.createsCopy).length;
  assert.ok(copies >= 12, `copy-creating edges >= 12 (got ${copies})`);

  const external = pack.edges.filter((e) => e.external).length;
  assert.ok(external >= 10, `external edges >= 10 (got ${external})`);

  assert.equal(pack.hotspots.length, 7, "exactly 7 curated hotspots");
  assert.equal(pack.dataCategories.length, 11, "11 data groups (spec §8 A–K)");
  assert.ok(
    pack.dataCategories.some((c) => c.kind === "derived"),
    "derived/inferred category present",
  );
});

test("gate 2: mandatory shadow-IT surfaces present and treated as risks", () => {
  const required = [
    "personal-whatsapp",
    "excel-tracker",
    "recruiter-laptop",
    "ai-screener",
    "cloud-backup",
  ];
  for (const id of required) {
    const node = pack.nodes.find((n) => n.id === id);
    assert.ok(node, `required node ${id} exists`);
    assert.ok(
      node.riskLevel === "high" || node.riskLevel === "critical",
      `${id} is high/critical (got ${node.riskLevel})`,
    );
    assert.ok(node.riskWhy && node.riskAction, `${id} explains why + action`);
  }
});

test("business models: permanent hides employee lifecycle, staffing shows it", () => {
  const permanent = filterByBusinessModel(pack, "permanent");
  assert.equal(permanent.stages.length, 10, "permanent shows 10 stages");
  assert.ok(!permanent.nodes.some((n) => n.id === "hrms"), "no HRMS for permanent");
  assert.ok(!permanent.edges.some((e) => e.stageId === "onboarding"));

  const staffing = filterByBusinessModel(pack, "staffing");
  assert.equal(staffing.stages.length, 12, "staffing shows all 12 stages");
  assert.ok(staffing.nodes.some((n) => n.id === "payroll-provider"));

  // Projection never leaks dangling edges.
  for (const model of ["permanent", "staffing"] as const) {
    const view = filterByBusinessModel(pack, model);
    const ids = new Set(view.nodes.map((n) => n.id));
    for (const e of view.edges) {
      assert.ok(ids.has(e.source) && ids.has(e.target), `${model}: edge ${e.id} intact`);
    }
  }
});

test("hotspots: canonical 7 map to real assessment pack buckets", () => {
  // Drift guard against lib/data/industry-assessment/packs/recruitment-agencies.ts
  // (read as source: the pack module itself uses extensionless imports that
  // plain `node --test` cannot resolve).
  const packSource = readFileSync(
    join(HERE, "..", "data", "industry-assessment", "packs", "recruitment-agencies.ts"),
    "utf8",
  );
  for (const bucket of ASSESSMENT_BUCKETS) {
    assert.ok(
      packSource.includes(`key: "${bucket}"`),
      `assessment pack still defines bucket "${bucket}"`,
    );
  }
  const used = new Set(pack.hotspots.map((h) => h.assessmentBucket));
  assert.ok(used.size >= 4, "hotspots cover at least 4 of the 5 buckets");
});

test("discovery alignment: category wording matches the recruitment-staffing niche", () => {
  const golden = JSON.parse(
    readFileSync(join(HERE, "..", "..", "tools", "data", "niche-items.golden.json"), "utf8"),
  ) as Record<string, Array<{ item: string }>>;
  const nicheItems = new Set(golden[pack.discoveryNicheId].map((i) => i.item));
  for (const cat of pack.dataCategories) {
    for (const ref of cat.discoveryItems ?? []) {
      assert.ok(nicheItems.has(ref), `"${ref}" (${cat.id}) is a real niche item`);
    }
  }
});

// The journey counter shows "places their data now lives" and the stage cards
// show the systems reached at that stage. They are the same fact, so they must
// reconcile: every non-person node must land in exactly one in-model stage.
// If a node's stageIds ever drift out of the model's stage set it becomes an
// orphan - invisible in the boxes but still real - and the counter under-reads.
test("places reconcile: every system is counted once, at exactly one stage", () => {
  for (const model of ["permanent", "staffing"] as const) {
    const { stages, nodes } = filterByBusinessModel(pack, model);
    const seq = new Map(stages.map((s) => [s.id, s.sequence]));
    const systems = nodes.filter((n) => n.nodeType !== "person");

    const placed = systems.filter((n) => n.stageIds.some((id) => seq.has(id)));
    assert.equal(
      placed.length,
      systems.length,
      `${model}: every system reaches a stage shown in this model (no orphans)`,
    );

    const perStage = new Map<string, number>();
    for (const n of systems) {
      const first = n.stageIds
        .filter((id) => seq.has(id))
        .sort((a, b) => seq.get(a)! - seq.get(b)!)[0];
      perStage.set(first, (perStage.get(first) ?? 0) + 1);
    }
    const total = [...perStage.values()].reduce((a, b) => a + b, 0);
    assert.equal(total, systems.length, `${model}: running total equals distinct places`);
  }
});

test("ATS is in play from sourcing, where its first copies actually land", () => {
  const ats = pack.nodes.find((n) => n.id === "ats");
  assert.ok(ats, "ats node exists");
  const arrivesAt = new Set(pack.edges.filter((e) => e.target === "ats").map((e) => e.stageId));
  for (const stageId of arrivesAt) {
    assert.ok(
      ats.stageIds.includes(stageId),
      `ats.stageIds covers "${stageId}", where an edge delivers data to it`,
    );
  }
});

// The boundary taxonomy gained `third-party` when two nodes were reclassified:
// LinkedIn (genuinely a public source) was tagged `vendor`, and past employers /
// universities (a private outbound disclosure) were the only node tagged
// `public`. They were effectively swapped. These guard the correction and the
// invariant that a new boundary must be explicitly placed inside or outside.
test("boundary taxonomy: external is a subset of boundaries, and complete", () => {
  for (const b of EXTERNAL_BOUNDARIES) {
    assert.ok(BOUNDARIES.includes(b), `"${b}" is a real boundary`);
  }
  const internal = BOUNDARIES.filter((b) => !EXTERNAL_BOUNDARIES.includes(b));
  assert.deepEqual(
    [...internal].sort(),
    ["agency", "candidate"],
    "only candidate + agency are internal - a new boundary must pick a side",
  );
});

test("boundary content: LinkedIn is a public source, references are a third party", () => {
  const byId = new Map(pack.nodes.map((n) => [n.id, n]));
  assert.equal(byId.get("linkedin")?.boundary, "public");
  assert.equal(byId.get("reference-sources")?.boundary, "third-party");
});

// Pinned exactly, not `>=`: this is what proves the reclassification moved no
// numbers on /data-mapping or the recruitment teaser card, both of which count
// external parties via EXTERNAL_BOUNDARIES.
test("external-party count is unchanged by the boundary reclassification", () => {
  assert.equal(computePackSummary(pack).externalParties, 15);
});

test("stage data: every stage moves at least one data category, in both models", () => {
  for (const model of ["permanent", "staffing"] as const) {
    for (const row of stageDataRollup(pack, model)) {
      assert.ok(
        row.moving.length > 0,
        `${model}/${row.stageId} has data moving (an empty "Moving here" row would render)`,
      );
    }
  }
});

// The "new at this stage" emphasis depends on this: a category is introduced
// exactly once, and between them the stages introduce everything reachable.
test("stage data: first appearance covers every reachable category exactly once", () => {
  for (const model of ["permanent", "staffing"] as const) {
    const rows = stageDataRollup(pack, model);
    const introduced: string[] = [];
    for (const r of rows) introduced.push(...r.newIds);
    assert.equal(
      introduced.length,
      new Set(introduced).size,
      `${model}: no category is introduced twice`,
    );
    const reachable = new Set(rows.flatMap((r) => r.moving.map((c) => c.id)));
    assert.deepEqual(
      [...introduced].sort(),
      [...reachable].sort(),
      `${model}: everything that moves is introduced somewhere`,
    );
  }
});

test("reference summary is computed, plausible and self-consistent", () => {
  const s = computePackSummary(pack);
  assert.equal(s.stages, 12);
  assert.ok(s.systems >= 27, "systems/repos counted");
  assert.ok(s.externalParties >= 8, "external parties counted");
  assert.equal(s.copyEvents, pack.edges.filter((e) => e.createsCopy).length);
  assert.equal(s.externalTransfers, pack.edges.filter((e) => e.external).length);
});

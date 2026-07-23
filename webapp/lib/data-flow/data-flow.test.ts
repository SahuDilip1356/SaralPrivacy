// Data Flow pack tests - two tiers.
// Run: node --test --experimental-strip-types lib/data-flow/data-flow.test.ts
//
//  TIER 1 (UNIVERSAL) loops over every pack in PACKS: framework guarantees that
//  MUST hold for any industry. A new map is added to PACKS with one line and
//  inherits all of them automatically - this is the map-#2..#12 safety net.
//
//  TIER 2 (recruitment-specific) pins exact content of the reference map: node
//  ids, counts, permanent/staffing specifics, discovery-golden wording. Each
//  industry owns its own content assertions; these stay bound to recruitment.
//
// Minimums from docs/SaralPrivacy_Recruitment_DataFlow_Spec_v1.1_Build_Addendum.md §F.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  BOUNDARIES,
  EXTERNAL_BOUNDARIES,
  type DataFlowPack,
  computePackSummary,
  dataFlowPackSchema,
  filterByBusinessModel,
  validatePack,
} from "./schemas.ts";
import { stageDataRollup } from "./stage-data.ts";
import { recruitmentDataFlowPack } from "../data/data-flow/recruitment/index.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

// Every live pack. Add a map here and it inherits every TIER 1 guarantee below.
// (Imported directly rather than via the registry, whose sectors.ts chain uses
//  extensionless imports that plain `node --test` cannot resolve.)
const PACKS: DataFlowPack[] = [recruitmentDataFlowPack];

/** Business-model ids a pack declares - the values its own views are keyed by. */
const modelsOf = (p: DataFlowPack) => p.businessModels.map((m) => m.id);

// The reference map, for the recruitment-specific tier.
const pack = recruitmentDataFlowPack;

// ---------------------------------------------------------------------------
// TIER 1 - universal framework guarantees, per pack
// ---------------------------------------------------------------------------

for (const p of PACKS) {
  test(`[${p.industry}] schema: pack parses against the Zod contract`, () => {
    const parsed = dataFlowPackSchema.safeParse(p);
    assert.ok(
      parsed.success,
      parsed.success ? "ok" : JSON.stringify(parsed.error.issues, null, 2),
    );
  });

  test(`[${p.industry}] referential integrity: no orphans, no drift, consistent boundaries`, () => {
    assert.deepEqual(validatePack(p), []);
  });

  test(`[${p.industry}] hotspots: exactly 7, ranked 1..7`, () => {
    assert.equal(p.hotspots.length, 7, "exactly 7 curated hotspots");
    assert.deepEqual(
      p.hotspots.map((h) => h.rank).sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7],
      "ranks are exactly 1..7",
    );
    // Every hotspot bucket is one the pack declares (guards the silent
    // deep-link-to-nowhere failure that a wrong bucket would cause).
    const buckets = new Set(p.assessmentBuckets);
    for (const h of p.hotspots) {
      assert.ok(buckets.has(h.assessmentBucket), `${h.id} bucket in pack.assessmentBuckets`);
    }
  });

  test(`[${p.industry}] business models: projection leaks no dangling edges`, () => {
    for (const model of modelsOf(p)) {
      const view = filterByBusinessModel(p, model);
      const ids = new Set(view.nodes.map((n) => n.id));
      for (const e of view.edges) {
        assert.ok(ids.has(e.source) && ids.has(e.target), `${model}: edge ${e.id} intact`);
      }
    }
  });

  test(`[${p.industry}] places reconcile: every system counted once, at one stage`, () => {
    for (const model of modelsOf(p)) {
      const { stages, nodes } = filterByBusinessModel(p, model);
      const seq = new Map(stages.map((s) => [s.id, s.sequence]));
      const systems = nodes.filter((n) => n.nodeType !== "person");

      const placed = systems.filter((n) => n.stageIds.some((id) => seq.has(id)));
      assert.equal(placed.length, systems.length, `${model}: no orphan systems`);

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

  test(`[${p.industry}] stage data: every stage moves >=1 category; introduced once`, () => {
    for (const model of modelsOf(p)) {
      const rows = stageDataRollup(p, model);
      for (const row of rows) {
        assert.ok(row.moving.length > 0, `${model}/${row.stageId} has data moving`);
      }
      const introduced: string[] = [];
      for (const r of rows) introduced.push(...r.newIds);
      assert.equal(introduced.length, new Set(introduced).size, `${model}: no category introduced twice`);
      const reachable = new Set(rows.flatMap((r) => r.moving.map((c) => c.id)));
      assert.deepEqual(
        [...introduced].sort(),
        [...reachable].sort(),
        `${model}: everything that moves is introduced somewhere`,
      );
    }
  });

  test(`[${p.industry}] reference summary is computed and self-consistent`, () => {
    const s = computePackSummary(p);
    assert.equal(s.stages, p.stages.length);
    assert.equal(s.copyEvents, p.edges.filter((e) => e.createsCopy).length);
    assert.equal(s.externalTransfers, p.edges.filter((e) => e.external).length);
  });
}

// ---------------------------------------------------------------------------
// TIER 2 - recruitment-specific content (the reference map's exact shape)
// ---------------------------------------------------------------------------

test("gate 2 minimums (v1.1 §F)", () => {
  assert.equal(pack.stages.length, 12, "12 lifecycle stages");
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
  // (projection-leak invariant is covered universally in TIER 1)
});

test("hotspots: canonical 7 map to real assessment pack buckets", () => {
  // Drift guard against lib/data/industry-assessment/packs/recruitment-agencies.ts
  // (read as source: the pack module itself uses extensionless imports that
  // plain `node --test` cannot resolve).
  const packSource = readFileSync(
    join(HERE, "..", "data", "industry-assessment", "packs", "recruitment-agencies.ts"),
    "utf8",
  );
  for (const bucket of pack.assessmentBuckets) {
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

// (places-reconcile invariant is covered universally in TIER 1)

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

// (stage-data invariants are covered universally in TIER 1)

test("recruitment reference summary hits its expected magnitudes", () => {
  const s = computePackSummary(pack);
  assert.equal(s.stages, 12);
  assert.ok(s.systems >= 27, "systems/repos counted");
  assert.ok(s.externalParties >= 8, "external parties counted");
});

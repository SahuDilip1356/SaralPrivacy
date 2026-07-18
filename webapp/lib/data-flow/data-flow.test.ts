// Gate 2 completeness tests — Recruitment Personal Data Flow pack.
// Run: node --test --experimental-strip-types lib/data-flow/data-flow.test.ts
// Minimums from docs/SaralPrivacy_Recruitment_DataFlow_Spec_v1.1_Build_Addendum.md §F.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  ASSESSMENT_BUCKETS,
  computePackSummary,
  dataFlowPackSchema,
  filterByBusinessModel,
  validatePack,
} from "./schemas.ts";
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
  for (const model of ["permanent", "staffing", "rpo", "executive_search"] as const) {
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

test("reference summary is computed, plausible and self-consistent", () => {
  const s = computePackSummary(pack);
  assert.equal(s.stages, 12);
  assert.ok(s.systems >= 27, "systems/repos counted");
  assert.ok(s.externalParties >= 8, "external parties counted");
  assert.equal(s.copyEvents, pack.edges.filter((e) => e.createsCopy).length);
  assert.equal(s.externalTransfers, pack.edges.filter((e) => e.external).length);
});

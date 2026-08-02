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
import { readFileSync, readdirSync } from "node:fs";
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
import { caFirmsDataFlowPack } from "../data/data-flow/ca-firms/index.ts";
import { trainingInstitutesDataFlowPack } from "../data/data-flow/training-institutes/index.ts";
import { d2cBrandsDataFlowPack } from "../data/data-flow/d2c-brands/index.ts";
import { clinicsDiagnosticLabsDataFlowPack } from "../data/data-flow/clinics-diagnostic-labs/index.ts";
import { schoolsCollegesDataFlowPack } from "../data/data-flow/schools-colleges/index.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

// Every live pack. Add a map here and it inherits every TIER 1 guarantee below.
// (Imported directly rather than via the registry, whose sectors.ts chain uses
//  extensionless imports that plain `node --test` cannot resolve.)
const PACKS: DataFlowPack[] = [
  recruitmentDataFlowPack,
  caFirmsDataFlowPack,
  trainingInstitutesDataFlowPack,
  d2cBrandsDataFlowPack,
  clinicsDiagnosticLabsDataFlowPack,
  schoolsCollegesDataFlowPack,
];

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

  test(`[${p.industry}] hotspots: 5-8 curated, ranked contiguously`, () => {
    assert.ok(
      p.hotspots.length >= 5 && p.hotspots.length <= 8,
      `5-8 curated hotspots (got ${p.hotspots.length})`,
    );
    assert.deepEqual(
      p.hotspots.map((h) => h.rank).sort((a, b) => a - b),
      p.hotspots.map((_, i) => i + 1),
      "ranks are contiguous 1..N",
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
// TIER 1 - the hotspot reconciliation invariant
// ---------------------------------------------------------------------------
//
// THE DEFECT THIS PREVENTS. The journey paints one red flag per DISTINCT stage a
// hotspot's node resolves to - where a node resolves to the first of its
// stageIds visible in the selected model, and a node with no visible stage is
// skipped silently. The counter and legend, however, print
// `pack.hotspots.length`, which is pack-level and never filtered. So a reader
// counts five red flags while the sentence underneath says seven.
//
// Two ways to break it, both seen in the wild:
//   COLLISION      - two hotspot nodes share a first stage (was ca-firms,
//                    recruitment-agencies)
//   DISAPPEARANCE  - a hotspot node is model-gated away, so it renders no flag
//                    in that model at all (training-institutes)
//
// THE CONSTRUCTION THAT SATISFIES IT: every hotspot node ungated, and its
// EARLIEST stage a distinct all-model stage. Spanning later stages is fine - the
// ERP genuinely does - but a hotspot node must never acquire a stage earlier
// than its designated one.
//
// This is asserted as a SET rather than per pack on purpose. `training-institutes`
// still carries known debt (2 of its 3 models), and fixing it means rewriting
// four hotspots' copy - a content decision, not a mechanical one. Expressing the
// exception this way means:
//   - a NEW pack that breaks the invariant fails this test           ✅
//   - training-institutes being FIXED also fails this test, forcing the
//     entry to be removed rather than quietly rotting                ✅
// Debt is documented in docs/SaralPrivacy_TrainingInstitutes_DataFlow_Spec.md.
// ---------------------------------------------------------------------------
// TIER 1 - hotspot deep-links must actually land somewhere
// ---------------------------------------------------------------------------
//
// Every hotspot links to `${assessmentRoute}?from=data-flow&bucket=<key>`, and
// the assessment client is supposed to read that and show a focus banner. When
// it does not, the failure is SILENT: the link lands, the banner never renders,
// nothing errors, and nobody notices. `ca-firms` shipped that way and it was
// only found by hand-checking every pack.
//
// `validatePack` already guarantees a hotspot's bucket is one of the pack's own
// `assessmentBuckets`. What it cannot see is the CLIENT, so this checks the file:
// the assessment client must read the query param, and must name every bucket
// the pack can send it.
test("hotspot deep-links resolve: every assessment client handles ?bucket=", () => {
  const problems: string[] = [];

  for (const p of PACKS) {
    const folder = p.assessmentRoute.replace(/^\/assessment\//, "");
    const dir = join(HERE, "../../app/assessment", folder);

    let clients: string[];
    try {
      clients = readdirSync(dir).filter((f) => f.endsWith("Client.tsx"));
    } catch {
      problems.push(`${p.industry}: no assessment folder at app/assessment/${folder}`);
      continue;
    }
    if (clients.length === 0) {
      problems.push(`${p.industry}: no *Client.tsx in app/assessment/${folder}`);
      continue;
    }

    const src = clients.map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
    if (!src.includes("useSearchParams")) {
      problems.push(`${p.industry}: client never reads the query string - ?bucket= is ignored`);
      continue;
    }
    const missing = p.assessmentBuckets.filter((b) => !src.includes(b));
    if (missing.length) {
      problems.push(`${p.industry}: client has no focus label for bucket(s) ${missing.join(", ")}`);
    }

    // useSearchParams without a Suspense boundary fails `next build`.
    const page = readFileSync(join(dir, "page.tsx"), "utf8");
    if (!page.includes("Suspense")) {
      problems.push(`${p.industry}: client uses useSearchParams but page.tsx has no <Suspense> - next build will fail`);
    }
  }

  assert.deepEqual(problems, [], `hotspot deep-links that go nowhere:\n  ${problems.join("\n  ")}`);
});

const KNOWN_HOTSPOT_DEBT = ["training-institutes"];

test("hotspots reconcile with the counter in every model of every pack", () => {
  const failing: string[] = [];

  for (const p of PACKS) {
    const nodeById = new Map(p.nodes.map((n) => [n.id, n]));
    for (const model of modelsOf(p)) {
      const { stages, nodes } = filterByBusinessModel(p, model);
      const seq = new Map(stages.map((s) => [s.id, s.sequence]));
      const visible = new Set(nodes.map((n) => n.id));

      const flagged = new Set(
        p.hotspots
          .filter((h) => visible.has(h.nodeId))
          .map((h) =>
            nodeById
              .get(h.nodeId)!
              .stageIds.filter((id) => seq.has(id))
              .sort((a, b) => seq.get(a)! - seq.get(b)!)[0],
          )
          .filter(Boolean),
      );

      if (flagged.size !== p.hotspots.length) {
        failing.push(`${p.industry} [${model}]: ${flagged.size} flags vs ${p.hotspots.length} hotspots`);
      }
    }
  }

  const failingPacks = [...new Set(failing.map((f) => f.split(" ")[0]))].sort();
  assert.deepEqual(
    failingPacks,
    [...KNOWN_HOTSPOT_DEBT].sort(),
    `hotspot reconciliation changed.\n` +
      `  Expected exactly these packs to carry known debt: ${KNOWN_HOTSPOT_DEBT.join(", ") || "(none)"}\n` +
      `  Actually failing:\n    ${failing.join("\n    ") || "(none)"}\n` +
      `  If you FIXED a pack, remove it from KNOWN_HOTSPOT_DEBT.\n` +
      `  If you BROKE one, every hotspot node must be ungated and start at a distinct all-model stage.`,
  );
});

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

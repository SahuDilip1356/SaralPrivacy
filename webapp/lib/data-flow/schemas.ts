// Personal Data Flow Map - shared schemas and types.
//
// Contract (spec: docs/SaralPrivacy_Recruitment_DataFlow_Spec.md §11–12, trimmed
// per v1.1 addendum): only fields a P0/P1 view actually renders. Domain content
// lives in lib/data/data-flow/<industry>/ as TypeScript config validated by
// these schemas at test time - never hard-coded in components.
//
// Adding an industry later = new config folder only; nothing here changes.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

// Two honest journeys: permanent (candidate becomes the client's employee — no
// employee-lifecycle data) vs staffing (the agency employs & deploys — adds
// onboarding/exit, payroll, statutory data). RPO folds into staffing and
// executive search into permanent, because for data purposes they're identical
// to those two — so we don't offer buttons that render the same page.
export const BUSINESS_MODELS = ["permanent", "staffing"] as const;
export type BusinessModel = (typeof BUSINESS_MODELS)[number];

/** Organisational trust boundary a node lives in (spec §13).
 *
 *  `third-party` is for organisations that receive personal data WITHOUT a
 *  processing contract - past employers and universities contacted during
 *  verification, for example. They are not vendors (nothing is processed on
 *  our instructions) and they are certainly not `public`: nothing about the
 *  disclosure is publicly available. `public` is reserved for genuinely open
 *  sources - profiles, directories, registers - where data is COLLECTED rather
 *  than disclosed. The distinction matters because the fix differs: a vendor
 *  needs a contract, a third party needs minimisation and a protected channel. */
export const BOUNDARIES = [
  "candidate",
  "agency",
  "client",
  "vendor",
  "government",
  "third-party",
  "public",
] as const;
export type Boundary = (typeof BOUNDARIES)[number];

/** Boundaries that make a transfer "external" - data outside agency control. */
export const EXTERNAL_BOUNDARIES: readonly Boundary[] = [
  "client",
  "vendor",
  "government",
  "third-party",
  "public",
];

export const NODE_TYPES = [
  "person",
  "system",
  "repository",
  "device",
  "physical_storage",
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const EDGE_ACTIONS = [
  "collect",
  "create",
  "view",
  "edit",
  "copy",
  "download",
  "upload",
  "share",
  "export",
  "print",
  "archive",
  "delete",
] as const;
export type EdgeAction = (typeof EDGE_ACTIONS)[number];

export const EDGE_CHANNELS = [
  "web_form",
  "api",
  "email",
  "whatsapp",
  "file_upload",
  "shared_link",
  "manual_entry",
  "spreadsheet",
  "physical",
  "system_sync",
] as const;
export type EdgeChannel = (typeof EDGE_CHANNELS)[number];

/**
 * Assessment bucket keys are declared PER PACK (`pack.assessmentBuckets`), not
 * globally: every industry's assessment scores different things. Recruitment's
 * five and CA's five have zero overlap, so a global enum would either fail
 * typecheck on a correct CA bucket or - worse - compile with a recruitment one
 * and deep-link to a section the CA assessment cannot match, silently killing
 * the focus banner on every hotspot. `validatePack` enforces membership against
 * the pack's own list, and the pack test asserts each key exists in the live
 * assessment pack (drift guard).
 */
const bucketKeySchema = z.string().regex(/^[a-z0-9_]+$/, "bucket keys are snake_case");

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const idSchema = z.string().regex(/^[a-z0-9-]+$/, "ids are kebab-case");

/** `businessModels` omitted = applies to every business model. */
const businessModelsSchema = z.array(z.enum(BUSINESS_MODELS)).min(1).optional();

export const flowStageSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  sequence: z.number().int().positive(),
  summary: z.string().min(1),
  /** Plain-English DPDPA obligation shown by the overlay (spec §27 register). */
  dpdpaNote: z.string().min(1),
  businessModels: businessModelsSchema,
});
export type FlowStage = z.infer<typeof flowStageSchema>;

export const dataCategorySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  /** Derived/inferred data must be visually distinct from provided (spec §8K). */
  kind: z.enum(["provided", "derived"]),
  examples: z.array(z.string().min(1)).min(1),
  /** Exact item wording from the Discovery `recruitment-staffing` niche. */
  discoveryItems: z.array(z.string().min(1)).optional(),
});
export type DataCategory = z.infer<typeof dataCategorySchema>;

export const flowPersonaSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  boundary: z.enum(BOUNDARIES),
  description: z.string().min(1),
});
export type FlowPersona = z.infer<typeof flowPersonaSchema>;

export const flowNodeSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  nodeType: z.enum(NODE_TYPES),
  boundary: z.enum(BOUNDARIES),
  /** Stages where this node participates; drives process-journey placement. */
  stageIds: z.array(idSchema).min(1),
  description: z.string().min(1),
  dataCategoryIds: z.array(idSchema).min(1),
  accessPersonaIds: z.array(idSchema).min(1),
  /** Personal/unmanaged/unapproved surface (WhatsApp, Excel, laptop, AI tool). */
  shadowIt: z.boolean().optional(),
  retentionDefined: z.boolean(),
  riskLevel: z.enum(RISK_LEVELS),
  /** Required for high/critical (enforced by validatePack): why + one action. */
  riskWhy: z.string().min(1).optional(),
  riskAction: z.string().min(1).optional(),
  businessModels: businessModelsSchema,
});
export type FlowNode = z.infer<typeof flowNodeSchema>;

export const flowEdgeSchema = z.object({
  id: idSchema,
  source: idSchema,
  target: idSchema,
  stageId: idSchema,
  action: z.enum(EDGE_ACTIONS),
  channel: z.enum(EDGE_CHANNELS),
  /** Why this movement happens, in plain business language. */
  purpose: z.string().min(1),
  dataCategoryIds: z.array(idSchema).min(1),
  /** Duplicate record comes into existence at the target (copy tally + view). */
  createsCopy: z.boolean(),
  /** Data touches a boundary outside agency control (external-sharing view). */
  external: z.boolean(),
  riskLevel: z.enum(RISK_LEVELS),
  businessModels: businessModelsSchema,
});
export type FlowEdge = z.infer<typeof flowEdgeSchema>;

export const flowHotspotSchema = z.object({
  id: idSchema,
  /** 1–7; the canonical seven of v1.1 addendum §G, ranked worst-first. */
  rank: z.number().int().min(1).max(7),
  nodeId: idSchema,
  title: z.string().min(1),
  whatHappens: z.string().min(1),
  whyItMatters: z.string().min(1),
  dataCategoryIds: z.array(idSchema).min(1),
  action: z.string().min(1),
  /** Must be one of the owning pack's `assessmentBuckets` (checked in validatePack). */
  assessmentBucket: bucketKeySchema,
});
export type FlowHotspot = z.infer<typeof flowHotspotSchema>;

/**
 * Layer 1 of the industry standard: WHOSE data this map follows, plus the nouns
 * the shared components use to talk about them. Without this the components
 * render recruitment's words ("Candidate", "your agency") on every industry -
 * visibly wrong the moment a second map exists.
 *
 * `boundaryLabels` overrides BOUNDARY_META per pack; omitted keys fall back to
 * the shared default, so an industry only names what genuinely differs.
 */
export const flowLexiconSchema = z.object({
  /** Singular, lowercase, used mid-sentence: "candidate" / "client". */
  subject: z.string().min(1),
  /** The thing being followed: "One candidate's CV" / "One client's documents". */
  subjectArtefact: z.string().min(1),
  /** The business, used as "outside your ___": "agency" / "firm". */
  org: z.string().min(1),
});
export type FlowLexicon = z.infer<typeof flowLexiconSchema>;

export const dataFlowPackSchema = z.object({
  industry: idSchema,
  title: z.string().min(1),
  /** Layer 1 - the human this map follows, as shown in the header. */
  mainActor: z.string().min(1),
  lexicon: flowLexiconSchema,
  /** Per-pack boundary label overrides; unset keys use BOUNDARY_META. */
  boundaryLabels: z.record(z.enum(BOUNDARIES), z.string().min(1)).optional(),
  /** Reference-model banner - never present metrics as the user's own data. */
  disclaimer: z.string().min(1),
  assessmentRoute: z.string().startsWith("/"),
  /** This industry's assessment bucket keys - the only values its hotspots may use. */
  assessmentBuckets: z.array(bucketKeySchema).min(1),
  discoveryNicheId: idSchema,
  stages: z.array(flowStageSchema).min(1),
  dataCategories: z.array(dataCategorySchema).min(1),
  personas: z.array(flowPersonaSchema).min(1),
  nodes: z.array(flowNodeSchema).min(1),
  edges: z.array(flowEdgeSchema).min(1),
  hotspots: z.array(flowHotspotSchema).length(7),
});
export type DataFlowPack = z.infer<typeof dataFlowPackSchema>;

// ---------------------------------------------------------------------------
// Referential validation (Gate 2 completeness rules the schema can't express)
// ---------------------------------------------------------------------------

/** Returns human-readable problems; empty array = pack is internally consistent. */
export function validatePack(pack: DataFlowPack): string[] {
  const issues: string[] = [];
  const stageIds = new Set(pack.stages.map((s) => s.id));
  const categoryIds = new Set(pack.dataCategories.map((c) => c.id));
  const personaIds = new Set(pack.personas.map((p) => p.id));
  const nodeById = new Map(pack.nodes.map((n) => [n.id, n]));

  const dupes = (ids: string[], kind: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) issues.push(`duplicate ${kind} id: ${id}`);
      seen.add(id);
    }
  };
  dupes(pack.stages.map((s) => s.id), "stage");
  dupes(pack.dataCategories.map((c) => c.id), "data-category");
  dupes(pack.personas.map((p) => p.id), "persona");
  dupes(pack.nodes.map((n) => n.id), "node");
  dupes(pack.edges.map((e) => e.id), "edge");
  dupes(pack.hotspots.map((h) => h.id), "hotspot");

  for (const n of pack.nodes) {
    for (const s of n.stageIds) if (!stageIds.has(s)) issues.push(`node ${n.id}: unknown stage ${s}`);
    for (const c of n.dataCategoryIds) if (!categoryIds.has(c)) issues.push(`node ${n.id}: unknown data category ${c}`);
    for (const p of n.accessPersonaIds) if (!personaIds.has(p)) issues.push(`node ${n.id}: unknown persona ${p}`);
    if ((n.riskLevel === "high" || n.riskLevel === "critical") && (!n.riskWhy || !n.riskAction)) {
      issues.push(`node ${n.id}: ${n.riskLevel} risk requires riskWhy and riskAction`);
    }
  }

  const touchedNodes = new Set<string>();
  for (const e of pack.edges) {
    const src = nodeById.get(e.source);
    const tgt = nodeById.get(e.target);
    if (!src) issues.push(`edge ${e.id}: unknown source ${e.source}`);
    if (!tgt) issues.push(`edge ${e.id}: unknown target ${e.target}`);
    if (!stageIds.has(e.stageId)) issues.push(`edge ${e.id}: unknown stage ${e.stageId}`);
    for (const c of e.dataCategoryIds) if (!categoryIds.has(c)) issues.push(`edge ${e.id}: unknown data category ${c}`);
    touchedNodes.add(e.source);
    touchedNodes.add(e.target);

    // `external` must agree with node boundaries: a transfer is external iff
    // either endpoint sits in a boundary outside agency control.
    if (src && tgt) {
      const crossesOut =
        EXTERNAL_BOUNDARIES.includes(src.boundary) || EXTERNAL_BOUNDARIES.includes(tgt.boundary);
      if (e.external !== crossesOut) {
        issues.push(
          `edge ${e.id}: external=${e.external} inconsistent with boundaries ${src.boundary}→${tgt.boundary}`,
        );
      }
      // A stage-gated edge must not reference a node hidden in that model mix.
      const models = (x?: readonly BusinessModel[]) => x ?? BUSINESS_MODELS;
      for (const m of models(e.businessModels)) {
        if (!models(src.businessModels).includes(m)) issues.push(`edge ${e.id}: source ${src.id} absent for model ${m}`);
        if (!models(tgt.businessModels).includes(m)) issues.push(`edge ${e.id}: target ${tgt.id} absent for model ${m}`);
      }
    }
  }
  for (const n of pack.nodes) {
    if (!touchedNodes.has(n.id)) issues.push(`orphan node (no edges): ${n.id}`);
  }

  const bucketKeys = new Set(pack.assessmentBuckets);
  for (const h of pack.hotspots) {
    if (!nodeById.has(h.nodeId)) issues.push(`hotspot ${h.id}: unknown node ${h.nodeId}`);
    for (const c of h.dataCategoryIds) if (!categoryIds.has(c)) issues.push(`hotspot ${h.id}: unknown data category ${c}`);
    // A bucket outside this pack's own list deep-links to a section the
    // industry's assessment cannot match: the link lands, the focus banner
    // never renders, and nothing errors. Catch it here instead.
    if (!bucketKeys.has(h.assessmentBucket)) {
      issues.push(`hotspot ${h.id}: assessmentBucket ${h.assessmentBucket} not in pack.assessmentBuckets`);
    }
  }
  const ranks = pack.hotspots.map((h) => h.rank).sort((a, b) => a - b);
  if (ranks.join(",") !== "1,2,3,4,5,6,7") issues.push(`hotspot ranks must be exactly 1..7, got ${ranks.join(",")}`);

  return issues;
}

// ---------------------------------------------------------------------------
// Reference-model summary (computed, never hand-typed - spec §6.2)
// ---------------------------------------------------------------------------

export interface PackSummary {
  stages: number;
  systems: number;
  externalParties: number;
  personas: number;
  copyEvents: number;
  externalTransfers: number;
}

export function computePackSummary(pack: DataFlowPack): PackSummary {
  const externalParties = new Set(
    pack.nodes.filter((n) => EXTERNAL_BOUNDARIES.includes(n.boundary)).map((n) => n.id),
  );
  const systems = pack.nodes.filter((n) => n.nodeType !== "person");
  return {
    stages: pack.stages.length,
    systems: systems.length,
    externalParties: externalParties.size,
    personas: pack.personas.length,
    copyEvents: pack.edges.filter((e) => e.createsCopy).length,
    externalTransfers: pack.edges.filter((e) => e.external).length,
  };
}

/** Nodes/edges visible for a chosen business model (stage + entity gating). */
export function filterByBusinessModel(pack: DataFlowPack, model: BusinessModel): {
  stages: FlowStage[];
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const has = (x?: readonly BusinessModel[]) => !x || x.includes(model);
  const stages = pack.stages.filter((s) => has(s.businessModels));
  const stageIds = new Set(stages.map((s) => s.id));
  const nodes = pack.nodes.filter(
    (n) => has(n.businessModels) && n.stageIds.some((s) => stageIds.has(s)),
  );
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = pack.edges.filter(
    (e) =>
      has(e.businessModels) &&
      stageIds.has(e.stageId) &&
      nodeIds.has(e.source) &&
      nodeIds.has(e.target),
  );
  return { stages, nodes, edges };
}

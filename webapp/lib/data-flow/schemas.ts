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

/** Organisational trust boundary a node lives in (spec §13). */
export const BOUNDARIES = [
  "candidate",
  "agency",
  "client",
  "vendor",
  "government",
  "public",
] as const;
export type Boundary = (typeof BOUNDARIES)[number];

/** Boundaries that make a transfer "external" - data outside agency control. */
export const EXTERNAL_BOUNDARIES: readonly Boundary[] = [
  "client",
  "vendor",
  "government",
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
 * Bucket keys of lib/data/industry-assessment/packs/recruitment-agencies.ts.
 * Literal union so a typo in a hotspot mapping fails typecheck; the pack test
 * additionally asserts each key exists in the live pack (drift guard).
 */
export const ASSESSMENT_BUCKETS = [
  "candidate_sourcing",
  "candidate_document",
  "client_sharing",
  "ats_tool_access",
  "retention_rights",
] as const;
export type AssessmentBucketKey = (typeof ASSESSMENT_BUCKETS)[number];

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
  assessmentBucket: z.enum(ASSESSMENT_BUCKETS),
});
export type FlowHotspot = z.infer<typeof flowHotspotSchema>;

export const dataFlowPackSchema = z.object({
  industry: idSchema,
  title: z.string().min(1),
  /** Reference-model banner - never present metrics as the user's own data. */
  disclaimer: z.string().min(1),
  assessmentRoute: z.string().startsWith("/"),
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

  for (const h of pack.hotspots) {
    if (!nodeById.has(h.nodeId)) issues.push(`hotspot ${h.id}: unknown node ${h.nodeId}`);
    for (const c of h.dataCategoryIds) if (!categoryIds.has(c)) issues.push(`hotspot ${h.id}: unknown data category ${c}`);
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

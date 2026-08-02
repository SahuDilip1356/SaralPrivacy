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
// Business models are declared PER PACK (`pack.businessModels`): recruitment's
// two are not every industry's two. A CA firm has ONE honest journey, and a
// pack that declares one hides the selector rather than offering a button that
// re-renders the same page.
export type BusinessModel = string;

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

/** `businessModels` omitted = applies to every business model in the pack.
 *  Ids are validated against `pack.businessModels` in validatePack. */
const businessModelsSchema = z.array(idSchema).min(1).optional();

/** A journey variant this industry genuinely has. One entry = no selector. */
export const businessModelSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
});
export type BusinessModelOption = z.infer<typeof businessModelSchema>;

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
  /** Rank within this pack's hotspots, worst-first. Ranks are contiguous 1..N
   *  where N is the pack's hotspot count (5-8) - see dataFlowPackSchema. */
  rank: z.number().int().min(1).max(8),
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

// ---------------------------------------------------------------------------
// Rights & incident walkthroughs (optional per pack)
// ---------------------------------------------------------------------------
//
// Both sections are SHARED presentation driven entirely by pack content, in the
// same way the journey and the hotspot rail already are - so an industry opts in
// by authoring content, never by getting its own component tree. A pack that
// declares neither renders neither section, exactly as a pack with one
// `businessModel` hides the selector. That keeps "presentation unified, content
// varies" intact while letting the twelve maps adopt these at their own pace.
//
// The point of both is the same: the map shows WHERE data went, and these show
// what that means the day someone asks you to act on it. The honest answer is
// usually "we can reach these places, and we cannot reach those" - which is why
// `blockedNodeIds` is a first-class field rather than an omission.

export const RIGHTS_REQUEST_TYPES = [
  "access",
  "correction",
  "erasure",
  "remove-media",
  "withdraw-marketing",
  "authorisation-change",
  "complaint",
] as const;
export type RightsRequestType = (typeof RIGHTS_REQUEST_TYPES)[number];

export const rightsScenarioSchema = z.object({
  id: idSchema,
  /** The request in the data principal's own words. */
  request: z.string().min(1),
  requestType: z.enum(RIGHTS_REQUEST_TYPES),
  /** Who typically asks - matters where a guardian may act for the subject. */
  who: z.string().min(1),
  /** Places the request must reach. Node ids; the view resolves them to names. */
  reachesNodeIds: z.array(idSchema).min(1),
  /** Places it usually cannot reach. Naming these is the honest half. */
  blockedNodeIds: z.array(idSchema).optional(),
  /** What actually has to happen, in order. */
  steps: z.array(z.string().min(1)).min(1),
  /** The bit that genuinely fails in practice. */
  hardPart: z.string().min(1),
  businessModels: businessModelsSchema,
});
export type RightsScenario = z.infer<typeof rightsScenarioSchema>;

export const incidentScenarioSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  /** How it comes to light - usually a complaint, not a monitoring alert. */
  trigger: z.string().min(1),
  severity: z.enum(["medium", "high", "critical"]),
  involvedNodeIds: z.array(idSchema).min(1),
  /** First hour: stop it spreading. */
  containment: z.array(z.string().min(1)).min(1),
  /** Then: correct, tell people, write it down. */
  thenWhat: z.array(z.string().min(1)).min(1),
  /** The control that stops a repeat. */
  prevention: z.string().min(1),
  businessModels: businessModelsSchema,
});
export type IncidentScenario = z.infer<typeof incidentScenarioSchema>;

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

/**
 * Page copy that varies by industry. The PRESENTATION (layout, sections, order,
 * icons, interactions) is identical for every map and lives in the shared route
 * + components; only these STRINGS change per sector. Moving them onto the pack
 * is what lets one dynamic route serve all twelve industries with zero drift -
 * an improvement to one page is an improvement to all of them.
 */
export const flowPresentationSchema = z.object({
  /** Header eyebrow suffix, after "Where your data travels · ". */
  eyebrow: z.string().min(1),
  /** H1 - the one-line thesis of the map. */
  h1: z.string().min(1),
  /** Sub-hero paragraph under the H1. */
  intro: z.string().min(1),
  /** <title> and meta description for SEO. */
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  ogTitle: z.string().min(1),
  ogDescription: z.string().min(1),
  /** Breadcrumb leaf + the industry's own index page label. */
  breadcrumbLabel: z.string().min(1),
  /** One-line teaser on the industry landing page, above the data-flow preview. */
  previewBlurb: z.string().min(1),
  /** The three "how to read this journey" cards (icons are fixed in the view). */
  howToRead: z
    .array(z.object({ title: z.string().min(1), body: z.string().min(1) }))
    .length(3),
  /** Closing call-to-action band. */
  ctaHeading: z.string().min(1),
  ctaBody: z.string().min(1),
  ctaButton: z.string().min(1),
});
export type FlowPresentation = z.infer<typeof flowPresentationSchema>;

export const dataFlowPackSchema = z.object({
  industry: idSchema,
  title: z.string().min(1),
  /** Layer 1 - the human this map follows, as shown in the header. */
  mainActor: z.string().min(1),
  lexicon: flowLexiconSchema,
  presentation: flowPresentationSchema,
  /** Per-pack boundary label overrides; unset keys use BOUNDARY_META. */
  boundaryLabels: z.record(z.enum(BOUNDARIES), z.string().min(1)).optional(),
  /** Journey variants. Exactly one = the selector hides. First is the default. */
  businessModels: z.array(businessModelSchema).min(1),
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
  // Hotspots are the curated "start here" control breaks, ranked worst-first -
  // NOT the full risk inventory (that lives in the nodes' risk levels). The
  // count follows the industry's reality within a band, exactly as stage and
  // node counts do: enough (>=5) to be a serious section, few enough (<=8) to
  // stay a highlight rather than a wall. Was a hard 7; relaxed 2026-07 so the
  // count is honest per industry (see docs spec + decisions).
  hotspots: z.array(flowHotspotSchema).min(5).max(8),
  /** Optional "what happens when someone asks" walkthroughs - see above. */
  rightsScenarios: z.array(rightsScenarioSchema).min(1).optional(),
  /** Optional "it already went wrong" walkthroughs - see above. */
  incidentScenarios: z.array(incidentScenarioSchema).min(1).optional(),
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
  // A gating id that isn't a declared model silently hides the entity from
  // every view - it matches no selector value, so it simply never renders.
  const modelIds = new Set(pack.businessModels.map((m) => m.id));
  dupes(pack.businessModels.map((m) => m.id), "business-model");
  const checkModels = (ids: readonly string[] | undefined, what: string) => {
    for (const m of ids ?? []) {
      if (!modelIds.has(m)) issues.push(`${what}: unknown business model ${m}`);
    }
  };
  for (const s of pack.stages) checkModels(s.businessModels, `stage ${s.id}`);
  for (const n of pack.nodes) checkModels(n.businessModels, `node ${n.id}`);
  for (const e of pack.edges) checkModels(e.businessModels, `edge ${e.id}`);

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
      const allModels = pack.businessModels.map((m) => m.id);
      const models = (x?: readonly BusinessModel[]) => x ?? allModels;
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
  // Rights & incident walkthroughs name systems by id: an id that no longer
  // exists would render a blank chip and silently understate what a request has
  // to reach, so it fails here rather than shipping quietly.
  dupes((pack.rightsScenarios ?? []).map((s) => s.id), "rights-scenario");
  dupes((pack.incidentScenarios ?? []).map((s) => s.id), "incident-scenario");
  for (const s of pack.rightsScenarios ?? []) {
    checkModels(s.businessModels, `rights scenario ${s.id}`);
    for (const n of [...s.reachesNodeIds, ...(s.blockedNodeIds ?? [])]) {
      if (!nodeById.has(n)) issues.push(`rights scenario ${s.id}: unknown node ${n}`);
    }
  }
  for (const s of pack.incidentScenarios ?? []) {
    checkModels(s.businessModels, `incident scenario ${s.id}`);
    for (const n of s.involvedNodeIds) {
      if (!nodeById.has(n)) issues.push(`incident scenario ${s.id}: unknown node ${n}`);
    }
  }

  // Ranks must be a contiguous 1..N covering every hotspot exactly once, so the
  // "worst-first" order is total and unambiguous however many there are.
  const ranks = pack.hotspots.map((h) => h.rank).sort((a, b) => a - b);
  const expected = pack.hotspots.map((_, i) => i + 1).join(",");
  if (ranks.join(",") !== expected) {
    issues.push(`hotspot ranks must be contiguous 1..${pack.hotspots.length}, got ${ranks.join(",")}`);
  }

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

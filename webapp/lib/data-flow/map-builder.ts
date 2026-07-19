// View projections - turn one DataFlowPack into positioned nodes/edges for
// each P0 view (process journey, systems, copy proliferation, external
// sharing) with risk-heat as an orthogonal flag. Pure functions, no React,
// node-testable. Layout is deterministic: hand-computed columns/lanes, no
// auto-layout dependency (assumption A1/§B4).

import {
  BOUNDARIES,
  type Boundary,
  type BusinessModel,
  type DataFlowPack,
  type FlowEdge,
  type FlowNode,
  type FlowStage,
  filterByBusinessModel,
} from "./schemas.ts";

export const FLOW_VIEWS = ["process", "systems", "copies", "external"] as const;
export type FlowView = (typeof FLOW_VIEWS)[number];

export interface ProjectedNode {
  node: FlowNode;
  x: number;
  y: number;
  /** De-emphasised in the current view (rendered at low opacity). */
  dimmed: boolean;
  /** Incoming copy-creating edges - the "copies of the CV that live here". */
  copyCount: number;
}

export interface ProjectedEdge {
  edge: FlowEdge;
  dimmed: boolean;
  /** The view's subject (copy edges in copies view, external in external view). */
  emphasized: boolean;
}

export interface StageColumn {
  stage: FlowStage;
  x: number;
}

export interface BoundaryLane {
  boundary: Boundary;
  y: number;
  count: number;
}

export interface Projection {
  view: FlowView;
  nodes: ProjectedNode[];
  edges: ProjectedEdge[];
  /** Present in process/copies/external views (stage-column layout). */
  stageColumns?: StageColumn[];
  /** Present in systems view (boundary-lane layout). */
  lanes?: BoundaryLane[];
}

// Layout constants (px in canvas space)
export const COL_WIDTH = 280;
export const ROW_HEIGHT = 118;
export const LANE_GAP = 40;
const NODE_W = 220;

/** Boundary display order: the agency's world first, then outward. */
const BOUNDARY_ORDER: readonly Boundary[] = [
  "candidate",
  "agency",
  "client",
  "vendor",
  "government",
  "public",
];

function boundaryRank(b: Boundary): number {
  return BOUNDARY_ORDER.indexOf(b);
}

/** The stage column a node anchors to: its earliest-sequence visible stage. */
function primaryStageId(node: FlowNode, stageSeq: Map<string, number>): string {
  let best: string = node.stageIds[0];
  let bestSeq = Number.POSITIVE_INFINITY;
  for (const id of node.stageIds) {
    const seq = stageSeq.get(id);
    if (seq !== undefined && seq < bestSeq) {
      bestSeq = seq;
      best = id;
    }
  }
  return best;
}

function copyCounts(edges: FlowEdge[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of edges) {
    if (e.createsCopy) counts.set(e.target, (counts.get(e.target) ?? 0) + 1);
  }
  return counts;
}

/** Stage-column layout shared by process / copies / external views. */
function stageLayout(stages: FlowStage[], nodes: FlowNode[]): {
  columns: StageColumn[];
  pos: Map<string, { x: number; y: number }>;
} {
  const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);
  const stageSeq = new Map(ordered.map((s) => [s.id, s.sequence]));
  const columns: StageColumn[] = ordered.map((stage, i) => ({ stage, x: i * COL_WIDTH }));
  const colX = new Map(columns.map((c) => [c.stage.id, c.x]));

  const byStage = new Map<string, FlowNode[]>();
  for (const n of nodes) {
    const sid = primaryStageId(n, stageSeq);
    const list = byStage.get(sid) ?? [];
    list.push(n);
    byStage.set(sid, list);
  }

  const pos = new Map<string, { x: number; y: number }>();
  for (const [sid, list] of byStage) {
    list.sort(
      (a, b) => boundaryRank(a.boundary) - boundaryRank(b.boundary) || a.name.localeCompare(b.name),
    );
    list.forEach((n, row) => {
      pos.set(n.id, { x: colX.get(sid) ?? 0, y: 70 + row * ROW_HEIGHT });
    });
  }
  return { columns, pos };
}

/** Boundary-lane layout for the systems view. */
function laneLayout(nodes: FlowNode[]): {
  lanes: BoundaryLane[];
  pos: Map<string, { x: number; y: number }>;
} {
  const grouped = new Map<Boundary, FlowNode[]>();
  for (const b of BOUNDARY_ORDER) grouped.set(b, []);
  for (const n of nodes) grouped.get(n.boundary)?.push(n);

  const lanes: BoundaryLane[] = [];
  const pos = new Map<string, { x: number; y: number }>();
  let y = 0;
  for (const b of BOUNDARY_ORDER) {
    const list = grouped.get(b) ?? [];
    if (list.length === 0) continue;
    list.sort((a, b2) => a.name.localeCompare(b2.name));
    const perRow = 5;
    list.forEach((n, i) => {
      pos.set(n.id, {
        x: (i % perRow) * (NODE_W + 40),
        y: y + 56 + Math.floor(i / perRow) * ROW_HEIGHT,
      });
    });
    const rows = Math.ceil(list.length / perRow);
    lanes.push({ boundary: b, y, count: list.length });
    y += 56 + rows * ROW_HEIGHT + LANE_GAP;
  }
  return { lanes, pos };
}

export interface ProjectionOptions {
  view: FlowView;
  model: BusinessModel;
}

export function buildProjection(pack: DataFlowPack, opts: ProjectionOptions): Projection {
  const { stages, nodes, edges } = filterByBusinessModel(pack, opts.model);
  const counts = copyCounts(edges);

  const touchesCopy = new Set<string>();
  const touchesExternal = new Set<string>();
  for (const e of edges) {
    if (e.createsCopy) {
      touchesCopy.add(e.source);
      touchesCopy.add(e.target);
    }
    if (e.external) {
      touchesExternal.add(e.source);
      touchesExternal.add(e.target);
    }
  }

  const nodeDimmed = (n: FlowNode): boolean => {
    if (opts.view === "copies") return !touchesCopy.has(n.id);
    if (opts.view === "external") return !touchesExternal.has(n.id);
    return false;
  };
  const edgeState = (e: FlowEdge): { dimmed: boolean; emphasized: boolean } => {
    if (opts.view === "copies") return { dimmed: !e.createsCopy, emphasized: e.createsCopy };
    if (opts.view === "external") return { dimmed: !e.external, emphasized: e.external };
    return { dimmed: false, emphasized: false };
  };

  if (opts.view === "systems") {
    const { lanes, pos } = laneLayout(nodes);
    return {
      view: opts.view,
      lanes,
      nodes: nodes.map((node) => ({
        node,
        ...(pos.get(node.id) ?? { x: 0, y: 0 }),
        dimmed: false,
        copyCount: counts.get(node.id) ?? 0,
      })),
      edges: edges.map((edge) => ({ edge, ...edgeState(edge) })),
    };
  }

  const { columns, pos } = stageLayout(stages, nodes);
  return {
    view: opts.view,
    stageColumns: columns,
    nodes: nodes.map((node) => ({
      node,
      ...(pos.get(node.id) ?? { x: 0, y: 0 }),
      dimmed: nodeDimmed(node),
      copyCount: counts.get(node.id) ?? 0,
    })),
    edges: edges.map((edge) => ({ edge, ...edgeState(edge) })),
  };
}

/** Boundaries actually present - for the legend. */
export function presentBoundaries(pack: DataFlowPack): Boundary[] {
  const present = new Set(pack.nodes.map((n) => n.boundary));
  return BOUNDARIES.filter((b) => present.has(b));
}

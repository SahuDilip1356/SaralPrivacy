"use client";

// The desktop graph. Consumes a Projection from map-builder and renders it
// with @xyflow/react. Nodes are not draggable (reference model, not an
// editor). Loaded via next/dynamic (ssr:false) from DataFlowClient.

import { useCallback, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  type Node,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Projection } from "@/lib/data-flow/map-builder";
import type { FlowSelection } from "./selection";
import { FlowNodeCard, type FlowCanvasNode } from "./FlowNodeCard";
import { FlowEdgeLine, type FlowCanvasEdge } from "./FlowEdgeLine";
import { BOUNDARY_META } from "./flow-theme";

type StageLabelData = {
  title: string;
  sequence: number;
  width: number;
  dpdpaNote?: string;
};
type StageLabelNodeT = Node<StageLabelData, "stageLabel">;
type CanvasNode = FlowCanvasNode | StageLabelNodeT;

// Non-interactive stage headers rendered as canvas nodes in column views.
// With the DPDPA overlay on, each header carries the stage's plain-English
// obligation - the law annotated exactly where it arises (spec §27).
function StageLabelNode({ data }: { data: StageLabelData }) {
  return (
    <div style={{ width: data.width }} className="pointer-events-none">
      <div className="rounded-lg border border-navy-200 bg-navy-700 px-3 py-1.5 text-center text-[12px] font-bold text-white shadow-sm">
        {data.sequence}. {data.title}
      </div>
      {data.dpdpaNote && (
        <div className="mt-1.5 rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-[10px] font-medium leading-snug text-teal-900 shadow-sm">
          <span className="font-bold">DPDPA: </span>
          {data.dpdpaNote}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  flowNode: FlowNodeCard,
  stageLabel: StageLabelNode,
} as never;
const edgeTypes = { flowEdge: FlowEdgeLine };

interface Props {
  projection: Projection;
  riskHeat: boolean;
  dpdpaOverlay: boolean;
  selection: FlowSelection;
  onSelect: (sel: FlowSelection) => void;
}

export default function DataFlowCanvas({
  projection,
  riskHeat,
  dpdpaOverlay,
  selection,
  onSelect,
}: Props) {
  const showCopyBadge = projection.view === "copies";

  const stageLabelNodes = useMemo<StageLabelNodeT[]>(
    () =>
      (projection.stageColumns ?? []).map((c) => ({
        id: `stage-label-${c.stage.id}`,
        type: "stageLabel",
        position: { x: c.x, y: 0 },
        draggable: false,
        connectable: false,
        selectable: false,
        focusable: false,
        data: {
          title: c.stage.name,
          sequence: c.stage.sequence,
          width: 220,
          dpdpaNote: dpdpaOverlay ? c.stage.dpdpaNote : undefined,
        },
      })),
    [projection.stageColumns, dpdpaOverlay],
  );

  const nodes = useMemo<FlowCanvasNode[]>(
    () =>
      projection.nodes.map((p) => ({
        id: p.node.id,
        type: "flowNode",
        position: { x: p.x, y: p.y },
        selected: selection?.kind === "node" && selection.id === p.node.id,
        draggable: false,
        connectable: false,
        focusable: true,
        ariaLabel: `${p.node.name}, ${p.node.nodeType.replace("_", " ")}, ${BOUNDARY_META[p.node.boundary].label}, ${p.node.riskLevel} risk`,
        data: {
          flowNode: p.node,
          dimmed: p.dimmed,
          copyCount: p.copyCount,
          riskHeat,
          showCopyBadge,
        },
      })),
    [projection, riskHeat, selection, showCopyBadge],
  );

  const edges = useMemo<FlowCanvasEdge[]>(
    () =>
      projection.edges.map((p) => ({
        id: p.edge.id,
        type: "flowEdge",
        source: p.edge.source,
        target: p.edge.target,
        selected: selection?.kind === "edge" && selection.id === p.edge.id,
        focusable: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        data: { flowEdge: p.edge, dimmed: p.dimmed, emphasized: p.emphasized },
      })),
    [projection, selection],
  );

  const handleNodeClick = useCallback<NodeMouseHandler<CanvasNode>>(
    (_e, node) => {
      // Stage-header labels are decorative - clicking them selects nothing.
      if (node.type === "stageLabel") return;
      onSelect({ kind: "node", id: node.id });
    },
    [onSelect],
  );
  const handleEdgeClick = useCallback<EdgeMouseHandler<FlowCanvasEdge>>(
    (_e, edge) => onSelect({ kind: "edge", id: edge.id }),
    [onSelect],
  );
  const handlePaneClick = useCallback(() => onSelect(null), [onSelect]);

  // Column views span ~2,800px: fitView would shrink cards to illegibility.
  // Start the journey readable at the Candidate end and let users pan right;
  // the compact systems view fits fully.
  const isColumnView = projection.view !== "systems";

  return (
    <ReactFlow<CanvasNode, FlowCanvasEdge>
      key={`${projection.view}-${riskHeat}`}
      nodes={[...stageLabelNodes, ...nodes]}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={handlePaneClick}
      fitView={!isColumnView}
      defaultViewport={isColumnView ? { x: 24, y: 12, zoom: 0.68 } : undefined}
      fitViewOptions={{ padding: 0.12, maxZoom: 0.9 }}
      minZoom={0.3}
      maxZoom={1.5}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable
      edgesFocusable
      elementsSelectable
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnPinch
      panOnDrag
      preventScrolling={false}
      proOptions={{ hideAttribution: false }}
      className="bg-pearl-50"
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#cbd5e1" />
    </ReactFlow>
  );
}

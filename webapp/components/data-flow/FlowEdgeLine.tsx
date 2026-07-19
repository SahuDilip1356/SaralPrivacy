"use client";

// Custom React Flow edge - solid internal, dashed external, ⧉ badge when a
// copy is created. Emphasis/dim driven by the active view projection.

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { FlowEdge } from "@/lib/data-flow/schemas";

export type FlowCanvasEdge = Edge<
  {
    flowEdge: FlowEdge;
    dimmed: boolean;
    emphasized: boolean;
  },
  "flowEdge"
>;

function FlowEdgeLineInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<FlowCanvasEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  if (!data) return null;
  const { flowEdge: e, dimmed, emphasized } = data;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "#35B6AE" : emphasized ? "#0f2e4f" : "#94a3b8",
          strokeWidth: selected || emphasized ? 2.25 : 1.25,
          strokeDasharray: e.external ? "6 4" : undefined,
          opacity: dimmed ? 0.15 : 1,
        }}
        interactionWidth={16}
      />
      {e.createsCopy && !dimmed && (
        <EdgeLabelRenderer>
          <span
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            className={cn(
              "nodrag nopan pointer-events-none absolute rounded border bg-white px-1 py-px text-[9px] font-bold shadow-sm",
              emphasized || selected
                ? "border-navy-300 text-navy-700"
                : "border-slate-200 text-slate-500",
            )}
            aria-hidden="true"
          >
            ⧉ copy
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const FlowEdgeLine = memo(FlowEdgeLineInner);

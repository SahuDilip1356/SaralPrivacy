"use client";

// Custom React Flow node - semantic shape by nodeType, risk chip with icon,
// shadow-IT + external badges, copy-count badge. Risk is never colour-only.

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowNode } from "@/lib/data-flow/schemas";
import {
  BOUNDARY_META,
  EXTERNAL_BOUNDARY_SET,
  NODE_TYPE_META,
  RISK_META,
} from "./flow-theme";

export type FlowCanvasNode = Node<
  {
    flowNode: FlowNode;
    dimmed: boolean;
    copyCount: number;
    riskHeat: boolean;
    showCopyBadge: boolean;
  },
  "flowNode"
>;

function FlowNodeCardInner({ data, selected }: NodeProps<FlowCanvasNode>) {
  const { flowNode: n, dimmed, copyCount, riskHeat, showCopyBadge } = data;
  const type = NODE_TYPE_META[n.nodeType];
  const risk = RISK_META[n.riskLevel];
  const boundary = BOUNDARY_META[n.boundary];
  const isExternal = EXTERNAL_BOUNDARY_SET.has(n.boundary);
  const isPerson = n.nodeType === "person";
  const TypeIcon = type.icon;
  const RiskIcon = risk.icon;
  const heatStrong = riskHeat && (n.riskLevel === "high" || n.riskLevel === "critical");
  const heatFade = riskHeat && n.riskLevel === "low";

  return (
    <div
      className={cn(
        "w-[220px] border bg-white px-3 py-2.5 text-left shadow-sm transition-all",
        isPerson ? "rounded-full border-teal-300 bg-teal-50" : "rounded-xl border-slate-200",
        n.shadowIt && "border-dashed border-slate-400",
        isExternal && "border-amber-300",
        heatStrong && `ring-2 ${risk.ring}`,
        selected && "ring-2 ring-teal-500 shadow-md",
        !selected && "hover:ring-2 hover:ring-teal-300 hover:shadow-md",
        (dimmed || heatFade) && "opacity-30",
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-slate-300 !bg-slate-400" />
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-0.5 shrink-0 rounded-lg p-1.5",
            isPerson ? "bg-teal-100 text-teal-700" : "bg-navy-50 text-navy-600",
          )}
          aria-hidden="true"
        >
          <TypeIcon size={16} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold leading-tight text-navy-800">{n.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className={cn("inline-flex items-center gap-0.5 rounded-full border px-1.5 py-px text-[10px] font-medium", risk.chip)}>
              <RiskIcon size={10} aria-hidden="true" /> {risk.label}
            </span>
            {isExternal && (
              <span className={cn("rounded-full border px-1.5 py-px text-[10px] font-medium", boundary.badge)}>
                {boundary.label}
              </span>
            )}
            {n.shadowIt && (
              <span className="rounded-full border border-slate-300 bg-slate-50 px-1.5 py-px text-[10px] font-medium text-slate-600">
                Unmanaged
              </span>
            )}
          </div>
        </div>
      </div>
      {showCopyBadge && copyCount > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex items-center gap-0.5 rounded-full border border-navy-200 bg-navy-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          <Copy size={10} aria-hidden="true" /> {copyCount} {copyCount === 1 ? "copy" : "copies"}
        </span>
      )}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-slate-300 !bg-slate-400" />
    </div>
  );
}

export const FlowNodeCard = memo(FlowNodeCardInner);

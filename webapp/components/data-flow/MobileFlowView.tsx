"use client";

// Mobile (<lg) experience: stage journey with collapsible cards + tappable
// system rows opening a bottom sheet. The graph canvas is never mounted here
// (mobile-spec.md). Phase 2 ships the journey + sheet; Phase 3 polishes.

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { BOUNDARY_META, EXTERNAL_BOUNDARY_SET, NODE_TYPE_META, RISK_META } from "./flow-theme";
import { NodeDetailPanel } from "./NodeDetailPanel";

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  onStageExpanded?: (stageId: string) => void;
  onNodeSelected?: (nodeId: string) => void;
  onAssessmentCta?: (bucket: string | undefined) => void;
}

export function MobileFlowView({ pack, model, onStageExpanded, onNodeSelected, onAssessmentCta }: Props) {
  const { stages, nodes, edges } = filterByBusinessModel(pack, model);
  const [sheetNode, setSheetNode] = useState<FlowNode | null>(null);
  const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);

  const nodesForStage = (stageId: string) =>
    nodes.filter((n) => n.nodeType !== "person" && n.stageIds.includes(stageId));
  const copyEventsForStage = (stageId: string) =>
    edges.filter((e) => e.stageId === stageId && e.createsCopy).length;

  return (
    <div className="relative">
      <ol className="space-y-3">
        {ordered.map((stage, i) => {
          const stageNodes = nodesForStage(stage.id);
          const highCount = stageNodes.filter(
            (n) => n.riskLevel === "high" || n.riskLevel === "critical",
          ).length;
          const copies = copyEventsForStage(stage.id);
          return (
            <li key={stage.id} className="relative">
              {i < ordered.length - 1 && (
                <span
                  className="absolute left-5 top-full h-3 w-px bg-slate-300"
                  aria-hidden="true"
                />
              )}
              <details
                className="group rounded-xl border border-slate-200 bg-white shadow-sm"
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) onStageExpanded?.(stage.id);
                }}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                    {stage.sequence}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-navy-800">{stage.name}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                      {stageNodes.length} systems
                      {copies > 0 && ` · ${copies} copy events`}
                      {highCount > 0 && ` · ${highCount} high-risk`}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="border-t border-slate-100 p-4 pt-3">
                  <p className="text-[13px] leading-relaxed text-slate-600">{stage.summary}</p>
                  <ul className="mt-3 space-y-1.5">
                    {stageNodes.map((n) => {
                      const risk = RISK_META[n.riskLevel];
                      const RiskIcon = risk.icon;
                      const TypeIcon = NODE_TYPE_META[n.nodeType].icon;
                      const isExternal = EXTERNAL_BOUNDARY_SET.has(n.boundary);
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSheetNode(n);
                              onNodeSelected?.(n.id);
                            }}
                            className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                          >
                            <TypeIcon size={15} className="shrink-0 text-navy-600" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-navy-800">
                              {n.name}
                            </span>
                            {isExternal && (
                              <span className={cn("shrink-0 rounded-full border px-1.5 py-px text-[10px] font-medium", BOUNDARY_META[n.boundary].badge)}>
                                {BOUNDARY_META[n.boundary].label}
                              </span>
                            )}
                            <RiskIcon
                              size={14}
                              aria-label={risk.label}
                              className={cn(
                                n.riskLevel === "critical" || n.riskLevel === "high"
                                  ? "text-amber-600"
                                  : n.riskLevel === "medium"
                                    ? "text-slate-400"
                                    : "text-green-600",
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[12px] leading-relaxed text-teal-900">
                    <span className="font-bold">DPDPA: </span>
                    {stage.dpdpaNote}
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      {sheetNode && (
        <div className="fixed inset-0 z-50 flex items-end bg-navy-900/40" onClick={() => setSheetNode(null)}>
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-2 pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-1 mt-1 h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
            <NodeDetailPanel
              pack={pack}
              node={sheetNode}
              onClose={() => setSheetNode(null)}
              onAssessmentCta={onAssessmentCta}
            />
          </div>
        </div>
      )}
    </div>
  );
}

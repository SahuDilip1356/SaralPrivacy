"use client";

// The PRIMARY experience (all breakpoints): a readable top-to-bottom story —
// one candidate's CV moves stage by stage, the copy count climbs, and every
// system is legible at a glance (risk colour + icon, "leaves your agency" /
// "unmanaged" badges). No graph, no zoom, no spaghetti. Details open on demand
// in a drawer/sheet. The dense React Flow map is an opt-in power-user toggle
// (DataFlowClient), not this.

import { useMemo, useState } from "react";
import { Copy, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode, FlowStage } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import {
  BOUNDARY_META,
  EXTERNAL_BOUNDARY_SET,
  NODE_TYPE_META,
  RISK_META,
} from "./flow-theme";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { DetailSheet } from "./DetailSheet";

// Stages that only exist for deployed-staff models — flagged with a
// "data lives for years" callout so switching business model has visible effect.
const STAFFING_STAGE_IDS = new Set(["onboarding", "exit"]);

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  onSystemOpen?: (nodeId: string) => void;
  onAssessmentCta?: (bucket: string | undefined) => void;
}

interface StageRow {
  stage: FlowStage;
  systems: FlowNode[];
  copiesHere: number;
  runningTotal: number;
  staffingOnly: boolean;
}

export function JourneyView({ pack, model, onSystemOpen, onAssessmentCta }: Props) {
  const [sheetNode, setSheetNode] = useState<FlowNode | null>(null);

  const { rows, totalCopies } = useMemo(() => {
    const { stages, nodes, edges } = filterByBusinessModel(pack, model);
    const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);
    const seq = new Map(ordered.map((s) => [s.id, s.sequence]));

    // Each system appears once, at the earliest stage it participates in — so
    // the journey reads clean and the copy count stays meaningful.
    const primaryStage = (n: FlowNode) =>
      n.stageIds
        .filter((id) => seq.has(id))
        .sort((a, b) => (seq.get(a)! - seq.get(b)!))[0];

    const systemsByStage = new Map<string, FlowNode[]>();
    for (const n of nodes) {
      if (n.nodeType === "person") continue;
      const sid = primaryStage(n);
      if (!sid) continue;
      const list = systemsByStage.get(sid) ?? [];
      list.push(n);
      systemsByStage.set(sid, list);
    }

    let running = 0;
    const rows: StageRow[] = ordered.map((stage) => {
      const copiesHere = edges.filter((e) => e.stageId === stage.id && e.createsCopy).length;
      running += copiesHere;
      const systems = (systemsByStage.get(stage.id) ?? []).sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
        return order[a.riskLevel] - order[b.riskLevel];
      });
      return {
        stage,
        systems,
        copiesHere,
        runningTotal: running,
        staffingOnly: STAFFING_STAGE_IDS.has(stage.id),
      };
    });
    return { rows, totalCopies: running };
  }, [pack, model]);

  const openSystem = (n: FlowNode) => {
    setSheetNode(n);
    onSystemOpen?.(n.id);
  };

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Journey start marker — one candidate, one original document */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <User size={18} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-navy-800">
          One candidate&apos;s CV enters
          <span className="ml-1.5 font-normal text-slate-500">— follow it, and watch the copies add up.</span>
        </p>
      </div>

      {/* The journey */}
      <ol>
        {rows.map((row, i) => (
          <li key={row.stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                {row.stage.sequence}
              </span>
              {i < rows.length - 1 && <span className="w-0.5 flex-1 bg-slate-300" aria-hidden="true" />}
            </div>

            <div
              className={cn(
                "mb-3 flex-1 rounded-xl border bg-white p-4",
                row.staffingOnly ? "border-teal-300" : "border-slate-200",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[15px] font-bold text-navy-800">{row.stage.name}</h3>
                {row.copiesHere > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    <Copy size={11} aria-hidden="true" /> +{row.copiesHere} {row.copiesHere === 1 ? "copy" : "copies"} · {row.runningTotal} so far
                  </span>
                )}
              </div>

              {row.staffingOnly && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-800">
                  Added for staffing/RPO — candidate data now lives on as employee data, for years.
                </p>
              )}

              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{row.stage.summary}</p>

              {row.systems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.systems.map((n) => {
                    const risk = RISK_META[n.riskLevel];
                    const RiskIcon = risk.icon;
                    const TypeIcon = NODE_TYPE_META[n.nodeType].icon;
                    const external = EXTERNAL_BOUNDARY_SET.has(n.boundary);
                    const danger = n.riskLevel === "high" || n.riskLevel === "critical";
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => openSystem(n)}
                        className={cn(
                          "group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                          danger
                            ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                            : external
                              ? "border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        <TypeIcon size={13} className="shrink-0 opacity-70" aria-hidden="true" />
                        {n.name}
                        {n.shadowIt && (
                          <span className="rounded bg-white/70 px-1 text-[10px] font-semibold text-slate-500">
                            unmanaged
                          </span>
                        )}
                        {external && (
                          <span className="rounded bg-white/70 px-1 text-[10px] font-semibold text-amber-700">
                            {BOUNDARY_META[n.boundary].label}
                          </span>
                        )}
                        <RiskIcon
                          size={13}
                          className={cn(
                            "shrink-0",
                            n.riskLevel === "critical" || n.riskLevel === "high"
                              ? "text-amber-600"
                              : n.riskLevel === "medium"
                                ? "text-slate-400"
                                : "text-green-600",
                          )}
                          aria-label={risk.label}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="mt-3 flex items-start gap-1.5 border-t border-slate-100 pt-2.5 text-[12px] leading-relaxed text-teal-900">
                <span className="mt-px shrink-0 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                  DPDPA
                </span>
                {row.stage.dpdpaNote}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* Closing payoff — the climb, resolved */}
      <div className="mb-4 ml-11 flex items-center gap-3 rounded-xl border border-navy-200 bg-navy-800 p-4 text-white">
        <Trash2 size={22} className="shrink-0 text-teal-300" aria-hidden="true" />
        <p className="text-sm font-semibold leading-snug">
          One CV became <span className="text-teal-300">{totalCopies} copies</span> across your
          agency, clients and vendors. Every one of them is data you must be able to find, correct
          and delete.
        </p>
      </div>

      {/* Legend — thin inline strip, never floating over content */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-400">How to read:</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded border border-amber-300 bg-amber-50" aria-hidden="true" /> leaves your agency
        </span>
        <span>unmanaged = personal / uncontrolled tool</span>
        <span className="inline-flex items-center gap-1">
          <Copy size={11} aria-hidden="true" /> a new copy is created
        </span>
        <span>tap any system for what it holds &amp; how to fix it</span>
      </div>

      {sheetNode && (
        <DetailSheet onClose={() => setSheetNode(null)}>
          <NodeDetailPanel
            pack={pack}
            node={sheetNode}
            onClose={() => setSheetNode(null)}
            onAssessmentCta={onAssessmentCta}
          />
        </DetailSheet>
      )}
    </div>
  );
}

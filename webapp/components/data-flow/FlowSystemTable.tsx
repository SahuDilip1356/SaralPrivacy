"use client";

// Accessible fallback for the lane board.
//
// BoundaryLaneMap is a positioned board with drawn wires: informative to look
// at, and close to unusable if you are navigating by keyboard, reading with a
// screen reader, or on a 320px screen. This renders the SAME filtered model as
// a real <table> - every system, the boundary it sits in, the stage it first
// appears at, its risk and whether retention is defined - so nothing on the
// board is information you can only get visually.
//
// SHARED: every map gets this, driven by the pack. Rows stay clickable so the
// detail sheet is reachable from here too.

import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode, RiskLevel } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { NODE_TYPE_META, RISK_META, TEXT, boundaryLabel } from "./flow-theme";

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  risks: ReadonlySet<RiskLevel>;
  onSelect?: (nodeId: string) => void;
}

export function FlowSystemTable({ pack, model, risks, onSelect }: Props) {
  const { stages, nodes } = filterByBusinessModel(pack, model);
  const seq = new Map(stages.map((s) => [s.id, s.sequence]));
  const stageName = new Map(stages.map((s) => [s.id, s.name]));
  const hotspotNodeIds = new Set(pack.hotspots.map((h) => h.nodeId));

  /** Same rule the journey uses: a system belongs to the first stage it reaches. */
  const primaryStage = (n: FlowNode) =>
    n.stageIds.filter((id) => seq.has(id)).sort((a, b) => seq.get(a)! - seq.get(b)!)[0];

  const rows = nodes
    .filter((n) => n.nodeType !== "person" && risks.has(n.riskLevel))
    .map((n) => ({ node: n, stageId: primaryStage(n) }))
    .filter((r) => r.stageId)
    .sort((a, b) => {
      const d = seq.get(a.stageId!)! - seq.get(b.stageId!)!;
      return d !== 0 ? d : a.node.name.localeCompare(b.node.name);
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className={cn("px-3 py-2 text-left text-slate-500", TEXT.tiny)}>
          Every place {pack.lexicon.subject} data sits in this model, in journey order. Selecting a
          row opens the same detail as the board.
        </caption>
        <thead>
          <tr className={cn("border-b border-slate-200 text-slate-500", TEXT.mini)}>
            <th scope="col" className="px-3 py-2 font-semibold">Stage</th>
            <th scope="col" className="px-3 py-2 font-semibold">System or place</th>
            <th scope="col" className="px-3 py-2 font-semibold">Sits in</th>
            <th scope="col" className="px-3 py-2 font-semibold">Risk</th>
            <th scope="col" className="px-3 py-2 font-semibold">Retention</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ node, stageId }) => {
            const risk = RISK_META[node.riskLevel];
            const RiskIcon = risk.icon;
            const TypeIcon = NODE_TYPE_META[node.nodeType].icon;
            return (
              <tr key={node.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                <td className={cn("px-3 py-2 text-slate-500", TEXT.mini)}>
                  {seq.get(stageId!)}. {stageName.get(stageId!)}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onSelect?.(node.id)}
                    className={cn(
                      "inline-flex items-start gap-1.5 text-left font-semibold text-navy-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                      TEXT.tiny,
                    )}
                  >
                    <TypeIcon size={12} className="mt-0.5 shrink-0 text-slate-600" aria-hidden="true" />
                    <span>
                      {node.name}
                      {node.shadowIt && (
                        <span className={cn("ml-1.5 text-amber-700", TEXT.micro)}>unmanaged</span>
                      )}
                      {hotspotNodeIds.has(node.id) && (
                        <span
                          className={cn(
                            "ml-1.5 rounded-full bg-red-600 px-1.5 font-bold uppercase tracking-wide text-white",
                            TEXT.micro,
                          )}
                        >
                          hotspot
                        </span>
                      )}
                    </span>
                  </button>
                </td>
                <td className={cn("px-3 py-2 text-slate-600", TEXT.mini)}>
                  {boundaryLabel(pack, node.boundary)}
                </td>
                <td className="px-3 py-2">
                  {/* Icon + word, never colour alone. */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold",
                      TEXT.micro,
                      risk.chip,
                    )}
                  >
                    <RiskIcon size={10} aria-hidden="true" /> {risk.label}
                  </span>
                </td>
                <td className={cn("px-3 py-2 text-slate-600", TEXT.mini)}>
                  {node.retentionDefined ? "Defined" : "Not defined"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

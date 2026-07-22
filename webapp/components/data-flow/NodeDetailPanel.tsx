"use client";

// Right-panel (desktop) / bottom-sheet body (mobile) for a selected node.
// Content order per interaction-spec.md.

import Link from "next/link";
import { ArrowRight, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataFlowPack, FlowNode } from "@/lib/data-flow/schemas";
import { BOUNDARY_META, NODE_TYPE_META, RISK_META, boundaryLabel } from "./flow-theme";

interface Props {
  pack: DataFlowPack;
  node: FlowNode;
  onClose: () => void;
  onAssessmentCta?: (bucket: string | undefined) => void;
}

export function NodeDetailPanel({ pack, node, onClose, onAssessmentCta }: Props) {
  const risk = RISK_META[node.riskLevel];
  const RiskIcon = risk.icon;
  const type = NODE_TYPE_META[node.nodeType];
  const boundary = { ...BOUNDARY_META[node.boundary], label: boundaryLabel(pack, node.boundary) };
  const categories = pack.dataCategories.filter((c) => node.dataCategoryIds.includes(c.id));
  const personas = pack.personas.filter((p) => node.accessPersonaIds.includes(p.id));
  const hotspot = pack.hotspots.find((h) => h.nodeId === node.id);
  const assessmentHref = `${pack.assessmentRoute}?from=data-flow${hotspot ? `&bucket=${hotspot.assessmentBucket}` : ""}`;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`Details: ${node.name}`}
      className="flex h-full flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div>
          <h3 className="text-base font-bold leading-snug text-navy-800">{node.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {type.label}
            </span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", boundary.badge)}>
              {boundary.label}
            </span>
            {node.shadowIt && (
              <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Unmanaged
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4 p-4 text-sm">
        <p className="leading-relaxed text-slate-600">{node.description}</p>

        <section aria-label="Data held here">
          <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            What it holds
          </h4>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <span
                key={c.id}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  c.kind === "derived"
                    ? "border-navy-300 bg-navy-50 text-navy-700"
                    : "border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                {c.name}
                {c.kind === "derived" && <span className="ml-1 font-bold">· inferred</span>}
              </span>
            ))}
          </div>
        </section>

        <section aria-label="Who can access">
          <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Who can access
          </h4>
          <ul className="space-y-1">
            {personas.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="font-medium text-slate-700">{p.name}</span>
                <span className={cn("rounded-full border px-1.5 py-px text-[10px]", BOUNDARY_META[p.boundary].badge)}>
                  {boundaryLabel(pack, p.boundary)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium",
            node.retentionDefined
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-300 bg-amber-50 text-amber-800",
          )}
        >
          <Clock size={14} aria-hidden="true" />
          {node.retentionDefined ? "Retention defined" : "No retention rule - copies stay indefinitely"}
        </div>

        <section aria-label="Risk" className={cn("rounded-lg border p-3", risk.chip)}>
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <RiskIcon size={14} aria-hidden="true" /> {risk.label}
          </div>
          {node.riskWhy && <p className="mt-1.5 text-[13px] leading-relaxed">{node.riskWhy}</p>}
          {/* riskWhy explains the mechanism; whyItMatters explains the
              consequence. Verified non-duplicative across all 7 hotspots. */}
          {hotspot && (
            <p className="mt-2 text-[13px] leading-relaxed">
              <span className="font-bold">Why this matters: </span>
              {hotspot.whyItMatters}
            </p>
          )}
          {node.riskAction && (
            <p className="mt-2 text-[13px] leading-relaxed">
              <span className="font-bold">Fix: </span>
              {node.riskAction}
            </p>
          )}
        </section>

        <Link
          href={assessmentHref}
          onClick={() => onAssessmentCta?.(hotspot?.assessmentBucket)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
        >
          Check this in the assessment <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

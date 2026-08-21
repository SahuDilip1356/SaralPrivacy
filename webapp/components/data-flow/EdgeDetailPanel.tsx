"use client";

// Right-panel body for a selected data movement (edge).

import Link from "next/link";
import { ArrowRight, Copy, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataFlowPack, FlowEdge } from "@/lib/data-flow/schemas";
import { ACTION_LABEL, CHANNEL_LABEL, RISK_META } from "./flow-theme";

interface Props {
  pack: DataFlowPack;
  edge: FlowEdge;
  onClose: () => void;
  onAssessmentCta?: () => void;
}

export function EdgeDetailPanel({ pack, edge, onClose, onAssessmentCta }: Props) {
  const source = pack.nodes.find((n) => n.id === edge.source);
  const target = pack.nodes.find((n) => n.id === edge.target);
  const stage = pack.stages.find((s) => s.id === edge.stageId);
  const risk = RISK_META[edge.riskLevel];
  const RiskIcon = risk.icon;
  const categories = pack.dataCategories.filter((c) => edge.dataCategoryIds.includes(c.id));

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`Data movement: ${source?.name} to ${target?.name}`}
      className="flex h-full flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div>
          <h3 className="text-sm font-semibold leading-snug text-navy-800">
            {source?.name} <span className="text-slate-600">→</span> {target?.name}
          </h3>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {ACTION_LABEL[edge.action]} · {CHANNEL_LABEL[edge.channel]}
            {stage ? ` · ${stage.name}` : ""}
          </p>
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
        <p className="leading-relaxed text-slate-600">{edge.purpose}.</p>

        <section aria-label="Data transferred">
          <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Data that moves
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
              </span>
            ))}
          </div>
        </section>

        <div className="space-y-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium",
              edge.createsCopy
                ? "border-navy-300 bg-navy-50 text-navy-700"
                : "border-slate-200 bg-slate-50 text-slate-600",
            )}
          >
            <Copy size={14} aria-hidden="true" />
            {edge.createsCopy ? "Creates a new copy: yes" : "Creates a new copy: no"}
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium",
              edge.external
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-slate-200 bg-slate-50 text-slate-600",
            )}
          >
            <ExternalLink size={14} aria-hidden="true" />
            {/* Pack-driven noun: hard-coding "agency" here printed recruitment's
                word on the CA, training-institute, D2C and clinic maps. */}
            {edge.external ? "Leaves your control: yes" : `Stays inside your ${pack.lexicon.org}`}
          </div>
        </div>

        <section aria-label="Risk" className={cn("rounded-lg border p-3", risk.chip)}>
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <RiskIcon size={14} aria-hidden="true" /> {risk.label}
          </div>
          {stage && <p className="mt-1.5 text-[13px] leading-relaxed">{stage.dpdpaNote}</p>}
        </section>

        <Link
          href={`${pack.assessmentRoute}?from=data-flow`}
          onClick={onAssessmentCta}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Check this in the assessment <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

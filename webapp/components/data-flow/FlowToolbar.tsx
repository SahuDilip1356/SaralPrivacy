"use client";

// View switcher + business-model selector + risk-heat toggle + reset.

import { Flame, RotateCcw, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel } from "@/lib/data-flow/schemas";
import type { FlowView } from "@/lib/data-flow/map-builder";

const VIEW_LABELS: Record<FlowView, string> = {
  process: "Process journey",
  systems: "Systems",
  copies: "Copy spread",
  external: "External sharing",
};

const MODEL_LABELS: Record<BusinessModel, string> = {
  permanent: "Permanent recruitment",
  staffing: "Temporary staffing",
  rpo: "RPO",
  executive_search: "Executive search",
};

interface Props {
  view: FlowView;
  model: BusinessModel;
  riskHeat: boolean;
  dpdpaOverlay: boolean;
  visibleCounts: { stages: number; systems: number };
  onViewChange: (v: FlowView) => void;
  onModelChange: (m: BusinessModel) => void;
  onRiskHeatToggle: () => void;
  onDpdpaToggle: () => void;
  onReset: () => void;
}

export function FlowToolbar({
  view,
  model,
  riskHeat,
  dpdpaOverlay,
  visibleCounts,
  onViewChange,
  onModelChange,
  onRiskHeatToggle,
  onDpdpaToggle,
  onReset,
}: Props) {
  const dpdpaAvailable = view !== "systems"; // overlay annotates stage columns
  return (
    <div
      role="toolbar"
      aria-label="Map views and filters"
      className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
    >
      <div className="flex flex-wrap gap-1" role="group" aria-label="View">
        {(Object.keys(VIEW_LABELS) as FlowView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            aria-pressed={view === v}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
              view === v
                ? "bg-navy-700 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />

      <button
        type="button"
        onClick={onRiskHeatToggle}
        aria-pressed={riskHeat}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
          riskHeat
            ? "bg-red-600 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
        )}
      >
        <Flame size={13} aria-hidden="true" /> Risk heat
      </button>

      <button
        type="button"
        onClick={onDpdpaToggle}
        aria-pressed={dpdpaOverlay}
        disabled={!dpdpaAvailable}
        title={dpdpaAvailable ? undefined : "Switch to a journey view to see the DPDPA overlay"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
          !dpdpaAvailable
            ? "cursor-not-allowed bg-slate-50 text-slate-300"
            : dpdpaOverlay
              ? "bg-teal-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
        )}
      >
        <Scale size={13} aria-hidden="true" /> DPDPA overlay
      </button>

      <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />

      <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <span>Business model</span>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value as BusinessModel)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          {(Object.keys(MODEL_LABELS) as BusinessModel[]).map((m) => (
            <option key={m} value={m}>
              {MODEL_LABELS[m]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <RotateCcw size={12} aria-hidden="true" /> Reset
      </button>

      <span aria-live="polite" className="ml-auto text-[11px] font-medium text-slate-500">
        Showing {visibleCounts.stages} stages · {visibleCounts.systems} systems
      </span>
    </div>
  );
}

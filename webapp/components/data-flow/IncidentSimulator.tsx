"use client";

// "It already went wrong" - the operational-response rehearsal.
//
// Deliberately NOT breach-notification advice. It is the first hour: stop it
// spreading, correct it, tell the right people, write it down, and fix the
// control that allowed it. Whether a given incident triggers a statutory
// notification is a judgement the institution takes with its own advisers, and
// this section says so rather than implying a threshold.
//
// SHARED and pack-driven. A pack opts in by authoring `incidentScenarios`; one
// that declares none renders nothing.

import { useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode } from "@/lib/data-flow/schemas";
import { TEXT, boundaryLabel } from "./flow-theme";

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  onScenarioOpen?: (scenarioId: string, severity: string) => void;
}

// Severity reuses the risk vocabulary's fills so the page has one meaning for
// amber and one for red, rather than a second scale that looks like the first.
const SEVERITY_META = {
  medium: { label: "Contained quickly", chip: "border-amber-200 bg-amber-50 text-amber-800" },
  high: { label: "Serious", chip: "border-orange-200 bg-orange-50 text-orange-800" },
  critical: { label: "Severe", chip: "border-red-200 bg-red-50 text-red-800" },
} as const;

export function IncidentSimulator({ pack, model, onScenarioOpen }: Props) {
  const scenarios = useMemo(
    () =>
      (pack.incidentScenarios ?? []).filter(
        (s) => !s.businessModels || s.businessModels.includes(model),
      ),
    [pack.incidentScenarios, model],
  );
  const [activeId, setActiveId] = useState<string | undefined>(scenarios[0]?.id);
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];
  if (!active) return null;

  const byId = new Map(pack.nodes.map((n) => [n.id, n]));
  const involved = active.involvedNodeIds.map((id) => byId.get(id)).filter(Boolean) as FlowNode[];
  const severity = SEVERITY_META[active.severity];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose an incident">
        {scenarios.map((s) => {
          const on = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveId(s.id);
                onScenarioOpen?.(s.id, s.severity);
              }}
              aria-pressed={on}
              className={cn(
                "min-h-[44px] rounded-xl px-3.5 py-2 text-left text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                on ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-5" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold",
              TEXT.micro,
              severity.chip,
            )}
          >
            <AlertTriangle size={10} aria-hidden="true" /> {severity.label}
          </span>
        </div>

        <p className="text-[13px] leading-relaxed text-slate-700">
          <span className="font-bold text-navy-800">How you find out: </span>
          {active.trigger}
        </p>

        <div>
          <h4 className={cn("font-bold uppercase tracking-wide text-slate-500", TEXT.mini)}>
            Systems involved
          </h4>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {involved.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700",
                  TEXT.mini,
                )}
              >
                <span className="truncate font-semibold">{n.name}</span>
                <span className="shrink-0 text-slate-400">{boundaryLabel(pack, n.boundary)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h4 className={cn("font-bold uppercase tracking-wide text-red-600", TEXT.mini)}>
              First - stop it spreading
            </h4>
            <ol className="mt-2 space-y-1.5">
              {active.containment.map((step, i) => (
                <li key={step} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-700 ring-1 ring-red-200"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className={cn("font-bold uppercase tracking-wide text-slate-500", TEXT.mini)}>
              Then - correct it and record it
            </h4>
            <ol className="mt-2 space-y-1.5">
              {active.thenWhat.map((step, i) => (
                <li key={step} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 text-[13px] leading-relaxed text-teal-900">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
          <span>
            <span className="font-bold">The control that prevents a repeat: </span>
            {active.prevention}
          </span>
        </p>
      </div>
    </div>
  );
}

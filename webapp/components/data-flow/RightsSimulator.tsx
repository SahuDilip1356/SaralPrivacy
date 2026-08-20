"use client";

// "What happens when someone asks?" - the section that turns the map into a
// rehearsal.
//
// The journey answers WHERE data went. This answers what that costs you the day
// the data principal exercises a right over it: which of those places you have
// to reach, which ones you realistically cannot, and what has to happen in
// between. The honest half is `blockedNodeIds` - a walkthrough that implies
// every copy is reachable would be worse than not having the section at all.
//
// SHARED and pack-driven, like every other section here: a pack opts in by
// authoring `rightsScenarios`, and one that declares none renders nothing (the
// parent skips it). No industry gets its own component tree.

import { useMemo, useState } from "react";
import { ArrowRight, Ban, CircleCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode } from "@/lib/data-flow/schemas";
import { TEXT, boundaryLabel } from "./flow-theme";

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  onScenarioOpen?: (scenarioId: string, requestType: string) => void;
}

/** Node chip - name plus the boundary it sits in, so "who holds this" is visible
 *  without opening anything. Boundary noun comes from the pack, never hardcoded. */
function NodeChip({
  pack,
  node,
  blocked,
}: {
  pack: DataFlowPack;
  node: FlowNode;
  blocked?: boolean;
}) {
  return (
    <li
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1",
        TEXT.mini,
        blocked
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-slate-200 bg-white text-slate-700",
      )}
    >
      {blocked ? (
        <Ban size={11} className="shrink-0 text-red-500" aria-hidden="true" />
      ) : (
        <CircleCheck size={11} className="shrink-0 text-teal-600" aria-hidden="true" />
      )}
      <span className="truncate font-semibold">{node.name}</span>
      <span className="shrink-0 text-slate-400">{boundaryLabel(pack, node.boundary)}</span>
    </li>
  );
}

export function RightsSimulator({ pack, model, onScenarioOpen }: Props) {
  // Scenarios can be model-gated: a guardian-authorisation request is not a
  // question a purely adult-intake model ever gets asked.
  const scenarios = useMemo(
    () => (pack.rightsScenarios ?? []).filter((s) => !s.businessModels || s.businessModels.includes(model)),
    [pack.rightsScenarios, model],
  );
  const [activeId, setActiveId] = useState<string | undefined>(scenarios[0]?.id);

  // The selected scenario may vanish when the model changes; fall back to the
  // first available rather than rendering an empty panel.
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];
  if (!active) return null;

  const byId = new Map(pack.nodes.map((n) => [n.id, n]));
  const reaches = active.reachesNodeIds.map((id) => byId.get(id)).filter(Boolean) as FlowNode[];
  const blocked = (active.blockedNodeIds ?? []).map((id) => byId.get(id)).filter(Boolean) as FlowNode[];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a request">
        {scenarios.map((s) => {
          const on = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveId(s.id);
                onScenarioOpen?.(s.id, s.requestType);
              }}
              aria-pressed={on}
              className={cn(
                "min-h-[44px] rounded-xl px-3.5 py-2 text-left text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                on
                  ? "bg-navy-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {s.request}
            </button>
          );
        })}
      </div>

      {/* aria-live: switching request replaces everything below, and a keyboard
          or screen-reader user gets no other signal that it changed. */}
      <div className="mt-5 space-y-5" aria-live="polite">
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600">
          <UserRound size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            <span className="font-semibold text-navy-800">Who asks: </span>
            {active.who}
          </span>
        </p>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h4 className={cn("font-semibold uppercase tracking-wide text-slate-500", TEXT.mini)}>
              Where you have to look
            </h4>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {reaches.map((n) => (
                <NodeChip key={n.id} pack={pack} node={n} />
              ))}
            </ul>
          </div>
          {blocked.length > 0 && (
            <div>
              <h4 className={cn("font-semibold uppercase tracking-wide text-red-600", TEXT.mini)}>
                Where this usually cannot reach
              </h4>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {blocked.map((n) => (
                  <NodeChip key={n.id} pack={pack} node={n} blocked />
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h4 className={cn("font-semibold uppercase tracking-wide text-slate-500", TEXT.mini)}>
            What has to happen
          </h4>
          <ol className="mt-2 space-y-1.5">
            {active.steps.map((step, i) => (
              <li key={step} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-bold text-teal-800 ring-1 ring-teal-200"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[13px] leading-relaxed text-amber-900">
          <span className="font-bold">The part that usually fails: </span>
          {active.hardPart}
        </p>

        <a
          href={`${pack.assessmentRoute}?from=data-flow`}
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-teal-800 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          Check whether you could answer this today <ArrowRight size={13} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

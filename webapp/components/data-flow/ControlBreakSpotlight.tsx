"use client";

// "Where to look first": the whole journey as one compact strip of stages, then
// a Spotlight closes onto the stage holding the worst-ranked hotspot. It sits
// between the journey (which showed every stage) and the ranked hotspot list
// (which explains all of them), so the reader leaves the map knowing the one
// place to start. Pack-driven: stage count, hotspot count and the spotlit
// stage all come from config.

import { useMemo, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { Spotlight } from "@/components/motion/Spotlight";

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
}

export function ControlBreakSpotlight({ pack, model }: Props) {
  const targetRef = useRef<HTMLLIElement>(null);

  const { stages, hotByStage, worst, worstStageIndex } = useMemo(() => {
    const { stages, nodes } = filterByBusinessModel(pack, model);
    const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);
    const seq = new Map(ordered.map((s) => [s.id, s.sequence]));
    // Same rule as the journey: a system belongs to the first stage it reaches.
    const firstStage = (n: FlowNode) =>
      n.stageIds.filter((id) => seq.has(id)).sort((a, b) => seq.get(a)! - seq.get(b)!)[0];

    const hotByStage = new Map<string, number>();
    const ranked = [...pack.hotspots].sort((a, b) => a.rank - b.rank);
    let worst: { title: string; whatHappens: string; stageId: string } | undefined;
    for (const h of ranked) {
      const node = nodes.find((n) => n.id === h.nodeId);
      const sid = node && firstStage(node);
      if (!sid) continue;
      hotByStage.set(sid, (hotByStage.get(sid) ?? 0) + 1);
      worst ??= { title: h.title, whatHappens: h.whatHappens, stageId: sid };
    }
    const worstStageIndex = worst ? ordered.findIndex((s) => s.id === worst!.stageId) : -1;
    return { stages: ordered, hotByStage, worst, worstStageIndex };
  }, [pack, model]);

  if (!worst || worstStageIndex < 0) return null;
  const target = stages[worstStageIndex];

  return (
    <Spotlight
      target={targetRef}
      caption={
        <>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Hotspot 1 of {pack.hotspots.length} · Stage {worstStageIndex + 1}: {target.name}
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-navy-800">{worst.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{worst.whatHappens}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold">
            <a href={`#stage-${target.id}`} className="text-teal-800 underline-offset-2 hover:underline">
              Read stage {worstStageIndex + 1}
            </a>
            <a href="#hotspots-heading" className="text-teal-800 underline-offset-2 hover:underline">
              See all {pack.hotspots.length} hotspots
            </a>
          </p>
        </>
      }
    >
      <div className="flex h-full flex-col justify-center px-4 py-8 sm:px-6">
        <ol
          aria-label={`${pack.mainActor} journey, ${stages.length} stages`}
          className="mx-auto grid w-full max-w-5xl grid-cols-5 gap-2 lg:grid-cols-10"
        >
          {stages.map((s, i) => {
            const hot = hotByStage.get(s.id) ?? 0;
            return (
              <li
                key={s.id}
                ref={i === worstStageIndex ? targetRef : undefined}
                className={cn(
                  "flex min-h-[92px] flex-col items-center gap-1 rounded-xl border bg-white px-1.5 py-2 text-center",
                  hot ? "border-red-200" : "border-slate-200",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-800 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[11px] font-medium leading-tight text-navy-800">{s.name}</span>
                {hot > 0 && (
                  <span className="mt-auto inline-flex items-center gap-0.5 rounded bg-red-50 px-1 text-[10px] font-bold text-red-700">
                    <AlertTriangle size={9} aria-hidden="true" /> {hot}
                    <span className="sr-only"> {hot === 1 ? "place" : "places"} control breaks</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Spotlight>
  );
}

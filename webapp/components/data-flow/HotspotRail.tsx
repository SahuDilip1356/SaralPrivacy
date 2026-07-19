"use client";

// The canonical 7 hotspots, ranked worst-first. Clicking a card focuses the
// node on the canvas (via onHotspotSelect); the CTA deep-links into the
// assessment with the bucket key.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataFlowPack } from "@/lib/data-flow/schemas";
import { RISK_META } from "./flow-theme";

interface Props {
  pack: DataFlowPack;
  onHotspotSelect?: (nodeId: string, hotspotId: string) => void;
  onAssessmentCta?: (bucket: string) => void;
}

export function HotspotRail({ pack, onHotspotSelect, onAssessmentCta }: Props) {
  const ranked = [...pack.hotspots].sort((a, b) => a.rank - b.rank);
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ranked.map((h) => {
        const node = pack.nodes.find((n) => n.id === h.nodeId);
        const risk = node ? RISK_META[node.riskLevel] : RISK_META.high;
        const RiskIcon = risk.icon;
        return (
          <li key={h.id} className="flex">
            <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Hotspot {h.rank}
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", risk.chip)}>
                  <RiskIcon size={10} aria-hidden="true" /> {risk.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onHotspotSelect?.(h.nodeId, h.id)}
                className="mt-1.5 text-left text-sm font-bold leading-snug text-navy-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                {h.title}
              </button>
              <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-slate-600">{h.whatHappens}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-700">
                <span className="font-bold">Fix: </span>
                {h.action}
              </p>
              <Link
                href={`${pack.assessmentRoute}?from=data-flow&bucket=${h.assessmentBucket}`}
                onClick={() => onAssessmentCta?.(h.assessmentBucket)}
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-teal-700 hover:text-teal-800"
              >
                Check this in the assessment <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Landing-page teaser for the Personal Data Flow Map. Server component - no
// client JS, plain Link. Numbers computed from the pack, never hand-typed.
// Reused by any industry page: pass the industry's flow pack.
//
// Every number here is scoped to PREVIEW_MODEL, the model the map itself opens
// on. A teaser that promises "30 places" landing on a map that says 24 is the
// same reconciliation failure the journey counter had - a number the user
// cannot square with what they see next. Keep this in step with the map's
// initial `useState<BusinessModel>` in DataFlowClient.

import Link from "next/link";
import { ArrowRight, MapPin, Share2, Users, Workflow } from "lucide-react";
import type { DataFlowPack } from "@/lib/data-flow/schemas";
import { EXTERNAL_BOUNDARIES, filterByBusinessModel } from "@/lib/data-flow/schemas";

interface Props {
  pack: DataFlowPack;
  href: string;
}

export function DataFlowPreview({ pack, href }: Props) {
  // Scope to the model the map itself opens on (its first declared model), so
  // the teaser's numbers reconcile with what the user sees next.
  const { stages, nodes, edges } = filterByBusinessModel(pack, pack.businessModels[0].id);
  const places = nodes.filter((n) => n.nodeType !== "person").length;
  const externalParties = nodes.filter((n) => EXTERNAL_BOUNDARIES.includes(n.boundary)).length;
  const stats = [
    { icon: MapPin, value: places, label: "places their data lives" },
    { icon: Workflow, value: stages.length, label: "stages in the journey" },
    { icon: Share2, value: edges.filter((e) => e.external).length, label: "external transfers" },
    { icon: Users, value: externalParties, label: "outside parties" },
  ];
  return (
    <section aria-labelledby="data-flow-preview-heading">
      <h2 id="data-flow-preview-heading" className="text-2xl font-bold text-navy-700">
        See where {pack.lexicon.subject} data actually travels
      </h2>
      <p className="mt-1 text-sm text-slate-600">{pack.presentation.previewBlurb}</p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-navy-200 bg-navy-700 p-6 text-white">
        <p className="text-lg font-bold leading-snug">
          One {pack.lexicon.subject}&apos;s data can end up in {places} places. When they ask you
          to delete it - can you find every copy?
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="rounded-lg bg-white/10 p-2 text-teal-300" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span>
                  <span className="block text-lg font-bold leading-none">{stat.value}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-slate-300">
                    {stat.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-teal-400"
        >
          Explore the data flow map <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <p className="mt-3 text-[11px] text-slate-400">{pack.disclaimer}</p>
      </div>
    </section>
  );
}

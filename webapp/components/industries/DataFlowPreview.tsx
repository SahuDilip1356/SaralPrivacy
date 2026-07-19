// Landing-page teaser for the Personal Data Flow Map. Server component - no
// client JS, plain Link. Numbers computed from the pack, never hand-typed.
// Reused by any industry page: pass the industry's flow pack.

import Link from "next/link";
import { ArrowRight, Copy, Share2, Users, Workflow } from "lucide-react";
import type { DataFlowPack } from "@/lib/data-flow/schemas";
import { computePackSummary } from "@/lib/data-flow/schemas";

interface Props {
  pack: DataFlowPack;
  href: string;
}

export function DataFlowPreview({ pack, href }: Props) {
  const s = computePackSummary(pack);
  const stats = [
    { icon: Workflow, value: s.systems, label: "systems & repositories" },
    { icon: Copy, value: s.copyEvents, label: "copy events" },
    { icon: Share2, value: s.externalTransfers, label: "external transfers" },
    { icon: Users, value: s.externalParties, label: "outside parties" },
  ];
  return (
    <section aria-labelledby="data-flow-preview-heading">
      <h2 id="data-flow-preview-heading" className="text-2xl font-bold text-navy-700">
        See where candidate data actually travels
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Before you fix anything, see the problem. One candidate&apos;s CV moves through job
        portals, email, WhatsApp, ATS, spreadsheets, clients, vendors, AI tools and backups.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-navy-200 bg-navy-700 p-6 text-white">
        <p className="text-lg font-bold leading-snug">
          One candidate profile can end up in {s.systems}+ places. When they ask you to delete it
          - can you find every copy?
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

// The signature erasure arc (v1.1 §C) — works with motion off, server-safe.
// One person → data spreads → copies multiply → external crossings → the
// question. Numbers are computed from the pack, never hand-typed.

import { Copy, Database, Share2, Trash2, User } from "lucide-react";
import type { PackSummary } from "@/lib/data-flow/schemas";

interface Props {
  summary: PackSummary;
}

export function SignatureArc({ summary }: Props) {
  const beats = [
    { icon: User, value: "1", label: "candidate profile" },
    { icon: Database, value: String(summary.systems), label: "systems & repositories" },
    { icon: Copy, value: String(summary.copyEvents), label: "copy events" },
    { icon: Share2, value: String(summary.externalTransfers), label: "external transfers" },
  ];
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {beats.map((b) => {
          const Icon = b.icon;
          return (
            <li key={b.label} className="flex items-center gap-3">
              <span className="rounded-xl bg-white/10 p-2 text-teal-300" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-xl font-bold leading-none text-white">{b.value}</span>
                <span className="mt-1 block text-[11px] font-medium leading-tight text-slate-300">
                  {b.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-sm font-semibold text-white">
        <Trash2 size={15} className="shrink-0 text-teal-300" aria-hidden="true" />
        When a candidate asks you to delete their data — can you find every copy?
      </p>
    </div>
  );
}

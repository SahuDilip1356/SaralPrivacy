"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { mediaPlacements, tierLabels, type MediaTier } from "@/lib/mediaData";

type FilterKey = "all" | "tier1" | "tier2" | "verified";

const tierPillClass: Record<MediaTier, string> = {
  tier1: "bg-green-100 text-green-700",
  tier2: "bg-teal-100 text-teal-700",
  tier3: "bg-gold-100 text-gold-700",
  tier4: "bg-slate-100 text-slate-600",
  aggregator: "bg-navy-100 text-navy-700",
};

const counts = {
  all: mediaPlacements.length,
  tier1: mediaPlacements.filter((p) => p.tier === "tier1").length,
  tier2: mediaPlacements.filter((p) => p.tier === "tier2").length,
  verified: mediaPlacements.filter((p) => p.verified).length,
};

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: `All (${counts.all})` },
  { key: "tier1", label: `National (${counts.tier1})` },
  { key: "tier2", label: `Regional (${counts.tier2})` },
  { key: "verified", label: `✓ Verified (${counts.verified})` },
];

export function MediaCoverageList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mediaPlacements.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (filter === "tier1") return p.tier === "tier1";
      if (filter === "tier2") return p.tier === "tier2";
      if (filter === "verified") return p.verified;
      return true;
    });
  }, [query, filter]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search publisher name…"
          aria-label="Search publishers"
          className="flex-1 min-w-[200px] px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-navy-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors " +
              (filter === f.key
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-slate-600 border-slate-300 hover:bg-cloud-50")
            }
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">
          Showing {rows.length} of {counts.all}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-navy-700">
              <th className="w-12 text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                #
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Publisher
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-300 hidden sm:table-cell">
                Category
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.serial}
                className="border-b border-slate-100 last:border-0 hover:bg-green-50/40 transition-colors"
              >
                <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">{p.serial}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-semibold text-navy-700">{p.name}</span>
                  {p.verified && (
                    <span className="ml-2 text-[10px] font-semibold text-green-600">
                      ✓ verified
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={
                      "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap " +
                      tierPillClass[p.tier]
                    }
                  >
                    {tierLabels[p.tier]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="nofollow noopener"
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 border border-teal-200 rounded-md px-2.5 py-1 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-colors"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Syndicated</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                  No publishers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

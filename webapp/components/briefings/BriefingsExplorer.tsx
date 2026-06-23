"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Search, X, Sparkles, SearchX } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import {
  STAGES, FORMATS, BRIEFING_SECTORS, FORMAT_SLUGS,
  stageLabel, sectorLabel, formatLabel,
} from "@/lib/data/briefing-taxonomy";

export interface ExplorerBriefing {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  image: string;   // infographic URL (or data URI); "" when none
  stage: string;   // from category
  sector: string;  // from industries[0]
  format: string;  // from tags[0] (a known format slug) or ""
}

const STAGE_SLUGS = STAGES.map((s) => s.slug);
const FORMAT_LIST = FORMATS.map((f) => f.slug);

function matchesQuery(b: ExplorerBriefing, q: string): boolean {
  if (!q) return true;
  const hay = `${b.title} ${b.excerpt} ${sectorLabel(b.sector)} ${stageLabel(b.stage)} ${formatLabel(b.format)}`.toLowerCase();
  return q.split(/\s+/).every((term) => hay.includes(term));
}

export function BriefingsExplorer({ briefings }: { briefings: ExplorerBriefing[] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [stages, setStages] = useState<Set<string>>(new Set());
  const [formats, setFormats] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const isFiltered = q !== "" || sector !== "" || stages.size > 0 || formats.size > 0;

  // Items passing search — the base set all facet counts are computed against.
  const searched = useMemo(
    () => briefings.filter((b) => matchesQuery(b, q)),
    [briefings, q]
  );

  // A match helper that can exclude one group, for faceted counts.
  const passes = (b: ExplorerBriefing, skip?: "sector" | "stage" | "format") => {
    if (skip !== "sector" && sector && b.sector !== sector) return false;
    if (skip !== "stage" && stages.size && !stages.has(b.stage)) return false;
    if (skip !== "format" && formats.size && !formats.has(b.format)) return false;
    return true;
  };

  const results = useMemo(
    () => searched.filter((b) => passes(b)),
    [searched, sector, stages, formats]
  );

  // Counts respect search + the OTHER groups' active filters.
  const sectorCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of searched) if (passes(b, "sector")) m.set(b.sector, (m.get(b.sector) ?? 0) + 1);
    return m;
  }, [searched, stages, formats]);
  const stageCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of searched) if (passes(b, "stage")) m.set(b.stage, (m.get(b.stage) ?? 0) + 1);
    return m;
  }, [searched, sector, formats]);
  const formatCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of searched) if (passes(b, "format")) m.set(b.format, (m.get(b.format) ?? 0) + 1);
    return m;
  }, [searched, sector, stages]);

  const startHere = useMemo(
    () => briefings.filter((b) => b.stage === "learn").slice(0, 4),
    [briefings]
  );

  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };
  const clearAll = () => { setQuery(""); setSector(""); setStages(new Set()); setFormats(new Set()); };

  const chipBase =
    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1";

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <label htmlFor="briefing-search" className="sr-only">Search briefings</label>
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          id="briefing-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${briefings.length} briefings — try "school", "vendor risk", "consent"`}
          className="w-full pl-11 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Facets */}
      <div className="space-y-2.5 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 w-14 shrink-0">Sector</span>
          <select
            aria-label="Filter by sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="text-xs h-8 px-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All sectors</option>
            {BRIEFING_SECTORS.map((s) => {
              const c = sectorCounts.get(s.slug) ?? 0;
              if (c === 0 && s.slug !== sector) return null;
              return <option key={s.slug} value={s.slug}>{s.label} ({c})</option>;
            })}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 w-14 shrink-0">Stage</span>
          {STAGES.map((s) => {
            const on = stages.has(s.slug);
            const c = stageCounts.get(s.slug) ?? 0;
            return (
              <button key={s.slug} type="button" aria-pressed={on} title={s.hint}
                onClick={() => toggle(stages, s.slug, setStages)}
                className={`${chipBase} ${on ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s.label} {c}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 w-14 shrink-0">Format</span>
          {FORMATS.map((f) => {
            const on = formats.has(f.slug);
            const c = formatCounts.get(f.slug) ?? 0;
            if (c === 0 && !on) return null;
            return (
              <button key={f.slug} type="button" aria-pressed={on}
                onClick={() => toggle(formats, f.slug, setFormats)}
                className={`${chipBase} ${on ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {f.label} {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Applied filters + live count */}
      <div role="status" aria-live="polite" className="flex items-center gap-2 flex-wrap pt-3 mb-6 border-t border-slate-200">
        <span className="text-sm font-semibold text-slate-600">{results.length} result{results.length === 1 ? "" : "s"}</span>
        {sector && (
          <button onClick={() => setSector("")} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-600 text-white">
            {sectorLabel(sector)} <X size={13} />
          </button>
        )}
        {[...stages].map((s) => (
          <button key={s} onClick={() => toggle(stages, s, setStages)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-700 text-white">
            {stageLabel(s)} <X size={13} />
          </button>
        ))}
        {[...formats].map((f) => (
          <button key={f} onClick={() => toggle(formats, f, setFormats)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-600 text-white">
            {formatLabel(f)} <X size={13} />
          </button>
        ))}
        {isFiltered && (
          <button onClick={clearAll} className="text-xs font-semibold text-teal-700 hover:text-teal-800">Clear all</button>
        )}
      </div>

      {/* Start here — only when nothing is filtered */}
      {!isFiltered && startHere.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={15} className="text-slate-400" aria-hidden />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start here</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {startHere.map((b) => (
              <Link key={b.id} href={`/briefings/${b.slug}`}
                className="block p-3.5 rounded-lg border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                <span className="text-[10px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full">Learn</span>
                <p className="text-sm text-slate-700 mt-2 leading-snug line-clamp-2">{b.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((b) => (
            <Link key={b.id} href={`/briefings/${b.slug}`}>
              <div className="group h-full flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-teal-300 hover:shadow-sm transition-all">
                {b.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={b.image}
                    alt=""
                    loading="lazy"
                    className="w-full aspect-[16/9] object-cover bg-slate-100 border-b border-slate-100"
                  />
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {b.sector !== "general" && (
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">{sectorLabel(b.sector)}</span>
                    )}
                    {STAGE_SLUGS.includes(b.stage) && (
                      <span className="text-[10px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full">{stageLabel(b.stage)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-navy-700 text-base leading-snug mb-2 group-hover:text-green-600 line-clamp-3">{b.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">{b.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDateShort(b.date)}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{b.readTime} min</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl border border-slate-200 bg-white">
          <SearchX size={28} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-slate-700 font-medium mt-3 mb-1">No briefings match your filters</p>
          <p className="text-sm text-slate-500 mb-4">Try removing a filter or clearing your search.</p>
          <button onClick={clearAll} className="text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors">Clear all filters</button>
        </div>
      )}
    </div>
  );
}

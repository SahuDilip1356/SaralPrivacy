"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Calendar, Clock, Search, X, SearchX,
  Compass, Zap, AlertTriangle, Check,
} from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import {
  STAGES, FORMATS, BRIEFING_SECTORS, FORMAT_SLUGS,
  stageLabel, sectorLabel, formatLabel, stageJtbd, stageCta,
  riskFor, RISK_LABEL, FACET_HEADERS, type RiskTier,
} from "@/lib/data/briefing-taxonomy";

export interface ExplorerBriefing {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  image: string;    // infographic URL (or data URI); "" when none
  fixToday: string; // first action-checklist item; "" when none
  stage: string;    // from category
  sector: string;   // from industries[0]
  format: string;   // from tags[0] (a known format slug) or ""
}

const STAGE_SLUGS = STAGES.map((s) => s.slug);

const RISK_CHIP: Record<RiskTier, string> = {
  high:   "text-red-700 bg-red-100",
  medium: "text-amber-800 bg-amber-100",
  low:    "text-slate-600 bg-slate-100",
};

// Inline conversion bands, rotated through the results list.
const INLINE_CTAS = [
  { title: "Not sure what data you hold?", sub: "Map every place personal data lives in 10 minutes.", label: "Run Data Discovery", href: "/discovery" },
  { title: "Want your DPDPA risk score?",  sub: "Take the free 3–5 minute readiness assessment.",     label: "Check my score",     href: "/assessment" },
  { title: "Need ready-to-use templates?", sub: "Consent forms, notices and checklists, done for you.", label: "Browse templates",  href: "/resources" },
];

function matchesQuery(b: ExplorerBriefing, q: string): boolean {
  if (!q) return true;
  const hay = `${b.title} ${b.excerpt} ${b.fixToday} ${sectorLabel(b.sector)} ${stageLabel(b.stage)} ${formatLabel(b.format)}`.toLowerCase();
  return q.split(/\s+/).every((term) => hay.includes(term));
}

export function BriefingsExplorer({ briefings }: { briefings: ExplorerBriefing[] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [stages, setStages] = useState<Set<string>>(new Set());
  const [formats, setFormats] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const isFiltered = q !== "" || sector !== "" || stages.size > 0 || formats.size > 0;

  const searched = useMemo(() => briefings.filter((b) => matchesQuery(b, q)), [briefings, q]);

  const passes = (b: ExplorerBriefing, skip?: "sector" | "stage" | "format") => {
    if (skip !== "sector" && sector && b.sector !== sector) return false;
    if (skip !== "stage" && stages.size && !stages.has(b.stage)) return false;
    if (skip !== "format" && formats.size && !formats.has(b.format)) return false;
    return true;
  };

  const results = useMemo(() => searched.filter((b) => passes(b)), [searched, sector, stages, formats]);

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

  // Featured rail (zero-filter only): Start here · Fix today · Sector alert.
  // Only includes a slot when a matching briefing exists, so the row never has holes.
  const featured = useMemo(() => {
    const startHere   = briefings.find((b) => b.stage === "learn");
    const fixToday    = briefings.find((b) => b.stage === "fix") ?? briefings.find((b) => b.fixToday);
    const sectorAlert = briefings.find((b) => b.sector !== "general");
    const used = new Set<string>();
    const pick = (b?: ExplorerBriefing) => {
      if (!b || used.has(b.id)) return undefined;
      used.add(b.id);
      return b;
    };
    return [
      { tone: "blue"  as const, eyebrow: "Start here",   cta: "Read guide", b: pick(startHere) },
      { tone: "red"   as const, eyebrow: "Fix today",    cta: "Fix now",    b: pick(fixToday) },
      { tone: "amber" as const, eyebrow: "Sector alert", cta: "See alert",  b: pick(sectorAlert) },
    ].filter((f) => f.b);
  }, [briefings]);

  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };
  const clearAll = () => { setQuery(""); setSector(""); setStages(new Set()); setFormats(new Set()); };

  const chipBase =
    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1";

  // Interleave conversion bands into the results every 6 cards — a multiple of the
  // 3-column grid, so each band always follows a complete row (no half-empty rows).
  const gridItems: React.ReactNode[] = [];
  results.forEach((b, i) => {
    gridItems.push(<BriefingCard key={b.id} b={b} />);
    if ((i + 1) % 6 === 0 && i !== results.length - 1) {
      const cta = INLINE_CTAS[Math.floor(i / 6) % INLINE_CTAS.length];
      gridItems.push(
        <Link key={`cta-${i}`} href={cta.href}
          className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-navy-700 px-6 py-5 hover:bg-navy-800 transition-colors">
          <div>
            <p className="text-white font-bold text-base">{cta.title}</p>
            <p className="text-slate-300 text-sm">{cta.sub}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-lg shrink-0">
            {cta.label} <ArrowRight size={15} />
          </span>
        </Link>
      );
    }
  });

  return (
    <div>
      {/* Featured rail — only when nothing is filtered; sized to the cards that exist */}
      {!isFiltered && featured.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 mb-8 ${
          featured.length >= 3 ? "md:grid-cols-3" : featured.length === 2 ? "md:grid-cols-2" : ""
        }`}>
          {featured.map((f) => (
            <FeaturedCard key={f.eyebrow} tone={f.tone} eyebrow={f.eyebrow} cta={f.cta} b={f.b!} />
          ))}
        </div>
      )}

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

      {/* Facets — plain-English, jobs-to-be-done labels */}
      <div className="space-y-2.5 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 w-32 shrink-0">{FACET_HEADERS.sector}</span>
          <select aria-label="Filter by business type" value={sector} onChange={(e) => setSector(e.target.value)}
            className="text-xs h-8 px-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All business types</option>
            {BRIEFING_SECTORS.map((s) => {
              const c = sectorCounts.get(s.slug) ?? 0;
              if (c === 0 && s.slug !== sector) return null;
              return <option key={s.slug} value={s.slug}>{s.label} ({c})</option>;
            })}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 w-32 shrink-0">{FACET_HEADERS.stage}</span>
          {STAGES.map((s) => {
            const on = stages.has(s.slug);
            const c = stageCounts.get(s.slug) ?? 0;
            return (
              <button key={s.slug} type="button" aria-pressed={on} title={s.hint}
                onClick={() => toggle(stages, s.slug, setStages)}
                className={`${chipBase} ${on ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {stageJtbd(s.slug)} {c}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 w-32 shrink-0">{FACET_HEADERS.format}</span>
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
      <div role="status" aria-live="polite" className="flex items-center gap-2 flex-wrap pt-3 mb-6 border-t border-slate-200" id="latest-briefings">
        <span className="text-sm font-semibold text-slate-600">{results.length} result{results.length === 1 ? "" : "s"}</span>
        {sector && (
          <button onClick={() => setSector("")} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-600 text-white">
            {sectorLabel(sector)} <X size={13} />
          </button>
        )}
        {[...stages].map((s) => (
          <button key={s} onClick={() => toggle(stages, s, setStages)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-700 text-white">
            {stageJtbd(s)} <X size={13} />
          </button>
        ))}
        {[...formats].map((f) => (
          <button key={f} onClick={() => toggle(formats, f, setFormats)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-600 text-white">
            {formatLabel(f)} <X size={13} />
          </button>
        ))}
        {isFiltered && (
          <button onClick={clearAll} className="text-xs font-semibold text-teal-800 hover:text-teal-900">Clear all</button>
        )}
      </div>

      {/* Results + interleaved CTAs */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridItems}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl border border-slate-200 bg-white">
          <SearchX size={28} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-slate-700 font-medium mt-3 mb-1">No briefings match your filters</p>
          <p className="text-sm text-slate-500 mb-4">Try removing a filter or clearing your search.</p>
          <button onClick={clearAll} className="text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors">Clear all filters</button>
        </div>
      )}

      {/* Closing conversion CTA */}
      <div className="mt-12 text-center rounded-2xl border border-slate-200 bg-white py-10 px-6">
        <h2 className="text-xl font-semibold text-navy-700 mb-2">Not sure where to start?</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-5">
          Take the free 5-minute readiness assessment and get a personalised DPDPA roadmap for your business type.
        </p>
        <Link href="/assessment"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors">
          Take free readiness assessment <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

/** Action-desk briefing card: thumbnail + risk/sector/stage badges + fix-today + dual CTA. */
function BriefingCard({ b }: { b: ExplorerBriefing }) {
  const risk = riskFor(b.sector);
  const cta = stageCta(b.stage);
  const [imgOk, setImgOk] = useState(Boolean(b.image));
  return (
    <div className="group h-full flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-teal-300 hover:shadow-sm transition-all">
      {imgOk && b.image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={b.image} alt="" loading="lazy" onError={() => setImgOk(false)}
          className="w-full aspect-[2/1] object-cover bg-slate-100 border-b border-slate-100" />
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RISK_CHIP[risk]}`}>{RISK_LABEL[risk]}</span>
          {b.sector !== "general" && (
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">{sectorLabel(b.sector)}</span>
          )}
          {STAGE_SLUGS.includes(b.stage) && (
            <span className="text-[10px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full">{stageLabel(b.stage)}</span>
          )}
          <span className="ml-auto inline-flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1"><Calendar size={11} />{formatDateShort(b.date)}</span>
            <span className="inline-flex items-center gap-1"><Clock size={11} />{b.readTime} min</span>
          </span>
        </div>

        <Link href={`/briefings/${b.slug}`} className="block">
          <h3 className="font-semibold text-navy-700 text-base leading-snug mb-2 group-hover:text-green-900 line-clamp-2">{b.title}</h3>
        </Link>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{b.excerpt}</p>

        {b.fixToday && (
          <div className="flex items-start gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 mb-3">
            <Check size={13} className="mt-0.5 shrink-0" aria-hidden />
            <span className="leading-snug"><span className="font-semibold">Fix this today:</span> {b.fixToday}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <Link href={`/briefings/${b.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-green-900">
            Read briefing <ArrowRight size={13} />
          </Link>
          <Link href={cta.href} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
            {cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

const FEATURED_TONE = {
  blue:  { bar: "border-blue-400",  bg: "bg-blue-50",  text: "text-blue-700" },
  red:   { bar: "border-red-400",   bg: "bg-red-50",   text: "text-red-600" },
  amber: { bar: "border-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
} as const;

const FEATURED_ICON: Record<keyof typeof FEATURED_TONE, React.ReactNode> = {
  blue:  <Compass size={13} />,
  red:   <Zap size={13} />,
  amber: <AlertTriangle size={13} />,
};

function FeaturedCard({ tone, eyebrow, b, cta }:
  { tone: keyof typeof FEATURED_TONE; eyebrow: string; b: ExplorerBriefing; cta: string }) {
  const t = FEATURED_TONE[tone];
  return (
    <Link href={`/briefings/${b.slug}`}
      className={`block rounded-xl border border-slate-200 border-l-4 ${t.bar} ${t.bg} p-5 hover:shadow-sm transition-shadow`}>
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide ${t.text} mb-2`}>
        {FEATURED_ICON[tone]} {eyebrow}
      </span>
      <h3 className="font-semibold text-navy-700 text-[15px] leading-snug mb-1.5 line-clamp-2">{b.title}</h3>
      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-3">{b.excerpt}</p>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${t.text}`}>{cta} <ArrowRight size={13} /></span>
    </Link>
  );
}

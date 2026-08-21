"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { BRIEFING_SECTORS, sectorLabel, stageLabel, STAGE_SLUGS } from "@/lib/data/briefing-taxonomy";
import { TOPICS, topicLabel } from "@/lib/data/briefing-topics";
import type { ArchiveBriefing } from "@/lib/data/briefings-archive";

/**
 * The opener: a sentence the reader finishes about their own week.
 *
 * A taxonomy asks a visitor to learn our vocabulary before they can use the
 * archive. A sentence asks them something they already know the answer to. The
 * words are symptoms, but each one is wired to a topic slug, so this is the same
 * filter the rest of the page uses wearing plain English.
 *
 * The industry SORTS, it does not filter, and that is not a style choice. Across
 * the 240-day roadmap, 88 of the 330 symptom x industry pairs are empty and most
 * of the rest hold one or two briefings — hard-ANDing them would rebuild the same
 * dead end the Sector x Stage facets already have. So the shelf is always the
 * whole topic, with the reader's own industry lifted to the top.
 */
const SHELF = 6;

export function BriefingSentence({ briefings }: { briefings: ArchiveBriefing[] }) {
  const sectors = useMemo(() => {
    const present = new Set(briefings.map((b) => b.sector));
    return BRIEFING_SECTORS.filter((s) => s.slug !== "general" && present.has(s.slug));
  }, [briefings]);

  // Local state only, deliberately. Syncing this into the query string would give
  // half-linkable shelves that still render empty to a crawler and to anyone who
  // opens the link cold. The real fix is server-rendered /briefings/topic/[slug]
  // and /briefings/industry/[slug] routes, which is a separate piece of work.
  const [sector, setSector] = useState("");
  const [topic, setTopic] = useState(TOPICS[0].slug);

  const { mine, rest, total } = useMemo(() => {
    const all = briefings.filter((b) => b.topics.includes(topic));
    const m = sector ? all.filter((b) => b.sector === sector) : [];
    return { mine: m, rest: all.filter((b) => !m.includes(b)), total: all.length };
  }, [briefings, topic, sector]);

  const shown = [...mine, ...rest.slice(0, Math.max(2, SHELF - mine.length))];
  const label = sector ? sectorLabel(sector) : "";

  const field =
    "font-heading font-semibold text-navy-700 bg-transparent border-0 border-b-2 border-green-500 " +
    "cursor-pointer px-1 pb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 " +
    "hover:bg-cloud-100 rounded-t " +
    // Leave room on the line for the full stop that follows, or it orphans onto
    // a line of its own on a phone.
    "max-w-[calc(100%-0.8rem)]";

  return (
    <div>
      <p className="text-xl sm:text-2xl lg:text-3xl leading-relaxed text-slate-700 mb-8">
        <span className="whitespace-nowrap">I work in</span>{" "}
        <select aria-label="Your industry" value={sector} onChange={(e) => setSector(e.target.value)}
          className={`${field} text-xl sm:text-2xl lg:text-3xl`}>
          <option value="">any business</option>
          {sectors.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
        </select>
        <br className="hidden sm:block" />{" "}
        <span className="whitespace-nowrap">and</span>{" "}
        <select aria-label="What is happening" value={topic} onChange={(e) => setTopic(e.target.value)}
          className={`${field} text-xl sm:text-2xl lg:text-3xl`}>
          {TOPICS.map((t) => <option key={t.slug} value={t.slug}>{t.symptom}</option>)}
        </select>.
      </p>

      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {sector && mine.length > 0
            ? `${label} — yours first`
            : sector
              ? `Nothing for ${label} on this yet`
              : topicLabel(topic)}
        </h2>
        <span className="text-xs text-slate-600">{total} briefing{total === 1 ? "" : "s"} on this</span>
      </div>

      <ul className="mb-4">
        {shown.map((b) => {
          const yours = Boolean(sector) && b.sector === sector;
          return (
            <li key={b.id} className="border-t border-slate-100">
              <Link href={`/briefings/${b.slug}`} className="group block py-3.5">
                {(b.infTitle || b.weekTheme) && (
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-green-800 leading-snug">
                    {b.infTitle || b.weekTheme}
                  </span>
                )}
                <span className="block text-base font-medium text-navy-700 group-hover:text-green-900 transition-colors mt-0.5">
                  {b.verdict || b.title}
                </span>
                <span className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {yours && (
                    <span className="text-[10px] font-semibold text-gold-900 bg-gold-100 px-2 py-0.5 rounded-full">Yours</span>
                  )}
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                    {b.sector === "general" ? "All sectors" : sectorLabel(b.sector)}
                  </span>
                  {STAGE_SLUGS.has(b.stage) && (
                    <span className="text-[10px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full">
                      {stageLabel(b.stage)}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-600 ml-auto">{formatDateShort(b.date)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-slate-600">
        {sector && mine.length > 0 ? (
          <><strong className="text-navy-700">{mine.length}</strong> written for {label}, and{" "}
            <strong className="text-navy-700">{rest.length}</strong> more across every industry.</>
        ) : sector ? (
          <>No {label} briefing covers this yet, so these are the{" "}
            <strong className="text-navy-700">{rest.length}</strong> that do.</>
        ) : (
          <>Pick your industry above and yours move to the top.</>
        )}
        {total > shown.length && (
          <> <Link href="/briefings/all" className="font-semibold text-green-800 hover:text-green-700 inline-flex items-center gap-1">
            See all {total} <ArrowRight size={13} />
          </Link></>
        )}
      </p>
    </div>
  );
}

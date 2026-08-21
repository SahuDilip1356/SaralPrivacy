"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import { sectorLabel, stageLabel, STAGE_SLUGS } from "@/lib/data/briefing-taxonomy";
import { TOPICS, topicLabel } from "@/lib/data/briefing-topics";
import type { ArchiveBriefing } from "@/lib/data/briefings-archive";

/**
 * The wall of verdicts — the browse surface, replacing the card grid.
 *
 * Every briefing ends on a save-worthy line, and the old card buried it under a
 * hook headline and an infographic. The hook is an email subject line by
 * construction ("Max 55 chars. Punchy.") so it carries almost none of the words
 * a reader scans for; the verdict carries most of them. So the verdict leads and
 * the rest of the card is built underneath it.
 *
 * The subject, sector, stage and date sit inside the card rather than appearing
 * on hover. Hover-to-reveal read fine on a desktop mouse and showed nothing at
 * all on a phone, which is where most of this archive is read.
 *
 * Briefings with no stored verdict fall back to their headline rather than
 * vanishing from the archive.
 *
 * A card is roughly twice the height of the line it replaced, so the first page
 * is half what it was. Measured over 48 briefings the two settings land within a
 * few hundred pixels of each other — 1.9k against the line-list's 2.1k on
 * desktop, 4.0k against 5.1k on a phone — so the cards cost nothing in scroll
 * depth, which is the thing this whole page was rebuilt to fix.
 */
const PAGE = 24;

export function VerdictWall({ briefings }: { briefings: ArchiveBriefing[] }) {
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of briefings) for (const t of b.topics) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  }, [briefings]);

  const rows = useMemo(
    () => (topic ? briefings.filter((b) => b.topics.includes(topic)) : briefings),
    [briefings, topic]
  );

  const pick = (slug: string) => {
    setTopic((cur) => (cur === slug ? "" : slug));
    setLimit(PAGE);
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        {TOPICS.map((t) => {
          const n = counts.get(t.slug) ?? 0;
          if (!n) return null;
          const on = t.slug === topic;
          return (
            <button key={t.slug} type="button" aria-pressed={on} onClick={() => pick(t.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                on ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              {t.label} {n}
            </button>
          );
        })}
      </div>

      <ul className="sm:columns-2 sm:gap-5">
        {rows.slice(0, limit).map((b) => (
          <li key={b.id} className="break-inside-avoid mb-4">
            <Link href={`/briefings/${b.slug}`}
              className="group block rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300 transition-colors">
              {/* Clamped: the kicker is context, and an unusually long inf_title
                  should never out-shout the verdict under it. */}
              {(b.infTitle || b.weekTheme) && (
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-green-800 leading-snug line-clamp-2">
                  {b.infTitle || b.weekTheme}
                </span>
              )}
              <q className="block font-heading text-[17px] leading-snug text-navy-700 group-hover:text-green-900 transition-colors mt-1">
                {b.verdict || b.title}
              </q>
              <span className="flex items-center gap-1.5 mt-3 flex-wrap">
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
        ))}
      </ul>

      <div className="flex items-center gap-4 flex-wrap mt-6">
        <p className="text-sm text-slate-600">
          Showing {Math.min(limit, rows.length)} of {rows.length}
          {topic ? <> on {topicLabel(topic)}</> : null}
        </p>
        {limit < rows.length && (
          <button type="button" onClick={() => setLimit((l) => l + PAGE)}
            className="text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors">
            Show {Math.min(PAGE, rows.length - limit)} more
          </button>
        )}
      </div>
    </div>
  );
}

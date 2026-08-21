"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TOPICS, topicLabel } from "@/lib/data/briefing-topics";
import type { ArchiveBriefing } from "@/lib/data/briefings-archive";

/**
 * The wall of verdicts — the browse surface, replacing the card grid.
 *
 * Every briefing ends on a save-worthy line, and the card buried it under a hook
 * headline and an infographic. The hook is an email subject line by construction
 * ("Max 55 chars. Punchy.") so it carries almost none of the words a reader
 * scans for; the verdict carries most of them. Stripping everything else away
 * makes the page scannable by eye and readable by a crawler, and it costs a
 * fraction of the markup a card does.
 *
 * Briefings with no stored verdict fall back to their headline rather than
 * vanishing from the archive.
 */
const PAGE = 48;

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

      <ul className="sm:columns-2 sm:gap-8">
        {rows.slice(0, limit).map((b) => (
          <li key={b.id} className="break-inside-avoid border-b border-slate-100">
            <Link href={`/briefings/${b.slug}`} className="group block py-3">
              <q className="block font-heading text-[17px] leading-snug text-navy-700 group-hover:text-green-900 transition-colors">
                {b.verdict || b.title}
              </q>
              <span className="block text-[11px] text-slate-600 mt-1.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity">
                {b.infTitle || b.weekTheme || "Read the briefing"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 flex-wrap mt-6">
        <p className="text-sm text-slate-600">
          Showing {Math.min(limit, rows.length)} of {rows.length}
          {topic ? <> on {topicLabel(topic)}</> : null} · hover a line for its subject
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

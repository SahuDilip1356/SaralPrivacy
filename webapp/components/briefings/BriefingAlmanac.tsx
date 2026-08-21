"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import { sectorLabel } from "@/lib/data/briefing-taxonomy";
import { TOPICS, topicLabel } from "@/lib/data/briefing-topics";
import type { ArchiveBriefing } from "@/lib/data/briefings-archive";

/**
 * The run — one cell per morning, the whole archive at a glance.
 *
 * Publishing every day without missing one is the most impressive fact about
 * this product and the page states it nowhere. As a way of finding a briefing
 * this is weak, because nobody knows which date they want; as proof that the
 * thing is alive it is the strongest asset on the page, and picking a topic
 * shows a reader at once that it runs right through the year rather than being
 * one old post.
 *
 * Cells sit on their real weekday, so the grid reads as a calendar rather than a
 * bar. Colour is one hue at two opacities — published, and matching the filter —
 * which needs no categorical palette and stays legible without relying on hue.
 */
export function BriefingAlmanac({ briefings }: { briefings: ArchiveBriefing[] }) {
  const [topic, setTopic] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const days = useMemo(
    () => [...briefings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [briefings]
  );

  const lead = days.length ? new Date(days[0].date).getDay() : 0;
  const matching = topic ? days.filter((d) => d.topics.includes(topic)).length : 0;
  const current = picked ? days.find((d) => d.id === picked) : null;

  if (!days.length) return null;

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, 11px)" }}>
          {Array.from({ length: lead }, (_, i) => (
            <span key={`lead-${i}`} className="w-[11px] h-[11px] rounded-[2px]" aria-hidden />
          ))}
          {days.map((b) => {
            const hit = Boolean(topic) && b.topics.includes(topic);
            return (
              <button key={b.id} type="button"
                onClick={() => setPicked(picked === b.id ? null : b.id)}
                title={`${formatDateShort(b.date)} — ${b.infTitle || b.title}`}
                aria-label={`${formatDateShort(b.date)}: ${b.infTitle || b.title}`}
                className={`w-[11px] h-[11px] rounded-[2px] bg-green-600 transition-opacity ${
                  topic ? (hit ? "opacity-100" : "opacity-25") : "opacity-60"
                } ${picked === b.id ? "ring-2 ring-navy-700 ring-offset-1" : ""}`} />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap mt-4">
        <span className="text-sm text-slate-600">
          <strong className="text-navy-700">{days.length}</strong> mornings, unbroken
        </span>
        <label className="text-sm text-slate-600 ml-auto">
          <span className="sr-only">Highlight a topic</span>
          <select value={topic} onChange={(e) => { setTopic(e.target.value); setPicked(null); }}
            className="text-xs h-8 px-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Highlight a topic…</option>
            {TOPICS.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-3 min-h-[3.5rem] text-sm">
        {current ? (
          <Link href={`/briefings/${current.slug}`} className="group block">
            <span className="text-slate-600">{formatDateShort(current.date)} · {current.sector === "general" ? "All sectors" : sectorLabel(current.sector)}</span>
            <span className="block text-navy-700 font-medium group-hover:text-green-900 transition-colors">
              {current.verdict || current.title}
            </span>
          </Link>
        ) : topic ? (
          <p className="text-slate-600">
            <strong className="text-navy-700">{matching}</strong> of {days.length} mornings touch{" "}
            {topicLabel(topic)} — spread across the run, not clustered in one old month.
          </p>
        ) : (
          <p className="text-slate-600">Pick any day to see what it said.</p>
        )}
      </div>
    </div>
  );
}

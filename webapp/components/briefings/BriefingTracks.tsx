"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { sectorLabel, stageLabel, STAGE_SLUGS } from "@/lib/data/briefing-taxonomy";
import type { Track } from "@/lib/data/briefings-archive";

/**
 * Tracks — the same briefings, counted the way they were written.
 *
 * Every vertical is already five consecutive mornings and every foundation week
 * is already a themed set. That is a syllabus, not an archive, and the page has
 * never said so. "Part 2 of 5, about fifteen minutes" changes what a reader does
 * with five posts: there is something to finish and a reason to come back.
 *
 * No new writing — only a different way of counting what is already published.
 */
export function BriefingTracks({ tracks }: { tracks: Track[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const active = tracks.find((t) => t.key === open) ?? null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tracks.slice(0, 12).map((t) => {
          const on = t.key === open;
          const title = t.kind === "sector" ? sectorLabel(t.title) : t.title;
          return (
            <button key={t.key} type="button" aria-pressed={on} aria-expanded={on}
              onClick={() => setOpen(on ? null : t.key)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                on ? "bg-navy-700 border-navy-700" : "bg-white border-slate-200 hover:border-teal-300"
              }`}>
              <span className={`block font-semibold text-[15px] leading-snug ${on ? "text-white" : "text-navy-700"}`}>
                {title}
              </span>
              {/* No progress pips. Every part in the archive is published, so a row of
                  identical dots would encode nothing the line below doesn't already say. */}
              <span className={`block text-xs mt-1.5 ${on ? "text-slate-300" : "text-slate-600"}`}>
                {t.briefings.length} part{t.briefings.length === 1 ? "" : "s"} · about {t.briefings.length * 3} min
                {t.kind === "week" ? " · foundations" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <h3 className="font-semibold text-navy-700 text-lg">
              {active.kind === "sector" ? sectorLabel(active.title) : active.title}
            </h3>
            <span className="text-xs text-slate-600">
              {active.briefings.length} parts, in order
            </span>
          </div>
          <ol>
            {active.briefings.map((b, i) => (
              <li key={b.id} className="border-t border-slate-100">
                <Link href={`/briefings/${b.slug}`} className="group flex gap-4 py-3.5">
                  <span className="shrink-0 w-11 text-xs text-slate-600 leading-snug">
                    <Check size={13} className="text-green-700 inline-block mr-0.5 -mt-0.5" aria-hidden />
                    {i + 1}/{active.briefings.length}
                  </span>
                  <span className="min-w-0">
                    {b.infTitle && (
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-green-800 leading-snug">
                        {b.infTitle}
                      </span>
                    )}
                    <span className="block text-[15px] font-medium text-navy-700 group-hover:text-green-900 transition-colors mt-0.5">
                      {b.verdict || b.title}
                    </span>
                    {STAGE_SLUGS.has(b.stage) && (
                      <span className="inline-block text-[10px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full mt-2">
                        {stageLabel(b.stage)}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tracks.length > 12 && (
        <p className="text-sm text-slate-600 mt-5">
          {tracks.length - 12} more tracks in{" "}
          <Link href="/briefings/all" className="font-semibold text-green-800 hover:text-green-700 inline-flex items-center gap-1">
            the full archive <ArrowRight size={13} />
          </Link>
        </p>
      )}
    </div>
  );
}

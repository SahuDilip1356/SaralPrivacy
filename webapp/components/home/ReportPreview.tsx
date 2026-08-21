"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Mail } from "lucide-react";
import {
  VERDICT_PREVIEWS,
  VERDICT_CHECKLIST,
} from "@/lib/data/verdict-previews";
import { trackEvent } from "@/lib/analytics";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ScoreDial } from "@/components/home/ScoreDial";

// S4 — "Your report". The page's product demonstration, and its largest
// section. Previously a max-w-3xl card among other cards; the report is the
// thing being sold, so it gets the room.
//
// It shows all six deliverables the real assessment produces, and nothing else:
//   score 0-100 · risk category · five dimensions · top three gaps ·
//   first three actions · checklist + option to email the report
// That list is app/assessment/SurveyClient.tsx's own "What you'll get". If the
// real report changes, this changes with it — never the other way round.
//
// Illustrative sample, labelled in every state. Never fake "your" data.

export function ReportPreview() {
  const [active, setActive] = useState(VERDICT_PREVIEWS[0].slug);
  const v = VERDICT_PREVIEWS.find((p) => p.slug === active) ?? VERDICT_PREVIEWS[0];

  return (
    <Section surface="white" type="demo" divider>
      <div className="text-center mb-8">
        <Eyebrow className="mb-3">Your report</Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-3">
          This is what you get at the end
        </h2>
        <p className="text-slate-600 text-base max-w-lg mx-auto leading-relaxed">
          Every assessment ends in a scored, sector-specific report. Here is the
          shape of one — pick a sector to see how it changes.
        </p>
      </div>

      {/* sector tabs */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-6"
        role="tablist"
        aria-label="Preview a sector report"
      >
        {VERDICT_PREVIEWS.map((p) => {
          const on = p.slug === active;
          return (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                if (p.slug !== active) trackEvent.beat5TabSelect({ sector: p.slug });
                setActive(p.slug);
              }}
              className={`inline-flex items-center justify-center min-h-11 text-sm rounded-full border px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                on
                  ? "bg-teal-800 border-teal-800 text-white font-semibold"
                  : "bg-cloud-25 border-cloud-200 text-slate-600 hover:border-teal-400 hover:text-teal-900"
              }`}
            >
              {p.tab}
            </button>
          );
        })}
      </div>

      <Surface rung="card" aria-live="polite" className="p-6 sm:p-8">
        {/* `key` remounts on tab change so the dial re-counts and the fade
            replays. min-h holds the tallest variant so the CTA never jumps. */}
        <div key={v.slug} className="animate-fade-up motion-reduce:animate-none">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-6">
            <span className="font-bold text-navy-700 text-lg">{v.label}</span>
            <span className="text-2xs font-semibold text-slate-600 bg-cloud-50 border border-cloud-200 rounded-full px-2.5 py-1 whitespace-nowrap">
              Sample · illustrative
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* ── Left: the score and the instrument ── */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <ScoreDial value={v.score} size={84} animate />
                <div>
                  <div className="text-xs text-slate-600 mb-1">Risk category</div>
                  <span className="inline-block text-sm font-semibold text-navy-700 bg-gold-400 rounded-full px-3 py-1">
                    {v.band}
                  </span>
                </div>
              </div>

              {/* Scored data being read, not acted on — so it sits in a well
                  INSIDE the card, which is what the `sunken` rung is for. */}
              <Surface rung="sunken" className="space-y-2.5 p-4">
                <div className="text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                  Five dimensions
                </div>
                {v.categories.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-32 shrink-0 leading-tight">
                      {c.label}
                    </span>
                    <span className="flex-1 h-2 rounded-full bg-cloud-200 overflow-hidden">
                      <span
                        className={`block h-full rounded-full ${
                          c.pct < 40 ? "bg-gold-400" : "bg-teal-500"
                        }`}
                        style={{ width: `${c.pct}%` }}
                      />
                    </span>
                    <span className="text-xs font-semibold text-slate-600 w-8 text-right tabular-nums">
                      {c.pct}
                    </span>
                  </div>
                ))}
              </Surface>
            </div>

            {/* ── Right: what to do about it ── */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-gold-500 shrink-0" />
                  <span className="text-sm font-semibold text-navy-700">
                    Your top 3 gaps
                  </span>
                </div>
                <ol className="space-y-2.5">
                  {v.topGaps.map((g, i) => (
                    <li key={g} className="flex gap-2.5 text-sm text-slate-600 leading-snug">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-2xs font-bold grid place-items-center mt-0.5">
                        {i + 1}
                      </span>
                      {g}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Check size={16} className="text-green-700 shrink-0" />
                  <span className="text-sm font-semibold text-navy-700">
                    Fix these first
                  </span>
                </div>
                <ol className="space-y-2.5">
                  {v.firstActions.map((a, i) => (
                    <li key={a} className="flex gap-2.5 text-sm text-slate-600 leading-snug">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-green-50 border border-green-200 text-green-800 text-2xs font-bold grid place-items-center mt-0.5">
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* ── Footer: checklist teaser + the email option ── */}
          <div className="border-t border-cloud-200 mt-7 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-2.5">
                  Plus a practical checklist
                </div>
                <ul className="space-y-1.5">
                  {VERDICT_CHECKLIST.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-xs text-slate-600 leading-snug"
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 w-3 h-3 rounded-[3px] border border-cloud-300 shrink-0"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-end">
                <p className="flex items-start gap-2 text-xs text-slate-600 leading-snug mb-4">
                  <Mail size={14} className="text-slate-600 shrink-0 mt-0.5" />
                  Want it in writing? You can have the full report emailed to you
                  at the end — optional, and only if you ask.
                </p>
                <Link
                  href={`/assessment/${v.slug}`}
                  onClick={() => trackEvent.beat5CtaClick({ sector: v.slug })}
                  className="self-start inline-flex items-center gap-2 px-6 py-3 pointer-coarse:min-h-11 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
                >
                  Get my real score
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Surface>
    </Section>
  );
}

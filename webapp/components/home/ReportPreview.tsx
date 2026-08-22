"use client";

import { useEffect, useState } from "react";
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
import { useInView } from "@/lib/hooks/useInView";

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

/**
 * One dimension bar. It fills from zero the first time the report is on screen,
 * and again on a tab change (the card is keyed by sector, so this remounts with
 * it) — the same rule the score dial next to it already follows.
 *
 * The fill is what makes the five dimensions read as a MEASUREMENT rather than
 * five decorative rules: the eye follows the travel and lands on where it
 * stopped. Width is transitioned, not animated, so reduced motion just paints
 * the final value.
 */
function DimensionBar({ label, pct, run, delay }: {
  label: string; pct: number; run: boolean; delay: number;
}) {
  // Mount at zero, fill on the next frame. `run ? pct : 0` alone would be
  // wrong for the tab change: by then `run` has been true for a while, so the
  // bar would mount already full and never travel. Two frames, because a
  // single rAF can still land inside the same style flush as the mount.
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    if (!run) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setFilled(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [run]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-32 shrink-0 leading-tight">{label}</span>
      <span className="flex-1 h-2 rounded-full bg-cloud-200 overflow-hidden">
        <span
          className={`block h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:!transition-none ${
            pct < 40 ? "bg-gold-400" : "bg-teal-500"
          }`}
          style={{ width: filled ? `${pct}%` : 0, transitionDelay: `${delay}ms` }}
        />
      </span>
      <span className="text-xs font-semibold text-slate-600 w-8 text-right tabular-nums">
        {pct}
      </span>
    </div>
  );
}

export function ReportPreview() {
  const [active, setActive] = useState(VERDICT_PREVIEWS[0].slug);
  const v = VERDICT_PREVIEWS.find((p) => p.slug === active) ?? VERDICT_PREVIEWS[0];
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  return (
    <Section id="report" surface="white" type="demo" className="scroll-mt-20">
      <div className="text-center mb-8">
        <Eyebrow className="mb-3">Your report</Eyebrow>
        <h2 className="type-display-3 text-navy-700 mb-4">
          This is what you get at the end
        </h2>
        <p className="type-intro text-slate-600 max-w-lg mx-auto">
          Every assessment ends in a scored, sector-specific report. Here is the
          shape of one. Pick a sector to see how it changes.
        </p>
      </div>

      {/* ── Sector tabs — all twelve, deliberately SUBORDINATE ──────────────
          The sector ring deck further down is where a visitor chooses their
          industry; this rail only re-skins a sample report. Two twelve-chip
          rails given equal weight would read as the page asking the same
          question twice, so this one is smaller (13px, tighter padding), a
          single scrolling line rather than a wrapped block, and edge-faded so
          it reads as a control strip instead of a menu.

          Scrolls on every width, not just mobile: twelve chips do not fit a
          centred line at 1440 either, and a rail that wraps to three rows is
          the "menu" this is trying not to be. */}
      <div className="relative mb-6">
        <div
          className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-start lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className={`shrink-0 inline-flex items-center justify-center min-h-11 sm:min-h-0 text-[13px] rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
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
      </div>

      {/* The observer target is this wrapper, not the Surface: `Surface` is a
          plain function component that spreads HTML attributes and does not
          take a ref, and giving it one to satisfy one animation is how a
          primitive starts growing exceptions. */}
      <div ref={ref}>
      <Surface rung="card" aria-live="polite" className="overflow-hidden">
        {/* Chrome. The same navy-950 title bar the hero's snapshot wears, for
            the same reason and now at full size: it frames the panel as an
            INSTRUMENT READING rather than as another marketing card, and it
            ties the page's two product surfaces to one object. The sample
            label lives up here because it qualifies the whole panel — inside
            the body it was a chip competing with the sector name. */}
        <div className="flex items-center justify-between gap-3 bg-navy-950 px-5 py-3">
          <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-cloud-400">
            Privacy readiness report
          </span>
          <span className="text-2xs font-semibold text-white whitespace-nowrap">
            Sample · illustrative
          </span>
        </div>

        {/* `key` remounts on tab change so the dial re-counts, the bars refill
            and the fade replays. */}
        <div key={v.slug} className="p-6 sm:p-8 animate-fade-up motion-reduce:animate-none">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-6">
            <span className="font-bold text-navy-700 text-lg">{v.label}</span>
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
                {v.categories.map((c, i) => (
                  <DimensionBar
                    key={c.label}
                    label={c.label}
                    pct={c.pct}
                    run={inView}
                    delay={i * 90}
                  />
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
                  at the end. Optional, and only if you ask.
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
      </div>
    </Section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle } from "lucide-react";
import { getHeroVerdict } from "@/lib/data/hero-verdicts";
import { VERDICT_PREVIEWS } from "@/lib/data/verdict-previews";
import { ScoreDial } from "@/components/home/ScoreDial";
import { Surface } from "@/components/ui/Surface";
import { trackEvent } from "@/lib/analytics";

// S1 — Hero. LIGHT, per the Quiet Authority spec: the page opens almost white
// and spends navy where it demonstrates something (the risk map, recognition,
// the close). Flipping light also settles the brand CTA lock for free — green
// fill + white label is impossible on navy (white on green measures 2.54:1)
// and exactly right here (green-700 + white = 5.48:1).
//
// The selector shows THREE sectors, not twelve. Twelve equal chips made the
// hero the tallest block on the mobile page and asked the visitor to classify
// themselves before they had been told what they would get. The other nine
// sectors are one scroll away in S7, and every one of them is still reachable.
//
// The right-hand card is a SNAPSHOT, not the report. Product chrome (title bar,
// caps labels, tabular figures) makes it read as UI; the content stays at
// teaser depth — score, band, top exposure, first fix — because S4 owns the
// full report and showing it twice made the second one read as déjà vu.

/** The page's priority sectors. Must match AudienceCards and VERDICT_PREVIEWS. */
const PRIORITY_SLUGS = ["recruitment", "ca-firms", "d2c-brands"];

// One muted line, not five ticked badges. The same five facts read as
// reassurance in a row and as clutter when each gets its own icon.
const frictionKillers = [
  "Free",
  "3–5 minutes",
  "No email to start",
  "Plain English",
  "Not legal advice",
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* The data-governance geometry behind the hero — faint relationship paths and
   nodes in navy at ~4% opacity (≈1.06:1 against white: felt, not seen). This
   replaces the two radial-gradient glows, which read as the stock SaaS
   treatment both design assessments name as the cliché to avoid. */
function HeroGeometry() {
  return (
    <svg
      className="absolute inset-0 h-full w-full text-navy-700 opacity-[0.04] pointer-events-none"
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M-20 440 C 240 400, 420 320, 700 340 S 1100 280, 1240 320" strokeDasharray="4 7" />
        <path d="M-20 210 C 300 250, 520 150, 820 190 S 1150 130, 1240 170" strokeDasharray="4 7" />
        <path d="M130 -20 C 170 190, 100 330, 190 580" strokeDasharray="4 7" />
        <path d="M980 -20 C 940 170, 1030 350, 960 580" strokeDasharray="4 7" />
      </g>
      <g fill="currentColor">
        <circle cx="700" cy="340" r="3.5" />
        <circle cx="245" cy="402" r="3" />
        <circle cx="820" cy="190" r="3.5" />
        <circle cx="430" cy="192" r="3" />
        <circle cx="130" cy="150" r="3" />
        <circle cx="980" cy="130" r="3" />
        <circle cx="1090" cy="295" r="3" />
      </g>
    </svg>
  );
}

export function HeroSection() {
  // null = nothing picked yet; "other" = picked, but no sector-specific read.
  const [slug, setSlug] = useState<string | null>(null);
  const sectorSlug = slug === "other" ? null : slug;
  const verdict = sectorSlug ? getHeroVerdict(sectorSlug) : null;
  const discoverHref = sectorSlug ? `/discovery?sector=${sectorSlug}` : "/discovery";
  const assessHref = sectorSlug ? `/assessment/${sectorSlug}` : "/assessment";

  // The snapshot's "first fix" comes from the same data the full report shows —
  // never invented here. Exists for exactly the three priority sectors.
  const firstFix = sectorSlug
    ? VERDICT_PREVIEWS.find((p) => p.slug === sectorSlug)?.firstActions[0]
    : undefined;

  // Three priority sectors, resolved from the single source, plus a generic
  // fourth. "Other business" routes to the general pack at /assessment — which
  // is a real, working assessment, but does NOT produce a sector verdict. So it
  // deliberately leaves the sample card up rather than inventing a read.
  const chips = [
    ...PRIORITY_SLUGS.map((s) => getHeroVerdict(s)).filter(
      (v): v is NonNullable<typeof v> => Boolean(v),
    ),
    { slug: "other", chipLabel: "other business" },
  ];

  return (
    <section className="relative bg-cloud-25 overflow-hidden">
      <HeroGeometry />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-16 lg:pt-24 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* LEFT — copy + selector + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              <span className="text-teal-800 text-xs font-semibold">
                Free DPDPA readiness check · 3–5 minutes
              </span>
            </div>

            {/* The promise is the SCORE, not a position — it names the
                deliverable the report actually hands over. */}
            <h1 className="type-display-1 text-navy-700 mb-6 max-w-[16ch]">
              Get your DPDPA readiness score in{" "}
              <span className="text-green-700">3–5 minutes</span>
            </h1>
            <p className="type-intro text-slate-700 mb-8 max-w-xl">
              See your top gaps, first fixes and a sector-specific action plan
              for your Indian business — in plain English.
            </p>

            {/* is-this-me selector — light segmented control. One interaction
                grammar: selected = green border + green-50 tint + check
                (green-700 on green-50 measures 5.05:1). */}
            <div className="mb-7">
              <span className="block text-sm text-slate-600 mb-2.5">I run a…</span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Select your business type"
              >
                {chips.map((v) => {
                  const active = v.slug === slug;
                  return (
                    <button
                      key={v.slug}
                      type="button"
                      onClick={() => {
                        if (v.slug !== slug) trackEvent.heroSectorSelect({ sector: v.slug });
                        setSlug(v.slug);
                      }}
                      aria-pressed={active}
                      className={`inline-flex items-center justify-center gap-1.5 text-sm rounded-full border transition-colors px-4 py-2.5 min-h-[44px] sm:px-3.5 sm:py-1.5 sm:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 ${
                        active
                          ? "bg-green-50 border-green-700 text-green-800 font-medium"
                          : "bg-cloud-25 border-cloud-200 text-slate-700 hover:border-cloud-300"
                      }`}
                    >
                      {active && <Check size={14} aria-hidden="true" />}
                      {cap(v.chipLabel)}
                    </button>
                  );
                })}
              </div>
              {/* The nine sectors not shown are one scroll away, not gone. */}
              <p className="mt-2.5 text-sm text-slate-600">
                <a
                  href="#sectors"
                  className="inline-flex items-center pointer-coarse:min-h-11 underline underline-offset-4 decoration-cloud-300 hover:decoration-navy-700 hover:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
                >
                  See all 12 sectors
                  <span aria-hidden="true"> ↓</span>
                </a>
              </p>
            </div>

            {/* One filled action — the brand lock verbatim: Verification Green
                ground, white label. 5.48:1. */}
            <div className="mb-5">
              <Link
                href={assessHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "assess", sector: slug ?? "" })}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
              >
                Take free assessment
                <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-sm text-slate-600">
              {frictionKillers.join(" · ")}
            </p>

            <p className="mt-4 text-sm text-slate-600">
              Not sure what personal data you hold?{" "}
              <Link
                href={discoverHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "discover", sector: slug ?? "" })}
                className="font-medium text-navy-700 underline underline-offset-4 decoration-cloud-300 hover:decoration-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
              >
                {slug && slug !== "other" ? "See my data map" : "Map it first"}
                <span aria-hidden="true"> →</span>
              </Link>
            </p>
          </div>

          {/* RIGHT — the Privacy Readiness Snapshot: one product-chromed frame,
              sample by default, live verdict on select. This frame carries the
              page's one noticeable shadow — the product-frame exception.
              min-h matches the taller state so the swap never re-centres the row. */}
          <div aria-live="polite" className="lg:pl-4 lg:min-h-[400px]">
            <Surface
              rung="card"
              flush
              className="max-w-md mx-auto lg:ml-auto rounded-xl shadow-elevated overflow-hidden"
            >
              {/* chrome */}
              <div className="flex items-center justify-between gap-3 bg-navy-700 px-4 py-2.5">
                <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-cloud-400">
                  Privacy readiness snapshot
                </span>
                <span className="text-2xs font-semibold text-white whitespace-nowrap">
                  {verdict ? cap(verdict.chipLabel) : "Sample · Clinics & Labs"}
                </span>
              </div>

              {/* body */}
              {verdict ? (
                <div key={verdict.slug} className="bg-cloud-25 p-6 animate-fade-up motion-reduce:animate-none">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle size={20} className="text-green-800 shrink-0 mt-0.5" />
                    <p className="text-navy-700 font-semibold text-sm leading-snug">
                      DPDPA applies to your {verdict.chipLabel}.
                    </p>
                  </div>
                  <p className="text-slate-600 text-sm leading-snug mb-4">{verdict.riskLine}</p>
                  <div className="border-t border-cloud-200 pt-3.5 flex items-center justify-between mb-3.5">
                    <span className="text-sm text-slate-600">Typical risk</span>
                    <span
                      className="text-sm font-semibold text-navy-700 bg-gold-400 rounded px-2 py-0.5 animate-fade-up motion-reduce:animate-none"
                      style={{ animationDelay: "200ms" }}
                    >
                      {verdict.band}
                    </span>
                  </div>
                  {firstFix && (
                    <div className="mb-4">
                      <span className="block text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                        First fix
                      </span>
                      <p className="text-sm text-slate-600 leading-snug">{firstFix}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-600">
                    Your real score is 3–5 minutes away.{" "}
                    <a
                      href="#report"
                      className="font-medium text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800"
                    >
                      See the full report ↓
                    </a>
                  </p>
                </div>
              ) : (
                <div className="bg-cloud-25 p-6">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      <ScoreDial value={41} size={66} animate />
                    </div>
                    <div>
                      <span className="inline-block text-xs font-semibold text-navy-800 bg-gold-300 rounded-full px-3 py-1 mb-1.5">
                        High-priority action
                      </span>
                      <p className="text-sm text-slate-600 leading-snug">
                        Significant gaps — start a focused fix plan now.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-4">
                    {slug === "other"
                      ? "The general check covers every business that handles personal data. Your real score is 3–5 minutes away."
                      : "Pick your business on the left to see your own read."}
                  </p>
                </div>
              )}
            </Surface>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { getHeroVerdict } from "@/lib/data/hero-verdicts";
import { ScoreDial } from "@/components/home/ScoreDial";
import { trackEvent } from "@/lib/analytics";

// S1 — Hero. 2-column: left = the score promise + a four-way selector + one
// green action; right = a scorecard (illustrative sample by default, live
// verdict on select). Proof lives in the rail directly below (S2).
//
// The selector shows THREE sectors, not twelve. Twelve equal chips made the
// hero the tallest block on the mobile page and asked the visitor to classify
// themselves before they had been told what they would get. The other nine
// sectors are one scroll away in S7, and every one of them is still reachable.
//
// The right-hand card stays a TEASER. S4 owns the full scored report — showing
// it twice made the second one read as déjà vu.

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

export function HeroSection() {
  // null = nothing picked yet; "other" = picked, but no sector-specific read.
  const [slug, setSlug] = useState<string | null>(null);
  const sectorSlug = slug === "other" ? null : slug;
  const verdict = sectorSlug ? getHeroVerdict(sectorSlug) : null;
  const discoverHref = sectorSlug ? `/discovery?sector=${sectorSlug}` : "/discovery";
  const assessHref = sectorSlug ? `/assessment/${sectorSlug}` : "/assessment";

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
    <section className="relative bg-navy-700 overflow-hidden">
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #07B981 0%, transparent 50%), radial-gradient(circle at 75% 75%, #35B6AE 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-16 lg:pt-20 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* LEFT — copy + selector + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-500/40 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" aria-hidden="true" />
              <span className="text-teal-300 text-xs font-semibold">
                Free DPDPA readiness check · 3–5 minutes
              </span>
            </div>

            {/* The promise is the SCORE, not a position. "See where you stand"
                described the feeling; this names the deliverable, which is what
                the report actually hands over. */}
            <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight tracking-tight mb-5">
              Get your DPDPA readiness score in{" "}
              <span className="text-green-400">3–5 minutes</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              See your top gaps, first fixes and a sector-specific action plan
              for your Indian business — in plain English.
            </p>

            {/* is-this-me selector */}
            <div className="mb-6">
              <span className="block text-sm text-slate-400 mb-2.5">I run a…</span>
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
                      className={`inline-flex items-center justify-center text-sm rounded-full border transition-colors px-4 py-2.5 min-h-[44px] sm:px-3.5 sm:py-1.5 sm:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                        active
                          ? "bg-green-400 border-green-400 text-navy-950 font-medium"
                          : "bg-white/5 border-white/15 text-slate-200 hover:border-white/30"
                      }`}
                    >
                      {cap(v.chipLabel)}
                    </button>
                  );
                })}
              </div>
              {/* The nine sectors not shown are one scroll away, not gone. */}
              <p className="mt-2.5 text-sm text-cloud-400">
                <a
                  href="#sectors"
                  className="inline-flex items-center pointer-coarse:min-h-11 underline underline-offset-4 decoration-white/25 hover:decoration-white hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 rounded"
                >
                  See all 12 sectors
                  <span aria-hidden="true"> ↓</span>
                </a>
              </p>
            </div>

            {/* One filled action, and it has to be the one the headline
                promised. The h1 offers a readiness verdict, so sending the
                heaviest glance to Discovery made the visitor choose between
                two tools before acting. Discovery is still here, but as the
                escape hatch it actually is: the answer to "I can't assess
                what I haven't mapped yet."
                green-400 on navy-950 is 9.72:1, the brightest thing here. */}
            <div className="mb-5">
              <Link
                href={assessHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "assess", sector: slug ?? "" })}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-400 hover:bg-green-300 text-navy-950 font-semibold rounded-lg transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
              >
                Take free assessment
                <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-sm text-cloud-400">
              {frictionKillers.join(" · ")}
            </p>

            <p className="mt-4 text-sm text-cloud-400">
              Not sure what personal data you hold?{" "}
              <Link
                href={discoverHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "discover", sector: slug ?? "" })}
                className="font-medium text-slate-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 rounded"
              >
                {slug ? "See my data map" : "Map it first"}
                <span aria-hidden="true"> →</span>
              </Link>
            </p>
          </div>

          {/* RIGHT — scorecard (sample by default, live verdict on select).
              min-h matches the taller (sample) card so the sample→verdict swap
              doesn't change the wrapper height and re-centre the hero row. */}
          <div aria-live="polite" className="lg:pl-4 lg:min-h-[340px]">
            {verdict ? (
              <div className="bg-white rounded-xl p-6 max-w-md mx-auto lg:ml-auto animate-fade-up motion-reduce:animate-none">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-navy-700">{cap(verdict.chipLabel)}</span>
                  <span className="text-xs font-medium text-teal-800 bg-teal-50 rounded-full px-2.5 py-1">
                    Your sector
                  </span>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle size={20} className="text-green-800 shrink-0 mt-0.5" />
                  <p className="text-navy-700 font-semibold text-sm leading-snug">
                    DPDPA applies to your {verdict.chipLabel}.
                  </p>
                </div>
                <p className="text-slate-600 text-sm leading-snug mb-4">{verdict.riskLine}</p>
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Typical risk</span>
                  <span
                    className="text-sm font-semibold text-navy-700 bg-gold-400 rounded px-2 py-0.5 animate-fade-up motion-reduce:animate-none"
                    style={{ animationDelay: "200ms" }}
                  >
                    {verdict.band}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  See your real score in the free 3-minute check.
                </p>
              </div>
            ) : (
              /* A teaser, not the demonstration. The full scored report — five
                 dimensions, top gap, first fix — is its own section further
                 down; showing it twice made the second one read as déjà vu. */
              <div className="bg-white rounded-xl p-6 max-w-md mx-auto lg:ml-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-navy-700">Clinics &amp; Diagnostic Labs</span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2.5 py-1 whitespace-nowrap">
                    Sample
                  </span>
                </div>
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
          </div>
        </div>
      </div>
    </section>
  );
}

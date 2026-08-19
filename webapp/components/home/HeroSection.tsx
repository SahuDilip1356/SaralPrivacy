"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { HERO_VERDICTS, getHeroVerdict } from "@/lib/data/hero-verdicts";
import { ScoreDial } from "@/components/home/ScoreDial";
import { trackEvent } from "@/lib/analytics";

// Beat 1 — Hero. 2-column: left = "is-this-me" selector + Discovery-first CTAs;
// right = a scorecard (illustrative sample by default, live verdict on select).
// Stats live in the Trust ribbon (Beat 3). Brand tokens via Tailwind.

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
  const [slug, setSlug] = useState<string | null>(null);
  const verdict = slug ? getHeroVerdict(slug) : null;
  const discoverHref = slug ? `/discovery?sector=${slug}` : "/discovery";
  const assessHref = slug ? `/assessment/${slug}` : "/assessment";

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
                DPDP Rules, 2025 are in effect — see where you stand in 3–5 minutes
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight tracking-tight mb-5">
              See exactly where your business stands on{" "}
              <span className="text-green-400">DPDPA</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              Pick your business type for an instant read on what applies, where
              you&apos;re exposed, and what to do next — in plain English, no legal
              degree required.
            </p>

            {/* is-this-me selector */}
            <div className="mb-6">
              <span className="block text-sm text-slate-400 mb-2.5">I run a…</span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Select your business type"
              >
                {HERO_VERDICTS.map((v) => {
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
            </div>

            {/* One filled action. The assessment stays reachable as a link
                rather than a second button competing for the same glance —
                green-400 on navy-950 is 9.72:1, the brightest thing here. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
              <Link
                href={discoverHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "discover", sector: slug ?? "" })}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-400 hover:bg-green-300 text-navy-950 font-semibold rounded-lg transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
              >
                {slug ? "See my data map" : "Discover my personal data"}
                <ArrowRight size={18} />
              </Link>
              <Link
                href={assessHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "assess", sector: slug ?? "" })}
                className="inline-flex items-center gap-1.5 text-base font-medium text-slate-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 rounded"
              >
                or take the assessment
              </Link>
            </div>

            <p className="text-sm text-slate-400">
              {frictionKillers.join(" · ")}
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
                  <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <p className="text-navy-700 font-semibold text-sm leading-snug">
                    DPDPA applies to your {verdict.chipLabel}.
                  </p>
                </div>
                <p className="text-slate-600 text-sm leading-snug mb-4">{verdict.riskLine}</p>
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Typical risk</span>
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
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1 whitespace-nowrap">
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
                <p className="text-xs text-slate-500 mt-4">
                  Pick your business on the left to see your own read.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

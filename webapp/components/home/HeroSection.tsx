"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { HERO_VERDICTS, getHeroVerdict } from "@/lib/data/hero-verdicts";

// Beat 1 — Hero. The "is-this-me" moment: pick a business type → instant
// verdict (applies + sector risk + typical band), then act. Discovery-first
// CTAs. Stats moved to the Trust ribbon (Beat 3). Brand tokens via Tailwind.

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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        {/* eyebrow — factual window, no shame framing */}
        <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-500/40 rounded-full px-3.5 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" aria-hidden="true" />
          <span className="text-teal-300 text-xs font-semibold">
            DPDP Rules, 2025 are in effect — see where you stand in 3–5 minutes
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
          See exactly where your business stands on{" "}
          <span className="text-green-400">DPDPA</span>
        </h1>
        <div className="w-16 h-0.5 bg-gold-400 mb-6" />
        <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
          Pick your business type for an instant read on what applies, where
          you&apos;re exposed, and what to do next — in plain English, no legal
          degree required.
        </p>

        {/* is-this-me selector */}
        <div className="mb-5">
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
                  onClick={() => setSlug(v.slug)}
                  aria-pressed={active}
                  className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
                    active
                      ? "bg-green-500 border-green-500 text-white font-semibold"
                      : "bg-white/5 border-white/15 text-slate-200 hover:border-white/30"
                  }`}
                >
                  {cap(v.chipLabel)}
                </button>
              );
            })}
          </div>
        </div>

        {/* verdict slot — announced to screen readers */}
        <div aria-live="polite" className="mb-8">
          {verdict ? (
            <div className="bg-white rounded-2xl p-5 max-w-xl shadow-elevated animate-fade-up motion-reduce:animate-none">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-navy-700 font-semibold">
                    DPDPA applies to your {verdict.chipLabel}.
                  </p>
                  <p className="text-slate-600 text-sm mt-1 leading-snug">
                    {verdict.riskLine}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Most land around{" "}
                    <span className="font-semibold text-navy-700 bg-gold-400 rounded px-1.5 py-0.5">
                      {verdict.band}
                    </span>{" "}
                    risk — see your real score in 3 minutes.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm border border-dashed border-white/15 rounded-2xl px-5 py-6 max-w-xl">
              Pick your business above to see if DPDPA applies to you — and where
              the risk hides.
            </div>
          )}
        </div>

        {/* CTAs — Discovery-first */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link
            href={discoverHref}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-base"
          >
            {slug ? "See my data map" : "Discover my personal data"}
            <ArrowRight size={18} />
          </Link>
          <Link
            href={assessHref}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-colors text-base backdrop-blur-sm"
          >
            Take the assessment
          </Link>
        </div>

        {/* friction killers */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {frictionKillers.map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400 shrink-0" />
              <span className="text-slate-400 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

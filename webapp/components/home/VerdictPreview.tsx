"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { VERDICT_PREVIEWS } from "@/lib/data/verdict-previews";
import { trackEvent } from "@/lib/analytics";

// Beat 5 — "See a real verdict". Previews the REPORT OUTPUT (category breakdown
// + band + top gap), not the hero's applicability card — that dedupe rule is
// what the old ProofSection failed. Tabs flip sector; the CTA is sector-scoped.
// Illustrative sample, never fake "your" data.

export function VerdictPreview() {
  const [active, setActive] = useState(VERDICT_PREVIEWS[0].slug);
  const v =
    VERDICT_PREVIEWS.find((p) => p.slug === active) ?? VERDICT_PREVIEWS[0];

  return (
    <section className="bg-cloud-50 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-medium uppercase tracking-[0.08em] text-slate-600 mb-3">
            The report
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-3">
            See what your verdict looks like
          </h2>
          <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
            Every assessment ends in a scored, sector-specific report. Here is a
            live preview — pick a sector to see its shape.
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
                className={`text-sm rounded-full border px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                  on
                    ? "bg-teal-800 border-teal-800 text-white font-semibold"
                    : "bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-900"
                }`}
              >
                {p.tab}
              </button>
            );
          })}
        </div>

        {/* report card */}
        <div
          aria-live="polite"
          className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-card p-6"
        >
          <div
            key={v.slug}
            className="animate-fade-up motion-reduce:animate-none min-h-[340px]"
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="font-bold text-navy-700">{v.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-2xs font-semibold text-slate-600 bg-cloud-50 border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap">
                  Sample · illustrative
                </span>
                <span className="text-xs font-semibold text-navy-700 bg-gold-400 rounded-full px-2.5 py-1">
                  {v.band}
                </span>
              </div>
            </div>

            {/* category breakdown — the "real report" signal */}
            <div className="space-y-2.5 mb-5">
              {v.categories.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-32 shrink-0 leading-tight">
                    {c.label}
                  </span>
                  <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
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
            </div>

            {/* top gap — fixed min-height so tab swaps don't shift the CTA */}
            <div className="border-t border-slate-100 pt-4 flex gap-2.5 min-h-[3.5rem]">
              <AlertTriangle size={17} className="text-gold-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-snug">
                <span className="font-semibold text-navy-700">Top gap:</span>{" "}
                {v.topGap}
              </p>
            </div>

            <Link
              href={`/assessment/${v.slug}`}
              onClick={() => trackEvent.beat5CtaClick({ sector: v.slug })}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Get your real score
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

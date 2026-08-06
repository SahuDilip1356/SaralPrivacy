"use client";

import Link from "next/link";
import { Waypoints, ArrowRight } from "lucide-react";
import { resolveFlowMapLink } from "@/lib/data/data-flow/live-slugs";
import { trackEvent } from "@/lib/analytics";

/**
 * Cross-link banner from a scored result (assessment report / Discovery
 * snapshot) into the Personal Data Flow Maps. Pass the sector's slug to deep-
 * link its live map; when the sector has no live map — or no slug is passed —
 * the hub variant links /data-mapping instead. Never a dead deep link, never
 * hidden.
 *
 * Mirrors DiscoveryCrossLink's layout, NOT its CTA colours: green-500/white
 * measures 2.54:1 and fails WCAG. This CTA is navy-700/white (≈17:1) with the
 * focus ring the older cross-links lacked — the corrected pattern.
 */
export function FlowCrossLink({
  sectorSlug,
  source,
  className = "",
}: {
  /** sectors.ts slug — assessment packs carry it as `pack.industry`. Omit for the hub variant. */
  sectorSlug?: string;
  source: "assessment" | "discovery";
  className?: string;
}) {
  const map = resolveFlowMapLink(sectorSlug);

  const href = map ? map.href : "/data-mapping";
  const sector = map ? map.sector.slug : "hub";
  const heading = map
    ? `You've scored your risk — now watch where ${map.sector.navLabel} data actually travels.`
    : "See how personal data travels in businesses like yours — and where control breaks.";
  const body = map
    ? "An interactive map of the systems, people and vendors the data passes through — and where control breaks."
    : "12 industry data-flow maps, free to explore — find the one closest to your business.";
  const cta = map ? "See your data flow map" : "Explore the data flow maps";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-2xl border border-teal-200 bg-gradient-to-r from-cloud-50 to-teal-50 p-5 sm:p-6 ${className}`}
    >
      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-teal-200 grid place-items-center">
        <Waypoints size={22} className="text-teal-600" />
      </div>
      <div className="flex-1">
        {/* teal-800, not -700: the custom teal-700 measures 4.48:1 on teal-50 */}
        <div className="text-[11px] font-bold uppercase tracking-wide text-teal-800 mb-1">
          Next step · Free · No email
        </div>
        <h3 className="text-navy-700 font-bold text-base sm:text-lg leading-snug">{heading}</h3>
        <p className="text-slate-600 text-sm mt-1">{body}</p>
      </div>
      <Link
        href={href}
        onClick={() => trackEvent.flowCrosslinkClick({ source, sector })}
        className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-700 text-white font-semibold rounded-xl hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-colors text-sm whitespace-nowrap"
      >
        {cta}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

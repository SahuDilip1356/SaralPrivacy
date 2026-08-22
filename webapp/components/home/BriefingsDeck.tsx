"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { STAGE_SLUGS, stageLabel, sectorLabel } from "@/lib/data/briefing-taxonomy";

export interface DeckBriefing {
  id: string;
  slug: string;
  title: string;
  date: string;
  readTime: number;
  image: string;    // infographic URL (or data URI); "" when none
  infTitle: string; // infographic headline — alt text; "" when none
  stage: string;
  sector: string;
}

/**
 * Fanned deck of the last 7 briefings.
 *
 * The cards overlap, later ones stacking over earlier ones, and exactly one card
 * at a time is pulled clear of its neighbour. Geometry is two numbers held in CSS
 * vars: --card (card width) and --lap (how far each card sits inside the one
 * before it). Revealing card h means pushing everything after it right by --lap,
 * so the row's footprint is `7·card − 5·lap` whether or not anything is hovered —
 * the deck never reflows, it only redistributes.
 *
 * `revealed` starts at 0, so the newest briefing is already clear on load and the
 * rest fan behind it. Hover or keyboard focus moves the reveal along the deck, and
 * it stays where you left it — snapping back on mouse-leave would animate the whole
 * row every time the cursor crossed it on its way somewhere else.
 *
 * Below lg the fan is replaced by a scroll-snap row: seven overlapping cards need
 * width the phone doesn't have, and there is no hover to recover them with.
 */
export function BriefingsDeck({ briefings }: { briefings: DeckBriefing[] }) {
  const [revealed, setRevealed] = useState(0);

  return (
    <>
      {/* Fan — lg and up.
          The trailing pad is load-bearing: revealing a card means pushing the
          cards after it right by --lap, and the last card has none, so without a
          reserved --lap of space the whole row would visibly narrow the moment you
          reached the end of the deck. With it, the footprint is constant and the
          reveal only ever redistributes. */}
      <div className="hidden lg:flex justify-center pr-[var(--lap)] [--card:232px] [--lap:132px] xl:[--card:296px] xl:[--lap:168px]">
        {briefings.map((b, i) => (
          <div
            key={b.id}
            className="shrink-0 w-[var(--card)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
            style={{
              marginLeft: i === 0 ? 0 : "calc(var(--lap) * -1)",
              zIndex: i === revealed ? 30 : i,
              transform: i > revealed ? "translateX(var(--lap))" : undefined,
            }}
            onMouseEnter={() => setRevealed(i)}
            onFocusCapture={() => setRevealed(i)}
          >
            <DeckCard b={b} lifted={i === revealed} fanned />
          </div>
        ))}
      </div>

      {/* Scroll-snap row — below lg. scroll-pl matches the px: a snap-start item
          aligns to the snapport's padding edge, so without it the row scrolls
          itself 16px on load and the first card sits flush against the screen
          edge instead of lining up with the heading above it. */}
      <div className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scroll-pl-4 pb-2">
        {briefings.map((b) => (
          <div key={b.id} className="shrink-0 w-[76vw] max-w-[300px] snap-start">
            <DeckCard b={b} lifted />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * `fanned` cards cast a shadow off their left edge. A hairline border alone is
 * not enough to separate seven overlapping cards — without the shadow the white
 * bodies fuse into one band and the deck stops reading as cards at all.
 */
function DeckCard({ b, lifted, fanned = false }:
  { b: DeckBriefing; lifted: boolean; fanned?: boolean }) {
  const shadow = lifted
    ? "shadow-[0_14px_30px_-14px_rgba(18,26,46,0.5)]"
    : fanned
      ? "shadow-[-14px_0_26px_-14px_rgba(18,26,46,0.45)]"
      : "shadow-sm";
  return (
    <Link
      href={`/briefings/${b.slug}`}
      className={`group block h-full rounded-xl border bg-white overflow-hidden
        motion-safe:transition-all motion-safe:duration-300 ${shadow}
        ${lifted ? "border-teal-300" : "border-cloud-300"}`}
    >
      {/* Navy mat — same treatment as the archive card, so a briefing looks the
          same wherever it appears. Contained, never cropped. */}
      <div className={`w-full aspect-[16/9] overflow-hidden p-3 transition-colors
        ${lifted ? "bg-navy-800" : "bg-navy-700"}`}>
        {b.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={b.image}
            alt={b.infTitle ? `${b.infTitle}: DPDPA infographic` : `${b.title}: DPDPA infographic`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain rounded-md ring-1 ring-white/10"
          />
        ) : (
          <div className="w-full h-full rounded-md flex flex-col items-center justify-center text-center px-3">
            {STAGE_SLUGS.has(b.stage) && (
              <span className="text-teal-300 text-[11px] font-semibold uppercase tracking-wider">
                {stageLabel(b.stage)}
              </span>
            )}
            <span className="text-white/70 text-xs mt-1">DPDPA Daily Briefing</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
            {b.sector === "general" ? "All sectors" : sectorLabel(b.sector)}
          </span>
          {STAGE_SLUGS.has(b.stage) && (
            <span className="text-[10px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full">
              {stageLabel(b.stage)}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-navy-700 text-sm leading-snug line-clamp-2 mb-2.5 group-hover:text-green-900 transition-colors">
          {b.title}
        </h3>

        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><Calendar size={11} />{formatDateShort(b.date)}</span>
            <span className="inline-flex items-center gap-1"><Clock size={11} />{b.readTime} min</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-navy-700 group-hover:text-green-900 transition-colors">
            Read <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

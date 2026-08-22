import Link from "next/link";
import { ArrowRight, ListChecks, FileDown } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { GUIDE_LANGUAGES } from "@/lib/data/guide-languages";

// S8 — Resources. Three offers, one of which is a publication.
//
// It replaces two full sections — a seven-card briefings deck and a nine-row
// guide table of contents — that together ran past 2,500px doing what 400px
// does. The archives are not lost, they are on their own pages, which is where
// someone browsing an archive actually wants to be.
//
// The counts live here rather than under the hero. "130+ briefings" and "17
// templates" measure our publishing effort; they are a fair claim next to the
// thing they describe, and the wrong claim next to "will this take long and
// will you email me".

/** Downloadable assets in /public/templates — 5 generic + one checklist per sector. */
const TEMPLATE_COUNT = 17;

/**
 * The guide's cover, drawn in CSS.
 *
 * A publication that exists in seven languages and tracks a notified rules
 * regime is the most substantial thing we give away, and it was reading as the
 * first of three equal cards with a 19px outline icon on it. Nothing here is an
 * image asset: a cover mock at 2× would be ~40KB of LCP-adjacent weight for a
 * decoration, and it would need re-exporting every time the edition line moves.
 *
 * Decorative — the card's own heading and description carry the content, so
 * this is aria-hidden and the scripts inside it are never announced.
 */
function GuideCover() {
  return (
    <div
      aria-hidden
      className="relative shrink-0 w-[104px] sm:w-[116px] aspect-[3/4] select-none"
    >
      {/* page block — two hairlines offset right, so the cover reads as the
          front of something with pages behind it rather than a flat rectangle */}
      <span className="absolute inset-y-1.5 right-0 w-2 rounded-r-lg bg-cloud-300" />
      <span className="absolute inset-y-1 right-0.5 w-2 rounded-r-lg bg-cloud-200" />

      <div className="absolute inset-0 right-1.5 rounded-r-lg rounded-l-sm bg-navy-700 shadow-[0_10px_24px_-12px_rgba(18,26,46,0.7)] overflow-hidden">
        {/* spine */}
        <span className="absolute inset-y-0 left-0 w-[7px] bg-navy-900" />
        <span className="absolute inset-y-0 left-[7px] w-px bg-white/15" />

        <div className="absolute inset-0 pl-[18px] pr-3 py-3.5 flex flex-col">
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-teal-300">
            SaralPrivacy
          </span>
          <span className="mt-auto text-white font-semibold text-[13px] leading-[1.15]">
            The Complete
            <br />
            DPDPA Guide
          </span>
          <span className="mt-2 pt-2 border-t border-white/15 text-[8px] uppercase tracking-[0.1em] text-slate-300">
            2026 edition
          </span>
        </div>
      </div>
    </div>
  );
}

export function ResourcesSection() {
  // No briefings card here. The deck immediately above already shows the latest
  // seven with their infographics — a "latest briefing" card underneath it would
  // be the same content twice in the same chapter. These three are the reference
  // assets a reader who is not ready to act actually wants, and none of them
  // overlaps the deck.
  const cards = [
    {
      icon: ListChecks,
      title: "Compliance checklist",
      description:
        "The statutory and operational controls, laid out as a list you can work through and tick off.",
      href: "/compliance-checklist",
      cta: "Open the checklist",
    },
    {
      icon: FileDown,
      title: "Template library",
      description: `${TEMPLATE_COUNT} free notices, consent lines, vendor checklists and sector checklists you can adapt today.`,
      href: "/resources",
      cta: "Get the templates",
    },
  ];

  return (
    /* No `divider`: this section follows the navy briefings desk now, and a
       fill change already IS the boundary — the hairline is only for two beats
       that share a fill (the FAQ below it still carries one). */
    <Section surface="deep" type="utility">
      <div className="text-center mb-9">
        <Eyebrow surface="deep" className="mb-3">
          Learn more
        </Eyebrow>
        <h2 className="type-display-3 text-navy-700 mb-4">
          If you&apos;d rather read first
        </h2>
        <p className="type-intro text-slate-600 max-w-lg mx-auto">
          The assessment is faster. But if you want the background, start here.
        </p>
      </div>

      {/* 7/5, not 4/4/4: the guide is a publication and the other two are
          downloads, and three equal cards said the opposite. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── The guide, given the room a publication needs ── */}
        <Surface rung="card" onDeep className="lg:col-span-7 p-6 flex flex-col">
          <div className="flex gap-5 sm:gap-6">
            <GuideCover />
            <div className="flex flex-col">
              <h3 className="font-semibold text-navy-700 text-base mb-2">
                The complete DPDPA guide
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                What the Act requires, who it applies to, and a 90-day plan —
                written against the DPDP Rules, 2025 as notified.
              </p>
              <Link
                href="/white-paper"
                className="mt-auto self-start inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors"
              >
                Read the guide
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* The languages, in their own scripts. The count was a number in a
              sentence; the scripts are the proof of the number, and for a
              reader whose first language is one of them it is also the fastest
              way to find that out. `lang` per chip so a screen reader that
              reaches them switches voice correctly. */}
          {/* `mt-auto`: this card is a grid item, so it stretches to the height
              of the two stacked cards beside it. Without it the language row
              sat where the text happened to end and left ~120px of nothing
              under it. */}
          <div className="mt-auto pt-5 border-t border-cloud-200">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate-600 mb-2.5">
              Read it in {GUIDE_LANGUAGES.length} Indian languages
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {GUIDE_LANGUAGES.map((l) => (
                <li
                  key={l.code}
                  lang={l.locale}
                  title={l.roman}
                  className="rounded-full bg-cloud-50 border border-cloud-200 px-2.5 py-1 text-xs text-slate-600"
                >
                  {l.native}
                </li>
              ))}
            </ul>
          </div>
        </Surface>

        {/* ── The two downloads ── */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
          {cards.map((c) => (
            <Surface key={c.href} rung="card" onDeep className="p-6 flex flex-col">
              <span className="w-10 h-10 rounded-lg bg-cloud-50 grid place-items-center mb-4">
                <c.icon size={19} className="text-slate-600" />
              </span>
              <h3 className="font-semibold text-navy-700 text-base mb-2">{c.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
                {c.description}
              </p>
              {/* Quiet links, not buttons. Green is rationed to the assessment —
                  this section's job is to serve the reader who is not ready. */}
              <Link
                href={c.href}
                className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors"
              >
                {c.cta}
                <ArrowRight size={14} />
              </Link>
            </Surface>
          ))}
        </div>
      </div>
    </Section>
  );
}

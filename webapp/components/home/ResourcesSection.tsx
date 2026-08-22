"use client";

import Link from "next/link";
import { ArrowRight, Check, ListChecks, FileDown } from "lucide-react";
import { useState } from "react";
import { useInView } from "@/lib/hooks/useInView";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { GUIDE_LANGUAGES, DEFAULT_LANG_CODE, getLanguage, type GuideLanguage } from "@/lib/data/guide-languages";

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
function GuideCover({ open, lang }: { open: boolean; lang: GuideLanguage }) {
  return (
    <div
      aria-hidden
      /* 7:10 is a book. The box used to be 3:4 with a 22px dead strip down the
         right — a leftover from the abandoned "leaves slide past the fore-edge"
         attempt — which left the face at 82px on a 360px screen and clipped its
         own title to "SARALPRIVAC". Nothing renders in that strip now, so the
         face takes the whole box and the box takes the right proportion. */
      className={`sp-cover relative shrink-0 w-[104px] sm:w-[116px] aspect-[7/10] select-none ${
        open ? "sp-open" : ""
      }`}
    >
      {/* The riffle stage. Its box is the cover face exactly, and it clips —
          which is the whole trick. A page hinged on the spine is over the face
          while it is between 0° and 90°, and past 90° it is behind the spine,
          where a clipped stage stops drawing it. That is what a turning page
          does when the left board is out of shot; left unclipped it sails on
          into the gutter and reads as a sheet blowing off the book.

          Perspective lives here rather than on the outer box so the vanishing
          point is the centre of the face the pages actually turn on. */}
      <div
        className="absolute inset-0 rounded-r-lg rounded-l-sm overflow-hidden z-20"
        style={{ perspective: "620px" }}
      >
        {/* Five sheets, invisible at rest, so the closed cover is what you see
            until the animation runs. Opaque — a see-through page shows the
            title behind it and stops reading as paper. The gradient is the
            curl: lit at the fore-edge, shaded toward the spine. Faint rules
            stand in for text; at this size a page reads as "a page" from four
            grey lines and nothing else. */}
        {["0ms", "130ms", "260ms", "390ms", "520ms"].map((delay) => (
          <span
            key={delay}
            className="sp-cover-leaf absolute inset-y-[5px] left-[7px] right-[4px] rounded-r-md bg-gradient-to-l from-white to-cloud-100 border border-cloud-300 overflow-hidden shadow-[-5px_0_12px_-4px_rgba(18,26,46,0.32)]"
            style={{ "--leaf-delay": delay } as React.CSSProperties}
          >
            <span className="absolute left-2 right-2 top-3 h-px bg-cloud-300" />
            <span className="absolute left-2 right-4 top-5 h-px bg-cloud-300" />
            <span className="absolute left-2 right-3 top-7 h-px bg-cloud-300" />
            <span className="absolute left-2 right-5 top-9 h-px bg-cloud-300" />
            <span className="absolute left-2 right-2 top-[68px] h-px bg-cloud-300" />
            <span className="absolute left-2 right-3 top-[76px] h-px bg-cloud-300" />
            <span className="absolute left-2 right-6 top-[84px] h-px bg-cloud-300" />
          </span>
        ))}
      </div>

      {/* The cover itself, under the stage — the pages turn on top of it. */}
      <div className="absolute inset-0 rounded-r-lg rounded-l-sm bg-navy-700 shadow-[0_10px_24px_-12px_rgba(18,26,46,0.7)] overflow-hidden z-10">
        {/* spine */}
        <span className="absolute inset-y-0 left-0 w-[7px] bg-navy-900" />
        <span className="absolute inset-y-0 left-[7px] w-px bg-white/15" />

        <div className="absolute inset-0 pl-[18px] pr-3 py-3.5 flex flex-col">
          <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-teal-300">
            SaralPrivacy
          </span>
          <span className="mt-auto text-white font-semibold text-[13px] leading-[1.15]">
            The Complete
            <br />
            DPDPA Guide
          </span>
          {/* The edition line carries the SELECTED language. It is the cheapest
              possible confirmation that picking a chip did something: the thing
              you are about to open changes in front of you. `lang` + `key` so a
              screen reader gets the right voice and the swap re-animates. */}
          <span className="mt-2 pt-2 border-t border-white/15 flex items-baseline justify-between gap-1">
            <span className="text-[8px] uppercase tracking-[0.1em] text-slate-300">
              2026 edition
            </span>
            <span
              key={lang.code}
              lang={lang.locale}
              className="text-[9px] font-semibold text-teal-300 animate-fade-up motion-reduce:animate-none"
            >
              {lang.native}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Per-language chip tints. Spelled out, never derived — the same rule
 * sector-accents.ts documents, and for the same reason: Tailwind scans source
 * text, so a constructed class is a class that does not exist.
 *
 * Seven hues is a lot of colour for a quiet reference section, so these are
 * tints (50/200/800), not fills: enough to read as seven distinct things at a
 * glance, not enough to compete with the one green action on this page. Every
 * pair is an 800 on a 50, which clears AA on all seven.
 */
const LANG_TINTS = [
  "bg-teal-50 border-teal-200 text-teal-800",
  "bg-amber-50 border-amber-200 text-amber-800",
  "bg-indigo-50 border-indigo-200 text-indigo-800",
  "bg-emerald-50 border-emerald-200 text-emerald-800",
  "bg-sky-50 border-sky-200 text-sky-800",
  "bg-violet-50 border-violet-200 text-violet-800",
  "bg-orange-50 border-orange-200 text-orange-800",
];

export function ResourcesSection() {
  // The cover opens once, when the section first reaches the viewport.
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  // Founder call: the language chips should be selectable. They were decoration
  // — seven tinted pills proving the count. Now they pick which edition the
  // card is offering, and TWO things follow the choice: the cover's edition
  // line, and where "Read the guide" actually goes. Every language has a live
  // reading page at /guides/dpdpa-guide-{code}.html, so this is a real
  // destination change, not a highlight.
  const [langCode, setLangCode] = useState(DEFAULT_LANG_CODE);
  const lang = getLanguage(langCode);
  const guideHref = lang.htmlUrl ?? "/white-paper";

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
    /* `divider`: the briefings deck above shares this deep fill again, so the
       boundary needs a hairline — a fill change would have been the boundary by
       itself, and there isn't one here. */
    <Section surface="deep" type="utility" divider>
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
          {/* `flex-1 items-center`: this card is a grid item stretched to the
              height of the two stacked cards beside it, and that surplus has to
              go somewhere. Pinned to the top it read as a hole under the link;
              centred, it reads as the margin a publication gets. */}
          <div ref={ref} className="flex flex-1 items-center gap-5 sm:gap-6">
            <GuideCover open={inView} lang={lang} />
            <div className="flex flex-col">
              <h3 className="font-semibold text-navy-700 text-base mb-2">
                The complete DPDPA guide
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                What the Act requires, who it applies to, and a 90-day plan,
                written against the DPDP Rules, 2025 as notified.
              </p>
              {/* The destination follows the chip. English keeps the plain
                  label; any other language names itself, so the reader can see
                  what they are about to open before they open it. */}
              <Link
                href={guideHref}
                className="mt-auto self-start inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors"
              >
                {lang.code === DEFAULT_LANG_CODE ? (
                  "Read the guide"
                ) : (
                  <>
                    Read the guide in{" "}
                    <span lang={lang.locale}>{lang.native}</span>
                  </>
                )}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* The languages, in their own scripts. The count was a number in a
              sentence; the scripts are the proof of the number, and for a
              reader whose first language is one of them it is also the fastest
              way to find that out. `lang` per chip so a screen reader that
              reaches them switches voice correctly. */}
          <div className="pt-5 mt-5 border-t border-cloud-200">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate-600 mb-2.5">
              Choose your language
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {GUIDE_LANGUAGES.map((l, i) => {
                const on = l.code === langCode;
                return (
                  <li key={l.code}>
                    <button
                      type="button"
                      lang={l.locale}
                      title={l.roman}
                      aria-pressed={on}
                      onClick={() => setLangCode(l.code)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 pointer-coarse:min-h-11 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
                        LANG_TINTS[i % LANG_TINTS.length]
                      } ${
                        on
                          ? "font-semibold ring-2 ring-current ring-offset-1 ring-offset-cloud-25"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {on && <Check size={11} aria-hidden className="shrink-0" />}
                      {l.native}
                    </button>
                  </li>
                );
              })}
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

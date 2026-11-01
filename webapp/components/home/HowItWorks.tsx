"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { ScoreDial } from "@/components/home/ScoreDial";
import { useInView } from "@/lib/hooks/useInView";
import { trackEvent } from "@/lib/analytics";

// S5 — "How it works": the four-stage conversion spine, on NAVY.
//
// Founder calls kept from the live version (2026-08-22): the four-stage spine,
// not three steps; the dark navy ground from the brand sheet; green appears
// once, on Assess — the step that is free, instant and needs nothing first — and
// no filled CTA here, because the close owns that.
//
// ── sd-web-design v2 pilot (2026-10-28) ─────────────────────────────────────
// Idea: what each tool hands you becomes the step itself. So the output — the
// data list, the flow map, the score, the bilingual notice pack — is shown at a
// size you can read, beside the step, instead of as a 46px thumbnail.
// Removed as page tells (sd-web-design rules/guardrails.md §7): the eyebrow,
// 1–4 number badges (order is the <ol> and the line), icons in tinted tiles,
// 9–10px uppercase captions, 1px outlined cards, the grey-bar notice mock-up,
// the dashed fan and the "coming soon" pill. Three steps are open rows on the
// navy (a tone step on hover); Assess is the one filled panel, so the free,
// instant step is the dominant thing on the screen. Strings are catalog keys
// (home.howItWorks.*, with shots.* added for the captures' alt text).
// The one move: the spine draws down once as the section arrives (transform
// only); reduced motion shows it drawn.
//
// ── sd-web-design v2.1 (2026-10-28) ─────────────────────────────────────────
// Real product, not drawings: Discover, Map and Fix show captures of the live
// tools in a telling state (public/images/how-it-works/<locale>/, made with the
// skill's scripts/capture.py; re-capture when those screens change). Assess
// keeps the product's own ScoreDial, live, because a real score needs a full
// assessment run. Visible without scripting: the server sends every step
// visible; the reveal arms only once the script has run and found the section
// still below the screen, so a failed script never leaves a blank section.

type StepKey = "discover" | "map" | "assess" | "fix";

// Each row is the step's name, then what it hands you (the catalog's `cap`):
// the deliverable is the row's second line, set strong, not a grey footnote.
const steps: { key: StepKey; href: string; primary?: boolean }[] = [
  { key: "discover", href: "/discovery" },
  { key: "map", href: "/data-mapping" },
  { key: "assess", href: "/assessment", primary: true },
  { key: "fix", href: "/tools/dpdpa-privacy-notice-generator" },
];

// What each tool hands you: a capture of the real screen, framed by a tone step
// (the Map capture is navy itself). Desktop shows the 1280px screen; a phone
// shows the product's own 390px layout, so its text stays readable. Pixel sizes
// are the captures' own.
const shots: Record<Exclude<StepKey, "assess">, { w: number; h: number; pw: number; ph: number }> = {
  discover: { w: 1200, h: 765, pw: 584, ph: 780 },
  map: { w: 1200, h: 602, pw: 666, ph: 780 },
  fix: { w: 1200, h: 908, pw: 698, ph: 780 },
};

function StepOutput({ kind }: { kind: StepKey }) {
  const t = useTranslations("home.howItWorks");
  const locale = useLocale() === "hi" ? "hi" : "en";
  if (kind === "assess") {
    return (
      <div data-ui>
        <ScoreDial value={41} size={88} stroke={9} variant="quiet" onDark showTotal={false} />
      </div>
    );
  }
  const s = shots[kind];
  return (
    <span data-ui className="block w-full rounded-2xl bg-navy-600 p-1.5">
      <Image
        src={`/images/how-it-works/${locale}/${kind}.png`}
        alt={t(`shots.${kind}`)}
        width={s.w}
        height={s.h}
        sizes="(min-width: 1024px) 40rem, 55vw"
        className="hidden md:block w-full h-auto rounded-xl"
      />
      <Image
        src={`/images/how-it-works/${locale}/${kind}-phone.png`}
        alt={t(`shots.${kind}`)}
        width={s.pw}
        height={s.ph}
        sizes="90vw"
        className="md:hidden w-full h-auto rounded-xl"
      />
    </span>
  );
}

// Deep Review is left out until it ships: a "coming soon" item is a promise, not a step.
const leaves = [
  { key: "dailyBrief", href: "/briefings" },
  { key: "sectorDeepDive", href: "/industries" },
] as const;

export function HowItWorks() {
  const t = useTranslations("home.howItWorks");
  const { ref, inView } = useInView<HTMLDivElement>();
  // Armed only by the script, and only if the section starts below the screen:
  // the server's HTML (and a page whose script failed) shows everything.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight) setArmed(true);
  }, [ref]);
  const waiting = armed && !inView;

  const arrive = (i: number) => ({
    style: { transitionDelay: `${i * 90}ms` },
    className: `transition-[opacity,transform] duration-500 ease-out motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!transition-none ${
      waiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
    }`,
  });

  return (
    <Section surface="navy" type="demo">
      <div ref={ref}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end mb-14">
          <h2 className="md:col-span-7 type-display-2 text-white">{t("title")}</h2>
          <p className="md:col-span-5 text-lg leading-relaxed text-cloud-100">{t("intro")}</p>
        </div>

        <div className="relative">
          {/* the spine: one 3px line that draws down once */}
          <span
            aria-hidden
            className={`absolute left-[11px] top-3 bottom-3 w-[3px] rounded-full bg-teal-400/70 origin-top transition-transform duration-[1200ms] ease-out motion-reduce:!scale-y-100 motion-reduce:!transition-none ${
              waiting ? "scale-y-0" : "scale-y-100"
            }`}
          />
          <ol className="relative space-y-4">
            {steps.map((step, i) => {
              const a = arrive(i);
              return (
                <li key={step.key} className={`relative pl-10 ${a.className}`} style={a.style}>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-7 w-[25px] h-[25px] rounded-full ${step.primary ? "bg-green-400" : "bg-teal-400"} ring-4 ring-navy-700`}
                  />
                  <Link
                    href={step.href}
                    onClick={() => trackEvent.hiwStepClick({ step: step.key })}
                    className={`group grid gap-5 md:grid-cols-12 md:items-start rounded-2xl px-5 py-6 md:px-7 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                      step.primary
                        ? "bg-green-400/10 border-2 border-green-400/60 hover:border-green-400 focus-visible:ring-green-400"
                        : "hover:bg-navy-600 focus-visible:ring-teal-400"
                    }`}
                  >
                    <span className="md:col-span-5 block">
                      <span className="flex items-center gap-2 text-2xl font-semibold text-white">
                        {t(`steps.${step.key}.title`)}
                        <ArrowRight
                          size={20}
                          className={`transition-transform group-hover:translate-x-1 motion-reduce:!translate-x-0 ${step.primary ? "text-green-300" : "text-teal-300"}`}
                        />
                      </span>
                      <span className={`block text-xl font-semibold mt-1.5 ${step.primary ? "text-green-200" : "text-teal-100"}`}>
                        {t(`steps.${step.key}.cap`)}
                      </span>
                    </span>
                    <span className="md:col-span-7 flex md:justify-end">
                      <StepOutput kind={step.key} />
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className={`relative pl-10 ${arrive(steps.length).className}`} style={arrive(steps.length).style}>
              <span aria-hidden className="absolute left-0 top-7 w-[25px] h-[25px] rounded-full bg-cloud-50 ring-4 ring-navy-700" />
              <div className="rounded-2xl bg-navy-600 px-5 py-6 md:px-7">
                <span className="block text-2xl font-semibold text-white">{t("milestoneTitle")}</span>
                <span className="block text-lg text-cloud-100 mt-1.5">{t("milestoneSub")}</span>
              </div>
            </li>
          </ol>
        </div>

        <ul className={`mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-3 pl-10 ${arrive(steps.length + 1).className}`} style={arrive(steps.length + 1).style}>
          {leaves.map((leaf) => (
            <li key={leaf.key}>
              <Link href={leaf.href} className="group inline-flex items-center gap-1.5 text-lg font-semibold text-white hover:text-teal-200">
                {t(`leaves.${leaf.key}.title`)}
                <ArrowRight size={16} className="text-teal-300 transition-transform group-hover:translate-x-0.5 motion-reduce:!translate-x-0" />
              </Link>
              <span className="block text-base text-slate-300 mt-0.5">{t(`leaves.${leaf.key}.sub`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

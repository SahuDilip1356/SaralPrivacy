"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
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
// instant step is the dominant thing on the screen. Every string is an
// existing catalog key, so all locales keep working.
// The one move: the spine draws down once as the section arrives (transform
// only); reduced motion shows it drawn.

type StepKey = "discover" | "map" | "assess" | "fix";

// `note`: the one catalog line that adds to the step's sentence rather than
// repeating it (Discover's cap and Fix's tag restate their sub).
const steps: { key: StepKey; href: string; note: "tag" | "cap"; primary?: boolean }[] = [
  { key: "discover", href: "/discovery", note: "tag" },
  { key: "map", href: "/data-mapping", note: "cap" },
  { key: "assess", href: "/assessment", note: "cap", primary: true },
  { key: "fix", href: "/tools/dpdpa-privacy-notice-generator", note: "cap" },
];

// What each tool hands you, drawn from the product's own vocabulary.
// data-ui: a real interface fragment, which keeps its own small type and fills.
function StepOutput({ kind }: { kind: StepKey }) {
  const t = useTranslations("home.howItWorks");
  if (kind === "discover") {
    return (
      <div data-ui className="flex flex-wrap gap-2">
        {(["customers", "staff", "cctv", "vendors"] as const).map((l) => (
          <span key={l} className="text-sm font-medium text-teal-100 bg-teal-400/20 rounded-full px-3 py-1">
            {t(`artifactChips.${l}`)}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "map") {
    // three stages on a flow; the gold dot marks where control breaks
    return (
      <div data-ui aria-hidden className="flex items-center">
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center">
            <span className="relative block w-10 h-10 rounded-lg bg-teal-400/25">
              {i === 2 && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-gold-400" />}
            </span>
            {i < 2 && <span className="block w-8 h-[3px] bg-teal-400/70" />}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "assess") {
    return (
      <div data-ui>
        <ScoreDial value={41} size={72} stroke={8} variant="quiet" onDark showTotal={false} />
      </div>
    );
  }
  // The notice pack is paper, and paper is light on every ground.
  return (
    <div data-ui className="relative w-36 rounded-md bg-cloud-50 px-3.5 py-3 overflow-hidden">
      <span className="block text-sm font-semibold text-navy-800">{t("steps.fix.tag")}</span>
      <span className="block text-sm text-slate-700 mt-1">EN + हिन्दी</span>
      <span aria-hidden className="absolute top-0 right-0 w-4 h-4 bg-gold-400" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
    </div>
  );
}

const leaves = [
  { key: "dailyBrief", href: "/briefings" },
  { key: "sectorDeepDive", href: "/industries" },
  { key: "deepReview", href: null },
] as const;

export function HowItWorks() {
  const t = useTranslations("home.howItWorks");
  const { ref, inView } = useInView<HTMLDivElement>();

  const arrive = (i: number) => ({
    style: { transitionDelay: `${i * 90}ms` },
    className: `transition-[opacity,transform] duration-500 ease-out motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!transition-none ${
      inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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
              inView ? "scale-y-100" : "scale-y-0"
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
                    className={`group grid gap-5 md:grid-cols-12 md:items-center rounded-2xl px-5 py-6 md:px-7 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                      step.primary
                        ? "bg-green-400/10 border-2 border-green-400/60 hover:border-green-400 focus-visible:ring-green-400"
                        : "hover:bg-navy-600 focus-visible:ring-teal-400"
                    }`}
                  >
                    <span className="md:col-span-7 block">
                      <span className="flex items-center gap-2 text-2xl font-semibold text-white">
                        {t(`steps.${step.key}.title`)}
                        <ArrowRight
                          size={20}
                          className={`transition-transform group-hover:translate-x-1 motion-reduce:!translate-x-0 ${step.primary ? "text-green-300" : "text-teal-300"}`}
                        />
                      </span>
                      <span className="block text-lg text-cloud-100 mt-1.5">{t(`steps.${step.key}.sub`)}</span>
                      <span className="block text-base text-slate-300 mt-1">{t(`steps.${step.key}.${step.note}`)}</span>
                    </span>
                    <span className="md:col-span-5 flex md:justify-end">
                      <StepOutput kind={step.key} />
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className={`relative pl-10 ${arrive(steps.length).className}`} style={arrive(steps.length).style}>
              <span aria-hidden className="absolute left-0 top-7 w-[25px] h-[25px] rounded-full bg-cloud-50 ring-4 ring-navy-700" />
              <div className="rounded-2xl bg-cloud-50 px-5 py-6 md:px-7">
                <span className="block text-2xl font-semibold text-navy-800">{t("milestoneTitle")}</span>
                <span className="block text-lg text-slate-700 mt-1.5">{t("milestoneSub")}</span>
              </div>
            </li>
          </ol>
        </div>

        <ul className={`mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-3 pl-10 ${arrive(steps.length + 1).className}`} style={arrive(steps.length + 1).style}>
          {leaves.map((leaf) =>
            leaf.href ? (
              <li key={leaf.key}>
                <Link href={leaf.href} className="group inline-flex items-center gap-1.5 text-lg font-semibold text-white hover:text-teal-200">
                  {t(`leaves.${leaf.key}.title`)}
                  <ArrowRight size={16} className="text-teal-300 transition-transform group-hover:translate-x-0.5 motion-reduce:!translate-x-0" />
                </Link>
                <span className="block text-base text-slate-300 mt-0.5">{t(`leaves.${leaf.key}.sub`)}</span>
              </li>
            ) : (
              <li key={leaf.key}>
                <span className="block text-lg font-semibold text-cloud-200">{t(`leaves.${leaf.key}.title`)}</span>
                <span className="block text-base text-slate-300 mt-0.5">{t("comingSoon")}</span>
              </li>
            ),
          )}
        </ul>
      </div>
    </Section>
  );
}

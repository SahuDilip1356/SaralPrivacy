"use client";

import Link from "next/link";
import {
  Search,
  Workflow,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Newspaper,
  Telescope,
  Microscope,
  ArrowRight,
} from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ScoreDial } from "@/components/home/ScoreDial";
import { useInView } from "@/lib/hooks/useInView";
import { trackEvent } from "@/lib/analytics";

// S5 — "How it works": the four-stage conversion spine, on NAVY.
//
// ── Two reversals, both founder calls, both worth recording ──────────────────
// I had replaced this with a three-step version (choose industry → answer →
// score) because readers of the four-stage spine were concluding that the
// 3-minute check was step three of four, and that they owed us two tools' worth
// of work before getting a score. The founder has now seen both versions live
// and prefers this one (2026-08-22): "how it works of the live system is the
// best, but it must have dark background as per the brand sheet."
//
// The old failure mode is real, so it is designed against rather than ignored:
// **Assess carries a green ring the other three don't**. Green is the page's
// action colour and it appears exactly once in this section, on the step that
// is free, instant and needs nothing first. The other three read as a map of
// what exists, which is what they are. No filled CTA is added here — the close
// already owns that, and a fifth green button would spend the rationing.
//
// Second reversal: this section takes the navy that the briefings deck held for
// about an hour. With the recognition band gone, the page needed one mid-page
// dark beat, and this is a better one — it is the product, not a biography.
// The briefings deck goes back to the deep fill to pay for it, so navy still
// means "a chapter turned" rather than "most of the page".
//
// ── Ink, re-measured for navy-700 ────────────────────────────────────────────
// Ported line by line from the light version; every colour that referenced a
// light ground was re-derived, not tinted:
//   teal-700 lines → teal-400   (teal-700 is 3.52:1 on navy — banned)
//   teal-50 tiles  → teal-400/15 with teal-300 glyphs
//   white cards    → navy-600 + white/10 hairline (the risk map's chip idiom;
//                    five white cards on navy would be the light design pasted
//                    onto a dark rectangle)
//   slate-600 body → slate-300 (11.66:1); caps → slate-400 (6.75:1, correct
//                    here and banned on any light fill)
// The one thing that stays light is the Notice Pack artifact: it depicts paper,
// and paper is white on every ground.

type Step = {
  n: number;
  key: "discover" | "map" | "assess" | "fix";
  icon: typeof Search;
  title: string;
  sub: string;
  tag: string; // product name kept discoverable (Data Discovery / Notice Pack …)
  cap: string; // caps micro-outcome (what you walk away with)
  href: string;
  badge: string; // number-badge fill (full class for Tailwind purge-safety)
  ring: string; // icon tile
  iconColor: string;
  /** The one step that is free, instant, and needs nothing before it. */
  primary?: boolean;
};

const steps: Step[] = [
  {
    n: 1,
    key: "discover",
    icon: Search,
    title: "Discover",
    sub: "Find where your personal data sits",
    tag: "Data Discovery",
    cap: "Know where your data sits",
    href: "/discovery",
    badge: "bg-teal-400",
    ring: "bg-teal-400/15",
    iconColor: "text-teal-300",
  },
  {
    n: 2,
    key: "map",
    icon: Workflow,
    title: "Map",
    sub: "See where it travels — and where control breaks",
    tag: "Data Flow",
    cap: "Your sector's flow map",
    href: "/data-mapping",
    badge: "bg-teal-400",
    ring: "bg-teal-400/15",
    iconColor: "text-teal-300",
  },
  {
    n: 3,
    key: "assess",
    icon: ClipboardCheck,
    title: "Assess",
    sub: "Score your current risk",
    tag: "Assessment",
    cap: "Your score in 3 minutes",
    href: "/assessment",
    badge: "bg-green-400",
    ring: "bg-green-400/20",
    iconColor: "text-green-300",
    primary: true,
  },
  {
    n: 4,
    key: "fix",
    icon: FileText,
    title: "Fix what matters",
    sub: "Generate notices + first controls",
    tag: "Notice Pack",
    cap: "Notice pack as a branded PDF",
    href: "/tools/dpdpa-privacy-notice-generator",
    badge: "bg-gold-400",
    ring: "bg-gold-400/15",
    iconColor: "text-gold-300",
  },
];

// Per-step artifact — supporting proof, kept deliberately quiet so the step
// title stays the standout (one standout per card). Desktop: beside the title.
// Mobile: wraps onto its own row under the text. CSS/SVG only.
function StepArtifact({ kind }: { kind: Step["key"] }) {
  if (kind === "discover") {
    return (
      <div className="flex flex-wrap gap-1 justify-start sm:justify-end sm:max-w-[124px] shrink-0">
        {["Customers", "Staff", "CCTV", "Vendors"].map((l) => (
          <span
            key={l}
            className="text-[9px] font-medium text-teal-200 bg-teal-400/15 border border-teal-400/30 rounded-full px-1.5 py-0.5"
          >
            {l}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "map") {
    // three stage nodes on a flow line; the gold dot marks a hotspot
    return (
      <div className="flex items-center gap-1 shrink-0">
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="relative inline-block w-5 h-5 rounded-md bg-teal-400/15 border border-teal-400/40">
              {i === 2 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-400" />
              )}
            </span>
            {i < 2 && <span className="inline-block w-2 h-px bg-teal-400" />}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "assess") {
    return (
      <div className="block shrink-0">
        <ScoreDial value={41} size={46} stroke={6} variant="quiet" onDark showTotal={false} />
      </div>
    );
  }
  // fix — notice-PDF corner mock. Stays light on purpose: it is a sheet of
  // paper, and a navy sheet of paper is not a thing.
  return (
    <div className="block shrink-0">
      <div className="relative w-[62px] h-[46px] rounded-md bg-cloud-100 border border-cloud-300 p-2 overflow-hidden">
        <div className="h-1 w-7 bg-slate-400 rounded-full mb-1.5" />
        <div className="h-[3px] w-full bg-cloud-300 rounded-full mb-1" />
        <div className="h-[3px] w-4/5 bg-cloud-300 rounded-full mb-1.5" />
        <div className="text-[6.5px] leading-none text-slate-600">EN + हिन्दी</div>
        <div
          className="absolute top-0 right-0 w-3 h-3 bg-gold-400"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />
      </div>
    </div>
  );
}

const leaves = [
  {
    icon: Newspaper,
    title: "Daily Brief",
    sub: "5-min updates + actions",
    href: "/briefings",
  },
  {
    icon: Telescope,
    title: "Sector Deep Dive",
    sub: "Go deeper on your sector",
    href: "/industries",
  },
  {
    icon: Microscope,
    title: "Deep Review",
    sub: "Coming soon",
    href: null,
  },
] as const;

export function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>();

  // staggered reveal: each row fades up after its predecessor lands
  const reveal = () =>
    `transition-all duration-500 ease-out motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!transition-none ${
      inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  return (
    <Section surface="navy" type="demo" width="narrow">
      <div ref={ref}>
        {/* header */}
        <div className="text-center mb-11">
          <Eyebrow surface="navy" className="mb-3">
            How it works
          </Eyebrow>
          <h2 className="type-display-3 text-white mb-3">
            Start anywhere. It&apos;s all free to try.
          </h2>
          <p className="type-intro text-slate-300 max-w-md mx-auto">
            Four steps to DPDPA-ready — follow them in order, or jump straight to
            what you need.
          </p>
        </div>

        {/* spine */}
        <div className="flex flex-col items-center">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="w-full flex flex-col items-center">
                <Link
                  href={step.href}
                  onClick={() => trackEvent.hiwStepClick({ step: step.key })}
                  style={{ transitionDelay: `${i * 140}ms` }}
                  className={`group relative w-full max-w-lg flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl bg-navy-600 border px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                    step.primary
                      ? "border-green-400/50 ring-1 ring-green-400/25 hover:border-green-400 focus-visible:ring-green-400"
                      : "border-white/10 hover:border-teal-400/50 focus-visible:ring-teal-400"
                  } ${reveal()}`}
                >
                  <span
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full grid place-items-center text-xs font-semibold text-navy-950 ${step.badge}`}
                  >
                    {step.n}
                  </span>
                  <span
                    className={`order-1 shrink-0 w-11 h-11 rounded-lg grid place-items-center ${step.ring}`}
                  >
                    <Icon size={20} className={step.iconColor} />
                  </span>
                  <span className="order-2 min-w-0 flex-1">
                    <span className="block text-white font-semibold text-[15px]">
                      {step.title}
                    </span>
                    <span className="block text-slate-300 text-xs mt-0.5">
                      {step.sub} <span className="text-slate-400">· {step.tag}</span>
                    </span>
                    <span className="block text-[10px] font-semibold tracking-wide uppercase text-slate-400 mt-1.5">
                      {step.cap}
                    </span>
                  </span>
                  {/* artifact: inline beside the text on desktop; wraps to its own
                      row (indented under the text) on mobile via basis-full */}
                  <span className="order-4 sm:order-3 basis-full sm:basis-auto pl-[58px] sm:pl-0">
                    <StepArtifact kind={step.key} />
                  </span>
                  <ArrowRight
                    size={16}
                    className={`order-3 sm:order-4 shrink-0 transition-colors ${
                      step.primary
                        ? "text-green-300"
                        : "text-slate-400 group-hover:text-teal-300"
                    }`}
                  />
                </Link>
                {/* connector */}
                <span
                  aria-hidden
                  className="my-2 h-8 w-0.5 rounded-full opacity-70 sp-line-flow"
                />
              </div>
            );
          })}

          {/* milestone */}
          <div
            style={{ transitionDelay: `${steps.length * 140}ms` }}
            className={`w-full max-w-lg flex items-center gap-3.5 rounded-xl border-[1.5px] border-green-400/40 bg-green-400/10 px-4 py-4 ${reveal()}`}
          >
            <span className="shrink-0 w-11 h-11 rounded-lg grid place-items-center bg-green-400/20">
              <ShieldCheck size={22} className="text-green-300" />
            </span>
            <span className="min-w-0">
              <span className="block text-white font-semibold text-base">
                You&apos;re DPDPA-ready
              </span>
              <span className="block text-slate-300 text-xs mt-0.5">
                Keep evidence ready for customers, vendors &amp; regulators
              </span>
            </span>
          </div>

          {/* branch connector — teal dashed-bezier fan flowing from the
              milestone down to the three leaves (same aesthetic as the risk
              map's scatter). Mobile stacks → simple stem.
              stroke is teal-400, not the light version's teal-700: on navy that
              ink measures 3.52:1 and effectively disappears. */}
          <span
            aria-hidden
            className="my-2 h-6 w-px border-l-2 border-dashed border-teal-400 sm:hidden"
          />
          <svg
            aria-hidden
            viewBox="0 0 768 44"
            height={44}
            preserveAspectRatio="none"
            style={{ transitionDelay: `${(steps.length + 1) * 140}ms` }}
            className={`hidden sm:block w-full mt-1 mb-1 transition-opacity duration-500 motion-reduce:!opacity-100 ${
              inView ? "opacity-100" : "opacity-0"
            }`}
          >
            {[
              "M384 2 C 384 28, 128 16, 128 43",
              "M384 2 L 384 43",
              "M384 2 C 384 28, 640 16, 640 43",
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                className="sp-dash-flow stroke-teal-400 fill-none opacity-70"
                strokeWidth={1.6}
                strokeDasharray="5 6"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* 3-way "keep it living" branch */}
          <div
            style={{ transitionDelay: `${(steps.length + 1) * 140}ms` }}
            className={`w-full grid grid-cols-1 sm:grid-cols-3 gap-3 ${reveal()}`}
          >
            {leaves.map((leaf) => {
              const Icon = leaf.icon;
              const comingSoon = leaf.href === null;
              const inner = (
                <>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center ${
                      comingSoon ? "bg-white/5" : "bg-teal-400/15"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={comingSoon ? "text-slate-400" : "text-teal-300"}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block font-semibold text-sm ${
                        comingSoon ? "text-slate-300" : "text-white"
                      }`}
                    >
                      {leaf.title}
                    </span>
                    {comingSoon ? (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-gold-300 bg-gold-400/15 rounded-full px-2 py-0.5">
                        Coming soon
                      </span>
                    ) : (
                      <span className="block text-slate-300 text-xs mt-0.5">
                        {leaf.sub}
                      </span>
                    )}
                  </span>
                  <ArrowRight
                    size={14}
                    className={`ml-auto shrink-0 transition-colors ${
                      comingSoon ? "text-slate-400" : "text-slate-400 group-hover:text-teal-300"
                    }`}
                  />
                </>
              );
              const base = "flex items-center gap-2.5 rounded-xl border px-3.5 py-3";
              return comingSoon ? (
                <div
                  key={leaf.title}
                  className={`${base} border-dashed border-white/15 bg-white/[0.03] cursor-not-allowed`}
                  title="Coming soon"
                >
                  {inner}
                </div>
              ) : (
                <Link
                  key={leaf.title}
                  href={leaf.href as string}
                  className={`group ${base} bg-navy-600 border-white/10 hover:border-teal-400/50 transition-colors`}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

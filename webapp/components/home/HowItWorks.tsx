"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Newspaper,
  Telescope,
  Microscope,
  ArrowRight,
} from "lucide-react";
import { ScoreDial } from "@/components/home/ScoreDial";
import { trackEvent } from "@/lib/analytics";

// Beat 4 — "How it works = do it now". The conversion spine: 3 live steps →
// a DPDPA-ready milestone → a 3-way "keep it living" branch. Ported from the
// approved `how_it_works_centered_fixed` mockup. Brand tokens via Tailwind:
// teal-500 #35B6AE · green-500 #07B981 · gold-400 #E8AB42 · navy-700 #121A2E.

type Step = {
  n: number;
  key: "discover" | "assess" | "fix";
  icon: typeof Search;
  title: string;
  sub: string;
  tag: string; // product name kept discoverable (Data Discovery / Notice Pack …)
  cap: string; // caps micro-outcome (what you walk away with)
  href: string;
  badge: string; // number-badge bg (full class for Tailwind purge-safety)
  ring: string; // icon tint bg
  iconColor: string;
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
    badge: "bg-teal-500",
    ring: "bg-teal-500/15",
    iconColor: "text-teal-400",
  },
  {
    n: 2,
    key: "assess",
    icon: ClipboardCheck,
    title: "Assess",
    sub: "Score your current risk",
    tag: "Assessment",
    cap: "Your score in 3 minutes",
    href: "/assessment",
    badge: "bg-green-500",
    ring: "bg-green-500/15",
    iconColor: "text-green-400",
  },
  {
    n: 3,
    key: "fix",
    icon: FileText,
    title: "Fix what matters",
    sub: "Generate notices + first controls",
    tag: "Notice Pack",
    cap: "Notice pack as a branded PDF",
    href: "/tools/dpdpa-privacy-notice-generator",
    badge: "bg-gold-400",
    ring: "bg-gold-400/15",
    iconColor: "text-gold-400",
  },
];

// Per-step artifact — supporting proof, kept deliberately quiet so the step
// title stays the standout (design-review criterion: one standout per card).
// Desktop only (hidden below sm); pure CSS/SVG, no images.
function StepArtifact({ kind }: { kind: Step["key"] }) {
  if (kind === "discover") {
    return (
      <div className="hidden sm:flex flex-wrap gap-1 max-w-[124px] justify-end shrink-0 opacity-85">
        {["Customers", "Staff", "CCTV", "Vendors"].map((l) => (
          <span
            key={l}
            className="text-[9px] font-medium text-teal-300 bg-teal-500/10 border border-teal-500/25 rounded-full px-1.5 py-0.5"
          >
            {l}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "assess") {
    return (
      <div className="hidden sm:block shrink-0 opacity-85">
        <ScoreDial value={41} size={46} stroke={6} variant="quiet" showTotal={false} />
      </div>
    );
  }
  // fix — notice-PDF corner mock
  return (
    <div className="hidden sm:block shrink-0 opacity-85">
      <div className="relative w-[62px] h-[46px] rounded-md bg-white/[0.05] border border-white/15 p-2 overflow-hidden">
        <div className="h-1 w-7 bg-white/25 rounded-full mb-1.5" />
        <div className="h-[3px] w-full bg-white/10 rounded-full mb-1" />
        <div className="h-[3px] w-4/5 bg-white/10 rounded-full mb-1.5" />
        <div className="text-[6.5px] leading-none text-slate-400">EN + हिन्दी</div>
        <div
          className="absolute top-0 right-0 w-3 h-3 bg-gold-400/40"
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

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

export function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>();

  // staggered reveal: each row fades up after its predecessor lands
  const reveal = (i: number) =>
    `transition-all duration-500 ease-out motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!transition-none ${
      inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  return (
    <section className="bg-navy-700 py-20">
      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-teal-400 mb-3">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Start anywhere. It&apos;s all free to try.
          </h2>
          <p className="text-slate-300 text-base max-w-md mx-auto leading-relaxed">
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
                  className={`group relative w-full max-w-lg flex items-center gap-3.5 rounded-xl border border-white/10 bg-navy-600/40 hover:border-white/25 hover:bg-navy-600/70 px-4 py-3.5 ${reveal(i)}`}
                >
                  <span
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full grid place-items-center text-xs font-semibold text-navy-700 ${step.badge}`}
                  >
                    {step.n}
                  </span>
                  <span
                    className={`shrink-0 w-11 h-11 rounded-lg grid place-items-center ${step.ring}`}
                  >
                    <Icon size={20} className={step.iconColor} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-white font-semibold text-[15px]">
                      {step.title}
                    </span>
                    <span className="block text-slate-400 text-xs mt-0.5">
                      {step.sub} <span className="text-slate-500">· {step.tag}</span>
                    </span>
                    <span className="block text-[10px] font-semibold tracking-wide uppercase text-slate-400 mt-1.5">
                      {step.cap}
                    </span>
                  </span>
                  <StepArtifact kind={step.key} />
                  <ArrowRight
                    size={16}
                    className="text-slate-500 group-hover:text-teal-400 transition-colors shrink-0"
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
            className={`w-full max-w-lg flex items-center gap-3.5 rounded-xl border-[1.5px] border-green-500/60 bg-green-900/20 px-4 py-4 ${reveal(steps.length)}`}
          >
            <span className="shrink-0 w-11 h-11 rounded-lg grid place-items-center bg-green-500/20">
              <ShieldCheck size={22} className="text-green-400" />
            </span>
            <span className="min-w-0">
              <span className="block text-white font-semibold text-base">
                You&apos;re DPDPA-ready
              </span>
              <span className="block text-slate-400 text-xs mt-0.5">
                Keep evidence ready for customers, vendors &amp; regulators
              </span>
            </span>
          </div>

          {/* branch connector — a 3-prong fan that flows from the milestone to
              all three leaves (desktop). Mobile stacks, so the fan is hidden. */}
          <span
            aria-hidden
            className="my-2 h-6 w-px border-l-2 border-dashed border-teal-500/40 sm:hidden"
          />
          <div aria-hidden className="hidden sm:block relative w-full h-7 mt-1 mb-1">
            <span className="absolute left-1/2 -translate-x-1/2 top-0 h-3 w-0.5 bg-teal-500/40" />
            <span className="absolute top-3 left-[16.666%] right-[16.666%] h-0.5 bg-teal-500/30" />
            <span className="absolute top-3 left-[16.666%] -translate-x-1/2 h-4 w-0.5 bg-teal-500/30" />
            <span className="absolute top-3 left-1/2 -translate-x-1/2 h-4 w-0.5 bg-teal-500/40" />
            <span className="absolute top-3 left-[83.333%] -translate-x-1/2 h-4 w-0.5 bg-teal-500/30" />
          </div>

          {/* 3-way "keep it living" branch */}
          <div
            style={{ transitionDelay: `${(steps.length + 1) * 140}ms` }}
            className={`w-full grid grid-cols-1 sm:grid-cols-3 gap-3 ${reveal(steps.length + 1)}`}
          >
            {leaves.map((leaf) => {
              const Icon = leaf.icon;
              const comingSoon = leaf.href === null;
              const inner = (
                <>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center ${comingSoon ? "bg-white/5" : "bg-teal-500/15"}`}
                  >
                    <Icon
                      size={18}
                      className={comingSoon ? "text-slate-500" : "text-teal-400"}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block font-semibold text-sm ${comingSoon ? "text-slate-300" : "text-white"}`}
                    >
                      {leaf.title}
                    </span>
                    {comingSoon ? (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-gold-400 bg-gold-400/15 rounded-full px-2 py-0.5">
                        Coming soon
                      </span>
                    ) : (
                      <span className="block text-slate-400 text-xs mt-0.5">
                        {leaf.sub}
                      </span>
                    )}
                  </span>
                  <ArrowRight
                    size={14}
                    className={`ml-auto shrink-0 transition-colors ${
                      comingSoon
                        ? "text-slate-600"
                        : "text-slate-500 group-hover:text-teal-400"
                    }`}
                  />
                </>
              );
              const base =
                "flex items-center gap-2.5 rounded-xl border px-3.5 py-3";
              return comingSoon ? (
                <div
                  key={leaf.title}
                  className={`${base} border-dashed border-white/15 bg-navy-600/30 cursor-not-allowed opacity-75`}
                  title="Coming soon"
                >
                  {inner}
                </div>
              ) : (
                <Link
                  key={leaf.title}
                  href={leaf.href as string}
                  className={`group ${base} border-white/10 bg-navy-600/40 hover:border-teal-500/40 hover:bg-navy-600/70 transition-colors`}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

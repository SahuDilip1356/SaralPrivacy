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

// Beat 4 — "How it works = do it now". The conversion spine: 3 live steps →
// a DPDPA-ready milestone → a 3-way "keep it living" branch. Ported from the
// approved `how_it_works_centered_fixed` mockup. Brand tokens via Tailwind:
// teal-500 #35B6AE · green-500 #07B981 · gold-400 #E8AB42 · navy-700 #121A2E.

type Step = {
  n: number;
  icon: typeof Search;
  title: string;
  sub: string;
  href: string;
  badge: string; // number-badge bg (full class for Tailwind purge-safety)
  ring: string; // icon tint bg
  iconColor: string;
};

const steps: Step[] = [
  {
    n: 1,
    icon: Search,
    title: "Discover",
    sub: "Find where your personal data sits",
    href: "/discovery",
    badge: "bg-teal-500",
    ring: "bg-teal-500/15",
    iconColor: "text-teal-400",
  },
  {
    n: 2,
    icon: ClipboardCheck,
    title: "Assess",
    sub: "Score your current risk",
    href: "/assessment",
    badge: "bg-green-500",
    ring: "bg-green-500/15",
    iconColor: "text-green-400",
  },
  {
    n: 3,
    icon: FileText,
    title: "Fix what matters",
    sub: "Generate notices + first controls",
    href: "/tools/dpdpa-privacy-notice-generator",
    badge: "bg-gold-400",
    ring: "bg-gold-400/15",
    iconColor: "text-gold-400",
  },
];

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
                  style={{ transitionDelay: `${i * 140}ms` }}
                  className={`group relative w-full max-w-md flex items-center gap-3.5 rounded-xl border border-white/10 bg-navy-600/40 hover:border-white/25 hover:bg-navy-600/70 px-4 py-3.5 ${reveal(i)}`}
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
                  <span className="min-w-0">
                    <span className="block text-white font-semibold text-[15px]">
                      {step.title}
                    </span>
                    <span className="block text-slate-400 text-xs mt-0.5">
                      {step.sub}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-500 group-hover:text-teal-400 transition-colors shrink-0"
                  />
                </Link>
                {/* connector */}
                <span
                  aria-hidden
                  className="my-2 h-8 w-px border-l-2 border-dashed border-teal-500/40"
                />
              </div>
            );
          })}

          {/* milestone */}
          <div
            style={{ transitionDelay: `${steps.length * 140}ms` }}
            className={`w-full max-w-md flex items-center gap-3.5 rounded-xl border-[1.5px] border-green-500/60 bg-green-900/20 px-4 py-4 ${reveal(steps.length)}`}
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

          {/* branch connector */}
          <span
            aria-hidden
            className="my-2 h-8 w-px border-l-2 border-dashed border-teal-500/40"
          />

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
                  className={`${base} border-white/10 bg-navy-600/40 hover:border-teal-500/40 hover:bg-navy-600/70 transition-colors`}
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

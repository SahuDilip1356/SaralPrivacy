"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ListChecks,
  MessageSquareText,
  FileText,
  Search,
  Workflow,
  FilePlus2,
  ArrowRight,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { surfaceClasses } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

// S6 — "How it works". THREE steps, and all three are the assessment.
//
// This used to teach a four-product spine (Discover → Map → Assess → Fix) with
// each step a live link. It was accurate about the platform and wrong about the
// page: a visitor reading it concluded the 3-minute check was step three of
// four, and that they owed us two tools' worth of work before getting a score.
//
// So the four-product story moves below, under "Continue after your
// assessment", where it is a menu rather than a prerequisite. Every destination
// stays live and `hiw_step_click` still fires for each.

const steps = [
  {
    n: 1,
    key: "choose",
    icon: ListChecks,
    title: "Choose your industry",
    sub: "Twelve sectors, each with its own questions — a clinic and a CA firm are not asked the same things.",
  },
  {
    n: 2,
    key: "answer",
    icon: MessageSquareText,
    title: "Answer practical workflow questions",
    sub: "How you already work: where data sits, who can reach it, what happens when someone asks for theirs.",
  },
  {
    n: 3,
    key: "score",
    icon: FileText,
    title: "Get your score, top gaps and first fixes",
    sub: "A readiness score out of 100, your three biggest gaps, and what to do about them first.",
  },
] as const;

// The rest of the platform — a menu after the score, not a queue before it.
const afterSteps = [
  {
    icon: Search,
    title: "Map where your data sits",
    sub: "Data Discovery",
    href: "/discovery",
    key: "discover",
  },
  {
    icon: Workflow,
    title: "See where it travels",
    sub: "Data Flow maps",
    href: "/data-mapping",
    key: "map",
  },
  {
    icon: FilePlus2,
    title: "Generate your notices",
    sub: "Notice Pack",
    href: "/tools/dpdpa-privacy-notice-generator",
    key: "fix",
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

  const reveal = () =>
    `transition-all duration-500 ease-out motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!transition-none ${
      inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  return (
    <Section surface="white" type="utility" width="narrow">
      <div ref={ref}>
        <div className="text-center mb-10">
          <Eyebrow className="mb-3">How it works</Eyebrow>
          <h2 className="type-display-3 text-navy-700 mb-4">
            Three steps. No account, no upload.
          </h2>
          <p className="type-intro text-slate-600 max-w-md mx-auto">
            You can finish this before your next call ends.
          </p>
        </div>

        {/* the three steps */}
        <ol className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.n}
                style={{ transitionDelay: `${i * 140}ms` }}
                className={cn(
                  "flex items-start gap-4 px-5 py-4",
                  surfaceClasses("card"),
                  reveal(),
                )}
              >
                <span className="shrink-0 w-11 h-11 rounded-lg grid place-items-center bg-teal-50">
                  <Icon size={20} className="text-teal-800" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-600 tabular-nums">
                      {step.n}
                    </span>
                    <span className="text-navy-700 font-semibold text-[15px]">
                      {step.title}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mt-1 leading-snug">{step.sub}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 text-center">
          <Link
            href="/assessment"
            onClick={() => trackEvent.hiwStepClick({ step: "assess" })}
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-green-700 underline underline-offset-4 decoration-green-700/30 hover:decoration-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
          >
            Start the free assessment
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── After the score: the rest of the platform, as a menu ── */}
        <div className="mt-14 pt-8 border-t border-cloud-200">
          <p className="text-center text-sm font-semibold text-navy-700 mb-1">
            Continue after your assessment
          </p>
          <p className="text-center text-xs text-slate-600 mb-6">
            Optional, free, and in any order you like.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {afterSteps.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={() => trackEvent.hiwStepClick({ step: a.key })}
                  className={cn(
                    "group flex items-center gap-2.5 px-3.5 py-3",
                    surfaceClasses("card", { interactive: true }),
                    "hover:border-teal-400 transition-colors",
                  )}
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg grid place-items-center bg-cloud-50">
                    <Icon size={17} className="text-slate-600" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-navy-700 font-medium text-sm leading-snug">
                      {a.title}
                    </span>
                    <span className="block text-slate-600 text-xs mt-0.5">{a.sub}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="ml-auto shrink-0 text-slate-400 group-hover:text-teal-900 transition-colors"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

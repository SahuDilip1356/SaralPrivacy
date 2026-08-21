"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calculator,
  GraduationCap,
  ShoppingBag,
  Stethoscope,
  School,
  Scale,
  Building2,
  Hotel,
  Pill,
  Landmark,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { VERDICT_PREVIEWS } from "@/lib/data/verdict-previews";
import { DATA_MAPS } from "@/lib/data/data-flow";
import { trackEvent } from "@/lib/analytics";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";
import { FlowMapCardLink } from "./FlowMapCardLink";

// S7 — "Your sector". Three interactive examples, then a link row for the rest.
//
// This was a wall of twelve detailed cards running past 2,100px — twelve accent
// palettes, twelve risk badges, and thirty-odd links, all at equal weight, in
// the middle of a page that is trying to get one thing started. The twelve-card
// treatment now lives on /industries, where a visitor arrives already wanting to
// browse.
//
// What survives the collapse deliberately: EVERY sector still links from this
// page. The wall was carrying the homepage's internal linking into
// /industries/* (see INTERNAL_LINKING_SPEC.md), and three tabs alone would have
// dropped nine of those links to nothing. The name row below costs ~80px and
// keeps all twelve.

type Audience = {
  icon: typeof Users;
  title: string;
  /** short label for the tab */
  tab: string;
  href: string;
  assessmentHref: string;
  /** assessment slug — joins this to VERDICT_PREVIEWS for the sample score */
  slug: string;
  risk: string;
  painPoints: string[];
  /** one recognisable workflow, in the operator's own terms */
  workflow: string;
};

const audiences: Audience[] = [
  {
    icon: Users,
    title: "Recruitment agencies",
    tab: "Recruitment",
    href: "/industries/recruitment-agencies",
    assessmentHref: "/assessment/recruitment",
    slug: "recruitment",
    risk: "Candidate ID & CV risk",
    painPoints: [
      "CV databases & candidate data",
      "Client profile sharing",
      "Background check documents",
      "Cross-border data flows",
    ],
    workflow: "CVs forwarded to clients over email and WhatsApp.",
  },
  {
    icon: Calculator,
    title: "CA firms",
    tab: "CA firms",
    href: "/industries/ca-firms",
    assessmentHref: "/assessment/ca-firms",
    slug: "ca-firms",
    risk: "PAN / Aadhaar / ITR risk",
    painPoints: [
      "PAN / Aadhaar / bank data",
      "Client payroll records",
      "Cloud drives & shared folders",
      "Sensitive financial documents",
    ],
    workflow: "Client PAN and Aadhaar files shared through email and Drive.",
  },
  {
    icon: ShoppingBag,
    title: "D2C brands",
    tab: "D2C brands",
    href: "/industries/d2c-brands",
    assessmentHref: "/assessment/d2c-brands",
    slug: "d2c-brands",
    risk: "Marketing & pixel-data risk",
    painPoints: [
      "Email / SMS / WhatsApp marketing",
      "Third-party analytics & pixels",
      "Customer loyalty data",
      "Retention of inactive customers",
    ],
    workflow: "Marketing opt-in bundled into the checkout flow.",
  },
];

/** The other nine, as a link row. Order matches /industries. */
const moreSectors = [
  { icon: GraduationCap, title: "Training institutes", href: "/industries/training-institutes" },
  { icon: Stethoscope, title: "Clinics & diagnostic labs", href: "/industries/clinics-diagnostic-labs" },
  { icon: School, title: "Schools & colleges", href: "/industries/schools-colleges" },
  { icon: Scale, title: "Law firms", href: "/industries/law-firms" },
  { icon: Building2, title: "Real estate & property", href: "/industries/real-estate" },
  { icon: Hotel, title: "Hotels, hospitality & travel", href: "/industries/hotels-travel" },
  { icon: Pill, title: "Pharmacies", href: "/industries/pharmacies" },
  { icon: Landmark, title: "Fintech, NBFC & payments", href: "/industries/fintech-nbfc" },
  { icon: Sparkles, title: "Gyms, salons & spas", href: "/industries/gyms-salons-spas" },
];

// Registry-driven flow-map links: a sector gets one only when its map is live,
// so a new map appears here with zero edits and a planned sector renders
// nothing. Keyed by the INDUSTRIES slug, which is not the assessment slug.
const FLOW_HREFS = new Map(
  DATA_MAPS.filter((m) => m.live).map((m) => [m.sector.slug, m.href]),
);

export function AudienceCards() {
  const [active, setActive] = useState(audiences[0].slug);
  const a = audiences.find((x) => x.slug === active) ?? audiences[0];
  const preview = VERDICT_PREVIEWS.find((p) => p.slug === a.slug);
  const industrySlug = a.href.replace("/industries/", "");
  const flowHref = FLOW_HREFS.get(industrySlug);
  const Icon = a.icon;

  return (
    <Section id="sectors" surface="white" type="evidence" divider className="scroll-mt-20">
      <div className="text-center mb-10">
        <Eyebrow className="mb-3">Your sector</Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-3">
          Same law. Different data. Different fixes.
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A clinic, a CA firm and a D2C brand all hold personal data — but the
          risks, obligations and fixes are completely different.
        </p>
      </div>

      {/* tabs */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-6"
        role="tablist"
        aria-label="Pick a sector"
      >
        {audiences.map((x) => {
          const on = x.slug === active;
          return (
            <button
              key={x.slug}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                if (x.slug !== active) trackEvent.beat5TabSelect({ sector: x.slug });
                setActive(x.slug);
              }}
              className={`inline-flex items-center justify-center min-h-11 text-sm rounded-full border px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                on
                  ? "bg-teal-800 border-teal-800 text-white font-semibold"
                  : "bg-cloud-25 border-cloud-200 text-slate-600 hover:border-teal-400 hover:text-teal-900"
              }`}
            >
              {x.tab}
            </button>
          );
        })}
      </div>

      {/* the selected sector */}
      <Surface rung="card" aria-live="polite" className="p-6 sm:p-7 max-w-4xl mx-auto">
        <div key={a.slug} className="animate-fade-up motion-reduce:animate-none">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-lg bg-teal-50 grid place-items-center shrink-0">
              <Icon size={20} className="text-teal-800" />
            </span>
            <h3 className="font-semibold text-navy-700 text-lg">{a.title}</h3>
            <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-navy-700 bg-gold-400/20 border border-gold-400/40 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              {a.risk}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-2.5">
                Personal data you hold
              </div>
              <ul className="space-y-1.5">
                {a.painPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-teal-700 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  A workflow you&apos;ll recognise
                </div>
                <p className="text-sm text-slate-600 leading-snug">{a.workflow}</p>
              </div>

              {preview && (
                <div>
                  <div className="text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                    Highest-priority gap
                  </div>
                  <p className="flex gap-2 text-sm text-slate-600 leading-snug">
                    <AlertTriangle size={15} className="text-gold-500 shrink-0 mt-0.5" />
                    {preview.topGaps[0]}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-cloud-200 mt-6 pt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            {preview && (
              <p className="text-xs text-slate-600">
                Typical sample score{" "}
                <span className="font-semibold text-navy-700 tabular-nums">
                  {preview.score}/100
                </span>{" "}
                · illustrative, not your result
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {flowHref && (
                <FlowMapCardLink
                  href={flowHref}
                  sector={industrySlug}
                  className="text-slate-600 hover:text-navy-700"
                />
              )}
              <Link
                href={a.href}
                className="inline-flex items-center py-3 -my-3 text-sm font-medium text-slate-600 hover:text-navy-700 transition-colors"
              >
                Industry guide
              </Link>
              <Link
                href={a.assessmentHref}
                onClick={() => trackEvent.landingCtaClick({ cta: "sector", sector: a.slug })}
                className="inline-flex items-center gap-1.5 py-3 -my-3 text-sm font-semibold text-teal-800 hover:text-teal-900 transition-colors"
              >
                Take the assessment
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </Surface>

      {/* the other nine — every sector still links from this page */}
      <div className="max-w-4xl mx-auto mt-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Also covered
        </p>
        <ul className="flex flex-wrap justify-center gap-x-1 gap-y-1">
          {moreSectors.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-slate-600 hover:text-navy-700 hover:bg-cloud-50 transition-colors"
              >
                <s.icon size={14} className="text-slate-400 shrink-0" />
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-center mt-4">
          <Link
            href="/industries"
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-medium text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800 transition-colors"
          >
            Explore all 12 industries
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </Section>
  );
}

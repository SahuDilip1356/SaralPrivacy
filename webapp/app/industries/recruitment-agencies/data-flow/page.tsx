// Recruitment Personal Data Flow Map — full experience.
// Indexable content page (unlike the noindex assessment wizard): the
// reference model itself is the crawlable content. Spec:
// docs/SaralPrivacy_Recruitment_DataFlow_Spec.md + v1.1 addendum.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Copy, Search, Share2, ShieldCheck } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";
import { recruitmentDataFlowPack as pack } from "@/lib/data/data-flow/recruitment";
import { computePackSummary } from "@/lib/data-flow/schemas";
import { SignatureArc } from "@/components/data-flow/SignatureArc";
import DataFlowClient from "./DataFlowClient";

const PAGE_URL = "https://saralprivacy.com/industries/recruitment-agencies/data-flow";

export const metadata: Metadata = {
  title: "Recruitment Personal Data Flow Map — Where Candidate Data Travels",
  description:
    "Interactive map of how candidate data moves through a recruitment business — job portals, ATS, WhatsApp, Excel, clients, BGV vendors, AI tools and backups — and where DPDPA risk appears.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "One candidate. Many systems. Many copies. — Recruitment Personal Data Flow Map",
    description:
      "See how candidate data travels through a typical recruitment business, where copies multiply, and where control breaks.",
    url: PAGE_URL,
  },
};

export default function RecruitmentDataFlowPage() {
  const summary = computePackSummary(pack);

  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Recruitment Agencies", url: "https://saralprivacy.com/industries/recruitment-agencies" },
        { name: "Data Flow Map", url: PAGE_URL },
      ])}

      <div className="min-h-screen bg-pearl-50">
        {/* Header band */}
        <div className="bg-navy-700 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} aria-hidden="true" /> Where your data travels · Recruitment
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              One candidate. Many systems. Many copies. One business responsibility.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200">
              Candidate information moves through job portals, email, WhatsApp, ATS platforms,
              spreadsheets, clients, vendors, AI tools and backups. Explore how personal data
              flows through a recruitment business — and where DPDPA risk appears.
            </p>
            <div className="mt-6 max-w-3xl">
              <SignatureArc summary={summary} />
            </div>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-slate-400">{pack.disclaimer}</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <DataFlowClient pack={pack} />

          {/* How to read this map */}
          <section aria-labelledby="how-to-read" className="mt-12">
            <h2 id="how-to-read" className="text-xl font-bold text-navy-800">
              How to read this map
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <Search size={18} className="text-teal-600" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-bold text-navy-800">Trust boundaries</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  Systems inside your agency, your clients, your vendors and government portals
                  are marked differently. Amber badges mean data sits outside your direct
                  control.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <Copy size={18} className="text-teal-600" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-bold text-navy-800">Copies multiply</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  Every ⧉ marker is a moment where a new copy of candidate data comes into
                  existence — downloads, forwards, exports, backups. This model counts{" "}
                  {summary.copyEvents} of them.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <Share2 size={18} className="text-teal-600" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-bold text-navy-800">External transfers</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  Dashed lines show data leaving the agency — to clients, portals, vendors and
                  AI tools. {summary.externalTransfers} movements in this model cross that line.
                </p>
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section
            aria-label="Next steps"
            className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <h2 className="text-xl font-bold text-navy-800">
              Now check whether your controls hold up
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              The map shows where candidate data travels in a typical agency. The 3-minute
              readiness scan checks whether your agency has the controls that matter at each
              hotspot — and the Discovery tool builds your own data inventory.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`${pack.assessmentRoute}?from=data-flow`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                Take the recruitment risk scan <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/discovery"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
              >
                Map your own data with Discovery
              </Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Educational reference model — not legal advice, and not a scan of your actual
              systems.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

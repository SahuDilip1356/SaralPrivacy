// Personal Data Flow Map - ONE dynamic route for every industry.
//
// The presentation (header, journey, full-system map, hotspots, how-to-read,
// CTA) is identical for all twelve sectors; only the pack's content and its
// `presentation` strings differ. Adding a map is a pack file + one registry
// line - no route work, and no way for the twelve pages to drift apart.
//
// Replaces the per-industry cloned route that used to live at
// app/industries/recruitment-agencies/data-flow/.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight, MapPin, Share2, ShieldCheck } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";
import { LIVE_DATA_MAPS, dataMapSlugs } from "@/lib/data/data-flow";
import type { DataFlowPack } from "@/lib/data-flow/schemas";
import DataFlowClient from "./DataFlowClient";

const SITE = "https://saralprivacy.com";

/** The three how-to-read cards share fixed icons; only text comes from the pack. */
const HOW_TO_READ_ICONS = [MapPin, Share2, AlertTriangle] as const;

interface Params {
  params: Promise<{ sector: string }>;
}

function entryFor(sector: string) {
  return LIVE_DATA_MAPS.find((m) => m.sector.slug === sector);
}

/** Pre-render every live map at build time; unknown sectors 404. */
export function generateStaticParams() {
  return dataMapSlugs.map((sector) => ({ sector }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { sector } = await params;
  const entry = entryFor(sector);
  if (!entry?.pack) return {};
  const p = entry.pack.presentation;
  const url = `${SITE}/industries/${sector}/data-flow`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: p.ogTitle, description: p.ogDescription, url },
  };
}

export default async function DataFlowPage({ params }: Params) {
  const { sector } = await params;
  const entry = entryFor(sector);
  if (!entry?.pack) notFound();
  const pack: DataFlowPack = entry.pack;
  const p = pack.presentation;
  const url = `${SITE}/industries/${sector}/data-flow`;

  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: SITE },
        { name: "Industries", url: `${SITE}/industries` },
        { name: p.breadcrumbLabel, url: `${SITE}/industries/${sector}` },
        { name: "Data Flow Map", url },
      ])}

      <div className="min-h-screen bg-pearl-50">
        {/* Header band */}
        <div className="bg-navy-700 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} aria-hidden="true" /> Where your data travels · {p.eyebrow}
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {p.h1}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200">{p.intro}</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <DataFlowClient pack={pack} />

          {/* How to read this journey */}
          <section aria-labelledby="how-to-read" className="mt-12">
            <h2 id="how-to-read" className="text-xl font-semibold text-navy-800">
              How to read this journey
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {p.howToRead.map((card, i) => {
                const Icon = HOW_TO_READ_ICONS[i];
                const tone = i === 2 ? "text-red-600" : "text-teal-600";
                return (
                  <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5">
                    <Icon size={18} className={tone} aria-hidden="true" />
                    <h3 className="mt-2 text-sm font-semibold text-navy-800">{card.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{card.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA band */}
          <section
            aria-label="Next steps"
            className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-navy-800">{p.ctaHeading}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{p.ctaBody}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`${pack.assessmentRoute}?from=data-flow`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
              >
                {p.ctaButton} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/discovery"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
              >
                Map your own data with Discovery
              </Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-600">
              Educational reference model - not legal advice, and not a scan of your actual systems.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

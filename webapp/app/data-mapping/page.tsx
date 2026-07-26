import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertTriangle, MapPin, Share2, Workflow } from "lucide-react";
import { DiscoveryCrossLink } from "@/components/DiscoveryCrossLink";
import { NoticeCrossLink } from "@/components/NoticeCrossLink";
import { LIVE_DATA_MAPS, PLANNED_DATA_MAPS } from "@/lib/data/data-flow";
import { EXTERNAL_BOUNDARIES, filterByBusinessModel } from "@/lib/data-flow/schemas";

const PAGE_URL = "https://saralprivacy.com/data-mapping";

export const metadata: Metadata = {
  title: "Personal Data Flow Mapping by Industry",
  description:
    "See where personal data actually travels inside your business - every system, inbox, spreadsheet, vendor and backup it reaches, and the points where you lose control of it. Free interactive data flow maps by industry.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Personal Data Flow Mapping by Industry - SaralPrivacy",
    description:
      "Discovery tells you what personal data you hold. Data mapping shows where it goes, who touches it, and where control breaks.",
    url: PAGE_URL,
  },
};

// The three questions the product answers in order. Data mapping is step 2 -
// the piece between knowing what you hold and knowing how ready you are.
const JOURNEY = [
  { n: 1, title: "Discover", body: "What personal data does your business hold?", href: "/discovery", cta: "Data Discovery" },
  { n: 2, title: "Map", body: "Where does it travel, and where do you lose control of it?", href: null, cta: null },
  { n: 3, title: "Assess", body: "How ready are your controls, scored against your sector?", href: "/assessment", cta: "Industry Assessment" },
  { n: 4, title: "Publish", body: "Turn it into a privacy notice you can actually put on your site.", href: "/tools/dpdpa-privacy-notice-generator", cta: "Notice Generator" },
];

export default function DataMappingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <MapPin size={18} aria-hidden="true" /> Where your data travels
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Personal Data Flow Mapping
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Knowing what personal data you collect is the easy part. The hard part is knowing
              where it goes afterwards - and whether you could find every copy if someone asked
              you to delete it.
            </p>
          </div>
          <div className="mt-4 max-w-2xl bg-white/10 border border-white/20 rounded-xl px-5 py-4">
            <p className="text-slate-200 text-sm leading-relaxed">
              Most businesses can name their systems. Almost none can trace one person&apos;s
              record through all of them - the inbox it was forwarded to, the spreadsheet it was
              exported into, the laptop it was downloaded onto, the vendor it was shared with,
              the backup that still holds it.
            </p>
            <p className="text-green-300 text-xs mt-2 font-medium">
              Same law. Different data flows. Different fixes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Where this sits in the journey */}
        <section aria-labelledby="journey-heading" className="mb-12">
          <h2 id="journey-heading" className="text-2xl font-bold text-navy-700">
            Where data mapping fits
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Four steps, in order. Each one answers a question the next one depends on.
          </p>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((step) => {
              const isCurrent = step.href === null;
              return (
                <li
                  key={step.n}
                  className={
                    isCurrent
                      ? "rounded-xl border-2 border-teal-400 bg-teal-50 p-5"
                      : "rounded-xl border border-slate-200 bg-white p-5"
                  }
                >
                  <div
                    className={
                      isCurrent
                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 font-bold text-white"
                        : "flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600"
                    }
                  >
                    {step.n}
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold text-navy-700">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{step.body}</p>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-700 hover:text-green-800"
                    >
                      {step.cta} <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="mt-3 inline-block text-[13px] font-semibold text-teal-700">
                      You are here
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <DiscoveryCrossLink className="mb-10" />

        {/* Live maps */}
        <section aria-labelledby="live-maps-heading">
          <h2 id="live-maps-heading" className="text-2xl font-bold text-navy-700">
            Available maps
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Each map is a reference model of a typical business in that sector - not a scan of
            your systems. Free, no email required.
          </p>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {LIVE_DATA_MAPS.map(({ sector, pack, href }) => {
              // Scoped to the model the map opens on, so the numbers advertised
              // here are the numbers on screen when the visitor arrives. That is
              // the pack's FIRST declared model - hard-coding recruitment's
              // "permanent" silently dropped every model-gated system from every
              // other sector's card.
              const models = pack!.businessModels;
              const { stages, nodes, edges } = filterByBusinessModel(pack!, models[0].id);
              const places = nodes.filter((n) => n.nodeType !== "person").length;
              const external = nodes.filter((n) => EXTERNAL_BOUNDARIES.includes(n.boundary)).length;
              const transfers = edges.filter((e) => e.external).length;
              const stats = [
                { icon: MapPin, value: places, label: "places their data lives" },
                { icon: Workflow, value: stages.length, label: "stages in the journey" },
                { icon: Share2, value: transfers, label: "external transfers" },
                { icon: AlertTriangle, value: pack!.hotspots.length, label: "control breaks" },
              ];
              return (
                <div
                  key={sector.slug}
                  className="overflow-hidden rounded-2xl border border-navy-200 bg-navy-700 p-6 text-white"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-teal-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-300">
                      Live
                    </span>
                    {/* Sectors whose journeys genuinely differ say so, so the
                        headline numbers are read as "the default model", not
                        "the only shape this sector comes in". */}
                    {models.length > 1 && (
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                        {models.length} operating models
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{sector.navLabel}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    Follow one person&apos;s record through {stages.length} stages and{" "}
                    {external} outside parties - and see the {pack!.hotspots.length} points where
                    control breaks.
                    {models.length > 1 && ` Shown for ${models[0].label.toLowerCase()}.`}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="flex items-center gap-2.5">
                          <span className="rounded-lg bg-white/10 p-2 text-teal-300" aria-hidden="true">
                            <Icon size={16} />
                          </span>
                          <span>
                            <span className="block text-lg font-bold leading-none">{stat.value}</span>
                            <span className="mt-0.5 block text-[11px] leading-tight text-slate-300">
                              {stat.label}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <Link
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-teal-400"
                  >
                    Explore the {sector.navLabel} map <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roadmap - named honestly so a visitor knows what does not exist yet */}
        {PLANNED_DATA_MAPS.length > 0 && (
          <section aria-labelledby="planned-maps-heading" className="mt-12">
            <h2 id="planned-maps-heading" className="text-2xl font-bold text-navy-700">
              Coming next
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              These sectors have a free readiness assessment today, and a data flow map on the
              way. Every sector below links to its assessment in the meantime.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PLANNED_DATA_MAPS.map(({ sector }) => (
                <li key={sector.slug}>
                  <Link
                    href={`/assessment/${sector.assessmentSlug}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-navy-700">
                        {sector.navLabel}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-slate-500">
                        Assessment available now
                      </span>
                    </span>
                    <ArrowRight size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <NoticeCrossLink className="mt-12" />

        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p>
            <strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with
            phased commencement.
          </p>
          <p>
            Each map is a reference model of a typical business in that sector, not a scan of your
            systems. This page is for educational purposes and does not constitute legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { featuredPlacements, mediaStats, tierLabels } from "@/lib/mediaData";
import { FRESHNESS, formatReviewDate } from "@/lib/content-freshness";

export const metadata: Metadata = {
  title: "SaralPrivacy in the Media",
  description:
    "SaralPrivacy's free DPDPA readiness assessment has been featured across India's national and regional press — including Business Standard, The Tribune, and ANI — via syndicated press-release distribution.",
  alternates: { canonical: "https://saralprivacy.com/media" },
  openGraph: {
    title: "SaralPrivacy in the Media",
    description:
      "Featured across India's press — Business Standard, The Tribune, ANI and 160+ more.",
    url: "https://saralprivacy.com/media",
    type: "website",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "SaralPrivacy in the Media",
  url: "https://saralprivacy.com/media",
  description:
    "Press coverage of SaralPrivacy's free DPDPA readiness assessment, distributed via syndicated press release across Indian national and regional publications.",
  publisher: {
    "@type": "Organization",
    name: "SaralPrivacy",
    url: "https://saralprivacy.com",
  },
};

export default function MediaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 py-12 sm:py-16 px-4 sm:px-6">
        <section
          aria-label="Media coverage"
          className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-7 sm:p-10"
        >
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            As seen in
          </span>

          {/* Head */}
          <div className="flex flex-wrap items-end justify-between gap-5 mt-5 pb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 leading-tight">
              SaralPrivacy&apos;s DPDPA readiness work,
              <br />
              <span className="text-green-500">seen across India&apos;s press</span>
            </h1>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-navy-700 leading-none">
                  {mediaStats.totalPlacements}
                </div>
                <div className="text-xs text-slate-500 mt-1.5">Publications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-navy-700 leading-none">
                  {mediaStats.potentialReach}
                </div>
                <div className="text-xs text-slate-500 mt-1.5">Potential reach</div>
              </div>
            </div>
          </div>

          {/* Top 10 tiles */}
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7">
            {featuredPlacements.map((p) => {
              const Tile = (
                <>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                    <ShieldCheck size={11} /> Verified live
                  </span>
                  <span className="text-[15px] font-bold text-navy-700">{p.name}</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {p.meta ?? tierLabels[p.tier]}
                  </span>
                  {p.da != null && (
                    <span className="inline-block text-[10px] font-semibold text-teal-600 border border-teal-200 rounded-full px-2 py-0.5 mt-0.5">
                      DA {p.da}
                    </span>
                  )}
                  {p.reach != null && (
                    <span className="text-[10px] text-navy-700 font-medium">
                      {p.reach} readers
                    </span>
                  )}
                </>
              );
              const base =
                "flex flex-col items-center justify-center text-center gap-1.5 p-5 rounded-2xl border border-slate-200 bg-white transition-all hover:border-teal-400 hover:shadow-md";
              return (
                <li key={p.serial}>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="nofollow noopener"
                      className={`${base} h-full`}
                    >
                      {Tile}
                    </a>
                  ) : (
                    <div className={`${base} h-full`}>{Tile}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* See all */}
          <div className="mt-5 text-center">
            <Link
              href="/media/coverage"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              See all {mediaStats.totalPlacements} placements
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Foot */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <p className="text-sm text-slate-600 max-w-md">
              Coverage of our free DPDPA readiness assessment — built to help Indian businesses map
              their privacy gaps in 3–5 minutes.
            </p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-green-600 transition-colors whitespace-nowrap"
            >
              Take the free assessment <ArrowRight size={16} />
            </Link>
          </div>

          {/* Reviewed */}
          <p className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400">
            Last reviewed: {formatReviewDate(FRESHNESS.media)} · For informational purposes; not legal advice.
          </p>
        </section>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MediaCoverageList } from "@/components/media/MediaCoverageList";
import { mediaStats } from "@/lib/mediaData";
import { FRESHNESS, formatReviewDate } from "@/lib/content-freshness";

export const metadata: Metadata = {
  title: "Full Media Coverage — SaralPrivacy PR Placements",
  description:
    "The complete list of publications that carried SaralPrivacy's DPDPA readiness press release, distributed via the ANI / VMPL wire network. Search and filter all placements.",
  alternates: { canonical: "https://saralprivacy.com/media/coverage" },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Full Media Coverage — SaralPrivacy PR Placements",
  url: "https://saralprivacy.com/media/coverage",
  description:
    "Complete searchable list of publications that carried SaralPrivacy's DPDPA readiness press release via syndicated distribution.",
  publisher: {
    "@type": "Organization",
    name: "SaralPrivacy",
    url: "https://saralprivacy.com",
  },
};

export default function MediaCoveragePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/media"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-700 mb-5"
          >
            <ArrowLeft size={15} /> Back to Media
          </Link>

          {/* Header card */}
          <div className="bg-navy-700 rounded-2xl px-6 sm:px-8 py-7 flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                SaralPrivacy — PR Publication Links
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                DPDPA compliance press release · Distributed {mediaStats.distributedOn}
              </p>
            </div>
            <div className="flex gap-7">
              <div>
                <div className="text-2xl font-bold text-green-400 leading-none">
                  {mediaStats.totalPlacements}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wide">
                  Publishers
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 leading-none">
                  {mediaStats.potentialReach}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wide">Reach</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 leading-none">
                  {mediaStats.liveLinks}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wide">
                  Live links
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="mt-7">
            <MediaCoverageList />
          </div>


          <p className="mt-6 text-xs text-slate-400">
            Last reviewed: {formatReviewDate(FRESHNESS.media)} · For informational purposes; not legal advice.
          </p>
        </div>
      </div>
    </>
  );
}

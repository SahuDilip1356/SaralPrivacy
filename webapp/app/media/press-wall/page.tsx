import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { mediaPlacements, tierLabels, type MediaTier } from "@/lib/mediaData";
import { FRESHNESS, formatReviewDate } from "@/lib/content-freshness";

export const metadata: Metadata = {
  title: "Press Wall — SaralPrivacy Media Coverage",
  description:
    "Verified press coverage of SaralPrivacy's DPDPA readiness assessment across India's top national and regional publications — Business Standard, The Tribune, ANI News, and more.",
  alternates: { canonical: "https://saralprivacy.com/media/press-wall" },
  openGraph: {
    title: "Press Wall — SaralPrivacy Media Coverage",
    description:
      "Verified in Business Standard (DA 90), The Tribune (DA 87), ANI News (DA 79), and 168 more publications.",
    url: "https://saralprivacy.com/media/press-wall",
    type: "website",
  },
};

const HEADLINE =
  "DPDPA Compliance Pressure Builds, SaralPrivacy Launches Free Readiness Assessment to Help Indian Businesses Map Privacy Gaps";

const EXCERPT =
  "As Indian businesses prepare for a new phase of data protection compliance under the Digital Personal Data Protection Act, 2023, SaralPrivacy has launched a free DPDPA readiness assessment to help organisations evaluate their current privacy preparedness.";

const PUBLISHED = "2 June 2026";

const HERO_SERIALS = [3, 4];
const SECONDARY_SERIALS = [5, 7, 6, 8, 10, 11];

const categoryPill: Record<MediaTier, string> = {
  tier1: "bg-green-500/20 text-green-400 border border-green-500/30",
  tier2: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
  tier3: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  tier4: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  aggregator: "bg-navy-500/20 text-navy-300 border border-navy-500/30",
};

function PressCard({
  serial,
  size,
}: {
  serial: number;
  size: "hero" | "secondary";
}) {
  const pub = mediaPlacements.find((p) => p.serial === serial)!;
  const isHero = size === "hero";

  return (
    <article className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-card hover:shadow-card-hover transition-shadow">
      {/* Branded header strip */}
      <div
        className={`relative flex flex-col justify-between bg-gradient-to-br from-navy-700 to-navy-800 px-5 py-4 ${
          isHero ? "min-h-[100px]" : "min-h-[80px]"
        }`}
      >
        {/* Top row: category + DA */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryPill[pub.tier]}`}
          >
            {tierLabels[pub.tier]}
          </span>
          {pub.da != null && (
            <span className="text-[10px] font-medium text-teal-300 border border-teal-500/30 rounded-full px-2 py-0.5">
              DA {pub.da}
            </span>
          )}
        </div>
        {/* Bottom row: verified badge */}
        <div className="flex items-center gap-1 mt-3">
          <ShieldCheck size={11} className="text-green-400" />
          <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wide">
            Verified live
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Publication name */}
        <h2
          className={`font-bold text-navy-700 leading-tight ${
            isHero ? "text-lg" : "text-base"
          }`}
        >
          {pub.name}
        </h2>

        {/* Headline */}
        <p
          className={`text-slate-600 leading-snug ${
            isHero ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
          }`}
        >
          &ldquo;{HEADLINE}&rdquo;
        </p>

        {isHero && (
          <p className="text-xs text-slate-500 line-clamp-2">{EXCERPT}</p>
        )}

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-slate-400">{PUBLISHED}</span>
            {pub.reach != null && (
              <span className="text-[11px] font-medium text-navy-700">
                {pub.reach} readers
              </span>
            )}
          </div>
          {pub.url ? (
            <a
              href={pub.url}
              target="_blank"
              rel="nofollow noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-colors whitespace-nowrap"
            >
              Read article <ExternalLink size={10} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function PressWallPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back nav */}
        <Link
          href="/media"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-700 mb-6"
        >
          <ArrowLeft size={15} /> Back to Media
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Press Coverage · June 2026
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-navy-700 leading-tight">
            SaralPrivacy in the Press
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Our DPDPA readiness assessment has been covered across India&apos;s top national and regional publications via the ANI&nbsp;/&nbsp;VMPL wire network.
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-5">
            <div>
              <div className="text-2xl font-bold text-navy-700 leading-none">5</div>
              <div className="text-xs text-slate-500 mt-1">Featured publications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-700 leading-none">171</div>
              <div className="text-xs text-slate-500 mt-1">Total placements</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-700 leading-none">53M+</div>
              <div className="text-xs text-slate-500 mt-1">Combined reach</div>
            </div>
          </div>
        </div>

        {/* Hero cards — 2 column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {HERO_SERIALS.map((serial) => (
            <PressCard key={serial} serial={serial} size="hero" />
          ))}
        </div>

        {/* Secondary cards — 3 column */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SECONDARY_SERIALS.map((serial) => (
            <PressCard key={serial} serial={serial} size="secondary" />
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-10 bg-navy-700 rounded-2xl px-7 py-7 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-white font-bold text-lg leading-snug">
              Map your DPDPA gaps in 3–5 minutes
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Free assessment. No sign-up required.
            </p>
          </div>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors whitespace-nowrap"
          >
            Take the free assessment <ArrowRight size={16} />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Last reviewed: {formatReviewDate(FRESHNESS.media)} · Syndicated press-release placements via ANI&nbsp;/&nbsp;VMPL wire network.
          </p>
          <Link
            href="/media/coverage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            See all 171 placements <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

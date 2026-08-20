import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { mediaPlacements, tierLabels, type MediaTier } from "@/lib/mediaData";

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

const HERO_SERIALS = [3, 4];
const SECONDARY_SERIALS = [5, 7, 6, 8, 10, 11];

const SCREENSHOTS: Record<number, string> = {
  3:  "/press/business-standard.png",
  4:  "/press/the-tribune.png",
  5:  "/press/ani-news.png",
  6:  "/press/lokmat-english.jpg",
  7:  "/press/latestly.jpg",
  8:  "/press/world-news-network.jpg",
  10: "/press/karnataka-news-network.jpg",
  11: "/press/indian-economic-observer.jpg",
};

const categoryPill: Record<MediaTier, string> = {
  tier1:      "bg-green-100 text-green-800",
  tier2:      "bg-teal-100 text-teal-900",
  tier3:      "bg-slate-100 text-slate-600",
  tier4:      "bg-slate-100 text-slate-600",
  aggregator: "bg-navy-100 text-navy-700",
};

function PressCard({ serial, size }: { serial: number; size: "hero" | "secondary" }) {
  const pub = mediaPlacements.find((p) => p.serial === serial)!;
  const isHero = size === "hero";
  const imgSrc = SCREENSHOTS[serial];

  return (
    <article className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-card hover:shadow-card-hover transition-shadow group">
      {/* Screenshot clipping */}
      <a
        href={pub.url ?? undefined}
        target="_blank"
        rel="nofollow noopener"
        className={`relative block overflow-hidden bg-slate-100 ${isHero ? "h-52" : "h-40"}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={`${pub.name} — press coverage screenshot`}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
        {/* Verified badge overlay */}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full shadow-sm">
          <ShieldCheck size={9} /> Verified live
        </span>
      </a>

      {/* Info strip */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
        <div className="min-w-0">
          <p className={`font-bold text-navy-700 truncate ${isHero ? "text-sm" : "text-xs"}`}>
            {pub.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${categoryPill[pub.tier]}`}>
              {tierLabels[pub.tier]}
            </span>
            {pub.da != null && (
              <span className="text-[10px] font-medium text-teal-800">
                DA {pub.da}
              </span>
            )}
            {pub.reach != null && (
              <span className="text-[10px] text-slate-600">· {pub.reach}</span>
            )}
          </div>
        </div>
        {pub.url && (
          <a
            href={pub.url}
            target="_blank"
            rel="nofollow noopener"
            className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 border border-teal-200 rounded-lg px-2.5 py-1.5 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-colors"
          >
            Open <ExternalLink size={10} />
          </a>
        )}
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
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-800 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Press Coverage · June 2026
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-navy-700 leading-tight">
            SaralPrivacy in the Press
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            DPDPA readiness assessment coverage across India&apos;s national and
            regional press.
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-5">
            <div>
              <div className="text-2xl font-bold text-navy-700 leading-none">8</div>
              <div className="text-xs text-slate-500 mt-1">Featured publications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-700 leading-none">171</div>
              <div className="text-xs text-slate-500 mt-1">Total placements</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-700 leading-none">56M+</div>
              <div className="text-xs text-slate-500 mt-1">Combined reach</div>
            </div>
          </div>
        </div>

        {/* Hero row — 2 column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {HERO_SERIALS.map((serial) => (
            <PressCard key={serial} serial={serial} size="hero" />
          ))}
        </div>

        {/* Secondary row — 3 column × 2 rows */}
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
        <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
          <Link
            href="/media/coverage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-900"
          >
            See all 171 placements <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

type Variant = "banner" | "compact" | "sidebar";

const PUBS = [
  {
    name: "ANI",
    url: "https://www.aninews.in/news/business/dpdpa-compliance-pressure-builds-saralprivacy-launches-free-readiness-assessment-to-help-indian-businesses-map-privacy-gaps20260602133551/",
  },
  {
    name: "Business Standard",
    url: "https://www.business-standard.com/content/press-releases-ani/dpdpa-compliance-pressure-builds-saralprivacy-launches-free-readiness-assessment-to-help-indian-businesses-map-privacy-gaps-126060200614_1.html",
  },
  {
    name: "The Tribune",
    url: "https://www.tribuneindia.com/news/dpdpa/dpdpa-compliance-pressure-builds-saralprivacy-launches-free-readiness-assessment-to-help-indian-businesses-map-privacy-gaps",
  },
  {
    name: "Lokmat Times",
    url: "https://www.lokmattimes.com/business/dpdpa-compliance-pressure-builds-saralprivacy-launches-free-readiness-assessment-to-help-indian-businesses-map-privacy-gaps/",
  },
  {
    name: "Latestly",
    url: "https://www.latestly.com/agency-news/business-news-dpdpa-compliance-pressure-builds-saralprivacy-launches-free-readiness-assessment-to-help-indian-businesses-map-privacy-gaps-7455911.html",
  },
];

export function PressProofStrip({ variant = "banner" }: { variant?: Variant }) {
  /* ── Compact — used inside the footer (dark navy bg) ── */
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] text-slate-500 font-medium">As seen in:</span>
        {PUBS.map((p, i) => (
          <span key={p.name} className="inline-flex items-center gap-2">
            <a
              href={p.url}
              target="_blank"
              rel="nofollow noopener"
              className="text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {p.name}
            </a>
            {i < PUBS.length - 1 && (
              <span className="text-navy-600" aria-hidden>·</span>
            )}
          </span>
        ))}
        <span className="text-navy-600" aria-hidden>·</span>
        <Link
          href="/media/press-wall"
          className="text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors"
        >
          Press wall →
        </Link>
      </div>
    );
  }

  /* ── Sidebar — compact card for blog sidebar (light bg) ── */
  if (variant === "sidebar") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          As seen in
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {PUBS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="nofollow noopener"
              className="inline-block text-[11px] font-medium text-navy-700 bg-cloud-50 border border-slate-200 rounded-md px-2 py-1 hover:border-teal-400 hover:text-teal-600 transition-colors"
            >
              {p.name}
            </a>
          ))}
        </div>
        <Link
          href="/media/press-wall"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          View press coverage <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  /* ── Banner (default) — full-width proof section ── */
  return (
    <section aria-label="Press coverage proof" className="bg-cloud-50 border-y border-slate-200 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          As seen in
        </p>

        {/* Publication chips — each linked to the article */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {PUBS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="nofollow noopener"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 bg-white border border-slate-200 rounded-full px-4 py-1.5 hover:border-teal-400 hover:text-teal-600 hover:shadow-sm transition-all"
            >
              {p.name}
              <ExternalLink size={10} className="text-slate-400" />
            </a>
          ))}
        </div>

        <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6">
          SaralPrivacy&apos;s DPDPA readiness assessment has been featured in ANI,
          Business Standard, The Tribune, Lokmat Times, and Latestly.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors"
          >
            Take the free DPDPA readiness assessment <ArrowRight size={14} />
          </Link>
          <Link
            href="/media/press-wall"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 border border-teal-200 px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors"
          >
            See press coverage
          </Link>
        </div>
      </div>
    </section>
  );
}

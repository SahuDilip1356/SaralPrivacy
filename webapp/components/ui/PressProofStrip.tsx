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
  /* ── Compact — used inside the footer (already on navy bg, stays minimal) ── */
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] text-slate-600 font-medium">As seen in:</span>
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

  /* ── Sidebar — navy card for blog sidebar + assessment right column ── */
  if (variant === "sidebar") {
    return (
      <div className="bg-navy-700 rounded-xl border border-navy-600 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-400 mb-3">
          As seen in
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {PUBS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="nofollow noopener"
              className="inline-block text-[11px] font-medium text-slate-300 bg-navy-800 border border-navy-600 rounded-md px-2 py-1 hover:border-teal-400 hover:text-teal-300 transition-colors"
            >
              {p.name}
            </a>
          ))}
        </div>
        <Link
          href="/media/press-wall"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          View press coverage <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  /* ── Banner (default) — proof row on the page canvas. It used to be a navy
     band, which made it a third dark stripe on a page budgeted for two. The
     logos carry the proof; the ground does not need to shout. ── */
  return (
    <section aria-label="Press coverage proof" className="bg-cloud-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-600 mb-5">
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
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-pearl-200 rounded-full px-4 py-1.5 hover:border-pearl-300 hover:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
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

        {/* Links, not buttons: the guide download below is this stretch of the
            page's one filled action. */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 underline underline-offset-4 decoration-green-700/30 hover:decoration-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
          >
            Take the free DPDPA readiness assessment <ArrowRight size={14} />
          </Link>
          <Link
            href="/media/press-wall"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline underline-offset-4 decoration-slate-400 hover:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
          >
            See press coverage
          </Link>
        </div>
      </div>
    </section>
  );
}

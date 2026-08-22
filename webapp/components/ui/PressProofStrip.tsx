import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

type Variant = "banner" | "compact" | "sidebar" | "rail";

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

/**
 * The three facts that reduce the anxiety of STARTING. Deliberately not our
 * publishing counts — "130+ briefings" and "17 templates" measure our activity,
 * not the visitor's risk in clicking, and they used to sit in this position.
 * They now live in the resources section, where they are the right claim.
 */
const START_FACTS = [
  "12 sector-specific assessments",
  "3–5 minutes",
  "No email to start",
  "Built for Indian workflows",
];

export function PressProofStrip({
  variant = "banner",
  onDark = false,
}: {
  variant?: Variant;
  /** rail only: dark register, for the navy-800 seam inside the dark chapter */
  onDark?: boolean;
}) {
  /* ── Rail — S2, the seam between the hero and the risk map. One tight band,
     no cards, no heading: its whole job is to answer "can I trust this enough
     to click" in the two seconds after the promise lands, so it must read as a
     seam in the dark chapter, never as a section of its own. ── */
  if (variant === "rail") {
    const sep = onDark ? "text-white/25" : "text-cloud-400";
    return (
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px]">
          <span className={onDark ? "text-slate-400" : "text-slate-600"}>Featured in:</span>
          {PUBS.map((p, i) => (
            <span key={p.name} className="inline-flex items-center gap-2">
              <a
                href={p.url}
                target="_blank"
                rel="nofollow noopener"
                className={`inline-flex items-center pointer-coarse:min-h-11 font-medium underline underline-offset-4 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  onDark
                    ? "text-slate-200 decoration-white/25 hover:decoration-white hover:text-white focus-visible:ring-green-400 focus-visible:ring-offset-navy-800"
                    : "text-navy-700 decoration-cloud-400 hover:decoration-navy-700 focus-visible:ring-green-800"
                }`}
              >
                {p.name}
              </a>
              {i < PUBS.length - 1 && (
                <span className={sep} aria-hidden>
                  ·
                </span>
              )}
            </span>
          ))}
        </p>
        <p
          className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] ${
            onDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {START_FACTS.map((f, i) => (
            <span key={f} className="inline-flex items-center gap-2">
              {f}
              {i < START_FACTS.length - 1 && (
                <span className={sep} aria-hidden>
                  ·
                </span>
              )}
            </span>
          ))}
        </p>
      </div>
    );
  }

  /* ── Compact — used inside the footer (already on navy bg, stays minimal) ── */
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] text-slate-400 font-medium">As seen in:</span>
        {PUBS.map((p, i) => (
          <span key={p.name} className="inline-flex items-center gap-2">
            <a
              href={p.url}
              target="_blank"
              rel="nofollow noopener"
              className="inline-flex items-center pointer-coarse:min-h-11 text-[11px] text-slate-400 hover:text-white transition-colors"
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
          className="inline-flex items-center pointer-coarse:min-h-11 text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors"
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
    <section aria-label="Press coverage proof" className="bg-cloud-50 py-10">
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
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-pearl-200 rounded-full px-4 py-1.5 pointer-coarse:min-h-11 hover:border-pearl-300 hover:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
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
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-medium text-green-700 underline underline-offset-4 decoration-green-700/30 hover:decoration-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
          >
            Take the free DPDPA readiness assessment <ArrowRight size={14} />
          </Link>
          <Link
            href="/media/press-wall"
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-medium text-slate-600 underline underline-offset-4 decoration-slate-400 hover:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
          >
            See press coverage
          </Link>
        </div>
      </div>
    </section>
  );
}

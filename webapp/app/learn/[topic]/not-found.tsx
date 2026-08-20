import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Server Component rendered when /learn/<unknown-slug> is requested.
// Returns HTTP 404 (Next.js's notFound() in page.tsx triggers this file).
// Replaces the previous fallback that rendered "Content Coming Soon" with a
// 200 OK status — bad for SEO because Google would index phantom URLs as
// thin-content pages.

export default function LearnTopicNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">
          404 · Topic Not Found
        </p>
        <h1 className="text-2xl font-semibold text-navy-700 mb-3">
          We couldn&apos;t find that DPDPA topic
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The URL may be outdated or the topic may have moved. Head back to the DPDPA Guide
          for the full list of topics — applicability, consent, rights, breach obligations,
          and more.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to DPDPA Guide
        </Link>
      </div>
    </div>
  );
}

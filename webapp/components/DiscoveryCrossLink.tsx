import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

/**
 * Cross-link banner that frames Personal Data Discovery as the step before the
 * full assessment. Used on the /assessment and /industries hubs.
 */
export function DiscoveryCrossLink({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-green-50 p-5 sm:p-6 ${className}`}
    >
      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-teal-200 grid place-items-center">
        <Compass size={22} className="text-teal-600" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wide text-teal-700 mb-1">
          Start here · Free · No email
        </div>
        <h3 className="text-navy-700 font-bold text-base sm:text-lg leading-snug">
          Not sure what personal data you hold?
        </h3>
        <p className="text-slate-600 text-sm mt-1">
          Map it in ~3 minutes across 276 business types, then come back for the full assessment.
        </p>
      </div>
      <Link
        href="/discovery"
        className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-colors text-sm whitespace-nowrap"
      >
        Personal Data Discovery
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

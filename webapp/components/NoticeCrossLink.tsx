import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

/**
 * Cross-link banner that frames the DPDPA Notice Generator as the step after the
 * assessment — once you know your gaps, publish a DPDPA-ready notice. Used on the
 * /assessment and /industries hubs.
 */
export function NoticeCrossLink({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-teal-50 p-5 sm:p-6 ${className}`}
    >
      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-green-200 grid place-items-center">
        <FileText size={22} className="text-green-800" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-1">
          Next step · Free · Preview without email
        </div>
        <h3 className="text-navy-700 font-semibold text-base sm:text-lg leading-snug">
          Need a DPDPA-ready privacy notice?
        </h3>
        <p className="text-slate-600 text-sm mt-1">
          Generate a tailored Notice Pack — full notice, mini-notices, consent text and a rights block — from a few plain questions.
        </p>
      </div>
      <Link
        href="/tools/dpdpa-privacy-notice-generator"
        className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-colors text-sm whitespace-nowrap"
      >
        Notice Generator
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

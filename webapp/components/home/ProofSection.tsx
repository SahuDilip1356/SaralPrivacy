import Link from "next/link";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

// Beat 5 — Proof (slim sample-result). Light section. Honest illustrative
// sample, never fake "your" data. Risk shown in Signal Gold (brand: no red).
// The sector finder lives at Beat 7 (the wall); this beat just proves the
// assessment gives a real, specific verdict.

export function ProofSection() {
  return (
    <section className="bg-cloud-50 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-teal-600 mb-3">
            Proof
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-3">
            Does this fit your business?
          </h2>
          <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
            A real, scored verdict for your sector — not a generic report. Here is
            what one looks like.
          </p>
        </div>

        {/* sample-result card */}
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-start justify-between mb-5">
            <span className="font-bold text-navy-700">Clinics &amp; Diagnostic Labs</span>
            <span className="shrink-0 text-2xs font-semibold text-slate-500 bg-cloud-50 border border-slate-200 rounded-full px-2.5 py-1">
              Sample · illustrative
            </span>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div
              className="relative shrink-0 w-[68px] h-[68px] rounded-full grid place-items-center"
              style={{ background: "conic-gradient(#E8AB42 0 41%, #E2E8F0 41% 100%)" }}
            >
              <div className="absolute w-[50px] h-[50px] rounded-full bg-white" />
              <div className="relative text-center leading-none">
                <span className="block text-xl font-bold text-navy-700">41</span>
                <span className="block text-2xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-semibold text-navy-700 bg-gold-400 rounded-full px-3 py-1 mb-1.5">
                High-priority action
              </span>
              <p className="text-sm text-slate-600 leading-snug">
                Significant gaps — start a focused fix plan now.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <div className="flex gap-2.5">
              <AlertTriangle size={17} className="text-gold-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-snug">
                <span className="font-semibold text-navy-700">Top gap:</span> reports
                shared over WhatsApp with no consent or retention limit.
              </p>
            </div>
            <div className="flex gap-2.5">
              <CheckCircle size={17} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-snug">
                <span className="font-semibold text-navy-700">First fix:</span> add a
                consent line and a 6-month retention rule.
              </p>
            </div>
          </div>
        </div>

        {/* one primary CTA + quiet pointer to the sector wall (Beat 7) */}
        <div className="text-center mt-8">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Take your free assessment
            <ArrowRight size={18} />
          </Link>
          <div className="mt-4">
            <Link
              href="#sectors"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              See what&apos;s at stake for your sector
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

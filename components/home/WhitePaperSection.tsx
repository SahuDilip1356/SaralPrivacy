import Link from "next/link";
import { Download, FileText, CheckCircle } from "lucide-react";

const whitePaperContents = [
  "What DPDPA is and who it applies to — in plain English",
  "Obligations for Data Fiduciaries: consent, notice, security, breach",
  "Sector-by-sector breakdown: recruitment, CA firms, training, D2C",
  "Rights of individuals and how businesses must respond",
  "Enforcement timeline and penalty structure",
  "Your 30-day compliance action plan",
];

export function WhitePaperSection() {
  return (
    <section className="py-20 bg-brand-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1.5 mb-5">
              <FileText size={12} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold">45-page practitioner guide · Free download</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The complete DPDPA guide
              <span className="block text-saffron-400 mt-1">for Indian businesses</span>
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed mb-7">
              A practitioner-grade white paper that covers everything your business needs to know
              about DPDPA — from applicability to enforcement — without the legalese.
            </p>

            {/* Contents */}
            <ul className="space-y-2.5 mb-8">
              {whitePaperContents.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                  <CheckCircle size={16} className="text-saffron-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/white-paper"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-saffron-500 hover:bg-saffron-500 text-white font-semibold rounded-xl transition-colors text-base"
            >
              <Download size={18} />
              Download Free White Paper
            </Link>
            <p className="text-slate-500 text-xs mt-3">
              Requires name, work email, and industry. Separate consent options for follow-up.
            </p>
          </div>

          {/* Right: white paper visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              {/* Document header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-brand-700 flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-brand-700 text-base leading-snug">
                    DPDPA: The Complete Guide for Indian Businesses
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">2026 Edition · 45 pages</div>
                </div>
              </div>

              {/* Preview sections */}
              <div className="space-y-3">
                {[
                  "01. Understanding DPDPA",
                  "02. Who It Applies To",
                  "03. Consent Framework",
                  "04. Sector Breakdown",
                  "05. Rights of Individuals",
                  "06. Enforcement & Penalties",
                  "07. 30-Day Action Plan",
                ].map((section) => (
                  <div
                    key={section}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-sm text-slate-600">{section}</span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3.5 rounded-lg bg-saffron-50 border border-saffron-200 text-center">
                <p className="text-saffron-700 text-sm font-semibold">
                  Download instantly · Free · DPDPA-compliant consent
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              Free Download
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

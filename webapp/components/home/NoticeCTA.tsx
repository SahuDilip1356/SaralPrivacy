import Link from "next/link";
import { ArrowRight, FileText, ListChecks, ShieldCheck } from "lucide-react";

const points = [
  { icon: ListChecks, text: "Answer 8 plain questions — no legal jargon, no blank page" },
  { icon: FileText, text: "Get a full notice, form mini-notices, consent text & rights block" },
  { icon: ShieldCheck, text: "Built around the DPDPA's Section 5 notice requirements" },
];

export function NoticeCTA() {
  return (
    <section className="py-20 bg-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/30 rounded-full px-3.5 py-1.5 mb-5">
              <span className="text-teal-300 text-xs font-semibold tracking-wide uppercase">
                Free · Preview without email
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Your privacy notice, written for you.
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Most DPDPA notices online are copy-paste templates that don&apos;t fit your business.
              The <strong className="text-white">Notice Generator</strong> assembles a tailored Notice
              Pack from a few questions about how you actually collect and use data.
            </p>

            <ul className="space-y-3 mb-8">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
                    <Icon size={16} className="text-teal-300" />
                  </span>
                  <span className="text-slate-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/tools/dpdpa-privacy-notice-generator"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors text-base"
            >
              Generate My Notice Pack
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right: mini notice preview */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col gap-0.5 pb-4 border-b border-slate-100">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-teal-600">
                Privacy Notice · v1.0
              </span>
              <span className="text-xl font-bold text-navy-700">Sunrise Diagnostics</span>
            </div>
            <div className="flex flex-col gap-2.5 py-4">
              {[
                "1. Who we are",
                "2. Personal data we collect",
                "3. Why we collect it",
                "5. Sharing with service providers",
                "8. Consent & withdrawal",
                "9. Your rights",
              ].map((h) => (
                <div key={h} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded grid place-items-center text-xs font-bold bg-green-500 text-white">
                    ✓
                  </span>
                  <span className="flex-1 text-slate-600">{h}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div
                className="relative w-[58px] h-[58px] rounded-full grid place-items-center"
                style={{ background: "conic-gradient(#22B07D 0 100%, #E8EDF3 100% 100%)" }}
              >
                <div className="absolute w-[42px] h-[42px] rounded-full bg-white" />
                <span className="relative text-lg font-extrabold text-navy-700">100</span>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Notice readiness
                </div>
                <div className="inline-block mt-1 bg-green-500 text-white font-bold text-sm px-3.5 py-1 rounded-full">
                  Strong
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

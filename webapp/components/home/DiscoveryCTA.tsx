import Link from "next/link";
import { ArrowRight, Search, Layers, EyeOff } from "lucide-react";

const points = [
  { icon: Layers, text: "276 business types mapped: pick yours, no blank forms" },
  { icon: EyeOff, text: "Surfaces the hidden, often-missed data most owners forget" },
  { icon: Search, text: "Instant DPDPA risk snapshot: no email to see your result" },
];

export function DiscoveryCTA() {
  return (
    <section className="py-20 bg-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/30 rounded-full px-3.5 py-1.5 mb-5">
              <span className="text-teal-300 text-xs font-semibold tracking-wide uppercase">
                Start here · Free · No email
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Not sure what personal data you even hold?
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Most businesses underestimate it. Use the <strong className="text-white">Personal Data
              Discovery</strong> tool to map the data your business actually collects (in about
              three minutes), then move to the full assessment.
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
              href="/discovery"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors text-base"
            >
              Discover My Personal Data
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right: mini data-map preview */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col gap-0.5 pb-4 border-b border-slate-100">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-teal-800">
                Healthcare &amp; wellness
              </span>
              <span className="text-xl font-bold text-navy-700">Diagnostic lab</span>
            </div>
            <div className="flex flex-col gap-2.5 py-4">
              {[
                ["Core", "Patient identity & contact", true],
                ["Operational", "Test reports & results", true],
                ["Operational", "Payment & insurance refs", true],
                ["Often-missed", "WhatsApp report sharing", false],
                ["Often-missed", "Old report exports & CSVs", false],
              ].map(([tag, label, on], i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${on ? "" : "opacity-60"}`}>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      tag === "Core"
                        ? "bg-green-100 text-green-700"
                        : tag === "Operational"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {tag}
                  </span>
                  <span className="flex-1 text-slate-600">{label}</span>
                  <span
                    className={`w-5 h-5 rounded grid place-items-center text-xs font-bold ${
                      on ? "bg-green-700 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {on ? "✓" : "+"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div
                className="relative w-[58px] h-[58px] rounded-full grid place-items-center"
                style={{ background: "conic-gradient(#E8704A 0 61%, #E8EDF3 61% 100%)" }}
              >
                <div className="absolute w-[42px] h-[42px] rounded-full bg-white" />
                <span className="relative text-lg font-extrabold text-navy-700">61</span>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Risk level
                </div>
                <div className="inline-block mt-1 bg-orange-500 text-white font-bold text-sm px-3.5 py-1 rounded-full">
                  High
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

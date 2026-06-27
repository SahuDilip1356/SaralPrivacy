import { GraduationCap, Calculator, Building2 } from "lucide-react";

// Beat 6 — Founder proof. Indian SMBs trust people and credentials; this block
// was absent from the live page. Editorial (type + space), not a heavy card.
// Light section (Cloud-50). Brand tokens via Tailwind.

const credentials = [
  { icon: Calculator, label: "Chartered Accountant" },
  { icon: GraduationCap, label: "IIM Bangalore alumnus" },
  { icon: Building2, label: "22+ years in enterprise systems" },
];

export function FounderProof() {
  return (
    <section className="bg-cloud-50 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-teal-600 mb-4">
          Who&apos;s behind this
        </span>

        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="shrink-0 w-14 h-14 rounded-full grid place-items-center bg-navy-700 text-white font-semibold text-lg">
            DS
          </span>
          <div className="text-left">
            <div className="text-navy-700 font-bold text-xl">Dilip Sahu</div>
            <div className="text-slate-500 text-sm">Founder, SaralPrivacy</div>
          </div>
        </div>

        <p className="text-slate-700 text-lg leading-relaxed mb-7 max-w-2xl mx-auto">
          I built SaralPrivacy because Indian businesses don&apos;t need more legal
          theory — they need to know what to fix, in plain English. After two
          decades building finance, ERP and governance systems, I wanted DPDPA made
          genuinely practical for the people who actually run a business.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {credentials.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={16} className="text-teal-600 shrink-0" />
              <span className="text-slate-600 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { GraduationCap, Calculator, Building2 } from "lucide-react";

// Founder proof. Indian SMBs trust people and credentials. Moved off the landing
// page (Phase 2) to the About page, where "who's behind this" is the question a
// visitor actually came to ask. Restyled from a standalone section to a card so
// it matches the About page's card system. Brand tokens via Tailwind.

// Exported so the homepage's navy recognition band states the same credentials
// from the same place. Two copies of a person's CV is exactly the kind of thing
// that drifts apart and then contradicts itself.
export const FOUNDER_CREDENTIALS = [
  { icon: Calculator, label: "Chartered Accountant" },
  { icon: GraduationCap, label: "IIM Bangalore alumnus" },
  { icon: Building2, label: "22+ years in enterprise systems" },
];

export const FOUNDER_QUOTE =
  "I built SaralPrivacy because Indian businesses don't need more legal theory — they need to know what to fix, in plain English. After two decades building finance, ERP and governance systems, I wanted DPDPA made genuinely practical for the people who actually run a business.";

const credentials = FOUNDER_CREDENTIALS;

export function FounderProof() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-7">
      <span className="inline-block text-xs font-medium uppercase tracking-[0.08em] text-slate-600 mb-4">
        Who&apos;s behind this
      </span>

      <div className="flex items-center gap-4 mb-5">
        <span className="shrink-0 w-14 h-14 rounded-full grid place-items-center bg-navy-700 text-white font-semibold text-lg">
          DS
        </span>
        <div>
          <div className="text-navy-700 font-bold text-xl">Dilip Sahu</div>
          <div className="text-slate-600 text-sm">Founder, SaralPrivacy</div>
        </div>
      </div>

      <p className="text-slate-700 text-base leading-relaxed mb-6 max-w-2xl">
        I built SaralPrivacy because Indian businesses don&apos;t need more legal
        theory — they need to know what to fix, in plain English. After two
        decades building finance, ERP and governance systems, I wanted DPDPA made
        genuinely practical for the people who actually run a business.
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {credentials.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={16} className="text-teal-600 shrink-0" />
            <span className="text-slate-600 text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

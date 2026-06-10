import Link from "next/link";
import { ArrowRight, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

const outcomes = [
  {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    level: "Low Complexity",
    description: "Your practices are relatively DPDPA-aligned. Review quick wins.",
  },
  {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    level: "Moderate Exposure",
    description: "Specific gaps need structured attention over 2-3 months.",
  },
  {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    level: "High-Priority Action",
    description: "Significant gaps require immediate compliance programme.",
  },
];

const assessments = [
  { label: "Recruitment Agencies", href: "/assessment/recruitment", count: "8 questions" },
  { label: "CA Firms", href: "/assessment/ca-firms", count: "7 questions" },
  { label: "Training Institutes", href: "/assessment/training-institutes", count: "7 questions" },
  { label: "D2C Brands", href: "/assessment/d2c-brands", count: "8 questions" },
  { label: "Clinics & Diagnostic Labs", href: "/assessment/clinics-diagnostic-labs", count: "10 questions" },
  { label: "Schools & Colleges", href: "/assessment/schools-colleges", count: "10 questions" },
];

export function AssessmentCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3.5 py-1.5 mb-5">
              <Clock size={12} className="text-amber-700" />
              <span className="text-amber-700 text-xs font-semibold">Free — takes 3–5 minutes</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-4">
              Find out exactly where you stand with DPDPA
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Our industry-specific assessments score your business across four dimensions:
              applicability, maturity, risk, and urgency. You get a personalised result — not a generic report.
            </p>

            {/* Score outcomes */}
            <div className="space-y-3 mb-8">
              {outcomes.map(({ icon: Icon, color, bg, border, level, description }) => (
                <div key={level} className={`flex items-center gap-3 p-3 rounded-lg border ${border} ${bg}`}>
                  <Icon size={20} className={`${color} shrink-0`} />
                  <div>
                    <div className={`text-sm font-bold ${color}`}>{level}</div>
                    <div className="text-xs text-slate-600">{description}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors text-base"
            >
              Choose Your Assessment
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right: assessment picker */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-7">
            <h3 className="font-bold text-navy-700 text-lg mb-2">Select your industry</h3>
            <p className="text-slate-500 text-sm mb-6">
              Each assessment is tailored to the specific data risks and obligations of your sector.
            </p>

            <div className="space-y-3">
              {assessments.map(({ label, href, count }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all group"
                >
                  <div>
                    <div className="font-semibold text-navy-700 text-sm group-hover:text-navy-700 transition-colors">
                      {label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{count} · ~3–5 minutes</div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
                </Link>
              ))}
            </div>

            <div className="mt-5 p-3.5 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs text-green-700">
                <strong>No account required.</strong> Results are shown immediately after
                completion. You can optionally save your results by providing your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

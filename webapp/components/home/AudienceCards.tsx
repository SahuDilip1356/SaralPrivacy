import Link from "next/link";
import { Users, Calculator, GraduationCap, ShoppingBag, ArrowRight } from "lucide-react";

const audiences = [
  {
    icon: Users,
    title: "Recruitment Agencies",
    href: "/industries/recruitment-agencies",
    assessmentHref: "/assessment/recruitment",
    color: "teal",
    painPoints: ["CV databases & candidate data", "Client profile sharing", "Background check documents", "Cross-border data flows"],
    promise: "Find out whether your recruitment workflows create DPDPA exposure in 3–5 minutes.",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200",
    accentText: "text-teal-700",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-700",
  },
  {
    icon: Calculator,
    title: "CA Firms",
    href: "/industries/ca-firms",
    assessmentHref: "/assessment/ca-firms",
    color: "indigo",
    painPoints: ["PAN / Aadhaar / bank data", "Client payroll records", "Cloud drives & shared folders", "Sensitive financial documents"],
    promise: "Understand your DPDPA obligations for client records, payroll data, and firm operations.",
    accentBg: "bg-indigo-50",
    accentBorder: "border-indigo-200",
    accentText: "text-indigo-700",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
  },
  {
    icon: GraduationCap,
    title: "Training Institutes",
    href: "/industries/training-institutes",
    assessmentHref: "/assessment/training-institutes",
    color: "amber",
    painPoints: ["Student & parent data", "Admissions & lead forms", "Digital marketing consent", "Placement data retention"],
    promise: "Check whether your admissions, marketing, and student data workflows are DPDPA-ready.",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-700",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands",
    href: "/industries/d2c-brands",
    assessmentHref: "/assessment/d2c-brands",
    color: "rose",
    painPoints: ["Email / SMS / WhatsApp marketing", "Third-party analytics & pixels", "Customer loyalty data", "Retention of inactive customers"],
    promise: "See whether your customer acquisition and retention stack creates DPDPA risk.",
    accentBg: "bg-rose-50",
    accentBorder: "border-rose-200",
    accentText: "text-rose-700",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
  },
];

export function AudienceCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3.5 py-1.5 mb-4">
            <span className="text-teal-700 text-xs font-semibold">Industry-Specific Guidance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-4">
            DPDPA affects different businesses
            <span className="block text-teal-600">in very different ways</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A recruitment agency, a CA firm, a training institute, and a D2C brand all collect personal
            data — but their risks, obligations, and compliance paths are completely different.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className={`rounded-xl border ${audience.accentBorder} ${audience.accentBg} p-6 flex flex-col`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${audience.iconBg} flex items-center justify-center mb-4`}>
                <audience.icon size={20} className={audience.iconColor} />
              </div>

              {/* Title */}
              <h3 className="font-bold text-navy-700 text-lg mb-2">{audience.title}</h3>

              {/* Pain points */}
              <ul className="space-y-1.5 mb-4 flex-1">
                {audience.painPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className={`mt-1.5 w-1 h-1 rounded-full ${audience.iconColor.replace('text-', 'bg-')} shrink-0`} />
                    {point}
                  </li>
                ))}
              </ul>

              {/* Promise */}
              <p className={`text-sm font-medium ${audience.accentText} mb-4 leading-snug`}>
                &ldquo;{audience.promise}&rdquo;
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={audience.assessmentHref}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-semibold text-white rounded-lg bg-green-500 hover:bg-green-600 transition-colors`}
                >
                  Take Assessment
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={audience.href}
                  className={`text-center text-sm font-medium ${audience.accentText} hover:underline`}
                >
                  View Industry Guide →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

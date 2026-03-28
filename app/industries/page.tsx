import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Calculator, GraduationCap, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "DPDPA by Industry",
  description:
    "See how DPDPA affects recruitment agencies, CA firms, training institutes, and D2C brands, with sector risks, guides, and free assessments.",
  alternates: { canonical: 'https://saralprivacy.com/industries' },
};

const industries = [
  {
    icon: Users,
    title: "Recruitment & Staffing Agencies",
    href: "/industries/recruitment-agencies",
    assessmentHref: "/assessment/recruitment",
    tagline: "CV databases, candidate consent, ATS, and cross-border placements",
    risks: ["Candidate data without consent", "CV sharing without disclosure", "Indefinite data retention", "Unvetted ATS vendors"],
    stat: "Most recruitment agencies store candidate data with no formal deletion process",
    color: "teal",
    bg: "bg-saffron-50",
    border: "border-saffron-200",
    iconBg: "bg-saffron-100",
    iconColor: "text-saffron-600",
    btn: "bg-saffron-500 hover:bg-saffron-600",
  },
  {
    icon: Calculator,
    title: "CA Firms & Accounting Practices",
    href: "/industries/ca-firms",
    assessmentHref: "/assessment/ca-firms",
    tagline: "PAN, Aadhaar, payroll, client records, and cloud storage",
    risks: ["Unencrypted Aadhaar copies", "Broad staff access to client files", "No retention policy", "Unvetted cloud vendors"],
    stat: "CA firms process some of the most sensitive personal data in India",
    color: "indigo",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    btn: "bg-indigo-700 hover:bg-indigo-800",
  },
  {
    icon: GraduationCap,
    title: "Training Institutes & Coaching Centres",
    href: "/industries/training-institutes",
    assessmentHref: "/assessment/training-institutes",
    tagline: "Student and parent data, admissions forms, minors, placement records",
    risks: ["No minor consent mechanism", "Marketing pixels on forms", "Placement data misuse", "No data rights process"],
    stat: "Most training institutes have no formal privacy notice for admissions",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    btn: "bg-amber-600 hover:bg-amber-700",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands & E-commerce Businesses",
    href: "/industries/d2c-brands",
    assessmentHref: "/assessment/d2c-brands",
    tagline: "Marketing consent, analytics tools, WhatsApp campaigns, loyalty data",
    risks: ["Bundled checkout consent", "Undisclosed tracking pixels", "No unsubscribe mechanism", "Indefinite inactive data"],
    stat: "Most D2C checkout flows bundle marketing consent with purchase terms",
    color: "rose",
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    btn: "bg-rose-700 hover:bg-rose-800",
  },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              DPDPA by Industry
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Different sectors face different DPDPA risks. Choose your industry for tailored guidance,
              specific risk areas, and a free readiness assessment.
            </p>
          </div>
          <div className="mt-4 max-w-2xl bg-white/10 border border-white/20 rounded-xl px-5 py-4">
            <p className="text-slate-200 text-sm leading-relaxed">The law is one thing. The mess varies by industry. Recruitment agencies, CA firms, training institutes, and D2C brands process very different data, use different tools, and create different exposure points under DPDPA. Use this sector hub to see where your real risks sit and what to fix first.</p>
            <p className="text-saffron-300 text-xs mt-2 font-medium">Same law. Different data flows. Different headaches.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {industries.map((ind) => (
            <div key={ind.title} className={`rounded-xl border-2 ${ind.border} ${ind.bg} p-6`}>
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl ${ind.iconBg} flex items-center justify-center shrink-0`}>
                  <ind.icon size={24} className={ind.iconColor} />
                </div>
                <div>
                  <h2 className="font-bold text-brand-700 text-xl leading-snug">{ind.title}</h2>
                  <p className={`text-sm ${ind.iconColor} mt-1`}>{ind.tagline}</p>
                </div>
              </div>

              {/* Stat */}
              <div className="bg-white/70 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-slate-600 italic">&ldquo;{ind.stat}&rdquo;</p>
              </div>

              {/* Risk areas */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Common Risk Areas</p>
                <div className="grid grid-cols-2 gap-2">
                  {ind.risks.map((risk) => (
                    <div key={risk} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className={`mt-1 w-1 h-1 rounded-full ${ind.iconColor.replace('text-', 'bg-')} shrink-0`} />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={ind.assessmentHref}
                  className={`flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${ind.btn}`}
                >
                  Free Assessment →
                </Link>
                <Link
                  href={ind.href}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-brand-700 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                  View Full Guide →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
      </div>
    </div>
  );
}

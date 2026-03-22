import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Users, Calculator, GraduationCap, ShoppingBag, CheckCircle } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Free DPDPA Readiness Assessment",
  description:
    "Take our free 10-minute DPDPA readiness assessment tailored to your industry. Recruitment agencies, CA firms, training institutes, and D2C brands.",
  alternates: { canonical: 'https://saralprivacy.com/assessment' },
};

const assessments = [
  {
    icon: Users,
    title: "Recruitment & Staffing",
    href: "/assessment/recruitment",
    questions: 8,
    duration: "10 min",
    description: "CV databases, candidate consent, client sharing, background checks, retention, and cross-border flows.",
    highlight: "Do your candidate data practices create DPDPA exposure?",
    color: "teal",
    bg: "bg-saffron-50",
    border: "border-saffron-200",
    iconBg: "bg-saffron-100",
    iconColor: "text-saffron-600",
    btnColor: "bg-saffron-500 hover:bg-saffron-600",
  },
  {
    icon: Calculator,
    title: "CA Firms",
    href: "/assessment/ca-firms",
    questions: 7,
    duration: "8 min",
    description: "PAN/Aadhaar handling, client payroll data, cloud drives, vendor access, and retention policies.",
    highlight: "Are your client data and financial records DPDPA-ready?",
    color: "indigo",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    btnColor: "bg-indigo-700 hover:bg-indigo-800",
  },
  {
    icon: GraduationCap,
    title: "Training Institutes",
    href: "/assessment/training-institutes",
    questions: 7,
    duration: "8 min",
    description: "Student and parent data, admissions forms, minors, placement data, and digital marketing consent.",
    highlight: "Do your admissions and marketing practices meet DPDPA requirements?",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    btnColor: "bg-amber-600 hover:bg-amber-700",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands",
    href: "/assessment/d2c-brands",
    questions: 8,
    duration: "10 min",
    description: "Marketing consent, analytics tools, WhatsApp opt-in, customer retention, and preference management.",
    highlight: "Does your customer data and marketing stack create DPDPA risk?",
    color: "rose",
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    btnColor: "bg-rose-700 hover:bg-rose-800",
  },
];

const whatYouGet = [
  "Applicability score — does DPDPA apply to your specific situation?",
  "Risk score — how exposed are your current practices?",
  "Maturity score — how prepared is your business right now?",
  "Urgency score — how quickly do you need to act?",
  "Personalised recommendations based on your answers",
  "Suggested next steps — free resources, consultation, or guidance",
];

export default function AssessmentHubPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'DPDPA Readiness Assessment', url: 'https://saralprivacy.com/assessment' },
      ])}
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-brand-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1.5 mb-5">
              <Clock size={12} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold">Free — 8 to 10 minutes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              DPDPA Readiness Assessments
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Industry-specific assessments that score your current data practices across four
              dimensions — applicability, risk, maturity, and urgency — with personalised
              recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* What you get */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
          <h2 className="font-bold text-brand-700 text-lg mb-4">
            What your assessment includes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatYouGet.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle size={16} className="text-saffron-500 shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Assessment cards */}
        <h2 className="font-bold text-brand-700 text-xl mb-6">Choose your industry assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {assessments.map((assessment) => (
            <div
              key={assessment.title}
              className={`rounded-xl border-2 ${assessment.border} ${assessment.bg} p-6`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl ${assessment.iconBg} flex items-center justify-center shrink-0`}>
                  <assessment.icon size={20} className={assessment.iconColor} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-700 text-lg leading-tight">{assessment.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{assessment.questions} questions</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{assessment.duration}</span>
                  </div>
                </div>
              </div>

              {/* Highlight */}
              <div className="bg-white/70 rounded-lg px-3.5 py-2.5 mb-3">
                <p className={`text-sm font-semibold ${assessment.iconColor}`}>
                  {assessment.highlight}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                {assessment.description}
              </p>

              {/* CTA */}
              <Link
                href={assessment.href}
                className={`inline-flex items-center gap-2 w-full justify-center py-3 px-5 text-white font-semibold rounded-xl text-sm transition-colors ${assessment.btnColor}`}
              >
                Start Assessment
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
          <p className="mb-2">
            <strong className="text-brand-700">Not sure which assessment to take?</strong> Start with
            the one closest to your primary business activity. If you operate across multiple
            sectors, take more than one — each assessment is independent and free.
          </p>
          <p>
            No account required. Results are shown immediately. You may optionally provide your email
            to save results and receive a detailed follow-up guide.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

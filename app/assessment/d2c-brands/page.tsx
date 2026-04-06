import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";
import { d2cBrandQuestions } from "@/lib/data/assessments";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "D2C Brand DPDPA Compliance Check",
  description:
    "Free DPDPA assessment for D2C brands and e-commerce businesses. Check marketing consent, analytics tools, customer data retention, and preference management.",
  alternates: { canonical: 'https://saralprivacy.com/assessment' },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function D2CAssessmentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            All Assessments
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-700 flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              D2C Brand — DPDPA Readiness Assessment
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {d2cBrandQuestions.length} questions · ~10 minutes · Free · No account required
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-7">
          <h2 className="font-bold text-navy-700 text-sm mb-2">What this assessment covers</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            This assessment evaluates your D2C brand&apos;s DPDPA exposure across marketing consent,
            analytics and tracking tools, WhatsApp/SMS opt-in, customer data retention, loyalty
            programmes, third-party data sharing, and preference management mechanisms.
          </p>
        </div>

        <AssessmentWizard
          title="D2C Brand Assessment"
          industry="d2c-brands"
          questions={d2cBrandQuestions}
        />
      </div>
    </div>
  );
}

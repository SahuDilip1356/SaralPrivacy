import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";
import { caFirmQuestions } from "@/lib/data/assessments";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "CA Firm DPDPA Compliance Assessment",
  description:
    "Free DPDPA assessment for Chartered Accountant firms. Evaluate PAN/Aadhaar handling, payroll data, vendor access, and client data retention.",
  alternates: { canonical: 'https://saralprivacy.com/assessment/ca-firms' },
};

export default function CAFirmsAssessmentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-700 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            All Assessments
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-700 flex items-center justify-center">
              <Calculator size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              CA Firm — DPDPA Readiness Assessment
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {caFirmQuestions.length} questions · ~8 minutes · Free · No account required
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-7">
          <h2 className="font-bold text-brand-700 text-sm mb-2">
            What this assessment covers
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            This assessment evaluates your CA firm&apos;s DPDPA obligations across payroll processing,
            PAN/Aadhaar handling, cloud storage practices, third-party vendor access, retention
            policies, employee data management, and rights request handling.
          </p>
        </div>

        <AssessmentWizard
          title="CA Firm Assessment"
          industry="ca-firms"
          questions={caFirmQuestions}
        />
      </div>
    </div>
  );
}

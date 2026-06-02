import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";
import { recruitmentQuestions } from "@/lib/data/assessments";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Recruitment Agency DPDPA Assessment",
  description:
    "Free DPDPA readiness assessment for recruitment and staffing agencies. Check your candidate data, consent flows, and retention practices in 3–5 minutes.",
  // Canonical → hub page. Sub-route is a client-side JS wizard with minimal
  // crawlable HTML; noindex prevents index pollution and keeps link equity
  // consolidated on /assessment.
  alternates: { canonical: 'https://saralprivacy.com/assessment' },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function RecruitmentAssessmentPage() {
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
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Recruitment & Staffing Agency — DPDPA Readiness Assessment
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {recruitmentQuestions.length} questions · ~3–5 minutes · Free · No account required
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Intro */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-7">
          <h2 className="font-bold text-navy-700 text-sm mb-2">
            What this assessment covers
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            This assessment evaluates your recruitment agency&apos;s DPDPA exposure across candidate data
            collection, CV sharing, ATS use, identity document handling, retention policies, candidate
            rights, and cross-border data flows. You will receive a personalised risk score and
            specific recommendations.
          </p>
        </div>

        <AssessmentWizard
          title="Recruitment Agency Assessment"
          industry="recruitment"
          questions={recruitmentQuestions}
        />
      </div>
    </div>
  );
}

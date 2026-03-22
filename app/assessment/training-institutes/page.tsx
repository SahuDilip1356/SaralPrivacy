import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";
import { trainingInstituteQuestions } from "@/lib/data/assessments";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Training Institute DPDPA Assessment",
  description:
    "Free DPDPA assessment for training institutes and coaching centres. Check student data practices, minor consent, marketing pixels, and placement data.",
  alternates: { canonical: 'https://saralprivacy.com/assessment/training-institutes' },
};

export default function TrainingAssessmentPage() {
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
            <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Training Institute — DPDPA Readiness Assessment
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {trainingInstituteQuestions.length} questions · ~8 minutes · Free · No account required
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-7">
          <h2 className="font-bold text-brand-700 text-sm mb-2">What this assessment covers</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            This assessment evaluates your training institute&apos;s DPDPA exposure across student
            data collection, digital admissions, minor students, marketing campaigns, attendance
            systems, placement data, and rights request mechanisms.
          </p>
        </div>

        <AssessmentWizard
          title="Training Institute Assessment"
          industry="training-institutes"
          questions={trainingInstituteQuestions}
        />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "DPDPA for Training Institutes",
  description: "Understand DPDPA obligations for training institutes, including parental consent, admissions forms, tracking pixels, placement data, and rights handling.",
  alternates: { canonical: 'https://saralprivacy.com/industries/training-institutes' },
};

export default function TrainingInstitutesPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'Industries', url: 'https://saralprivacy.com/industries' },
        { name: 'Training Institutes', url: 'https://saralprivacy.com/industries/training-institutes' },
      ])}
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-amber-300 text-sm font-semibold">Industry Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">DPDPA for Training Institutes and Coaching Centres</h1>
          <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 max-w-2xl">
            <p className="text-slate-200 text-sm leading-relaxed">Training institutes collect personal data at every stage of the student lifecycle: enquiries, admissions, attendance, fees, placements, and marketing. If minors are involved, the compliance stakes rise fast because parental consent and careful data handling become central. This guide helps institutes fix the most common weak spots in forms, tracking, permissions, and student data workflows.</p>
            <p className="text-amber-300 text-xs mt-2 font-medium">Most institutes think they run classes. They also run a quiet little data factory.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {[
              { title: "Minor Students' Data", risk: "Critical", desc: "Processing data of students under 18 requires verifiable parental consent under DPDPA. This affects admissions, attendance, and marketing.", action: "Implement a parental consent mechanism for all students under 18. Review your admissions forms immediately." },
              { title: "Admissions Lead Forms", risk: "High", desc: "Lead generation forms that capture name, phone, city, and course interest create consent obligations — especially if the data is used for remarketing.", action: "Add a DPDPA-compliant consent notice to all enquiry and admissions forms. Separate marketing consent from enquiry processing." },
              { title: "Digital Marketing and Pixels", risk: "High", desc: "Meta Pixel, Google Tags, and remarketing pixels track and profile prospective students without explicit consent in most current implementations.", action: "Disclose all tracking tools in your Privacy Notice. Implement consent management before firing marketing pixels." },
              { title: "Placement Data", risk: "Medium", desc: "Salary slips, offer letters, and employer names are sensitive personal data. Using placement data for marketing testimonials without consent is a violation.", action: "Obtain separate written consent from placed students before using their placement data for marketing. Define retention periods for placement records." },
            ].map((area) => (
              <div key={area.title} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-navy-700">{area.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${area.risk === "Critical" ? "bg-red-100 text-red-700" : area.risk === "High" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{area.risk} Risk</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">{area.desc}</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-xs"><strong>Action: </strong>{area.action}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <div className="bg-amber-600 rounded-xl p-5 text-white">
              <h3 className="font-bold mb-2">Take the Free Assessment</h3>
              <p className="text-amber-100 text-sm mb-4">7 questions. Check your student data practices.</p>
              <Link href="/assessment/training-institutes" className="block text-center py-2.5 bg-white text-amber-800 font-bold rounded-lg text-sm">Start Assessment →</Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-2">Free White Paper</h3>
              <p className="text-slate-600 text-xs mb-3">45-page DPDPA guide including a section on training institutes.</p>
              <Link href="/white-paper" className="block text-center py-2.5 bg-navy-700 text-white font-semibold rounded-lg text-sm hover:bg-navy-800 transition-colors">
                Download White Paper →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-3">Related Briefings</h3>
              <div className="space-y-2 text-sm">
                <Link href="/briefings/training-institutes-student-data-dpdpa" className="block text-green-600 hover:underline">→ Student Data and DPDPA</Link>
                <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-green-600 hover:underline">→ Consent Notice Requirements</Link>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <Link href="/contact" className="block text-center py-2.5 bg-navy-700 text-white font-semibold rounded-lg text-sm">Request Consultation →</Link>
            </div>
          </div>
        </div>
      </div>
        <div data-nosnippet className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
    </div>
    </>
  );
}

import type { Metadata } from "next";
import { breadcrumbSchema } from "@/lib/schema";
import SurveyClient from "./SurveyClient";

export const metadata: Metadata = {
  title: "Free DPDPA Readiness Assessment",
  description:
    "Check your DPDPA readiness in minutes. Get a practical risk score, compliance gaps, and next-step recommendations tailored to your industry.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
};

export default function AssessmentPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "DPDPA Readiness Check", url: "https://saralprivacy.com/assessment" },
      ])}

      {/* SSR content — crawlable answer block, scoring explanation, audience */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-5 pb-2">

        {/* Answer block */}
        <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4">
          <p className="text-slate-700 text-sm leading-relaxed">
            Check how exposed your business is under India&apos;s DPDP regime in a few practical
            questions. This assessment surfaces the biggest compliance gaps in notices, consent,
            rights handling, retention, vendor management, and breach readiness — and tells you
            what to fix first. You get a plain-English risk score and next actions, not a
            decorative PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* How scoring works */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-bold text-brand-700 text-sm mb-3">How scoring works</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your score reflects four practical dimensions: whether DPDPA clearly applies to
              your business, how mature your current controls are, how much risk your current
              data practices create, and how urgent your next compliance actions are. The goal
              is not legal perfection — it is to show you what deserves attention first.
            </p>
          </div>

          {/* Who should take this */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-bold text-brand-700 text-sm mb-3">Who should take this</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Built for founders, operations leads, compliance managers, HR teams, recruiters,
              CA firms, training businesses, and D2C teams that handle personal data but do not
              yet have a formal privacy operating model. Takes 8–10 minutes.
            </p>
          </div>
        </div>

        {/* Reviewed block */}
        <div className="pt-1 text-xs text-slate-400 space-y-0.5">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This assessment is for educational purposes and does not constitute legal advice.</p>
        </div>
      </div>

      <SurveyClient />
    </>
  );
}

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4 mb-2">
          <p className="text-slate-700 text-sm leading-relaxed">Check how exposed your business is under India&apos;s DPDP regime in a few practical questions. This assessment helps you spot the biggest compliance gaps in notices, consent, rights handling, retention, vendor management, and breach readiness. You get a plain-English score and next actions, not a decorative PDF that gathers dust.</p>
        </div>
      </div>
      <SurveyClient />
    </>
  );
}

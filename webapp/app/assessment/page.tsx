import type { Metadata } from "next";
import { breadcrumbSchema } from "@/lib/schema";
import { DiscoveryCrossLink } from "@/components/DiscoveryCrossLink";
import { NoticeCrossLink } from "@/components/NoticeCrossLink";
import SurveyClient from "./SurveyClient";

export const metadata: Metadata = {
  title: "Free DPDPA Readiness Assessment — 3 Minutes",
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

      {/* SEO content — hidden visually, fully crawlable */}
      <div className="sr-only">
        <p>
          Check how exposed your business is under India&apos;s DPDP regime in a few practical
          questions. This assessment surfaces the biggest compliance gaps in notices, consent,
          rights handling, retention, vendor management, and breach readiness — and tells you
          what to fix first. You get a plain-English risk score and next actions, not a
          decorative PDF.
        </p>
        <h2>How scoring works</h2>
        <p>
          Your score reflects four practical dimensions: whether DPDPA clearly applies to
          your business, how mature your current controls are, how much risk your current
          data practices create, and how urgent your next compliance actions are. The goal
          is not legal perfection — it is to show you what deserves attention first.
        </p>
        <h2>Who should take this</h2>
        <p>
          Built for founders, operations leads, compliance managers, HR teams, recruiters,
          CA firms, training businesses, and D2C teams that handle personal data but do not
          yet have a formal privacy operating model. Takes 3–5 minutes.
        </p>
        <p>Legal baseline: DPDP Rules, 2025 notified on 14 November 2025, with phased commencement. This assessment is for educational purposes and does not constitute legal advice.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <DiscoveryCrossLink />
        <NoticeCrossLink className="mt-4" />
      </div>

      <SurveyClient />
    </>
  );
}

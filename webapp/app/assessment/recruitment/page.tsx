import type { Metadata } from "next";
import RecruitmentAssessmentClient from "./RecruitmentAssessmentClient";

export const metadata: Metadata = {
  title: "Recruitment Agency DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for recruitment & staffing agencies. Check whether your candidate sourcing, CV sharing, ATS access, background verification, client forwarding, WhatsApp/email workflows and rejected-candidate retention are DPDPA-ready.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function RecruitmentAssessmentPage() {
  return <RecruitmentAssessmentClient />;
}

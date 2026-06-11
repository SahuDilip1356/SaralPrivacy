import type { Metadata } from "next";
import TrainingAssessmentClient from "./TrainingAssessmentClient";

export const metadata: Metadata = {
  title: "Free Training Institute DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for training institutes and coaching centres. Check whether your student admissions, parental consent, minors' data, WhatsApp groups, LMS tools, student photos, attendance and placement workflows are DPDPA-ready.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function TrainingInstitutesAssessmentPage() {
  return <TrainingAssessmentClient />;
}

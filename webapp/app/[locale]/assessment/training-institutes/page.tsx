import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import TrainingAssessmentClient from "./TrainingAssessmentClient";

const title = "Free Training Institute DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for training institutes and coaching centres. Check whether your student admissions, parental consent, minors' data, WhatsApp groups, LMS tools, student photos, attendance and placement workflows are DPDPA-ready.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("training-institutes")] },
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function TrainingInstitutesAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <TrainingAssessmentClient />
    </Suspense>
  );
}


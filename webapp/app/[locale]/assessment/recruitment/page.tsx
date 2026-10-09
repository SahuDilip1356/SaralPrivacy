import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import RecruitmentAssessmentClient from "./RecruitmentAssessmentClient";

const title = "Free Recruitment Agency DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for recruitment & staffing agencies. Check whether your candidate sourcing, CV sharing, ATS access, background verification, client forwarding, WhatsApp/email workflows and rejected-candidate retention are DPDPA-ready.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("recruitment")] },
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function RecruitmentAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <RecruitmentAssessmentClient />
    </Suspense>
  );
}

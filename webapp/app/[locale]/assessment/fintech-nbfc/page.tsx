import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import FintechNbfcAssessmentClient from "./FintechNbfcAssessmentClient";

const title = "Fintech / NBFC DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for fintechs, NBFCs and digital payment businesses. Check whether your KYC, PAN/Aadhaar, bank and bureau data, UPI, profiling, DSAs, collection agents, vendor sharing and old customer records are DPDPA-ready. The scan collects no customer financial data.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("fintech-nbfc")] },
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function FintechNbfcAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <FintechNbfcAssessmentClient />
    </Suspense>
  );
}

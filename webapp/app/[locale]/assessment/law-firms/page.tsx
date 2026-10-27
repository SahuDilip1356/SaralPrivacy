import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import LawFirmAssessmentClient from "./LawFirmAssessmentClient";

const title = "Law Firm DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for law firms and legal consultants. Check whether your client KYC, case files, evidence records, affidavits, court filings, junior/intern access, cloud folders, vendor sharing and old matter-file retention are DPDPA-ready. The scan collects no client documents.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("law-firms")] },
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function LawFirmAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <LawFirmAssessmentClient />
    </Suspense>
  );
}

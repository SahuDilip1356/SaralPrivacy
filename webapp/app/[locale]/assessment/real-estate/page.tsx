import type { Metadata } from "next";
import { Suspense } from "react";
import RealEstateAssessmentClient from "./RealEstateAssessmentClient";

export const metadata: Metadata = {
  title: "Real Estate DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for real estate brokers and property firms. Check whether your buyer/tenant KYC, PAN/Aadhaar documents, rent/sale agreements, property papers, WhatsApp lead sharing, broker networks, loan partners and old client-data retention are DPDPA-ready. The scan collects no client documents.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function RealEstateAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <RealEstateAssessmentClient />
    </Suspense>
  );
}

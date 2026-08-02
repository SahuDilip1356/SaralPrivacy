import type { Metadata } from "next";
import { Suspense } from "react";
import HotelsTravelAssessmentClient from "./HotelsTravelAssessmentClient";

export const metadata: Metadata = {
  title: "Hotels & Travel DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for hotels, resorts, homestays and travel agencies. Check whether your guest IDs, passport copies, booking records, OTA sharing, WhatsApp confirmations, travel documents, CCTV, PMS access and old guest-record retention are DPDPA-ready. The scan collects no guest documents.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function HotelsTravelAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <HotelsTravelAssessmentClient />
    </Suspense>
  );
}

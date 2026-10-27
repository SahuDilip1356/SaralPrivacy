import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import HotelsTravelAssessmentClient from "./HotelsTravelAssessmentClient";

const title = "Hotels & Travel DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for hotels, resorts, homestays and travel agencies. Check whether your guest IDs, passport copies, booking records, OTA sharing, WhatsApp confirmations, travel documents, CCTV, PMS access and old guest-record retention are DPDPA-ready. The scan collects no guest documents.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("hotels-travel")] },
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

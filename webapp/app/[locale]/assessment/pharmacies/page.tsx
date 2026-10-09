import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import PharmaciesAssessmentClient from "./PharmaciesAssessmentClient";

const title = "Pharmacy DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for pharmacies and online pharmacies. Check whether your prescriptions, medicine history, health indicators, WhatsApp orders, refill reminders, delivery partners, billing software access and old prescription retention are DPDPA-ready. The scan collects no prescriptions or patient records.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("pharmacies")] },
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function PharmaciesAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <PharmaciesAssessmentClient />
    </Suspense>
  );
}

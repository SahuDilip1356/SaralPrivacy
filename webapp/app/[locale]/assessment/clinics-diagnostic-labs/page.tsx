import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import ClinicAssessmentClient from "./ClinicAssessmentClient";

const title = "Clinic & Diagnostic Lab DPDPA Risk Scan";
const description =
  "Free 3-minute DPDPA risk scan for clinics and diagnostic labs. Check whether your patient records, prescriptions, lab reports, WhatsApp report sharing, doctor referrals, home sample collection, lab software, staff access and old patient-data retention are DPDPA-ready. The scan collects no patient data.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("clinics-diagnostic-labs")] },
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function ClinicAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <ClinicAssessmentClient />
    </Suspense>
  );
}

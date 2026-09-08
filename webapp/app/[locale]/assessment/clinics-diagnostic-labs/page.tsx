import type { Metadata } from "next";
import { Suspense } from "react";
import ClinicAssessmentClient from "./ClinicAssessmentClient";

export const metadata: Metadata = {
  title: "Clinic & Diagnostic Lab DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for clinics and diagnostic labs. Check whether your patient records, prescriptions, lab reports, WhatsApp report sharing, doctor referrals, home sample collection, lab software, staff access and old patient-data retention are DPDPA-ready. The scan collects no patient data.",
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

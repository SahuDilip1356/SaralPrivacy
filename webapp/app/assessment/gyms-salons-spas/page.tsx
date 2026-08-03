import type { Metadata } from "next";
import { Suspense } from "react";
import GymsSalonsSpasAssessmentClient from "./GymsSalonsSpasAssessmentClient";

export const metadata: Metadata = {
  title: "Gym, Salon & Spa DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for gyms, salons and spas. Check whether your membership data, health/body details, customer photos, appointment apps, WhatsApp campaigns, staff access and old customer-record retention are DPDPA-ready. The scan collects no customer photos, health notes or records.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function GymsSalonsSpasAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <GymsSalonsSpasAssessmentClient />
    </Suspense>
  );
}

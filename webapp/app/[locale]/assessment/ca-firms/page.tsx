import type { Metadata } from "next";
import { Suspense } from "react";
import CAAssessmentClient from "./CAAssessmentClient";

export const metadata: Metadata = {
  title: "Free CA Firm DPDPA Risk Scan — 3-Minute Check",
  description:
    "Free 3-minute DPDPA risk scan for CA firms. Check whether your PAN, Aadhaar, ITR, bank statement, payroll, Google Drive, WhatsApp and staff-access practices are DPDPA-ready.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails. Safe here
// because this page is noindex - unlike the data-flow map itself, where the
// same hook would strip the journey out of the indexed HTML.
export default function CAFirmsAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <CAAssessmentClient />
    </Suspense>
  );
}

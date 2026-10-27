import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import CAAssessmentClient from "./CAAssessmentClient";

const title = "Free CA Firm DPDPA Risk Scan — 3-Minute Check";
const description =
  "Free 3-minute DPDPA risk scan for CA firms. Check whether your PAN, Aadhaar, ITR, bank statement, payroll, Google Drive, WhatsApp and staff-access practices are DPDPA-ready.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("ca-firms")] },
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

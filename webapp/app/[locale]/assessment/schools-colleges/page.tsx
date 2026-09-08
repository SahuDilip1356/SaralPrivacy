import type { Metadata } from "next";
import { Suspense } from "react";
import SchoolAssessmentClient from "./SchoolAssessmentClient";

export const metadata: Metadata = {
  title: "School & College DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for schools and colleges. Check whether your children's data, parent records, admission forms, school apps, CCTV, attendance, transport data, student photos, fee records and vendor platforms are DPDPA-ready. The scan collects no student data.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// `useSearchParams` in the client (the ?bucket= deep-link from the Data Flow
// Map hotspots) requires a Suspense boundary, or `next build` fails.
export default function SchoolAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <SchoolAssessmentClient />
    </Suspense>
  );
}

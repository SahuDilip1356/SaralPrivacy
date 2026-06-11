import type { Metadata } from "next";
import CAAssessmentClient from "./CAAssessmentClient";

export const metadata: Metadata = {
  title: "Free CA Firm DPDPA Risk Scan — 3-Minute Check",
  description:
    "Free 3-minute DPDPA risk scan for CA firms. Check whether your PAN, Aadhaar, ITR, bank statement, payroll, Google Drive, WhatsApp and staff-access practices are DPDPA-ready.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function CAFirmsAssessmentPage() {
  return <CAAssessmentClient />;
}

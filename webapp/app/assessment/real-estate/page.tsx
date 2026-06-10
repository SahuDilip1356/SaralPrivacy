import type { Metadata } from "next";
import RealEstateAssessmentClient from "./RealEstateAssessmentClient";

export const metadata: Metadata = {
  title: "Real Estate DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for real estate brokers and property firms. Check whether your buyer/tenant KYC, PAN/Aadhaar documents, rent/sale agreements, property papers, WhatsApp lead sharing, broker networks, loan partners and old client-data retention are DPDPA-ready. The scan collects no client documents.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function RealEstateAssessmentPage() {
  return <RealEstateAssessmentClient />;
}

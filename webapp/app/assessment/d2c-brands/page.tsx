import type { Metadata } from "next";
import D2CAssessmentClient from "./D2CAssessmentClient";

export const metadata: Metadata = {
  title: "D2C Brand DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for D2C and e-commerce brands. Check whether your marketing consent, WhatsApp/SMS/email opt-in, Meta Pixel and tracking, cart-abandonment and lifecycle flows, vendor sharing, store-admin access and customer-data retention are DPDPA-ready.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function D2CAssessmentPage() {
  return <D2CAssessmentClient />;
}

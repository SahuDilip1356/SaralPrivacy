import type { Metadata } from "next";
import { Suspense } from "react";
import D2CAssessmentClient from "./D2CAssessmentClient";

export const metadata: Metadata = {
  title: "Free D2C Brand DPDPA Risk Scan — 3 Minutes",
  description:
    "Free 3-minute DPDPA risk scan for D2C and e-commerce brands. Check whether your marketing consent, WhatsApp/SMS/email opt-in, Meta Pixel and tracking, cart-abandonment and lifecycle flows, vendor sharing, store-admin access and customer-data retention are DPDPA-ready.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function D2CAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <D2CAssessmentClient />
    </Suspense>
  );
}

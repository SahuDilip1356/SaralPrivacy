import type { Metadata } from "next";
import { OG_BASE, scanCardImage } from "@/lib/data/result-share";
import { Suspense } from "react";
import D2CAssessmentClient from "./D2CAssessmentClient";

const title = "Free D2C Brand DPDPA Risk Scan — 3 Minutes";
const description =
  "Free 3-minute DPDPA risk scan for D2C and e-commerce brands. Check whether your marketing consent, WhatsApp/SMS/email opt-in, Meta Pixel and tracking, cart-abandonment and lifecycle flows, vendor sharing, store-admin access and customer-data retention are DPDPA-ready.";

export const metadata: Metadata = {
  title,
  description,
  // The WhatsApp preview: own title/description + this sector's card.
  // Next replaces a parent openGraph wholesale, so OG_BASE restates the rest.
  openGraph: { ...OG_BASE, title, description, images: [scanCardImage("d2c-brands")] },
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

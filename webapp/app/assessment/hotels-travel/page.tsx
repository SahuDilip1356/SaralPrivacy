import type { Metadata } from "next";
import HotelsTravelAssessmentClient from "./HotelsTravelAssessmentClient";

export const metadata: Metadata = {
  title: "Hotels & Travel DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for hotels, resorts, homestays and travel agencies. Check whether your guest IDs, passport copies, booking records, OTA sharing, WhatsApp confirmations, travel documents, CCTV, PMS access and old guest-record retention are DPDPA-ready. The scan collects no guest documents.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function HotelsTravelAssessmentPage() {
  return <HotelsTravelAssessmentClient />;
}

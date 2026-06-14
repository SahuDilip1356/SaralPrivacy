import type { Metadata } from "next";
import PharmaciesAssessmentClient from "./PharmaciesAssessmentClient";

export const metadata: Metadata = {
  title: "Pharmacy DPDPA Risk Scan",
  description:
    "Free 3-minute DPDPA risk scan for pharmacies and online pharmacies. Check whether your prescriptions, medicine history, health indicators, WhatsApp orders, refill reminders, delivery partners, billing software access and old prescription retention are DPDPA-ready. The scan collects no prescriptions or patient records.",
  alternates: { canonical: "https://saralprivacy.com/assessment" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PharmaciesAssessmentPage() {
  return <PharmaciesAssessmentClient />;
}

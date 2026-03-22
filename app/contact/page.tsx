import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Book a Free DPDPA Consultation",
  description:
    "Request a free 30-minute DPDPA consultation with the SaralPrivacy advisory team. We respond within one business day.",
  alternates: { canonical: 'https://saralprivacy.com/contact' },
};

export default function ContactPage() {
  return <ContactContent />;
}

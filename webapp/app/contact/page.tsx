import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Get Consultation — SaralPrivacy",
  description:
    "Book a free DPDPA compliance consultation with SaralPrivacy. We help Indian businesses understand their obligations under the Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "https://saralprivacy.com/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}

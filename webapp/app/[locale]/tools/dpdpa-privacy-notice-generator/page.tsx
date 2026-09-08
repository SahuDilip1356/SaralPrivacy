import type { Metadata } from "next";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import NoticePackClient from "./NoticePackClient";
import "./notice-pack.css";

const URL = "https://saralprivacy.com/tools/dpdpa-privacy-notice-generator";

export const metadata: Metadata = {
  title: "Free DPDPA Privacy Notice Generator for Indian Businesses | SaralPrivacy",
  description:
    "Generate a DPDPA-ready Privacy Notice Pack for your Indian business — full privacy notice, form mini-notices, consent text, a rights block and an evidence record. Pick your sector, preview free, export with email.",
  alternates: { canonical: URL },
  openGraph: {
    title: "DPDPA Privacy Notice Pack Builder — SaralPrivacy",
    description:
      "Answer a few simple questions and get a practical DPDPA Notice Pack: full notice, form notices, consent checkbox text, rights block and evidence record — built for Indian SMBs.",
    url: URL,
    type: "website",
  },
};

const NOTICE_FAQS = [
  {
    question: "What is a DPDPA privacy notice?",
    answer:
      "Under Section 5 of India's Digital Personal Data Protection Act, 2023, a business must give people a clear notice — before or when it collects their personal data — stating what data is collected, the purpose, how to exercise their rights, and how to complain to the Data Protection Board. This tool assembles that notice from a few plain questions about your business.",
  },
  {
    question: "Is the generated notice legally compliant?",
    answer:
      "No tool can guarantee compliance. This builder generates a practical, DPDPA-ready draft based on your inputs, built around the Act's notice requirements. It is not legal advice — review it before publishing, and have it checked for your specific business where needed.",
  },
  {
    question: "What is in the Notice Pack?",
    answer:
      "More than one document: a full privacy notice, short contextual mini-notices for each place you collect data (forms, WhatsApp, checkout, appointments), consent checkbox text (service, marketing and parental), a vendor-sharing clause, a data-rights/DSAR block, and an evidence record. Preview is free; export requires an email.",
  },
  {
    question: "Do you store the data I enter?",
    answer:
      "The tool works from category selections, not your customers' actual records. Do not paste real Aadhaar, PAN, health or customer data into it — it is not needed and should not be stored.",
  },
];

export default function NoticePackPage() {
  return (
    <div className="npb" id="top">
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Privacy Notice Generator", url: URL },
      ])}
      {faqPageSchema(NOTICE_FAQS, { url: URL })}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "DPDPA Privacy Notice Pack Builder",
            url: URL,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            description:
              "Free tool that generates a DPDPA-ready Privacy Notice Pack — full notice, mini-notices, consent text, rights block and evidence record — for Indian SMBs across 12 sectors.",
            provider: { "@type": "Organization", name: "SaralPrivacy", url: "https://saralprivacy.com" },
          }),
        }}
      />
      <NoticePackClient />
    </div>
  );
}

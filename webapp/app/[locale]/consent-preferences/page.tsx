import type { Metadata } from "next";
import ConsentPreferencesContent from "./ConsentPreferencesContent";

// Utility page — not a search-valuable destination.
// noindex prevents it appearing in SERPs and being treated as
// a canonical answer page by crawlers or AI systems.
export const metadata: Metadata = {
  title: "Manage Your Consent and Email Preferences",
  description: "Manage your SaralPrivacy consent and communication preferences.",
  alternates: { canonical: "https://saralprivacy.com/consent-preferences" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ConsentPreferencesPage() {
  return <ConsentPreferencesContent />;
}

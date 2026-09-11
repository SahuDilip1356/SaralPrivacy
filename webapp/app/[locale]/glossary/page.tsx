import type { Metadata } from "next";
import GlossaryClient from "@/components/glossary/GlossaryClient";
import { TERMS } from "@/components/glossary/glossaryData";

const BASE = "https://saralprivacy.com";

export const metadata: Metadata = {
  title: "DPDPA Glossary: 50+ Key Terms",
  description:
    "Plain-language definitions for 50+ key terms from the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 — with exact section numbers and statutory references.",
  alternates: { canonical: `${BASE}/glossary` },
  openGraph: {
    title: "DPDPA Glossary: 50+ Key Terms | SaralPrivacy",
    description:
      "Definitions for 50+ key DPDPA terms with section references — Data Principal, Data Fiduciary, Consent, Deemed Consent, Penalty Schedule, and more.",
    url: `${BASE}/glossary`,
  },
};

const definedTermSetSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "DPDPA Glossary — Digital Personal Data Protection Act, 2023",
  description:
    "Key terms from the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 with section references.",
  url: `${BASE}/glossary`,
  hasDefinedTerm: TERMS.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.definition,
    termCode: t.section,
    url: `${BASE}/glossary#${t.id}`,
    inDefinedTermSet: `${BASE}/glossary`,
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",     item: BASE },
    { "@type": "ListItem", position: 2, name: "Glossary", item: `${BASE}/glossary` },
  ],
};

export default function GlossaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <GlossaryClient />
    </>
  );
}

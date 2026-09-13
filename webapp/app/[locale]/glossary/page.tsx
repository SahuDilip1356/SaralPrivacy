import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import GlossaryClient from "@/components/glossary/GlossaryClient";
import { getGlossaryContent } from "@/lib/i18n/content";

const BASE = "https://saralprivacy.com";

const metadata: Metadata = {
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

interface Props {
  params: Promise<{ locale: string }>;
}

// English metadata is the object above, untouched. Other locales swap only the
// title and description — canonical/alternates stay as they are (lighting
// hreflang is a separate SEO decision).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "en") return metadata;
  const t = await getTranslations({ locale, namespace: "glossaryPage" });
  return { ...metadata, title: t("metaTitle"), description: t("metaDescription") };
}

export default async function GlossaryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("glossaryPage");
  // Localized on the server; GlossaryClient receives it as props (spec §4.3).
  const { terms, categories } = await getGlossaryContent(locale);
  const en = locale === "en";

  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: en ? "DPDPA Glossary — Digital Personal Data Protection Act, 2023" : t("schemaName"),
    description: en
      ? "Key terms from the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 with section references."
      : t("schemaDescription"),
    ...(locale === "hi" ? { inLanguage: "hi-IN" } : {}),
    url: `${BASE}/glossary`,
    hasDefinedTerm: terms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.definition,
      termCode: term.section,
      url: `${BASE}/glossary#${term.id}`,
      inDefinedTermSet: `${BASE}/glossary`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: en ? "Home" : t("home"),           item: BASE },
      { "@type": "ListItem", position: 2, name: en ? "Glossary" : t("breadcrumb"), item: `${BASE}/glossary` },
    ],
  };

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
      <GlossaryClient terms={terms} categories={categories} />
    </>
  );
}

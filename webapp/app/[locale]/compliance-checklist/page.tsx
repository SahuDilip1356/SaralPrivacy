import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { breadcrumbSchema, articleSchema } from "@/lib/schema";
import { getChecklistContent } from "@/lib/i18n/content";
import ChecklistContent from "./ChecklistContent";

const metadata: Metadata = {
  title: "DPDPA Compliance Checklist — Statutory & Operational Controls",
  description:
    "Complete DPDPA compliance checklist for Indian businesses — 90 controls across statutory obligations (Act 2023), rule requirements (Rules 2025), and operational evidence. Free, fully indexed.",
  alternates: { canonical: "https://saralprivacy.com/compliance-checklist" },
  openGraph: {
    title: "DPDPA Compliance Checklist | SaralPrivacy",
    description:
      "90 compliance controls covering applicability, consent, notice, rights, breach, penalties, SDF obligations, and operational evidence. Based on DPDPA Act 2023 + DPDP Rules 2025.",
    url: "https://saralprivacy.com/compliance-checklist",
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
  const t = await getTranslations({ locale, namespace: "checklistPage" });
  return { ...metadata, title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ComplianceChecklistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checklistPage");
  const en = locale === "en";
  // Localized on the server; ChecklistContent receives it as props (spec §4.3).
  const checklist = await getChecklistContent(locale);

  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "DPDPA Guide", url: "https://saralprivacy.com/learn" },
        {
          name: "Compliance Checklist",
          url: "https://saralprivacy.com/compliance-checklist",
        },
      ])}
      {en
        ? articleSchema(
            "DPDPA Compliance Checklist — Statutory & Operational Controls",
            "Complete DPDPA compliance checklist for Indian businesses. 90 controls across 27 sections covering statutory obligations from DPDPA Act 2023 and operational evidence requirements from DPDP Rules 2025.",
            "https://saralprivacy.com/compliance-checklist",
            "2025-11-14",
            "2026-04-01"
          )
        : articleSchema(
            t("metaTitle"),
            t("schemaDescription"),
            "https://saralprivacy.com/compliance-checklist",
            "2025-11-14",
            "2026-04-01",
            locale === "hi" ? { inLanguage: "hi-IN" } : {}
          )}

      {/* SEO-crawlable summary for AI and search engines */}
      <div className="sr-only">
        <h1>{t("srTitle")}</h1>
        <p>{t("srSummary")}</p>
      </div>

      <ChecklistContent {...checklist} />
    </>
  );
}

import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ResourceTemplateGate from "@/components/ResourceTemplateGate";
import { getResourceTemplates } from "@/lib/i18n/content";

const metadata: Metadata = {
  title: "Free DPDPA Templates | SaralPrivacy",
  description:
    "Download free DPDPA-aligned templates — Privacy Notice, Data Inventory Register, Consent Language, DSR SOP, and Vendor Register. Instantly usable for Indian businesses.",
  alternates: { canonical: "https://saralprivacy.com/resources" },
  openGraph: {
    title: "Free DPDPA Compliance Templates | SaralPrivacy",
    description:
      "5 ready-to-use DPDPA templates for Indian businesses. Tell us about your business once and download all 5 instantly.",
    url: "https://saralprivacy.com/resources",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SaralPrivacy — DPDPA Compliance" }],
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
  const t = await getTranslations({ locale, namespace: "resourcesPage" });
  // The string already carries the brand, so bypass the layout's
  // "%s | SaralPrivacy" template (the English title gets the suffix twice —
  // a pre-existing quirk left untouched here, English stays byte-identical).
  return { ...metadata, title: { absolute: t("metaTitle") }, description: t("metaDescription") };
}

// Trust-strip labels live under resourcesPage.trust.<key>.
const TRUST_KEYS = ["free", "noAccount", "aligned", "instant"] as const;

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("resourcesPage");
  // Template titles/descriptions localized on the server (the English title
  // stays the lead payload's templateName — see lib/data/resource-templates.ts).
  const templates = await getResourceTemplates(locale);
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold text-[#B45309] uppercase tracking-widest mb-2">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold text-[#1E3A5F] mb-3">
            {t("title")}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
            {t("intro")}
          </p>
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          {TRUST_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-green-500 font-bold">✓</span>
              {t(`trust.${key}`)}
            </div>
          ))}
        </div>

        {/* Templates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            {t("availableTemplates")}
          </h2>
          <ResourceTemplateGate templates={templates} />
        </div>

        {/* White paper */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            {t("guidesReports")}
          </h2>
          <a
            href="https://saralprivacy.com/white-paper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#1E3A5F]/30 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1E3A5F]">
                  {t("guideTitle")}
                </p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {t("guideTag")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t("guideDesc")}
              </p>
            </div>
            <span className="text-[#E07B39] font-bold text-sm ml-4 flex-shrink-0">↓</span>
          </a>
        </div>

        {/* Assessment CTA */}
        <div className="bg-[#1E3A5F] rounded-2xl p-6 text-center">
          <h2 className="text-base font-semibold text-white mb-1">
            {t("notSure")}
          </h2>
          <p className="text-sm text-white/70 mb-4">
            {t("notSureBody")}
          </p>
          <a
            href="/assessment"
            className="inline-block bg-[#92400E] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#7C2D12] transition-colors"
          >
            {t("takeAssessment")}
          </a>
        </div>

      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, FileText, Shield, Users, AlertTriangle, Database, Globe, HelpCircle, Scale, ClipboardList, FileSearch, CheckSquare } from "lucide-react";

// ─── Reading guide data ───────────────────────────────────────────────────────

// Display strings live in the catalog under learn.hub.* — these arrays keep
// only stable keys, hrefs and icons (MULTILINGUAL_SPEC §4.3A).
const learningPath = [
  { key: "whatIsDpdpa",   href: "/learn/what-is-dpdpa" },
  { key: "applicability", href: "/learn/applicability" },
  { key: "keyTerms",      href: "/learn/key-terms" },
  { key: "consent",       href: "/learn/consent" },
  { key: "rights",        href: "/learn/rights" },
  { key: "duties",        href: "/learn/duties" },
];

const referenceDocuments = [
  { key: "act",       href: "/learn/dpdp-act-2023",                       icon: Scale },
  { key: "rules",     href: "/learn/dpdp-rules-2025-plain-english-guide", icon: FileText },
  { key: "penalties", href: "/penalty-calculator",                        icon: AlertTriangle },
  { key: "glossary",  href: "/glossary",                                  icon: BookOpen },
];

const complianceTools = [
  { key: "checklist",  href: "/compliance-checklist", icon: ClipboardList },
  { key: "assessment", href: "/assessment",           icon: FileSearch },
  { key: "whitePaper", href: "/white-paper",          icon: CheckSquare },
];

export const metadata: Metadata = {
  title: "DPDPA Learning Hub — Complete Guide",
  description:
    "Comprehensive DPDPA learning hub for Indian businesses. What is DPDPA, who it applies to, key terms, consent, rights, breach notification, and more.",
  alternates: { canonical: 'https://saralprivacy.com/learn' },
};

// Titles, descriptions, time and tag strings live under learn.hub.topics.<key>.
const learnTopics = [
  { key: "act", icon: Scale, href: "/learn/dpdp-act-2023", tagColor: "bg-navy-100 text-navy-700" },
  { key: "rules", icon: FileText, href: "/learn/dpdp-rules-2025-plain-english-guide", tagColor: "bg-navy-100 text-navy-700" },
  { key: "what-is-dpdpa", icon: BookOpen, href: "/learn/what-is-dpdpa", tagColor: "bg-green-100 text-green-800" },
  { key: "applicability", icon: Users, href: "/learn/applicability", tagColor: "bg-amber-100 text-amber-700" },
  { key: "key-terms", icon: FileText, href: "/learn/key-terms", tagColor: "bg-slate-100 text-slate-600" },
  { key: "consent", icon: Shield, href: "/learn/consent", tagColor: "bg-red-100 text-red-700" },
  { key: "notice", icon: FileText, href: "/learn/notice", tagColor: "bg-red-100 text-red-700" },
  { key: "rights", icon: Users, href: "/learn/rights", tagColor: "bg-amber-100 text-amber-700" },
  { key: "duties", icon: Shield, href: "/learn/duties", tagColor: "bg-amber-100 text-amber-700" },
  { key: "childrens-data", icon: Users, href: "/learn/childrens-data", tagColor: "bg-indigo-100 text-indigo-700" },
  { key: "data-breach", icon: AlertTriangle, href: "/learn/data-breach", tagColor: "bg-red-100 text-red-700" },
  { key: "retention", icon: Database, href: "/learn/retention", tagColor: "bg-green-100 text-green-800" },
  { key: "cross-border", icon: Globe, href: "/learn/cross-border", tagColor: "bg-slate-100 text-slate-600" },
  { key: "myths", icon: HelpCircle, href: "/learn/myths", tagColor: "bg-purple-100 text-purple-700" },
  { key: "penalties", icon: AlertTriangle, href: "/penalty-calculator", tagColor: "bg-amber-100 text-amber-700" },
  { key: "glossary", icon: BookOpen, href: "/glossary", tagColor: "bg-blue-100 text-blue-700" },
  { key: "checklist", icon: ClipboardList, href: "/compliance-checklist", tagColor: "bg-teal-100 text-teal-800" },
];

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn.hub");
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-700/40 border border-green-500/50 rounded-full px-3.5 py-1.5 mb-4">
              <BookOpen size={12} className="text-green-300" />
              <span className="text-green-300 text-xs font-semibold">{t("badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
              {t("title")}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">{t("intro")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Reading guide — two rows */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-10 space-y-4">

          {/* Row 1 — Beginner learning path */}
          <div>
            <h2 className="font-semibold text-navy-700 text-sm mb-2.5">
              {t("startHere")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {learningPath.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs text-green-700 bg-white border border-green-200 rounded-full px-2.5 py-1 hover:border-green-400 hover:shadow-sm transition-all"
                >
                  <span className="font-bold">{i + 1}.</span>
                  {t(`path.${item.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-green-200" />

          {/* Row 2 — Key reference documents */}
          <div>
            <h2 className="font-semibold text-navy-700 text-sm mb-2.5">
              {t("keyReferenceDocs")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {referenceDocuments.map(({ key, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 text-xs text-navy-700 bg-white border border-navy-300 rounded-full px-3 py-1 hover:bg-navy-50 hover:border-navy-500 hover:shadow-sm transition-all"
                >
                  <Icon size={11} className="text-navy-500 shrink-0" />
                  {t(`refs.${key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-green-200" />

          {/* Row 3 — Compliance tools */}
          <div>
            <h2 className="font-semibold text-navy-700 text-sm mb-2.5">
              {t("complianceTools")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {complianceTools.map(({ key, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-800 bg-white border border-teal-300 rounded-full px-3 py-1 hover:bg-teal-50 hover:border-teal-500 hover:shadow-sm transition-all"
                >
                  <Icon size={11} className="text-teal-500 shrink-0" />
                  {t(`tools.${key}`)}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Topics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {learnTopics.map(({ key, icon: Icon, href, tagColor }) => (
            <Link key={href} href={href}>
              <div className="bg-white rounded-xl border border-slate-200 p-6 h-full hover:border-green-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon size={18} className="text-slate-600" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
                    {t(`topics.${key}.tag`)}
                  </span>
                </div>
                <h3 className="font-semibold text-navy-700 text-base mb-2 group-hover:text-green-900 transition-colors">
                  {t(`topics.${key}.title`)}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  {t(`topics.${key}.description`)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    {t("readTime", { time: t(`topics.${key}.time`) })}
                  </span>
                  <span className="text-green-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t("read")} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

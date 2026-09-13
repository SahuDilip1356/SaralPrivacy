"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search } from "lucide-react";
import type { FAQItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssessmentCTA } from "@/components/cta/AssessmentCTA";
import { TemplatesCTA } from "@/components/cta/TemplatesCTA";

// FAQ data arrives already localized from the server page (spec §4.3 bundle
// law): this client component never imports lib/data/faqs or an overlay.
export default function FAQContent({
  faqs,
  categories: faqCategories,
}: {
  faqs: FAQItem[];
  categories: { id: string; label: string }[];
}) {
  const t = useTranslations("faqPage");
  const tl = useTranslations("learn.topic");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    const matchSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-cloud-50">
      {/* Header */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            {t("intro")}
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
              activeCategory === "all"
                ? "bg-navy-700 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            )}
          >
            {t("all")} ({faqs.length})
          </button>
          {faqCategories.map((cat) => {
            const count = faqs.filter((f) => f.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  activeCategory === cat.id
                    ? "bg-navy-700 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                )}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* FAQ items — data-nosnippet prevents search engines extracting snippet text
            from this accordion; the SSR answer blocks in page.tsx are the crawlable source */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {t("noResults")}
          </div>
        ) : (
          <div className="space-y-3" data-nosnippet>
            {filtered.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-cloud-50 transition-colors"
                >
                  <span className="font-semibold text-navy-700 text-sm leading-snug pr-2">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-slate-400 shrink-0 transition-transform duration-200 mt-0.5",
                      openId === faq.id && "rotate-180"
                    )}
                  />
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contextual CTAs — Assessment + Templates for high-intent FAQ readers */}
        <div className="mt-10 space-y-4">
          <AssessmentCTA variant="compact" />
          <TemplatesCTA variant="compact" />
        </div>

        {/* CTA */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-navy-700 text-lg mb-2">
            {t("stillQuestions")}
          </h3>
          <p className="text-slate-600 text-sm mb-4">
            {t("advisoryLine")}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white font-semibold rounded-lg text-sm hover:bg-green-800 transition-colors"
          >
            {t("contactUs")}
          </a>
        </div>

        {/* Legal */}
        <div data-nosnippet className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <p><strong>{tl("legalBaselineLabel")}</strong> {tl("legalBaselineText")}</p>
          <p>{tl("educationalLine")}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { faqs, faqCategories } from "@/lib/data/faqs";
import { cn } from "@/lib/utils";

export default function FAQContent() {
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-brand-700 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            Plain-English answers to the most common questions Indian businesses ask about DPDPA.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Answer box */}
        <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4 mb-8">
          <p className="text-slate-700 text-sm leading-relaxed">These are the questions Indian businesses ask when the law stops being abstract and starts touching forms, CRMs, websites, payroll files, WhatsApp campaigns, and vendor contracts. The DPDP Rules, 2025 have been notified, so the useful question is no longer &apos;Is this coming?&apos; but &apos;What do I need to fix first?&apos; Start here for clear answers without legal theatre.</p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
              activeCategory === "all"
                ? "bg-brand-700 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            )}
          >
            All ({faqs.length})
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
                    ? "bg-brand-700 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                )}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* FAQ items */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No results found. Try a different search or category.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-brand-700 text-sm leading-snug pr-2">
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

        {/* CTA */}
        <div className="mt-10 bg-saffron-50 border border-saffron-200 rounded-xl p-6 text-center">
          <h3 className="font-bold text-brand-700 text-lg mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-600 text-sm mb-4">
            Our advisory team can answer questions specific to your business and data practices.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-saffron-500 text-white font-semibold rounded-lg text-sm hover:bg-saffron-600 transition-colors"
          >
            Contact Us
          </a>
        </div>

        {/* Last reviewed */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { faqs } from "@/lib/data/faqs";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/Surface";

export function FAQPreview() {
  const [openId, setOpenId] = useState<string | null>("f001");
  const previewFaqs = faqs.slice(0, 5);

  return (
    <section className="py-20 bg-cloud-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-navy-700 mb-3">
            Frequently asked questions
          </h2>
          <p className="text-slate-600">
            Quick answers to the questions Indian business owners ask most about DPDPA.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {previewFaqs.map((faq) => (
            <Surface
              rung="card"
              key={faq.id}
              className="overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-navy-700 text-sm leading-snug">
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
            </Surface>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors text-sm"
          >
            Browse all {faqs.length} FAQs
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

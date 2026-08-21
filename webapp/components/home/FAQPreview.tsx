"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { faqs, getHomepageFaqs } from "@/lib/data/faqs";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/Surface";
import { Section, Eyebrow } from "@/components/ui/Section";

// S9 — the objection FAQ, and the last thing before the close.
//
// It used to render faqs.slice(0, 5) — "What is the DPDPA?", "What counts as
// personal data?" — which is a fine reference set and the wrong job here. A
// visitor this far down has decided DPDPA matters; what stops them clicking is
// how long it takes, whether we want their email, whether we keep their
// answers, and whether the result is worth anything. Those are the questions.
//
// The full library still lives at /faq. See `homepageFaqIds`.

export function FAQPreview() {
  const homepageFaqs = getHomepageFaqs();
  const [openId, setOpenId] = useState<string | null>(homepageFaqs[0]?.id ?? null);

  return (
    <Section surface="deep" type="evidence" width="narrow" divider>
      <div className="text-center mb-9">
        <Eyebrow surface="deep" className="mb-3">
          Before you start
        </Eyebrow>
        <h2 className="type-display-3 text-navy-700 mb-4">
          The questions people ask first
        </h2>
        <p className="text-slate-600">
          What it takes, what you get, and what happens to your answers.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {homepageFaqs.map((faq) => {
          const open = openId === faq.id;
          return (
            <Surface rung="card" onDeep key={faq.id} className="overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : faq.id)}
                aria-expanded={open}
                className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-cloud-50 transition-colors"
              >
                <span className="font-semibold text-navy-700 text-sm leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-slate-600 shrink-0 transition-transform duration-200 mt-0.5",
                    open && "rotate-180",
                  )}
                />
              </button>
              {/* Always in the DOM, toggled with `hidden` — collapsed answers
                  used to be conditionally rendered, which meant AI crawlers and
                  anything else that reads raw HTML without running JS saw eight
                  questions and one answer. The content is the point of an
                  objection FAQ; it has to be in the server HTML. */}
              <div hidden={!open} className="px-5 pb-5 border-t border-cloud-200">
                <p className="text-slate-600 text-sm leading-relaxed pt-4">{faq.answer}</p>
              </div>
            </Surface>
          );
        })}
      </div>

      {/* A link, not a button. The one filled action in this stretch of the
          page is the assessment band immediately below. */}
      <div className="text-center">
        <Link
          href="/faq"
          className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-semibold text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800 transition-colors"
        >
          Browse all {faqs.length} FAQs
          <ArrowRight size={15} />
        </Link>
      </div>
    </Section>
  );
}

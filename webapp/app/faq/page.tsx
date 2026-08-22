import type { Metadata } from "next";
import { faqs } from "@/lib/data/faqs";
import { faqPageSchema, speakableSchema } from "@/lib/schema";
import FAQContent from "./FAQContent";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";

export const metadata: Metadata = {
  title: "DPDPA FAQ: Common Questions Answered",
  description:
    "Clear answers to common DPDPA questions on applicability, consent, rights, penalties, children's data, cross-border transfers, and compliance priorities.",
  alternates: { canonical: 'https://saralprivacy.com/faq' },
};

// All 15 FAQs rendered as server HTML so Google and AI crawlers can index every answer.
// The client-side FAQContent accordion handles interactivity; these blocks are the
// crawlable ground truth that snippet extraction and FAQPage schema are anchored to.
const KEY_FAQS = [
  "f001", "f002", "f003", "f004", "f005",
  "f006", "f007", "f008", "f009", "f010",
  "f011", "f012", "f013", "f014", "f015",
];

export default function FAQPage() {
  const keyFaqs = faqs.filter((f) => KEY_FAQS.includes(f.id));

  return (
    <>
      {faqPageSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })), {
        url: 'https://saralprivacy.com/faq',
        dateModified: toISODate(FRESHNESS.faq),
      })}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com/faq', 'DPDPA FAQ: Common Questions Answered')}

      {/* Interactive section: hero (H1 first in DOM), search, filters, accordion */}
      <FAQContent />

      {/* ── SSR answer stack ──────────────────────────────────────────────────────
          Rendered BELOW the H1 so Google and AI crawlers see: heading → answers.
          Visible to all users as a complete reference below the interactive accordion.
          The accordion above has data-nosnippet; these blocks are the crawlable source. */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="border-t-2 border-slate-200 pt-8 mb-6">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-4">Complete Answer Reference</p>
          <Byline lastReviewed={FRESHNESS.faq} className="mb-4" />
          <AnswerBlock
            answer="These are the DPDPA questions Indian businesses ask when privacy stops being theory and starts affecting forms, marketing, payroll, candidate files, student records, and customer data. The DPDP Rules, 2025 have been notified, so the useful question is no longer whether the law is coming, but what you need to fix first. Start here for clear, practical answers."
            className="mb-6"
          />
        </div>
        <div className="space-y-4">
          {keyFaqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold text-navy-700 text-sm mb-2">{faq.question}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

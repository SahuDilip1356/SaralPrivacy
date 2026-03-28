import type { Metadata } from "next";
import { faqs } from "@/lib/data/faqs";
import { faqPageSchema } from "@/lib/schema";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "DPDPA FAQ for Indian Businesses",
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
      {faqPageSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))}
      {/* Static SSR answer blocks — ensures Google indexes answer text */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
        {keyFaqs.map((faq) => (
          <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-brand-700 text-sm mb-2">{faq.question}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
      <FAQContent />
    </>
  );
}

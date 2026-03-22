import type { Metadata } from "next";
import { faqs } from "@/lib/data/faqs";
import { faqPageSchema } from "@/lib/schema";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "DPDPA FAQ — Common Questions Answered",
  description:
    "Plain-English answers to the most common questions Indian businesses ask about DPDPA — applicability, consent, rights, penalties, and more.",
  alternates: { canonical: 'https://saralprivacy.com/faq' },
};

export default function FAQPage() {
  return (
    <>
      {faqPageSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))}
      <FAQContent />
    </>
  );
}

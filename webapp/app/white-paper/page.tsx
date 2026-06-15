import type { Metadata } from "next";
import WhitePaperContent from "./WhitePaperContent";
import { articleSchema } from "@/lib/schema";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { READING_LANGS } from "@/lib/data/guide-languages";

const BASE = "https://saralprivacy.com";

// hreflang: the English hub is x-default; each published reading page maps to
// its locale via the static HTML URL.
const languageAlternates: Record<string, string> = { "x-default": `${BASE}/white-paper` };
for (const l of READING_LANGS) languageAlternates[l.locale] = `${BASE}${l.htmlUrl}`;

export const metadata: Metadata = {
  title: "Free DPDPA Guide for Indian Businesses",
  description:
    "Download the practical DPDPA guide updated for the DPDP Rules, 2025, with sector guidance, obligations, risks, and a 90-day action plan — now in 7 Indian languages.",
  alternates: { canonical: `${BASE}/white-paper`, languages: languageAlternates },
};

export default function WhitePaperPage() {
  return (
    <>
      {articleSchema(
        "DPDPA Guide — Practical Compliance Guide for Indian Businesses",
        "Free guide covering DPDPA obligations, sector risks, consent framework, rights handling, breach response, and a 90-day action plan. Updated for the DPDP Rules, 2025. Available in 7 Indian languages.",
        "https://saralprivacy.com/white-paper",
        "2025-11-14",
        "2026-03-29",
      )}
      {/* Server-rendered summary — ensures crawlers and AI systems can index
          what the Guide covers even though the download form is client-side. */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-slate-50 border-l-4 border-green-400 rounded-r-xl px-5 py-4 mb-6">
          <p className="text-slate-700 text-sm leading-relaxed">
            The SaralPrivacy DPDPA Guide covers India&apos;s Digital Personal Data Protection
            Act obligations for businesses — consent framework, data principal rights, breach
            notification timelines, sector-specific risks for recruitment agencies, CA firms,
            training institutes and D2C brands, vendor controls, and a structured 90-day compliance
            action plan. Updated for the DPDP Rules, 2025, and available in English, Hindi, Gujarati,
            Marathi, Kannada, Tamil, and Telugu.
          </p>
        </div>
      </div>
      <PressProofStrip />
      <WhitePaperContent />
    </>
  );
}

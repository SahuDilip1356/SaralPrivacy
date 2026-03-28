import type { Metadata } from "next";
import WhitePaperContent from "./WhitePaperContent";

export const metadata: Metadata = {
  title: "DPDPA White Paper Download",
  description:
    "Download the practical DPDPA white paper updated for the DPDP Rules, 2025, with sector guidance, obligations, risks, and a 30-day action plan.",
  alternates: { canonical: 'https://saralprivacy.com/white-paper' },
};

export default function WhitePaperPage() {
  return (
    <>
      {/* Server-rendered summary — ensures crawlers and AI systems can index
          what the white paper covers even though the download form is client-side. */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4 mb-6">
          <p className="text-slate-700 text-sm leading-relaxed">
            The SaralPrivacy DPDPA White Paper covers India&apos;s Digital Personal Data Protection
            Act obligations for businesses — consent framework, data principal rights, breach
            notification timelines, sector-specific risks for recruitment agencies, CA firms,
            training institutes and D2C brands, vendor controls, and a structured 30-day compliance
            action plan. Updated for the DPDP Rules, 2025.
          </p>
        </div>
      </div>
      <WhitePaperContent />
    </>
  );
}

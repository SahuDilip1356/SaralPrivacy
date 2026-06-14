import type { Metadata } from "next";
import WhitePaperContent from "./WhitePaperContent";
import { articleSchema } from "@/lib/schema";
import { PressProofStrip } from "@/components/ui/PressProofStrip";

export const metadata: Metadata = {
  title: "Free DPDPA White Paper for Indian Businesses",
  description:
    "Download the practical DPDPA white paper updated for the DPDP Rules, 2025, with sector guidance, obligations, risks, and a 30-day action plan.",
  alternates: { canonical: 'https://saralprivacy.com/white-paper' },
};

export default function WhitePaperPage() {
  return (
    <>
      {articleSchema(
        "DPDPA White Paper — Practical Compliance Guide for Indian Businesses",
        "Free 59-page white paper covering DPDPA obligations, sector risks, consent framework, rights handling, breach response, and a 90-day action plan. Updated for the DPDP Rules, 2025.",
        "https://saralprivacy.com/white-paper",
        "2025-11-14",
        "2026-03-29",
      )}
      {/* Server-rendered summary — ensures crawlers and AI systems can index
          what the white paper covers even though the download form is client-side. */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-slate-50 border-l-4 border-green-400 rounded-r-xl px-5 py-4 mb-6">
          <p className="text-slate-700 text-sm leading-relaxed">
            The SaralPrivacy DPDPA White Paper covers India&apos;s Digital Personal Data Protection
            Act obligations for businesses — consent framework, data principal rights, breach
            notification timelines, sector-specific risks for recruitment agencies, CA firms,
            training institutes and D2C brands, vendor controls, and a structured 30-day compliance
            action plan. Updated for the DPDP Rules, 2025.
          </p>
        </div>
      </div>
      <PressProofStrip />
      <WhitePaperContent />
    </>
  );
}

import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { AudienceCards } from "@/components/home/AudienceCards";
import { BriefingsSection } from "@/components/home/BriefingsSection";
import { AssessmentCTA } from "@/components/home/AssessmentCTA";
import { WhitePaperSection } from "@/components/home/WhitePaperSection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ConsultationCTA } from "@/components/home/ConsultationCTA";
import { organizationSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "DPDPA Compliance for Indian Businesses",
  description:
    "Practical DPDPA guidance for Indian businesses: assessments, industry guides, white paper, briefings, and advisory aligned to the DPDP Rules, 2025.",
  alternates: { canonical: 'https://saralprivacy.com' },
};

export default function HomePage() {
  return (
    <>
      {organizationSchema()}
      {websiteSchema()}
      <HeroSection />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4 mb-6">
          <p className="text-slate-700 text-sm leading-relaxed">DPDPA is India&apos;s framework for handling digital personal data, and the DPDP Rules, 2025 have now been notified. For Indian businesses, the real work is operational: fix your notices, consent flows, rights handling, retention logic, and vendor controls. SaralPrivacy helps you understand what matters, assess your risk, and prioritise the next 30 to 90 days.</p>
        </div>
      </div>
      <TrustStrip />
      <AudienceCards />
      <BriefingsSection />
      <AssessmentCTA />
      <WhitePaperSection />
      <FAQPreview />
      <NewsletterSection />
      <ConsultationCTA />
    </>
  );
}

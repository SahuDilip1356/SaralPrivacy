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
import { organizationSchema, websiteSchema, speakableSchema } from "@/lib/schema";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { PressProofStrip } from "@/components/ui/PressProofStrip";

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
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com', 'DPDPA Compliance for Indian Businesses')}
      <HeroSection />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnswerBlock
          question="What is DPDPA?"
          answer="DPDPA is India's framework for handling digital personal data, and the DPDP Rules, 2025 have now been notified. For Indian businesses, the real work is operational: fix your notices, consent flows, rights handling, retention logic, and vendor controls. SaralPrivacy helps you understand what matters, assess your risk, and prioritise the next 30 to 90 days."
          className="mb-6"
        />
      </div>
      <TrustStrip />
      <PressProofStrip />
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

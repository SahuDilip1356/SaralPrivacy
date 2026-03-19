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

export const metadata: Metadata = {
  title: "DPDPAIndia — DPDPA Compliance Made Practical for Indian Businesses",
  description:
    "India's leading DPDPA compliance intelligence platform. Daily briefings, free industry assessments, white paper, and expert consultation for recruitment agencies, CA firms, training institutes, and D2C brands.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
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

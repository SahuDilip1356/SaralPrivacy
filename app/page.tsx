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
  title: "SaralPrivacy — DPDPA Compliance Made Simple for Indian Businesses",
  description:
    "India's practical DPDPA compliance platform. Free readiness assessments, daily briefings, industry guides, and expert consultation for recruitment agencies, CA firms, training institutes, and D2C brands.",
  alternates: { canonical: 'https://saralprivacy.com' },
};

export default function HomePage() {
  return (
    <>
      {organizationSchema()}
      {websiteSchema()}
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

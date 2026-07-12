import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { WhereRiskHides } from "@/components/home/WhereRiskHides";
import { TrustStrip } from "@/components/home/TrustStrip";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FounderProof } from "@/components/home/FounderProof";
import { AudienceCards } from "@/components/home/AudienceCards";
import { BriefingsSection } from "@/components/home/BriefingsSection";
import { WhitePaperSection } from "@/components/home/WhitePaperSection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ConsultationCTA } from "@/components/home/ConsultationCTA";
import { organizationSchema, websiteSchema, speakableSchema } from "@/lib/schema";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { PressProofStrip } from "@/components/ui/PressProofStrip";

export const metadata: Metadata = {
  title: "DPDPA Compliance for Indian Businesses | SaralPrivacy",
  description:
    "Practical DPDPA guidance for Indian businesses: assessments, industry guides, the DPDPA guide, briefings, and advisory aligned to the DPDP Rules, 2025.",
  alternates: { canonical: 'https://saralprivacy.com' },
  // Full block (not just url) — a child openGraph replaces the root layout's
  // wholesale, so partial overrides drop the inherited title/description/image.
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://saralprivacy.com',
    siteName: 'SaralPrivacy',
    title: 'SaralPrivacy — DPDPA Compliance for Indian Businesses',
    description: 'Free DPDPA readiness assessments, daily briefings, and practical compliance guides for Indian businesses.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SaralPrivacy — DPDPA Compliance' }],
  },
};

// Homepage — 10-beat Discovery-first structure (see LANDING_PAGE_MASTER.md).
// Built incrementally; beats marked TODO are wired in as their components land.
export default function HomePage() {
  return (
    <>
      {organizationSchema()}
      {websiteSchema()}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com', 'DPDPA Compliance for Indian Businesses')}

      {/* Beat 1 — Hero (interactive is-this-me verdict: TODO upgrade) */}
      <HeroSection />

      {/* Beat 2 — Where DPDPA risk hides (Scatter, dark) */}
      <WhereRiskHides />

      {/* Beat 3 — Trust ribbon (press + stats) */}
      <TrustStrip />
      <PressProofStrip />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnswerBlock
          question="What is DPDPA?"
          answer="DPDPA is India's framework for handling digital personal data, and the DPDP Rules, 2025 have now been notified. For Indian businesses, the real work is operational: fix your notices, consent flows, rights handling, retention logic, and vendor controls. SaralPrivacy helps you understand what matters, assess your risk, and prioritise the next 30 to 90 days."
          className="mb-6"
        />
      </div>

      {/* Beat 4 — How it works = do it now (consolidates Discovery/Assess/Fix) */}
      <HowItWorks />

      {/* Beat 5 — Proof: retired; the hero scorecard now carries the sample verdict */}

      {/* Beat 6 — Founder proof */}
      <FounderProof />

      {/* Beat 7 — Explore DPDPA by your sector (the 12-card wall) */}
      <AudienceCards />

      {/* Beat 8 — Get help (free gap review) */}
      <ConsultationCTA />

      {/* Beat 9 — Stay current (briefings + guide + FAQ + newsletter) */}
      <BriefingsSection />
      <WhitePaperSection />
      <FAQPreview />
      <NewsletterSection />
    </>
  );
}

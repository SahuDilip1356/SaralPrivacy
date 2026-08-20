import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { WhereRiskHides } from "@/components/home/WhereRiskHides";
import { TrustStrip } from "@/components/home/TrustStrip";
import { HowItWorks } from "@/components/home/HowItWorks";
import { VerdictPreview } from "@/components/home/VerdictPreview";
import { AudienceCards } from "@/components/home/AudienceCards";
import { BriefingsSection } from "@/components/home/BriefingsSection";
import { WhitePaperSection } from "@/components/home/WhitePaperSection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";
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
//
// Beat rhythm. W1.3 put every beat on one canvas at a uniform py-24, which
// removed the nine-flip zebra but left ten sections that all read as equally
// important. Rhythm now comes from silhouette rather than fill — the canvas is
// still continuous, so this is not a return to alternating backgrounds.
//
//   STATEMENT  py-32  narrow, large type, no cards   — a held breath
//   DEMO       py-24  visual leads, wide             — a product moment
//   UTILITY    py-20  quiet, narrow                  — reference material
//   EVIDENCE   py-16  dense, tight grid              — receipts
//   DECISION   py-16  one line, one action           — a fork in the road
//
// The 2x gap between STATEMENT and EVIDENCE is what the eye actually reads;
// white-vs-cloud-50 is 1.05:1 and would register as banding, not structure.
// Keep adjacent beats on different types — that, not colour, is the pacing.
export default function HomePage() {
  return (
    <>
      {organizationSchema()}
      {websiteSchema()}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com', 'DPDPA Compliance for Indian Businesses')}

      {/* Beat 1 — Hero (interactive is-this-me verdict: TODO upgrade) */}
      <HeroSection />

      {/* Beat 2 — Trust ribbon (stats + why-us pillars). */}
      <TrustStrip />

      {/* Beat 2b — "What is DPDPA?" is the education on-ramp, so it sits
          directly before the problem beat it sets up. It used to land between
          the press logos and the risk narrative, where it read as an SEO
          insert interrupting the story. Still server-rendered and still the
          speakable target — the schema above points at .answer-block. */}
      <div className="bg-cloud-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <AnswerBlock
            question="What is DPDPA?"
            answer="DPDPA is India's framework for handling digital personal data, and the DPDP Rules, 2025 have now been notified. For Indian businesses, the real work is operational: fix your notices, consent flows, rights handling, retention logic, and vendor controls. SaralPrivacy helps you understand what matters, assess your risk, and prioritise the next 30 to 90 days."
          />
        </div>
      </div>

      {/* Beat 3 — Where DPDPA risk hides (Scatter) */}
      <WhereRiskHides />

      {/* Beat 4 — See a real verdict (report-output preview, light).
          Sits right after the problem beat: "here's where you're exposed" →
          "here's the scored verdict that measures it." */}
      <VerdictPreview />

      {/* Beat 5 — How it works = do it now (Discover/Assess/Fix, dark) */}
      <HowItWorks />

      {/* Beat 6 — Explore DPDPA by your sector (the 12-card wall) */}
      <AudienceCards />

      {/* Beat 8 — Get help: removed from landing (Phase 2); reachable via Header/Footer/contact/FAQ */}

      {/* Beat 9 — Stay current (briefings + guide + FAQ + newsletter) */}
      <BriefingsSection />

      {/* Press proof moves here from the top of the page. Three trust sections
          stacked before the reader had seen the problem or the product; the
          logos do more work next to the capture zone, where scepticism peaks. */}
      <PressProofStrip />

      <WhitePaperSection />
      <FAQPreview />
      <NewsletterSection />
    </>
  );
}

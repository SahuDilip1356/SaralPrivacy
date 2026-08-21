import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { WhereRiskHides } from "@/components/home/WhereRiskHides";
import { ReportPreview } from "@/components/home/ReportPreview";
import { RecognitionBand } from "@/components/home/RecognitionBand";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AudienceCards } from "@/components/home/AudienceCards";
import { BriefingsSection } from "@/components/home/BriefingsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { FinalAssessmentBand } from "@/components/home/FinalAssessmentBand";
import { organizationSchema, websiteSchema, speakableSchema } from "@/lib/schema";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { Section } from "@/components/ui/Section";

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

// Homepage — ten sections, three chapters. See LANDING_PAGE_FINAL_SPEC.md.
//
// ── The rhythm system ────────────────────────────────────────────────────────
// The page had twelve sections and two navy bands, both at the ends, with ten
// consecutive cloud-50 sections in between. It read as one flat wash, because
// white on cloud-50 is 1.05:1 — real, and invisible.
//
// Measured across the ramp: cloud-100 1.12:1, cloud-200 1.28:1, cloud-300
// 1.59:1, navy-700 17.31:1. So there IS range here; the page just wasn't
// spending it. cloud-200 is the useful step — 1.28:1 is exactly the ratio the
// Surface ladder already trusts as a card hairline, and area discrimination is
// an easier perceptual task than the small-text legibility WCAG ratios are
// calibrated for.
//
// Three jobs, three mechanisms:
//   FILL      marks the group     navy = chapter · white ↔ deep = sub-group
//   PADDING   marks the beat      statement 32 · demo 24 · utility 20 ·
//                                 evidence/decision 16 · rail 10
//   HAIRLINE  marks the boundary  between two beats that share a fill
//
// Sections that share a fill do so because they are one thought — the demo pair
// (S3+S4), the process/sector pair (S6+S7), the reference pair (S8+S9). Flipping
// every section is the zebra W1.3 killed, just louder.
//
// `scripts/design-lint.sh` enforces it: two adjacent light sections may not
// share a padding type. Section.tsx got zero adoption the first time precisely
// because nothing checked it.
//
//   S1  Hero               navy   —          the promise + one action
//   S2  Proof rail         deep   rail       can I trust this enough to click
//   S3  Where risk hides   white  statement  is this me
//   S4  Report preview     white  demo       what do I actually get
//   S5  Recognition        navy   decision   who's behind this
//   S6  How it works       white  utility    how much work is this
//   S7  Sector examples    white  evidence   does it fit my business
//   S8  Briefings deck     deep   demo       are these people actually on it
//   S9  Resources          deep   utility    I'd rather read first
//   S10 FAQ                deep   evidence   what's stopping me
//   S11 Final CTA          navy   decision   close
export default function HomePage() {
  return (
    <>
      {organizationSchema()}
      {websiteSchema()}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com', 'DPDPA Compliance for Indian Businesses')}

      {/* ── Chapter 1: understand ───────────────────────────────────────── */}

      {/* S1 — the promise, one action, and a sample read. */}
      <HeroSection />

      {/* S2 — press marks + the three facts that reduce the anxiety of
          STARTING. Directly under the hero, where scepticism peaks and the
          visitor has not yet scrolled. The deeper press section still runs
          inside S5, next to the founder: anxiety and authority are different
          jobs and want different places. */}
      <Section surface="deep" type="rail" aria-label="Press coverage and product facts">
        <PressProofStrip variant="rail" />
      </Section>

      {/* S3 — where the risk actually is, in tools they already use. Carries
          the "What is DPDPA?" answer block at its foot (the speakable target —
          the schema above points at `.answer-block` by class, not position). */}
      <WhereRiskHides />

      {/* S4 — the product demonstration: the scored report, full width. */}
      <ReportPreview />

      {/* ── Chapter 2: trust and fit ────────────────────────────────────── */}

      {/* S5 — the attention reset and the authority beat. */}
      <RecognitionBand />

      {/* S6 — three steps, all of them the assessment. */}
      <HowItWorks />

      {/* S7 — three sector examples, plus a link row that keeps all twelve. */}
      <AudienceCards />

      {/* ── Chapter 3: resolve and close ────────────────────────────────── */}

      {/* S8 — the briefings deck. The one place on the page where the reader
          sees what we publish rather than what we assess, and the reason the
          resources section below carries no briefings card. */}
      <BriefingsSection />

      {/* S9 — three reference assets for the reader who isn't ready to act. */}
      <ResourcesSection />

      {/* S10 — the objections that stop a click, answered. */}
      <FAQPreview />

      {/* S11 — the close. The newsletter used to sit here; it now lives in the
          footer and on /briefings. */}
      <FinalAssessmentBand />
    </>
  );
}

import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { WhereRiskHides } from "@/components/home/WhereRiskHides";
import { ReportPreview } from "@/components/home/ReportPreview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AudienceCards } from "@/components/home/AudienceCards";
import { BriefingsSection } from "@/components/home/BriefingsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { FinalAssessmentBand } from "@/components/home/FinalAssessmentBand";
import { ScrollDepth } from "@/components/home/ScrollDepth";
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

// Homepage — ten sections, three chapters. See LANDING_PAGE_SIGNOFF_SPEC.md.
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
//   S2  Proof seam         navy   rail       can I trust this enough to click
//   S3  Where risk hides   navy   statement  is this me
//   S4  Report preview     white  demo       what do I actually get
//   S5  How it works       white  utility    how much work is this
//   S6  Sector ring        white  evidence   does it fit my business
//   S7  Briefings deck     navy   demo       are these people actually on it
//   S8  Resources          deep   utility    I'd rather read first
//   S9  FAQ                deep   evidence   what's stopping me
//   S10 Final CTA          navy   decision   close
//
// ── Where the recognition band went ──────────────────────────────────────────
// A navy "who's behind this" band used to sit between the report and the three
// steps. Founder call (2026-08-22): that question belongs on /about, where a
// visitor who asks it has already gone looking. Its four "how we work" pillars
// moved there with it; the founder card and press strip were already on that
// page, which is what made the homepage copy a second source of truth for one
// person's CV.
//
// Removing it cost the page its mid-page dark reset, so the architecture
// rebalanced rather than just closing the gap: the briefings deck (S7) takes
// navy and becomes Authority Moment 2. The page now reads dark-open (S1–S3),
// light-middle (S4–S6, the product and the fit), dark-turn (S7), quiet close
// (S8–S9) into the dark CTA — symmetric, and one fewer beat.
export default function HomePage() {
  return (
    <>
      {organizationSchema()}
      {websiteSchema()}
      {speakableSchema(['.answer-block'], 'https://saralprivacy.com', 'DPDPA Compliance for Indian Businesses')}

      {/* Renders nothing. The R0 baseline for the rebuild: whether readers
          actually get further down this page than they did. */}
      <ScrollDepth />

      {/* ── Chapter 1: understand — ONE CONTINUOUS DARK RUN ─────────────────
          Hero (navy-700) → proof seam (navy-800) → risk map (navy-700).
          This is the master spec's original "dark zones = Hero+Scatter",
          finally shipped — and the founder's read of the old page named the
          exact failure it fixes: below the hero everything faded, because the
          first thing after the promise was empty light ground. Now the first
          thing after the promise is the proof, then the problem, with no
          drop in intensity until the product shows itself on white at S4. */}

      {/* S1 — the promise, one action, and a sample read. */}
      <HeroSection />

      {/* S2 — press marks + the three facts that reduce the anxiety of
          STARTING. A navy-800 seam, one shade darker than its neighbours, so
          it reads as a groove between hero and risk map rather than a section.
          The deeper press block still runs inside S5, next to the founder:
          anxiety and authority are different jobs and want different places. */}
      <Section
        surface="navy"
        type="rail"
        className="bg-navy-800 border-y border-white/5"
        aria-label="Press coverage and product facts"
      >
        <PressProofStrip variant="rail" onDark />
      </Section>

      {/* S3 — where the risk actually is, in tools they already use. Carries
          the "What is DPDPA?" answer block at its foot (the speakable target —
          the schema above points at `.answer-block` by class, not position). */}
      <WhereRiskHides />

      {/* S4 — the product demonstration: the scored report, full width. */}
      <ReportPreview />

      {/* ── Chapter 2: the product, and whether it fits ──────────────────
          Three white beats in a row, held apart by hairlines and the padding
          ladder rather than by a fill flip. They are one thought — here is the
          thing, here is what it costs you, here is your sector — and the chapter
          break that used to interrupt them was answering a question (who are
          you) that nobody asks between "what do I get" and "how long does it
          take". */}

      {/* S5 — three steps, all of them the assessment. */}
      <HowItWorks />

      {/* S6 — the sector ring: all twelve, one at a time. */}
      <AudienceCards />

      {/* ── Chapter 3: resolve and close ────────────────────────────────── */}

      {/* S7 — the briefings deck, on navy. The one place on the page where the
          reader sees what we publish rather than what we assess — so it is also
          where authority is asserted a second time, and the reason the resources
          section below carries no briefings card. */}
      <BriefingsSection />

      {/* S8 — three reference assets for the reader who isn't ready to act. */}
      <ResourcesSection />

      {/* S9 — the objections that stop a click, answered. */}
      <FAQPreview />

      {/* S10 — the close. The newsletter used to sit here; it now lives in the
          footer and on /briefings. */}
      <FinalAssessmentBand />
    </>
  );
}

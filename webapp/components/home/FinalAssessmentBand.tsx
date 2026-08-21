"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { trackEvent } from "@/lib/analytics";

// S10 — the close, and the page's third and last navy band.
//
// The newsletter used to sit here. It asked the visitor to swap the one thing
// the whole page had been building towards — a score they can get in three
// minutes without giving us anything — for an email subscription. Subscribing
// is a fine outcome; it is not the outcome this page is for. It now lives in
// the footer and on /briefings, where someone who wants briefings goes.
//
// One line, one action, nothing else on the band.

export function FinalAssessmentBand() {
  return (
    <Section surface="navy" type="decision" width="narrow" aria-label="Take the free assessment">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-7">
          Know your gaps. Fix what matters. Signal trust.
        </h2>

        <Link
          href="/assessment"
          onClick={() => trackEvent.landingCtaClick({ cta: "final_band" })}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-400 hover:bg-green-300 text-navy-950 font-semibold rounded-lg transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
        >
          Take free assessment
          <ArrowRight size={18} />
        </Link>

        <p className="mt-5 text-sm text-cloud-400">
          Free · 3–5 minutes · No email to start
        </p>
      </div>
    </Section>
  );
}

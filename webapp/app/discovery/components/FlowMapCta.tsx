"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * The Discovery → Data Flow Maps handoff CTA.
 *
 * Deliberately written in the `.spd` island's own class idiom rather than
 * reusing the shared Tailwind FlowCrossLink: discovery.css resets padding and
 * link colour on every descendant of `.spd`, which strips a Tailwind component
 * down to unpadded, near-invisible text. Client component only so the click
 * fires the event — it still server-renders, keeping the link crawlable.
 *
 * Hub link on purpose: Discovery's 276 niches don't map 1:1 to the 12 sectors,
 * so this never guesses a sector deep link.
 */
export default function FlowMapCta() {
  return (
    <a
      href="/data-mapping"
      className="btn-ghost btn-sm next-step-cta"
      onClick={() => trackEvent.flowCrosslinkClick({ source: "discovery", sector: "hub" })}
    >
      Explore the data flow maps →
    </a>
  );
}

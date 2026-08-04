"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * Quiet per-card link into a sector's live data-flow map (AudienceCards).
 * Client component only so the click fires flow_crosslink_click — the markup
 * still server-renders, so the links stay in crawlable HTML. `className`
 * carries the card's 800-shade text colour: the 700 shades don't all clear
 * 4.5:1 on the accent backgrounds (custom teal-700 on teal-50 = 4.48:1),
 * the 800s measure 6.77:1 or better on every card.
 */
export function FlowMapCardLink({
  href,
  sector,
  className,
}: {
  href: string;
  sector: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent.flowCrosslinkClick({ source: "home_cards", sector })}
      className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-2 transition-colors ${className}`}
    >
      See the data flow
      <ArrowRight size={14} />
    </Link>
  );
}

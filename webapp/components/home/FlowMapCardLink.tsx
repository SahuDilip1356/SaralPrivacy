"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * Per-card link into a sector's live data-flow map (AudienceCards).
 * Client component only so the click fires flow_crosslink_click — the markup
 * still server-renders, so the link stays in crawlable HTML.
 *
 * The caller owns ALL of the appearance through `className` — shape as well as
 * colour, since the sector cards went dark and these became outline chips. This
 * component holds the destination, the label and the event; nothing else.
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
      className={`inline-flex items-center gap-1.5 transition-colors ${className}`}
    >
      See the data flow
      <ArrowRight size={14} />
    </Link>
  );
}

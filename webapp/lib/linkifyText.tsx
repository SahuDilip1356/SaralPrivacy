/**
 * linkifyText.tsx
 *
 * Processes a plain-text string and returns React nodes where matched DPDPA
 * terms are either:
 *   - Linked  (<Link>)  — first occurrence of a term that has an href
 *   - Highlighted (<span>) — subsequent occurrences, or terms with no href
 *
 * Per-call first-occurrence tracking: a `Set<string>` is created inside each
 * call, so the first match within a single text block becomes a link. Terms
 * appearing again in the same block get the colour highlight without a link.
 * Across separate calls (e.g. different section bodies), the term can link again.
 *
 * Usage:
 *   import { linkifyText } from "@/lib/linkifyText";
 *   <p>{linkifyText("The Data Fiduciary must...")}</p>
 */

import React from "react";
import Link from "next/link";
import { TERM_LINKS, TERM_REGEX } from "./termLinks";

export function linkifyText(text: string): React.ReactNode {
  // Split by the shared regex — matched terms land in odd-indexed positions
  const parts = text.split(TERM_REGEX);

  // Track which terms have been linked within this call
  const seen = new Set<string>();

  return parts.map((part, i) => {
    const match = TERM_LINKS.find((t) => t.term === part);

    if (!match) {
      // Plain text segment — return as-is
      return part;
    }

    const isFirst = !seen.has(match.term);
    seen.add(match.term);

    if (match.href && isFirst) {
      // First occurrence + has a URL → interactive linked chip
      return (
        <Link
          key={i}
          href={match.href}
          className={`${match.className} underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all`}
        >
          {part}
        </Link>
      );
    }

    // Subsequent occurrence or no URL → colour highlight only
    return (
      <span key={i} className={match.className}>
        {part}
      </span>
    );
  });
}

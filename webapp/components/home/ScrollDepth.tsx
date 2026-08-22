"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Homepage scroll-depth beacon. Renders nothing.
 *
 * The R0 baseline the CEO-review rule keeps asking for: instrument first,
 * compare after. Every structural decision in this rebuild — the compressed
 * ladder, the continuous dark opening, the next section peeking above every
 * fold — is a bet that readers get further down the page than they used to,
 * and none of it is currently measurable.
 *
 * Rules it follows:
 *   • at most one event per bucket per page view (a `Set`, not a counter)
 *   • measured on a passive rAF-throttled scroll listener, so it never
 *     contends with the page's own transitions or costs INP
 *   • buckets, never a precise percentage — a per-visitor scroll trace is a
 *     fingerprint, and 25/50/75/100 answers the question anyway
 *   • 100 needs the viewport bottom within 2px of the document, so a page that
 *     grows late (the briefings deck arriving) cannot fire it early
 *
 * A page shorter than the viewport reports nothing: there is no scrolling to
 * measure, and firing "100%" for a page nobody scrolled would poison the very
 * comparison this exists to make.
 */
const BUCKETS = [25, 50, 75, 100] as const;

export function ScrollDepth() {
  const sent = useRef(new Set<number>());

  useEffect(() => {
    let queued = false;

    const measure = () => {
      queued = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const bottom = window.scrollY + window.innerHeight;
      const pct = (bottom / doc.scrollHeight) * 100;

      for (const b of BUCKETS) {
        if (sent.current.has(b)) continue;
        const reached =
          b === 100 ? window.scrollY >= scrollable - 2 : pct >= b;
        if (reached) {
          sent.current.add(b);
          trackEvent.scrollDepth({ depth: b });
        }
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    measure(); // a deep-linked arrival (#report, #sectors) starts partway down
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}

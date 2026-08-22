"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Has this element been on screen yet?" — the homepage's reveal trigger.
 *
 * One-way by design: it flips true the first time the element crosses the
 * threshold and disconnects. Nothing on this page animates on scroll POSITION,
 * and nothing replays when you scroll back up — a section that re-fades every
 * time it re-enters the viewport reads as a page that cannot hold still, which
 * is the opposite of what the motion inventory is for.
 *
 * Extracted after the third byte-identical copy of it appeared in a home
 * component (the risk map, the steps, the sector ring) and a fourth was about
 * to (the report's dimension bars).
 *
 * Callers are responsible for the reduced-motion case: the convention on this
 * page is `motion-reduce:` utilities that force the composed state, so the
 * observer still fires and the element simply arrives without travelling.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

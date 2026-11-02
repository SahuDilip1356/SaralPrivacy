"use client";

// Spotlight (sd-web-design · recipes/scroll/spotlight-mask.md). A navy veil
// with a soft circular hole closes from "everything visible" onto one element
// as the reader scrolls through a pinned section, then a caption says in words
// what is there. Calm by design: navy, never red, no pulse.
//
// The hole is centred on `target`, measured against the veil's own box, so it
// lands on the element at any layout (10 tiles across on desktop, 5 on a phone).
//
// Reduced motion → no pinning, final spotlight and caption shown at once.
// No JS → the veil's server-rendered mask is the huge start hole, so the
// diagram and caption are fully visible.

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface Props {
  /** The element to spotlight; must be inside `children`. */
  target: RefObject<HTMLElement | null>;
  caption: ReactNode;
  /** The diagram. Fills the stage. */
  children: ReactNode;
  className?: string;
}

const VEIL = "pointer-events-none absolute inset-0 bg-navy-900/70";
const START_RADIUS = 1600;
const EDGE = 48;

/** 0..1 progress of p through [from, to], clamped. */
const span = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

export function Spotlight({ target, caption, children, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const figRef = useRef<HTMLElement>(null);
  const still = usePrefersReducedMotion();
  const [spot, setSpot] = useState({ x: 50, y: 50, radius: 90 });
  const end = useRef(spot.radius);
  end.current = spot.radius;

  useEffect(() => {
    const fig = figRef.current;
    const el = target.current;
    if (!fig || !el) return;
    const measure = () => {
      const f = fig.getBoundingClientRect();
      const t = el.getBoundingClientRect();
      if (!f.width || !f.height) return;
      setSpot({
        x: ((t.left + t.width / 2 - f.left) / f.width) * 100,
        y: ((t.top + t.height / 2 - f.top) / f.height) * 100,
        radius: Math.hypot(t.width, t.height) / 2 + 10,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(fig);
    return () => ro.disconnect();
  }, [target, still]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Function transforms read the latest measured radius, so a resize never
  // leaves the hole sized for the old layout.
  const r = useTransform(scrollYProgress, (p) => {
    const eased = 1 - Math.pow(1 - span(p, 0.15, 0.7), 3);
    return START_RADIUS + (end.current - START_RADIUS) * eased;
  });
  const captionOpacity = useTransform(scrollYProgress, (p) => span(p, 0.65, 0.75));
  const { x, y, radius } = spot;
  const mask = useMotionTemplate`radial-gradient(circle at ${x}% ${y}%, transparent ${r}px, black calc(${r}px + ${EDGE}px))`;
  const finalMask = `radial-gradient(circle at ${x}% ${y}%, transparent ${radius}px, black ${radius + EDGE}px)`;

  return (
    <section ref={ref} className={cn(still ? "relative" : "relative h-[180vh]", className)}>
      <div className={still ? "relative" : "sticky top-0 h-svh overflow-hidden"}>
        <figure ref={figRef} className="relative flex h-full flex-col">
          <div className="relative flex-1">{children}</div>
          {/* Two elements, not one with a switching style: once a motion
              component has rendered a motion value for a style, framer stops
              applying later plain-string values for it, which froze the still
              veil at the pinned layout's coordinates. */}
          {still ? (
            <div
              aria-hidden="true"
              className={VEIL}
              style={{ maskImage: finalMask, WebkitMaskImage: finalMask }}
            />
          ) : (
            <motion.div
              aria-hidden="true"
              className={VEIL}
              style={{ maskImage: mask, WebkitMaskImage: mask }}
            />
          )}
          <motion.figcaption
            style={{ opacity: still ? 1 : captionOpacity }}
            className="relative z-10 mx-4 mb-6 max-w-md self-start rounded-xl bg-white p-4 text-slate-700 shadow-lg sm:mx-6"
          >
            {caption}
          </motion.figcaption>
        </figure>
      </div>
    </section>
  );
}

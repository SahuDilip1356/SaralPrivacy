"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// One score dial, reused so the hero, the HowItWorks step artifact, and any
// future surface stay in the same visual family (Phase 2 design-review criterion).
//   variant="full"  → gold arc on a slate track (hero: the score IS the subject)
//   variant="quiet" → muted, thinner arc, no solid track (a step artifact must
//                     stay secondary to the step title)
//   animate         → arc draws + number counts up 0→value once, when in view.
//
// Robustness: state initialises to the FINAL value, so server-render, no-JS,
// reduced-motion, and any case where IntersectionObserver never fires all show
// the correct dial. When animating, a layout effect primes it to 0 before paint
// (no flash) and a fallback timer snaps to final if the observer stays silent.

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  variant?: "full" | "quiet";
  animate?: boolean;
  showTotal?: boolean;
};

export function ScoreDial({
  value,
  size = 66,
  stroke = 8,
  variant = "full",
  animate = false,
  showTotal = true,
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const finalOffset = circ * (1 - value / 100);

  const [count, setCount] = useState(value);
  const [offset, setOffset] = useState(finalOffset);
  const ref = useRef<SVGSVGElement>(null);
  const played = useRef(false);

  // Prime to the start state before paint (only when we will actually animate).
  useIsoLayoutEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCount(0);
    setOffset(circ);
  }, [animate, circ]);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (played.current) return;
      played.current = true;
      const start = performance.now();
      const dur = 900;
      const tick = (now: number) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(value * eased));
        setOffset(circ * (1 - (value * eased) / 100));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          obs.disconnect();
          run();
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);

    // Fallback: if the observer never reports intersection (odd viewport,
    // print, etc.), still land on the correct value.
    const fallback = window.setTimeout(() => {
      obs.disconnect();
      if (!played.current) {
        setCount(value);
        setOffset(finalOffset);
      }
    }, 1200);

    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
  }, [animate, value, circ, finalOffset]);

  const arc = variant === "full" ? "#E8AB42" : "#B98F3E";
  const track = variant === "full" ? "#E2E8F0" : "rgba(185,143,62,0.16)";
  const arcOpacity = variant === "quiet" ? 0.85 : 1;
  const cx = size / 2;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score ${value} out of 100`}
    >
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={arc}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        opacity={arcOpacity}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text
        x={cx}
        y={showTotal ? cx - size * 0.03 : cx}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.3}
        fontWeight={700}
        fill={variant === "quiet" ? "#E2E8F0" : "#121A2E"}
        fontFamily="inherit"
      >
        {count}
      </text>
      {showTotal && (
        <text
          x={cx}
          y={cx + size * 0.2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.12}
          fill="#94A3B8"
          fontFamily="inherit"
        >
          / 100
        </text>
      )}
    </svg>
  );
}

"use client";

// prefers-reduced-motion, safe to use for anything that changes rendered text
// or structure. framer-motion's useReducedMotion() reads the media query on the
// first client render, so text derived from it differs from the server HTML and
// React throws a hydration error. Here the server snapshot is always false, and
// the real value applies right after hydration.

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

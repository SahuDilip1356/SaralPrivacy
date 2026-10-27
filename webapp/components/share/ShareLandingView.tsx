"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

// Fires result_share_landing_view once per landing load — the middle step of
// the share loop (click → landing → assessment_start{src:"share"}).
//
// ⚠️ On a static page this effect runs BEFORE <Analytics /> exists:
// @vercel/analytics/next wraps it in <Suspense> (it reads useSearchParams), so
// it mounts after the page, and track() without window.va drops the event
// with no error. So create the library's own queue first — the same stub its
// initQueue() installs; the script drains window.vaq when it loads. The ref
// keeps React's dev double-mount from counting twice.

type VaWindow = Window & { va?: (...params: unknown[]) => void; vaq?: unknown[][] };

export function ShareLandingView({ sector, band }: { sector: string; band: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const w = window as VaWindow;
    w.va ??= (...params: unknown[]) => {
      (w.vaq ??= []).push(params);
    };
    trackEvent.resultShareLandingView({ sector, band });
  }, [sector, band]);
  return null;
}

"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

// Chrome's non-standard install event — not in lib.dom.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * "Install app" affordance for the footer bottom bar. Renders nothing unless
 * installation is actually possible right now:
 *  - Chromium (Android/desktop): appears once `beforeinstallprompt` is
 *    captured; tapping it opens the native install sheet.
 *  - iOS Safari: no install API exists, so tapping reveals the one-line
 *    Add-to-Home-Screen instruction instead.
 *  - Already installed / unsupported: stays invisible.
 */
export function InstallCta() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPadOS 13+ reports a Mac UA; maxTouchPoints separates real Macs out.
    const ua = navigator.userAgent;
    setIsIos(
      /iPhone|iPad|iPod/.test(ua) ||
        (ua.includes("Mac") && navigator.maxTouchPoints > 1)
    );

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const linkClasses =
    "inline-flex items-center pointer-coarse:min-h-11 text-xs text-slate-400 hover:text-white transition-colors";

  if (installEvent) {
    return (
      <button
        type="button"
        className={linkClasses}
        onClick={async () => {
          await installEvent.prompt();
          const choice = await installEvent.userChoice;
          trackEvent.pwaInstallClick({ platform: "android", outcome: choice.outcome });
          // The event is single-use; Chrome fires a fresh one if still eligible.
          setInstallEvent(null);
        }}
      >
        Install app
      </button>
    );
  }

  if (isIos) {
    return showIosHint ? (
      <span className="text-xs text-slate-400">
        Tap Share, then &ldquo;Add to Home Screen&rdquo;
      </span>
    ) : (
      <button
        type="button"
        className={linkClasses}
        onClick={() => {
          setShowIosHint(true);
          trackEvent.pwaInstallClick({ platform: "ios", outcome: "hint_shown" });
        }}
      >
        Install app
      </button>
    );
  }

  return null;
}

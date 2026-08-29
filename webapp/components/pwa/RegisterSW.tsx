"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Registers the service worker (public/sw.js) and reports the two PWA
 * baseline metrics that have never been measured: installs and
 * installed-app sessions. Renders nothing; mounted once in the root layout.
 */
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // An unregistered SW just means no offline support — never surface it.
      });
    }

    // Chrome/Edge fire this when the user completes an install.
    const onInstalled = () => trackEvent.pwaInstall();
    window.addEventListener("appinstalled", onInstalled);

    // Launched from a home-screen icon (Android WebAPK, iOS A2HS, desktop).
    if (window.matchMedia("(display-mode: standalone)").matches) {
      trackEvent.pwaStandaloneSession();
    }

    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  return null;
}

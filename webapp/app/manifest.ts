import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest; Next injects the <link> automatically.
// Icons come from scripts/generate-pwa-icons.py — regenerate, never hand-edit.
// See MOBILE_APP_SPEC.md (Route A) for the full PWA plan.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SaralPrivacy — DPDPA Compliance",
    short_name: "SaralPrivacy",
    description:
      "DPDPA compliance tools, readiness assessments, and the Daily Brief for Indian businesses.",
    // ?source=pwa lets analytics separate installed-app launches from web visits.
    start_url: "/?source=pwa",
    display: "standalone",
    // navy-800 — the dark-canvas token (app/globals.css).
    background_color: "#0D1322",
    theme_color: "#0D1322",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Result share cards · structure
//
// A finished assessment can be shared to WhatsApp as a link to a public,
// PII-free landing: /assessment/<sector>/shared/<band>. The URL carries the
// sector and the risk BAND only — never the score, never the report token.
// (Decided 2026-09-19: band only → 12 × 4 = 48 static pages, no per-user URL.)
//
// This file holds STRUCTURE ONLY. Visitor copy lives in messages/en.json under
// `share.*`, so a locale later needs no code change.
//
// Relative `.ts` imports so the contract test can load this file under
// `node --experimental-strip-types`.
// ─────────────────────────────────────────────────────────────────────────────
import type { BandLabel } from "./industry-assessment/bands.ts";
import { SECTORS } from "./sectors.ts";
import { accentFor } from "./sector-accents.ts";

/** URL slug ↔ engine band. The slug is what a shared link exposes. */
export const SHARE_BANDS = [
  { slug: "controlled", label: "Controlled" },
  { slug: "moderate", label: "Moderate Risk" },
  { slug: "high", label: "High Risk" },
  { slug: "critical", label: "Critical Risk" },
] as const satisfies ReadonlyArray<{ slug: string; label: BandLabel }>;

export type ShareBandSlug = (typeof SHARE_BANDS)[number]["slug"];

export const bandFromSlug = (slug: string): BandLabel | undefined =>
  SHARE_BANDS.find((b) => b.slug === slug)?.label;

export const bandSlugFor = (label: BandLabel): ShareBandSlug =>
  (SHARE_BANDS.find((b) => b.label === label) ?? SHARE_BANDS[0]).slug;

/**
 * Ink for text set ON a band fill (RISK_BANDS[].color). White fails on three
 * of the four fills (2.03–2.80:1). navy-900 clears 6.9:1 on those three but
 * only 4.03:1 on red, where white clears 4.83:1. Pinned by result-share.test.ts.
 */
export const BAND_INK: Record<BandLabel, string> = {
  Controlled: "#080D17",
  "Moderate Risk": "#080D17",
  "High Risk": "#080D17",
  "Critical Risk": "#FFFFFF",
};

/** Every live assessment gets share landings, keyed by its route slug. */
export const SHARE_SECTORS = SECTORS.map((s) => {
  const accent = accentFor(s.slug);
  return { slug: s.assessmentSlug, hex: accent.hex, accent };
});

/** 48 landings: every sector × every band. */
export const SHARE_PARAMS = SHARE_SECTORS.flatMap((s) =>
  SHARE_BANDS.map((b) => ({ sector: s.slug, band: b.slug })),
);

/**
 * openGraph fields a page must restate when it sets its own openGraph — Next
 * replaces the parent's openGraph wholesale, it does not merge.
 */
export const OG_BASE = { type: "website", locale: "en_IN", siteName: "SaralPrivacy" } as const;

export const shareSectorFor = (slug: string) =>
  SHARE_SECTORS.find((s) => s.slug === slug);

// ── Card images ──────────────────────────────────────────────────────────────
// Static PNGs at /og/<locale>/<sector>/<band|scan>.png (app/og/…/route.ts).
// Not the opengraph-image.tsx convention: under [locale] Next emits the image
// URL as /en/…, which the as-needed locale proxy 307-redirects — and a preview
// image behind a redirect is one WhatsApp may silently drop. The ".png" also
// keeps these paths out of the proxy matcher, so they are served as-is.

export const SHARE_CARD_SIZE = { width: 1200, height: 630 };

/** `band` omitted ⇒ the sector's own scan card (no result). */
export const shareCardPath = (locale: string, sector: string, band?: ShareBandSlug) =>
  `/og/${locale}/${sector}/${band ?? "scan"}.png`;

/** openGraph.images entry for an assessment page's own card (English metadata). */
export const scanCardImage = (sector: string) => ({
  url: shareCardPath("en", sector),
  ...SHARE_CARD_SIZE,
  alt: "Free DPDPA risk scan — SaralPrivacy",
});

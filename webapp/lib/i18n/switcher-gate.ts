// ─────────────────────────────────────────────────────────────────────────────
// Visibility gate for the header language switcher (MULTILINGUAL_SPEC §8-P3).
//
// The switcher ships DARK on production until Hindi passes its acceptance gate
// (flipping NEXT_PUBLIC_SHOW_HINDI is the acceptance criterion), but shows
// AUTOMATICALLY on Vercel preview deployments and in local dev so every
// preview can be verified in both languages without touching env config.
//
// All three variables are inlined at BUILD time (NEXT_PUBLIC_* and NODE_ENV
// are compile-time constants in client bundles), so on a production build
// with the flag unset this constant is `false` and the switcher markup is
// dead-code-eliminated — nothing reaches the served HTML.
// ─────────────────────────────────────────────────────────────────────────────

export const SHOW_LANGUAGE_SWITCHER: boolean =
  process.env.NEXT_PUBLIC_SHOW_HINDI === "true" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
  process.env.NODE_ENV === "development";

/**
 * The emblem's double ring — navy outside, a hair of white, green inside —
 * for the menu-tile icons. A Tailwind shadow rather than a CSS class: shadow
 * utilities compose with focus-visible:ring (both are box-shadow), a plain
 * class would erase the keyboard focus ring. Written out in full so
 * Tailwind's scanner emits it.
 */
export const RING_CLASS =
  "shadow-[inset_0_0_0_1.5px_var(--color-navy-700),inset_0_0_0_3px_#fff,inset_0_0_0_4.5px_var(--color-green-600)]";

/**
 * The three header chips (language, guide, readiness) — one shape, styled
 * and animated by `.sp-chip` in globals.css. The double ring looked doubled
 * at 36px (review 2026-10-02), so the chip wears one navy ring at rest and
 * the green ring only appears, growing outward, on hover. Readiness adds
 * `sp-chip-gold` for its fill.
 */
export const CHIP_CLASS = "sp-chip pointer-coarse:min-h-11";

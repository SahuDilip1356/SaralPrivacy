/**
 * The header's secondary chips (language, guide): one shape, the emblem's
 * double ring. The filled assessment pill shares the height and radius, so
 * the three read as one set (Dilip's 2026-10-02 review, "Option A").
 * orange-700 on the download arrow is 5.2:1 on white — the logo's own gold is
 * too faint for an icon that carries meaning.
 */
/**
 * The emblem's double ring — navy outside, a hair of white, green inside.
 * A Tailwind shadow rather than a CSS class: shadow utilities compose with
 * focus-visible:ring (both are box-shadow), a plain class would erase the
 * keyboard focus ring. Written out in full so Tailwind's scanner emits it.
 */
export const RING_CLASS =
  "shadow-[inset_0_0_0_1.5px_var(--color-navy-700),inset_0_0_0_3px_#fff,inset_0_0_0_4.5px_var(--color-green-600)]";

export const CHIP_CLASS =
  "shadow-[inset_0_0_0_1.5px_var(--color-navy-700),inset_0_0_0_3px_#fff,inset_0_0_0_4.5px_var(--color-green-600)] inline-flex items-center gap-1.5 h-9 px-3.5 pointer-coarse:min-h-11 rounded-full bg-white text-[13.5px] font-semibold whitespace-nowrap text-navy-700 hover:bg-cloud-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2";

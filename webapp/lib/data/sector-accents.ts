// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Sector accent colours · single source of truth
//
// A sector is represented by ONE hue everywhere it appears. The /industries
// cards and the homepage sector wall already carried a per-sector hue; the data
// flow map cards did not (every card was teal), so a sector looked like a
// different business depending on which page you were on. This table is that
// hue, keyed by the sector slug in `sectors.ts`.
//
// Two surfaces, two ramps:
//  • `light` — pastel cards on white/slate (the /industries grid).
//  • `dark`  — the navy-700 data flow map cards.
//
// Class strings are written out in full. Tailwind scans source text, so a
// constructed name like `bg-${hue}-400` is never emitted into the stylesheet.
//
// Contrast (measured, not eyeballed — this palette has pairs that look fine and
// fail): on navy-700 #121A2E every `icon` clears 6.4:1 against the white/10
// chip and every `cta` clears 6.2:1 for its navy-900 label. The 300/400 pair is
// deliberate: 500-weight fills drop several hues below the 4.5:1 bar.
// ─────────────────────────────────────────────────────────────────────────────

export interface SectorAccent {
  /** Tailwind hue name — for comments and tests, never for class construction. */
  hue: string;
  /**
   * Pastel surfaces: light cards on white. `dot` is spelled out rather than
   * derived from `iconColor` — deriving it with a string replace produced a
   * class Tailwind never scanned, so eight of the twelve industry cards were
   * rendering their risk bullets with no colour at all.
   */
  light: { bg: string; border: string; iconBg: string; iconColor: string; dot: string; btn: string };
  /** Dark surfaces: cards on navy-700. */
  dark: { badge: string; icon: string; cta: string };
}

export const SECTOR_ACCENTS: Record<string, SectorAccent> = {
  "recruitment-agencies": {
    hue: "green",
    light: { bg: "bg-green-50", border: "border-green-200", iconBg: "bg-green-100", iconColor: "text-green-600", dot: "bg-green-600", btn: "bg-green-500 hover:bg-green-600" },
    dark: { badge: "bg-green-500/20 text-green-300", icon: "text-green-300", cta: "bg-green-400 hover:bg-green-300" },
  },
  "ca-firms": {
    hue: "indigo",
    light: { bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-100", iconColor: "text-indigo-700", dot: "bg-indigo-700", btn: "bg-indigo-700 hover:bg-indigo-800" },
    dark: { badge: "bg-indigo-500/20 text-indigo-300", icon: "text-indigo-300", cta: "bg-indigo-400 hover:bg-indigo-300" },
  },
  "training-institutes": {
    hue: "amber",
    light: { bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-700", dot: "bg-amber-700", btn: "bg-amber-600 hover:bg-amber-700" },
    dark: { badge: "bg-amber-500/20 text-amber-300", icon: "text-amber-300", cta: "bg-amber-400 hover:bg-amber-300" },
  },
  "d2c-brands": {
    hue: "rose",
    light: { bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-100", iconColor: "text-rose-700", dot: "bg-rose-700", btn: "bg-rose-700 hover:bg-rose-800" },
    dark: { badge: "bg-rose-500/20 text-rose-300", icon: "text-rose-300", cta: "bg-rose-400 hover:bg-rose-300" },
  },
  "clinics-diagnostic-labs": {
    hue: "cyan",
    light: { bg: "bg-cyan-50", border: "border-cyan-200", iconBg: "bg-cyan-100", iconColor: "text-cyan-700", dot: "bg-cyan-700", btn: "bg-cyan-600 hover:bg-cyan-700" },
    dark: { badge: "bg-cyan-500/20 text-cyan-300", icon: "text-cyan-300", cta: "bg-cyan-400 hover:bg-cyan-300" },
  },
  "schools-colleges": {
    hue: "sky",
    light: { bg: "bg-sky-50", border: "border-sky-200", iconBg: "bg-sky-100", iconColor: "text-sky-700", dot: "bg-sky-700", btn: "bg-sky-600 hover:bg-sky-700" },
    dark: { badge: "bg-sky-500/20 text-sky-300", icon: "text-sky-300", cta: "bg-sky-400 hover:bg-sky-300" },
  },
  "law-firms": {
    hue: "violet",
    light: { bg: "bg-violet-50", border: "border-violet-200", iconBg: "bg-violet-100", iconColor: "text-violet-700", dot: "bg-violet-700", btn: "bg-violet-600 hover:bg-violet-700" },
    dark: { badge: "bg-violet-500/20 text-violet-300", icon: "text-violet-300", cta: "bg-violet-400 hover:bg-violet-300" },
  },
  "real-estate": {
    hue: "emerald",
    light: { bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", dot: "bg-emerald-700", btn: "bg-emerald-600 hover:bg-emerald-700" },
    dark: { badge: "bg-emerald-500/20 text-emerald-300", icon: "text-emerald-300", cta: "bg-emerald-400 hover:bg-emerald-300" },
  },
  "hotels-travel": {
    hue: "orange",
    light: { bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-100", iconColor: "text-orange-700", dot: "bg-orange-700", btn: "bg-orange-600 hover:bg-orange-700" },
    dark: { badge: "bg-orange-500/20 text-orange-300", icon: "text-orange-300", cta: "bg-orange-400 hover:bg-orange-300" },
  },
  pharmacies: {
    hue: "purple",
    light: { bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-700", dot: "bg-purple-700", btn: "bg-purple-600 hover:bg-purple-700" },
    dark: { badge: "bg-purple-500/20 text-purple-300", icon: "text-purple-300", cta: "bg-purple-400 hover:bg-purple-300" },
  },
  "fintech-nbfc": {
    hue: "blue",
    light: { bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-700", dot: "bg-blue-700", btn: "bg-blue-600 hover:bg-blue-700" },
    dark: { badge: "bg-blue-500/20 text-blue-300", icon: "text-blue-300", cta: "bg-blue-400 hover:bg-blue-300" },
  },
  "gyms-salons-spas": {
    hue: "fuchsia",
    light: { bg: "bg-fuchsia-50", border: "border-fuchsia-200", iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-700", dot: "bg-fuchsia-700", btn: "bg-fuchsia-600 hover:bg-fuchsia-700" },
    dark: { badge: "bg-fuchsia-500/20 text-fuchsia-300", icon: "text-fuchsia-300", cta: "bg-fuchsia-400 hover:bg-fuchsia-300" },
  },
};

/** Teal is the product's own accent — the fallback when a sector has no entry. */
export const DEFAULT_ACCENT: SectorAccent = {
  hue: "teal",
  light: { bg: "bg-teal-50", border: "border-teal-200", iconBg: "bg-teal-100", iconColor: "text-teal-700", dot: "bg-teal-700", btn: "bg-teal-600 hover:bg-teal-700" },
  dark: { badge: "bg-teal-500/20 text-teal-300", icon: "text-teal-300", cta: "bg-teal-400 hover:bg-teal-300" },
};

export const accentFor = (slug: string): SectorAccent => SECTOR_ACCENTS[slug] ?? DEFAULT_ACCENT;

// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy i18n — data-content overlay resolver (MULTILINGUAL_SPEC §4.3B)
//
// English data modules are the single source of truth. Per-locale overlays are
// SPARSE objects of identical shape containing only translated fields, merged
// over English at render time. Rules:
//   • a field missing from the overlay ⇒ English value (graceful degradation)
//   • an overlay key that does not exist in English ⇒ ignored (orphan rule —
//     deleting an English entity must never resurrect it via a stale overlay)
//   • arrays are leaf values: an overlay array replaces the English array
//     wholesale. Overlays must therefore be keyed by stable IDs at the object
//     level, never by array index (spec §4.3B) — partial array translation is
//     expressed as an object keyed by entity id, not a sparse array.
//
// ⛔ Bundle-safety law (spec §4.3): this module is server-only. Overlays load
// via per-locale dynamic import() in Server Components; client components
// receive already-localized props. A statically-imported overlay would ship
// every locale's data in every client bundle — a silent bundle catastrophe
// invisible in dev.
// ─────────────────────────────────────────────────────────────────────────────
import "server-only";

/** Recursive partial of T — the shape of a sparse per-locale overlay. */
export type Overlay<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: Overlay<T[K]> }
    : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function deepMerge<T>(en: T, overlay: unknown): T {
  // Arrays and primitives are leaves: a defined overlay value wins wholesale.
  if (!isPlainObject(en)) {
    return (overlay === undefined ? en : (overlay as T));
  }
  if (!isPlainObject(overlay)) {
    // Shape mismatch (or no overlay at this depth) ⇒ keep English.
    return en;
  }
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(en)) {
    // Only keys present in English are considered — orphan overlay keys are
    // silently ignored (flagged later by verify.mts, spec §4.3).
    out[key] = Object.prototype.hasOwnProperty.call(overlay, key)
      ? deepMerge(en[key], overlay[key])
      : en[key];
  }
  return out as T;
}

/**
 * Resolve a data module for a locale by merging its sparse overlay over the
 * English source. `locale === "en"` (or a missing overlay) returns the English
 * object untouched — same reference, zero cost.
 *
 * The caller supplies the overlay (loaded via per-locale dynamic `import()` on
 * the server, e.g. `lib/data/data-flow/clinics/i18n/hi.ts`); W2+ adds the
 * overlay files themselves.
 */
export function localize<T>(en: T, locale: string, overlay?: Overlay<T>): T {
  if (locale === "en" || overlay === undefined || overlay === null) return en;
  return deepMerge(en, overlay);
}

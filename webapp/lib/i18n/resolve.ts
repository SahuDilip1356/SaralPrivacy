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
// Overlay LOCATION convention (one rule, every module — W4):
//   an overlay lives in an `i18n/` directory beside its English module, named
//   `<module>.<locale>.ts`:
//     lib/data/faqs.ts                      → lib/data/i18n/faqs.hi.ts
//     lib/data/learn-content.ts             → lib/data/i18n/learn-content.hi.ts
//     components/glossary/glossaryData.ts   → components/glossary/i18n/glossaryData.hi.ts
//     components/home/AudienceCards.tsx     → components/home/i18n/AudienceCards.hi.ts
//   Where the English "module" is a directory (a data-flow pack), the module
//   name is the directory and the file is just `<locale>.ts`
//   (lib/data/data-flow/clinics/i18n/hi.ts). Overlay shapes live in
//   lib/i18n/overlay-types.ts; they are loaded ONLY by lib/i18n/content.ts.
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
export function localize<T>(en: T, locale: string, overlay?: NoInfer<Overlay<T>>): T {
  if (locale === "en" || overlay === undefined || overlay === null) return en;
  return deepMerge(en, overlay);
}

/**
 * Localize a list of entities by a STABLE id (never by index — spec §4.3B):
 * each item whose id has an overlay entry gets it merged over its English
 * fields; every other item is returned untouched. Order and membership always
 * follow English, so an overlay can neither reorder nor resurrect an entity.
 */
export function localizeById<T>(
  items: readonly T[],
  locale: string,
  overlay: NoInfer<Record<string, Overlay<T>>> | undefined,
  idOf: (item: T) => string
): T[] {
  if (locale === "en" || !overlay) return items as T[];
  return items.map((item) => {
    const o = Object.prototype.hasOwnProperty.call(overlay, idOf(item))
      ? overlay[idOf(item)]
      : undefined;
    return o === undefined ? item : localize(item, locale, o);
  });
}

/** A translated string when one exists and is non-empty, else the English. */
export function localizeText(en: string, translated: string | undefined): string {
  return typeof translated === "string" && translated.trim() !== "" ? translated : en;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chrome-string helpers for DATA-DRIVEN labels (MULTILINGUAL_SPEC §4.3).
//
// Two mechanisms exist, and this file serves the second:
//   A. Strings that live in components  → moved verbatim into messages/en.json,
//      rendered with t(). English comes from the catalog.
//   B. Strings that live in data modules (lib/data/navigation.ts,
//      lib/data/sectors.ts, lib/learnNav.ts) → the data module REMAINS the
//      English source of truth (spec: "English data modules stay untouched";
//      sectors.ts is the single source of sector labels by standing law).
//      Translations are sparse OVERRIDES in messages/<locale>.json under keys
//      this file derives; a missing override falls back to the module's
//      English. The English render is therefore byte-identical by construction,
//      and a renamed English label merely orphans its override (graceful, G3).
//
// ⛔ Do not use t() for mechanism-B keys: they are deliberately absent from
// en.json, and next-intl renders missing keys as raw key text. Use
// `chromeMessage(messages, path, fallback)` with useMessages()/getMessages().
// ─────────────────────────────────────────────────────────────────────────────

/** Stable message key derived from an English label ("CA Firms" → "ca-firms"). */
export function labelKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Read a string at a dot path inside a message catalog; undefined when absent
 * or not a string. Path segments are raw (already-derived) keys.
 */
export function chromeMessage(
  messages: unknown,
  path: string,
  fallback: string
): string {
  let cur: unknown = messages;
  for (const seg of path.split(".")) {
    if (cur === null || typeof cur !== "object") return fallback;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return typeof cur === "string" ? cur : fallback;
}

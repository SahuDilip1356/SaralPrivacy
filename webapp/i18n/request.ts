// ─────────────────────────────────────────────────────────────────────────────
// next-intl request config — resolves the active locale and loads its message
// catalog. Unknown/missing locales fall back to English (spec G3: untranslated
// always renders English, never breaks).
// ─────────────────────────────────────────────────────────────────────────────
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

/**
 * Per-key English fallback (spec §4.3A: fallback chain locale → en).
 * next-intl does not merge catalogs itself — a key missing from a locale file
 * must resolve to the English string, never to a raw key on screen.
 */
function withEnglishFallback(en: Messages, locale: Messages): Messages {
  const out: Messages = { ...en };
  for (const [key, value] of Object.entries(locale)) {
    const base = out[key];
    out[key] =
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base !== null &&
      typeof base === "object" &&
      !Array.isArray(base)
        ? withEnglishFallback(base as Messages, value as Messages)
        : value;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const en = (await import("../messages/en.json")).default as Messages;
  const messages =
    locale === routing.defaultLocale
      ? en
      : withEnglishFallback(
          en,
          (await import(`../messages/${locale}.json`)).default as Messages
        );

  return { locale, messages };
});

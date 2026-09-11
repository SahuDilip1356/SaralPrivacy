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

/**
 * Load the merged catalog for a locale (en for the default; en ⊕ overrides for
 * others). Exported so the shared SiteShell can hand explicit messages to
 * NextIntlClientProvider — the (backoffice) tree renders the same shell but has
 * no [locale] segment, so the provider must never fall back to reading request
 * headers there (it would force dynamic rendering).
 */
export async function loadMessages(locale: string): Promise<Messages> {
  const en = (await import("../messages/en.json")).default as Messages;
  if (locale === routing.defaultLocale || !hasLocale(routing.locales, locale)) {
    return en;
  }
  return withEnglishFallback(
    en,
    (await import(`../messages/${locale}.json`)).default as Messages
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return { locale, messages: await loadMessages(locale) };
});

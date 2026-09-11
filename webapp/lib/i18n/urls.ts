// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy i18n — locale-aware absolute URL builder (MULTILINGUAL_SPEC §4.4)
//
// The single place absolute site URLs are constructed. English keeps today's
// unprefixed URLs exactly (localePrefix "as-needed" — protects the indexed
// pages); other app locales get a `/<code>` prefix. A locale whose routing gate
// is closed (registry `appLocaleEnabled: false`) resolves unprefixed — an
// absolute URL must never point at a route that 404s.
//
// R3 (deferred to the H1 restructure) sweeps the ~60 hardcoded
// `https://saralprivacy.com/...` canonicals through this helper; W1 only lays
// the plumbing.
// ─────────────────────────────────────────────────────────────────────────────
import { isAppLocale } from "@/lib/data/guide-languages";

export const SITE_ORIGIN = "https://saralprivacy.com";

/**
 * Build an absolute URL for `path`, locale-prefixed when the locale is a
 * routing-enabled non-English app locale.
 *
 *   absoluteUrl("/faq")             → "https://saralprivacy.com/faq"
 *   absoluteUrl("/faq", "en")       → "https://saralprivacy.com/faq"
 *   absoluteUrl("/faq", "hi")       → "https://saralprivacy.com/hi/faq"
 *   absoluteUrl("/", "hi")          → "https://saralprivacy.com/hi"
 *   absoluteUrl("/faq", "xx")       → "https://saralprivacy.com/faq" (gate closed)
 */
export function absoluteUrl(path: string, locale?: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!locale || locale === "en" || !isAppLocale(locale)) {
    return `${SITE_ORIGIN}${normalized}`;
  }
  // "/" collapses to the bare locale root — no trailing slash.
  return `${SITE_ORIGIN}/${locale}${normalized === "/" ? "" : normalized}`;
}

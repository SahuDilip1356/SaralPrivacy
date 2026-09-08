// ─────────────────────────────────────────────────────────────────────────────
// next-intl routing config (MULTILINGUAL_SPEC §4.1)
//
// ⛔ Locales are DERIVED from the single registry (lib/data/guide-languages.ts)
// — never list codes here (spec §3: a second language list is the #1
// predictable failure).
//
//  • localePrefix "as-needed": English keeps today's unprefixed URLs exactly;
//    enabled locales get /<code>/... prefixes.
//  • localeDetection false + localeCookie false: locale comes from the URL
//    prefix ONLY — no Accept-Language redirect (Google crawls from en-US;
//    auto-redirect poisons indexing) and no NEXT_LOCALE cookie steering.
//  • alternateLinks false: hreflang emission is gated per-page via the
//    registry's tier1Live flag (spec §4.4) — the middleware must not blanket
//    Link-header alternates for English-fallback pages.
// ─────────────────────────────────────────────────────────────────────────────
import { defineRouting } from "next-intl/routing";
import { APP_LOCALES, DEFAULT_LANG_CODE } from "@/lib/data/guide-languages";

export const routing = defineRouting({
  locales: APP_LOCALES,
  defaultLocale: DEFAULT_LANG_CODE,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});

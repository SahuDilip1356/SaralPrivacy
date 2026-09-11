"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { GUIDE_LANGUAGES } from "@/lib/data/guide-languages";
import { stripAppLocale } from "@/lib/i18n/chrome";
import { SHOW_LANGUAGE_SWITCHER } from "@/lib/i18n/switcher-gate";
import { IndiaFlagIcon } from "@/components/layout/IndiaFlagIcon";

// Header language switcher (MULTILINGUAL_SPEC §4.1) — a SINGLE toggle chip
// (Dilip, 2026-09-09): shows the CURRENT language ("English" by default);
// clicking it switches the whole site to the next enabled language, same
// pathname ("en" stays unprefixed). With three or more enabled languages this
// design becomes a dropdown — revisit when language #3 is enabled.
//
// • Gated by lib/i18n/switcher-gate.ts: visible on preview/dev builds,
//   hidden on production until NEXT_PUBLIC_SHOW_HINDI flips.
// • Chip styling follows the white-paper language chips: green-50 fill +
//   green-800 ink (AA), focus ring green-700 — never white-on-green-500
//   (2.54:1, fails WCAG).
// • A link, not a button: switching locale is navigation.

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname() ?? "/";

  if (!SHOW_LANGUAGE_SWITCHER) return null;

  // Strip a leading app-locale segment so /hi/faq and /faq both map to /faq.
  const routePathname = stripAppLocale(pathname);

  // Never offer locale-prefixed admin/report URLs — proxy.ts refuses them
  // (spec §10.13) and those trees are English-only forever.
  if (routePathname.startsWith("/admin") || routePathname.startsWith("/report")) {
    return null;
  }

  const languages = GUIDE_LANGUAGES.filter((l) => l.appLocaleEnabled);
  if (languages.length < 2) return null;

  const currentIndex = Math.max(0, languages.findIndex((l) => l.code === locale));
  const current = languages[currentIndex];
  const next = languages[(currentIndex + 1) % languages.length];

  const href =
    next.code === "en"
      ? routePathname || "/"
      : `/${next.code}${routePathname === "/" ? "" : routePathname}`;

  return (
    <Link
      href={href}
      aria-label={`${t("languageAria")}: ${next.roman}`}
      title={next.roman}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 pointer-coarse:min-h-11 text-xs transition-colors",
        "border-2 border-green-600 bg-green-50 text-green-800 font-semibold",
        "hover:bg-green-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
        className
      )}
    >
      <IndiaFlagIcon height={11} className="shrink-0 rounded-[1px]" />
      <span lang={current.locale}>{current.native}</span>
    </Link>
  );
}

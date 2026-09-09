"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GUIDE_LANGUAGES, isAppLocale } from "@/lib/data/guide-languages";
import { SHOW_LANGUAGE_SWITCHER } from "@/lib/i18n/switcher-gate";

// Header language switcher (MULTILINGUAL_SPEC §4.1) — a chip row of the
// routing-enabled languages, native names from the single registry, linking to
// the SAME pathname in the other locale ("en" stays unprefixed).
//
// • Gated by lib/i18n/switcher-gate.ts: visible on preview/dev builds,
//   hidden on production until NEXT_PUBLIC_SHOW_HINDI flips.
// • Chip styling follows the white-paper language chips (the site's chip
//   pattern): active = green-50 fill + green-800 ink (AA), inactive =
//   white + slate-600. Focus ring green-700 — the header's proven pair;
//   never white-on-green-500 (2.54:1, fails WCAG).
// • Links, not radios: switching locale is navigation, so this is a <nav>
//   with aria-labels and aria-current, per the accessible-switcher pattern.

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname() ?? "/";

  if (!SHOW_LANGUAGE_SWITCHER) return null;

  // Strip a leading app-locale segment so /hi/faq and /faq both map to /faq.
  const seg = pathname.split("/")[1] ?? "";
  const routePathname = isAppLocale(seg)
    ? pathname.slice(seg.length + 1) || "/"
    : pathname;

  // Never offer locale-prefixed admin/report URLs — proxy.ts refuses them
  // (spec §10.13) and those trees are English-only forever.
  if (routePathname.startsWith("/admin") || routePathname.startsWith("/report")) {
    return null;
  }

  const languages = GUIDE_LANGUAGES.filter((l) => l.appLocaleEnabled);
  if (languages.length < 2) return null;

  return (
    <nav aria-label={t("languageAria")} className={cn("flex items-center gap-1.5", className)}>
      {languages.map((l) => {
        const active = l.code === locale;
        const href =
          l.code === "en"
            ? routePathname
            : `/${l.code}${routePathname === "/" ? "" : routePathname}`;
        return (
          <Link
            key={l.code}
            href={href}
            lang={l.locale}
            aria-label={l.roman}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 pointer-coarse:min-h-11 text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
              active
                ? "border-2 border-green-600 bg-green-50 text-green-800 font-semibold"
                : "border border-slate-300 bg-white text-slate-600 font-medium hover:border-slate-400 hover:bg-slate-50"
            )}
          >
            {active && <Check size={11} aria-hidden className="shrink-0" />}
            {l.native}
          </Link>
        );
      })}
    </nav>
  );
}

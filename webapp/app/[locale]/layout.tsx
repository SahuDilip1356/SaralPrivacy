import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { APP_LOCALES, isAppLocale } from "@/lib/data/guide-languages";
import { SiteShell, siteMetadata } from "@/components/layout/SiteShell";

// Root layout of the public, locale-routed tree. English serves unprefixed
// URLs (localePrefix "as-needed"); enabled locales serve /<code>/... . The
// <html>/<body> shell lives HERE — not in a layout above [locale] — because
// resolving the locale above this segment requires next-intl's getLocale(),
// which reads headers() and would force the ~100 statically-generated public
// routes into dynamic rendering (P1 gate: English byte-identical, Lighthouse
// unchanged). Admin/report render the same shell via app/(backoffice)/.
export const metadata = siteMetadata;

export function generateStaticParams() {
  return APP_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Unregistered locale ⇒ real 404, never English at a bogus URL (spec §10.12).
  if (!isAppLocale(locale)) notFound();

  // Enables static rendering — next-intl APIs below this point (including the
  // provider's automatic message inheritance) read the locale from this call
  // instead of from request headers.
  setRequestLocale(locale);

  // NextIntlClientProvider lives inside SiteShell (explicit locale + messages),
  // shared with the (backoffice) tree so the chrome cannot drift.
  return <SiteShell locale={locale}>{children}</SiteShell>;
}

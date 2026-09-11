import { SiteShell, siteMetadata, siteViewport } from "@/components/layout/SiteShell";

// Root layout for the trees that never localize (MULTILINGUAL_SPEC §1
// non-goals): /admin/** (auth-gated, noindex) and /report/<token> (tokens are
// case-sensitive and emailed — the URL must never change shape). proxy.ts
// refuses locale prefixes on both. Renders the same shared shell as the
// public [locale] tree so the chrome cannot drift.
export const metadata = siteMetadata;
// PWA theme-color (main's app/layout.tsx export) — must be re-exported from a
// layout module or Next never reads it.
export const viewport = siteViewport;

export default function BackofficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteShell locale="en">{children}</SiteShell>;
}

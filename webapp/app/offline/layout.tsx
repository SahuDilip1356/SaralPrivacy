import { siteViewport } from "@/components/layout/SiteShell";

// /offline is the service worker's navigation fallback, so it deliberately does
// NOT use SiteShell: the shell pulls in Google-hosted fonts, the Header/Footer
// chrome and the Setu widget, none of which resolve with no network. This
// layout is the bare minimum <html>/<body> the page needs to stand alone —
// keep it dependency-free, and keep the page's styles inline (the global CSS
// chunk may not be in the cache when this renders).
//
// It also stays OUTSIDE app/[locale]: the SW requests the literal path
// /offline, which must never carry a locale prefix.

export const viewport = siteViewport;

export default function OfflineLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, backgroundColor: "#0D1322" }}>{children}</body>
    </html>
  );
}

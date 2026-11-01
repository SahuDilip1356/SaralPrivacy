// PILOT ONLY — the site chrome with an empty body: sd-web-design's gate baseline for section mode.
// Delete with /design-pilot before any merge.
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DesignPilotChrome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div />;
}

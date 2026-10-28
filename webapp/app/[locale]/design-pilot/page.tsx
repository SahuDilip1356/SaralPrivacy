// PILOT ONLY — sd-web-design v2 trial of the "How it works" section. Delete before any merge.
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DesignPilot({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HowItWorks />;
}

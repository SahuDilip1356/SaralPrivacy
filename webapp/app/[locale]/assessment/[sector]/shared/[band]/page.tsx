import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { getBandByLabel } from "@/lib/data/industry-assessment/bands";
import {
  BAND_INK,
  OG_BASE,
  SHARE_CARD_SIZE,
  SHARE_PARAMS,
  bandFromSlug,
  bandSlugFor,
  shareCardPath,
  shareSectorFor,
} from "@/lib/data/result-share";
import { ShareLandingView } from "@/components/share/ShareLandingView";

// Share landing — where a WhatsApp result card opens. Public and PII-free: the
// URL carries sector + band only (never a score or report token), so these are
// 48 static pages. noindex: they are share landings, not content, and they sit
// outside the sitemap. Read by the RECIPIENT, who has not taken the scan — so
// the band is explained in neutral words (share.bands.*), never the pack's
// "Your pharmacy has…" copy, which speaks to the person who took it.

type Params = { locale: string; sector: string; band: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return SHARE_PARAMS;
}

// The CTA carries the attribution: src=share feeds assessment_start, and the
// UTM set is what Vercel Analytics groups the landing traffic by.
const scanHref = (sector: string) =>
  `/assessment/${sector}?src=share&utm_source=whatsapp&utm_medium=share&utm_campaign=result_card`;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, sector, band } = await params;
  const label = bandFromSlug(band);
  // dynamicParams=false: unknown params 404 at the router and never reach here.
  if (!label) return {};
  const t = await getTranslations({ locale, namespace: "share" });
  const subject = t(`sectors.${sector}.subject`);
  const title = `${t("card.checked", { subject })}: ${label}`;
  const description = t("landing.metaDescription", { gap: t(`sectors.${sector}.gap`) });
  const image = {
    url: shareCardPath(locale, sector, bandSlugFor(label)),
    ...SHARE_CARD_SIZE,
    alt: t("card.alt", { subject, band: label }),
  };
  return {
    title,
    description,
    openGraph: { ...OG_BASE, title, description, images: [image] },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default async function SharedResultPage({ params }: { params: Promise<Params> }) {
  const { locale, sector, band } = await params;
  const s = shareSectorFor(sector);
  const label = bandFromSlug(band);
  if (!s || !label) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "share" });
  const chip = t(`sectors.${sector}.chip`);
  const noun = t(`sectors.${sector}.noun`);

  return (
    <div className="min-h-screen bg-pearl-50">
      <ShareLandingView sector={sector} band={band} />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* The shared result */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center sm:p-9">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${s.accent.light.border} ${s.accent.light.bg} ${s.accent.light.iconColor}`}
          >
            <span className={`h-2 w-2 rounded-full ${s.accent.light.dot}`} aria-hidden="true" />
            {chip} · {t("landing.sharedResult")}
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-navy-700 sm:text-3xl">
            {t("card.checked", { subject: t(`sectors.${sector}.subject`) })}
          </h1>
          <div
            className="mt-4 inline-block rounded-xl px-6 py-2 text-2xl font-bold sm:text-3xl"
            style={{ backgroundColor: getBandByLabel(label).color, color: BAND_INK[label] }}
          >
            {label}
          </div>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-600">
            <span className="font-semibold text-navy-700">{t("landing.meaning")}</span> {t(`bands.${band}`)}
          </p>
        </div>

        {/* The sector's typical gap — labelled typical, it is not the sharer's */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
          <p className={`text-xs font-bold uppercase tracking-wide ${s.accent.light.iconColor}`}>
            {t("card.typicalGap", { sector: chip })}
          </p>
          <p className="mt-1.5 text-base leading-relaxed text-slate-700">{t(`sectors.${sector}.gap`)}</p>
        </div>

        {/* The ask */}
        <div className="mt-5 rounded-xl bg-navy-700 p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold text-white">{t("landing.ctaHeading", { noun })}</h2>
          <p className="mt-1 text-sm text-slate-300">{t("landing.ctaSub")}</p>
          <Link
            href={scanHref(sector)}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-400 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
          >
            {t("landing.cta", { noun })} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">{t("landing.privacy")}</p>
      </div>
    </div>
  );
}

"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { BandLabel } from "@/lib/data/industry-assessment/bands";
import { bandSlugFor } from "@/lib/data/result-share";
import { routing } from "@/i18n/routing";

// "Share on WhatsApp" on the assessment result screen. One component for all
// 12 sector clients — the presentation is identical across sectors by law.
//
// What leaves the page: a link to /assessment/<sector>/shared/<band> and the
// sharer's one-line message. Sector + band only — never the score, the answers
// or the report token. wa.me is a client-side deep link: WhatsApp receives
// nothing from us, so privacy-vendors.ts gains no row.

const noop = () => () => {};
const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
// The shared link points at the site the visitor is on (a preview shares a
// preview); the server snapshot is production.
const currentOrigin = () => window.location.origin;
const PROD_ORIGIN = () => "https://saralprivacy.com";

export function ShareResult({
  sector,
  band,
  className = "",
}: {
  /** the assessment route slug, e.g. "pharmacies" */
  sector: string;
  band: BandLabel;
  className?: string;
}) {
  const t = useTranslations("share");
  const locale = useLocale();
  const nativeShare = useSyncExternalStore(noop, canNativeShare, () => false);
  const origin = useSyncExternalStore(noop, currentOrigin, PROD_ORIGIN);
  const [copied, setCopied] = useState(false);

  const slug = bandSlugFor(band);
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const url = `${origin}${prefix}/assessment/${sector}/shared/${slug}`;
  const text = t(`text.${slug}`, { url });
  const track = (channel: "whatsapp" | "native" | "copy") =>
    trackEvent.resultShareClick({ sector, band: slug, channel });

  async function shareOther() {
    if (nativeShare) {
      track("native");
      try {
        await navigator.share({ text });
      } catch {
        // dismissed the sheet — nothing to do
      }
      return;
    }
    track("copy");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(t("button.copy"), url);
    }
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
      <p className="text-sm font-semibold text-navy-700">{t("button.heading")}</p>
      <p className="mt-0.5 text-xs text-slate-500">{t("button.privacy")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2"
        >
          <MessageCircle size={16} aria-hidden="true" /> {t("button.whatsapp")}
        </a>
        <button
          type="button"
          onClick={shareOther}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-700 hover:bg-pearl-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-2"
        >
          {nativeShare ? (
            <>
              <Share2 size={16} aria-hidden="true" /> {t("button.native")}
            </>
          ) : copied ? (
            <>
              <Check size={16} aria-hidden="true" /> {t("button.copied")}
            </>
          ) : (
            <>
              <Link2 size={16} aria-hidden="true" /> {t("button.copy")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

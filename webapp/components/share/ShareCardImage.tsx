// ─────────────────────────────────────────────────────────────────────────────
// Share card image — the 1200×630 preview WhatsApp unfurls for a shared result
// (/assessment/<sector>/shared/<band>) and for each assessment page itself.
// Served as static PNGs by app/og/[locale]/[sector]/[file]/route.ts.
//
// One layout, two variants:
//  • band   — "A pharmacy checked its DPDPA readiness" + the band pill
//  • sector — "Is your pharmacy ready for DPDPA?" (no result, the 12 scan pages)
// Both carry the sector's own "typical gap" line, labelled as typical, because
// the card travels without the message text.
//
// Rendered by next/og (Satori): inline styles only, every multi-child <div>
// needs display:flex, and colours are literal hex — Tailwind classes and our
// oklch tokens don't exist here. Every text/background pair is measured:
// navy-700 ground; sector hex ≥ 8.6:1; band ink per BAND_INK ≥ 4.8:1.
// ─────────────────────────────────────────────────────────────────────────────
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createTranslator } from "next-intl";
import { loadMessages } from "@/i18n/request";
import { getBandByLabel, type BandLabel } from "@/lib/data/industry-assessment/bands";
import { BAND_INK, SHARE_CARD_SIZE } from "@/lib/data/result-share";

const NAVY_700 = "#121A2E";
const NAVY_100 = "#C5CDD9";
const NAVY_200 = "#9FADBF";
const NAVY_900 = "#080D17";
const GREEN_400 = "#1FCC8D";

export interface ShareCardCopy {
  /** "Pharmacies" — the sector chip, also fills the typical-gap label */
  chip: string;
  /** band: "A pharmacy checked its DPDPA readiness" · sector: "Is your pharmacy ready for DPDPA?" */
  headline: string;
  /** "Typical gap in pharmacies" (rendered uppercase) */
  gapLabel: string;
  gap: string;
  cta: string;
}

/**
 * Card copy from the `share` catalog. `band` present ⇒ the shared-result variant.
 * Loads the catalog directly: the image route sits outside [locale], where
 * getTranslations() would fall back to English whatever `locale` says.
 */
export async function shareCardCopy(locale: string, sector: string, band?: BandLabel): Promise<ShareCardCopy> {
  // loadMessages() returns an untyped catalog, so createTranslator can't infer
  // its keys; the keys are pinned by result-share.test.ts instead.
  const t = createTranslator({
    locale,
    messages: await loadMessages(locale),
    namespace: "share",
  }) as unknown as (key: string, values?: Record<string, string>) => string;
  const chip = t(`sectors.${sector}.chip`);
  return {
    chip,
    headline: band
      ? t("card.checked", { subject: t(`sectors.${sector}.subject`) })
      : t("card.askSector", { noun: t(`sectors.${sector}.noun`) }),
    gapLabel: t("card.typicalGap", { sector: chip }),
    gap: t(`sectors.${sector}.gap`),
    cta: band ? t("card.ctaShared") : t("card.ctaSector"),
  };
}

export async function renderShareCard(opts: {
  copy: ShareCardCopy;
  sectorHex: string;
  band?: BandLabel;
}): Promise<ImageResponse> {
  const { copy, sectorHex, band } = opts;
  const root = process.cwd();
  const [interRegular, interBold, emblem] = await Promise.all([
    readFile(join(root, "lib/fonts/Inter-Regular.ttf")),
    readFile(join(root, "lib/fonts/Inter-Bold.ttf")),
    readFile(join(root, "public/logo-emblem.png")),
  ]);
  const emblemSrc = `data:image/png;base64,${emblem.toString("base64")}`;
  const fill = band ? getBandByLabel(band).color : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: NAVY_700,
          padding: "52px 72px 48px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Sector hue — the one colour that says which trade this is. */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: sectorHex }} />

        {/* Header: wordmark (as in the footer: emblem on a white disc) + sector chip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Satori renders plain <img> only — next/image does not exist here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={emblemSrc} width={48} height={48} alt="" />
            </div>
            <div style={{ display: "flex", marginLeft: 16, fontSize: 32, fontWeight: 700, color: "#FFFFFF" }}>
              Saral<span style={{ color: GREEN_400 }}>Privacy</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 24px",
              borderRadius: 999,
              border: `2px solid ${sectorHex}`,
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: sectorHex }} />
            <div style={{ marginLeft: 12, fontSize: 26, fontWeight: 700, color: sectorHex }}>{copy.chip}</div>
          </div>
        </div>

        {/* Body — centred, so a square crop still shows the result. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            textAlign: "center",
          }}
        >
          {band && fill ? (
            // An explicit column: Satori lays a fragment's children out as a row.
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 34, color: NAVY_100 }}>{copy.headline}</div>
              <div
                style={{
                  marginTop: 20,
                  padding: "8px 48px",
                  borderRadius: 22,
                  background: fill,
                  color: BAND_INK[band],
                  fontSize: 72,
                  fontWeight: 700,
                  letterSpacing: -1,
                }}
              >
                {band}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 64, fontWeight: 700, color: "#FFFFFF", letterSpacing: -1, maxWidth: 1000, textWrap: "balance" }}>
              {copy.headline}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: sectorHex,
              }}
            >
              {copy.gapLabel}
            </div>
            <div style={{ marginTop: 8, fontSize: 30, color: "#FFFFFF", maxWidth: 940, lineHeight: 1.3, textWrap: "balance" }}>
              {copy.gap}
            </div>
          </div>
        </div>

        {/* Footer: the ask + where it goes */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              padding: "14px 32px",
              borderRadius: 999,
              background: GREEN_400,
              color: NAVY_900,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {copy.cta}
          </div>
          <div style={{ fontSize: 26, color: NAVY_200 }}>saralprivacy.com</div>
        </div>
      </div>
    ),
    {
      ...SHARE_CARD_SIZE,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    },
  );
}


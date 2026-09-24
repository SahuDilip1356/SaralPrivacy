import { APP_LOCALES } from "@/lib/data/guide-languages";
import { renderShareCard, shareCardCopy } from "@/components/share/ShareCardImage";
import { SHARE_BANDS, SHARE_SECTORS, bandFromSlug, shareSectorFor } from "@/lib/data/result-share";

// The WhatsApp preview images, as static PNGs (see shareCardPath):
//   /og/<locale>/<sector>/scan.png      — the assessment page's own card
//   /og/<locale>/<sector>/<band>.png    — a shared result (sector + band only)
// All prerendered at build; any other path is a 404.

type Params = { locale: string; sector: string; file: string };

export const dynamic = "force-static";
export const dynamicParams = false;

const FILES = ["scan", ...SHARE_BANDS.map((b) => b.slug)].map((f) => `${f}.png`);

export function generateStaticParams(): Params[] {
  return APP_LOCALES.flatMap((locale) =>
    SHARE_SECTORS.flatMap((s) => FILES.map((file) => ({ locale, sector: s.slug, file }))),
  );
}

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { locale, sector, file } = await params;
  const s = shareSectorFor(sector);
  const name = file.endsWith(".png") ? file.slice(0, -4) : "";
  const band = name === "scan" ? undefined : bandFromSlug(name);
  if (!s || (name !== "scan" && !band)) return new Response("Not found", { status: 404 });

  return renderShareCard({ copy: await shareCardCopy(locale, sector, band), sectorHex: s.hex, band });
}

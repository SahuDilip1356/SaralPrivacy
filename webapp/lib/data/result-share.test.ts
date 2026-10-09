// Result share card contract tests.
// Run: node --test --experimental-strip-types lib/data/result-share.test.ts
//
// The share image is the brand in someone else's chat, so the rules that make
// it safe are pinned here rather than remembered:
//   1. every band label is legible on its own fill (WCAG AA 4.5:1) — white
//      fails on three of the four fills, which is why BAND_INK exists;
//   2. every sector hue is legible on the navy-700 card ground;
//   3. the four URL band slugs cover the engine's four bands, one-to-one;
//   4. every sector has its card copy in messages/en.json (no raw keys);
//   5. all 12 assessment pages carry the sector card (presentation law — one
//      sector never ships a preview the other eleven lack);
//   6. card URLs are .png paths the locale proxy never redirects.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { RISK_BANDS } from "./industry-assessment/bands.ts";
import { BAND_INK, SHARE_BANDS, SHARE_SECTORS, bandFromSlug, bandSlugFor, shareCardPath } from "./result-share.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));

const NAVY_700 = "#121A2E";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("every band label clears 4.5:1 on its own fill", () => {
  for (const band of RISK_BANDS) {
    const ratio = contrast(BAND_INK[band.label], band.color);
    assert.ok(ratio >= 4.5, `${band.label}: ${BAND_INK[band.label]} on ${band.color} = ${ratio.toFixed(2)}:1`);
  }
});

test("every sector hue clears 4.5:1 on the navy-700 card", () => {
  for (const s of SHARE_SECTORS) {
    assert.match(s.hex, /^#[0-9A-F]{6}$/, `${s.slug}: hex must be a literal #RRGGBB`);
    const ratio = contrast(s.hex, NAVY_700);
    assert.ok(ratio >= 4.5, `${s.slug}: ${s.hex} on navy-700 = ${ratio.toFixed(2)}:1`);
  }
});

test("band slugs map one-to-one onto the engine's bands", () => {
  assert.deepEqual(
    SHARE_BANDS.map((b) => b.label).sort(),
    RISK_BANDS.map((b) => b.label).sort(),
  );
  for (const b of SHARE_BANDS) {
    assert.equal(bandFromSlug(b.slug), b.label);
    assert.equal(bandSlugFor(b.label), b.slug);
  }
  assert.equal(bandFromSlug("bogus"), undefined);
});

test("every sector has its card copy in messages/en.json", () => {
  assert.equal(SHARE_SECTORS.length, 12);
  for (const s of SHARE_SECTORS) {
    const copy = en.share?.sectors?.[s.slug];
    for (const key of ["chip", "subject", "noun", "gap"]) {
      assert.ok(typeof copy?.[key] === "string" && copy[key].length > 0, `share.sectors.${s.slug}.${key}`);
    }
  }
  for (const key of ["checked", "askSector", "typicalGap", "ctaShared", "ctaSector"]) {
    assert.ok(en.share?.card?.[key], `share.card.${key}`);
  }
});

test("all 12 assessment pages carry their own sector card", () => {
  for (const s of SHARE_SECTORS) {
    const file = join(root, "app/[locale]/assessment", s.slug, "page.tsx");
    assert.ok(existsSync(file), `missing ${file}`);
    assert.match(readFileSync(file, "utf8"), new RegExp(`scanCardImage\\("${s.slug}"\\)`));
  }
});

test("card paths are static .png files outside the locale proxy", () => {
  assert.equal(shareCardPath("en", "pharmacies"), "/og/en/pharmacies/scan.png");
  assert.equal(shareCardPath("en", "pharmacies", "moderate"), "/og/en/pharmacies/moderate.png");
  // proxy.ts skips any path containing a dot — the card must never be redirected
  for (const s of SHARE_SECTORS) assert.match(shareCardPath("en", s.slug), /\.png$/);
});

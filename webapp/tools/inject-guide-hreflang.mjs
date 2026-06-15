// One-off: stamp each static Guide HTML with the correct <html lang>, a
// self-canonical, and hreflang alternates across all languages. Idempotent —
// re-running replaces the injected block. Run from webapp/webapp:
//   node tools/inject-guide-hreflang.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://saralprivacy.com";
const LANGS = [
  { code: "en", locale: "en-IN" },
  { code: "hi", locale: "hi-IN" },
  { code: "gu", locale: "gu-IN" },
  { code: "mr", locale: "mr-IN" },
  { code: "kn", locale: "kn-IN" },
  { code: "ta", locale: "ta-IN" },
  { code: "te", locale: "te-IN" },
];

const START = "<!-- saral:hreflang:start -->";
const END = "<!-- saral:hreflang:end -->";

function block(code) {
  const lines = [
    START,
    `<link rel="canonical" href="${SITE}/guides/dpdpa-guide-${code}.html">`,
    ...LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l.locale}" href="${SITE}/guides/dpdpa-guide-${l.code}.html">`
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/white-paper">`,
    END,
  ];
  return lines.join("\n");
}

for (const { code, locale } of LANGS) {
  const path = new URL(`../public/guides/dpdpa-guide-${code}.html`, import.meta.url);
  let html = readFileSync(path, "utf8");

  // Correct the document language.
  html = html.replace(/<html[^>]*>/i, `<html lang="${locale}">`);

  // Remove any prior injected block, then insert a fresh one before </head>.
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\n?`), "");
  html = html.replace(/<\/head>/i, `${block(code)}\n</head>`);

  writeFileSync(path, html);
  console.log(`stamped ${code} (lang=${locale})`);
}

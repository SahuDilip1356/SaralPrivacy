// One-off: upload the 7 language Guide PDFs to Vercel Blob and print their URLs.
// Run from webapp/webapp:  node tools/upload-guide-pdfs.mjs
// Reads BLOB_READ_WRITE_TOKEN from env or .env.local. Deterministic pathnames
// (no random suffix) so the URLs are stable; re-run after `del` to replace.
import { readFileSync } from "node:fs";
import { put } from "@vercel/blob";

const SRC = "/Users/sahudilip/Downloads/SaralPrivacy Whitepaper/SaralPrivacy All Language Guide";
const FILES = [
  { code: "en", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_English.pdf" },
  { code: "hi", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_hi.pdf" },
  { code: "gu", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_gu.pdf" },
  { code: "mr", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_mr.pdf" },
  { code: "kn", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_kn.pdf" },
  { code: "ta", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_ta.pdf" },
  { code: "te", file: "SaralPrivacy_DPDPA_Whitepaper_v6.1_Final_te.pdf" },
];

function loadToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const line = env.split("\n").find((l) => l.startsWith("BLOB_READ_WRITE_TOKEN="));
  if (!line) throw new Error("BLOB_READ_WRITE_TOKEN not found in env or .env.local");
  return line.slice("BLOB_READ_WRITE_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
}

const token = loadToken();
const results = {};
for (const { code, file } of FILES) {
  const body = readFileSync(`${SRC}/${file}`);
  const { url } = await put(`guides/dpdpa-guide-${code}.pdf`, body, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: "application/pdf",
  });
  results[code] = url;
  console.log(`${code}: ${url}`);
}
console.log("\nJSON:\n" + JSON.stringify(results, null, 2));

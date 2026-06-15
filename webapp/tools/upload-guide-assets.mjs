// One-off: upload the Guide HTML's referenced images (logo + 8 infographics) to
// Vercel Blob under guides/assets/, so the static HTML can point at absolute CDN
// URLs instead of broken relative paths. Run from webapp/webapp:
//   node tools/upload-guide-assets.mjs
import { readFileSync, readdirSync } from "node:fs";
import { put } from "@vercel/blob";

const SRC = "/Users/sahudilip/Downloads/SaralPrivacy Whitepaper";
const ASSETS = [
  { local: `${SRC}/SaralPrivacyLogo1.png`, name: "SaralPrivacyLogo1.png" },
  ...readdirSync(`${SRC}/infographics`)
    .filter((f) => f.endsWith(".png"))
    .map((f) => ({ local: `${SRC}/infographics/${f}`, name: f })),
];

function loadToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const line = env.split("\n").find((l) => l.startsWith("BLOB_READ_WRITE_TOKEN="));
  if (!line) throw new Error("BLOB_READ_WRITE_TOKEN not found");
  return line.slice("BLOB_READ_WRITE_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
}

const token = loadToken();
for (const { local, name } of ASSETS) {
  const { url } = await put(`guides/assets/${name}`, readFileSync(local), {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: "image/png",
  });
  console.log(`${name} -> ${url}`);
}

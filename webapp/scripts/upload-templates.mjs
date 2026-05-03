/**
 * upload-templates.mjs
 *
 * One-time script: uploads all 5 DPDPA template files from public/templates/
 * into Vercel Blob under the `dpdpa-templates/` prefix.
 *
 * Run once after setting BLOB_READ_WRITE_TOKEN:
 *
 *   BLOB_READ_WRITE_TOKEN=<your-token> node scripts/upload-templates.mjs
 *
 * How to get BLOB_READ_WRITE_TOKEN:
 *   1. Go to Vercel Dashboard → your project → Storage tab
 *   2. Create a Blob store (or use an existing one)
 *   3. Copy the BLOB_READ_WRITE_TOKEN from the store's ".env.local" section
 *   4. Add it to your .env.local and to Vercel Environment Variables
 *
 * After running this script, the API route at /api/templates/download
 * will serve files from Blob automatically (Blob is checked first,
 * public/ is the fallback).
 */

import { put } from "@vercel/blob";
import { readFileSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, "../public/templates");
const BLOB_PREFIX = "dpdpa-templates";

// Map: local filename → Blob path (must match templateExtensions in validation.ts)
const templates = [
  { file: "privacy-notice.docx",                 blob: `${BLOB_PREFIX}/privacy-notice.docx` },
  { file: "consent-language-examples.docx",       blob: `${BLOB_PREFIX}/consent-language-examples.docx` },
  { file: "data-inventory-register.xlsx",         blob: `${BLOB_PREFIX}/data-inventory-register.xlsx` },
  { file: "dsr-grievance-sop.docx",               blob: `${BLOB_PREFIX}/dsr-grievance-sop.docx` },
  { file: "vendor-data-sharing-register.xlsx",    blob: `${BLOB_PREFIX}/vendor-data-sharing-register.xlsx` },
];

const MIME = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "\n❌  BLOB_READ_WRITE_TOKEN is not set.\n" +
    "    Run: BLOB_READ_WRITE_TOKEN=<token> node scripts/upload-templates.mjs\n"
  );
  process.exit(1);
}

console.log("\n📤  Uploading DPDPA templates to Vercel Blob...\n");

let successCount = 0;

for (const { file, blob } of templates) {
  const localPath = join(TEMPLATES_DIR, file);
  const ext = "." + file.split(".").pop();
  const contentType = MIME[ext] || "application/octet-stream";

  try {
    const buffer = readFileSync(localPath);
    const result = await put(blob, buffer, {
      access:      "public",
      contentType,
      addRandomSuffix: false, // deterministic URLs — required for API route lookup
    });

    console.log(`  ✅  ${file}`);
    console.log(`      URL: ${result.url}\n`);
    successCount++;
  } catch (err) {
    console.error(`  ❌  ${file}: ${err.message}\n`);
  }
}

console.log(`\n✅  Done. ${successCount}/${templates.length} templates uploaded to Vercel Blob.`);

if (successCount === templates.length) {
  console.log(
    "\n🎉  All templates are live on Blob.\n" +
    "    The /api/templates/download route will now serve from Blob.\n" +
    "    Make sure BLOB_READ_WRITE_TOKEN is also set in Vercel Environment Variables.\n"
  );
} else {
  console.warn(
    "\n⚠️   Some uploads failed. The API will fall back to public/ for missing files.\n" +
    "    Fix the errors above and re-run this script.\n"
  );
}

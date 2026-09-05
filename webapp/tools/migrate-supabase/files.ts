// files.ts — S6/M7 storage migration (spec §7): copy every file in the
// Appwrite bucket to the Supabase 'infographics' bucket and emit
// file-map.json (legacy file id → public URL) for transform.ts to rewrite
// blog_posts.infographic_url during load.
//
// Idempotent: uploads use upsert, the map is regenerated each run.
// Plain REST against Appwrite (SDK broken on Node>=26), supabase-js upload.
//
// Run from webapp/:
//   set -a; . ./.env.local; set +a
//   node --experimental-strip-types tools/migrate-supabase/files.ts

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const env = (k: string): string => (process.env[k] || "").replace(/\\n/g, "").trim();
const need = (k: string): string => {
  const v = env(k);
  if (!v) throw new Error(`Missing env var ${k}`);
  return v;
};

const ENDPOINT = need("APPWRITE_ENDPOINT").replace(/\/$/, "");
const HEADERS = { "X-Appwrite-Project": need("APPWRITE_PROJECT_ID"), "X-Appwrite-Key": need("APPWRITE_API_KEY") };
const BUCKET_ID = need("APPWRITE_BUCKET_ID");
const SNAP_DIR = env("SNAPSHOT_DIR") || "/private/tmp/saralprivacy-migration-snapshots";
const SB_BUCKET = "infographics";

const supabase = createClient(need("SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});

const q = (method: string, ...values: unknown[]): string =>
  `queries[]=${encodeURIComponent(JSON.stringify({ method, values }))}`;

async function listAllFiles(): Promise<Array<{ $id: string; name: string; mimeType: string; sizeOriginal: number }>> {
  const files: Array<{ $id: string; name: string; mimeType: string; sizeOriginal: number }> = [];
  let cursor: string | null = null;
  for (;;) {
    const queries: string[] = [q("limit", 100), ...(cursor ? [q("cursorAfter", cursor)] : [])];
    const res = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files?${queries.join("&")}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`list files → ${res.status}`);
    const page = await res.json();
    files.push(...page.files);
    if (page.files.length < 100) return files;
    cursor = page.files[page.files.length - 1].$id;
  }
}

function extFor(mime: string, name: string): string {
  if (name.includes(".")) return name.slice(name.lastIndexOf("."));
  if (mime === "image/png") return ".png";
  if (mime === "image/svg+xml") return ".svg";
  if (mime === "image/jpeg") return ".jpg";
  return "";
}

const files = await listAllFiles();
console.log(`bucket ${BUCKET_ID}: ${files.length} files`);

const map: Record<string, string> = {};
let copied = 0, failed = 0;
for (const f of files) {
  try {
    const res = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${f.$id}/download`, { headers: HEADERS });
    if (!res.ok) throw new Error(`download → ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length !== f.sizeOriginal) {
      console.warn(`  ! ${f.$id}: size ${buf.length} != listed ${f.sizeOriginal} (continuing)`);
    }
    const path = `${f.$id}${extFor(f.mimeType, f.name)}`;
    const { error } = await supabase.storage.from(SB_BUCKET).upload(path, buf, { contentType: f.mimeType, upsert: true });
    if (error) throw new Error(`upload: ${error.message}`);
    map[f.$id] = supabase.storage.from(SB_BUCKET).getPublicUrl(path).data.publicUrl;
    copied++;
  } catch (e) {
    failed++;
    console.error(`  ✗ ${f.$id}: ${e instanceof Error ? e.message : e}`);
  }
}

const out = join(SNAP_DIR, "file-map.json");
writeFileSync(out, JSON.stringify(map, null, 2) + "\n");
console.log(`copied ${copied}, failed ${failed} → map: ${out}`);

// Verify: every mapped URL must serve 200.
let ok = 0, bad = 0;
for (const [id, url] of Object.entries(map)) {
  const res = await fetch(url, { method: "HEAD" });
  if (res.ok) ok++;
  else { bad++; console.error(`  ✗ ${id} ${url} → ${res.status}`); }
}
console.log(`URL check: ${ok} ok, ${bad} bad`);
if (failed || bad) process.exitCode = 1;

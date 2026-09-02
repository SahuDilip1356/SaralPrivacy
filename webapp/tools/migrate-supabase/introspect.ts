// introspect.ts — S2 step 1 of SUPABASE_MIGRATION_SPEC.md.
//
// Reads the LIVE Appwrite schema (attributes + indexes), per-collection row
// counts, and the storage bucket file count, and writes schema-report.json
// next to this file. The Postgres DDL is written against that report, never
// against memory — a hand-written column that introspection didn't confirm is
// a spec violation.
//
// Talks to the Appwrite REST API with plain fetch on purpose: the node-appwrite
// SDK (v22) passes an undici interceptor whose handler interface Node >= 26
// rejects (UND_ERR_INVALID_ARG "invalid onError method"), so the SDK cannot be
// used from local tooling on this machine. The REST surface is stable and this
// script needs three GETs per collection.
//
// Contains NO row data (schema + counts + file metadata only), so the report
// is safe to commit.
//
// Run from webapp/:
//   set -a; . ./.env.local; set +a
//   node --experimental-strip-types tools/migrate-supabase/introspect.ts

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// `vercel env pull`-style .env files append a LITERAL backslash-n to some
// values ("...3610\n") — strip those escapes as well as real whitespace.
const env = (k: string): string =>
  (process.env[k] || "").replace(/\\n/g, "").trim();
const need = (k: string): string => {
  const v = env(k);
  if (!v) throw new Error(`Missing env var ${k} — source .env.local first`);
  return v;
};

const ENDPOINT = need("APPWRITE_ENDPOINT").replace(/\/$/, "");
const HEADERS = {
  "X-Appwrite-Project": need("APPWRITE_PROJECT_ID"),
  "X-Appwrite-Key": need("APPWRITE_API_KEY"),
  "Content-Type": "application/json",
};
const DB_ID = need("APPWRITE_DATABASE_ID");
const BUCKET_ID = env("APPWRITE_BUCKET_ID"); // optional: bucket may be absent

// The 19 collections of lib/appwrite.ts COLLECTIONS — keep in sync.
const COLLECTION_IDS = [
  "leads", "subscribers", "downloads", "assessments", "briefings",
  "consent_log", "survey_responses", "blog_posts", "blogger_accounts",
  "template_downloads", "outreach_contacts", "email_send_log", "ai_citations",
  "notice_captures", "notice_runs", "notice_events", "business_profiles",
  "dsar_requests", "chat_feedback",
] as const;

async function get(path: string): Promise<any> {
  const res = await fetch(`${ENDPOINT}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

const q = (method: string, ...values: unknown[]): string =>
  `queries[]=${encodeURIComponent(JSON.stringify({ method, values }))}`;

// Appwrite list endpoints default to 25 items — page through with
// limit+offset until `total` is exhausted, or truncated attribute lists
// produce truncated DDL (Bugbot caught assessments/survey_responses at
// exactly 25).
async function getAll(path: string, field: string): Promise<unknown[]> {
  const items: unknown[] = [];
  for (;;) {
    const page = await get(`${path}?${q("limit", 100)}&${q("offset", items.length)}`);
    items.push(...page[field]);
    if (items.length >= page.total || page[field].length === 0) return items;
  }
}

interface CollectionReport {
  id: string;
  exists: boolean;
  total: number | null;
  attributes: unknown[];
  indexes: unknown[];
  error?: string;
}

async function inspectCollection(id: string): Promise<CollectionReport> {
  try {
    const base = `/databases/${DB_ID}/collections/${id}`;
    const [attributes, indexes, docs] = await Promise.all([
      getAll(`${base}/attributes`, "attributes"),
      getAll(`${base}/indexes`, "indexes"),
      get(`${base}/documents?${q("limit", 1)}`),
    ]);
    return { id, exists: true, total: docs.total, attributes, indexes };
  } catch (e) {
    return {
      id, exists: false, total: null, attributes: [], indexes: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function inspectBucket(): Promise<Record<string, unknown>> {
  if (!BUCKET_ID) return { bucketId: "", error: "APPWRITE_BUCKET_ID not set" };
  try {
    const page = await get(`/storage/buckets/${BUCKET_ID}/files?${q("limit", 100)}`);
    return {
      bucketId: BUCKET_ID,
      total: page.total,
      // First page of metadata is enough for the report; files.ts (S6) walks
      // the full manifest with the same REST pattern when it migrates content.
      sample: page.files.map((f: any) => ({
        id: f.$id, name: f.name, mimeType: f.mimeType, sizeOriginal: f.sizeOriginal, createdAt: f.$createdAt,
      })),
    };
  } catch (e) {
    return { bucketId: BUCKET_ID, error: e instanceof Error ? e.message : String(e) };
  }
}

const collections: CollectionReport[] = [];
for (const id of COLLECTION_IDS) {
  const report = await inspectCollection(id);
  collections.push(report);
  console.log(`${report.exists ? "✓" : "✗"} ${id}: ${report.exists ? `${report.total} rows, ${report.attributes.length} attrs` : report.error}`);
}
const bucket = await inspectBucket();
console.log("error" in bucket ? `✗ bucket: ${bucket.error}` : `✓ bucket ${bucket.bucketId}: ${bucket.total} files`);

const report = {
  generatedAt: new Date().toISOString(),
  endpoint: ENDPOINT,
  databaseId: DB_ID,
  collections,
  bucket,
};
const out = fileURLToPath(new URL("./schema-report.json", import.meta.url));
writeFileSync(out, JSON.stringify(report, null, 2) + "\n");
console.log(`\nreport written: ${out}`);

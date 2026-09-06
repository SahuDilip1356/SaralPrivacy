// export.ts — S4 step 1 of SUPABASE_MIGRATION_SPEC.md.
//
// Paginated export of every Appwrite collection to JSONL snapshots. Plain
// REST (the node-appwrite SDK breaks on Node >= 26 — see introspect.ts).
//
// ⚠️ PII: snapshots contain emails/phones. They are written OUTSIDE the repo
// (default /private/tmp, override with SNAPSHOT_DIR) and must never be
// committed or copied into an iCloud-synced path.
//
// Idempotent: re-running overwrites each collection's snapshot with the
// current full state — which is exactly the delta-sync at flip time.
//
// Run from webapp/:
//   set -a; . ./.env.local; set +a
//   node --experimental-strip-types tools/migrate-supabase/export.ts [collection ...]

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const env = (k: string): string => (process.env[k] || "").replace(/\\n/g, "").trim();
const need = (k: string): string => {
  const v = env(k);
  if (!v) throw new Error(`Missing env var ${k} — source .env.local first`);
  return v;
};

const ENDPOINT = need("APPWRITE_ENDPOINT").replace(/\/$/, "");
const HEADERS = {
  "X-Appwrite-Project": need("APPWRITE_PROJECT_ID"),
  "X-Appwrite-Key": need("APPWRITE_API_KEY"),
};
const DB_ID = need("APPWRITE_DATABASE_ID");
const OUT_DIR = env("SNAPSHOT_DIR") || "/private/tmp/saralprivacy-migration-snapshots";

// The 15 collections that exist server-side (introspection 2026-09-02); the 4
// ghosts have no data to export.
const DEFAULT_COLLECTIONS = [
  "leads", "subscribers", "downloads", "assessments", "briefings",
  "consent_log", "survey_responses", "blog_posts", "blogger_accounts",
  "template_downloads", "outreach_contacts", "email_send_log", "ai_citations",
  "notice_captures", "notice_events",
] as const;

const q = (method: string, ...values: unknown[]): string =>
  `queries[]=${encodeURIComponent(JSON.stringify({ method, values }))}`;

async function get(path: string): Promise<any> {
  const res = await fetch(`${ENDPOINT}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function exportCollection(id: string): Promise<number> {
  const docs: unknown[] = [];
  let cursor: string | null = null;
  for (;;) {
    const queries = [q("limit", 100), ...(cursor ? [q("cursorAfter", cursor)] : [])];
    const page = await get(`/databases/${DB_ID}/collections/${id}/documents?${queries.join("&")}`);
    docs.push(...page.documents);
    if (page.documents.length < 100) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }
  const out = join(OUT_DIR, `${id}.jsonl`);
  writeFileSync(out, docs.map((d) => JSON.stringify(d)).join("\n") + (docs.length ? "\n" : ""));
  console.log(`✓ ${id}: ${docs.length} docs → ${out}`);
  return docs.length;
}

mkdirSync(OUT_DIR, { recursive: true });
const targets = process.argv.slice(2).length ? process.argv.slice(2) : [...DEFAULT_COLLECTIONS];
let total = 0;
for (const id of targets) total += await exportCollection(id);
console.log(`\nexported ${total} documents across ${targets.length} collections to ${OUT_DIR}`);

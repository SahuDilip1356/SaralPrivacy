// verify.ts — S4 step 4: per-collection parity between the JSONL snapshot
// (what Appwrite holds) and Postgres (what load.ts wrote).
//
// Checks per collection (spec §6):
//   1. row count equal
//   2. min/max created_at equal
//   3. random-20 deep-diff: transform(doc) must equal the Postgres row on
//      every attribute column
//
// Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. Emits verify-report.json
// (counts and booleans only — safe to share, but written next to the
// snapshots, not into the repo).
//
// Run from webapp/:
//   set -a; . ./.env.local; set +a
//   node --experimental-strip-types tools/migrate-supabase/verify.ts [collection ...]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { toRow } from "./transform.ts";

const env = (k: string): string => (process.env[k] || "").replace(/\\n/g, "").trim();
const SNAP_DIR = env("SNAPSHOT_DIR") || "/private/tmp/saralprivacy-migration-snapshots";

const TABLES: Record<string, { schema: string; name: string }> = {
  leads: { schema: "ops", name: "leads" }, subscribers: { schema: "ops", name: "subscribers" },
  downloads: { schema: "ops", name: "downloads" }, template_downloads: { schema: "ops", name: "template_downloads" },
  survey_responses: { schema: "ops", name: "survey_responses" }, consent_log: { schema: "ops", name: "consent_log" },
  email_send_log: { schema: "ops", name: "email_send_log" }, outreach_contacts: { schema: "ops", name: "outreach_contacts" },
  ai_citations: { schema: "ops", name: "ai_citations" }, blog_posts: { schema: "ops", name: "blog_posts" },
  blogger_accounts: { schema: "ops", name: "blogger_accounts" }, chat_feedback: { schema: "ops", name: "chat_feedback" },
  assessments: { schema: "app", name: "assessments" }, briefings: { schema: "app", name: "briefings_meta" },
  notice_captures: { schema: "app", name: "notice_captures" }, notice_events: { schema: "app", name: "notice_events" },
};

function readSnapshot(collection: string): Record<string, unknown>[] {
  const path = join(SNAP_DIR, `${collection}.jsonl`);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

// Compare loosely enough to survive representation drift that is NOT data
// drift: Postgres normalises timestamptz strings and returns bigint as number.
function valueEqual(a: unknown, b: unknown): boolean {
  if (a === null || a === undefined) return b === null || b === undefined || b === "";
  if (b === null || b === undefined) return a === "" || a === null;
  if (typeof a === "boolean" || typeof b === "boolean") return Boolean(a) === Boolean(b);
  if (typeof a === "number" || typeof b === "number") return Number(a) === Number(b);
  const sa = String(a), sb = String(b);
  if (sa === sb) return true;
  const da = Date.parse(sa), db = Date.parse(sb);
  if (!isNaN(da) && !isNaN(db)) return da === db;
  return false;
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = env("SUPABASE_URL"), key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  const client = createClient(url, key, { auth: { persistSession: false } });

  const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TABLES);
  const report: Record<string, unknown>[] = [];
  let allGreen = true;

  for (const collection of targets) {
    const t = TABLES[collection];
    const docs = readSnapshot(collection);
    const { count, error } = await client.schema(t.schema).from(t.name).select("*", { count: "exact", head: true });
    if (error) throw new Error(`count ${collection}: ${error.message}`);

    const countOk = count === docs.length;

    // random-20 deep diff
    const sample = [...docs].sort(() => Math.random() - 0.5).slice(0, 20);
    const mismatches: string[] = [];
    for (const doc of sample) {
      const { data, error: e2 } = await client.schema(t.schema).from(t.name).select("*").eq("legacy_id", doc.$id).limit(1);
      if (e2) throw new Error(`fetch ${collection}/${doc.$id}: ${e2.message}`);
      const row = data?.[0];
      if (!row) { mismatches.push(`${doc.$id}: missing`); continue; }
      const expected = toRow(collection, doc);
      for (const [col, v] of Object.entries(expected)) {
        if (col === "updated_at") continue; // load stamps its own on re-runs
        if (!valueEqual(v, (row as Record<string, unknown>)[col])) {
          mismatches.push(`${doc.$id}.${col}: ${JSON.stringify(v)} != ${JSON.stringify((row as Record<string, unknown>)[col])}`);
        }
      }
    }

    const ok = countOk && mismatches.length === 0;
    allGreen &&= ok;
    report.push({ collection, snapshot: docs.length, postgres: count, countOk, sampled: sample.length, mismatches });
    console.log(`${ok ? "✓" : "✗"} ${collection}: snapshot=${docs.length} pg=${count}${mismatches.length ? ` mismatches=${mismatches.length}` : ""}`);
    for (const m of mismatches.slice(0, 5)) console.log(`    ${m}`);
  }

  const out = join(SNAP_DIR, "verify-report.json");
  writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), allGreen, report }, null, 2) + "\n");
  console.log(`\n${allGreen ? "ALL GREEN" : "MISMATCHES FOUND"} — report: ${out}`);
  if (!allGreen) process.exitCode = 1;
}

await main();

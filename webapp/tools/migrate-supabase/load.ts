// load.ts — S4 step 3: JSONL snapshots → Postgres, idempotent.
//
// Every row upserts ON CONFLICT (legacy_id) DO UPDATE, so the loader can be
// re-run at any moment — re-running IS the delta-sync at flip time.
//
// Two modes:
//   default    — direct via supabase-js (needs SUPABASE_URL +
//                SUPABASE_SERVICE_ROLE_KEY in the environment)
//   --emit-sql — writes chunked, idempotent INSERT ... ON CONFLICT statements
//                to <SNAPSHOT_DIR>/sql/ instead, for applying through any SQL
//                channel when the service key is not available locally.
//                ⚠️ The SQL contains the same PII as the snapshots — same
//                handling rules, never committed.
//
// Run from webapp/:
//   set -a; . ./.env.local; set +a
//   node --experimental-strip-types tools/migrate-supabase/load.ts [--emit-sql] [collection ...]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { toRow } from "./transform.ts";

const env = (k: string): string => (process.env[k] || "").replace(/\\n/g, "").trim();
const SNAP_DIR = env("SNAPSHOT_DIR") || "/private/tmp/saralprivacy-migration-snapshots";
const EMIT_SQL = process.argv.includes("--emit-sql");
const CHUNK = parseInt(env("LOAD_CHUNK") || "100", 10);

// collection → schema-qualified table (mirror of lib/db/supabase.ts TARGETS)
const TABLES: Record<string, string> = {
  leads: "ops.leads", subscribers: "ops.subscribers", downloads: "ops.downloads",
  template_downloads: "ops.template_downloads", survey_responses: "ops.survey_responses",
  consent_log: "ops.consent_log", email_send_log: "ops.email_send_log",
  outreach_contacts: "ops.outreach_contacts", ai_citations: "ops.ai_citations",
  blog_posts: "ops.blog_posts", blogger_accounts: "ops.blogger_accounts",
  chat_feedback: "ops.chat_feedback", assessments: "app.assessments",
  briefings: "app.briefings_meta", notice_captures: "app.notice_captures",
  notice_events: "app.notice_events",
};

function readSnapshot(collection: string): Record<string, unknown>[] {
  const path = join(SNAP_DIR, `${collection}.jsonl`);
  if (!existsSync(path)) throw new Error(`No snapshot for ${collection} at ${path} — run export.ts first`);
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const qi = (name: string) => (/^[a-z_][a-z0-9_]*$/.test(name) ? name : `"${name}"`);
const lit = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

/** One idempotent multi-row upsert statement for a chunk of rows. */
function chunkSql(table: string, rows: Record<string, unknown>[]): string {
  // Union of keys across the chunk — sparse docs (e.g. pre-`language` era
  // downloads) simply get nulls for columns they never had.
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const values = rows
    .map((r) => `(${cols.map((c) => lit(r[c])).join(",")})`)
    .join(",\n");
  const updates = cols
    .filter((c) => c !== "legacy_id")
    .map((c) => `${qi(c)} = excluded.${qi(c)}`)
    .join(", ");
  return `insert into ${table} (${cols.map(qi).join(",")})\nvalues\n${values}\non conflict (legacy_id) do update set ${updates};`;
}

async function loadDirect(table: string, rows: Record<string, unknown>[]): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — use --emit-sql instead");
  const [schema, name] = table.split(".");
  const client = createClient(url, key, { auth: { persistSession: false } });
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await client
      .schema(schema)
      .from(name)
      .upsert(rows.slice(i, i + CHUNK), { onConflict: "legacy_id" });
    if (error) throw new Error(`upsert ${table} chunk@${i}: ${error.message}`);
  }
}

const targets = process.argv.slice(2).filter((a) => a !== "--emit-sql");
const collections = targets.length ? targets : Object.keys(TABLES);

for (const collection of collections) {
  const table = TABLES[collection];
  if (!table) throw new Error(`Unknown collection ${collection}`);
  if (!targets.length && !existsSync(join(SNAP_DIR, `${collection}.jsonl`))) {
    // All-collections run: ghosts (e.g. chat_feedback) have no snapshot and
    // nothing to load — skip instead of aborting the loop mid-way.
    console.log(`- ${collection}: no snapshot (ghost collection) — skipped`);
    continue;
  }
  const rows = readSnapshot(collection).map((doc) => toRow(collection, doc));
  if (EMIT_SQL) {
    const sqlDir = join(SNAP_DIR, "sql");
    mkdirSync(sqlDir, { recursive: true });
    const parts: string[] = [];
    for (let i = 0; i < rows.length; i += CHUNK) parts.push(chunkSql(table, rows.slice(i, i + CHUNK)));
    const out = join(sqlDir, `${collection}.sql`);
    writeFileSync(out, parts.join("\n\n") + "\n");
    console.log(`✓ ${collection}: ${rows.length} rows → ${out} (${parts.length} statements)`);
  } else {
    await loadDirect(table, rows);
    console.log(`✓ ${collection}: ${rows.length} rows upserted into ${table}`);
  }
}

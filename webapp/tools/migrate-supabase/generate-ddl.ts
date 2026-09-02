// generate-ddl.ts — S2 step 2 of SUPABASE_MIGRATION_SPEC.md.
//
// Reads schema-report.json (live Appwrite introspection — the only authority)
// and emits ../../supabase/migrations/0001_initial_schema.sql: 19 tables in
// the `ops` and `app` schemas, RLS enabled with deny-all, UUIDv7 primary keys
// (own function — the platform offers no pg_uuidv7 extension), `legacy_id`
// lineage, and indexes translated from Appwrite's.
//
// Column names keep the EXACT Appwrite attribute keys (quoted identifiers),
// so transform.ts stays mechanical: $id→legacy_id, $createdAt→created_at,
// $updatedAt→updated_at, everything else passes through by name.
//
// Run from webapp/:  node --experimental-strip-types tools/migrate-supabase/generate-ddl.ts

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const report = JSON.parse(readFileSync(here("./schema-report.json"), "utf8"));

// collection → target (spec §3.4)
const TARGETS: Record<string, { schema: "ops" | "app"; table: string }> = {
  leads:              { schema: "ops", table: "leads" },
  subscribers:        { schema: "ops", table: "subscribers" },
  downloads:          { schema: "ops", table: "downloads" },
  template_downloads: { schema: "ops", table: "template_downloads" },
  survey_responses:   { schema: "ops", table: "survey_responses" },
  consent_log:        { schema: "ops", table: "consent_log" },
  email_send_log:     { schema: "ops", table: "email_send_log" },
  outreach_contacts:  { schema: "ops", table: "outreach_contacts" },
  ai_citations:       { schema: "ops", table: "ai_citations" },
  blog_posts:         { schema: "ops", table: "blog_posts" },
  blogger_accounts:   { schema: "ops", table: "blogger_accounts" },
  chat_feedback:      { schema: "ops", table: "chat_feedback" },
  assessments:        { schema: "app", table: "assessments" },
  briefings:          { schema: "app", table: "briefings_meta" },
  notice_captures:    { schema: "app", table: "notice_captures" },
  notice_events:      { schema: "app", table: "notice_events" },
  notice_runs:        { schema: "app", table: "notice_runs" },
  business_profiles:  { schema: "app", table: "business_profiles" },
  dsar_requests:      { schema: "app", table: "dsar_requests" },
};

const qi = (name: string) => (/^[a-z_][a-z0-9_]*$/.test(name) ? name : `"${name}"`);

interface Attr {
  key: string; type: string; required: boolean; array?: boolean;
  size?: number; elements?: string[]; format?: string;
}

function colType(a: Attr): string {
  if (a.array) return "jsonb"; // Appwrite array attribute → JSON array
  switch (a.type) {
    case "integer": return "bigint";
    case "double": return "double precision";
    case "boolean": return "boolean";
    case "datetime": return "timestamptz";
    case "string":
    default: return "text"; // email/url/ip/enum formats are strings too
  }
}

// Some collections carry their OWN attribute named like a standard column
// (notice_captures/notice_events both have a string `created_at`). Those
// attribute columns get an `_attr` suffix; transform.ts reads the rename map
// from column-renames.json.
const RESERVED = new Set(["id", "legacy_id", "created_at", "updated_at"]);
const renames: Record<string, Record<string, string>> = {};

function columnName(collectionId: string, key: string): string {
  if (!RESERVED.has(key)) return key;
  const renamed = `${key}_attr`;
  (renames[collectionId] ??= {})[key] = renamed;
  return renamed;
}

function colDef(collectionId: string, a: Attr): string {
  const name = columnName(collectionId, a.key);
  let def = `  ${qi(name)} ${colType(a)}`;
  if (a.required) def += " not null";
  if (!a.array && Array.isArray(a.elements) && a.elements.length > 0) {
    const list = a.elements.map((e) => `'${e.replace(/'/g, "''")}'`).join(", ");
    def += ` check (${qi(name)} in (${list}))`;
  }
  return def;
}

const STD_COLS = [
  "  id uuid primary key default ops.uuid_generate_v7()",
  "  legacy_id text unique", // Appwrite $id; null for post-cutover rows
  "  created_at timestamptz not null default now()",
  "  updated_at timestamptz not null default now()",
];

const SYS_ATTR = (k: string) =>
  k === "$id" ? "legacy_id" : k === "$createdAt" ? "created_at" : k === "$updatedAt" ? "updated_at" : null;

function tableSql(collectionId: string, attrs: Attr[], indexes: any[]): string {
  const t = TARGETS[collectionId];
  const fq = `${t.schema}.${qi(t.table)}`;
  const cols = [...STD_COLS, ...attrs.map((a) => colDef(collectionId, a))];
  let sql = `-- ── ${collectionId} → ${fq} ${"─".repeat(Math.max(1, 46 - fq.length))}\n`;
  sql += `create table ${fq} (\n${cols.join(",\n")}\n);\n`;
  sql += `alter table ${fq} enable row level security;\n`;
  for (const ix of indexes) {
    const ixCols = (ix.attributes as string[])
      .map((k) => qi(SYS_ATTR(k) ?? columnName(collectionId, k)))
      .join(", ");
    const unique = ix.type === "unique" ? "unique " : ""; // fulltext → plain btree
    sql += `create ${unique}index ${qi(`ix_${t.table}_${ix.key}`.slice(0, 63))} on ${fq} (${ixCols});\n`;
  }
  return sql;
}

// Ghost collections (absent server-side) — shapes from code, not introspection.
const GHOSTS: Record<string, string[]> = {
  // app/api/chat/feedback/route.ts `doc` object (writes were failing silently
  // against the missing collection — this table finally gives them a home).
  chat_feedback: [
    `  "sessionId" text not null`,
    `  "turnId" text not null`,
    `  helpful boolean`,
    `  reason text`,
    `  "pageUrl" text`,
    `  "failureKind" text`,
    `  "redactedQuestion" text`,
    `  ts timestamptz`,
  ],
  // Zero code references (Notice Pack spec Part VIII placeholders). Minimal
  // shells per spec decision D3 — Blueprint P5 designs the real DSAR schema.
  notice_runs:       ["  payload jsonb"],
  business_profiles: ["  payload jsonb"],
  dsar_requests:     ["  payload jsonb"],
};

function ghostSql(collectionId: string): string {
  const t = TARGETS[collectionId];
  const fq = `${t.schema}.${qi(t.table)}`;
  let sql = `-- ── ${collectionId} (absent in Appwrite; shape from code/spec) → ${fq}\n`;
  sql += `create table ${fq} (\n${[...STD_COLS, ...GHOSTS[collectionId]].join(",\n")}\n);\n`;
  sql += `alter table ${fq} enable row level security;\n`;
  return sql;
}

const PRELUDE = `-- 0001_initial_schema.sql — Appwrite → Supabase migration (spec: SUPABASE_MIGRATION_SPEC.md §3)
-- GENERATED by tools/migrate-supabase/generate-ddl.ts from schema-report.json
-- (live Appwrite introspection ${report.generatedAt}). Do not hand-edit tables;
-- regenerate instead.
--
-- Posture: RLS enabled on every table with NO policies (deny-all) — only the
-- service-role key reads/writes until Blueprint P3 introduces real auth.

create schema if not exists ops;   -- marketing/ops surface
create schema if not exists app;   -- product surface

create extension if not exists pgcrypto with schema extensions;

-- UUIDv7 (time-ordered): no pg_uuidv7 extension on this platform, so define
-- the standard overlay construction over gen_random_uuid().
create or replace function ops.uuid_generate_v7() returns uuid
language sql volatile parallel safe as $$
  select encode(
    set_bit(set_bit(
      overlay(uuid_send(gen_random_uuid())
        placing substring(int8send((extract(epoch from clock_timestamp())*1000)::bigint) from 3)
        from 1 for 6),
      52, 1), 53, 1), 'hex')::uuid
$$;

`;

const EPILOGUE = `
-- NOTE: service_role grants (schema USAGE, table DML, default privileges) and
-- PostgREST exposure of ops/app live in 0002_expose_schemas_grants.sql — on
-- Supabase, service_role is not a superuser and custom schemas inherit
-- nothing, so 0001 alone is not usable by the app. Apply the pair.
-- (Function EXECUTE needs no grant: Postgres grants PUBLIC execute by
-- default — verified live via `set local role service_role` insert probes.)

-- Deny-all hardening: nothing for anon/authenticated until P3.
revoke all on all tables in schema ops from anon, authenticated;
revoke all on all tables in schema app from anon, authenticated;
alter default privileges in schema ops revoke all on tables from anon, authenticated;
alter default privileges in schema app revoke all on tables from anon, authenticated;
`;

const parts: string[] = [PRELUDE];
for (const c of report.collections) {
  if (!TARGETS[c.id]) throw new Error(`No target mapping for collection ${c.id}`);
  parts.push(c.exists ? tableSql(c.id, c.attributes, c.indexes) : ghostSql(c.id));
}
parts.push(EPILOGUE);

const outDir = here("../../../supabase/migrations");
mkdirSync(outDir, { recursive: true });
const out = `${outDir}/0001_initial_schema.sql`;
const sqlText = parts.join("\n");

// Guard: a duplicate column in any create table is a generator bug — fail
// here, not in Postgres.
for (const block of sqlText.split("create table").slice(1)) {
  const body = block.slice(block.indexOf("(") + 1, block.indexOf(");"));
  const names = [...body.matchAll(/^\s{2}("?[A-Za-z_][A-Za-z0-9_]*"?)\s/gm)].map((m) => m[1]);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) throw new Error(`duplicate columns ${dupes.join(",")} in table${block.slice(0, 40)}`);
}

writeFileSync(out, sqlText);
writeFileSync(here("./column-renames.json"), JSON.stringify(renames, null, 2) + "\n");
console.log(`DDL written: ${out}`);
console.log(`renames: ${JSON.stringify(renames)}`);
console.log(`tables: ${report.collections.length} (${report.collections.filter((c: any) => c.exists).length} introspected + ${report.collections.filter((c: any) => !c.exists).length} ghost)`);

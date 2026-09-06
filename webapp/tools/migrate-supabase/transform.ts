// transform.ts — S4 step 2: pure mapping from an exported Appwrite document
// to a Postgres row for the tables 0001_initial_schema.sql created.
//
//   $id        → legacy_id
//   $createdAt → created_at, $updatedAt → updated_at
//   colliding app attributes → *_attr (column-renames.json, same source as
//   the DDL generator)
//   other $-system fields ($permissions, $collectionId, …) → dropped
//
// Appwrite returns typed JSON (booleans, numbers, ISO datetimes as strings —
// which Postgres casts on insert), so values pass through unchanged.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const RENAMES: Record<string, Record<string, string>> = JSON.parse(
  readFileSync(fileURLToPath(new URL("./column-renames.json", import.meta.url)), "utf8"),
);

// file-map.json (written by files.ts): Appwrite file id → Supabase public URL.
// When present, blog_posts.infographic_url values pointing at Appwrite storage
// are rewritten during transform, so every (delta-)load lands migrated URLs.
const SNAP_DIR = (process.env.SNAPSHOT_DIR || "/private/tmp/saralprivacy-migration-snapshots").trim();
const FILE_MAP: Record<string, string> = existsSync(join(SNAP_DIR, "file-map.json"))
  ? JSON.parse(readFileSync(join(SNAP_DIR, "file-map.json"), "utf8"))
  : {};

function rewriteFileUrl(value: unknown): unknown {
  if (typeof value !== "string" || !value.includes("/storage/buckets/")) return value;
  const m = value.match(/\/files\/([^/]+)\/(?:view|download)/);
  const mapped = m && FILE_MAP[m[1]];
  return mapped ? `${mapped}?v=migrated` : value;
}

export function toRow(collection: string, doc: Record<string, unknown>): Record<string, unknown> {
  const ren = RENAMES[collection] ?? {};
  const row: Record<string, unknown> = {
    legacy_id: doc.$id,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };
  for (const [k, v] of Object.entries(doc)) {
    if (k.startsWith("$")) continue;
    row[ren[k] ?? k] = collection === "blog_posts" && k === "infographic_url" ? rewriteFileUrl(v) : v;
  }
  return row;
}

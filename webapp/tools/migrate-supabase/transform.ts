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

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RENAMES: Record<string, Record<string, string>> = JSON.parse(
  readFileSync(fileURLToPath(new URL("./column-renames.json", import.meta.url)), "utf8"),
);

export function toRow(collection: string, doc: Record<string, unknown>): Record<string, unknown> {
  const ren = RENAMES[collection] ?? {};
  const row: Record<string, unknown> = {
    legacy_id: doc.$id,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };
  for (const [k, v] of Object.entries(doc)) {
    if (k.startsWith("$")) continue;
    row[ren[k] ?? k] = v;
  }
  return row;
}

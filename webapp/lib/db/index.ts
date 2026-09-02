// lib/db — the ONE seam for the Appwrite→Supabase migration
// (SUPABASE_MIGRATION_SPEC.md §4). Routes call these functions instead of
// touching a backend client; each function picks its backend per collection
// via DATA_BACKEND_* flags (default appwrite), so a cutover is an env flip
// and a rollback is flipping it back.

import { databases, DB_ID, ID } from "@/lib/appwrite";
import { dataBackend } from "./flags";
import { getSupabase, TARGETS, toRow } from "./supabase";

export { dataBackend } from "./flags";

/**
 * Insert one document. Field names are the Appwrite attribute names — the
 * Supabase path applies the column-rename map itself. Returns the new row's
 * id (Appwrite $id / Postgres uuid).
 */
export async function insertDocument(
  collection: string,
  data: Record<string, unknown>,
): Promise<string> {
  if (dataBackend(collection) === "supabase") {
    const t = TARGETS[collection];
    const { data: rows, error } = await getSupabase()
      .schema(t.schema)
      .from(t.table)
      .insert(toRow(collection, data))
      .select("id");
    if (error) throw new Error(`lib/db insert ${collection}: ${error.message}`);
    return rows?.[0]?.id ?? "";
  }
  const doc = await databases.createDocument(DB_ID, collection, ID.unique(), data);
  return doc.$id;
}

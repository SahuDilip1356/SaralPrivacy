// lib/db — the ONE seam for the Appwrite→Supabase migration
// (SUPABASE_MIGRATION_SPEC.md §4). Routes call these functions instead of
// touching a backend client; each function picks its backend per collection
// via DATA_BACKEND_* flags (default appwrite), so a cutover is an env flip
// and a rollback is flipping it back.

import { databases, DB_ID, ID, Query } from "@/lib/appwrite";
import { dataBackend } from "./flags";
import { getSupabase, TARGETS, toRow, fromRow } from "./supabase";

export { dataBackend } from "./flags";

/** A document as the app sees it: Appwrite-era field names plus a uniform id
 *  (Appwrite $id / Postgres uuid) usable with updateDocumentById. */
export interface DbDoc {
  id: string;
  [key: string]: unknown;
}

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

/** Find the single document with this (normalised) email, or null. */
export async function findOneByEmail(collection: string, email: string): Promise<DbDoc | null> {
  if (dataBackend(collection) === "supabase") {
    const t = TARGETS[collection];
    const { data, error } = await getSupabase()
      .schema(t.schema)
      .from(t.table)
      .select("*")
      .eq("email", email)
      .limit(1);
    if (error) throw new Error(`lib/db findOneByEmail ${collection}: ${error.message}`);
    const row = data?.[0];
    return row ? ({ ...fromRow(collection, row), id: String(row.id) } as DbDoc) : null;
  }
  const res = await databases.listDocuments(DB_ID, collection, [
    Query.equal("email", email),
    Query.limit(1),
  ]);
  const doc = res.documents[0];
  return doc ? ({ ...doc, id: doc.$id } as DbDoc) : null;
}

/** Patch one document by the id a DbDoc carries. */
export async function updateDocumentById(
  collection: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  if (dataBackend(collection) === "supabase") {
    const t = TARGETS[collection];
    const { error } = await getSupabase()
      .schema(t.schema)
      .from(t.table)
      .update({ ...toRow(collection, patch), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`lib/db update ${collection}: ${error.message}`);
    return;
  }
  await databases.updateDocument(DB_ID, collection, id, patch);
}

/**
 * One page of a full-collection scan (sendGateway-style pagination). Pass the
 * previous page's last DbDoc.id as `after`; the cursor is backend-specific but
 * opaque to callers. Ordering: Appwrite natural ($id) / Postgres id — UUIDv7,
 * so both are stable, insertion-ordered walks.
 */
export async function listPage(
  collection: string,
  opts: { limit: number; after?: string },
): Promise<DbDoc[]> {
  if (dataBackend(collection) === "supabase") {
    const t = TARGETS[collection];
    let q = getSupabase()
      .schema(t.schema)
      .from(t.table)
      .select("*")
      .order("id", { ascending: true })
      .limit(opts.limit);
    if (opts.after) q = q.gt("id", opts.after);
    const { data, error } = await q;
    if (error) throw new Error(`lib/db listPage ${collection}: ${error.message}`);
    return (data ?? []).map((row) => ({ ...fromRow(collection, row), id: String(row.id) }) as DbDoc);
  }
  const queries = [Query.limit(opts.limit)];
  if (opts.after) queries.push(Query.cursorAfter(opts.after));
  const res = await databases.listDocuments(DB_ID, collection, queries);
  return res.documents.map((doc) => ({ ...doc, id: doc.$id }) as DbDoc);
}

// lib/db — the ONE seam for the Appwrite→Supabase migration
// (SUPABASE_MIGRATION_SPEC.md §4). Routes call these functions instead of
// touching a backend client; each function picks its backend per collection
// via DATA_BACKEND_* flags (default appwrite), so a cutover is an env flip
// and a rollback is flipping it back.

import { databases, DB_ID, ID, Query } from "@/lib/appwrite";
import { dataBackend } from "./flags";
import { getSupabase, TARGETS, toRow, fromRow, toColumn } from "./supabase";

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

/** Find the single document where field === value, or null. */
export async function findOneBy(
  collection: string,
  field: string,
  value: string,
): Promise<DbDoc | null> {
  if (dataBackend(collection) === "supabase") {
    const t = TARGETS[collection];
    const { data, error } = await getSupabase()
      .schema(t.schema)
      .from(t.table)
      .select("*")
      .eq(toColumn(collection, field), value)
      .limit(1);
    if (error) throw new Error(`lib/db findOneBy ${collection}.${field}: ${error.message}`);
    const row = data?.[0];
    return row ? ({ ...fromRow(collection, row), id: String(row.id) } as DbDoc) : null;
  }
  const res = await databases.listDocuments(DB_ID, collection, [
    Query.equal(field, value),
    Query.limit(1),
  ]);
  const doc = res.documents[0];
  return doc ? ({ ...doc, id: doc.$id } as DbDoc) : null;
}

/** Find the single document with this (normalised) email, or null. */
export async function findOneByEmail(collection: string, email: string): Promise<DbDoc | null> {
  return findOneBy(collection, "email", email);
}

export interface WhereClause {
  field: string;
  /** default "eq"; "eq" with an array value means IN on both backends */
  op?: "eq" | "isNull";
  value?: unknown;
}

export interface QuerySpec {
  where?: WhereClause[];
  orderBy?: { field: string; dir: "asc" | "desc" };
  limit?: number;
}

/**
 * Filtered query with total count. Covers the repo's whole read vocabulary
 * beyond findOneBy/listPage: equality (scalar or IN), null checks, ordering,
 * limit. NOTE: Appwrite caps `total` at 5000 — treat large totals as "≥".
 */
export async function queryDocuments(
  collection: string,
  spec: QuerySpec,
): Promise<{ docs: DbDoc[]; total: number }> {
  if (dataBackend(collection) === "supabase") {
    const t = TARGETS[collection];
    let q = getSupabase()
      .schema(t.schema)
      .from(t.table)
      .select("*", { count: "exact" });
    for (const w of spec.where ?? []) {
      const col = toColumn(collection, w.field);
      if (w.op === "isNull") q = q.is(col, null);
      else if (Array.isArray(w.value)) q = q.in(col, w.value as (string | number)[]);
      else q = q.eq(col, w.value as string | number | boolean);
    }
    if (spec.orderBy) {
      q = q.order(toColumn(collection, spec.orderBy.field), { ascending: spec.orderBy.dir === "asc" });
    }
    if (spec.limit !== undefined) q = q.limit(spec.limit);
    const { data, error, count } = await q;
    if (error) throw new Error(`lib/db query ${collection}: ${error.message}`);
    return {
      docs: (data ?? []).map((row) => ({ ...fromRow(collection, row), id: String(row.id) }) as DbDoc),
      total: count ?? data?.length ?? 0,
    };
  }
  const queries: string[] = [];
  for (const w of spec.where ?? []) {
    if (w.op === "isNull") queries.push(Query.isNull(w.field));
    else queries.push(Query.equal(w.field, w.value as string | string[]));
  }
  if (spec.orderBy) {
    queries.push(spec.orderBy.dir === "asc" ? Query.orderAsc(spec.orderBy.field) : Query.orderDesc(spec.orderBy.field));
  }
  if (spec.limit !== undefined) queries.push(Query.limit(spec.limit));
  const res = await databases.listDocuments(DB_ID, collection, queries);
  return {
    docs: res.documents.map((doc) => ({ ...doc, id: doc.$id }) as DbDoc),
    total: res.total,
  };
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

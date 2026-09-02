// supabase.ts — lazy Supabase client + the collection→table map for the
// migration seam. Lazy on purpose (same lesson as lib/appwrite.ts): `next
// build` collects page data with no env vars present, so nothing here may
// throw at module evaluation.
//
// TARGETS/RENAMES mirror tools/migrate-supabase/generate-ddl.ts and
// column-renames.json — the DDL generator is the authority; keep in sync.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) {
    throw new Error(
      "lib/db: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — a DATA_BACKEND_* flag points at supabase without its env",
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const TARGETS: Record<string, { schema: "ops" | "app"; table: string }> = {
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

// Appwrite attribute keys that collided with the standard columns and were
// renamed in Postgres (see column-renames.json).
export const RENAMES: Record<string, Record<string, string>> = {
  leads: { created_at: "created_at_attr" },
  subscribers: { created_at: "created_at_attr" },
  assessments: { created_at: "created_at_attr" },
  briefings: { created_at: "created_at_attr" },
  survey_responses: { created_at: "created_at_attr" },
  blogger_accounts: { created_at: "created_at_attr" },
  template_downloads: { created_at: "created_at_attr" },
  outreach_contacts: { created_at: "created_at_attr" },
  email_send_log: { updated_at: "updated_at_attr" },
  notice_captures: { created_at: "created_at_attr" },
  notice_events: { created_at: "created_at_attr" },
};

/** Map an app-side document (Appwrite field names) to a Postgres row. */
export function toRow(collection: string, data: Record<string, unknown>): Record<string, unknown> {
  const ren = RENAMES[collection] ?? {};
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [ren[k] ?? k, v]));
}

/** Map a Postgres row back to app-side field names (inverse of toRow). */
export function fromRow(collection: string, row: Record<string, unknown>): Record<string, unknown> {
  const ren = RENAMES[collection] ?? {};
  const inv = Object.fromEntries(Object.entries(ren).map(([from, to]) => [to, from]));
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [inv[k] ?? k, v]));
}

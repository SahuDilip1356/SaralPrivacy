// flags.ts — per-module backend selection for the Appwrite→Supabase strangler
// (SUPABASE_MIGRATION_SPEC.md §4). Every collection belongs to exactly ONE
// module, so a flag can never split a collection across backends. Flags
// default to "appwrite"; a flip is an env change + redeploy, and a rollback is
// flipping it back.

export type DataModule =
  | "templates" | "subscribers" | "leads" | "notices"
  | "outreach" | "assessments" | "editorial" | "admin";

export const COLLECTION_MODULE: Record<string, DataModule> = {
  template_downloads: "templates",
  downloads: "templates",
  subscribers: "subscribers",
  consent_log: "subscribers",
  leads: "leads",
  survey_responses: "leads",
  notice_captures: "notices",
  notice_events: "notices",
  notice_runs: "notices",
  business_profiles: "notices",
  dsar_requests: "notices",
  chat_feedback: "notices",
  outreach_contacts: "outreach",
  email_send_log: "outreach",
  assessments: "assessments",
  briefings: "editorial",
  blog_posts: "editorial",
  ai_citations: "editorial",
  blogger_accounts: "admin",
};

export type DataBackend = "appwrite" | "supabase";

export function dataBackend(collection: string): DataBackend {
  const mod = COLLECTION_MODULE[collection];
  if (!mod) throw new Error(`lib/db: unknown collection "${collection}"`);
  const raw = (process.env[`DATA_BACKEND_${mod.toUpperCase()}`] || "").trim();
  return raw === "supabase" ? "supabase" : "appwrite";
}

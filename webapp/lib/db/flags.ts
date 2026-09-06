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

// Name map for call sites that address collections symbolically (admin
// dashboard, admin data route allowlist). Same shape lib/appwrite.ts exported,
// so those surfaces need no appwrite import.
export const COLLECTIONS = {
  LEADS:              "leads",
  SUBSCRIBERS:        "subscribers",
  DOWNLOADS:          "downloads",
  ASSESSMENTS:        "assessments",
  BRIEFINGS:          "briefings",
  CONSENT_LOG:        "consent_log",
  SURVEY_RESPONSES:   "survey_responses",
  BLOG_POSTS:         "blog_posts",
  BLOGGER_ACCOUNTS:   "blogger_accounts",
  TEMPLATE_DOWNLOADS: "template_downloads",
  OUTREACH_CONTACTS:  "outreach_contacts",
  EMAIL_SEND_LOG:     "email_send_log",
  AI_CITATIONS:       "ai_citations",
  NOTICE_CAPTURES:    "notice_captures",
  NOTICE_RUNS:        "notice_runs",
  NOTICE_EVENTS:      "notice_events",
  BUSINESS_PROFILES:  "business_profiles",
  DSAR_REQUESTS:      "dsar_requests",
  CHAT_FEEDBACK:      "chat_feedback",
} as const;

export type DataBackend = "appwrite" | "supabase";

export function dataBackend(collection: string): DataBackend {
  const mod = COLLECTION_MODULE[collection];
  if (!mod) throw new Error(`lib/db: unknown collection "${collection}"`);
  const raw = (process.env[`DATA_BACKEND_${mod.toUpperCase()}`] || "").trim();
  return raw === "supabase" ? "supabase" : "appwrite";
}

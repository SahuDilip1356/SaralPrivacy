import { Client, Databases, Storage, ID, Query } from "node-appwrite";

// Lazily construct the Appwrite client on first use — never at module evaluation.
// This keeps `next build` page-data collection from crashing when env vars are
// absent (e.g. preview deployments), while keeping the same import surface.
let _client: Client | null = null;
function getClient(): Client {
  if (_client) return _client;
  const c = new Client();
  const endpoint  = (process.env.APPWRITE_ENDPOINT   || "").trim();
  const projectId = (process.env.APPWRITE_PROJECT_ID || "").trim();
  const apiKey    = (process.env.APPWRITE_API_KEY    || "").trim();
  if (endpoint)  c.setEndpoint(endpoint);   // guard: setEndpoint("") throws
  if (projectId) c.setProject(projectId);
  if (apiKey)    c.setKey(apiKey);
  _client = c;
  return c;
}

// Lazy proxy: defers instantiation to first property access, preserving
// `databases.createDocument(...)` / `storage.getFile(...)` call sites unchanged.
function lazy<T extends object>(factory: () => T): T {
  let inst: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop) {
      if (!inst) inst = factory();
      const value = Reflect.get(inst as object, prop);
      return typeof value === "function" ? value.bind(inst) : value;
    },
  });
}

export const databases = lazy(() => new Databases(getClient()));
export const storage   = lazy(() => new Storage(getClient()));

export const DB_ID     = (process.env.APPWRITE_DATABASE_ID || "").trim();
export const BUCKET_ID = (process.env.APPWRITE_BUCKET_ID   || "").trim();;

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
} as const;

/** Returns the public view URL for a file in Appwrite Storage */
export function getFileViewUrl(fileId: string): string {
  const endpoint  = (process.env.APPWRITE_ENDPOINT  || "").trim();
  const projectId = (process.env.APPWRITE_PROJECT_ID || "").trim();
  const bucketId  = (process.env.APPWRITE_BUCKET_ID  || "").trim();
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/** Returns the public download URL for a file in Appwrite Storage */
export function getFileDownloadUrl(fileId: string): string {
  const endpoint  = (process.env.APPWRITE_ENDPOINT  || "").trim();
  const projectId = (process.env.APPWRITE_PROJECT_ID || "").trim();
  const bucketId  = (process.env.APPWRITE_BUCKET_ID  || "").trim();
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
}

export { ID, Query };

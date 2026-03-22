import { Client, Databases, Storage, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint((process.env.APPWRITE_ENDPOINT  || "").trim())
  .setProject((process.env.APPWRITE_PROJECT_ID || "").trim())
  .setKey(    (process.env.APPWRITE_API_KEY    || "").trim());

export const databases = new Databases(client);
export const storage   = new Storage(client);

export const DB_ID     = (process.env.APPWRITE_DATABASE_ID || "").trim();
export const BUCKET_ID = (process.env.APPWRITE_BUCKET_ID   || "").trim();;

export const COLLECTIONS = {
  LEADS:       "leads",
  SUBSCRIBERS: "subscribers",
  DOWNLOADS:   "downloads",
  ASSESSMENTS: "assessments",
  BRIEFINGS:   "briefings",
  CONSENT_LOG: "consent_log",
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

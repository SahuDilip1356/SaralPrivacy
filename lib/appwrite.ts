import { Client, Databases, Storage, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);
export const storage   = new Storage(client);

export const DB_ID     = process.env.APPWRITE_DATABASE_ID!;
export const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export const COLLECTIONS = {
  LEADS:       "leads",
  SUBSCRIBERS: "subscribers",
  DOWNLOADS:   "downloads",
  ASSESSMENTS: "assessments",
} as const;

/** Returns the public view URL for a file in Appwrite Storage */
export function getFileViewUrl(fileId: string): string {
  const endpoint  = process.env.APPWRITE_ENDPOINT!;
  const projectId = process.env.APPWRITE_PROJECT_ID!;
  const bucketId  = process.env.APPWRITE_BUCKET_ID!;
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/** Returns the public download URL for a file in Appwrite Storage */
export function getFileDownloadUrl(fileId: string): string {
  const endpoint  = process.env.APPWRITE_ENDPOINT!;
  const projectId = process.env.APPWRITE_PROJECT_ID!;
  const bucketId  = process.env.APPWRITE_BUCKET_ID!;
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
}

export { ID, Query };

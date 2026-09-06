// storage.ts — file-storage seam for the migration. Blog infographics are the
// ONLY storage feature (schema-report bucket manifest: 165 files), and they
// belong to the editorial module, so the storage backend flips together with
// DATA_BACKEND_EDITORIAL (keyed off blog_posts).

import { storage as appwriteStorage, getFileViewUrl } from "@/lib/appwrite";
import { dataBackend } from "./flags";
import { getSupabase } from "./supabase";

export const INFOGRAPHIC_BUCKET = "infographics"; // Supabase bucket (public read)

/**
 * Upload (or replace) an infographic PNG and return its public URL, with a
 * cache-busting `v` param — the file path is deterministic per post, and both
 * backends ignore unknown query params when serving.
 */
export async function putInfographic(png: Buffer, fileId: string): Promise<string> {
  if (dataBackend("blog_posts") === "supabase") {
    const path = `${fileId}.png`;
    const { error } = await getSupabase()
      .storage.from(INFOGRAPHIC_BUCKET)
      .upload(path, png, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`lib/db storage upload ${path}: ${error.message}`);
    const { data } = getSupabase().storage.from(INFOGRAPHIC_BUCKET).getPublicUrl(path);
    return `${data.publicUrl}?v=${Date.now()}`;
  }

  const bucketId = (process.env.APPWRITE_BUCKET_ID || "").trim();
  // Replace any prior file (re-generation case).
  try {
    await appwriteStorage.deleteFile(bucketId, fileId);
  } catch {
    // File doesn't exist yet — fine
  }
  const blob = new Blob([new Uint8Array(png)], { type: "image/png" });
  const file = new File([blob], `${fileId}.png`, { type: "image/png" });
  await appwriteStorage.createFile(bucketId, fileId, file);
  return `${getFileViewUrl(fileId)}&v=${Date.now()}`;
}

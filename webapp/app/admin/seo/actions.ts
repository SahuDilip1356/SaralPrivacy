"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import { dbFromEnv } from "@/lib/seo/db";

/**
 * "Mark requested" — records that the GSC Request Indexing button was pressed
 * for a URL, so the watcher never shortlists it again (quota rule). The DB
 * ledger merges with the code ledger in lib/seo/watchlist.ts.
 */
export async function markRequested(formData: FormData): Promise<void> {
  const session = await verifyAdminSessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const url = String(formData.get("url") || "").trim();
  if (!/^https:\/\/saralprivacy\.com\//.test(url)) throw new Error("URL must be on https://saralprivacy.com/");

  const db = dbFromEnv();
  if (!db) throw new Error("Supabase is not configured");
  await db.addIndexRequest(url, new Date().toISOString().slice(0, 10), "admin: Request Indexing pressed");
  revalidatePath("/admin/seo");
}

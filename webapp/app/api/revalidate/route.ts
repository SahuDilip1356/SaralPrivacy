import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * GET /api/revalidate?secret=<BRIEFING_CRON_SECRET>
 * Clears the "briefings" cache tag so the next page load fetches fresh data from Appwrite.
 * Called automatically by publish_to_webapp.py after every new briefing is published.
 */
export async function GET(request: NextRequest) {
  // Prefer the header — query strings land in access logs and referrers.
  // The ?secret= form stays accepted until publish_to_webapp.py migrates.
  const secret   =
    (request.headers.get("x-revalidate-secret") || "").trim() ||
    request.nextUrl.searchParams.get("secret") || "";
  const expected = (process.env.CRON_SECRET || process.env.BRIEFING_CRON_SECRET || "").trim();

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  revalidateTag("briefings", "default");

  return NextResponse.json({ revalidated: true, tag: "briefings", at: new Date().toISOString() });
}

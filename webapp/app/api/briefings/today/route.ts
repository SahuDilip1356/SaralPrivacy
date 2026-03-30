/**
 * GET /api/briefings/today
 *
 * Returns today's approved briefing as JSON for the n8n email blast workflow.
 * Called by n8n at 9:30 AM IST (30 min after the Python pipeline publishes).
 *
 * Auth: Authorization: Bearer {BRIEFING_CRON_SECRET}
 *
 * Response shape:
 * {
 *   briefingId, title, slug, url,
 *   hook_line1, hook_line2,
 *   card_what, card_why, card_action,
 *   explainer_concept, explainer_example, explainer_mistake,
 *   action_items: string[],
 *   save_line, excerpt, read_time, category
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const secret = request.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();
  const expected = (
    process.env.CRON_SECRET || process.env.BRIEFING_CRON_SECRET || ""
  ).trim();

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // ── Compute today's date window in IST ───────────────────────────────────
    // IST = UTC + 5h30m. We find today's date in IST, then build UTC boundaries.
    const nowUTC   = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST   = new Date(nowUTC.getTime() + istOffset);
    const todayIST = nowIST.toISOString().split("T")[0]; // YYYY-MM-DD

    // Start of today IST = midnight IST = previous day 18:30 UTC
    const startUTC = new Date(`${todayIST}T00:00:00+05:30`).toISOString();
    // End of today IST = end of day IST = next day 18:29:59 UTC
    const endUTC   = new Date(`${todayIST}T23:59:59+05:30`).toISOString();

    // ── Query Appwrite for today's approved briefing ─────────────────────────
    const result = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.BRIEFINGS,
      [
        Query.equal("status", ["approved", "sent"]),
        Query.greaterThanEqual("created_at", startUTC),
        Query.lessThanEqual("created_at", endUTC),
        Query.orderDesc("created_at"),
        Query.limit(1),
      ]
    );

    if (result.documents.length === 0) {
      return NextResponse.json(
        {
          error: "No briefing found for today.",
          date:  todayIST,
          hint:  "Pipeline may not have run yet, or no topic was planned for today.",
        },
        { status: 404 }
      );
    }

    const briefing  = result.documents[0];
    const siteUrl   = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").replace(/\/$/, "");
    const briefingUrl = `${siteUrl}/briefings/${briefing.slug}`;

    // ── Parse why_it_matters JSON envelope ───────────────────────────────────
    // Supports both v1 (old Python pipeline format) and v2 (new webapp format)
    let why: Record<string, any> = {};
    try {
      const raw = briefing.why_it_matters || "";
      why = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      why = {};
    }

    // ── Parse action_checklist ────────────────────────────────────────────────
    let actionItems: string[] = [];
    try {
      const raw = briefing.action_checklist || "[]";
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      // Handle both string[] and {action: string}[] formats
      actionItems = Array.isArray(parsed)
        ? parsed.map((item: any) =>
            typeof item === "string" ? item : item?.action || JSON.stringify(item)
          )
        : [];
    } catch {
      actionItems = [];
    }

    // ── Build and return response ─────────────────────────────────────────────
    return NextResponse.json({
      // Identity
      briefingId:  briefing.$id,
      title:       briefing.title        || "",
      slug:        briefing.slug         || "",
      url:         briefingUrl,
      date:        todayIST,

      // Hook (v2 fields → v1 fallbacks)
      hook_line1:  why.hook_line1        || why.why_heading || why.why       || "",
      hook_line2:  why.hook_line2        || "",

      // Cards
      card_what:   why.card_what         || "",
      card_why:    why.card_why          || why.impact      || "",
      card_action: why.card_action       || "",
      card_owner:  why.card_owner        || "",

      // Explainer blocks
      explainer_concept:  why.explainer_concept  || "",
      explainer_example:  why.explainer_example  || "",
      explainer_mistake:  why.explainer_mistake  || "",

      // Action items for email
      action_items: actionItems,

      // Save-worthy line
      save_line:   why.save_line         || why.save        || briefing.summary || "",

      // Meta
      excerpt:     briefing.excerpt      || "",
      read_time:   briefing.read_time    || 3,
      category:    briefing.category     || "",
      author:      briefing.author       || "DPDPA Editorial Team",
      status:      briefing.status       || "approved",
      created_at:  briefing.created_at   || "",
    });
  } catch (error) {
    console.error("[briefings/today] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's briefing." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS } from "@/lib/appwrite";
import { sendBriefingToSubscribers } from "@/lib/email";
import { fetchEligibleSubscribers } from "@/lib/sendGateway";
import type { BriefingData } from "@/lib/email-templates";

// Serial send at ~100ms/recipient — 300s covers ~2,500 recipients.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token      = searchParams.get("token");
    const briefingId = searchParams.get("briefingId");

    if (!token || !briefingId) {
      return NextResponse.redirect(new URL("/admin?briefing=error&reason=missing-params", request.url));
    }

    // Fetch the briefing document
    const briefing = await databases.getDocument(DB_ID, COLLECTIONS.BRIEFINGS, briefingId);

    // Validate approval token
    if (briefing.approval_token !== token) {
      return NextResponse.redirect(new URL("/admin?briefing=error&reason=invalid-token", request.url));
    }

    // Block re-sending already-sent briefings
    if (briefing.status === "sent") {
      return NextResponse.redirect(new URL("/admin?briefing=already-sent", request.url));
    }

    // Audience comes from the send gateway: suppression-filtered, deduped,
    // paginated past the old 300-row cap. This path used to email the first
    // 300 rows with NO status filter — including unsubscribed people.
    const subscribers = await fetchEligibleSubscribers();

    // Send briefing to all subscribers
    const briefingPayload: BriefingData = {
      id:               briefingId,
      title:            briefing.title,
      summary:          briefing.summary,
      content:          briefing.content,
      why_it_matters:   briefing.why_it_matters,
      action_checklist: briefing.action_checklist,
      status:           "approved",
      scheduled_for:    briefing.scheduled_for,
      created_at:       briefing.created_at,
    };

    const sendResult = await sendBriefingToSubscribers(briefingPayload, subscribers);

    // Update briefing status to "sent" with subscriber count and sent timestamp
    await databases.updateDocument(DB_ID, COLLECTIONS.BRIEFINGS, briefingId, {
      status:           "sent",
      sent_at:          new Date().toISOString(),
      subscriber_count: sendResult.sent,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com";
    return NextResponse.redirect(
      new URL(`/admin?briefing=published&sent=${sendResult.sent}`, siteUrl)
    );
  } catch (error) {
    console.error("Briefing approve error:", error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com";
    return NextResponse.redirect(new URL("/admin?briefing=error&reason=server-error", siteUrl));
  }
}

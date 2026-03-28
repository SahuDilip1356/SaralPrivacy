import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { sendBriefingToSubscribers } from "@/lib/email";
import type { BriefingData } from "@/lib/email-templates";

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

    // Fetch active subscribers — cap at 300 per send (Gmail / Resend daily safe limit)
    const subscriberResult = await databases.listDocuments(DB_ID, COLLECTIONS.SUBSCRIBERS, [
      Query.limit(300),
    ]);
    const subscribers = subscriberResult.documents.map((doc) => ({
      email: doc.email as string,
      name:  doc.name  as string,
      $id:   doc.$id,
    }));

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

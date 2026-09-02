import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { sendBriefingToSubscribers } from "@/lib/email";
import type { BriefingData } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  try {
    // Check admin session (signature-verified, admin role only)
    const cookieStore = await cookies();
    const session = await verifyAdminSessionToken(
      cookieStore.get(ADMIN_SESSION_COOKIE)?.value
    );
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { briefingId } = body;

    if (!briefingId) {
      return NextResponse.json({ error: "briefingId is required." }, { status: 400 });
    }

    // Fetch the briefing
    const briefing = await databases.getDocument(DB_ID, COLLECTIONS.BRIEFINGS, briefingId);

    if (briefing.status !== "approved") {
      return NextResponse.json(
        { error: `Briefing status is "${briefing.status}". Only approved briefings can be sent.` },
        { status: 400 }
      );
    }

    // Fetch all subscribers (up to 1000)
    const subscriberResult = await databases.listDocuments(DB_ID, COLLECTIONS.SUBSCRIBERS, [
      Query.limit(1000),
    ]);
    const subscribers = subscriberResult.documents.map((doc) => ({
      email: doc.email as string,
      name:  doc.name  as string,
      $id:   doc.$id,
    }));

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

    const result = await sendBriefingToSubscribers(briefingPayload, subscribers);

    // Update briefing to "sent"
    await databases.updateDocument(DB_ID, COLLECTIONS.BRIEFINGS, briefingId, {
      status:           "sent",
      sent_at:          new Date().toISOString(),
      subscriber_count: result.sent,
    });

    return NextResponse.json({
      success: true,
      sent:    result.sent,
      failed:  result.failed,
      total:   subscribers.length,
    });
  } catch (error) {
    console.error("Briefing send error:", error);
    return NextResponse.json({ error: "Failed to send briefing." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendBriefingApprovalEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Validate BRIEFING_CRON_SECRET
    const secret = request.headers.get("x-cron-secret") || request.headers.get("authorization")?.replace("Bearer ", "");
    if (secret !== process.env.BRIEFING_CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, content, summary, why_it_matters, action_checklist } = body;

    // Build scheduled_for as tomorrow at 9 AM IST
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 30, 0, 0); // 3:30 UTC = 9:00 IST

    const approvalToken = crypto.randomUUID();

    const briefingData = {
      title:            title || `DPDPA Daily Brief — ${tomorrow.toISOString().split("T")[0]}`,
      slug:             (title || `dpdpa-brief-${tomorrow.toISOString().split("T")[0]}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      summary:          summary || "",
      content:          content || "",
      why_it_matters:   why_it_matters || "",
      action_checklist: action_checklist || "[]",
      status:           "draft",
      approval_token:   approvalToken,
      scheduled_for:    tomorrow.toISOString(),
      created_at:       new Date().toISOString(),
    };

    const doc = await databases.createDocument(
      DB_ID,
      COLLECTIONS.BRIEFINGS,
      ID.unique(),
      briefingData
    );

    // Send approval email to admin
    await sendBriefingApprovalEmail(
      { ...briefingData, id: doc.$id },
      approvalToken
    );

    return NextResponse.json({ success: true, briefingId: doc.$id });
  } catch (error) {
    console.error("Briefing generate error:", error);
    return NextResponse.json({ error: "Failed to generate briefing." }, { status: 500 });
  }
}

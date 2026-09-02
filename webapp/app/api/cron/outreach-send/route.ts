import { NextRequest, NextResponse } from "next/server";
import { insertDocument, updateDocumentById, queryDocuments } from "@/lib/db";
import { generateToken } from "@/lib/tokens";
import { outreachBriefingEmail } from "@/lib/email-templates";
import { resend } from "@/lib/resendClient";

const DAILY_CAP = parseInt(process.env.OUTREACH_DAILY_CAP || "50", 10);
const BASE_URL  = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").replace(/\/$/, "");

async function getTodaysBriefing() {
  // 1. Try oldest approved/sent briefing not yet used in outreach
  const unused = await queryDocuments("briefings", {
    where: [
      { field: "status", value: ["approved", "sent"] },
      { field: "outreach_used_at", op: "isNull" },
    ],
    orderBy: { field: "scheduled_for", dir: "asc" },
    limit: 1,
  });
  if (unused.docs.length) return { briefing: unused.docs[0], isNew: true };

  // 2. Fallback: most recently approved/sent briefing (all already used)
  const fallback = await queryDocuments("briefings", {
    where: [{ field: "status", value: ["approved", "sent"] }],
    orderBy: { field: "scheduled_for", dir: "desc" },
    limit: 1,
  });
  if (fallback.docs.length) return { briefing: fallback.docs[0], isNew: false };

  return null;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch today's briefing
    const result = await getTodaysBriefing();
    if (!result) {
      return NextResponse.json({ error: "No approved briefing found. Approve a briefing first." }, { status: 404 });
    }
    const { briefing, isNew } = result;

    // Fetch pending contacts
    const res = await queryDocuments("outreach_contacts", {
      where: [{ field: "status", value: "pending" }],
      orderBy: { field: "created_at", dir: "asc" },
      limit: DAILY_CAP,
    });

    const contacts = res.docs;
    if (!contacts.length) {
      return NextResponse.json({ message: "No pending contacts. Campaign complete.", briefing_used: briefing.title });
    }

    const now  = new Date().toISOString();
    let sent   = 0;
    let failed = 0;

    for (const contact of contacts) {
      // Ensure magic token exists
      let token = contact.magic_token as string;
      if (!token) {
        token = generateToken();
        await updateDocumentById("outreach_contacts", contact.id, { magic_token: token });
      }

      const subscribeUrl   = `${BASE_URL}/subscribe?token=${token}`;
      const unsubscribeUrl = `${BASE_URL}/unsubscribe/outreach?token=${token}`;

      const { html, text, subject } = outreachBriefingEmail(briefing as any, {
        name:         contact.name as string | undefined,
        email:        contact.email as string,
        subscribeUrl,
        unsubscribeUrl,
      });

      const { data, error } = await resend.emails.send({
        from:    "SaralPrivacy <briefings@news.saralprivacy.com>",
        replyTo: "privacy@saralprivacy.com",
        to:      contact.email as string,
        subject,
        html,
        text,
      });

      if (error || !data) {
        console.error(`[outreach-send] Failed ${contact.email}:`, error);
        failed++;
        updateDocumentById("outreach_contacts", contact.id, {
          status: "failed",
        }).catch(() => {});
        continue;
      }

      await Promise.all([
        updateDocumentById("outreach_contacts", contact.id, {
          status:        "sent",
          intro_sent_at: now,
        }),
        insertDocument("email_send_log", {
          recipient_email:   contact.email,
          email_type:        "intro",
          resend_message_id: data.id,
          status:            "sent",
          consent_basis:     "one_time_dpdpa_sensitization",
          sent_at:           now,
        }),
      ]);

      sent++;
    }

    // Mark briefing as used in outreach (only if it was a new/unused one)
    if (isNew && sent > 0) {
      updateDocumentById("briefings", briefing.id, {
        outreach_used_at: now,
      }).catch((err) => console.error("[outreach-send] Failed to mark briefing:", err));
    }

    return NextResponse.json({
      sent,
      failed,
      remaining:     res.total - sent,
      briefing_used: briefing.title,
      briefing_id:   briefing.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach-send]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

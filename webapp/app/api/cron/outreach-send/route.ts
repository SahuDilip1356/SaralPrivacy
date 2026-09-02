import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { generateToken } from "@/lib/tokens";
import { outreachBriefingEmail } from "@/lib/email-templates";
import { resend } from "@/lib/resendClient";

const DAILY_CAP = parseInt(process.env.OUTREACH_DAILY_CAP || "50", 10);
const BASE_URL  = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").replace(/\/$/, "");

async function getTodaysBriefing() {
  // 1. Try oldest approved/sent briefing not yet used in outreach
  const unused = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
    Query.equal("status", ["approved", "sent"]),
    Query.isNull("outreach_used_at"),
    Query.orderAsc("scheduled_for"),
    Query.limit(1),
  ]);
  if (unused.documents.length) return { briefing: unused.documents[0], isNew: true };

  // 2. Fallback: most recently approved/sent briefing (all already used)
  const fallback = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
    Query.equal("status", ["approved", "sent"]),
    Query.orderDesc("scheduled_for"),
    Query.limit(1),
  ]);
  if (fallback.documents.length) return { briefing: fallback.documents[0], isNew: false };

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
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, [
      Query.equal("status", "pending"),
      Query.orderAsc("created_at"),
      Query.limit(DAILY_CAP),
    ]);

    const contacts = res.documents;
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
        await databases.updateDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, contact.$id, { magic_token: token });
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
        databases.updateDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, contact.$id, {
          status: "failed",
        }).catch(() => {});
        continue;
      }

      await Promise.all([
        databases.updateDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, contact.$id, {
          status:        "sent",
          intro_sent_at: now,
        }),
        databases.createDocument(DB_ID, COLLECTIONS.EMAIL_SEND_LOG, ID.unique(), {
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
      databases.updateDocument(DB_ID, COLLECTIONS.BRIEFINGS, briefing.$id, {
        outreach_used_at: now,
      }).catch((err) => console.error("[outreach-send] Failed to mark briefing:", err));
    }

    return NextResponse.json({
      sent,
      failed,
      remaining:     res.total - sent,
      briefing_used: briefing.title,
      briefing_id:   briefing.$id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach-send]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

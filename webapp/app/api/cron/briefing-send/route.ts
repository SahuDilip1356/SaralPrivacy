import { NextRequest, NextResponse } from "next/server";
import { insertDocument, updateDocumentById, queryDocuments } from "@/lib/db";
import { briefingEmailTemplate } from "@/lib/email-templates";
import { resend } from "@/lib/resendClient";
import { fetchEligibleSubscribers, buildUnsubscribeUrl } from "@/lib/sendGateway";
import type { BriefingData } from "@/lib/email-templates";

const FROM   = process.env.RESEND_FROM_BRIEFINGS || "briefings@saralprivacy.com";

// Serial send at ~100ms/recipient — 300s covers ~2,500 recipients.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find the most recent approved briefing
    const approvedRes = await queryDocuments("briefings", {
      where: [{ field: "status", value: "approved" }],
      orderBy: { field: "scheduled_for", dir: "desc" },
      limit: 1,
    });

    if (!approvedRes.docs.length) {
      return NextResponse.json({ error: "No approved briefing found. Approve a briefing first." }, { status: 404 });
    }

    const briefing = approvedRes.docs[0] as Record<string, any> & { id: string };

    const briefingPayload: BriefingData = {
      id:               briefing.$id,
      title:            briefing.title,
      summary:          briefing.summary,
      content:          briefing.content,
      why_it_matters:   briefing.why_it_matters,
      action_checklist: briefing.action_checklist,
      status:           "approved",
      scheduled_for:    briefing.scheduled_for,
      created_at:       briefing.created_at,
    };

    // 2. Audience via the send gateway (suppression-filtered, deduped,
    //    paginated past the old 500 cap); weekly cadence applied here.
    const allEligible = await fetchEligibleSubscribers();

    const now      = new Date();
    const nowISO   = now.toISOString();
    const isMonday = now.getDay() === 1;

    const eligible = allEligible.filter(
      (s) => s.frequency !== "weekly" || isMonday
    );

    if (!eligible.length) {
      return NextResponse.json({ message: "No eligible subscribers today.", briefing_used: briefing.title });
    }

    // 3. Send to each subscriber
    let sent   = 0;
    let failed = 0;

    for (const sub of eligible) {
      const email          = sub.email;
      const unsubscribeUrl = await buildUnsubscribeUrl(email);
      const { subject, html } = briefingEmailTemplate(briefingPayload, unsubscribeUrl);

      const { data, error } = await resend.emails.send({
        from:    FROM,
        to:      email,
        subject,
        html,
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
      });

      if (error || !data) {
        console.error(`[briefing-send] Failed ${email}:`, error);
        failed++;
        continue;
      }

      insertDocument("email_send_log", {
        recipient_email:   email,
        email_type:        (sub.frequency as string) === "weekly" ? "briefing_weekly" : "briefing_daily",
        resend_message_id: data.id,
        status:            "sent",
        consent_basis:     "explicit_consent",
        sent_at:           nowISO,
      }).catch((err) => console.error("[briefing-send] log:", err));

      sent++;
      // Avoid Resend rate limits
      await new Promise((r) => setTimeout(r, 100));
    }

    // 4. Mark briefing as sent
    await updateDocumentById("briefings", briefing.id, {
      status:           "sent",
      sent_at:          nowISO,
      subscriber_count: sent,
    });

    console.log(`[briefing-send] Done — sent: ${sent}, failed: ${failed}, briefing: "${briefing.title}"`);

    return NextResponse.json({
      sent,
      failed,
      total_eligible: eligible.length,
      briefing_used:  briefing.title,
      briefing_id:    briefing.$id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[briefing-send]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

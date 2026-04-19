import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { generateToken } from "@/lib/tokens";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DAILY_CAP = parseInt(process.env.OUTREACH_DAILY_CAP || "50", 10);
const BASE_URL  = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").replace(/\/$/, "");

function introEmail(contact: { name?: string; email: string; magic_token: string }) {
  const firstName = (contact.name || "").split(" ")[0] || "there";
  const subscribeUrl   = `${BASE_URL}/subscribe?token=${contact.magic_token}`;
  const unsubscribeUrl = `${BASE_URL}/unsubscribe/outreach?token=${contact.magic_token}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DPDPA is now in force</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#1E3A5F;padding:28px 36px;">
    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Saral<span style="color:#4ade80;">Privacy</span></p>
    <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Privacy Made Practical for India</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px;">
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1e293b;">Hi ${firstName},</p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      Recruitment agencies are among the first businesses that regulators will scrutinise under the
      <strong>Digital Personal Data Protection Act (DPDPA), 2025</strong> — and for good reason.
    </p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      You collect resumes, Aadhaar numbers, phone numbers, and employment histories every day.
      Every candidate whose data you hold is now a <strong>Data Principal</strong> with legal rights
      — the right to access their data, correct it, and ask you to erase it.
    </p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      Non-compliance carries penalties of up to <strong>₹250 crore per incident</strong>.
      Most recruitment agencies are not yet ready.
    </p>

    <!-- Highlight box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px 20px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#15803d;">What DPDPA means for your agency specifically:</p>
      <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;color:#166534;line-height:1.8;">
        <li>Candidate data can only be used for the purpose they shared it</li>
        <li>You need documented consent before sharing CVs with clients</li>
        <li>Candidates can demand deletion — and you must comply within 72 hours</li>
        <li>Vendor/job portal agreements need privacy clauses added</li>
      </ul>
    </td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155;">
      SaralPrivacy sends a free daily briefing covering DPDPA developments, practical compliance steps,
      and what's changing — written specifically for Indian businesses.
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td align="center" style="background:#1E3A5F;border-radius:8px;padding:14px 32px;">
      <a href="${subscribeUrl}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:block;">
        Subscribe to Daily DPDPA Briefings →
      </a>
    </td></tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-align:center;">
      One email per day. Unsubscribe anytime. No spam — ever.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;">
    <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;">
      You are receiving this one-time email because your business operates in a sector covered by DPDPA.
      This is an informational message — we will not email you again unless you subscribe above.
    </p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      <a href="${unsubscribeUrl}" style="color:#94a3b8;">Remove me from this list</a>
      &nbsp;·&nbsp;
      <a href="https://saralprivacy.com/privacy-policy" style="color:#94a3b8;">Privacy Policy</a>
      &nbsp;·&nbsp;
      SaralPrivacy, India
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `Hi ${firstName},

Recruitment agencies are among the first businesses regulators will scrutinise under DPDPA, 2025.

You collect resumes, Aadhaar numbers, phone numbers, and employment histories every day. Every candidate is now a Data Principal with legal rights. Non-compliance carries penalties up to ₹250 crore per incident.

SaralPrivacy sends a free daily briefing covering DPDPA developments and practical compliance steps for Indian businesses.

Subscribe here: ${subscribeUrl}

One email per day. Unsubscribe anytime.

---
You are receiving this one-time email because your business operates in a sector covered by DPDPA. We will not email you again unless you subscribe.

Remove me: ${unsubscribeUrl}
SaralPrivacy, India`;

  return { html, text };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, [
      Query.equal("status", "pending"),
      Query.orderAsc("created_at"),
      Query.limit(DAILY_CAP),
    ]);

    const contacts = res.documents;
    if (!contacts.length) {
      return NextResponse.json({ message: "No pending contacts. Campaign complete." });
    }

    const now = new Date().toISOString();
    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      let token = contact.magic_token as string;
      if (!token) {
        token = generateToken();
        await databases.updateDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, contact.$id, { magic_token: token });
      }

      const { html, text } = introEmail({
        name:        contact.name as string | undefined,
        email:       contact.email as string,
        magic_token: token,
      });

      const { data, error } = await resend.emails.send({
        from:     "SaralPrivacy <briefings@news.saralprivacy.com>",
        replyTo:  "privacy@saralprivacy.com",
        to:       contact.email as string,
        subject:  "DPDPA is in force — what it means for your recruitment business",
        html,
        text,
      });

      if (error || !data) {
        console.error(`[outreach-send] Failed ${contact.email}:`, error);
        failed++;
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

    return NextResponse.json({ sent, failed, remaining: (res.total - sent) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach-send]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import {
  TemplateDownloadFormSchema,
  templateNames,
  templateExtensions,
  formatPhoneNumber,
  TemplateOption,
} from "@/lib/templates/validation";
import { buildTemplateLeadDocument } from "@/lib/templates/lead";
import { resend } from "@/lib/resendClient";
import { list } from "@vercel/blob";
import { upsertSubscriber } from "@/lib/subscribers";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";

// ─── Clients ──────────────────────────────────────────────────────────────────


// Twilio is optional — feature degrades gracefully if env vars are missing
const twilioEnabled =
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_WHATSAPP_FROM;

// ─── Template URL resolution ──────────────────────────────────────────────────

const BLOB_PREFIX = "dpdpa-templates/";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com";

/**
 * Fetches the download URL for a given template.
 *
 * Strategy:
 * 1. Try Vercel Blob (production path — templates uploaded via upload-templates.mjs)
 * 2. Fall back to public/ URL (works locally and before Blob upload)
 */
async function getTemplateUrl(templateId: TemplateOption): Promise<string> {
  const ext = templateExtensions[templateId];
  const filename = `${templateId}${ext}`;

  // Attempt Blob lookup if token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: `${BLOB_PREFIX}${filename}` });
      if (blobs.length > 0) {
        return blobs[0].url;
      }
    } catch (err) {
      console.error("[templates/download] Blob lookup failed, falling back to public/:", err);
    }
  }

  // Fallback: serve from public/templates/
  return `${SITE_URL}/templates/${filename}`;
}

// ─── Email delivery ───────────────────────────────────────────────────────────

async function sendTemplateEmail(props: {
  email: string;
  contactPersonName: string;
  businessName: string;
  templateName: string;
  downloadUrl: string;
  consentBriefings: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const from =
      process.env.RESEND_FROM_NOREPLY ||
      "templates@saralprivacy.com";

    const result = await resend.emails.send({
      from,
      to: props.email,
      subject: `Your "${props.templateName}" is ready — download now`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your DPDPA Template</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f8fafc; margin:0; padding:0; }
    .wrapper { max-width:560px; margin:32px auto; background:#fff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; }
    .header { background:#0f2942; padding:28px 32px; }
    .header h1 { color:#fff; font-size:20px; margin:0; font-weight:700; }
    .header p { color:#94a3b8; font-size:13px; margin:4px 0 0; }
    .body { padding:32px; }
    .body p { color:#475569; font-size:14px; line-height:1.6; margin:0 0 16px; }
    .cta { display:inline-block; background:#22c55e; color:#fff; font-weight:700; font-size:15px; padding:14px 28px; border-radius:8px; text-decoration:none; margin:8px 0 24px; }
    .note { background:#f1f5f9; border-radius:8px; padding:14px 16px; font-size:13px; color:#64748b; }
    .note strong { color:#334155; }
    .footer { padding:20px 32px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; }
    .footer a { color:#64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>SaralPrivacy</h1>
      <p>DPDPA Compliance for Indian Businesses</p>
    </div>
    <div class="body">
      <p>Hi ${props.contactPersonName},</p>
      <p>Your <strong>${props.templateName}</strong> for <strong>${props.businessName}</strong> is ready.</p>
      <a href="${props.downloadUrl}" style="display:inline-block;background:#07B981;color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;margin:8px 0 24px;">⬇ Download Template</a>
      <div class="note">
        <strong>What's in this template?</strong><br />
        This is a ready-to-use DPDPA compliance document. Review it with your legal team before publishing or sharing externally.
      </div>
      ${props.consentBriefings
        ? `<p style="margin-top:24px">You're subscribed to daily DPDPA briefings — expect your first one tomorrow morning.</p>`
        : ""}
    </div>
    <div class="footer">
      You received this because you downloaded a template from <a href="https://saralprivacy.com">saralprivacy.com</a>.
    </div>
  </div>
</body>
</html>`,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[templates/download] Email send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email failed",
    };
  }
}

// ─── WhatsApp delivery ────────────────────────────────────────────────────────

async function sendTemplateWhatsApp(props: {
  phoneNumber: string;
  contactPersonName: string;
  templateName: string;
  downloadUrl: string;
}): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  if (!twilioEnabled) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    // Raw Twilio REST call — the SDK was 9.6 MB and two majors stale for this
    // one request. Basic auth + form body is the whole API.
    const sid  = process.env.TWILIO_ACCOUNT_SID!;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN!}`).toString("base64");
    const params = new URLSearchParams({
      From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      To:   `whatsapp:${props.phoneNumber}`,
      Body: `Hi ${props.contactPersonName}! 👋\n\nYour *${props.templateName}* from SaralPrivacy is ready.\n\n⬇ Download here:\n${props.downloadUrl}\n\n— SaralPrivacy DPDPA Templates`,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    const message = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok || !message.sid) {
      return { success: false, error: message.message || `Twilio HTTP ${res.status}` };
    }

    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error("[templates/download] WhatsApp send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "WhatsApp failed",
    };
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Same guards as every other public POST — this one can burn Twilio spend.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true }); // silent drop for bots
    }
    const limited = rateLimit(`template-download:${getClientIp(request)}`, 5, 10 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
      );
    }

    // Validate input
    const validated = TemplateDownloadFormSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { message: "Invalid form data", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    const formattedPhone = formatPhoneNumber(data.phoneNumber);
    const templateName = templateNames[data.templateSelected];

    // Resolve template URL (Blob → public/ fallback)
    const downloadUrl = await getTemplateUrl(data.templateSelected);

    // IP / geo from headers (Vercel-injected)
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";

    // Save lead to Appwrite (non-fatal if it fails). The payload builder is
    // pinned to the collection schema — see lib/templates/lead.ts. Briefings
    // consent is not a collection attribute; it drives the subscriber upsert
    // below instead.
    try {
      const doc = await databases.createDocument(
        DB_ID,
        COLLECTIONS.TEMPLATE_DOWNLOADS,
        ID.unique(),
        buildTemplateLeadDocument({
          email:          data.email,
          contactName:    data.contactPersonName,
          businessName:   data.businessName,
          templateName,
          phone:          formattedPhone,
          consentContact: data.consentContact,
          referer:        request.headers.get("referer"),
          ip,
          city,
          country,
        })
      );
      console.log(`[templates/download] Lead saved: ${doc.$id}`);
    } catch (err) {
      console.error("[templates/download] Appwrite save failed (non-fatal):", err);
    }

    // Subscribe to briefings if opted in (non-fatal)
    if (data.consentBriefings) {
      upsertSubscriber({
        email:  data.email,
        name:   data.contactPersonName,
        source: "template_download",
        ip,
        city,
        country,
      }).catch((err) => console.error("[templates/download] upsertSubscriber failed:", err));
    }

    // Send email (required — fail request if this fails)
    const emailResult = await sendTemplateEmail({
      email:             data.email,
      contactPersonName: data.contactPersonName,
      businessName:      data.businessName,
      templateName,
      downloadUrl,
      consentBriefings:  data.consentBriefings,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send template email. Please try again." },
        { status: 500 }
      );
    }

    // Send WhatsApp if user opted in (non-fatal — degrades gracefully)
    let whatsappResult = { success: false };
    if (data.consentContact) {
      whatsappResult = await sendTemplateWhatsApp({
        phoneNumber:       formattedPhone,
        contactPersonName: data.contactPersonName,
        templateName,
        downloadUrl,
      });
    }

    return NextResponse.json({
      success:     true,
      message:     "Template sent successfully",
      downloadUrl,
      email:       true,
      whatsapp:    whatsappResult.success,
    });
  } catch (error) {
    console.error("[templates/download] Unhandled error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

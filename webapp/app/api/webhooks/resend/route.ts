import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { insertDocument, findOneByEmail, updateDocumentById } from "@/lib/db";

export const runtime = "nodejs";

// Mark contact as bounced/complained in a given collection (by email field)
async function updateContactStatus(collection: string, email: string, status: string) {
  try {
    const doc = await findOneByEmail(collection, email);
    if (!doc) return;
    await updateDocumentById(collection, doc.id, { status });
  } catch (err) {
    console.error(`[resend-webhook] updateContactStatus ${collection} ${email}:`, err);
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Verify svix signature
  const wh = new Webhook(secret);
  let payload: Record<string, any>;
  try {
    payload = wh.verify(rawBody, {
      "svix-id":        request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    }) as Record<string, any>;
  } catch (err) {
    console.error("[resend-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType: string = payload.type ?? "";
  const email: string     = (payload.data?.to?.[0] ?? payload.data?.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "No email in payload" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Log every event to email_send_log
  insertDocument("email_send_log", {
    recipient_email:   email,
    email_type:        "intro",
    resend_message_id: payload.data?.email_id ?? "",
    status:            eventType,
    consent_basis:     "webhook_event",
    sent_at:           now,
  }).catch((err) => console.error("[resend-webhook] email_send_log:", err));

  if (eventType === "email.bounced") {
    await Promise.all([
      updateContactStatus("outreach_contacts", email, "bounced"),
      updateContactStatus("subscribers", email, "bounced"),
    ]);
    console.log(`[resend-webhook] Marked bounced: ${email}`);
  }

  else if (eventType === "email.complained") {
    await Promise.all([
      updateContactStatus("outreach_contacts", email, "complained"),
      updateContactStatus("subscribers", email, "complained"),
    ]);
    console.log(`[resend-webhook] Marked complained: ${email}`);
  }

  else if (eventType === "email.delivery_delayed") {
    console.log(`[resend-webhook] Delivery delayed: ${email}`);
    // Logged above — no status change needed
  }

  return NextResponse.json({ received: true, event: eventType, email });
}

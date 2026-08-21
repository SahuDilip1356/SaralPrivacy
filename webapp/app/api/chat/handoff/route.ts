// Consented consultation handoff from the Setu widget (outcome-layer §6.4).
//
// This is the only place the widget touches personal data, so it is built to
// be the demonstration case for what SaralPrivacy sells: purpose stated at the
// point of collection, unticked consent, three fields, and a consent-log row
// stamped with the notice version in force.
//
// Failure posture differs from /api/chat/feedback on purpose. Feedback
// degrades silently because a lost thumbs-up is nothing; a lost LEAD is worse
// than a visible error, so this route surfaces failures and the widget falls
// back to /contact.
//
// Scope note: the spec (§6.5) called for extracting the shared lead-write out
// of app/api/contact/route.ts into lib/leads.ts so there is one path. That
// refactor touches a non-Setu route and this branch is scoped to the chatbot,
// so the sequence below is a deliberate second implementation of the same
// three steps against the same collections. Consolidating it is a one-file
// change whenever that scope opens.

import { NextRequest, NextResponse } from "next/server";

import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";
import { sendConsultationAlert } from "@/lib/email";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { sanitizeState } from "@/lib/chat/journeys";
import { buildHandoffPacket, isEscalationReason, validateHandoffInput } from "@/lib/chat/handoff";

const MAX_MESSAGE_CHARS = 2000;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Tighter than /api/contact's 6/min: higher intent, far lower legitimate volume.
  const ip = getClientIp(request);
  const rl = rateLimit(`chat-handoff:${ip}`, 3, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // Only bots fill the hidden field. Pretend success, store nothing — same
  // behaviour as /api/contact so the two are indistinguishable to a prober.
  if (isHoneypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const valid = validateHandoffInput(body);
  if (!valid.ok) {
    return NextResponse.json({ error: valid.error }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 200) : "";
  const reason = isEscalationReason(body.reason) ? body.reason : "explicit_ask";
  const lastUserMessage =
    typeof body.lastUserMessage === "string" ? body.lastUserMessage.slice(0, MAX_MESSAGE_CHARS) : "";

  const state = sanitizeState(body.state, sessionId, pageUrl);
  const packet = buildHandoffPacket({ state, pageUrl, reason, lastUserMessage });

  const city = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
  const country = request.headers.get("x-vercel-ip-country") || "";
  const region = request.headers.get("x-vercel-ip-country-region") || "";
  const userAgent = request.headers.get("user-agent") || "";

  // Same shape /api/contact writes, so these land in /admin/leads and
  // /admin/consultations with no admin-side work. `source` is the only
  // field that distinguishes them.
  const leadData = {
    name: valid.contact.name,
    email: valid.contact.email,
    phone: "",
    company: "",
    industry: packet.industry ?? "",
    company_size: "",
    source: "setu_handoff",
    issue_summary: `${packet.summary}\n\nUnresolved: ${packet.unresolvedQuestion}\n\nPages shown: ${
      packet.sourcesShown.join(", ") || "none"
    }\nTrigger: ${packet.reason}`,
    preferred_contact: "email",
    preferred_time: "",
    consent_version: PRIVACY_NOTICE_VERSION,
    risk_level: "",
    created_at: packet.ts,
    ip_address: ip,
    city,
    country,
    region,
  };

  try {
    await databases.createDocument(DB_ID, COLLECTIONS.LEADS, ID.unique(), leadData);
  } catch (err) {
    console.error("setu handoff lead write failed:", (err as Error).message);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please use the contact page." },
      { status: 500 }
    );
  }

  // Consent record. Non-blocking: the lead is already safe, and losing the log
  // row must not cost the user their callback — but it is logged loudly
  // because it is the record that matters if anyone ever asks.
  databases
    .createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
      email: valid.contact.email,
      name: valid.contact.name,
      source: "setu_handoff",
      consent_type: "data_processing",
      consent_value: true,
      privacy_version: PRIVACY_NOTICE_VERSION,
      ip_address: ip,
      user_agent: userAgent,
      city,
      country,
      region,
      timestamp: packet.ts,
    })
    .catch((err) => console.error("setu handoff consent_log write failed:", err));

  sendConsultationAlert(leadData).catch((err) =>
    console.error("setu handoff sendConsultationAlert failed:", err)
  );

  return NextResponse.json({ ok: true });
}

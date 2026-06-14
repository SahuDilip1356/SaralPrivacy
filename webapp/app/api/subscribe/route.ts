import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendWelcomeEmail } from "@/lib/email";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";

export async function POST(request: NextRequest) {
  const rl = rateLimit(`subscribe:${getClientIp(request)}`, 6, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, industry, frequency, consentEmail } = body;

    // Honeypot: only bots fill the hidden field. Pretend success, store nothing.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true, message: "Subscription successful." });
    }

    if (!email || !consentEmail) {
      return NextResponse.json({ error: "Email and email consent are required." }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region  = request.headers.get("x-vercel-ip-country-region") || "";
    const userAgent = request.headers.get("user-agent") || "";

    // Name is optional on the form; the `subscribers.name` attribute is required,
    // so fall back to the email local-part. Only the 7 attributes that exist on the
    // collection are written — sending ip/city/country/region (which aren't defined
    // on `subscribers`) is what made every signup fail with "Invalid document
    // structure". Geo/IP for the consent audit trail lives on `consent_log` below.
    const subscriberData = {
      name:             (name && name.trim()) || email.split("@")[0],
      email,
      industry:         industry || "",
      frequency:        frequency || "daily",
      consent_version:  PRIVACY_NOTICE_VERSION,
      consent_source:   "newsletter_subscribe",
      user_agent:       userAgent,
      created_at:       new Date().toISOString(),
    };

    await databases.createDocument(DB_ID, COLLECTIONS.SUBSCRIBERS, ID.unique(), subscriberData);

    // Write consent log entry
    const timestamp = new Date().toISOString();
    databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
      email,
      name,
      source:          "subscribe",
      consent_type:    "email_marketing",
      consent_value:   true,
      privacy_version: PRIVACY_NOTICE_VERSION,
      ip_address:      ip,
      user_agent:      userAgent,
      city,
      country,
      region,
      timestamp,
    }).catch((err) => console.error("consent_log write error:", err));

    // Fire-and-forget welcome email — do not block the response
    sendWelcomeEmail({ name, email }).catch((err) =>
      console.error("sendWelcomeEmail error:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Subscription successful. Check your inbox for confirmation.",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
        _debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

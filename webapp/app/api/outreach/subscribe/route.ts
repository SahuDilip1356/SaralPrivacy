import { NextRequest, NextResponse } from "next/server";
import { insertDocument, findOneBy, findOneByEmail, updateDocumentById } from "@/lib/db";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }

    // Find outreach contact by magic_token
    const contact = await findOneBy("outreach_contacts", "magic_token", token);

    if (!contact) {
      return NextResponse.json({ error: "Link not recognised or already used." }, { status: 404 });
    }
    const email = (contact.email as string).trim().toLowerCase();

    if (contact.status === "subscribed") {
      return NextResponse.json({ success: true, already: true, name: contact.name || "" });
    }

    const now = new Date().toISOString();

    // Check if already a subscriber
    const existing = await findOneByEmail("subscribers", email);

    if (!existing) {
      // Create new subscriber with explicit one-click consent
      await insertDocument("subscribers", {
        name:            contact.name || "",
        email,
        industry:        contact.industry || "",
        frequency:       "daily",
        consent_version: PRIVACY_NOTICE_VERSION,
        consent_source:  "intro_email_one_click", // enum: manual|assessment_form|intro_email_one_click|report_email_cta|admin_added
        status:          "active",                // enum: active|unsubscribed|bounced|complained
        created_at:      now,
        ip_address:      "",
        city:            "",
        country:         "",
        region:          "",
        user_agent:      "",
      });

      // Consent log
      insertDocument("consent_log", {
        email,
        name:            contact.name || "",
        source:          "outreach_magic_link",
        consent_type:    "email_marketing",
        consent_value:   true,
        privacy_version: PRIVACY_NOTICE_VERSION,
        ip_address:      "",
        user_agent:      "",
        city:            "",
        country:         "",
        region:          "",
        timestamp:       now,
      }).catch((err) => console.error("consent_log:", err));
    }

    // Mark outreach contact as subscribed
    await updateDocumentById("outreach_contacts", contact.id, {
      status:        "subscribed",
      subscribed_at: now,
    });

    return NextResponse.json({ success: true, already: false, name: contact.name || "" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach/subscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

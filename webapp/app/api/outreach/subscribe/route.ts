import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }

    // Find outreach contact by magic_token
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, [
      Query.equal("magic_token", token),
      Query.limit(1),
    ]);

    if (!res.documents.length) {
      return NextResponse.json({ error: "Link not recognised or already used." }, { status: 404 });
    }

    const contact = res.documents[0];
    const email = (contact.email as string).trim().toLowerCase();

    if (contact.status === "subscribed") {
      return NextResponse.json({ success: true, already: true, name: contact.name || "" });
    }

    const now = new Date().toISOString();

    // Check if already a subscriber
    const existing = await databases.listDocuments(DB_ID, COLLECTIONS.SUBSCRIBERS, [
      Query.equal("email", email),
      Query.limit(1),
    ]);

    if (!existing.documents.length) {
      // Create new subscriber with explicit one-click consent
      await databases.createDocument(DB_ID, COLLECTIONS.SUBSCRIBERS, ID.unique(), {
        name:            contact.name || "",
        email,
        industry:        contact.industry || "",
        frequency:       "daily",
        consent_version: PRIVACY_NOTICE_VERSION,
        created_at:      now,
        ip_address:      "",
        city:            "",
        country:         "",
        region:          "",
        user_agent:      "",
      });

      // Consent log
      databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
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
    await databases.updateDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, contact.$id, {
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

import { NextRequest, NextResponse } from "next/server";
import { findOneBy, updateDocumentById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }

    const contact = await findOneBy("outreach_contacts", "magic_token", token);

    if (!contact) {
      return NextResponse.json({ error: "Link not recognised." }, { status: 404 });
    }

    if (contact.status === "unsubscribed") {
      return NextResponse.json({ success: true, already: true });
    }

    await updateDocumentById("outreach_contacts", contact.id, {
      status: "unsubscribed",
    });

    return NextResponse.json({ success: true, already: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach/unsubscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }

    const res = await databases.listDocuments(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, [
      Query.equal("magic_token", token),
      Query.limit(1),
    ]);

    if (!res.documents.length) {
      return NextResponse.json({ error: "Link not recognised." }, { status: 404 });
    }

    const contact = res.documents[0];

    if (contact.status === "unsubscribed") {
      return NextResponse.json({ success: true, already: true });
    }

    await databases.updateDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, contact.$id, {
      status: "unsubscribed",
    });

    return NextResponse.json({ success: true, already: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach/unsubscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const normalised = email.trim().toLowerCase();

    const res = await databases.listDocuments(DB_ID, COLLECTIONS.SUBSCRIBERS, [
      Query.equal("email", normalised),
      Query.limit(1),
    ]);

    if (!res.documents.length) {
      // Not found — still return success so the page shows a clean state
      return NextResponse.json({ success: true, already_removed: true });
    }

    await databases.updateDocument(DB_ID, COLLECTIONS.SUBSCRIBERS, res.documents[0].$id, {
      status: "unsubscribed",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[subscribers/unsubscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

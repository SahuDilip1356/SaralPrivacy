import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS } from "@/lib/appwrite";

/**
 * DELETE /api/briefings/delete?id=<documentId>
 * Protected by BRIEFING_CRON_SECRET (same as /api/briefings/generate).
 * Used by the pipeline to remove duplicate briefing documents.
 */
export async function DELETE(request: NextRequest) {
  try {
    const secret = (request.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (secret !== process.env.BRIEFING_CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
    }

    await databases.deleteDocument(DB_ID, COLLECTIONS.BRIEFINGS, id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Briefing delete error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

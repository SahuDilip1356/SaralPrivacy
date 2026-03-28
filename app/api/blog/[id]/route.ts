import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS } from "@/lib/appwrite";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const doc = await databases.getDocument(DB_ID, COLLECTIONS.BLOG_POSTS, id);
    return NextResponse.json(doc);
  } catch (err: unknown) {
    console.error("[blog/[id] GET]", err);
    const message = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

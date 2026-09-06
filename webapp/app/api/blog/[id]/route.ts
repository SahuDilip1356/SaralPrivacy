import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const doc = await getDocumentById("blog_posts", id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err: unknown) {
    console.error("[blog/[id] GET]", err);
    const message = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { loadIndex } from "@/lib/chat/retrieve";

export async function GET() {
  try {
    const engine = loadIndex();
    return NextResponse.json({ ok: true, chunks: engine.index.chunks.length });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

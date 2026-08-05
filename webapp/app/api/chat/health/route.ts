import { NextResponse } from "next/server";
import { loadIndex } from "@/lib/chat/retrieve";
import { isPineconeConfigured, pineconeStats, INDEX_NAME } from "@/lib/chat/pinecone";

export async function GET() {
  try {
    const engine = loadIndex();
    // Pinecone is the primary retrieval path (D7); report it so a bad key or
    // an empty namespace is visible without reading logs.
    const configured = isPineconeConfigured();
    const stats = configured ? await pineconeStats() : null;
    return NextResponse.json({
      ok: true,
      chunks: engine.index.chunks.length,
      pinecone: {
        configured,
        index: INDEX_NAME,
        records: stats?.vectorCount ?? null,
        reachable: stats !== null,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

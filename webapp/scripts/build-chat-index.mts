// Build the Setu chat index → public/chat-index.json
// Run: node --experimental-strip-types scripts/build-chat-index.mts [--no-embed]
//
// Always writes chunks (deterministic, offline). Adds dense vectors only when
// OPENROUTER_API_KEY is present and --no-embed is not passed; on any embedding
// failure the index is still written without vectors (BM25 + router remain the
// retrieval backbone — strategy doc §3.1, spec D6).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { collectAllChunks, assertAppRoot, type ChatChunk } from "../lib/chat/index-build.ts";

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(APP_ROOT, "public", "chat-index.json");
const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_URL = "https://openrouter.ai/api/v1/embeddings";

async function embed(texts: string[], key: string): Promise<number[][]> {
  const vectors: number[][] = [];
  const BATCH = 64;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch(EMBED_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input: batch }),
    });
    if (!res.ok) throw new Error(`embeddings HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { data: Array<{ index: number; embedding: number[] }> };
    const sorted = [...data.data].sort((a, b) => a.index - b.index);
    vectors.push(...sorted.map((d) => d.embedding));
    process.stdout.write(`  embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}\r`);
  }
  return vectors;
}

async function main() {
  assertAppRoot(APP_ROOT);
  const { chunks, stats } = collectAllChunks(APP_ROOT);
  console.log("chunk stats:", JSON.stringify(stats, null, 2));

  let embeddings: number[][] | null = null;
  const key = process.env.OPENROUTER_API_KEY;
  if (key && !process.argv.includes("--no-embed")) {
    try {
      embeddings = await embed(chunks.map((c: ChatChunk) => `${c.title} — ${c.section}\n${c.text}`), key);
      console.log(`\nembedded ${embeddings.length} chunks with ${EMBED_MODEL}`);
    } catch (err) {
      console.warn(`\nembedding failed (${(err as Error).message}) — writing lexical-only index`);
    }
  } else {
    console.log("no OPENROUTER_API_KEY (or --no-embed) — writing lexical-only index");
  }

  const index = {
    version: 1,
    model: embeddings ? EMBED_MODEL : null,
    stats,
    chunks,
    embeddings,
  };
  writeFileSync(OUT, JSON.stringify(index));
  console.log(`wrote ${OUT} (${Math.round(JSON.stringify(index).length / 1024)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

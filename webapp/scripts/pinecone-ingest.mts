// Load the chat corpus into Pinecone (decision D7).
// Run: node --import ./scripts/ts-resolve.mjs --experimental-strip-types \
//        scripts/pinecone-ingest.mts [--dry-run]
//
// Source of truth is the same collectAllChunks() the lexical index uses, so the
// two stores can never drift. Re-runnable: upserts overwrite by _id.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { collectAllChunks, assertAppRoot } from "../lib/chat/index-build.ts";
import {
  UPSERT_BATCH,
  chunkToRecord,
  pineconeStats,
  pineconeUpsert,
  isPineconeConfigured,
  INDEX_NAME,
  NAMESPACE,
} from "../lib/chat/pinecone.ts";

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Load PINECONE_API_KEY from .env.local when not already in the environment. */
function loadEnvKey(): void {
  if (process.env.PINECONE_API_KEY) return;
  try {
    const env = readFileSync(join(APP_ROOT, ".env.local"), "utf8");
    const line = env.split("\n").find((l) => l.startsWith("PINECONE_API_KEY="));
    if (line) {
      process.env.PINECONE_API_KEY = line.slice("PINECONE_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

async function main() {
  loadEnvKey();
  const dryRun = process.argv.includes("--dry-run");

  if (!dryRun && !isPineconeConfigured()) {
    console.error("PINECONE_API_KEY missing — set it in .env.local or the environment.");
    process.exit(1);
  }

  assertAppRoot(APP_ROOT);
  const { chunks, stats } = collectAllChunks(APP_ROOT);
  const records = chunks.map(chunkToRecord);
  console.log(`corpus: ${records.length} chunks`, JSON.stringify(stats.bySource));

  // Guard the metadata contract before we ship anything to the network.
  for (const r of records) {
    if (!r._id || !r.chunk_text) throw new Error(`record missing id/text: ${r._id}`);
    if (r._id.length > 512) throw new Error(`id too long: ${r._id}`);
    for (const [k, v] of Object.entries(r)) {
      if (v === null || v === undefined) throw new Error(`null metadata ${k} on ${r._id}`);
      if (Array.isArray(v) && v.some((x) => typeof x !== "string")) {
        throw new Error(`non-string array member in ${k} on ${r._id}`);
      }
    }
  }
  console.log("metadata contract: ok");

  if (dryRun) {
    console.log("dry run — sample record:\n", JSON.stringify(records[0], null, 2).slice(0, 600));
    return;
  }

  const batches = Math.ceil(records.length / UPSERT_BATCH);
  for (let i = 0; i < records.length; i += UPSERT_BATCH) {
    const batch = records.slice(i, i + UPSERT_BATCH);
    const n = Math.floor(i / UPSERT_BATCH) + 1;
    process.stdout.write(`  upserting batch ${n}/${batches} (${batch.length})…`);
    await pineconeUpsert(batch);
    console.log(" ok");
  }

  // Indexing is async — poll until the count settles.
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    const s = await pineconeStats();
    console.log(`  namespace "${NAMESPACE}" record count: ${s?.vectorCount ?? "?"}`);
    if (s && s.vectorCount >= records.length) break;
  }
  console.log(`done → index "${INDEX_NAME}", namespace "${NAMESPACE}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

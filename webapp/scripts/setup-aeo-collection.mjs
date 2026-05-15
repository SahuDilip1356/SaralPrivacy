/**
 * Create the `ai_citations` Appwrite collection for the AEO Citation Panel.
 *
 * Idempotent — re-running skips existing collection / attributes / indexes.
 *
 * Run: node scripts/setup-aeo-collection.mjs
 *
 * Permissions: server-side only (empty permissions array). The Appwrite API key
 * bypasses permissions, so the cron handler and admin dashboard work without
 * exposing the data publicly.
 */
import { Client, Databases, IndexType } from "node-appwrite";

// Matches the convention in scripts/setup-appwrite.mjs (credentials inline)
const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69bb4ab80007eaf643ad")
  .setKey("standard_63387cf3a0075c38537166adf2a108e3414b665cbd60113c2dedeb464087d8e54871bd6a564d76652dd672ce56f92ff2bd5e457fccad62091ab349d76585c13bbceccd058675758dd7bd72dd7abf8706e9217de73a0318f7b6cff35bfc65a991342eeef1d8846239cadcebeeeef1f7591039de8c1f3e62e990b8bd961efb4ac1");

const db = new Databases(client);
const DATABASE_ID  = "69bb4b6200165ff03610";
const COLLECTION_ID = "ai_citations";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ATTRIBUTES = [
  { key: "run_id",          type: "string",  size: 64,    required: true  },
  { key: "date",            type: "string",  size: 10,    required: true  },
  { key: "week_num",        type: "integer",              required: true  },
  { key: "engine",          type: "string",  size: 32,    required: true  },
  { key: "engine_label",    type: "string",  size: 64,    required: true  },
  { key: "query_id",        type: "string",  size: 8,     required: true  },
  { key: "query_text",      type: "string",  size: 500,   required: true  },
  { key: "cited",           type: "string",  size: 32,    required: true  },
  { key: "position",        type: "integer",              required: false },
  { key: "cited_page",      type: "string",  size: 500,   required: false },
  { key: "quote_type",      type: "string",  size: 32,    required: false },
  { key: "competitors",     type: "string",  size: 4000,  required: false },
  { key: "raw_citations",   type: "string",  size: 50000, required: false },
  { key: "content_snippet", type: "string",  size: 1000,  required: false },
  { key: "duration_ms",     type: "integer",              required: false },
  { key: "error_message",   type: "string",  size: 1000,  required: false },
];

const INDEXES = [
  { key: "idx_run_id", type: IndexType.Key, attrs: ["run_id"],   orders: ["ASC"]  },
  { key: "idx_date",   type: IndexType.Key, attrs: ["date"],     orders: ["DESC"] },
  { key: "idx_engine", type: IndexType.Key, attrs: ["engine"],   orders: ["ASC"]  },
];

async function ensureCollection() {
  console.log(`→ Collection: ${COLLECTION_ID}`);
  try {
    await db.createCollection(DATABASE_ID, COLLECTION_ID, "AI Citations", []);
    console.log("  ✓ collection created (permissions: server-only)");
  } catch (e) {
    if (e.code === 409) {
      console.log("  ↩ already exists, skipping");
    } else {
      console.error("  ✗", e.message);
      throw e;
    }
  }
}

async function ensureAttributes() {
  console.log("\n→ Attributes");
  for (const attr of ATTRIBUTES) {
    await wait(700);
    try {
      if (attr.type === "string") {
        await db.createStringAttribute(
          DATABASE_ID, COLLECTION_ID,
          attr.key, attr.size, attr.required, null
        );
      } else if (attr.type === "integer") {
        await db.createIntegerAttribute(
          DATABASE_ID, COLLECTION_ID,
          attr.key, attr.required, null, null, null
        );
      }
      console.log(`  ✓ ${attr.key} (${attr.type}${attr.size ? `:${attr.size}` : ""}${attr.required ? ", required" : ""})`);
    } catch (e) {
      if (e.code === 409) {
        console.log(`  ↩ exists: ${attr.key}`);
      } else {
        console.error(`  ✗ ${attr.key}:`, e.message);
      }
    }
  }
}

async function ensureIndexes() {
  console.log("\n→ Indexes (waiting 5s for attributes to settle…)");
  await wait(5000);
  for (const idx of INDEXES) {
    await wait(700);
    try {
      await db.createIndex(
        DATABASE_ID, COLLECTION_ID,
        idx.key, idx.type, idx.attrs, idx.orders
      );
      console.log(`  ✓ ${idx.key} on [${idx.attrs.join(", ")}]`);
    } catch (e) {
      if (e.code === 409) {
        console.log(`  ↩ exists: ${idx.key}`);
      } else {
        console.error(`  ✗ ${idx.key}:`, e.message);
      }
    }
  }
}

async function main() {
  console.log("AEO Citation Panel — Appwrite Setup");
  console.log("====================================");
  await ensureCollection();
  await ensureAttributes();
  await ensureIndexes();
  console.log("\n✓ Done.");
  console.log(`  Collection ID: ${COLLECTION_ID}`);
  console.log(`  Database ID:   ${DATABASE_ID}`);
  console.log("\nNext: add CRON_SECRET to Vercel env vars, then push + trigger a baseline run.");
}

main().catch((e) => {
  console.error("\nFatal:", e);
  process.exit(1);
});

/**
 * One-off, idempotent repair: normalise malformed blog-post slugs.
 *
 * A slug stored with a leading/trailing slash or whitespace (e.g.
 * "/dpdp-act-...") makes the public detail route's exact-match query miss,
 * so the live post 404s while still appearing in the /blog list. The save
 * route now sanitises slugs on write (normalizeSlug), but documents created
 * before that fix still hold bad values. This script corrects them in place.
 *
 * Safe by default: prints a dry-run. Pass --apply to write.
 *
 * Run from the webapp dir (where .env.local + node_modules live):
 *   node --env-file=.env.local scripts/fix-blog-slugs.mjs          # dry-run
 *   node --env-file=.env.local scripts/fix-blog-slugs.mjs --apply  # write
 */
import { Client, Databases, Query } from "node-appwrite";

const APPLY = process.argv.includes("--apply");

const endpoint = (process.env.APPWRITE_ENDPOINT || "").trim();
const project = (process.env.APPWRITE_PROJECT_ID || "").trim();
const apiKey = (process.env.APPWRITE_API_KEY || "").trim();
const dbId = (process.env.APPWRITE_DATABASE_ID || "").trim();
const COLLECTION = "blog_posts";

if (!endpoint || !project || !apiKey || !dbId) {
  console.error(
    "Missing Appwrite env. Run with: node --env-file=.env.local scripts/fix-blog-slugs.mjs"
  );
  process.exit(1);
}

// Must stay byte-identical to normalizeSlug() in app/api/blog/save/route.ts
const normalizeSlug = (raw) =>
  String(raw ?? "").trim().replace(/^\/+|\/+$/g, "").trim();

const db = new Databases(
  new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
);

async function listAll() {
  const out = [];
  let cursor;
  for (;;) {
    const q = [Query.limit(100)];
    if (cursor) q.push(Query.cursorAfter(cursor));
    const page = await db.listDocuments(dbId, COLLECTION, q);
    out.push(...page.documents);
    if (page.documents.length < 100) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }
  return out;
}

const docs = await listAll();
const broken = docs
  .map((d) => ({ d, fixed: normalizeSlug(d.slug) }))
  .filter(({ d, fixed }) => fixed !== d.slug);

console.log(`Scanned ${docs.length} blog posts.`);
if (broken.length === 0) {
  console.log("All slugs already clean. Nothing to do.");
  process.exit(0);
}

console.log(`${broken.length} malformed slug(s)${APPLY ? " — APPLYING:" : " (dry-run):"}`);
for (const { d, fixed } of broken) {
  if (!fixed) {
    console.log(`  SKIP ${d.$id} — slug "${d.slug}" normalises to empty (manual review)`);
    continue;
  }
  console.log(`  ${d.$id}: "${d.slug}"  ->  "${fixed}"`);
  if (APPLY) {
    await db.updateDocument(dbId, COLLECTION, d.$id, { slug: fixed });
    console.log(`    ✓ updated`);
  }
}

console.log(
  APPLY
    ? "Done. Verify the public URL, then it's permanent."
    : "Dry-run only. Re-run with --apply to write."
);

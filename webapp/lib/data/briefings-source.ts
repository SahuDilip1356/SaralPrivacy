/**
 * briefings-source.ts — one source of truth for "which briefings are published".
 *
 * The sitemap and the homepage TrustStrip count both read from here, so neither
 * can drift from what /briefings actually serves. Before this existed the sitemap
 * carried a hardcoded 8-slug array while 122 briefings were live, and the homepage
 * advertised "200+ Briefings published" against the same 122.
 *
 * Rules this file exists to enforce:
 *   - Never hardcode a slug list that has to be hand-maintained.
 *   - Always paginate — the collection is well past a single 100-doc page.
 *   - Never let a public count exceed the real count.
 */
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { unstable_cache } from "next/cache";

export type BriefingRef = {
  slug: string;
  /** Real per-document publish/update date — used as sitemap <lastmod>. */
  updated: Date;
};

const PAGE = 100;
/** Safety stop so a bad `total` can never spin the loop forever. */
const MAX_PAGES = 50;

async function _fetchPublishedBriefings(): Promise<BriefingRef[]> {
  const refs: BriefingRef[] = [];
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
        Query.equal("status", ["sent", "approved"]),
        Query.orderDesc("$createdAt"),
        Query.limit(PAGE),
        Query.offset(page * PAGE),
      ]);

      for (const doc of result.documents as any[]) {
        if (!doc.slug) continue;
        const raw = doc.published_at || doc.created_at || doc.$updatedAt;
        const parsed = new Date(raw);
        refs.push({
          // Lowercased to match the canonical URL proxy.ts redirects to, so the
          // sitemap never advertises a URL that would 308 on crawl.
          slug: (doc.slug as string).toLowerCase(),
          updated: isNaN(parsed.getTime()) ? new Date() : parsed,
        });
      }

      if (result.documents.length < PAGE || refs.length >= result.total) break;
    }
  } catch {
    // Appwrite unreachable (e.g. env vars absent in a preview build) — return
    // whatever we got. Callers degrade gracefully rather than rendering a lie.
    return refs;
  }
  return refs;
}

/** All published briefing slugs + real dates. Cached hourly; briefings publish once daily. */
export const getPublishedBriefings = unstable_cache(
  _fetchPublishedBriefings,
  ["briefings-source-v1"],
  { revalidate: 3600, tags: ["briefings"] }
);

/**
 * Public-facing count, rounded DOWN to the nearest 10 ("122" → "120+").
 * Returns null when the real count is unknown or too small to advertise, so the
 * caller can fall back to a non-numeric label instead of overclaiming.
 */
export async function getBriefingCountLabel(): Promise<string | null> {
  const briefings = await getPublishedBriefings();
  if (briefings.length < 10) return null;
  return `${Math.floor(briefings.length / 10) * 10}+`;
}

import type { Metadata } from "next";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { BriefingsExplorer, type ExplorerBriefing } from "@/components/briefings/BriefingsExplorer";
import { FORMAT_SLUGS } from "@/lib/data/briefing-taxonomy";
import { unstable_cache } from "next/cache";

export const revalidate = 3600; // Re-fetch every 60 min — briefings are published once daily

// Cache Appwrite response in Next.js data cache (survives across requests within revalidate window)
const getCachedBriefings = unstable_cache(
  async () => {
    // Fetch ALL published briefings (paginated) so the archive shows every one,
    // not just the latest page. Cached hourly, so the loop runs at most 1x/hour.
    const PAGE = 100;
    const docs: any[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
        Query.equal("status", ["sent", "approved"]),
        Query.orderDesc("$createdAt"),
        Query.limit(PAGE),
        Query.offset(offset),
      ]);
      docs.push(...result.documents);
      if (result.documents.length < PAGE || docs.length >= result.total) break;
    }
    return docs;
  },
  ["briefings-list-v3"],
  { revalidate: 3600, tags: ["briefings"] }
);

export const metadata: Metadata = {
  title: "Daily DPDPA Compliance Briefings for India",
  description:
    "Daily DPDPA briefings covering regulatory updates, consent requirements, enforcement signals, and sector-specific compliance guidance for Indian businesses.",
  alternates: { canonical: "https://saralprivacy.com/briefings" },
};

function tryParse(str: string | null | undefined, fallback: any) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

/** Normalise an Appwrite briefing document into the explorer's facet shape. */
function normaliseDoc(doc: any): ExplorerBriefing {
  const industries: string[] = tryParse(doc.industries, ["general"]);
  const tags: string[] = tryParse(doc.tags, []);
  const format = tags.find((t) => FORMAT_SLUGS.has(t)) ?? "";
  return {
    id:       doc.$id,
    slug:     doc.slug,
    title:    doc.title,
    excerpt:  doc.excerpt || doc.summary?.slice(0, 200) || "",
    date:     doc.published_at || doc.created_at || doc.$createdAt,
    readTime: doc.read_time || 5,
    stage:    doc.category || "",          // Stage facet
    sector:   industries[0] || "general",  // Sector facet
    format,                                // Format facet
  };
}

export default async function BriefingsPage() {
  // Fetch from Next.js data cache — only hits Appwrite on cache miss
  let all: ExplorerBriefing[] = [];
  let fetchFailed = false;
  try {
    const docs = await getCachedBriefings();
    all = docs.map(normaliseDoc).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (err) {
    console.error("[briefings] Appwrite fetch failed:", err);
    fetchFailed = true;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-700/40 border border-green-500/50 rounded-full px-3.5 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-green-300 text-xs font-semibold">Published daily</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              DPDPA Daily Briefings
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Clear, actionable briefings on DPDPA developments, consent requirements, sector
              risks, and enforcement signals — written for Indian business owners and operators.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {fetchFailed ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium mb-2 text-slate-700">Briefings are momentarily unavailable</p>
            <p className="text-sm">Please refresh in a few seconds — they’ll be right back.</p>
          </div>
        ) : all.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium mb-2">No briefings yet</p>
            <p className="text-sm">Daily briefings will appear here automatically at 9 AM IST.</p>
          </div>
        ) : (
          <BriefingsExplorer briefings={all} />
        )}

        {/* Subscribe CTA — inline form, no navigation needed */}
        <div className="mt-12 max-w-md mx-auto">
          <BriefingSubscribeCard />
        </div>
      </div>
    </div>
  );
}

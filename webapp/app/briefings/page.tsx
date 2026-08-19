import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { BriefingsExplorer, type ExplorerBriefing } from "@/components/briefings/BriefingsExplorer";
import { FORMAT_SLUGS } from "@/lib/data/briefing-taxonomy";
import { itemListSchema } from "@/lib/schema";
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
  // Infographic: stored in infographic_base64 as an Appwrite Storage https URL
  // (new) or raw base64 (legacy). Same unpacking as the detail page.
  const rawImg: string = doc.infographic_base64 || "";
  const image = !rawImg ? "" : rawImg.startsWith("https://") ? rawImg : `data:image/jpeg;base64,${rawImg}`;
  // "Fix this today" one-liner = the first action checklist item (already stored).
  const checklist: string[] = tryParse(doc.action_checklist, []);
  const fixToday = (checklist.find(Boolean) || "").toString();
  return {
    id:       doc.$id,
    slug:     doc.slug,
    title:    doc.title,
    excerpt:  doc.excerpt || doc.summary?.slice(0, 200) || "",
    date:     doc.published_at || doc.created_at || doc.$createdAt,
    image,
    fixToday,
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
      {/* ItemList JSON-LD — helps crawlers/LLMs enumerate the archive (latest 50) */}
      {all.length > 0 && itemListSchema(
        all.slice(0, 50).map((b) => ({
          name: b.title,
          url: `https://saralprivacy.com/briefings/${b.slug}`,
        })),
        "DPDPA Daily Briefings",
      )}

      {/* Hero — dual CTA: convert + browse */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-700/40 border border-green-500/50 rounded-full px-3.5 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-green-300 text-xs font-semibold">Published daily</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
              DPDPA Daily Briefings
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Simple daily actions for Indian businesses handling personal data — what to
              understand, check, and fix this week. Two-minute reads, plain English.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/assessment"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
                <ShieldCheck size={16} /> Check my readiness
              </Link>
              <a href="#latest-briefings"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-lg border border-white/20 transition-colors">
                Browse latest briefings
              </a>
            </div>
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

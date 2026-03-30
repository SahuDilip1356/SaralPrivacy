import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { formatDateShort, getCategoryLabel, getIndustryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { unstable_cache } from "next/cache";

export const revalidate = 3600; // Re-fetch every 60 min — briefings are published once daily

// Cache Appwrite response in Next.js data cache (survives across requests within revalidate window)
const getCachedBriefings = unstable_cache(
  async () => {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
      Query.equal("status", ["sent", "approved"]),
      Query.orderDesc("$createdAt"),
      Query.limit(30), // max 30 — we publish 1/day, 30 is a month of briefings
    ]);
    return result.documents;
  },
  ["briefings-list"],
  { revalidate: 3600, tags: ["briefings"] }
);

export const metadata: Metadata = {
  title: "Daily DPDPA Compliance Briefings",
  description:
    "Daily DPDPA briefings covering regulatory updates, consent requirements, enforcement signals, and sector-specific compliance guidance for Indian businesses.",
  alternates: { canonical: "https://saralprivacy.com/briefings" },
};

const categories = [
  { id: "all",                label: "All" },
  { id: "regulatory-update", label: "Regulatory Updates" },
  { id: "consent-management",label: "Consent" },
  { id: "data-rights",       label: "Data Rights" },
  { id: "sector-specific",   label: "Sector Specific" },
  { id: "enforcement",       label: "Enforcement" },
  { id: "compliance-guidance",label: "Guidance" },
];

function tryParse(str: string | null | undefined, fallback: any) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

/** Normalise an Appwrite briefing document to the shape the cards expect */
function normaliseDoc(doc: any) {
  return {
    id:        doc.$id,
    slug:      doc.slug,
    title:     doc.title,
    excerpt:   doc.excerpt || doc.summary?.slice(0, 200) || "",
    date:      doc.published_at || doc.created_at || doc.$createdAt,
    category:  doc.category || "compliance-guidance",
    industries: tryParse(doc.industries, ["general"]),
    readTime:  doc.read_time || 5,
    featured:  doc.featured ?? false,
    fromDb:    true,
  };
}

export default async function BriefingsPage() {
  // Fetch from Next.js data cache — only hits Appwrite on cache miss
  let dbDocs: any[] = [];
  try {
    const docs = await getCachedBriefings();
    dbDocs = docs.map(normaliseDoc);
  } catch (err) {
    console.error("[briefings] Appwrite fetch failed:", err);
  }

  // Sort by date descending — only real Appwrite data
  const all = dbDocs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const featured = all.find((b) => b.featured);
  const rest     = all.filter((b) => !b.featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-brand-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-saffron-700/40 border border-saffron-500/50 rounded-full px-3.5 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-saffron-300 text-xs font-semibold">Published daily</span>
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

      {/* Category filters */}
      <div className="bg-white border-b border-slate-200 sticky top-[calc(4rem+32px)] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  cat.id === "all"
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Featured briefing */}
        {featured && (
          <div className="mb-10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Featured Briefing
            </h2>
            <Link href={`/briefings/${featured.slug}`}>
              <div className="bg-brand-700 rounded-xl p-7 hover:bg-brand-800 transition-colors group">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="teal">Featured</Badge>
                  <Badge variant="amber">{getCategoryLabel(featured.category)}</Badge>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-saffron-300 transition-colors leading-snug max-w-3xl">
                  {featured.title}
                </h3>
                <p className="text-slate-300 mb-4 max-w-2xl leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDateShort(featured.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {featured.readTime} min read
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-saffron-400 font-semibold text-sm group-hover:gap-2 transition-all">
                    Read briefing <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Briefings grid */}
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          All Briefings
          <span className="ml-2 text-slate-400 font-normal normal-case">({all.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((briefing) => (
            <Link key={briefing.id} href={`/briefings/${briefing.slug}`}>
              <Card hover padding="none" className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="gray" size="sm">
                      {getCategoryLabel(briefing.category)}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-brand-700 text-base leading-snug mb-2 group-hover:text-saffron-600 line-clamp-3">
                    {briefing.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
                    {briefing.excerpt}
                  </p>

                  {/* Industries */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(briefing.industries as string[]).slice(0, 2).map((ind: string) => (
                      <span
                        key={ind}
                        className="text-[10px] font-semibold text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded-full"
                      >
                        {getIndustryLabel(ind as any)}
                      </span>
                    ))}
                    {briefing.industries.length > 2 && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        +{briefing.industries.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDateShort(briefing.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {briefing.readTime} min
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {all.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium mb-2">No briefings yet</p>
            <p className="text-sm">Daily briefings will appear here automatically at 9 AM IST.</p>
          </div>
        )}

        {/* Subscribe CTA — inline form, no navigation needed */}
        <div className="mt-12 max-w-md mx-auto">
          <BriefingSubscribeCard />
        </div>
      </div>
    </div>
  );
}

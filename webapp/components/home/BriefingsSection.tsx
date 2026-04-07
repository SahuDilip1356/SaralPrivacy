import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { formatDateShort, getCategoryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

// Normalise Appwrite doc to the shape the cards expect
function normalise(doc: any) {
  return {
    id:       doc.$id,
    slug:     doc.slug,
    title:    doc.title,
    excerpt:  doc.excerpt || doc.summary?.slice(0, 200) || "",
    date:     doc.published_at || doc.created_at || doc.$createdAt,
    category: doc.category || "compliance-guidance",
    readTime: doc.read_time || 5,
    featured: doc.featured ?? false,
  };
}

export async function BriefingsSection() {
  // Fetch latest published briefings from Appwrite
  let briefings: ReturnType<typeof normalise>[] = [];
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
      Query.equal("status", ["sent", "approved"]),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
    ]);
    briefings = result.documents.map(normalise);
  } catch (err) {
    console.error("[BriefingsSection] Appwrite fetch failed:", err);
  }

  // Pick featured (explicit flag, else newest)
  const featured = briefings.find((b) => b.featured) ?? briefings[0] ?? null;
  const latest   = briefings.filter((b) => b !== featured).slice(0, 4);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-cloud-100 border border-cloud-200 rounded-full px-3.5 py-1.5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-navy-700" />
              <span className="text-navy-700 text-xs font-semibold">Daily Briefings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">
              Stay ahead of DPDPA developments
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              Clear, actionable briefings on DPDPA updates, enforcement signals, and compliance
              guidance — written for business owners, not lawyers.
            </p>
          </div>
          <Link
            href="/briefings"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 shrink-0"
          >
            All briefings
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Empty state */}
        {briefings.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">
            <p className="text-base font-medium mb-1">Briefings coming soon</p>
            <p className="text-sm">Daily DPDPA briefings will appear here automatically.</p>
          </div>
        )}

        {briefings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured briefing */}
            {featured && (
              <div className={latest.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
                <Link href={`/briefings/${featured.slug}`}>
                  <div className="bg-navy-700 rounded-xl p-7 h-full flex flex-col hover:bg-navy-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="teal">Latest</Badge>
                      <Badge variant="amber">{getCategoryLabel(featured.category)}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-snug mb-3 group-hover:text-teal-300 transition-colors">
                      {featured.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-5 flex-1">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDateShort(featured.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {featured.readTime} min read
                        </span>
                      </div>
                      <span className="text-green-400 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                        Read briefing
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Latest updates list */}
            {latest.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Latest Updates
                </h3>
                {latest.map((briefing) => (
                  <Link
                    key={briefing.id}
                    href={`/briefings/${briefing.slug}`}
                    className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-sm transition-all group"
                  >
                    <Badge variant="gray" size="sm">
                      {getCategoryLabel(briefing.category)}
                    </Badge>
                    <h4 className="text-sm font-semibold text-navy-700 mt-2 leading-snug group-hover:text-green-600 transition-colors line-clamp-2">
                      {briefing.title}
                    </h4>
                    <div className="flex items-center gap-3 text-slate-400 text-xs mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDateShort(briefing.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {briefing.readTime} min
                      </span>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/briefings"
                  className="block text-center py-3 text-sm font-semibold text-green-600 hover:text-green-700 border border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Browse all briefings →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { getLatestBriefings, getFeaturedBriefing } from "@/lib/data/briefings";
import { formatDateShort, getCategoryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function BriefingsSection() {
  const featured = getFeaturedBriefing();
  const latest = getLatestBriefings(6).filter((b) => !b.featured).slice(0, 4);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-navy-100 border border-navy-200 rounded-full px-3.5 py-1.5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-700" />
              <span className="text-brand-700 text-xs font-semibold">Daily Briefings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-700">
              Stay ahead of DPDPA developments
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              Clear, actionable briefings on DPDPA updates, enforcement signals, and compliance guidance — written for business owners, not lawyers.
            </p>
          </div>
          <Link
            href="/briefings"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-600 hover:text-saffron-700 shrink-0"
          >
            All briefings
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured briefing */}
          {featured && (
            <div className="lg:col-span-2">
              <Link href={`/briefings/${featured.slug}`}>
                <div className="bg-brand-700 rounded-xl p-7 h-full flex flex-col hover:bg-brand-800 transition-colors group">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="teal">Featured</Badge>
                    <Badge variant="amber">{getCategoryLabel(featured.category)}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-snug mb-3 group-hover:text-saffron-300 transition-colors">
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
                    <span className="text-saffron-400 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                      Read briefing
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Latest briefings list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Latest Updates
            </h3>
            {latest.map((briefing) => (
              <Link
                key={briefing.id}
                href={`/briefings/${briefing.slug}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-saffron-300 hover:shadow-sm transition-all group"
              >
                <Badge variant="gray" size="sm">
                  {getCategoryLabel(briefing.category)}
                </Badge>
                <h4 className="text-sm font-semibold text-brand-700 mt-2 leading-snug group-hover:text-saffron-600 transition-colors line-clamp-2">
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
              className="block text-center py-3 text-sm font-semibold text-saffron-600 hover:text-saffron-700 border border-dashed border-saffron-300 rounded-xl hover:bg-saffron-50 transition-colors"
            >
              Browse all briefings →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

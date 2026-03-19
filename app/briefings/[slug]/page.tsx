import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, CheckCircle, ArrowRight, Share2, AlertTriangle } from "lucide-react";
import { getBriefingBySlug, briefings } from "@/lib/data/briefings";
import { formatDate, getCategoryLabel, getIndustryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const briefing = getBriefingBySlug(slug);
  if (!briefing) return {};
  return {
    title: briefing.title,
    description: briefing.excerpt,
  };
}

export async function generateStaticParams() {
  return briefings.map((b) => ({ slug: b.slug }));
}

export default async function BriefingDetailPage({ params }: Props) {
  const { slug } = await params;
  const briefing = getBriefingBySlug(slug);
  if (!briefing) notFound();

  const related = briefings.filter((b) => briefing.relatedIds.includes(b.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <Link
              href="/briefings"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-saffron-600 mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Daily Briefings
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="navy">{getCategoryLabel(briefing.category)}</Badge>
                {briefing.featured && <Badge variant="teal">Featured</Badge>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-brand-700 leading-snug mb-4">
                {briefing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-5 border-b border-slate-100 mb-5">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(briefing.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {briefing.readTime} min read
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-medium text-slate-600">{briefing.author.name}</span>
              </div>

              {/* Industries */}
              <div className="flex flex-wrap gap-1.5">
                {briefing.industries.map((ind) => (
                  <span
                    key={ind}
                    className="text-xs font-semibold text-saffron-600 bg-saffron-50 px-2.5 py-1 rounded-full border border-saffron-200"
                  >
                    {getIndustryLabel(ind)}
                  </span>
                ))}
              </div>
            </div>

            {/* Why it matters */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-5">
              <h2 className="flex items-center gap-2 font-bold text-amber-900 text-base mb-3">
                <AlertTriangle size={18} className="text-amber-600" />
                Why this matters for your business
              </h2>
              <p className="text-amber-800 text-sm leading-relaxed">{briefing.whyItMatters}</p>
            </div>

            {/* Main content sections */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-brand-700 mb-3">Plain-English Summary</h2>
                <p className="text-slate-600 leading-relaxed">{briefing.summary}</p>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h2 className="text-xl font-bold text-brand-700 mb-3">Business Impact</h2>
                <p className="text-slate-600 leading-relaxed">{briefing.businessImpact}</p>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h2 className="text-xl font-bold text-brand-700 mb-3">Who Is Affected</h2>
                <ul className="space-y-2">
                  {briefing.whoIsAffected.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action checklist */}
            <div className="bg-brand-700 rounded-xl p-7 mb-5">
              <h2 className="text-xl font-bold text-white mb-4">
                Action Checklist
              </h2>
              <div className="space-y-3">
                {briefing.actionChecklist.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-saffron-400 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-saffron-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-6">
              <strong>Disclaimer:</strong> This briefing is for educational purposes only and does
              not constitute formal legal advice. Consult a qualified data protection lawyer for
              formal legal opinions specific to your business.
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Link
                href="/assessment"
                className="flex flex-col p-5 bg-saffron-500 text-white rounded-xl hover:bg-saffron-500 transition-colors"
              >
                <span className="text-saffron-200 text-xs font-semibold mb-1">Next step</span>
                <span className="font-bold text-base">Check your readiness</span>
                <span className="text-saffron-200 text-sm mt-1">
                  Take the free 10-minute assessment →
                </span>
              </Link>
              <Link
                href="/white-paper"
                className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl hover:border-saffron-300 hover:shadow-sm transition-all"
              >
                <span className="text-slate-500 text-xs font-semibold mb-1">Free resource</span>
                <span className="font-bold text-base text-brand-700">Download white paper</span>
                <span className="text-slate-500 text-sm mt-1">
                  Complete DPDPA guide — 45 pages →
                </span>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Related briefings */}
            {related.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-brand-700 text-sm mb-4">Related Briefings</h3>
                <div className="space-y-3">
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/briefings/${rel.slug}`}
                      className="block hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors group"
                    >
                      <div className="text-xs text-saffron-600 font-semibold mb-1">
                        {getCategoryLabel(rel.category)}
                      </div>
                      <div className="text-sm font-medium text-brand-700 leading-snug group-hover:text-saffron-600 transition-colors">
                        {rel.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{formatDate(rel.date)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Industry tags */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-brand-700 text-sm mb-3">Industries Affected</h3>
              <div className="flex flex-wrap gap-2">
                {briefing.industries.map((ind) => (
                  <Link
                    key={ind}
                    href={`/industries/${ind === "recruitment" ? "recruitment-agencies" : ind === "ca-firms" ? "ca-firms" : ind === "training-institutes" ? "training-institutes" : "d2c-brands"}`}
                    className="text-xs font-semibold text-saffron-600 bg-saffron-50 px-2.5 py-1.5 rounded-full border border-saffron-200 hover:bg-saffron-100 transition-colors"
                  >
                    {getIndustryLabel(ind)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Assessment CTA */}
            <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-5">
              <h3 className="font-bold text-brand-700 text-sm mb-2">
                Is your business DPDPA-ready?
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Take our free 10-minute industry assessment to find out your compliance risk level.
              </p>
              <Link
                href="/assessment"
                className="block text-center py-2.5 px-4 bg-saffron-500 text-white text-sm font-semibold rounded-lg hover:bg-saffron-600 transition-colors"
              >
                Take Free Assessment →
              </Link>
            </div>

            {/* Newsletter */}
            <div className="bg-brand-700 rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-2">
                Get daily briefings by email
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                DPDPA updates delivered daily or weekly. Unsubscribe any time.
              </p>
              <Link
                href="/subscribe"
                className="block text-center py-2.5 px-4 bg-saffron-500 text-white text-sm font-semibold rounded-lg hover:bg-saffron-500 transition-colors"
              >
                Subscribe Free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

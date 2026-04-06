import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Clock, Calendar, ArrowLeft, Shield,
  ThumbsUp, ThumbsDown, Share2, ExternalLink, BookOpen,
} from "lucide-react";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

export const revalidate = 3600;

// ── Types ─────────────────────────────────────────────────────────────────────

interface PrimarySource {
  claim: string;
  sourceType: string;
  citation: string;
  riskLevel: string;
}

interface BlogPost {
  $id: string;
  title: string;
  slug: string;
  excerpt: string;
  lane: string;
  author: string;
  read_time: number;
  validation_score: number;
  validated_at: string;
  published_at: string;
  $createdAt: string;
  featured: boolean;
  status: string;
  section_what_changed: string;
  section_law_says: string;
  sections_json: string;
  tags: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const LANE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "law-explained":       { label: "Law Explained",       color: "text-blue-700",   bg: "bg-blue-100"   },
  "compliance-playbook": { label: "Compliance Playbook", color: "text-purple-700", bg: "bg-purple-100" },
  "myth-fact":           { label: "Myth vs Fact",        color: "text-orange-700", bg: "bg-orange-100" },
  "sector-notes":        { label: "Sector Notes",        color: "text-teal-700",   bg: "bg-teal-100"   },
  "governance-watch":    { label: "Governance Watch",    color: "text-red-700",    bg: "bg-red-100"    },
};

function tryParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOG_POSTS, [
      Query.equal("slug", slug),
      Query.equal("status", "published"),
      Query.limit(1),
    ]);
    return (result.documents[0] as unknown as BlogPost) || null;
  } catch {
    return null;
  }
}

async function getRelatedPosts(lane: string, excludeSlug: string): Promise<BlogPost[]> {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOG_POSTS, [
      Query.equal("status", "published"),
      Query.equal("lane", lane),
      Query.notEqual("slug", excludeSlug),
      Query.limit(3),
    ]);
    return result.documents as unknown as BlogPost[];
  } catch {
    return [];
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://saralprivacy.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://saralprivacy.com/blog/${slug}`,
      type: "article",
    },
  };
}

// ── Components ────────────────────────────────────────────────────────────────

function SectionBlock({
  heading,
  content,
  scopeLabel,
}: {
  heading: string;
  content: string;
  scopeLabel?: string;
}) {
  if (!content) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-bold text-navy-700">{heading}</h2>
        {scopeLabel && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {scopeLabel}
          </span>
        )}
      </div>
      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const color =
    level === "High"   ? "bg-red-100 text-red-700" :
    level === "Medium" ? "bg-amber-100 text-amber-700" :
                         "bg-green-100 text-green-700";
  return <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${color}`}>{level}</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const sectionsJson = tryParse<Record<string, string>>(post.sections_json, {});
  const section_do_now    = sectionsJson.section_do_now    || "";
  const section_uncertain = sectionsJson.section_uncertain || "";
  const section_mistakes  = sectionsJson.section_mistakes  || "";
  const primarySources    = tryParse<PrimarySource[]>(sectionsJson.primary_sources, []);

  const relatedPosts = await getRelatedPosts(post.lane, slug);
  const laneCfg = LANE_CONFIG[post.lane] || { label: post.lane, color: "text-slate-600", bg: "bg-slate-100" };
  const pubDate  = post.published_at || post.$createdAt;
  const siteUrl  = "https://saralprivacy.com";
  const postUrl  = `${siteUrl}/blog/${slug}`;
  const waText   = encodeURIComponent(`${post.title}\n${postUrl}`);
  const liText   = encodeURIComponent(post.title);

  const scoreColor =
    post.validation_score >= 90 ? "text-green-700 bg-green-50 border-green-200" :
    post.validation_score >= 85 ? "text-amber-700 bg-amber-50 border-amber-200" :
                                  "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-slate-50">
      {articleSchema(
        post.title,
        post.excerpt,
        postUrl,
        pubDate,
        post.validated_at || pubDate,
      )}
      {breadcrumbSchema([
        { name: 'Home',     url: siteUrl },
        { name: 'Insights', url: `${siteUrl}/blog` },
        { name: post.title, url: postUrl },
      ])}
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-navy-700">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-navy-700">Insights</Link>
            <span>/</span>
            <span className="text-slate-700 line-clamp-1">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main article — 2/3 */}
          <article className="lg:col-span-2">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 mb-6"
            >
              <ArrowLeft size={14} /> All Insights
            </Link>

            {/* Lane + verification banner */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${laneCfg.bg} ${laneCfg.color}`}>
                {laneCfg.label}
              </span>
              {post.validation_score >= 85 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 leading-snug mb-4">
              {post.title}
            </h1>

            {/* Metadata row */}
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-5 flex-wrap">
              {post.author && <span>{post.author}</span>}
              {pubDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(pubDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={11} /> {post.read_time || 5} min read
              </span>
            </div>

            {/* Verification badge */}
            {post.validated_at && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                <Shield size={18} className="text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Validated against official sources as of{" "}
                    {new Date(post.validated_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    This article has been checked against the DPDPA Act, notified Rules, and
                    official government releases.{" "}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold text-xs ml-1 ${scoreColor}`}>
                      Editorial Score: {post.validation_score}/100
                      {post.validation_score >= 85 && <CheckCircle size={10} />}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Excerpt / intro */}
            {post.excerpt && (
              <p className="text-base text-slate-600 leading-relaxed border-l-4 border-green-400 pl-4 mb-8 font-medium">
                {post.excerpt}
              </p>
            )}

            {/* Content sections */}
            <SectionBlock heading="What Changed" content={post.section_what_changed} />
            <SectionBlock heading="What the Law Actually Says" content={post.section_law_says} />
            <SectionBlock heading="What Businesses Should Do Now" content={section_do_now} />
            <SectionBlock heading="What Is Still Uncertain" content={section_uncertain} />
            <SectionBlock heading="Top Mistakes to Avoid" content={section_mistakes} />

            {/* Primary sources table */}
            {primarySources.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-navy-700 mb-3">Primary Sources</h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Claim</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Source Type</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Citation</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {primarySources.map((src, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 text-xs text-slate-700">{src.claim}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{src.sourceType}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{src.citation}</td>
                          <td className="px-4 py-2.5"><RiskBadge level={src.riskLevel} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Was this helpful */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
              <p className="text-sm font-semibold text-navy-700 mb-3">Was this helpful?</p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors">
                  <ThumbsUp size={14} /> Yes
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                  <ThumbsDown size={14} /> No
                </button>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Share2 size={14} /> Share:
              </span>
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                WhatsApp
                <ExternalLink size={11} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&title=${liText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors"
              >
                LinkedIn
                <ExternalLink size={11} />
              </a>
            </div>

            {/* Bottom CTA */}
            <div className="space-y-4">
              <BriefingSubscribeCard />
              <div className="bg-navy-700 rounded-xl p-5 text-center">
                <p className="text-white font-bold text-sm mb-1">Need expert guidance?</p>
                <p className="text-slate-400 text-xs mb-3">
                  Our team helps Indian businesses navigate DPDPA compliance end-to-end.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Talk to Our Experts →
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar — 1/3 */}
          <aside className="space-y-5">
            {/* Assessment CTA */}
            <div className="bg-navy-700 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-green-400" />
                <h3 className="font-bold text-white text-sm">Check Your Readiness</h3>
              </div>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                Take our free 7-question DPDPA readiness assessment. Get a risk score and
                personalised action plan in 3 minutes.
              </p>
              <Link
                href="/assessment"
                className="block w-full text-center py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Start Free Assessment →
              </Link>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={14} className="text-navy-600" />
                  <h3 className="font-bold text-navy-700 text-sm">Related Insights</h3>
                </div>
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.$id}
                      href={`/blog/${related.slug}`}
                      className="group block"
                    >
                      <p className="text-sm font-medium text-navy-700 group-hover:text-navy-800 leading-snug mb-1 line-clamp-2">
                        {related.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{related.read_time || 5} min</span>
                        {related.validation_score >= 85 && (
                          <span className="flex items-center gap-0.5 text-green-600">
                            <CheckCircle size={9} /> Verified
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Validation score detail */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-3">Editorial Standards</h3>
              <div className={`text-center py-3 rounded-lg mb-3 ${scoreColor} border`}>
                <div className="text-3xl font-bold">{post.validation_score}</div>
                <div className="text-xs mt-0.5">Editorial Score / 100</div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scored on legal accuracy, primary-source support, currency, scope precision,
                and operational usefulness. Articles below 85 are not published.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

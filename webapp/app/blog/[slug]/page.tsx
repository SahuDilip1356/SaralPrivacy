import React from "react";
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
  infographic_url?: string;
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

// SaralPrivacy brand gold — matches the logo's gold ring
const BRAND_GOLD = "#C9A227";

function isBlank(text: string | null | undefined): boolean {
  if (!text) return true;
  const t = text.trim().toLowerCase();
  return t === "" || t === "blank" || t === "(empty)";
}

// Parses inline Markdown: **bold** → <strong>, *italic* → <em>
// Returns an array of React nodes safe to render inside any element.
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Renders plain-text content with smart formatting detection:
// - Lines starting with ## → styled sub-heading
// - Lines starting with - / • / * → golden ✓ bullet list items
// - All other lines → paragraphs
// Inline **bold** and *italic* are parsed throughout.
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key} className="space-y-2 my-3">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
            <span
              className="shrink-0 mt-0.5 text-base font-bold leading-none"
              style={{ color: BRAND_GOLD }}
            >
              ✓
            </span>
            <span>{parseInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`list-${idx}`);
      return;
    }

    // ## Sub-heading inside content (AI often writes these)
    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      flushList(`list-${idx}`);
      elements.push(
        <h3 key={`h-${idx}`} className="text-base font-bold text-navy-700 mt-5 mb-2">
          {headingMatch[1]}
        </h3>
      );
      return;
    }

    // Bullet line: -, •, or a leading * not part of bold (**word**)
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)/) ||
      (trimmed.startsWith("* ") ? trimmed.match(/^\*\s+(.+)/) : null);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
    } else {
      flushList(`list-${idx}`);
      elements.push(
        <p key={`p-${idx}`} className="text-sm text-slate-700 leading-relaxed mb-2">
          {parseInline(trimmed)}
        </p>
      );
    }
  });
  flushList("list-end");
  return elements;
}

function SectionBlock({
  heading,
  content,
  scopeLabel,
}: {
  heading: string;
  content: string;
  scopeLabel?: string;
}) {
  if (isBlank(content)) return null;
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
      <div className="prose prose-slate max-w-none">
        {renderContent(content)}
      </div>
    </div>
  );
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
              {post.validation_score >= 75 && (
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

            {/* Infographic — shown immediately after byline when available */}
            {post.infographic_url && (
              <div className="mb-7 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={post.infographic_url}
                  alt={`${post.title} — DPDPA infographic by SaralPrivacy`}
                  className="w-full"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="bg-slate-50 px-4 py-2 text-xs text-slate-400 text-right border-t border-slate-200">
                  © SaralPrivacy™ — Verified DPDPA Insights
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

            {/* Sources — numbered citation list */}
            {primarySources.length > 0 && (
              <div className="mb-8 pt-6 border-t border-slate-200">
                <h2 className="text-base font-bold text-navy-700 mb-4">Sources</h2>
                <ol className="space-y-3">
                  {primarySources.map((src, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="shrink-0 w-5 text-right font-semibold text-slate-400 mt-0.5">
                        {i + 1}.
                      </span>
                      <span>
                        {src.citation}
                        <span className="ml-2 text-xs text-slate-400 font-medium">
                          [{src.sourceType}]
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
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
                        {related.validation_score >= 75 && (
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

          </aside>
        </div>
      </div>
    </div>
  );
}

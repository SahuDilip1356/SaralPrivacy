import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Clock, Calendar, ArrowLeft, Shield,
  Share2, ExternalLink, BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import BlogImage from "@/components/BlogImage";

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

// Brand v3.0 — only Navy / Green / Teal / Gold / Slate / Cloud permitted.
const LANE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "law-explained":       { label: "Law explained",       color: "text-navy-700",  bg: "bg-cloud-100" },
  "compliance-playbook": { label: "Compliance playbook", color: "text-green-700", bg: "bg-green-50"  },
  "myth-fact":           { label: "Myth vs fact",        color: "text-gold-700",  bg: "bg-gold-50"   },
  "sector-notes":        { label: "Sector notes",        color: "text-teal-700",  bg: "bg-teal-50"   },
  "governance-watch":    { label: "Governance watch",    color: "text-navy-700",  bg: "bg-navy-100"  },
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

function seoTitle(title: string, max = 46): string {
  if (title.length <= max) return title;
  const truncated = title.slice(0, max - 1).trimEnd();
  return truncated.endsWith("—") || truncated.endsWith("-")
    ? truncated.slice(0, -1).trimEnd()
    : truncated + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // notFound() HERE, not just in the page body: with streaming + loading.tsx the
  // body's notFound() lands after the 200 header is already flushed, so crawlers
  // saw a soft 404. Throwing during metadata resolution emits a real 404 status.
  if (!post) notFound();
  const title = seoTitle(post.title);
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: `https://saralprivacy.com/blog/${slug}` },
    openGraph: {
      title,
      description: post.excerpt,
      url: `https://saralprivacy.com/blog/${slug}`,
      type: "article",
    },
  };
}

// ── Components ────────────────────────────────────────────────────────────────

function isBlank(text: string | null | undefined): boolean {
  if (!text) return true;
  const t = text.trim().toLowerCase();
  return t === "" || t === "blank" || t === "(empty)";
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Brand v3.0 hierarchy: H2 32px, H3 24px, Body 16px. Source-MD H1s are
        // demoted to H2 to keep one true H1 (the article title) per page.
        h1: ({ children }) => (
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-700 mt-8 mb-3 leading-tight">{children}</h2>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-700 mt-8 mb-3 leading-tight">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl sm:text-2xl font-semibold text-navy-700 mt-6 mb-2 leading-snug">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-base text-slate-700 leading-relaxed mb-4">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="space-y-2 my-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-2 my-4 list-decimal list-inside text-base text-slate-700 leading-relaxed">{children}</ol>
        ),
        li: ({ children, ...props }) => {
          const isOrdered = (props as { ordered?: boolean }).ordered;
          if (isOrdered) {
            return <li className="text-base text-slate-700 leading-relaxed">{children}</li>;
          }
          return (
            <li className="flex items-start gap-2.5 text-base text-slate-700 leading-relaxed">
              <span
                className="shrink-0 mt-1 text-base font-bold leading-none"
                style={{ color: "#07B981" }}
              >
                ✓
              </span>
              <span>{children}</span>
            </li>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-green-500 pl-5 my-6 italic text-navy-700 text-lg leading-snug font-medium bg-cloud-50 py-3 pr-4 rounded-r-md">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-100">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 font-semibold text-slate-800 border border-slate-200">
            {children}
          </th>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="odd:bg-white even:bg-slate-50">{children}</tr>,
        td: ({ children }) => (
          <td className="px-3 py-2 text-slate-700 border border-slate-200 align-top">
            {children}
          </td>
        ),
        code: ({ children }) => (
          <code className="bg-slate-100 text-slate-800 text-xs px-1.5 py-0.5 rounded font-mono">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-navy-600 underline hover:text-navy-800" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
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
        <MarkdownContent content={content} />
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

            {/* Title — brand H1 scale (Inter Display, sentence case enforced upstream) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-700 leading-tight tracking-tight mb-4">
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
                <BlogImage
                  src={post.infographic_url}
                  alt={`${post.title} — DPDPA infographic by SaralPrivacy`}
                  className="w-full"
                  loading="eager"
                  fetchPriority="high"
                  fallbackClassName="hidden"
                />
                <div className="bg-slate-50 px-4 py-2 text-xs text-slate-400 text-right border-t border-slate-200">
                  © SaralPrivacy — Verified DPDPA insights
                </div>
              </div>
            )}

            {/* Excerpt / intro */}
            {post.excerpt && (
              <p className="text-base text-slate-600 leading-relaxed border-l-4 border-green-500 pl-4 mb-8 font-medium">
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
                  Our team helps Indian businesses turn DPDPA readiness into a visible trust signal.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Get Consultation →
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar — 1/3 */}
          <aside className="space-y-5">
            {/* Assessment CTA — primary action on this page */}
            <div className="bg-navy-700 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-green-500" />
                <h3 className="font-bold text-white text-sm">Check your readiness</h3>
              </div>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                Take our free 7-question DPDPA readiness assessment. Get a risk score and
                personalised action plan in 3 minutes.
              </p>
              <Link
                href="/assessment"
                className="block w-full text-center py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Take Free Assessment →
              </Link>
            </div>

            {/* Press proof */}
            <PressProofStrip variant="sidebar" />

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={14} className="text-navy-600" />
                  <h3 className="font-bold text-navy-700 text-sm">Related insights</h3>
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

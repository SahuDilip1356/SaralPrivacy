import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Clock, BookOpen } from "lucide-react";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { BriefingSubscribeCard } from "@/components/briefings/BriefingSubscribeCard";

// Lane filtering via searchParams makes this dynamic — ISR intentionally disabled
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified DPDPA Insights",
  description:
    "Long-form explainers, playbooks, and legal-operational analysis on India's data protection regime. Every article is checked against the Act, notified Rules, and official government releases before publication.",
  alternates: { canonical: "https://saralprivacy.com/blog" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlogPost {
  $id: string;
  title: string;
  slug: string;
  excerpt: string;
  lane: string;
  author: string;
  read_time: number;
  validation_score: number;
  published_at: string;
  $createdAt: string;
  featured: boolean;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const LANE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "law-explained":       { label: "Law Explained",       color: "text-blue-700",   bg: "bg-blue-100"   },
  "compliance-playbook": { label: "Compliance Playbook", color: "text-purple-700", bg: "bg-purple-100" },
  "myth-fact":           { label: "Myth vs Fact",        color: "text-orange-700", bg: "bg-orange-100" },
  "sector-notes":        { label: "Sector Notes",        color: "text-teal-700",   bg: "bg-teal-100"   },
  "governance-watch":    { label: "Governance Watch",    color: "text-red-700",    bg: "bg-red-100"    },
};

async function getPublishedPosts(lane?: string): Promise<BlogPost[]> {
  try {
    const filters = [
      Query.equal("status", "published"),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ];
    if (lane && lane !== "all") {
      filters.push(Query.equal("lane", lane));
    }
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOG_POSTS, filters);
    return result.documents as unknown as BlogPost[];
  } catch (err) {
    console.error("[blog/page] fetch error", err);
    return [];
  }
}

const LANE_FILTERS = [
  { id: "all",                  label: "All"                  },
  { id: "law-explained",        label: "Law Explained"        },
  { id: "compliance-playbook",  label: "Compliance Playbooks" },
  { id: "myth-fact",            label: "Myth vs Fact"         },
  { id: "sector-notes",         label: "Sector Notes"         },
  { id: "governance-watch",     label: "Governance Watch"     },
];

// ── Components ────────────────────────────────────────────────────────────────

function LaneBadge({ lane }: { lane: string }) {
  const cfg = LANE_CONFIG[lane] || { label: lane, color: "text-slate-600", bg: "bg-slate-100" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// Editorial list row — replaces card grid
function PostRow({ post, featured }: { post: BlogPost; featured?: boolean }) {
  const date = post.published_at || post.$createdAt;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-start gap-5 py-5 border-b border-slate-200 last:border-0 hover:bg-white transition-colors px-4 -mx-4 rounded-xl"
    >
      {/* Date column */}
      <div className="hidden sm:flex flex-col items-center shrink-0 w-14 pt-0.5">
        {date && (
          <>
            <span className="text-lg font-bold text-navy-700 leading-none">
              {new Date(date).toLocaleDateString("en-IN", { day: "numeric" })}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wide">
              {new Date(date).toLocaleDateString("en-IN", { month: "short" })}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(date).toLocaleDateString("en-IN", { year: "numeric" })}
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px self-stretch bg-slate-200 shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <LaneBadge lane={post.lane} />
          {featured && (
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              Featured
            </span>
          )}
        </div>
        <h2 className="font-bold text-navy-700 text-base leading-snug mb-1.5 group-hover:text-navy-900 transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-2">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          {post.author && <span>{post.author}</span>}
          <span className="flex items-center gap-1">
            <Clock size={11} /> {post.read_time || 5} min read
          </span>
          {/* Mobile date */}
          {date && (
            <span className="sm:hidden">
              {new Date(date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Verified badge + arrow */}
      <div className="shrink-0 flex flex-col items-end gap-2 pt-0.5">
        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
          <CheckCircle size={10} /> Verified
        </span>
        <span className="text-slate-300 group-hover:text-navy-600 transition-colors text-base">→</span>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ lane?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { lane } = await searchParams;
  const posts = await getPublishedPosts(lane);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <CheckCircle size={11} /> Verified Insights
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-snug">
            Verified DPDPA Insights
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            Long-form explainers, playbooks, and legal-operational analysis on India&rsquo;s data
            protection regime. Every article is checked against the Act, notified Rules, and
            official government releases before publication.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} /> {posts.length} verified articles
            </span>
          </div>
        </div>
      </div>

      {/* SSR answer block — crawlable anchor for snippet and AI extraction */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-7 pb-2">
        <div className="bg-slate-50 border-l-4 border-green-400 rounded-r-xl px-5 py-4">
          <p className="text-slate-700 text-sm leading-relaxed">
            SaralPrivacy Insights publishes verified, long-form articles on India&apos;s DPDPA
            regime — covering the law itself, compliance playbooks, sector-specific obligations,
            governance developments, and common myths. Every article is checked against the
            Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 before publication.
            Use the filters below to find content relevant to your role or sector.
          </p>
        </div>
      </div>

      {/* Lane filter tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-[calc(4rem+32px)] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {LANE_FILTERS.map((filter) => {
              const isActive =
                filter.id === "all" ? !lane || lane === "all" : lane === filter.id;
              return (
                <a
                  key={filter.id}
                  href={filter.id === "all" ? "/blog" : `/blog?lane=${filter.id}`}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-navy-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-navy-700 hover:text-white"
                  }`}
                >
                  {filter.label}
                </a>
              );
            })}
          </div>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">
              First verified insights coming soon.
            </h2>
            <p className="text-slate-400 text-sm mb-8">Subscribe to be notified.</p>
            <div className="max-w-sm mx-auto">
              <BriefingSubscribeCard />
            </div>
          </div>
        ) : (
          <>
            {/* Single unified list — featured shown inline, no slice cap */}
            <div className="bg-slate-50 rounded-2xl px-4 mb-12">
              {posts.map((post) => (
                <PostRow key={post.$id} post={post} featured={post.featured} />
              ))}
            </div>

            {/* Subscribe CTA */}
            <div className="max-w-md mx-auto">
              <BriefingSubscribeCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, RefreshCw, CheckCircle, Clock, Send, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogPost {
  $id: string;
  $createdAt: string;
  title: string;
  slug: string;
  lane: string;
  status: string;
  validation_score: number;
  validated_at: string;
  author: string;
  read_time: number;
  featured: boolean;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "bg-slate-100 text-slate-600"  },
  review:    { label: "In Review", color: "bg-amber-100 text-amber-700"  },
  published: { label: "Published", color: "bg-green-100 text-green-700"  },
};

const LANE_MAP: Record<string, { label: string; color: string }> = {
  "law-explained":      { label: "Law Explained",       color: "bg-blue-100 text-blue-700"    },
  "compliance-playbook":{ label: "Compliance Playbook", color: "bg-purple-100 text-purple-700" },
  "myth-fact":          { label: "Myth vs Fact",        color: "bg-orange-100 text-orange-700" },
  "sector-notes":       { label: "Sector Notes",        color: "bg-teal-100 text-teal-700"    },
  "governance-watch":   { label: "Governance Watch",    color: "bg-red-100 text-red-700"      },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90
    ? "text-green-700 bg-green-50 border-green-200"
    : score >= 85
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${color}`}>
      {score >= 85 && <CheckCircle size={10} />}
      {score}/100
    </span>
  );
}

export default function AdminBlogPage() {
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/data?collection=blog_posts&limit=100&orderDesc=$createdAt")
      .then((r) => r.json())
      .then((d) => setPosts(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const counts = {
    total:     posts.length,
    draft:     posts.filter((p) => p.status === "draft").length,
    review:    posts.filter((p) => p.status === "review").length,
    published: posts.filter((p) => p.status === "published").length,
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
            <FileText size={18} className="text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-700">Blog Posts</h1>
            <p className="text-slate-500 text-sm">
              Verified DPDPA Insights · {posts.length} posts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus size={14} /> Write New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total",     value: counts.total,     icon: FileText,    color: "text-brand-700" },
          { label: "Draft",     value: counts.draft,     icon: Clock,       color: "text-slate-600" },
          { label: "In Review", value: counts.review,    icon: Send,        color: "text-amber-600" },
          { label: "Published", value: counts.published, icon: CheckCircle, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className={`flex items-center gap-1 text-xs text-slate-500 mt-1`}>
              <Icon size={11} /> {label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-base font-semibold mb-1">No blog posts yet</p>
            <p className="text-sm text-slate-400 mb-6">
              Start writing your first verified DPDPA insight.
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={16} /> Write New Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Title", "Lane", "Status", "Score", "Validated", "Author", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => {
                  const statusInfo = STATUS_MAP[post.status] || { label: post.status, color: "bg-slate-100 text-slate-600" };
                  const laneInfo   = LANE_MAP[post.lane]     || { label: post.lane,   color: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={post.$id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-brand-700 line-clamp-2 leading-snug">
                          {post.featured && (
                            <span className="inline-block mr-1 text-saffron-500 text-xs">★</span>
                          )}
                          {post.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">{post.slug}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${laneInfo.color}`}>
                          {laneInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ScoreBadge score={post.validation_score || 0} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {post.validated_at ? new Date(post.validated_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {post.author || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/blog/${post.$id}/edit`}
                            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium"
                          >
                            <Edit size={11} /> Edit
                          </Link>
                          {post.status === "published" && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener"
                              className="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                              View →
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

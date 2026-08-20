"use client";

import { useState } from "react";
import { UserPlus, CheckCircle, XCircle, Trash2, Copy, RefreshCw, Mail } from "lucide-react";

interface Blogger {
  $id:           string;
  email:         string;
  name:          string;
  bio:           string;
  password_hash: string;
  active:        boolean;
  invite_token:  string;
  token_expires: string;
  created_at:    string;
}

interface Props {
  // Appwrite returns Models.Document[] — cast to Blogger[] on receipt
  initialBloggers: Record<string, unknown>[];
}

export default function BloggersClient({ initialBloggers }: Props) {
  const [bloggers,      setBloggers]      = useState<Blogger[]>(initialBloggers as unknown as Blogger[]);
  const [showInvite,    setShowInvite]    = useState(false);
  const [inviting,      setInviting]      = useState(false);
  const [inviteResult,  setInviteResult]  = useState<{ url: string; emailSent: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", bio: "" });
  const [formError,     setFormError]     = useState("");
  const [copied,        setCopied]        = useState(false);

  // ── Invite ────────────────────────────────────────────────────────────────
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setInviting(true);
    try {
      const res  = await fetch("/api/admin/bloggers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to send invite.");
      } else {
        setInviteResult({ url: data.inviteUrl, emailSent: data.emailSent });
        setForm({ email: "", name: "", bio: "" });
        // Refresh list
        const list = await fetch("/api/admin/bloggers").then(r => r.json());
        if (list.bloggers) setBloggers(list.bloggers);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setInviting(false);
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function toggleActive(id: string, currentActive: boolean) {
    setActionLoading(id + "-toggle");
    try {
      const res = await fetch(`/api/admin/bloggers/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        setBloggers(prev =>
          prev.map(b => b.$id === id ? { ...b, active: !currentActive } : b)
        );
      }
    } finally {
      setActionLoading(null);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setActionLoading(id + "-delete");
    try {
      const res = await fetch(`/api/admin/bloggers/${id}`, { method: "DELETE" });
      if (res.ok) setBloggers(prev => prev.filter(b => b.$id !== id));
    } finally {
      setActionLoading(null);
    }
  }

  // ── Copy invite URL ───────────────────────────────────────────────────────
  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Resend invite ─────────────────────────────────────────────────────────
  async function resendInvite(blogger: Blogger) {
    setActionLoading(blogger.$id + "-resend");
    try {
      // Delete + re-create via invite endpoint (generates fresh token + email)
      await fetch(`/api/admin/bloggers/${blogger.$id}`, { method: "DELETE" });
      const res = await fetch("/api/admin/bloggers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: blogger.email, name: blogger.name, bio: blogger.bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteResult({ url: data.inviteUrl, emailSent: data.emailSent });
        const list = await fetch("/api/admin/bloggers").then(r => r.json());
        if (list.bloggers) setBloggers(list.bloggers);
      }
    } finally {
      setActionLoading(null);
    }
  }

  function statusBadge(blogger: Blogger) {
    if (blogger.active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle size={11} /> Active
        </span>
      );
    }
    if (blogger.invite_token) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <Mail size={11} /> Invited
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        <XCircle size={11} /> Revoked
      </span>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Blog Contributors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage invite-only blogger accounts. Bloggers can write and submit posts; you approve &amp; publish.
          </p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setInviteResult(null); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-700 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          <UserPlus size={15} /> Invite Blogger
        </button>
      </div>

      {/* Invite result banner */}
      {inviteResult && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800 mb-1">
                {inviteResult.emailSent ? "✅ Invite sent by email!" : "⚠️ Email failed — share this link manually:"}
              </p>
              <p className="text-xs text-green-700 break-all font-mono bg-white border border-green-200 rounded px-2 py-1.5">
                {inviteResult.url}
              </p>
            </div>
            <button
              onClick={() => copyUrl(inviteResult.url)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-300 text-xs font-medium text-green-800 bg-white hover:bg-green-50 transition-colors"
            >
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Invite a Blogger</h2>
            <p className="text-xs text-slate-500 mb-5">
              They&apos;ll receive an email with a link to set their password and activate their account.
            </p>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bio / Expertise (optional)</label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="e.g. Data privacy lawyer, 8 years experience"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 py-2 rounded-lg bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
                >
                  {inviting ? "Sending invite…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blogger table */}
      {bloggers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <UserPlus size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bloggers yet. Click &quot;Invite Blogger&quot; to add your first contributor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bloggers.map(blogger => (
                <tr key={blogger.$id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{blogger.name}</div>
                    {blogger.bio && <div className="text-xs text-slate-400 truncate max-w-[180px]">{blogger.bio}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{blogger.email}</td>
                  <td className="px-5 py-3.5">{statusBadge(blogger)}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(blogger.created_at || blogger.$id).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Resend invite — only if still pending */}
                      {!blogger.active && blogger.invite_token && (
                        <button
                          onClick={() => resendInvite(blogger)}
                          disabled={actionLoading === blogger.$id + "-resend"}
                          title="Resend invite"
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      {/* Revoke / Restore */}
                      {blogger.active ? (
                        <button
                          onClick={() => toggleActive(blogger.$id, blogger.active)}
                          disabled={actionLoading === blogger.$id + "-toggle"}
                          title="Revoke access"
                          className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
                        >
                          <XCircle size={14} />
                        </button>
                      ) : (
                        blogger.password_hash !== "" && (
                          <button
                            onClick={() => toggleActive(blogger.$id, blogger.active)}
                            disabled={actionLoading === blogger.$id + "-toggle"}
                            title="Restore access"
                            className="p-1.5 rounded-lg text-green-800 hover:bg-green-50 transition-colors disabled:opacity-40"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )
                      )}
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(blogger.$id, blogger.name)}
                        disabled={actionLoading === blogger.$id + "-delete"}
                        title="Delete permanently"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

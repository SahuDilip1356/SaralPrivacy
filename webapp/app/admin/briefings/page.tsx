"use client";
import { useEffect, useState } from "react";
import { FileText, CheckCircle, Send, Clock, AlertCircle, Zap, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "Draft",    color: "bg-amber-100 text-amber-700"  },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700"    },
  sent:     { label: "Sent",     color: "bg-green-100 text-green-700"  },
};

export default function AdminBriefingsPage() {
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionMsg, setActionMsg]   = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/data?collection=briefings&limit=100")
      .then((r) => r.json())
      .then((d) => setBriefings(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    const secret = prompt("Enter BRIEFING_CRON_SECRET to generate a briefing now:");
    if (!secret) return;
    setGenerating(true);
    setActionMsg("");
    try {
      const res = await fetch("/api/briefings/generate", {
        method: "GET",
        headers: { "Authorization": `Bearer ${secret}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✅ Briefing generated: "${data.slug}". Approval email sent.`);
        load();
      } else {
        setActionMsg(`❌ ${data.error || "Generation failed"}`);
      }
    } catch (err) {
      setActionMsg("❌ Network error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend(briefingId: string) {
    if (!confirm("Send this briefing to all subscribers now?")) return;
    setActionMsg("");
    try {
      const res = await fetch("/api/briefings/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✅ Sent to ${data.sent} subscribers.`);
        load();
      } else {
        setActionMsg(`❌ ${data.error || "Send failed"}`);
      }
    } catch {
      setActionMsg("❌ Network error");
    }
  }

  const draft    = briefings.filter((b) => b.status === "draft").length;
  const approved = briefings.filter((b) => b.status === "approved").length;
  const sent     = briefings.filter((b) => b.status === "sent").length;

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
            <FileText size={18} className="text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-brand-700">Daily Briefings</h1>
            <p className="text-slate-500 text-sm">{briefings.length} total briefings · Auto-generated at 9 AM IST</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-50"
          >
            <Zap size={14} />
            {generating ? "Generating…" : "Generate Now"}
          </button>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium ${actionMsg.startsWith("✅") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {actionMsg}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total",    value: briefings.length, icon: FileText,    color: "text-brand-700" },
          { label: "Draft",    value: draft,            icon: Clock,       color: "text-amber-600" },
          { label: "Approved", value: approved,         icon: CheckCircle, color: "text-blue-600"  },
          { label: "Sent",     value: sent,             icon: Send,        color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Icon size={11} />
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Cron info */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <Zap size={16} className="text-brand-700 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-brand-700 mb-1">Automated Daily Generation</h4>
            <p className="text-xs text-brand-600 leading-relaxed">
              Vercel Cron triggers <code className="bg-brand-100 px-1 rounded">GET /api/briefings/generate</code> at{" "}
              <strong>9:00 AM IST</strong> (3:30 UTC) every day. Claude generates the briefing, saves it to Appwrite,
              and emails an approval link to the admin. Once approved, it is sent to all subscribers and
              published live on the website immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading…</div>
        ) : briefings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No briefings yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Generate Now" or wait for the 9 AM IST cron.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Title", "Category", "Status", "Subscribers", "Scheduled / Sent", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {briefings.map((b) => {
                  const statusInfo = STATUS_MAP[b.status] || { label: b.status, color: "bg-slate-100 text-slate-600" };
                  const date = b.sent_at || b.scheduled_for || b.created_at;
                  return (
                    <tr key={b.$id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-brand-700 line-clamp-2 leading-snug">{b.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">{b.slug}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-slate-500 capitalize">{b.category?.replace(/-/g, " ") || "—"}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {b.subscriber_count ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {date ? new Date(date).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/briefings/${b.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                          >
                            View →
                          </a>
                          {b.status === "approved" && (
                            <button
                              onClick={() => handleSend(b.$id)}
                              className="flex items-center gap-1 text-xs text-white bg-green-600 px-2.5 py-1 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <Send size={11} /> Send
                            </button>
                          )}
                          {b.status === "draft" && (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle size={11} /> Awaiting approval
                            </span>
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

"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Search, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function ScoreBadge({ band }: { band: string }) {
  const map: Record<string, string> = {
    "High Risk":     "bg-red-100 text-red-700",
    "Moderate Risk": "bg-amber-100 text-amber-700",
    "Low Risk":      "bg-green-100 text-green-700",
  };
  const cls = map[band] || "bg-slate-100 text-slate-500";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {band || "—"}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SurveyResponsesPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/data?collection=survey_responses&limit=500")
      .then((r) => r.json())
      .then((d) => setResponses(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = responses.filter((r) => {
    const matchSearch =
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.work_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.sector?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "high"     && r.score_band === "High Risk") ||
      (filter === "moderate" && r.score_band === "Moderate Risk") ||
      (filter === "low"      && r.score_band === "Low Risk") ||
      (filter === "report"   && r.wants_report === true);
    return matchSearch && matchFilter;
  });

  const high     = responses.filter((r) => r.score_band === "High Risk").length;
  const moderate = responses.filter((r) => r.score_band === "Moderate Risk").length;
  const low      = responses.filter((r) => r.score_band === "Low Risk").length;
  const wantReport = responses.filter((r) => r.wants_report === true).length;
  const avgScore   = responses.length
    ? Math.round(responses.reduce((s, r) => s + (r.score || 0), 0) / responses.length)
    : 0;

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
          <ClipboardList size={18} className="text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-brand-700">Survey Responses</h1>
          <p className="text-slate-500 text-sm">{responses.length} total responses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-5">
        {[
          { label: "Total",        value: responses.length, icon: ClipboardList, color: "text-brand-700" },
          { label: "High Risk",    value: high,             icon: AlertTriangle, color: "text-red-600"   },
          { label: "Moderate",     value: moderate,         icon: TrendingUp,    color: "text-amber-600" },
          { label: "Low Risk",     value: low,              icon: CheckCircle,   color: "text-green-800" },
          { label: "Want Report",  value: wantReport,       icon: ClipboardList, color: "text-brand-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-pearl-200 shadow-sm p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Icon size={11} /> {label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, business, email, sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-pearl-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-pearl-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white"
        >
          <option value="all">All responses</option>
          <option value="high">High Risk only</option>
          <option value="moderate">Moderate Risk only</option>
          <option value="low">Low Risk only</option>
          <option value="report">Wants report</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardList size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No survey responses yet</p>
            <p className="text-xs text-slate-400 mt-1">Responses appear here after users complete the assessment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name / Business", "Contact", "Sector", "Role", "Score", "Risk Band", "Wants Report", "Submitted"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-700 text-sm">{r.name || "—"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.business_name || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600">{r.work_email || "—"}</div>
                      <div className="text-xs text-slate-400">{r.mobile_number || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600">{r.sector || "—"}</div>
                      <div className="text-xs text-slate-400">{r.employee_size || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {r.role || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(r.score || 0) >= 70 ? "bg-red-400" : (r.score || 0) >= 40 ? "bg-amber-400" : "bg-green-400"}`}
                            style={{ width: `${Math.min(100, r.score || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{r.score ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ScoreBadge band={r.score_band} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.wants_report
                        ? <span className="text-green-800 text-xs font-medium">✓ Yes</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {r.$createdAt ? timeAgo(r.$createdAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Average score footer */}
      {responses.length > 0 && (
        <div className="mt-4 text-xs text-slate-500 text-right">
          Average score across {responses.length} responses: <strong className="text-brand-700">{avgScore}</strong>
        </div>
      )}
    </div>
  );
}

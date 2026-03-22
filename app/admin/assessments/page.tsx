"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Search } from "lucide-react";

export const dynamic = "force-dynamic";

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red:   "bg-red-100 text-red-700",
  };
  const cls = map[level?.toLowerCase()] || "bg-slate-100 text-slate-500";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {level || "—"}
    </span>
  );
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 70 ? "bg-red-400" : pct >= 40 ? "bg-amber-400" : "bg-green-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-600">{value ?? "—"}</span>
    </div>
  );
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=assessments&limit=200")
      .then((r) => r.json())
      .then((d) => setAssessments(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = assessments.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.email?.toLowerCase().includes(q) || a.industry?.toLowerCase().includes(q);
  });

  // Risk distribution
  const total = filtered.length || 1;
  const greenCount = filtered.filter((a) => a.risk_level === "green").length;
  const amberCount = filtered.filter((a) => a.risk_level === "amber").length;
  const redCount   = filtered.filter((a) => a.risk_level === "red").length;

  const riskDist = [
    { label: "Green (Low Risk)",      count: greenCount, pct: Math.round((greenCount / total) * 100), color: "bg-green-400" },
    { label: "Amber (Moderate Risk)", count: amberCount, pct: Math.round((amberCount / total) * 100), color: "bg-amber-400" },
    { label: "Red (High Risk)",       count: redCount,   pct: Math.round((redCount   / total) * 100), color: "bg-red-400"   },
  ];

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
          <CheckCircle size={18} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Assessments</h1>
          <p className="text-slate-500 text-sm">{assessments.length} total DPDPA assessments completed</p>
        </div>
      </div>

      {/* Risk distribution */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-brand-700 mb-4">Risk Distribution</h3>
        <div className="space-y-3">
          {riskDist.map(({ label, count, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                <span>{label}</span>
                <span className="font-bold">{count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm mb-5 p-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No assessments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Email", "Industry", "Risk Level", "Applicability", "Maturity", "Risk", "Urgency", "Overall", "Location", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{a.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{a.industry}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><RiskBadge level={a.risk_level} /></td>
                    <td className="px-4 py-3"><ScoreBar value={a.applicability_score} /></td>
                    <td className="px-4 py-3"><ScoreBar value={a.maturity_score} /></td>
                    <td className="px-4 py-3"><ScoreBar value={a.risk_score} /></td>
                    <td className="px-4 py-3"><ScoreBar value={a.urgency_score} /></td>
                    <td className="px-4 py-3"><ScoreBar value={a.overall_score} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {a.city || a.country ? `${a.city || ""}${a.city && a.country ? ", " : ""}${a.country || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(a.$createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

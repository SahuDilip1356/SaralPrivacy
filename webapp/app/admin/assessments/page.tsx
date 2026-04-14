"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Search, ShieldAlert, Send } from "lucide-react";

export const dynamic = "force-dynamic";

// ── Verdict band → color ────────────────────────────────────────────────────
const BAND_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Not Started":          { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  "Early Stage":          { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  "Building Foundations": { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Progressing Well":     { bg: "bg-lime-100",   text: "text-lime-700",   dot: "bg-lime-500"   },
  "Operationally Strong": { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
};

function VerdictBadge({ band }: { band: string }) {
  const c = BAND_COLORS[band] || { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {band || "—"}
    </span>
  );
}

function MiniScore({ score, band }: { score: number; band: string }) {
  const c = BAND_COLORS[band] || { dot: "bg-slate-300" };
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${c.dot}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 w-6 text-right">{score ?? "—"}</span>
    </div>
  );
}

function SubBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const color = pct >= 65 ? "bg-green-400" : pct >= 45 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-500">{pct}%</span>
    </div>
  );
}

function RedFlagBadge({ json }: { json: string }) {
  let count = 0;
  try { count = JSON.parse(json || "[]").length; } catch { /* noop */ }
  if (count === 0) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold ${count >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
      <ShieldAlert size={10} />
      {count}
    </span>
  );
}

function ReportTypeBadge({ type }: { type: string }) {
  if (!type || type === "quick") return <span className="text-xs text-slate-400">Quick</span>;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-navy-50 text-navy-700 whitespace-nowrap">Full Report</span>
  );
}

// ── Verdict distribution helper ─────────────────────────────────────────────
const BANDS_ORDERED = [
  "Not Started",
  "Early Stage",
  "Building Foundations",
  "Progressing Well",
  "Operationally Strong",
];

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // Track per-row send state: "idle" | "sending" | "sent" | "error"
  const [sendState, setSendState] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});

  const sendReport = async (assessmentId: string) => {
    setSendState(prev => ({ ...prev, [assessmentId]: "sending" }));
    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const data = await res.json();
      setSendState(prev => ({ ...prev, [assessmentId]: data.success ? "sent" : "error" }));
    } catch {
      setSendState(prev => ({ ...prev, [assessmentId]: "error" }));
    }
  };

  useEffect(() => {
    fetch("/api/admin/data?collection=assessments&limit=200")
      .then((r) => r.json())
      .then((d) => setAssessments(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = assessments.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.email?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.industry?.toLowerCase().includes(q) ||
      a.verdict_band?.toLowerCase().includes(q)
    );
  });

  const total = filtered.length || 1;

  // Score distribution buckets (new final_score field)
  const newAssessments  = filtered.filter((a) => a.final_score > 0);
  const avgScore = newAssessments.length
    ? Math.round(newAssessments.reduce((s, a) => s + (a.final_score || 0), 0) / newAssessments.length)
    : 0;

  const bandDist = BANDS_ORDERED.map((band) => {
    const count = filtered.filter((a) => a.verdict_band === band).length;
    return { band, count, pct: Math.round((count / total) * 100) };
  });

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
          <CheckCircle size={18} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Assessments</h1>
          <p className="text-slate-500 text-sm">
            {assessments.length} total · {newAssessments.length} scored · Avg score: <span className="font-semibold text-slate-700">{avgScore || "—"}/100</span>
          </p>
        </div>
      </div>

      {/* Band distribution */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-brand-700 mb-4">Readiness Band Distribution</h3>
        <div className="space-y-3">
          {bandDist.map(({ band, count, pct }) => {
            const c = BAND_COLORS[band] || { dot: "bg-slate-300" };
            return (
              <div key={band}>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {band}
                  </span>
                  <span className="font-bold">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.dot} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm mb-5 p-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email, name, industry, or band..."
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
                  {[
                    "Email / Name",
                    "Sector",
                    "Score",
                    "Band",
                    "Exposure",
                    "Controls",
                    "Ops Ready",
                    "Red Flags",
                    "Type",
                    "Location",
                    "Date",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.$id} className="hover:bg-slate-50 transition-colors">
                    {/* Email / Name */}
                    <td className="px-4 py-3">
                      <span className="block text-slate-700 truncate max-w-[180px]">{a.email}</span>
                      {a.name && (
                        <span className="block text-xs text-slate-400 truncate max-w-[180px]">{a.name}</span>
                      )}
                    </td>

                    {/* Sector */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {a.industry || "—"}
                    </td>

                    {/* Final Score */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.final_score > 0
                        ? <MiniScore score={a.final_score} band={a.verdict_band} />
                        : a.overall_score
                          ? <span className="text-xs text-slate-400">{a.overall_score} (legacy)</span>
                          : <span className="text-xs text-slate-300">—</span>
                      }
                    </td>

                    {/* Verdict Band */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.verdict_band
                        ? <VerdictBadge band={a.verdict_band} />
                        : <span className="text-xs text-slate-300">—</span>
                      }
                    </td>

                    {/* Data Exposure */}
                    <td className="px-4 py-3">
                      {a.data_exposure > 0
                        ? <SubBar value={a.data_exposure} />
                        : <span className="text-xs text-slate-300">—</span>
                      }
                    </td>

                    {/* Control Maturity */}
                    <td className="px-4 py-3">
                      {a.control_maturity > 0
                        ? <SubBar value={a.control_maturity} />
                        : <span className="text-xs text-slate-300">—</span>
                      }
                    </td>

                    {/* Operational Readiness */}
                    <td className="px-4 py-3">
                      {a.operational_readiness > 0
                        ? <SubBar value={a.operational_readiness} />
                        : <span className="text-xs text-slate-300">—</span>
                      }
                    </td>

                    {/* Red Flags */}
                    <td className="px-4 py-3">
                      <RedFlagBadge json={a.red_flags_json} />
                    </td>

                    {/* Report Type */}
                    <td className="px-4 py-3">
                      <ReportTypeBadge type={a.report_type} />
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {a.city || a.country
                        ? `${decodeURIComponent(a.city || "")}${a.city && a.country ? ", " : ""}${a.country || ""}`
                        : "—"}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                      {new Date(a.$createdAt).toLocaleDateString("en-IN")}
                    </td>

                    {/* Send Report */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.email && a.final_score > 0 ? (() => {
                        const state = sendState[a.$id] ?? "idle";
                        if (state === "sent") return <span className="text-xs text-green-600 font-semibold">Sent ✓</span>;
                        if (state === "error") return <span className="text-xs text-red-500">Failed</span>;
                        return (
                          <button
                            onClick={() => sendReport(a.$id)}
                            disabled={state === "sending"}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-navy-50 text-navy-700 border border-navy-200 hover:bg-navy-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send size={11} />
                            {state === "sending" ? "Sending…" : "Send Report"}
                          </button>
                        );
                      })() : <span className="text-xs text-slate-300">—</span>}
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

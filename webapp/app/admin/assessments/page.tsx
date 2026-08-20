"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Search, ShieldAlert, Send, Eye, X, AlertTriangle } from "lucide-react";
import {
  getPackByReportType,
  summarizeAnswers,
  getBandByScore,
  INDUSTRY_PACKS,
  type IAAnswers,
} from "@/lib/data/industry-assessment";

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
  const label = kindLabel(type);
  const isGeneral = label === "General";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${isGeneral ? "bg-slate-100 text-slate-500" : "bg-navy-50 text-navy-700"}`}>
      {label}
    </span>
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

// ── Industry (risk) band system — for the kind-aware distribution chart ───────
const INDUSTRY_BAND_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Controlled":     { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  "Moderate Risk":  { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  "High Risk":      { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  "Critical Risk":  { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
};
const INDUSTRY_BANDS_ORDERED = ["Controlled", "Moderate Risk", "High Risk", "Critical Risk"];

const KIND_LABELS: Record<string, string> = {
  "ca-firms": "CA Firms",
  "training-institutes": "Training Institutes",
};
function kindOf(reportType: string | undefined): string {
  const pack = getPackByReportType(reportType);
  return pack ? pack.industry : "general";
}
function kindLabel(reportType: string | undefined): string {
  const pack = getPackByReportType(reportType);
  if (!pack) return "General";
  return KIND_LABELS[pack.industry] ?? pack.industry;
}

// ── Scorecard block for preview panel ──────────────────────────────────────
const SCORECARD_BLOCKS = [
  { label: "Notice & Consent",                key: "noticeConsent",      ref: "§6–7" },
  { label: "Data Inventory & Storage",        key: "dataInventory",      ref: "§8–9" },
  { label: "Data Principal Rights & Control", key: "accessControl",      ref: "§11–12" },
  { label: "Ownership & Governance",          key: "ownershipGovernance",ref: "§13" },
  { label: "Incident & Operational Readiness",key: "incidentReadiness",  ref: "§10" },
];

function computeScores(raw: Record<string, number>) {
  return {
    noticeConsent:      raw.noticeConsent      ?? 0,
    dataInventory:      Math.round(((raw.retentionDeletion ?? 0) + (raw.vendorPartnerRisk ?? 0)) / 2),
    accessControl:      raw.accessControl      ?? 0,
    ownershipGovernance:raw.ownershipGovernance ?? 0,
    incidentReadiness:  raw.incidentReadiness  ?? 0,
  };
}

function ScorecardBar({ label, score, dpdpaRef }: { label: string; score: number; dpdpaRef: string }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 65 ? "bg-green-500" : pct >= 45 ? "bg-amber-400" : "bg-red-400";
  const status = pct >= 65 ? "On Track" : pct >= 45 ? "Needs Work" : "At Risk";
  const statusColor = pct >= 65 ? "text-green-800 bg-green-50" : pct >= 45 ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50";
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusColor}`}>{status}</span>
          <span className="text-xs text-slate-400">{dpdpaRef}</span>
          <span className="text-xs font-bold text-slate-700 w-7 text-right">{score}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Preview Panel ───────────────────────────────────────────────────────────
function PreviewPanel({
  assessment,
  sendState,
  sendError,
  onSend,
  onClose,
}: {
  assessment: any;
  sendState: "idle" | "sending" | "sent" | "error";
  sendError: string;
  onSend: () => void;
  onClose: () => void;
}) {
  let categoryScores: Record<string, number> = {};
  let redFlags: string[] = [];
  let immediateActions: string[] = [];
  let thirtyDayActions: string[] = [];
  let answers: Record<string, unknown> = {};

  try { categoryScores = JSON.parse(assessment.category_scores_json || "{}"); } catch { /* noop */ }
  try { redFlags = JSON.parse(assessment.red_flags_json || "[]"); } catch { /* noop */ }
  try { immediateActions = JSON.parse(assessment.immediate_actions_json || "[]"); } catch { /* noop */ }
  try { thirtyDayActions = JSON.parse(assessment.thirty_day_actions_json || "[]"); } catch { /* noop */ }
  try { answers = JSON.parse(assessment.answers_json || "{}"); } catch { /* noop */ }

  const scores = computeScores(categoryScores);
  const hasCategoryData = Object.keys(categoryScores).length > 0;
  const pack = getPackByReportType(assessment.report_type);
  const responses = pack ? summarizeAnswers(pack, answers as IAAnswers) : [];

  const reportUrl = assessment.report_token
    ? `https://saralprivacy.com/report/${assessment.report_token}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Panel header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Report Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{assessment.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 space-y-5">
          {/* Identity + Score */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{assessment.name || "—"}</p>
                {assessment.business_name && (
                  <p className="text-xs text-slate-500 mt-0.5">{assessment.business_name}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{assessment.industry || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{assessment.final_score ?? "—"}<span className="text-sm font-normal text-slate-400">/100</span></p>
                {assessment.verdict_band && <VerdictBadge band={assessment.verdict_band} />}
              </div>
            </div>
          </div>

          {/* Red flags */}
          {redFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-xs font-semibold text-red-700">{redFlags.length} Red Flag{redFlags.length > 1 ? "s" : ""} Detected</p>
              </div>
              <ul className="space-y-1">
                {redFlags.map((f, i) => (
                  <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Category scores — pack-aware (industry buckets vs general scorecard) */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{pack ? "Risk by Area" : "Category Scores"}</h3>
            {pack ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                {pack.buckets.map((b) => {
                  const s = categoryScores[b.key] ?? 0;
                  const bl = getBandByScore(s).label;
                  const c = INDUSTRY_BAND_COLORS[bl] || { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-300" };
                  return (
                    <div key={b.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{b.label}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>{bl.replace(" Risk", "")} · {s}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${c.dot} rounded-full`} style={{ width: `${s}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : hasCategoryData ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                {SCORECARD_BLOCKS.map(({ label, key, ref }) => (
                  <ScorecardBar
                    key={key}
                    label={label}
                    score={(scores as any)[key] ?? 0}
                    dpdpaRef={ref}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Category scores not available for this assessment.</p>
            )}
          </div>

          {/* Responses — what the user selected (industry packs) */}
          {responses.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Responses</h3>
              <div className="space-y-2">
                {responses.map((r, i) => (
                  <div key={i} className="border border-slate-100 rounded-lg p-2.5">
                    <p className="text-[11px] text-slate-500 mb-0.5">{r.question}</p>
                    <p className="text-xs font-semibold text-slate-700">{r.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {immediateActions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Wins (0–30 days)</h3>
              <ul className="space-y-1.5">
                {immediateActions.slice(0, 3).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">{i + 1}</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 30-day plan preview */}
          {thirtyDayActions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">30-Day Plan (preview)</h3>
              <ul className="space-y-1.5">
                {thirtyDayActions.slice(0, 2).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="shrink-0 mt-0.5 text-slate-300">→</span>{a}
                  </li>
                ))}
                {thirtyDayActions.length > 2 && (
                  <li className="text-xs text-slate-400 italic">+{thirtyDayActions.length - 2} more in full report</li>
                )}
              </ul>
            </div>
          )}

          {/* Report URL */}
          {reportUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-1">Report URL (valid 90 days)</p>
              <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline break-all">{reportUrl}</a>
            </div>
          )}

          {/* Email sent status */}
          {assessment.email_sent_at && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-700 font-semibold">
                Report already sent on {new Date(assessment.email_sent_at).toLocaleDateString("en-IN")} by {assessment.email_sent_by || "admin"}
              </p>
            </div>
          )}
        </div>

        {/* Send action footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-4">
          {sendState === "sent" ? (
            <div className="flex items-center gap-2 text-green-800 text-sm font-semibold">
              <CheckCircle size={16} /> Report sent successfully
            </div>
          ) : sendState === "error" ? (
            <div className="space-y-2">
              <p className="text-xs text-red-500 font-medium">Send failed: {sendError || "Unknown error"}</p>
              <button
                onClick={onSend}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
              >
                <Send size={14} /> Retry Resend
              </button>
            </div>
          ) : (
            <button
              onClick={onSend}
              disabled={sendState === "sending" || !assessment.email || !assessment.verdict_band}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              <Send size={14} />
              {sendState === "sending" ? "Resending report…" : "Resend Report"}
            </button>
          )}
          <p className="text-[10px] text-slate-400 text-center mt-2">
            This will send the personalised DPDPA report to {assessment.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendState, setSendState] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [sendError, setSendError] = useState<Record<string, string>>({});
  const [previewAssessment, setPreviewAssessment] = useState<any | null>(null);
  const [kind, setKind] = useState<string>("all");

  const sendReport = async (assessmentId: string) => {
    setSendState(prev => ({ ...prev, [assessmentId]: "sending" }));
    setSendError(prev => ({ ...prev, [assessmentId]: "" }));
    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const data = await res.json();
      if (data.success) {
        setSendState(prev => ({ ...prev, [assessmentId]: "sent" }));
        // Refresh email_sent_at in local state
        setAssessments(prev => prev.map(a =>
          a.$id === assessmentId
            ? { ...a, email_sent_at: new Date().toISOString(), email_sent_by: "admin" }
            : a
        ));
        if (previewAssessment?.$id === assessmentId) {
          setPreviewAssessment((prev: any) => ({
            ...prev,
            email_sent_at: new Date().toISOString(),
            email_sent_by: "admin",
          }));
        }
      } else {
        setSendState(prev => ({ ...prev, [assessmentId]: "error" }));
        setSendError(prev => ({ ...prev, [assessmentId]: data.error || "Unknown error" }));
      }
    } catch (err) {
      setSendState(prev => ({ ...prev, [assessmentId]: "error" }));
      setSendError(prev => ({ ...prev, [assessmentId]: err instanceof Error ? err.message : "Network error" }));
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
    const matchesSearch =
      !q ||
      a.email?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.industry?.toLowerCase().includes(q) ||
      a.verdict_band?.toLowerCase().includes(q);
    const matchesKind = kind === "all" || kindOf(a.report_type) === kind;
    return matchesSearch && matchesKind;
  });

  const newAssessments = filtered.filter((a) => a.final_score > 0);
  const avgScore = newAssessments.length
    ? Math.round(newAssessments.reduce((s, a) => s + (a.final_score || 0), 0) / newAssessments.length)
    : 0;

  // Kind filter options: All · General · one per industry pack.
  const kindOptions = [
    { value: "all", label: "All" },
    { value: "general", label: "General" },
    ...Object.values(INDUSTRY_PACKS).map((p) => ({ value: p.industry, label: KIND_LABELS[p.industry] ?? p.industry })),
  ];

  // Band distribution adapts to the selected kind's band system.
  const isIndustryKind = kind !== "all" && kind !== "general";
  const chartBandList = isIndustryKind ? INDUSTRY_BANDS_ORDERED : BANDS_ORDERED;
  const chartColors = isIndustryKind ? INDUSTRY_BAND_COLORS : BAND_COLORS;
  // When viewing "All", chart the general rows (industry rows have their own band system — pick a kind to see them).
  const chartRows = isIndustryKind ? filtered : filtered.filter((a) => kindOf(a.report_type) === "general");
  const chartTotal = chartRows.length || 1;
  const bandDist = chartBandList.map((band) => {
    const count = chartRows.filter((a) => a.verdict_band === band).length;
    return { band, count, pct: Math.round((count / chartTotal) * 100) };
  });

  return (
    <div className="px-6 py-6">
      {/* Preview Panel */}
      {previewAssessment && (
        <PreviewPanel
          assessment={previewAssessment}
          sendState={sendState[previewAssessment.$id] ?? "idle"}
          sendError={sendError[previewAssessment.$id] ?? ""}
          onSend={() => sendReport(previewAssessment.$id)}
          onClose={() => setPreviewAssessment(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
          <CheckCircle size={18} className="text-green-800" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-brand-700">Assessments</h1>
          <p className="text-slate-500 text-sm">
            {assessments.length} total · {newAssessments.length} scored · Avg score: <span className="font-semibold text-slate-700">{avgScore || "—"}/100</span>
          </p>
        </div>
      </div>

      {/* Band distribution */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-brand-700 mb-1">Readiness Band Distribution</h3>
        <p className="text-xs text-slate-400 mb-4">
          {isIndustryKind ? `${KIND_LABELS[kind] ?? kind} — risk bands` : "General — maturity bands"}
          {kind === "all" ? " · industry rows: pick a kind above to view their risk bands" : ""}
        </p>
        <div className="space-y-3">
          {bandDist.map(({ band, count, pct }) => {
            const c = chartColors[band] || { dot: "bg-slate-300" };
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

      {/* Search + Kind filter */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm mb-5 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {kindOptions.map((opt) => {
            const active = kind === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setKind(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${active ? "text-white" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                style={active ? { backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" } : undefined}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
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
                    "Email Sent",
                    "Actions",
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

                    {/* Email Sent */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.email_sent_at ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-800 font-medium">
                          <CheckCircle size={11} />
                          {new Date(a.email_sent_at).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">Not sent</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.verdict_band && a.email ? (
                        <div className="flex items-center gap-1.5">
                          {/* Preview button */}
                          <button
                            onClick={() => setPreviewAssessment(a)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                          >
                            <Eye size={11} /> Preview
                          </button>

                          {/* Quick send (outside panel) */}
                          {(() => {
                            const state = sendState[a.$id] ?? "idle";
                            if (state === "sent" || a.email_sent_at) return <span className="text-xs text-green-800 font-semibold">Sent ✓</span>;
                            if (state === "error") return (
                              <span className="text-xs text-red-500" title={sendError[a.$id] || "Unknown error"}>
                                Failed
                              </span>
                            );
                            return (
                              <button
                                onClick={() => sendReport(a.$id)}
                                disabled={state === "sending" || !a.email}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-navy-50 text-navy-700 border border-navy-200 hover:bg-navy-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Send size={11} />
                                {state === "sending" ? "…" : "Resend"}
                              </button>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
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

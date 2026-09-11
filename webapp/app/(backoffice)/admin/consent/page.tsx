"use client";
import { useEffect, useState } from "react";
import { Shield, Search, Download as DownloadIcon, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const CONSENT_TYPES = ["all", "email_marketing", "phone_contact", "webinars", "data_processing"];
const SOURCES       = ["all", "download", "subscribe", "contact", "assessment"];

function ConsentTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    email_marketing: "bg-blue-100 text-blue-700",
    phone_contact:   "bg-purple-100 text-purple-700",
    webinars:        "bg-amber-100 text-amber-700",
    data_processing: "bg-brand-50 text-brand-700",
  };
  const cls = map[type] || "bg-slate-100 text-slate-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {type?.replace("_", " ")}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, string> = {
    download:   "bg-green-100 text-green-800",
    subscribe:  "bg-saffron-50 text-saffron-600",
    contact:    "bg-blue-100 text-blue-700",
    assessment: "bg-purple-100 text-purple-700",
  };
  const cls = map[source] || "bg-slate-100 text-slate-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {source}
    </span>
  );
}

export default function ConsentLogPage() {
  const [records, setRecords]   = useState<any[]>([]);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=consent_log&limit=500")
      .then((r) => r.json())
      .then((d) => setRecords(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.email?.toLowerCase().includes(q) || r.name?.toLowerCase().includes(q);
    const matchType   = typeFilter   === "all" || r.consent_type === typeFilter;
    const matchSource = sourceFilter === "all" || r.source === sourceFilter;
    return matchSearch && matchType && matchSource;
  });

  const active    = filtered.filter((r) => r.consent_value && !r.withdrawn_at).length;
  const withdrawn = filtered.filter((r) => r.withdrawn_at).length;
  const total     = filtered.length;

  // Consent rate by type
  const byType = CONSENT_TYPES.slice(1).map((type) => {
    const typeRecords = filtered.filter((r) => r.consent_type === type);
    const activeCount = typeRecords.filter((r) => r.consent_value && !r.withdrawn_at).length;
    return { type, total: typeRecords.length, active: activeCount };
  });

  function handleExportCSV() {
    const headers = ["Email", "Name", "Consent Type", "Value", "Source", "Privacy Version", "IP Address", "City", "Country", "Timestamp"];
    const rows = filtered.map((r) => [
      r.email, r.name || "", r.consent_type, r.consent_value ? "true" : "false",
      r.source, r.privacy_version, r.ip_address || "", r.city || "", r.country || "", r.timestamp,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consent-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-brand-700">DPDPA Consent Registry</h1>
            <p className="text-slate-500 text-sm">Compliance-grade consent audit trail under India&apos;s DPDPA 2023</p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors"
        >
          <DownloadIcon size={14} /> CSV Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
          <div className="text-3xl font-bold text-brand-700">{total}</div>
          <div className="text-xs text-slate-500 mt-1">Total Consent Records</div>
        </div>
        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
          <div className="text-3xl font-bold text-green-800">{active}</div>
          <div className="text-xs text-slate-500 mt-1">Active Consents</div>
        </div>
        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5">
          <div className="text-3xl font-bold text-amber-600">{withdrawn}</div>
          <div className="text-xs text-slate-500 mt-1">Withdrawn Consents</div>
        </div>
      </div>

      {/* Consent rate by type */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-brand-700 mb-4">Consent Health by Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {byType.map(({ type, total: t, active: a }) => (
            <div key={type} className="bg-slate-50 rounded-lg p-3">
              <ConsentTypeBadge type={type} />
              <div className="mt-2 text-lg font-bold text-brand-700">{a}<span className="text-sm font-normal text-slate-400">/{t}</span></div>
              <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${t ? Math.round((a / t) * 100) : 0}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{t ? Math.round((a / t) * 100) : 0}% active</div>
            </div>
          ))}
        </div>
      </div>

      {/* DPDPA Compliance Note */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-brand-700 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-brand-700 mb-1">DPDPA 2023 Compliance Status</h4>
            <p className="text-xs text-brand-600 leading-relaxed">
              Under Section 6 of India&apos;s Digital Personal Data Protection Act 2023, all consent must be free, specific, informed, unconditional, and unambiguous.
              This registry captures consent timestamps, privacy version, IP address, and user agent as proof of valid consent.
              Withdrawal records (withdrawn_at) enable compliance with the right to withdraw consent under Section 6(4).
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {CONSENT_TYPES.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Types" : t.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Sources" : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Shield size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No consent records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name", "Email", "Consent Type", "Value", "Source", "Privacy Version", "Location", "IP Address", "Timestamp"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-700 whitespace-nowrap">{r.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><ConsentTypeBadge type={r.consent_type} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.consent_value ? (
                        <span className="flex items-center gap-1 text-green-700"><CheckCircle size={14} /> Yes</span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400"><XCircle size={14} /> No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><SourceBadge source={r.source} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.privacy_version || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {r.city || r.country ? `${decodeURIComponent(r.city || "")}${r.city && r.country ? ", " : ""}${r.country || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">{r.ip_address || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString("en-IN") : "—"}
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

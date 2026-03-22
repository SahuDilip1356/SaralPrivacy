"use client";
import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";

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

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=leads&limit=200")
      .then((r) => r.json())
      .then((d) => setLeads(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.industry?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
            <Users size={18} className="text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-700">Leads</h1>
            <p className="text-slate-500 text-sm">{leads.length} total consultation requests</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm mb-5 p-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
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
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No leads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name", "Email", "Phone", "Company", "Industry", "Issue Summary", "Preferred Contact", "Status", "Location", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lead) => (
                  <tr key={lead.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-700 whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{lead.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{lead.company}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{lead.industry || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={lead.issue_summary}>{lead.issue_summary || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{lead.preferred_contact || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><RiskBadge level={lead.risk_level} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {lead.city || lead.country ? `${lead.city || ""}${lead.city && lead.country ? ", " : ""}${lead.country || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(lead.$createdAt).toLocaleDateString("en-IN")}
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

"use client";
import { useEffect, useState } from "react";
import { Clock, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=leads&source=consultation&limit=200")
      .then((r) => r.json())
      .then((d) => setConsultations(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = consultations.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
          <Clock size={18} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Consultations</h1>
          <p className="text-slate-500 text-sm">{consultations.length} consultation request{consultations.length !== 1 ? "s" : ""}</p>
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
            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No consultation requests yet</p>
            <p className="text-xs text-slate-400 mt-1">Consultation requests will appear here once users submit the contact form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name", "Email", "Phone", "Company", "Industry", "Issue Summary", "Preferred Contact", "Preferred Time", "Location", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-700 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.company}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.industry || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={c.issue_summary}>{c.issue_summary || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {c.preferred_contact ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 capitalize">{c.preferred_contact}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.preferred_time || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {c.city || c.country ? `${decodeURIComponent(c.city || "")}${c.city && c.country ? ", " : ""}${c.country || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(c.$createdAt).toLocaleDateString("en-IN")}
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

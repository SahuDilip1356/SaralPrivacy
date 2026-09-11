"use client";
import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";

export const dynamic = "force-dynamic";

function ConsentBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 font-medium">Yes</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 font-medium">No</span>
  );
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=downloads&limit=200")
      .then((r) => r.json())
      .then((d) => setDownloads(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = downloads.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.company?.toLowerCase().includes(q) ||
      d.industry?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
          <Download size={18} className="text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-brand-700">Downloads</h1>
          <p className="text-slate-500 text-sm">{downloads.length} total white paper downloads</p>
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
            <Download size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No downloads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name", "Email", "Phone", "Company", "Industry", "Company Size", "Email Consent", "Phone Consent", "Webinar Consent", "Location", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-700 whitespace-nowrap">{d.name}</td>
                    <td className="px-4 py-3 text-slate-600">{d.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{d.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{d.company}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{d.industry || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{d.company_size || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><ConsentBadge value={d.consent_email} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><ConsentBadge value={d.consent_phone} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><ConsentBadge value={d.consent_webinars} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {d.city || d.country ? `${decodeURIComponent(d.city || "")}${d.city && d.country ? ", " : ""}${d.country || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(d.$createdAt).toLocaleDateString("en-IN")}
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

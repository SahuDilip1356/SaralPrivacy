"use client";
import { useEffect, useState } from "react";
import { Mail, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=subscribers&limit=200")
      .then((r) => r.json())
      .then((d) => setSubscribers(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.industry?.toLowerCase().includes(q)
    );
  });

  // Breakdowns
  const byIndustry = filtered.reduce((acc: Record<string, number>, s) => {
    const key = s.industry || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const byFrequency = filtered.reduce((acc: Record<string, number>, s) => {
    const key = s.frequency || "weekly";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-saffron-50 rounded-lg flex items-center justify-center">
          <Mail size={18} className="text-saffron-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-brand-700">Subscribers</h1>
          <p className="text-slate-500 text-sm">{subscribers.length} total newsletter subscribers</p>
        </div>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">By Industry</h3>
          {Object.keys(byIndustry).length === 0 ? (
            <p className="text-xs text-slate-400">No data</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(byIndustry).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([ind, count]) => (
                <div key={ind} className="flex justify-between text-sm">
                  <span className="text-slate-600">{ind}</span>
                  <span className="font-semibold text-brand-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">By Frequency</h3>
          {Object.keys(byFrequency).length === 0 ? (
            <p className="text-xs text-slate-400">No data</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(byFrequency).sort((a, b) => b[1] - a[1]).map(([freq, count]) => (
                <div key={freq} className="flex justify-between text-sm">
                  <span className="text-slate-600 capitalize">{freq}</span>
                  <span className="font-semibold text-brand-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm mb-5 p-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, industry..."
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
            <Mail size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No subscribers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name", "Email", "Industry", "Frequency", "Privacy Version", "Location", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.$id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-700 whitespace-nowrap">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.industry || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 capitalize">{s.frequency || "weekly"}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.consent_version || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {s.city || s.country ? `${decodeURIComponent(s.city || "")}${s.city && s.country ? ", " : ""}${s.country || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(s.$createdAt).toLocaleDateString("en-IN")}
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

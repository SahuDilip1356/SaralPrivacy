"use client";
import { useEffect, useState } from "react";
import { Compass, Search } from "lucide-react";
import { getNiche } from "@/lib/discovery/data";

export const dynamic = "force-dynamic";

interface Lead {
  $id: string;
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  employees?: string;
  report_token?: string; // niche id
  template_name?: string;
  city?: string;
  country?: string;
  created_at?: string;
}

function nicheName(id?: string): string {
  if (!id) return "—";
  return getNiche(id)?.name || id;
}
function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(+d) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DiscoveryLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data?collection=template_downloads&source=discovery&limit=300")
      .then((r) => r.json())
      .then((d) => setLeads(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.business_name?.toLowerCase().includes(q) ||
      d.contact_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      nicheName(d.report_token).toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
          <Compass size={18} className="text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-brand-700">Data Discovery Leads</h1>
          <p className="text-slate-500 text-sm">
            {leads.length} businesses downloaded their personal-data inventory from /discovery
          </p>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business, contact, email, business type…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
        />
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 text-sm">No discovery leads yet.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Team</th>
                <th className="px-4 py-3 font-semibold">Business type</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.$id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-navy-700">{d.business_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.contact_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.employees || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{nicheName(d.report_token)}</td>
                  <td className="px-4 py-3 text-slate-600">{[d.city, d.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

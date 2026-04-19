"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Upload, CheckCircle, Clock, UserCheck, XCircle, AlertTriangle } from "lucide-react";

interface Stats { total: number; pending: number; sent: number; subscribed: number; bounced: number; }
interface ImportResult { inserted: number; duplicates: number; invalid: number; total: number; }
interface Contact { $id: string; email: string; name?: string; company?: string; industry?: string; status: string; intro_sent_at?: string; subscribed_at?: string; }

const STATUS_BADGE: Record<string, string> = {
  pending:     "bg-slate-100 text-slate-600",
  sent:        "bg-blue-50 text-blue-700",
  subscribed:  "bg-green-50 text-green-700",
  bounced:     "bg-red-50 text-red-700",
  unsubscribed:"bg-orange-50 text-orange-700",
  complained:  "bg-red-100 text-red-800",
};

export const dynamic = "force-dynamic";

export default function OutreachPage() {
  const [contacts, setContacts]       = useState<Contact[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploading, setUploading]     = useState(false);
  const [result, setResult]           = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/data?collection=outreach_contacts&limit=200")
      .then((r) => r.json())
      .then((d) => setContacts(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const stats: Stats = {
    total:      contacts.length,
    pending:    contacts.filter((c) => c.status === "pending").length,
    sent:       contacts.filter((c) => c.status === "sent").length,
    subscribed: contacts.filter((c) => c.status === "subscribed").length,
    bounced:    contacts.filter((c) => c.status === "bounced").length,
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.email.includes(q) || (c.name ?? "").toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    setResult(null);
    setImportError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/outreach/import", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) { setResult(data); load(); }
      else setImportError(data.error || "Import failed.");
    } catch {
      setImportError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-saffron-50 rounded-lg flex items-center justify-center">
          <Send size={18} className="text-saffron-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Outreach Campaign</h1>
          <p className="text-slate-500 text-sm">One-time DPDPA sensitization to cold contacts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",      value: stats.total,      icon: Send,        color: "text-brand-700"  },
          { label: "Pending",    value: stats.pending,    icon: Clock,       color: "text-slate-500"  },
          { label: "Sent",       value: stats.sent,       icon: CheckCircle, color: "text-blue-600"   },
          { label: "Subscribed", value: stats.subscribed, icon: UserCheck,   color: "text-green-600"  },
          { label: "Bounced",    value: stats.bounced,    icon: XCircle,     color: "text-red-500"    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-pearl-200 shadow-sm p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <div className="text-xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Import Contact List</h2>
        <p className="text-xs text-slate-400 mb-4">
          Upload an Excel (.xlsx) or CSV file. Must have a column named <span className="font-mono bg-slate-100 px-1 rounded">Email</span>.
          Optional columns: <span className="font-mono bg-slate-100 px-1 rounded">Name</span>, <span className="font-mono bg-slate-100 px-1 rounded">Company</span>, <span className="font-mono bg-slate-100 px-1 rounded">Industry</span>.
          Duplicates are skipped automatically.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 disabled:opacity-50 transition-colors"
        >
          <Upload size={14} />
          {uploading ? "Importing…" : "Upload Excel / CSV"}
        </button>

        {result && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            <CheckCircle size={14} className="inline mr-1.5" />
            Import complete — <strong>{result.inserted}</strong> added, <strong>{result.duplicates}</strong> duplicates skipped, <strong>{result.invalid}</strong> invalid emails skipped (of {result.total} rows).
          </div>
        )}
        {importError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <AlertTriangle size={14} className="inline mr-1.5" />
            {importError}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search email, name, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 w-64"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", "pending", "sent", "subscribed", "bounced", "unsubscribed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-brand-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading contacts…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Send size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{contacts.length === 0 ? "No contacts yet. Upload your Excel file to get started." : "No contacts match your search."}</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              Showing {filtered.length} of {contacts.length} contacts (first 200 loaded)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Email", "Name", "Company", "Industry", "Status", "Sent At", "Subscribed At"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.$id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-brand-700 font-medium">{c.email}</td>
                      <td className="px-4 py-3 text-slate-600">{c.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.company || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.industry || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[c.status] || "bg-slate-100 text-slate-600"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                        {c.intro_sent_at ? new Date(c.intro_sent_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                        {c.subscribed_at ? new Date(c.subscribed_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

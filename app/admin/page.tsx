import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  FileText, Users, Download, Mail, BarChart2, Shield,
  TrendingUp, CheckCircle, Clock, Eye, LogOut
} from "lucide-react";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

export const metadata: Metadata = { title: "Admin Dashboard | DPDPAIndia" };
export const dynamic = "force-dynamic";

// Helper: fetch count from an Appwrite collection
async function getCount(collection: string): Promise<number> {
  try {
    const res = await databases.listDocuments(DB_ID, collection, [Query.limit(1)]);
    return res.total;
  } catch { return 0; }
}

// Helper: fetch recent docs
async function getRecent(collection: string, limit = 5) {
  try {
    const res = await databases.listDocuments(DB_ID, collection, [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);
    return res.documents;
  } catch { return []; }
}

// Risk distribution for assessments
async function getRiskDistribution() {
  try {
    const [green, amber, red, total] = await Promise.all([
      databases.listDocuments(DB_ID, COLLECTIONS.ASSESSMENTS, [Query.equal("risk_level", "green"), Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.ASSESSMENTS, [Query.equal("risk_level", "amber"), Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.ASSESSMENTS, [Query.equal("risk_level", "red"),   Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.ASSESSMENTS, [Query.limit(1)]),
    ]);
    const t = total.total || 1;
    return [
      { level: "Green (Low Risk)",       count: green.total, pct: Math.round((green.total / t) * 100), color: "bg-dharma-600" },
      { level: "Amber (Moderate Risk)",  count: amber.total, pct: Math.round((amber.total / t) * 100), color: "bg-amber-500" },
      { level: "Red (High Risk)",        count: red.total,   pct: Math.round((red.total   / t) * 100), color: "bg-red-500"   },
    ];
  } catch {
    return [
      { level: "Green (Low Risk)",      count: 0, pct: 0, color: "bg-dharma-600" },
      { level: "Amber (Moderate Risk)", count: 0, pct: 0, color: "bg-amber-500"  },
      { level: "Red (High Risk)",       count: 0, pct: 0, color: "bg-red-500"    },
    ];
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const adminNav = [
  { label: "Dashboard",     href: "/admin",               icon: BarChart2,    active: true },
  { label: "Leads",         href: "/admin/leads",         icon: Users         },
  { label: "Subscribers",   href: "/admin/subscribers",   icon: Mail          },
  { label: "Downloads",     href: "/admin/downloads",     icon: Download      },
  { label: "Assessments",   href: "/admin/assessments",   icon: CheckCircle   },
  { label: "Consent Log",   href: "/admin/consent",       icon: Shield        },
  { label: "Consultations", href: "/admin/consultations", icon: Clock         },
];

export default async function AdminDashboard() {
  const [leadCount, subCount, dlCount, asCount, recentLeads, recentSubs, recentDls, riskDist] =
    await Promise.all([
      getCount(COLLECTIONS.LEADS),
      getCount(COLLECTIONS.SUBSCRIBERS),
      getCount(COLLECTIONS.DOWNLOADS),
      getCount(COLLECTIONS.ASSESSMENTS),
      getRecent(COLLECTIONS.LEADS, 5),
      getRecent(COLLECTIONS.SUBSCRIBERS, 3),
      getRecent(COLLECTIONS.DOWNLOADS, 3),
      getRiskDistribution(),
    ]);

  const stats = [
    { label: "Newsletter Subscribers", value: subCount,  icon: Mail,          color: "text-saffron-500", bg: "bg-saffron-50" },
    { label: "White Paper Downloads",  value: dlCount,   icon: Download,      color: "text-brand-500",   bg: "bg-brand-50"   },
    { label: "Assessments Completed",  value: asCount,   icon: CheckCircle,   color: "text-dharma-600",  bg: "bg-dharma-50"  },
    { label: "Consultation Requests",  value: leadCount, icon: Users,         color: "text-amber-600",   bg: "bg-amber-50"   },
  ];

  return (
    <div className="min-h-screen bg-pearl-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-brand-700 shrink-0 hidden lg:flex flex-col">
        <div className="px-5 py-5 border-b border-brand-800">
          <div className="font-bold text-white text-base">DPDPA<span className="text-saffron-400">India</span></div>
          <div className="text-brand-300 text-xs mt-0.5">Admin Dashboard</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "bg-saffron-500 text-white"
                  : "text-brand-300 hover:bg-brand-800 hover:text-white"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-brand-800 space-y-2">
          <Link href="/" className="text-xs text-brand-300 hover:text-white block">← View Site</Link>
          <form action={async () => { "use server"; const { cookies: c } = await import("next/headers"); (await c()).delete("admin_session"); redirect("/admin/login"); }}>
            <button type="submit" className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-red-400 transition-colors">
              <LogOut size={12} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-700">Dashboard</h1>
              <p className="text-pearl-500 text-sm">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-pearl-200 p-5 shadow-card">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="text-3xl font-bold text-brand-700">{value.toLocaleString()}</div>
                <div className="text-xs text-pearl-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Recent Leads */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-pearl-200 shadow-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
                <h2 className="font-bold text-brand-700 text-sm">Recent Consultation Requests</h2>
                <span className="text-xs text-pearl-400">{leadCount} total</span>
              </div>
              {recentLeads.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-pearl-400">No consultation requests yet.</div>
              ) : (
                <div className="divide-y divide-pearl-100">
                  {recentLeads.map((lead: any) => (
                    <div key={lead.$id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-brand-700 text-sm">{lead.name}</div>
                        <div className="text-xs text-pearl-500">{lead.company}{lead.industry ? ` · ${lead.industry}` : ""}</div>
                        {lead.issue_summary && (
                          <div className="text-xs text-pearl-400 mt-1 line-clamp-1">{lead.issue_summary}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-pearl-400 bg-pearl-100 px-2 py-0.5 rounded-full">{lead.source}</span>
                        <span className="text-xs text-pearl-400">{timeAgo(lead.$createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment risk distribution */}
            <div className="bg-white rounded-xl border border-pearl-200 shadow-card">
              <div className="px-5 py-4 border-b border-pearl-100">
                <h2 className="font-bold text-brand-700 text-sm">Assessment Risk Distribution</h2>
                <p className="text-xs text-pearl-500 mt-0.5">{asCount} assessments completed</p>
              </div>
              <div className="p-5 space-y-4">
                {riskDist.map(({ level, count, pct, color }) => (
                  <div key={level}>
                    <div className="flex justify-between text-xs text-pearl-600 mb-1.5">
                      <span>{level}</span>
                      <span className="font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-pearl-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
                {asCount === 0 && (
                  <p className="text-xs text-pearl-400 text-center pt-2">No assessments completed yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Subscribers + Downloads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-pearl-200 shadow-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
                <h2 className="font-bold text-brand-700 text-sm">Recent Subscribers</h2>
                <span className="text-xs text-pearl-400">{subCount} total</span>
              </div>
              {recentSubs.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-pearl-400">No subscribers yet.</div>
              ) : (
                <div className="divide-y divide-pearl-100">
                  {recentSubs.map((s: any) => (
                    <div key={s.$id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-brand-700">{s.name}</div>
                        <div className="text-xs text-pearl-500">{s.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-pearl-400 bg-pearl-100 px-2 py-0.5 rounded-full">{s.frequency || "weekly"}</div>
                        <div className="text-xs text-pearl-400 mt-1">{timeAgo(s.$createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-pearl-200 shadow-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
                <h2 className="font-bold text-brand-700 text-sm">Recent Downloads</h2>
                <span className="text-xs text-pearl-400">{dlCount} total</span>
              </div>
              {recentDls.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-pearl-400">No downloads yet.</div>
              ) : (
                <div className="divide-y divide-pearl-100">
                  {recentDls.map((d: any) => (
                    <div key={d.$id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-brand-700">{d.name}</div>
                        <div className="text-xs text-pearl-500">{d.company} · {d.industry}</div>
                      </div>
                      <div className="text-xs text-pearl-400">{timeAgo(d.$createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Users, Download, Mail, CheckCircle, ClipboardList, FileText, Activity, Calendar } from "lucide-react";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getCount(collection: string): Promise<number> {
  try {
    const res = await databases.listDocuments(DB_ID, collection, [Query.limit(1)]);
    return res.total;
  } catch { return 0; }
}

async function getRecent(collection: string, limit = 5) {
  try {
    const res = await databases.listDocuments(DB_ID, collection, [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);
    return res.documents;
  } catch { return []; }
}

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
      { level: "Green — Low Risk",     count: green.total, pct: Math.round((green.total / t) * 100), color: "bg-green-500"  },
      { level: "Amber — Moderate Risk",count: amber.total, pct: Math.round((amber.total / t) * 100), color: "bg-amber-500"  },
      { level: "Red — High Risk",      count: red.total,   pct: Math.round((red.total   / t) * 100), color: "bg-red-500"    },
    ];
  } catch {
    return [
      { level: "Green — Low Risk",      count: 0, pct: 0, color: "bg-green-500"  },
      { level: "Amber — Moderate Risk", count: 0, pct: 0, color: "bg-amber-500"  },
      { level: "Red — High Risk",       count: 0, pct: 0, color: "bg-red-500"    },
    ];
  }
}

// ── Activity feed — merge latest events from all collections ─────────────────

type ActivityEvent = {
  id:       string;
  type:     "subscriber" | "download" | "assessment" | "survey" | "lead" | "briefing";
  label:    string;
  sublabel: string;
  badge:    string;
  badgeColor: string;
  dot:      string;
  time:     string;
  href:     string;
};

function buildActivity(docs: any[], type: ActivityEvent["type"]): ActivityEvent[] {
  return docs.map((d) => {
    const time = d.$createdAt as string;

    if (type === "subscriber") return {
      id: d.$id, type, time, href: "/admin/subscribers",
      label:    d.name  || d.email || "Anonymous",
      sublabel: d.email || "",
      badge:    "Subscribed to Daily Brief",
      badgeColor: "bg-saffron-100 text-saffron-700",
      dot:      "bg-saffron-400",
    };

    if (type === "download") return {
      id: d.$id, type, time, href: "/admin/downloads",
      label:    d.name    || "Anonymous",
      sublabel: [d.company, d.industry].filter(Boolean).join(" · "),
      badge:    "Downloaded White Paper",
      badgeColor: "bg-brand-100 text-brand-700",
      dot:      "bg-brand-500",
    };

    if (type === "assessment") return {
      id: d.$id, type, time, href: "/admin/assessments",
      label:    d.email    || "Anonymous",
      sublabel: d.industry || "",
      badge:    `Assessment — ${d.risk_level ? d.risk_level.charAt(0).toUpperCase() + d.risk_level.slice(1) + " Risk" : "Completed"}`,
      badgeColor: d.risk_level === "red" ? "bg-red-100 text-red-700"
                : d.risk_level === "amber" ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700",
      dot: d.risk_level === "red" ? "bg-red-400" : d.risk_level === "amber" ? "bg-amber-400" : "bg-green-400",
    };

    if (type === "survey") return {
      id: d.$id, type, time, href: "/admin/survey-responses",
      label:    d.name || d.work_email || "Anonymous",
      sublabel: [d.role, d.sector].filter(Boolean).join(" · "),
      badge:    `Survey — ${d.score_band || "Completed"} (${d.score ?? "?"}/${7})`,
      badgeColor: "bg-purple-100 text-purple-700",
      dot:      "bg-purple-400",
    };

    if (type === "lead") return {
      id: d.$id, type, time, href: "/admin/consultations",
      label:    d.name    || "Anonymous",
      sublabel: [d.company, d.industry].filter(Boolean).join(" · "),
      badge:    "Consultation Requested",
      badgeColor: "bg-orange-100 text-orange-700",
      dot:      "bg-orange-400",
    };

    // briefing
    return {
      id: d.$id, type, time, href: "/admin/briefings",
      label:    d.title  || "Daily Briefing",
      sublabel: d.slug   || "",
      badge:    d.status === "sent" ? `Sent — ${d.subscriber_count ?? 0} subscribers`
              : d.status === "approved" ? "Approved — Ready to send"
              : "Draft — Awaiting approval",
      badgeColor: d.status === "sent" ? "bg-green-100 text-green-700"
                : d.status === "approved" ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700",
      dot: d.status === "sent" ? "bg-green-400" : d.status === "approved" ? "bg-blue-400" : "bg-amber-400",
    };
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const day = Math.floor(h / 24);
  return day === 1 ? "yesterday" : `${day}d ago`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const [
    leadCount, subCount, dlCount, asCount, surveyCount, briefingCount,
    recentLeads, recentSubs, recentDls, recentSurveys, recentAssessments, recentBriefings,
    riskDist,
  ] = await Promise.all([
    getCount(COLLECTIONS.LEADS),
    getCount(COLLECTIONS.SUBSCRIBERS),
    getCount(COLLECTIONS.DOWNLOADS),
    getCount(COLLECTIONS.ASSESSMENTS),
    getCount(COLLECTIONS.SURVEY_RESPONSES),
    getCount(COLLECTIONS.BRIEFINGS),
    getRecent(COLLECTIONS.LEADS,            8),
    getRecent(COLLECTIONS.SUBSCRIBERS,      8),
    getRecent(COLLECTIONS.DOWNLOADS,        8),
    getRecent(COLLECTIONS.SURVEY_RESPONSES, 8),
    getRecent(COLLECTIONS.ASSESSMENTS,      8),
    getRecent(COLLECTIONS.BRIEFINGS,        5),
    getRiskDistribution(),
  ]);

  // Build unified activity feed — merge + sort by time
  const activityFeed: ActivityEvent[] = [
    ...buildActivity(recentSubs,        "subscriber"),
    ...buildActivity(recentDls,         "download"),
    ...buildActivity(recentAssessments, "assessment"),
    ...buildActivity(recentSurveys,     "survey"),
    ...buildActivity(recentLeads,       "lead"),
    ...buildActivity(recentBriefings,   "briefing"),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 25);

  const stats = [
    { label: "Subscribers",      value: subCount,     icon: Mail,          color: "text-saffron-500", bg: "bg-saffron-50",  href: "/admin/subscribers"      },
    { label: "Downloads",        value: dlCount,      icon: Download,      color: "text-brand-500",   bg: "bg-brand-50",    href: "/admin/downloads"        },
    { label: "Assessments",      value: asCount,      icon: CheckCircle,   color: "text-green-600",   bg: "bg-green-50",    href: "/admin/assessments"      },
    { label: "Survey Responses", value: surveyCount,  icon: ClipboardList, color: "text-purple-600",  bg: "bg-purple-50",   href: "/admin/survey-responses" },
    { label: "Consultations",    value: leadCount,    icon: Users,         color: "text-amber-600",   bg: "bg-amber-50",    href: "/admin/consultations"    },
    { label: "Briefings",        value: briefingCount,icon: FileText,      color: "text-blue-600",    bg: "bg-blue-50",     href: "/admin/briefings"        },
  ];

  return (
    <div className="px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-700">Dashboard</h1>
          <p className="text-pearl-500 text-sm flex items-center gap-1.5 mt-0.5">
            <Calendar size={12} />
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-xs text-pearl-400 bg-white border border-pearl-200 px-3 py-1.5 rounded-full">
          Auto-refreshes on load
        </div>
      </div>

      {/* Stats — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <a key={label} href={href}
            className="bg-white rounded-xl border border-pearl-200 p-4 shadow-sm hover:shadow-md hover:border-pearl-300 transition-all group">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-bold text-brand-700 group-hover:text-brand-800">{value.toLocaleString()}</div>
            <div className="text-xs text-pearl-500 mt-0.5 leading-tight">{label}</div>
          </a>
        ))}
      </div>

      {/* Activity Feed — full width */}
      <div className="bg-white rounded-xl border border-pearl-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-brand-600" />
            <h2 className="font-semibold text-brand-700 text-sm">Live Activity Feed</h2>
          </div>
          <span className="text-xs text-pearl-400">Last 25 actions across all channels</span>
        </div>

        {activityFeed.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-pearl-400">
            No activity yet. Actions will appear here as visitors engage with the site.
          </div>
        ) : (
          <div className="divide-y divide-pearl-50">
            {activityFeed.map((event, i) => (
              <a key={`${event.id}-${i}`} href={event.href}
                className="flex items-start gap-4 px-5 py-3.5 hover:bg-pearl-50 transition-colors group">

                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1.5 shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${event.dot} ring-2 ring-white`} />
                  {i < activityFeed.length - 1 && (
                    <div className="w-px flex-1 bg-pearl-100 mt-1 min-h-[20px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-medium text-sm text-brand-700 group-hover:text-brand-800">
                        {event.label}
                      </span>
                      {event.sublabel && (
                        <span className="text-xs text-pearl-400 ml-2">{event.sublabel}</span>
                      )}
                    </div>
                    <span className="text-xs text-pearl-400 whitespace-nowrap shrink-0">
                      {timeAgo(event.time)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${event.badgeColor}`}>
                      {event.badge}
                    </span>
                    <span className="text-xs text-pearl-300">{formatTime(event.time)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Row 2: Recent Consultations + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-xl border border-pearl-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
            <h2 className="font-semibold text-brand-700 text-sm">Recent Consultation Requests</h2>
            <a href="/admin/consultations" className="text-xs text-brand-500 hover:text-brand-700">{leadCount} total →</a>
          </div>
          {recentLeads.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-pearl-400">No consultation requests yet.</div>
          ) : (
            <div className="divide-y divide-pearl-100">
              {recentLeads.slice(0, 5).map((lead: any) => (
                <div key={lead.$id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-brand-700 text-sm">{lead.name}</div>
                    <div className="text-xs text-pearl-500">
                      {lead.company}{lead.industry ? ` · ${lead.industry}` : ""}
                      {lead.city ? ` · ${decodeURIComponent(lead.city)}` : ""}
                    </div>
                    {lead.issue_summary && (
                      <div className="text-xs text-pearl-400 mt-1 line-clamp-1">{lead.issue_summary}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-pearl-400 bg-pearl-100 px-2 py-0.5 rounded-full">{lead.preferred_contact || lead.source}</span>
                    <span className="text-xs text-pearl-400">{timeAgo(lead.$createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm">
          <div className="px-5 py-4 border-b border-pearl-100">
            <h2 className="font-semibold text-brand-700 text-sm">Assessment Risk Distribution</h2>
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
              <p className="text-xs text-pearl-400 text-center pt-2">No assessments yet.</p>
            )}
          </div>

          {/* Survey score distribution */}
          <div className="px-5 pb-5 border-t border-pearl-100 pt-4">
            <h3 className="font-semibold text-brand-700 text-xs mb-3">Survey Score Bands</h3>
            {surveyCount === 0 ? (
              <p className="text-xs text-pearl-400">No survey responses yet.</p>
            ) : (
              <div className="space-y-1">
                {["Just Starting", "Aware", "Building", "Moving Well"].map((band) => {
                  const count = recentSurveys.filter((s: any) => s.score_band === band).length;
                  return (
                    <div key={band} className="flex items-center justify-between text-xs">
                      <span className="text-pearl-600">{band}</span>
                      <span className="font-medium text-brand-700">{count}</span>
                    </div>
                  );
                })}
                <p className="text-xs text-pearl-400 mt-2">(showing last 8 surveys)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Subscribers + Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
            <h2 className="font-semibold text-brand-700 text-sm">Recent Subscribers</h2>
            <a href="/admin/subscribers" className="text-xs text-brand-500 hover:text-brand-700">{subCount} total →</a>
          </div>
          {recentSubs.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-pearl-400">No subscribers yet.</div>
          ) : (
            <div className="divide-y divide-pearl-100">
              {recentSubs.slice(0, 5).map((s: any) => (
                <div key={s.$id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-brand-700">{s.name}</div>
                    <div className="text-xs text-pearl-500">{s.email}
                      {s.city ? ` · ${decodeURIComponent(s.city)}` : ""}
                    </div>
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

        <div className="bg-white rounded-xl border border-pearl-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pearl-100">
            <h2 className="font-semibold text-brand-700 text-sm">Recent White Paper Downloads</h2>
            <a href="/admin/downloads" className="text-xs text-brand-500 hover:text-brand-700">{dlCount} total →</a>
          </div>
          {recentDls.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-pearl-400">No downloads yet.</div>
          ) : (
            <div className="divide-y divide-pearl-100">
              {recentDls.slice(0, 5).map((d: any) => (
                <div key={d.$id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-brand-700">{d.name}</div>
                    <div className="text-xs text-pearl-500">
                      {d.company}{d.industry ? ` · ${d.industry}` : ""}
                      {d.city ? ` · ${decodeURIComponent(d.city)}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-pearl-400">{timeAgo(d.$createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

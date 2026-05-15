import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BarChart2, Users, Mail, Download, CheckCircle, Shield, Clock, LogOut, FileText, ClipboardList, BookOpen, UserPlus, Send, TrendingUp } from "lucide-react";

const adminNav = [
  { label: "Dashboard",        href: "/admin",                  icon: BarChart2,     adminOnly: true  },
  { label: "Briefings",        href: "/admin/briefings",        icon: FileText,      adminOnly: true  },
  { label: "Outreach",         href: "/admin/outreach",         icon: Send,          adminOnly: true  },
  { label: "Blog Posts",       href: "/admin/blog",             icon: BookOpen,      adminOnly: false },
  { label: "Bloggers",         href: "/admin/bloggers",         icon: UserPlus,      adminOnly: true  },
  { label: "Leads",            href: "/admin/leads",            icon: Users,         adminOnly: true  },
  { label: "Subscribers",      href: "/admin/subscribers",      icon: Mail,          adminOnly: true  },
  { label: "Downloads",        href: "/admin/downloads",        icon: Download,      adminOnly: true  },
  { label: "Assessments",      href: "/admin/assessments",      icon: CheckCircle,   adminOnly: true  },
  { label: "Survey Responses", href: "/admin/survey-responses", icon: ClipboardList, adminOnly: true  },
  { label: "Consent Log",      href: "/admin/consent",          icon: Shield,        adminOnly: true  },
  { label: "Consultations",    href: "/admin/consultations",    icon: Clock,         adminOnly: true  },
  { label: "AEO Citations",    href: "/admin/citations",        icon: TrendingUp,    adminOnly: true  },
];

// The middleware.ts already protects all /admin/* routes (except /admin/login).
// This layout adds the shared sidebar for all authenticated admin pages.
// The /admin/login page renders inside this layout but gets no sidebar because
// login itself is excluded from the middleware redirect.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Secondary guard in case middleware is bypassed
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const role = session?.value; // "authenticated" | "blogger" | undefined
  const isBlogger = role === "blogger";

  // We cannot know the pathname here without extra headers tricks,
  // so we rely on the middleware for the login exclusion.
  // If there's no session and we're not on login, middleware already redirected.
  // We only need to render the sidebar for authenticated users.
  if (!role) {
    // Render children without sidebar (will be the login page or redirect)
    return <>{children}</>;
  }

  // Filter nav for role: bloggers only see non-adminOnly items
  const visibleNav = isBlogger
    ? adminNav.filter((item) => !item.adminOnly)
    : adminNav;

  return (
    // pt-[96px] accounts for the fixed site header (32px top strip + 64px nav)
    <div className="min-h-screen bg-slate-50 flex pt-[96px]">

      {/* Sidebar — sticky, stays fixed while content scrolls */}
      <aside className="w-56 bg-navy-700 shrink-0 hidden lg:flex flex-col sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto">
        <div className="px-5 py-5 border-b border-navy-800">
          <div className="font-bold text-white text-base">Saral<span className="text-green-400">Privacy</span></div>
          <div className="text-slate-400 text-xs mt-0.5">
            {isBlogger ? "Blog Contributor" : "Admin Dashboard"}
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:bg-navy-800 hover:text-white"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-navy-800 space-y-2">
          <Link href="/" className="text-xs text-slate-400 hover:text-white block transition-colors">← View Site</Link>
          <form action={async () => {
            "use server";
            const { cookies: c } = await import("next/headers");
            (await c()).delete("admin_session");
            redirect("/admin/login");
          }}>
            <button type="submit" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={12} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content — scrolls independently */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

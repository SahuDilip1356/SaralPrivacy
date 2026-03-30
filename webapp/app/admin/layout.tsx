import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BarChart2, Users, Mail, Download, CheckCircle, Shield, Clock, LogOut, FileText, ClipboardList, BookOpen } from "lucide-react";

const adminNav = [
  { label: "Dashboard",        href: "/admin",                  icon: BarChart2    },
  { label: "Briefings",        href: "/admin/briefings",        icon: FileText     },
  { label: "Blog Posts",       href: "/admin/blog",             icon: BookOpen     },
  { label: "Leads",            href: "/admin/leads",            icon: Users        },
  { label: "Subscribers",      href: "/admin/subscribers",      icon: Mail         },
  { label: "Downloads",        href: "/admin/downloads",        icon: Download     },
  { label: "Assessments",      href: "/admin/assessments",      icon: CheckCircle  },
  { label: "Survey Responses", href: "/admin/survey-responses", icon: ClipboardList},
  { label: "Consent Log",      href: "/admin/consent",          icon: Shield       },
  { label: "Consultations",    href: "/admin/consultations",    icon: Clock        },
];

// The middleware.ts already protects all /admin/* routes (except /admin/login).
// This layout adds the shared sidebar for all authenticated admin pages.
// The /admin/login page renders inside this layout but gets no sidebar because
// login itself is excluded from the middleware redirect.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Secondary guard in case middleware is bypassed
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // We cannot know the pathname here without extra headers tricks,
  // so we rely on the middleware for the login exclusion.
  // If there's no session and we're not on login, middleware already redirected.
  // We only need to render the sidebar for authenticated users.
  if (!session?.value) {
    // Render children without sidebar (will be the login page or redirect)
    return <>{children}</>;
  }

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
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-brand-300 hover:bg-brand-800 hover:text-white"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-brand-800 space-y-2">
          <Link href="/" className="text-xs text-brand-300 hover:text-white block">← View Site</Link>
          <form action={async () => {
            "use server";
            const { cookies: c } = await import("next/headers");
            (await c()).delete("admin_session");
            redirect("/admin/login");
          }}>
            <button type="submit" className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-red-400 transition-colors">
              <LogOut size={12} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";

// Routes bloggers are restricted to (blog editor + blog API only)
const BLOGGER_ALLOWED_PREFIXES = [
  "/admin/blog",
  "/api/blog",
  "/api/admin/set-password", // set-password API is open (no session needed)
];

// Public /admin/* routes — no auth required
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/set-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin/* routes (excluding public admin paths)
  if (pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    const session = request.cookies.get("admin_session");
    const role    = session?.value; // "authenticated" | "blogger" | undefined

    // Not authenticated → redirect to login
    if (!role || !["authenticated", "blogger"].includes(role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Blogger: can only access blog editor routes
    if (role === "blogger") {
      const allowed = BLOGGER_ALLOWED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
      );
      if (!allowed) {
        return NextResponse.redirect(new URL("/admin/blog", request.url));
      }
    }

    // Admin ("authenticated"): full access — no further restriction
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

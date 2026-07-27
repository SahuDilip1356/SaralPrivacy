import { NextRequest, NextResponse } from "next/server";

// Routes bloggers are restricted to (blog editor + blog API only)
const BLOGGER_ALLOWED_PREFIXES = [
  "/admin/blog",
  "/api/blog",
  "/api/admin/set-password", // set-password API is open (no session needed)
];

// Public /admin/* routes — no auth required
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/set-password"];

/**
 * Content routes whose slugs are guaranteed kebab-case, so an uppercase variant
 * is always a duplicate of the lowercase one. Uppercase URLs used to return 200
 * AND self-canonicalise, splitting crawl signal across two URLs for one article.
 *
 * ⛔ Deliberately an ALLOWLIST, not a denylist. /report/<token> tokens are
 * base64url/UUID and /admin/blog/<id> ids are Appwrite ids — both case-SENSITIVE.
 * Lowercasing those would break every emailed report link. Never widen this to
 * "all paths" without re-checking for case-sensitive segments.
 */
const LOWERCASE_ONLY_PREFIXES = [
  "/blog",
  "/briefings",
  "/learn",
  "/industries",
  "/glossary",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Canonical casing: 308 any uppercase variant to its lowercase twin ──
  if (
    pathname !== pathname.toLowerCase() &&
    LOWERCASE_ONLY_PREFIXES.some(
      (prefix) =>
        pathname.toLowerCase() === prefix ||
        pathname.toLowerCase().startsWith(`${prefix}/`)
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

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
  // Broad matcher, narrow behaviour. It must be broad because Next.js matchers
  // are case-SENSITIVE — "/blog/:path*" would never match "/Blog/Foo", which is
  // exactly the URL the canonical-casing redirect exists to catch.
  // Everything outside /admin and LOWERCASE_ONLY_PREFIXES falls straight through
  // to NextResponse.next().
  // Excluded: API routes, Next internals, and any path with a file extension
  // (so /templates/*.pdf and /guides/*.html are never intercepted).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};

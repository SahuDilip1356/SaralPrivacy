import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import { routing } from "@/i18n/routing";

// next-intl locale routing (MULTILINGUAL_SPEC §4.1/§4.2): localePrefix
// "as-needed" (English unprefixed), URL-prefix detection only — no
// Accept-Language redirect, no locale cookie, no alternate-link headers
// (all disabled in i18n/routing.ts, which derives locales from the registry).
const intlMiddleware = createIntlMiddleware(routing);

// Trees that must NEVER carry a locale prefix (spec §10.13): a locale-prefixed
// hit 308s to the unprefixed path, where the normal gates apply. These trees
// also bypass next-intl entirely — they live outside app/[locale]/, so the
// "as-needed" default-locale rewrite (/admin → /en/admin) would 404 them.
// /offline is the service worker's navigation fallback: sw.js requests that
// literal path, so it must never be rewritten to /en/offline (which 404s).
const UNLOCALIZED_PREFIXES = ["/admin", "/api", "/report", "/offline"];

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

function matchesLowercaseOnly(lowerPath: string): boolean {
  return LOWERCASE_ONLY_PREFIXES.some(
    (prefix) => lowerPath === prefix || lowerPath.startsWith(`${prefix}/`)
  );
}

function isUnlocalized(lowerPath: string): boolean {
  return UNLOCALIZED_PREFIXES.some(
    (prefix) => lowerPath === prefix || lowerPath.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Locale-prefix parse (case-insensitive, so /HI/... can canonicalise
  //       in the same single hop as the casing redirect below) ──
  const firstSegment = pathname.split("/")[1] ?? "";
  const maybeLocale = firstSegment.toLowerCase();
  const hasLocalePrefix =
    firstSegment !== "" && (routing.locales as readonly string[]).includes(maybeLocale);

  if (hasLocalePrefix) {
    // Path remainder after the prefix — "/" for the bare locale root.
    const rest = pathname.slice(firstSegment.length + 1) || "/";
    const restLower = rest.toLowerCase();

    // ── 2. Locale prefixes never exist on admin/api/report (spec §10.13):
    //       308 to the unprefixed path; its own gates apply on the next hop. ──
    if (isUnlocalized(restLower)) {
      const url = request.nextUrl.clone();
      url.pathname = rest;
      return NextResponse.redirect(url, 308);
    }

    // ── 3. Canonical casing in ONE hop: lowercase the locale prefix always,
    //       and the remainder when it falls under LOWERCASE_ONLY_PREFIXES
    //       (so /HI/Blog/Foo → /hi/blog/foo directly, never a 2-hop chain). ──
    const canonicalRest =
      rest !== restLower && matchesLowercaseOnly(restLower) ? restLower : rest;
    if (firstSegment !== maybeLocale || canonicalRest !== rest) {
      const url = request.nextUrl.clone();
      url.pathname = `/${maybeLocale}${canonicalRest === "/" ? "" : canonicalRest}`;
      return NextResponse.redirect(url, 308);
    }

    // ── 5. Well-formed locale path → next-intl handles the rewrite. ──
    return intlMiddleware(request);
  }

  // ── 3 (unprefixed). Canonical casing: 308 any uppercase variant to its
  //     lowercase twin — unchanged behaviour. ──
  if (
    pathname !== pathname.toLowerCase() &&
    matchesLowercaseOnly(pathname.toLowerCase())
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  // ── 4. Admin auth gate — unchanged. ──
  if (pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    // Cryptographically verified — a hand-set cookie no longer passes.
    const session = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );

    // Not authenticated → redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Blogger: can only access blog editor routes
    if (session.role === "blogger") {
      const allowed = BLOGGER_ALLOWED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
      );
      if (!allowed) {
        return NextResponse.redirect(new URL("/admin/blog", request.url));
      }
    }

    // Admin ("authenticated"): full access — no further restriction
  }

  // Unlocalized trees live outside app/[locale]/ — never hand them to
  // next-intl (its default-locale rewrite would send /admin to /en/admin).
  if (isUnlocalized(pathname.toLowerCase())) {
    return NextResponse.next();
  }

  // ── 5. Everything else (unprefixed public = English) → next-intl rewrites
  //       to the default locale under app/[locale]/. ──
  return intlMiddleware(request);
}

export const config = {
  // Broad matcher, narrow behaviour. It must be broad because Next.js matchers
  // are case-SENSITIVE — "/blog/:path*" would never match "/Blog/Foo", which is
  // exactly the URL the canonical-casing redirect exists to catch.
  // Excluded: API routes, Next internals, and any path with a file extension
  // (so /templates/*.pdf and /guides/*.html are never intercepted).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};

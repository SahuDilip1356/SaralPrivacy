import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { createAdminSessionToken, ADMIN_SESSION_MAX_AGE } from "@/lib/adminSession";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || "dilip.sahu@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();

const IS_PROD = process.env.NODE_ENV === "production";

function makeCookie(sessionValue: string): string {
  return [
    `admin_session=${sessionValue}`,
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ADMIN_SESSION_MAX_AGE}`,
    "Path=/",
    IS_PROD ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

// Constant-time compare; length is padded so mismatched lengths don't leak timing.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a.padEnd(256, "\0"));
  const bufB = Buffer.from(b.padEnd(256, "\0"));
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB) && a.length === b.length;
}

export async function POST(request: NextRequest) {
  // Login is the brute-force target — throttle it like every other public POST.
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // ── Admin check (env-based) ───────────────────────────────────────────────
  if (normalised === ADMIN_EMAIL) {
    if (!ADMIN_PASSWORD || !safeEqual(password, ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    return new NextResponse(JSON.stringify({ success: true, role: "admin" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": makeCookie(await createAdminSessionToken("admin")),
      },
    });
  }

  // ── Blogger check (Appwrite collection + bcrypt) ──────────────────────────
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, [
      Query.equal("email", normalised),
      Query.equal("active", true),
    ]);

    if (result.total > 0) {
      const blogger = result.documents[0];
      const match   = blogger.password_hash
        ? await bcrypt.compare(password, blogger.password_hash)
        : false;

      if (match) {
        return new NextResponse(
          JSON.stringify({ success: true, role: "blogger", name: blogger.name }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": makeCookie(await createAdminSessionToken("blogger", blogger.name)),
            },
          }
        );
      }
      // Blogger exists but wrong password — give specific error
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
  } catch (err) {
    console.error("[login] Blogger lookup failed:", err);
  }

  return NextResponse.json({ error: "Access denied." }, { status: 403 });
}

export async function DELETE() {
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "admin_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/",
    },
  });
}

/**
 * POST /api/admin/login — step 1 of the admin login (Blueprint P3).
 *
 * Password check is delegated to Supabase Auth. A successful password is NOT
 * a session: it yields an aal1 Supabase token parked in a 10-minute, path-
 * scoped cookie, and the caller is told whether to enroll a TOTP factor or
 * verify one. The admin_session cookie is only ever minted by
 * /api/admin/mfa/verify after Supabase reports aal2.
 */
import { NextRequest, NextResponse } from "next/server";

import {
  anonClient, roleOf, nextStep, revokeSession, AuthNotConfiguredError,
} from "@/lib/auth/supabaseAuth";
import {
  PENDING_COOKIE, PENDING_COOKIE_PATH, PENDING_MAX_AGE, encodePending,
} from "@/lib/auth/pending";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";
import { findOneByEmail } from "@/lib/db";

const IS_PROD = process.env.NODE_ENV === "production";

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

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  let client;
  try {
    client = anonClient();
  } catch (err) {
    if (err instanceof AuthNotConfiguredError) {
      console.error("[login]", err.message);
      return NextResponse.json({ error: "Login is not configured." }, { status: 500 });
    }
    throw err;
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    // Same message for unknown email and wrong password — no enumeration.
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const role = roleOf(data.user);
  if (!role) {
    await revokeSession(client);
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  // Bloggers can be revoked from the admin UI (ops.blogger_accounts.active).
  if (role === "blogger") {
    const account = await findOneByEmail("blogger_accounts", email).catch(() => null);
    if (!account || (account as Record<string, unknown>).active !== true) {
      await revokeSession(client);
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
  }

  const { data: factors } = await client.auth.mfa.listFactors();
  const step = nextStep(factors);

  const res = NextResponse.json({ success: true, step, role });
  res.cookies.set(PENDING_COOKIE, encodePending({
    at: data.session.access_token,
    rt: data.session.refresh_token,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: PENDING_COOKIE_PATH,
    maxAge: PENDING_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}

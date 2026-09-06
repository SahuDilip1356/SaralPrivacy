/**
 * POST /api/admin/mfa/verify — step 2 of the admin login: the TOTP code.
 *
 * Body: { code: "123456", factorId?: string }. factorId is only sent right
 * after enrollment; on a normal login the server picks the verified factor.
 *
 * This is the ONLY place an admin_session cookie is minted, and it requires
 * Supabase to report aal2 on the token it hands back. The Supabase session
 * is revoked immediately afterwards — our HMAC cookie is the session.
 */
import { NextRequest, NextResponse } from "next/server";

import {
  anonClient, roleOf, displayNameOf, restorePending, pickVerifiedTotp, aalOf,
  isValidTotpCode, revokeSession, AuthNotConfiguredError,
} from "@/lib/auth/supabaseAuth";
import { PENDING_COOKIE, PENDING_COOKIE_PATH, decodePending } from "@/lib/auth/pending";
import {
  ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSessionToken,
} from "@/lib/adminSession";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  // A 6-digit code is guessable in principle; Supabase throttles too, but the
  // pending cookie lets a caller retry, so cap it here as well.
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-mfa:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const pending = decodePending(request.cookies.get(PENDING_COOKIE)?.value);
  if (!pending) {
    return NextResponse.json({ error: "Session expired. Please sign in again.", step: "login" }, { status: 401 });
  }

  let body: { code?: unknown; factorId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }
  if (!isValidTotpCode(body.code)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }
  const requestedFactor = typeof body.factorId === "string" ? body.factorId : null;

  let client;
  try {
    client = anonClient();
  } catch (err) {
    if (err instanceof AuthNotConfiguredError) {
      console.error("[mfa/verify]", err.message);
      return NextResponse.json({ error: "Login is not configured." }, { status: 500 });
    }
    throw err;
  }

  const user = await restorePending(client, pending);
  if (!user) {
    return NextResponse.json({ error: "Session expired. Please sign in again.", step: "login" }, { status: 401 });
  }
  const role = roleOf(user);
  if (!role) {
    await revokeSession(client);
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  let factorId = requestedFactor;
  if (!factorId) {
    const { data: factors } = await client.auth.mfa.listFactors();
    factorId = pickVerifiedTotp(factors)?.id ?? null;
    if (!factorId) {
      return NextResponse.json({ error: "Set up your verification app first.", step: "enroll" }, { status: 401 });
    }
  }

  // Factor ids are scoped to the session's user inside Supabase — a forged id
  // fails here, it cannot verify someone else's factor.
  const { data, error } = await client.auth.mfa.challengeAndVerify({ factorId, code: body.code });
  if (error || !data) {
    return NextResponse.json({ error: "Code did not match. Try again." }, { status: 401 });
  }
  if (aalOf(data.access_token) !== "aal2") {
    console.error("[mfa/verify] verify succeeded but token is not aal2");
    await revokeSession(client);
    return NextResponse.json({ error: "Verification incomplete. Please sign in again.", step: "login" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createAdminSessionToken(role, displayNameOf(user), user.id);
  } catch (err) {
    console.error("[mfa/verify]", err instanceof Error ? err.message : err);
    await revokeSession(client);
    return NextResponse.json({ error: "Login is not configured." }, { status: 500 });
  }
  await revokeSession(client);

  const res = NextResponse.json({ success: true, role });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  res.cookies.set(PENDING_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: PENDING_COOKIE_PATH,
    maxAge: 0,
  });
  return res;
}

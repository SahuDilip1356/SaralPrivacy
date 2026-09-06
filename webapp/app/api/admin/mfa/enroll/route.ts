/**
 * POST /api/admin/mfa/enroll — first-login TOTP enrollment.
 *
 * Needs the MFA-pending cookie from /api/admin/login. Returns the QR code
 * (SVG data URL) and the secret for manual entry. Refuses if the user already
 * has a verified factor — adding a second factor is not something the login
 * flow may do.
 */
import { NextRequest, NextResponse } from "next/server";

import {
  anonClient, roleOf, restorePending, pickVerifiedTotp, unverifiedTotp,
  TOTP_ISSUER, AuthNotConfiguredError,
} from "@/lib/auth/supabaseAuth";
import { PENDING_COOKIE, decodePending } from "@/lib/auth/pending";

export async function POST(request: NextRequest) {
  const pending = decodePending(request.cookies.get(PENDING_COOKIE)?.value);
  if (!pending) {
    return NextResponse.json({ error: "Session expired. Please sign in again.", step: "login" }, { status: 401 });
  }

  let client;
  try {
    client = anonClient();
  } catch (err) {
    if (err instanceof AuthNotConfiguredError) {
      console.error("[mfa/enroll]", err.message);
      return NextResponse.json({ error: "Login is not configured." }, { status: 500 });
    }
    throw err;
  }

  const user = await restorePending(client, pending);
  if (!user) {
    return NextResponse.json({ error: "Session expired. Please sign in again.", step: "login" }, { status: 401 });
  }
  if (!roleOf(user)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const { data: factors, error: listErr } = await client.auth.mfa.listFactors();
  if (listErr) {
    console.error("[mfa/enroll] listFactors:", listErr.message);
    return NextResponse.json({ error: "Could not start verification setup." }, { status: 500 });
  }
  if (pickVerifiedTotp(factors)) {
    return NextResponse.json(
      { error: "A verification app is already set up for this account.", step: "verify" },
      { status: 409 }
    );
  }

  // An abandoned earlier attempt leaves an unverified factor behind; clear it
  // so the fresh enroll can't collide on the friendly name.
  for (const stale of unverifiedTotp(factors)) {
    await client.auth.mfa.unenroll({ factorId: stale.id });
  }

  const { data, error } = await client.auth.mfa.enroll({
    factorType: "totp",
    issuer: TOTP_ISSUER,
    friendlyName: `${TOTP_ISSUER} ${user.email ?? "admin"}`,
  });
  if (error || !data) {
    console.error("[mfa/enroll] enroll:", error?.message);
    return NextResponse.json({ error: "Could not start verification setup." }, { status: 500 });
  }

  return NextResponse.json({
    factorId: data.id,
    qr: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  });
}

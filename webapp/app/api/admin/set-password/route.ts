/**
 * POST /api/admin/set-password — complete an invite or a password reset.
 *
 * Body: { token_hash, type: "invite" | "recovery", password }.
 * The token_hash comes from the link WE emailed (generated server-side via
 * lib/auth/adminAuth). Supabase verifies it and hands back a session just
 * long enough to set the password; we then revoke that session and the user
 * signs in normally (password + TOTP).
 */
import { NextRequest, NextResponse } from "next/server";

import { anonClient, roleOf, revokeSession, AuthNotConfiguredError } from "@/lib/auth/supabaseAuth";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";
import { findOneByEmail, updateDocumentById } from "@/lib/db";

const MIN_PASSWORD = 12;
const MAX_PASSWORD = 128;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`set-password:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  let body: { token_hash?: unknown; type?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  const tokenHash = typeof body.token_hash === "string" ? body.token_hash.trim() : "";
  const type = body.type === "invite" || body.type === "recovery" ? body.type : null;
  const password = typeof body.password === "string" ? body.password : "";

  if (!tokenHash || !type || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be ${MIN_PASSWORD}–${MAX_PASSWORD} characters.` },
      { status: 400 }
    );
  }

  let client;
  try {
    client = anonClient();
  } catch (err) {
    if (err instanceof AuthNotConfiguredError) {
      console.error("[set-password]", err.message);
      return NextResponse.json({ error: "Account setup is not configured." }, { status: 500 });
    }
    throw err;
  }

  const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error || !data.user || !data.session) {
    return NextResponse.json(
      { error: "This link is invalid or has expired. Ask the admin for a new one." },
      { status: 401 }
    );
  }

  const { error: pwErr } = await client.auth.updateUser({ password });
  if (pwErr) {
    await revokeSession(client);
    return NextResponse.json({ error: pwErr.message }, { status: 400 });
  }

  // A blogger completing an INVITE becomes active in the admin list. Recovery
  // never changes activation — a revoked blogger stays revoked.
  if (type === "invite" && roleOf(data.user) === "blogger" && data.user.email) {
    try {
      const account = await findOneByEmail("blogger_accounts", data.user.email.toLowerCase());
      if (account) {
        await updateDocumentById("blogger_accounts", account.id, { active: true, invite_token: "" });
      }
    } catch (err) {
      console.error("[set-password] blogger activation failed:", err instanceof Error ? err.message : err);
    }
  }

  await revokeSession(client);
  return NextResponse.json({ success: true });
}

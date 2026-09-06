/**
 * pending.ts — the short-lived cookie that carries a Supabase session between
 * the password step and the TOTP step of an admin login.
 *
 * Holds ONLY the Supabase access + refresh tokens. Role and identity are never
 * read from this cookie — every MFA route restores the session and asks
 * Supabase who the user is. An aal1 (password-only) token can read nothing
 * from the database (see supabase/migrations/0005_auth_roles_rls.sql), so a
 * stolen pending cookie buys an attacker only the right to attempt TOTP codes,
 * which is rate-limited.
 *
 * Pure functions here so they unit-test without a network.
 */

export const PENDING_COOKIE = "admin_mfa_pending";
export const PENDING_MAX_AGE = 60 * 10; // 10 minutes — enough to scan a QR code
/** Scoped so the browser only ever sends it to the MFA routes. */
export const PENDING_COOKIE_PATH = "/api/admin/mfa";

export interface PendingSession {
  at: string; // Supabase access token (JWT)
  rt: string; // Supabase refresh token
}

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

export function encodePending(p: PendingSession): string {
  return b64url(JSON.stringify({ at: p.at, rt: p.rt }));
}

export function decodePending(value: string | undefined | null): PendingSession | null {
  if (!value) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const { at, rt } = parsed as Record<string, unknown>;
  if (typeof at !== "string" || typeof rt !== "string" || !at || !rt) return null;
  // Access tokens are JWTs; anything else is garbage or tampering.
  if (at.split(".").length !== 3) return null;
  return { at, rt };
}

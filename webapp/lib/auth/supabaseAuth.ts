/**
 * supabaseAuth.ts — the thin seam between our admin login flow and Supabase
 * Auth (Blueprint P3, P3_AUTH_SPEC.md).
 *
 * Everything runs server-side with the publishable (anon) key: there is no
 * browser Supabase client, no NEXT_PUBLIC_* env, no persisted session. A
 * client is created PER REQUEST — the SSR rule from the Supabase MFA guide —
 * and holds the session in memory only for the life of that request.
 *
 * Role model: `auth.users.app_metadata.role` ∈ {"admin","blogger"}. Only the
 * service role can write app_metadata, so a user can never self-elevate.
 *
 * Pure helpers (roleOf, nextStep, aalOf, pickVerifiedTotp) are exported for
 * unit tests; the network-touching functions stay small and obvious.
 */

import { createClient, type SupabaseClient, type User, type Factor } from "@supabase/supabase-js";
import type { AdminRole } from "@/lib/adminSession";
import type { PendingSession } from "./pending";

export const TOTP_ISSUER = "SaralPrivacy";

// ── Pure helpers ────────────────────────────────────────────────────────────

type UserLike = { app_metadata?: Record<string, unknown> | null; user_metadata?: Record<string, unknown> | null; email?: string | null } | null | undefined;

/** The role claim, or null when absent/unknown. Never trust anything else. */
export function roleOf(user: UserLike): AdminRole | null {
  const r = user?.app_metadata?.role;
  return r === "admin" || r === "blogger" ? r : null;
}

/** Display name for the session token: user_metadata.name, else nothing. */
export function displayNameOf(user: UserLike): string | undefined {
  const n = user?.user_metadata?.name;
  return typeof n === "string" && n.trim() ? n.trim() : undefined;
}

export type FactorList = { all?: Factor[]; totp?: Factor[] } | null | undefined;

export function pickVerifiedTotp(factors: FactorList): Factor | null {
  const list = factors?.totp ?? factors?.all ?? [];
  return list.find((f) => f.factor_type === "totp" && f.status === "verified") ?? null;
}

export function unverifiedTotp(factors: FactorList): Factor[] {
  return (factors?.all ?? []).filter((f) => f.factor_type === "totp" && f.status !== "verified");
}

/** After the password step: does this user enroll a factor, or verify one? */
export function nextStep(factors: FactorList): "enroll" | "verify" {
  return pickVerifiedTotp(factors) ? "verify" : "enroll";
}

/** Read the `aal` claim off a Supabase access token WITHOUT verifying it.
 *  Only ever called on a token Supabase just handed us over TLS. */
export function aalOf(accessToken: string | undefined | null): string | null {
  if (!accessToken) return null;
  const parts = accessToken.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return typeof payload?.aal === "string" ? payload.aal : null;
  } catch {
    return null;
  }
}

export function isValidTotpCode(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code);
}

// ── Clients ─────────────────────────────────────────────────────────────────

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("supabaseAuth: SUPABASE_URL / SUPABASE_ANON_KEY missing");
    this.name = "AuthNotConfiguredError";
  }
}

/** Fresh per-request client with the publishable key. Never cached. */
export function anonClient(): SupabaseClient {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) throw new AuthNotConfiguredError();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Restore an MFA-pending session onto a fresh client and return the user
 * Supabase says it belongs to. Null on any failure (expired, revoked, garbage).
 */
export async function restorePending(
  client: SupabaseClient,
  pending: PendingSession
): Promise<User | null> {
  const { data, error } = await client.auth.setSession({
    access_token: pending.at,
    refresh_token: pending.rt,
  });
  if (error || !data.user) return null;
  return data.user;
}

/** Best-effort server-side revoke of the Supabase session we no longer need. */
export async function revokeSession(client: SupabaseClient): Promise<void> {
  try {
    await client.auth.signOut({ scope: "local" });
  } catch {
    /* the pending cookie expires on its own; nothing to do */
  }
}

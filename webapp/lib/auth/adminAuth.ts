/**
 * adminAuth.ts — service-role side of Supabase Auth: creating users, setting
 * the role claim, producing invite / recovery links. Used by the blogger
 * admin routes and tools/auth/provision.ts. Never imported by anything a
 * browser can reach directly.
 *
 * Links are generated, not sent — we email them ourselves through Resend so
 * the copy, sender and deliverability stay ours (and Supabase's built-in
 * SMTP rate limit never bites).
 */

import type { AdminRole } from "../adminSession";
import { getSupabase } from "../db/supabase";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").trim();

export function setPasswordUrl(tokenHash: string, type: "invite" | "recovery"): string {
  return `${SITE_URL}/admin/set-password?token_hash=${encodeURIComponent(tokenHash)}&type=${type}`;
}

export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .schema("ops")
    .rpc("auth_user_id_by_email", { p_email: email.trim().toLowerCase() });
  if (error) throw new Error(`auth_user_id_by_email: ${error.message}`);
  return typeof data === "string" && data ? data : null;
}

/**
 * Create the auth user (email unconfirmed until they follow the link), stamp
 * the role claim, and return the invite token hash for our own email.
 * Fails with "already registered" if the email is already an auth user —
 * callers use createRecovery() for that case.
 */
export async function createInvite(params: {
  email: string; name: string; role: AdminRole;
}): Promise<{ userId: string; url: string }> {
  const email = params.email.trim().toLowerCase();
  const admin = getSupabase().auth.admin;

  const { data, error } = await admin.generateLink({
    type: "invite",
    email,
    options: { data: { name: params.name } },
  });
  if (error || !data.user || !data.properties?.hashed_token) {
    throw new Error(`generateLink(invite): ${error?.message ?? "no token returned"}`);
  }

  // app_metadata is the role source of truth — writable by the service role only.
  const { error: roleErr } = await admin.updateUserById(data.user.id, {
    app_metadata: { role: params.role },
    user_metadata: { name: params.name },
  });
  if (roleErr) throw new Error(`updateUserById(role): ${roleErr.message}`);

  return { userId: data.user.id, url: setPasswordUrl(data.properties.hashed_token, "invite") };
}

/** Password-reset link for an existing user (also re-asserts the role if given). */
export async function createRecovery(params: {
  email: string; role?: AdminRole; name?: string;
}): Promise<{ userId: string; url: string }> {
  const email = params.email.trim().toLowerCase();
  const admin = getSupabase().auth.admin;

  const { data, error } = await admin.generateLink({ type: "recovery", email });
  if (error || !data.user || !data.properties?.hashed_token) {
    throw new Error(`generateLink(recovery): ${error?.message ?? "no token returned"}`);
  }
  if (params.role || params.name) {
    const { error: upErr } = await admin.updateUserById(data.user.id, {
      ...(params.role ? { app_metadata: { role: params.role } } : {}),
      ...(params.name ? { user_metadata: { name: params.name } } : {}),
    });
    if (upErr) throw new Error(`updateUserById: ${upErr.message}`);
  }
  return { userId: data.user.id, url: setPasswordUrl(data.properties.hashed_token, "recovery") };
}

/** Revoke (ban) or restore an auth user. Best-effort: callers gate login on
 *  ops.blogger_accounts.active anyway; this just closes the Supabase side too. */
export async function setAuthUserBanned(email: string, banned: boolean): Promise<void> {
  const id = await findAuthUserIdByEmail(email);
  if (!id) return;
  const { error } = await getSupabase().auth.admin.updateUserById(id, {
    ban_duration: banned ? "876000h" : "none",
  });
  if (error) throw new Error(`updateUserById(ban): ${error.message}`);
}

export async function deleteAuthUserByEmail(email: string): Promise<void> {
  const id = await findAuthUserIdByEmail(email);
  if (!id) return;
  const { error } = await getSupabase().auth.admin.deleteUser(id);
  if (error) throw new Error(`deleteUser: ${error.message}`);
}

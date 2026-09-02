/**
 * adminSession.ts — HMAC-signed admin/blogger session tokens.
 *
 * Replaces the old literal cookie values ("authenticated" / "blogger"), which
 * were forgeable by anyone who set the cookie by hand. A session is now
 * `v1.<payload>.<signature>` where the signature is HMAC-SHA256 over the
 * payload, so a token can only be minted by the server.
 *
 * Web Crypto (globalThis.crypto.subtle) on purpose, not node:crypto — this
 * module is imported by proxy.ts as well as Node route handlers, and Web
 * Crypto is the API available in both runtimes.
 *
 * Signing key: ADMIN_SESSION_SECRET if set; otherwise derived from
 * ADMIN_PASSWORD so preview/prod work before the dedicated secret is
 * provisioned. Deriving also means rotating the admin password invalidates
 * every outstanding session, which is the behaviour we want.
 */

import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type AdminRole = "admin" | "blogger";

export interface AdminSession {
  role: AdminRole;
  name?: string;
}

interface TokenPayload {
  r: AdminRole;
  n?: string;
  exp: number; // unix seconds
}

const encoder = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(value: string): Uint8Array | null {
  try {
    const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function getSecret(): string | null {
  const dedicated = (process.env.ADMIN_SESSION_SECRET || "").trim();
  if (dedicated) return dedicated;
  const derivedFrom = (process.env.ADMIN_PASSWORD || "").trim();
  if (derivedFrom) return `saralprivacy-admin-session-v1:${derivedFrom}`;
  return null; // no secret material → sessions cannot be minted or verified
}

async function hmac(payloadB64: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return new Uint8Array(sig);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createAdminSessionToken(
  role: AdminRole,
  name?: string
): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error("adminSession: no ADMIN_SESSION_SECRET or ADMIN_PASSWORD configured");
  }
  const payload: TokenPayload = {
    r: role,
    ...(name ? { n: name } : {}),
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  };
  const payloadB64 = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const sig = await hmac(payloadB64, secret);
  return `v1.${payloadB64}.${b64urlEncode(sig)}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const [, payloadB64, sigB64] = parts;

  const claimedSig = b64urlDecode(sigB64);
  if (!claimedSig) return null;
  const expectedSig = await hmac(payloadB64, secret);
  if (!constantTimeEqual(claimedSig, expectedSig)) return null;

  const payloadBytes = b64urlDecode(payloadB64);
  if (!payloadBytes) return null;
  let payload: TokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }

  if (payload.r !== "admin" && payload.r !== "blogger") return null;
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { role: payload.r, ...(payload.n ? { name: payload.n } : {}) };
}

/** Convenience for route handlers holding a NextRequest. */
export async function getAdminSession(request: NextRequest): Promise<AdminSession | null> {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Guard helper: returns the session only if its role is in `roles`. */
export async function requireRole(
  request: NextRequest,
  roles: AdminRole[]
): Promise<AdminSession | null> {
  const session = await getAdminSession(request);
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

/**
 * abuseGuard.ts — lightweight, dependency-free protection for public POST routes.
 *
 * Two layers:
 *   1. rateLimit()  — per-IP sliding window. Blocks rapid floods from one source.
 *   2. honeypot     — a hidden form field humans never fill but bots auto-fill.
 *
 * This is an in-memory limiter (per serverless instance). On Vercel Fluid Compute
 * instances are reused, so a burst from one source generally hits the same warm
 * instance and gets caught. It is proportionate protection for the current traffic
 * scale; if we ever need durable/distributed limiting, swap the Map for Upstash Redis
 * without changing any call sites.
 */

import type { NextRequest } from "next/server";

// ── Client IP ────────────────────────────────────────────────────────────────
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

// ── Rate limiter (sliding window) ──────────────────────────────────────────────
const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number; // seconds until the caller may retry
}

/**
 * @param key       unique bucket, e.g. `assessment:1.2.3.4`
 * @param limit     max requests allowed within the window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    hits.set(key, recent);
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfter: 0 };
}

// ── Honeypot ───────────────────────────────────────────────────────────────────
// Bots fill every field they find; the form keeps this one visually hidden, so a
// real visitor always leaves it empty. Name is deliberately tempting to bots.
export const HONEYPOT_FIELD = "hp_url";

export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof v === "string" && v.trim().length > 0;
}

// downloadLimits.ts — durable limits for the two public template endpoints.
//
// Both endpoints email an address the caller types in, from our domain. The
// in-memory limiter in abuseGuard.ts resets with every serverless instance, so
// on its own it can't stop someone using these routes to mail strangers. These
// limits count the rows the routes already write to template_downloads, so they
// hold across instances and deploys with no extra infrastructure.

import { queryDocuments } from "@/lib/db";

const HOUR_MS = 60 * 60 * 1000;

/** Emails one recipient may be sent per hour (a real multi-template session needs a few). */
export const MAX_PER_RECIPIENT_PER_HOUR = 5;
/** Requests one IP may make per hour (an office downloading several templates). */
export const MAX_PER_IP_PER_HOUR = 20;

export function normalizeEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

async function countSince(field: "email" | "ip_address", value: string): Promise<number> {
  const { total } = await queryDocuments("template_downloads", {
    where: [
      { field, value },
      { field: "created_at", op: "gte", value: new Date(Date.now() - HOUR_MS).toISOString() },
    ],
    limit: 1,
  });
  return total;
}

/**
 * Whether this request is over a durable limit. Fails open on a database error:
 * the in-memory limiter still applies, and a DB hiccup shouldn't block real users.
 */
export async function overDurableLimit(ip: string, email: string): Promise<boolean> {
  try {
    const [byIp, byEmail] = await Promise.all([
      ip && ip !== "unknown" ? countSince("ip_address", ip) : 0,
      email ? countSince("email", email) : 0,
    ]);
    return byIp >= MAX_PER_IP_PER_HOUR || byEmail >= MAX_PER_RECIPIENT_PER_HOUR;
  } catch (err) {
    console.error("[downloadLimits] count failed (failing open):", err);
    return false;
  }
}

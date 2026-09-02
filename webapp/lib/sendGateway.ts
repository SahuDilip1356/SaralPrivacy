/**
 * sendGateway.ts — the ONE place bulk-email policy lives.
 *
 * Before this module, the two briefing send paths disagreed: the cron filtered
 * suppressed subscribers, the approve path emailed the first 300 rows with no
 * filter at all — a privacy company one bad click away from mailing people who
 * unsubscribed. Every bulk send now gets its audience from
 * fetchEligibleSubscribers(), which:
 *   - paginates past the old hard caps (300/500) so subscriber #501 exists,
 *   - drops unsubscribed/bounced/complained,
 *   - dedupes by email (the subscribe route allowed duplicate rows).
 *
 * It also owns unsubscribe-link signing: links carry an HMAC of the email so
 * /api/subscribers/unsubscribe can distinguish our links from a griefer
 * unsubscribing someone else by hand. Old, unsigned links keep working
 * (compliance — they're in sent mail forever) but are rate-limited.
 */

import { databases, DB_ID, COLLECTIONS, Query } from "./appwrite";

export const SUPPRESSED_STATUSES = ["unsubscribed", "bounced", "complained"];

const PAGE_SIZE = 100;
// Safety valve, not an audience cap: 200 pages = 20k subscribers. If we ever
// hit it, the log line below is the signal to move sending to a queue.
const MAX_PAGES = 200;

export interface EligibleSubscriber {
  $id: string;
  email: string;
  name: string;
  frequency: string;
}

export async function fetchEligibleSubscribers(): Promise<EligibleSubscriber[]> {
  const seen = new Set<string>();
  const eligible: EligibleSubscriber[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const q = [Query.limit(PAGE_SIZE)];
    if (cursor) q.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.SUBSCRIBERS, q);

    for (const doc of res.documents) {
      const email = String(doc.email || "").trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      if (SUPPRESSED_STATUSES.includes(doc.status as string)) continue;
      seen.add(email);
      eligible.push({
        $id: doc.$id,
        email,
        name: (doc.name as string) || "",
        frequency: (doc.frequency as string) || "daily",
      });
    }

    if (res.documents.length < PAGE_SIZE) return eligible;
    cursor = res.documents[res.documents.length - 1].$id;
  }

  console.error(
    `[sendGateway] MAX_PAGES (${MAX_PAGES}) hit — subscriber list exceeds ` +
    `${MAX_PAGES * PAGE_SIZE}; time to move sending to a queue.`
  );
  return eligible;
}

// ── Unsubscribe-link signing ─────────────────────────────────────────────────

const encoder = new TextEncoder();

function getLinkSecret(): string | null {
  const dedicated = (process.env.EMAIL_LINK_SECRET || "").trim();
  if (dedicated) return dedicated;
  const derivedFrom = (process.env.ADMIN_PASSWORD || "").trim();
  if (derivedFrom) return `saralprivacy-email-link-v1:${derivedFrom}`;
  return null;
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signEmailForUnsubscribe(email: string): Promise<string | null> {
  const secret = getLinkSecret();
  if (!secret) return null;
  return hmacHex(email.trim().toLowerCase(), secret);
}

export async function verifyUnsubscribeSig(
  email: string,
  sig: string | null | undefined
): Promise<boolean> {
  if (!sig) return false;
  const expected = await signEmailForUnsubscribe(email);
  if (!expected || expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export async function buildUnsubscribeUrl(email: string): Promise<string> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").replace(/\/$/, "");
  const sig = await signEmailForUnsubscribe(email);
  const sigPart = sig ? `&sig=${sig}` : "";
  return `${base}/unsubscribe?email=${encodeURIComponent(email)}${sigPart}`;
}

import { NextRequest, NextResponse } from "next/server";
import { findOneByEmail, updateDocumentById } from "@/lib/db";
import { verifyUnsubscribeSig } from "@/lib/sendGateway";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";

export async function POST(request: NextRequest) {
  try {
    const { email, sig } = await request.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const normalised = email.trim().toLowerCase();

    // Links in our emails carry an HMAC sig and are honoured unconditionally.
    // Unsigned requests (old emails, the consent-preferences form) still work —
    // unsubscribes must never be blocked outright — but are throttled so a
    // griefer can't bulk-suppress the subscriber list by posting raw emails.
    const signedLink = await verifyUnsubscribeSig(normalised, sig);
    if (!signedLink) {
      const limited = rateLimit(`unsub:${getClientIp(request)}`, 5, 60 * 60 * 1000);
      if (!limited.ok) {
        return NextResponse.json(
          { error: "Too many requests. Try again later or email privacy@saralprivacy.com." },
          { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
        );
      }
    }

    const existing = await findOneByEmail("subscribers", normalised);

    if (!existing) {
      // Not found — still return success so the page shows a clean state
      return NextResponse.json({ success: true, already_removed: true });
    }

    // Soft-unsubscribe: flip status (suppresses all future sends via
    // lib/suppression.ts) and stamp WHEN consent was withdrawn. We keep the row
    // as a suppression record so a later re-import can't re-contact them; full
    // deletion is available on request via the erasure right (/rights).
    await updateDocumentById("subscribers", existing.id, {
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[subscribers/unsubscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

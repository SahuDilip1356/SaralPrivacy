import { NextRequest, NextResponse } from "next/server";
import { findOneByEmail, updateDocumentById } from "@/lib/db";
import { verifyUnsubscribeSig } from "@/lib/sendGateway";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";

// Two callers POST here:
//   1. our /unsubscribe page and the consent-preferences form — JSON {email, sig};
//   2. Gmail/Yahoo's own Unsubscribe button (RFC 8058) — a form-encoded
//      "List-Unsubscribe=One-Click" body, with email + sig in the query string
//      of the List-Unsubscribe header URL (see unsubscribeHeaders()).
async function readTarget(request: NextRequest): Promise<{ email: unknown; sig: unknown }> {
  if ((request.headers.get("content-type") || "").includes("application/json")) {
    const { email, sig } = await request.json();
    return { email, sig };
  }
  const q = new URL(request.url).searchParams;
  return { email: q.get("email"), sig: q.get("sig") };
}

export async function POST(request: NextRequest) {
  try {
    const { email, sig } = await readTarget(request);
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Links in our emails carry an HMAC sig and are honoured unconditionally.
    // Unsigned requests (old emails, the consent-preferences form) still work —
    // unsubscribes must never be blocked outright — but are throttled so a
    // griefer can't bulk-suppress the subscriber list by posting raw emails.
    const signedLink = await verifyUnsubscribeSig(normalised, typeof sig === "string" ? sig : null);
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

// A plain GET on the List-Unsubscribe URL (a mail client opening it in a
// browser, or a link scanner prefetching it) must not unsubscribe anyone on its
// own — RFC 8058. Send it to the confirmation page, which does the POST.
export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams;
  const target = new URL("/unsubscribe", request.url);
  for (const k of ["email", "sig"]) {
    const v = q.get(k);
    if (v) target.searchParams.set(k, v);
  }
  return NextResponse.redirect(target, 303);
}

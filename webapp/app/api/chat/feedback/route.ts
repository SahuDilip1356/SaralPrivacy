// 👍/👎 + failure-turn logging (decisions D2 — redacted, failures only).
// Question text is stored ONLY when failureKind is set, and only after
// redact(). Successful turns store the boolean signal alone.

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { rateLimit, getClientIp } from "@/lib/abuseGuard";
import { redactText } from "@/lib/chat/redact";

const FAILURE_KINDS = ["refusal", "low_confidence", "thumbs_down"] as const;
type FailureKind = (typeof FAILURE_KINDS)[number];

export async function POST(request: NextRequest) {
  const rl = rateLimit(`chat-fb:${getClientIp(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  const turnId = typeof body.turnId === "string" ? body.turnId.slice(0, 64) : "";
  if (!sessionId || !turnId) {
    return NextResponse.json({ error: "sessionId and turnId are required." }, { status: 400 });
  }

  const failureKind = FAILURE_KINDS.includes(body.failureKind as FailureKind)
    ? (body.failureKind as FailureKind)
    : undefined;

  const doc = {
    sessionId,
    turnId,
    helpful: typeof body.helpful === "boolean" ? body.helpful : null,
    reason: typeof body.reason === "string" ? body.reason.slice(0, 500) : null,
    pageUrl: typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 200) : null,
    failureKind: failureKind ?? null,
    // D2: question text only on failure turns, always redacted.
    redactedQuestion:
      failureKind && typeof body.question === "string"
        ? redactText(body.question.slice(0, 2000))
        : null,
    ts: new Date().toISOString(),
  };

  try {
    await databases.createDocument(DB_ID, COLLECTIONS.CHAT_FEEDBACK, ID.unique(), doc);
    return NextResponse.json({ stored: true });
  } catch (err) {
    // Missing collection or transient Appwrite failure must never break chat UX.
    console.error("chat_feedback store failed:", (err as Error).message);
    return NextResponse.json({ stored: false });
  }
}

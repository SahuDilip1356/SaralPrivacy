import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";

const EVENT_NAMES = [
  "notice_builder_started", "business_type_selected", "data_categories_confirmed",
  "purpose_matrix_completed", "collection_contexts_selected", "notice_preview_generated",
  "notice_score_calculated", "notice_lead_captured", "notice_pdf_downloaded",
  "notice_html_copied", "mini_notice_copied", "consent_block_copied",
  "dsar_cta_clicked", "notice_evidence_record_created",
] as const;

// Only non-PII fields are accepted into the payload.
const Body = z.object({
  name: z.enum(EVENT_NAMES),
  session_id: z.string().max(64).optional().default(""),
  sector: z.string().max(80).optional(),
  score: z.number().int().min(0).max(100).optional(),
  context: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(`notice-events:${getClientIp(request)}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: true }); // silently drop floods

  try {
    const parsed = Body.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: true }); // drop unknown events, don't error the client
    const { name, session_id, ...rest } = parsed.data;

    await databases.createDocument(DB_ID, COLLECTIONS.NOTICE_EVENTS, ID.unique(), {
      name,
      session_id,
      payload: JSON.stringify(rest),
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("notice events error:", error);
    return NextResponse.json({ ok: true }); // analytics must never break UX
  }
}

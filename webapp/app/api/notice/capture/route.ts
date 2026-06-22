import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendNoticeLeadAlert } from "@/lib/email";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";

const Body = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().default(""),
  business_name: z.string().max(160).optional().default(""),
  sector: z.string().max(80).optional().default(""),
  readiness_score: z.number().int().min(0).max(100).optional(),
  export_type: z.enum(["pdf", "copy", "pack"]).optional(),
  source: z.string().max(60).optional().default("notice-generator"),
  consent: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(`notice-capture:${getClientIp(request)}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const raw = await request.json();
    // Honeypot: bots fill the hidden field. Pretend success, store nothing.
    if (isHoneypotTripped(raw)) return NextResponse.json({ success: true });

    const parsed = Body.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or fields." }, { status: 400 });
    }
    const b = parsed.data;

    const ip = getClientIp(request);
    const city = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";

    await databases.createDocument(DB_ID, COLLECTIONS.NOTICE_CAPTURES, ID.unique(), {
      email: b.email,
      name: b.name || b.email.split("@")[0],
      business_name: b.business_name,
      sector: b.sector,
      readiness_score: b.readiness_score ?? 0,
      export_type: b.export_type || "",
      source: b.source,
      consent: b.consent,
      ip_address: ip,
      city,
      country,
      created_at: new Date().toISOString(),
    });

    // Fire-and-forget founder alert — never block the response.
    sendNoticeLeadAlert({
      email: b.email,
      business_name: b.business_name,
      sector: b.sector,
      readiness_score: b.readiness_score,
      export_type: b.export_type,
    }).catch((err) => console.error("sendNoticeLeadAlert error:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("notice capture error:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

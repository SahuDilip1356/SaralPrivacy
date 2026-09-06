import { NextRequest, NextResponse } from "next/server";
import { queryDocuments } from "@/lib/db";
import { requireRole } from "@/lib/adminSession";

async function count(status?: string): Promise<number> {
  const res = await queryDocuments("outreach_contacts", {
    where: status ? [{ field: "status", value: status }] : [],
    limit: 1,
  });
  return res.total;
}

export async function GET(request: NextRequest) {
  // Campaign metrics are internal — admin only.
  if (!(await requireRole(request, ["admin"]))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [total, pending, sent, subscribed, bounced, unsubscribed, complained] =
      await Promise.all([
        count(),
        count("pending"),
        count("sent"),
        count("subscribed"),
        count("bounced"),
        count("unsubscribed"),
        count("complained"),
      ]);

    return NextResponse.json({ total, pending, sent, subscribed, bounced, unsubscribed, complained });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

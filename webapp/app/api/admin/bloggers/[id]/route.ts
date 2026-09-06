import { NextRequest, NextResponse } from "next/server";

import { getDocumentById, updateDocumentById, deleteDocumentById } from "@/lib/db";
import { requireRole } from "@/lib/adminSession";
import { setAuthUserBanned, deleteAuthUserByEmail } from "@/lib/auth/adminAuth";

async function adminOnly(req: NextRequest): Promise<boolean> {
  return (await requireRole(req, ["admin"])) !== null;
}

function emailOf(doc: Record<string, unknown> | null): string | null {
  const e = doc?.email;
  return typeof e === "string" && e ? e.toLowerCase() : null;
}

// PATCH /api/admin/bloggers/[id] — revoke (active:false) or restore (active:true)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { active } = await req.json();

  try {
    const doc = await getDocumentById("blogger_accounts", id);
    await updateDocumentById("blogger_accounts", id, { active: active === true, invite_token: "" });
    // Close the Supabase side too. Login already gates on `active`; this is belt and braces.
    const email = emailOf(doc);
    if (email) {
      await setAuthUserBanned(email, active !== true).catch((err) =>
        console.error("[bloggers] ban/unban failed:", err instanceof Error ? err.message : err)
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bloggers] PATCH failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/bloggers/[id] — permanently remove blogger account (directory row + auth user)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const doc = await getDocumentById("blogger_accounts", id);
    const email = emailOf(doc);
    if (email) await deleteAuthUserByEmail(email);
    await deleteDocumentById("blogger_accounts", id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bloggers] DELETE failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

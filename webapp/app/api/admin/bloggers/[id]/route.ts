import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS } from "@/lib/appwrite";
import { requireRole } from "@/lib/adminSession";

async function adminOnly(req: NextRequest): Promise<boolean> {
  return (await requireRole(req, ["admin"])) !== null;
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
    await databases.updateDocument(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, id, { active });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bloggers] PATCH failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/bloggers/[id] — permanently remove blogger account
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await databases.deleteDocument(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bloggers] DELETE failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

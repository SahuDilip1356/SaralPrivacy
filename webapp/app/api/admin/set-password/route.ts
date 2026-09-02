import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryDocuments, updateDocumentById } from "@/lib/db";


// POST /api/admin/set-password — validate invite token and activate blogger account
export async function POST(req: NextRequest) {
  const { email, token, password } = await req.json();

  if (!email || !token || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  try {
    const result = await queryDocuments("blogger_accounts", {
      where: [{ field: "email", value: normalised }],
    });

    if (result.total === 0) {
      return NextResponse.json({ error: "Invalid invite link." }, { status: 404 });
    }

    const doc = result.docs[0] as Record<string, any> & { id: string };

    // Validate token
    if (!doc.invite_token || doc.invite_token !== token) {
      return NextResponse.json({ error: "Invalid or already-used invite link." }, { status: 401 });
    }

    // Check expiry
    if (new Date(doc.token_expires) < new Date()) {
      return NextResponse.json(
        { error: "This invite link has expired. Please ask the admin to send a new invite." },
        { status: 401 }
      );
    }

    // Hash and save password — activate account
    const password_hash = await bcrypt.hash(password, 12);
    await updateDocumentById("blogger_accounts", doc.id, {
      password_hash,
      active:        true,
      invite_token:  "",
      token_expires: "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[set-password] failed:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

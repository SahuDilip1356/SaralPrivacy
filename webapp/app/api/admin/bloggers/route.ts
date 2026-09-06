import { NextRequest, NextResponse } from "next/server";

import { insertDocument, queryDocuments } from "@/lib/db";
import { sendBloggerInvite } from "@/lib/email";
import { requireRole } from "@/lib/adminSession";
import { createInvite, findAuthUserIdByEmail } from "@/lib/auth/adminAuth";

async function adminOnly(req: NextRequest): Promise<boolean> {
  return (await requireRole(req, ["admin"])) !== null;
}

// GET /api/admin/bloggers — list all blogger accounts
export async function GET(req: NextRequest) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await queryDocuments("blogger_accounts", {
      orderBy: { field: "$createdAt", dir: "desc" },
      limit: 100,
    });
    return NextResponse.json({ bloggers: result.docs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/bloggers — invite a new blogger.
// P3: the account lives in Supabase Auth (role claim = blogger); the invite is
// a Supabase invite link that WE email. ops.blogger_accounts keeps the
// directory row (name, bio, active) the admin list and blog bylines use.
export async function POST(req: NextRequest) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, bio } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  }

  const normalised = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();

  // Check for duplicate (directory row or auth user)
  try {
    const existing = await queryDocuments("blogger_accounts", {
      where: [{ field: "email", value: normalised }],
    });
    if (existing.total > 0 || (await findAuthUserIdByEmail(normalised))) {
      return NextResponse.json({ error: "A blogger with this email already exists." }, { status: 409 });
    }
  } catch (err) {
    console.error("[bloggers] duplicate check failed:", err instanceof Error ? err.message : err);
  }

  let invite: { userId: string; url: string };
  try {
    invite = await createInvite({ email: normalised, name: cleanName, role: "blogger" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[bloggers] createInvite failed:", msg);
    return NextResponse.json({ error: "Could not create the invite." }, { status: 500 });
  }

  const newBloggerId = await insertDocument("blogger_accounts", {
    email:         normalised,
    name:          cleanName,
    bio:           (bio || "").trim(),
    password_hash: "",          // P3: passwords live in Supabase Auth
    active:        false,       // flips to true when they complete the invite
    invite_token:  "pending",   // state marker for the admin list, not a secret
    token_expires: "",
    created_at:    new Date().toISOString(),
  });

  // Send invite email (best-effort — return invite URL regardless so admin can share manually if email fails)
  const emailResult = await sendBloggerInvite({
    email: normalised, name: cleanName, inviteUrl: invite.url, role: "blogger",
  });

  return NextResponse.json({
    success:      true,
    id:           newBloggerId,
    inviteUrl:    invite.url,
    emailSent:    emailResult.success,
    emailError:   emailResult.error ?? null,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { databases, DB_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { sendBloggerInvite } from "@/lib/email";
import { requireRole } from "@/lib/adminSession";

const SITE_URL         = (process.env.NEXT_PUBLIC_SITE_URL || "https://saralprivacy.com").trim();
const TOKEN_EXPIRY_HOURS = 72;

async function adminOnly(req: NextRequest): Promise<boolean> {
  return (await requireRole(req, ["admin"])) !== null;
}

// GET /api/admin/bloggers — list all blogger accounts
export async function GET(req: NextRequest) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return NextResponse.json({ bloggers: result.documents });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/bloggers — invite a new blogger
export async function POST(req: NextRequest) {
  if (!(await adminOnly(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, bio } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // Check for duplicate
  try {
    const existing = await databases.listDocuments(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, [
      Query.equal("email", normalised),
    ]);
    if (existing.total > 0) {
      return NextResponse.json({ error: "A blogger with this email already exists." }, { status: 409 });
    }
  } catch { /* ignore — collection may be empty */ }

  // Generate invite token (72h expiry)
  const token   = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const doc = await databases.createDocument(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, ID.unique(), {
    email:         normalised,
    name:          name.trim(),
    bio:           (bio || "").trim(),
    password_hash: "",
    active:        false,
    invite_token:  token,
    token_expires: expires,
    created_at:    new Date().toISOString(),
  });

  const inviteUrl = `${SITE_URL}/admin/set-password?token=${token}&email=${encodeURIComponent(normalised)}`;

  // Send invite email (best-effort — return invite URL regardless so admin can share manually if email fails)
  const emailResult = await sendBloggerInvite({ email: normalised, name: name.trim(), inviteUrl });

  return NextResponse.json({
    success:      true,
    id:           doc.$id,
    inviteUrl,
    emailSent:    emailResult.success,
    emailError:   emailResult.error ?? null,
  });
}

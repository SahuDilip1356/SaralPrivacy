import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || "dilip.sahu@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();

const IS_PROD = process.env.NODE_ENV === "production";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function makeCookie(sessionValue: string): string {
  return [
    `admin_session=${sessionValue}`,
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE}`,
    "Path=/",
    IS_PROD ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // ── Admin check (env-based) ───────────────────────────────────────────────
  if (normalised === ADMIN_EMAIL) {
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    return new NextResponse(JSON.stringify({ success: true, role: "admin" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": makeCookie("authenticated"),
      },
    });
  }

  // ── Blogger check (Appwrite collection + bcrypt) ──────────────────────────
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, [
      Query.equal("email", normalised),
      Query.equal("active", true),
    ]);

    if (result.total > 0) {
      const blogger = result.documents[0];
      const match   = blogger.password_hash
        ? await bcrypt.compare(password, blogger.password_hash)
        : false;

      if (match) {
        return new NextResponse(
          JSON.stringify({ success: true, role: "blogger", name: blogger.name }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": makeCookie("blogger"),
            },
          }
        );
      }
      // Blogger exists but wrong password — give specific error
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
  } catch (err) {
    console.error("[login] Blogger lookup failed:", err);
  }

  return NextResponse.json({ error: "Access denied." }, { status: 403 });
}

export async function DELETE() {
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "admin_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/",
    },
  });
}

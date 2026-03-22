import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EMAIL  = (process.env.ADMIN_EMAIL   || "dilip.sahu@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();
const IS_PROD        = process.env.NODE_ENV === "production";
const MAX_AGE        = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const cookieValue = [
    `admin_session=authenticated`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${MAX_AGE}`,
    `Path=/`,
    IS_PROD ? "Secure" : "",
  ].filter(Boolean).join("; ");

  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieValue,
    },
  });
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

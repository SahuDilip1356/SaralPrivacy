import { NextRequest, NextResponse } from "next/server";

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const APPWRITE_PROJECT  = process.env.APPWRITE_PROJECT_ID!;
const ALLOWED_EMAIL     = process.env.ADMIN_EMAIL || "dilip.sahu@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Only allow the designated admin email
    if (email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Authenticate via Appwrite Sessions API
    const appwriteRes = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method:  "POST",
      headers: {
        "Content-Type":    "application/json",
        "X-Appwrite-Project": APPWRITE_PROJECT,
      },
      body: JSON.stringify({ email, password }),
    });

    const appwriteData = await appwriteRes.json();

    if (!appwriteRes.ok) {
      const msg = appwriteData?.message || "Invalid credentials.";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // Appwrite session created — set our own httpOnly session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 8, // 8 hours
      path:     "/",
    });
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}

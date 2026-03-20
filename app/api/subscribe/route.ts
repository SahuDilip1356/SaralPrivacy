import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, industry, frequency, consentEmail } = body;

    if (!name || !email || !consentEmail) {
      return NextResponse.json({ error: "Name, email, and email consent are required." }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const subscriberData = {
      name,
      email,
      industry:         industry || "",
      frequency:        frequency || "weekly",
      consent_version:  PRIVACY_NOTICE_VERSION,
      user_agent:       request.headers.get("user-agent") || "",
      created_at:       new Date().toISOString(),
    };

    await databases.createDocument(DB_ID, COLLECTIONS.SUBSCRIBERS, ID.unique(), subscriberData);

    // Fire-and-forget welcome email — do not block the response
    sendWelcomeEmail({ name, email }).catch((err) =>
      console.error("sendWelcomeEmail error:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Subscription successful. Check your inbox for confirmation.",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

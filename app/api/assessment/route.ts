import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendAssessmentAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, industry, riskLevel, scores } = body;

    if (!email || !industry || !riskLevel) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const city    = request.headers.get("x-vercel-ip-city") || "";
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region  = request.headers.get("x-vercel-ip-country-region") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const assessmentData = {
      email,
      industry,
      risk_level:           riskLevel,
      applicability_score:  scores?.applicability || 0,
      maturity_score:       scores?.maturity || 0,
      risk_score:           scores?.risk || 0,
      urgency_score:        scores?.urgency || 0,
      overall_score:        scores?.overall || 0,
      created_at:           new Date().toISOString(),
      ip_address:           ip,
      city,
      country,
      region,
    };

    await databases.createDocument(DB_ID, COLLECTIONS.ASSESSMENTS, ID.unique(), assessmentData);

    // Write consent log entry
    const timestamp = new Date().toISOString();
    databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
      email,
      source:          "assessment",
      consent_type:    "data_processing",
      consent_value:   true,
      privacy_version: PRIVACY_NOTICE_VERSION,
      ip_address:      ip,
      user_agent:      userAgent,
      city,
      country,
      region,
      timestamp,
    }).catch((err) => console.error("consent_log write error:", err));

    // Fire-and-forget admin alert — do not block the response
    sendAssessmentAlert(assessmentData).catch((err) =>
      console.error("sendAssessmentAlert error:", err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assessment save error:", error);
    return NextResponse.json({ error: "Failed to save assessment." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendConsultationAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, workEmail, mobileNumber, companyName, industry, companySize, issueSummary, preferredContact, preferredTime, consentContact } = body;

    if (!fullName || !workEmail || !companyName || !issueSummary || !consentContact) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const city    = request.headers.get("x-vercel-ip-city") || "";
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region  = request.headers.get("x-vercel-ip-country-region") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const leadData = {
      name:              fullName,
      email:             workEmail,
      phone:             mobileNumber || "",
      company:           companyName,
      industry:          industry || "",
      company_size:      companySize || "",
      source:            "consultation",
      issue_summary:     issueSummary,
      preferred_contact: preferredContact || "",
      preferred_time:    preferredTime || "",
      consent_version:   PRIVACY_NOTICE_VERSION,
      risk_level:        "",
      created_at:        new Date().toISOString(),
      ip_address:        ip,
      city,
      country,
      region,
    };

    await databases.createDocument(DB_ID, COLLECTIONS.LEADS, ID.unique(), leadData);

    // Write consent log entry
    const timestamp = new Date().toISOString();
    databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
      email:           workEmail,
      name:            fullName,
      source:          "contact",
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
    sendConsultationAlert(leadData).catch((err) =>
      console.error("sendConsultationAlert error:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Your consultation request has been received. We will respond within one business day.",
    });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

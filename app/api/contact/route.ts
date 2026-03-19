import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, workEmail, mobileNumber, companyName, industry, companySize, issueSummary, preferredContact, preferredTime, consentContact } = body;

    if (!fullName || !workEmail || !companyName || !issueSummary || !consentContact) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    await databases.createDocument(DB_ID, COLLECTIONS.LEADS, ID.unique(), {
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
    });

    return NextResponse.json({
      success: true,
      message: "Your consultation request has been received. We will respond within one business day.",
    });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

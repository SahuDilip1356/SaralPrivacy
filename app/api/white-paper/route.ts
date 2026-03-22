import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID, getFileDownloadUrl } from "@/lib/appwrite";
import { sendDownloadAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, workEmail, companyName, industry, companySize } = body;

    if (!fullName || !workEmail || !companyName || !industry || !companySize) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const city    = request.headers.get("x-vercel-ip-city") || "";
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region  = request.headers.get("x-vercel-ip-country-region") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const downloadData = {
      name:              fullName,
      email:             workEmail,
      phone:             body.phone || "",
      company:           companyName,
      industry,
      company_size:      companySize,
      consent_email:     body.consentEmail || false,
      consent_phone:     body.consentPhone || false,
      consent_webinars:  body.consentWebinars || false,
      privacy_version:   PRIVACY_NOTICE_VERSION,
      downloaded_at:     new Date().toISOString(),
      ip_address:        ip,
      city,
      country,
      region,
    };

    await databases.createDocument(DB_ID, COLLECTIONS.DOWNLOADS, ID.unique(), downloadData);

    // Write consent log entries — one per consent type checked
    const timestamp = new Date().toISOString();
    const consentEntries: Promise<any>[] = [];

    if (body.consentEmail) {
      consentEntries.push(
        databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
          email:           workEmail,
          name:            fullName,
          source:          "download",
          consent_type:    "email_marketing",
          consent_value:   true,
          privacy_version: PRIVACY_NOTICE_VERSION,
          ip_address:      ip,
          user_agent:      userAgent,
          city,
          country,
          region,
          timestamp,
        })
      );
    }

    if (body.consentPhone) {
      consentEntries.push(
        databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
          email:           workEmail,
          name:            fullName,
          source:          "download",
          consent_type:    "phone_contact",
          consent_value:   true,
          privacy_version: PRIVACY_NOTICE_VERSION,
          ip_address:      ip,
          user_agent:      userAgent,
          city,
          country,
          region,
          timestamp,
        })
      );
    }

    if (body.consentWebinars) {
      consentEntries.push(
        databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
          email:           workEmail,
          name:            fullName,
          source:          "download",
          consent_type:    "webinars",
          consent_value:   true,
          privacy_version: PRIVACY_NOTICE_VERSION,
          ip_address:      ip,
          user_agent:      userAgent,
          city,
          country,
          region,
          timestamp,
        })
      );
    }

    if (consentEntries.length > 0) {
      Promise.all(consentEntries).catch((err) => console.error("consent_log write error:", err));
    }

    // Fire-and-forget admin alert — do not block the response
    sendDownloadAlert(downloadData).catch((err) =>
      console.error("sendDownloadAlert error:", err)
    );

    // Use Appwrite Storage URL when file has been uploaded, else fallback to public asset
    const fileId      = (process.env.APPWRITE_WHITE_PAPER_FILE_ID || "").trim();
    const downloadUrl = fileId
      ? getFileDownloadUrl(fileId)
      : "/assets/dpdpa-white-paper-2025.pdf";

    return NextResponse.json({
      success: true,
      downloadUrl,
      message: "Download ready. We have also sent a link to your email.",
    });
  } catch (error) {
    console.error("White paper error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

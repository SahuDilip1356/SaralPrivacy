import { NextRequest, NextResponse } from "next/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendDownloadAlert } from "@/lib/email";
import { upsertSubscriber } from "@/lib/subscribers";
import { getLanguage, getPdfUrl, DEFAULT_LANG_CODE } from "@/lib/data/guide-languages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, workEmail, companyName, industry, companySize } = body;
    // Resolve the requested language, falling back to English for anything unknown.
    const language = getLanguage(body.language).code;

    if (!fullName || !workEmail || !companyName || !industry || !companySize) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
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
      language,
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

    // Resilient write: if the `language` attribute hasn't been added to the
    // DOWNLOADS collection yet, Appwrite rejects the whole document. Retry once
    // without it so the lead is never lost (language segmentation degrades, the
    // download does not). Remove the fallback once the attr exists everywhere.
    try {
      await databases.createDocument(DB_ID, COLLECTIONS.DOWNLOADS, ID.unique(), downloadData);
    } catch (writeErr) {
      console.error("downloads write with language failed, retrying without:", writeErr);
      const { language: _omit, ...legacy } = downloadData;
      await databases.createDocument(DB_ID, COLLECTIONS.DOWNLOADS, ID.unique(), legacy);
    }

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

    // Create subscriber if user consented to email briefings
    if (body.consentEmail) {
      upsertSubscriber({
        email:    workEmail,
        name:     fullName,
        industry,
        source:   "whitepaper_form",
        ip, userAgent, city, country, region,
      }).catch((err) => console.error("upsertSubscriber whitepaper:", err));
    }

    // Per-language PDF (Vercel Blob, or the in-repo English asset). Falls back to
    // the English file for any language whose PDF isn't published yet.
    const downloadUrl = getPdfUrl(language);

    return NextResponse.json({
      success: true,
      downloadUrl,
      language,
      partial: getLanguage(language).pdfUrl === null && language !== DEFAULT_LANG_CODE,
      message: "Download ready.",
    });
  } catch (error) {
    console.error("White paper error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

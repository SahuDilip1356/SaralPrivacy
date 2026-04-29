import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { upsertSubscriber } from "@/lib/subscribers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      employees,
      contactName,
      phone,
      consentContact,
      consentBriefings,
      templateName,
      reportToken,
      email,
      source,
    } = body;

    if (!businessName || !contactName || !phone || !employees) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";

    await databases.createDocument(DB_ID, COLLECTIONS.TEMPLATE_DOWNLOADS, ID.unique(), {
      business_name:   businessName,
      employees,
      contact_name:    contactName,
      phone,
      email:           email || "",
      template_name:   templateName || "",
      consent_contact: consentContact ?? false,
      report_token:    reportToken || "",
      source:          source || "report_page",
      ip_address:      ip,
      city,
      country,
      created_at:      new Date().toISOString(),
    });

    // Create subscriber if user opted in to daily briefings
    if (consentBriefings && email) {
      upsertSubscriber({
        email,
        name:   contactName,
        source: "template_form",
        ip,
        city,
        country,
      }).catch((err) => console.error("upsertSubscriber template:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[template-download]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

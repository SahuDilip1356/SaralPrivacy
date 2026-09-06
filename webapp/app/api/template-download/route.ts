import { NextRequest, NextResponse } from "next/server";
import { insertDocument } from "@/lib/db";
import { upsertSubscriber } from "@/lib/subscribers";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";
import { sendDiscoveryInventory, sendDiscoveryLeadAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
  // Rate-limit per IP (also hardens the existing template downloads).
  const rl = rateLimit(`tmpl:${getClientIp(request)}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const body = await request.json();

    // Honeypot: bots fill the hidden field. Pretend success, store nothing.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

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
      inventoryCsv, // discovery only: data-inventory CSV to email the user
      nicheName,    // discovery only: friendly business-type name
    } = body;

    if (!businessName || !contactName || !phone || !employees) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const ip      = getClientIp(request);
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";
    const isDiscovery = source === "discovery";

    await insertDocument("template_downloads", {
      business_name:   businessName,
      employees,
      contact_name:    contactName,
      phone,
      email:           email || "",
      template_name:   templateName || "",
      consent_contact: consentContact ?? false,
      report_token:    reportToken || "", // discovery: stores the niche id
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

    // Discovery: email the user their inventory + alert admin (fire-and-forget;
    // the user already has the file via client-side download).
    if (isDiscovery) {
      const niceName = nicheName || "your business";
      if (email && inventoryCsv) {
        sendDiscoveryInventory({ to: email, name: contactName, nicheName: niceName, csv: inventoryCsv })
          .catch((err) => console.error("sendDiscoveryInventory:", err));
      }
      sendDiscoveryLeadAlert({
        name: contactName, businessName, email: email || "", phone,
        employees, nicheName: niceName, city, country,
      }).catch((err) => console.error("sendDiscoveryLeadAlert:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[template-download]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

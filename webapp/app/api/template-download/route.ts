import { NextRequest, NextResponse } from "next/server";
import { insertDocument } from "@/lib/db";
import { upsertSubscriber } from "@/lib/subscribers";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";
import { sendDiscoveryInventory, sendDiscoveryLeadAlert } from "@/lib/email";
import { overDurableLimit, normalizeEmail } from "@/lib/templates/downloadLimits";
import { packFromInput } from "@/lib/discovery/pack";
import { buildPackCsv } from "@/lib/discovery/pack-csv";
import { getNiche } from "@/lib/discovery/data";

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
      reportToken,  // discovery: the niche id
      source,
      selectedIds,  // discovery only: confirmed item ids
      answers,      // discovery only: the three control answers
    } = body;
    // Client-sent CSV text and display names are deliberately ignored: this
    // route emails the address it's given, so everything in that email must
    // come from us, not the request.
    const email = normalizeEmail(body.email);

    if (!businessName || !contactName || !phone || !employees) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const ip      = getClientIp(request);
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";
    const isDiscovery = source === "discovery";

    // Discovery: rebuild the pack from the taxonomy. A page cached before this
    // change sends no selectedIds; that visitor still gets the client-side
    // download and the lead is kept — we just don't email them a CSV.
    const pack = isDiscovery ? packFromInput(reportToken, selectedIds, answers) : null;
    if (isDiscovery && !pack) {
      console.warn("[template-download] discovery pack did not resolve; skipping inventory email");
    }

    // Recipient cap only where we email the user (discovery); IP cap always.
    if (await overDurableLimit(ip, pack ? email : "")) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    await insertDocument("template_downloads", {
      business_name:   businessName,
      employees,
      contact_name:    contactName,
      phone,
      email,
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
      if (pack && email) {
        const csv = buildPackCsv(pack.register, pack.nicheName);
        sendDiscoveryInventory({ to: email, name: contactName, nicheName: pack.nicheName, csv })
          .catch((err) => console.error("sendDiscoveryInventory:", err));
      }
      const nicheName =
        pack?.nicheName ?? (typeof reportToken === "string" && getNiche(reportToken)?.name) ?? "Unknown";
      sendDiscoveryLeadAlert({
        name: contactName, businessName, email, phone,
        employees, nicheName: nicheName || "Unknown", city, country,
      }).catch((err) => console.error("sendDiscoveryLeadAlert:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[template-download]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

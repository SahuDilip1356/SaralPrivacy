import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { TemplateDownloadFormSchema, templateNames, formatPhoneNumber } from "@/lib/templates/validation";
import { Resend } from "resend";
import twilio from "twilio";
import { list } from "@vercel/blob";

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TEMPLATE_BLOB_PREFIX = "dpdpa-templates/";

async function getTemplateUrl(templateId: string): Promise<string> {
  try {
    const blobs = await list({ prefix: `${TEMPLATE_BLOB_PREFIX}${templateId}` });
    if (blobs.blobs.length === 0) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return blobs.blobs[0].url;
  } catch (error) {
    console.error("Error getting template URL:", error);
    throw new Error("Failed to retrieve template");
  }
}

async function sendTemplateEmail(props: {
  email: string;
  contactPersonName: string;
  businessName: string;
  templateName: string;
  templateId: string;
  downloadUrl: string;
  consentBriefings: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: "templates@saralprivacy.com",
      to: props.email,
      subject: `Your ${props.templateName} is Ready to Download`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .templates-list { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 6px; }
    .templates-list li { margin: 8px 0; }
    .unsubscribe { font-size: 12px; color: #999; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your DPDPA Template is Ready</h1>
    <p>Hi ${props.contactPersonName},</p>
    <p>Your <strong>${props.templateName}</strong> for <strong>${props.businessName}</strong> is ready to download!</p>

    <a href="${props.downloadUrl}" class="button">Download Template</a>

    <h3>Other Available Templates:</h3>
    <div class="templates-list">
      <ul>
        <li><strong>Data Processing Agreement</strong> - For vendor/partner data handling</li>
        <li><strong>Privacy Policy</strong> - Website and app privacy disclosures</li>
        <li><strong>Employee Data Policy</strong> - Internal employee data handling</li>
        <li><strong>Vendor Data Agreement</strong> - Third-party data processing agreements</li>
        <li><strong>User Consent Form</strong> - Explicit user consent collection</li>
      </ul>
    </div>

    <p>If you have any questions about your template, reply to this email.</p>

    ${
      props.consentBriefings
        ? '<p><strong>You\'re subscribed to daily DPDPA briefings</strong> – check your inbox tomorrow for insights on compliance.</p>'
        : ''
    }

    <div class="unsubscribe">
      <p>You received this email because you downloaded a template from SaralPrivacy. <a href="#">Unsubscribe</a> if you prefer not to receive emails.</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

async function sendTemplateWhatsApp(props: {
  phoneNumber: string;
  contactPersonName: string;
  businessName: string;
  templateName: string;
  downloadUrl: string;
}): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const message = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${props.phoneNumber}`,
      body: `Hi ${props.contactPersonName}!\n\nYour ${props.templateName} for ${props.businessName} is ready!\n\nDownload here: ${props.downloadUrl}\n\nSaralPrivacy DPDPA Templates`,
    });

    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send WhatsApp",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TemplateDownloadFormSchema.parse(body);

    // Get template URL from Vercel Blob
    const downloadUrl = await getTemplateUrl(validated.templateSelected);

    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(validated.phoneNumber);

    // Save to Appwrite
    await databases.createDocument(
      DB_ID,
      COLLECTIONS.TEMPLATE_DOWNLOADS,
      ID.unique(),
      {
        contact_email: validated.email,
        contact_person: validated.contactPersonName,
        business_name: validated.businessName,
        template_selected: validated.templateSelected,
        phone_number: formattedPhone,
        consent_contact: validated.consentContact,
        consent_briefings: validated.consentBriefings,
        created_at: new Date().toISOString(),
        source: request.headers.get("referer") || "direct",
      }
    );

    // Send email (required)
    const emailResult = await sendTemplateEmail({
      email: validated.email,
      contactPersonName: validated.contactPersonName,
      businessName: validated.businessName,
      templateName: templateNames[validated.templateSelected],
      templateId: validated.templateSelected,
      downloadUrl,
      consentBriefings: validated.consentBriefings,
    });

    // Send WhatsApp (non-fatal if it fails)
    let whatsappResult = { success: false };
    if (validated.consentContact) {
      whatsappResult = await sendTemplateWhatsApp({
        phoneNumber: formattedPhone,
        contactPersonName: validated.contactPersonName,
        businessName: validated.businessName,
        templateName: templateNames[validated.templateSelected],
        downloadUrl,
      });
    }

    // If email failed, return error
    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send template via email", error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template ready for download",
      downloadUrl,
      email: emailResult.success,
      whatsapp: whatsappResult.success,
    });
  } catch (error) {
    console.error("Template download error:", error);

    if (error instanceof Error && error.message.includes("Validation failed")) {
      return NextResponse.json(
        { message: "Invalid form data", error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

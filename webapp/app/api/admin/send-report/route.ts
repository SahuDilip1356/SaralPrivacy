import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS } from "@/lib/appwrite";
import { sendSurveyResultEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  // Auth check
  const session = request.cookies.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assessmentId } = await request.json();
    if (!assessmentId) {
      return NextResponse.json({ error: "assessmentId is required" }, { status: 400 });
    }

    // Fetch the assessment document
    const doc = await databases.getDocument(DB_ID, COLLECTIONS.ASSESSMENTS, assessmentId);

    if (!doc.email) {
      return NextResponse.json({ error: "Assessment has no email address" }, { status: 400 });
    }

    // Parse stored JSON fields
    let immediateActions: string[] = [];
    let redFlags: string[] = [];
    try { immediateActions = JSON.parse(doc.immediate_actions_json || "[]"); } catch { /* noop */ }
    try { redFlags        = JSON.parse(doc.red_flags_json || "[]");          } catch { /* noop */ }

    // Find the verdict description from the band
    const BAND_DESCRIPTIONS: Record<string, string> = {
      "Not Started":           "Your business shows high exposure or very weak controls. Immediate action is needed on the fundamentals before your risk compounds.",
      "Early Stage":           "You have some awareness of DPDPA obligations but important gaps remain. A focused 30-day effort will close most of the critical gaps.",
      "Building Foundations":  "Basic elements exist but are not applied consistently across your business. Focus on ownership, consent, and operational readiness.",
      "Progressing Well":      "Good momentum and some operational maturity. Tighten documentation, vendor controls, and test your incident response.",
      "Operationally Strong":  "Strong readiness signals across most areas. Your controls are well above average for Indian MSMEs.",
    };

    const result = await sendSurveyResultEmail({
      email:         doc.email,
      name:          doc.name          || "",
      businessName:  doc.business_name || "",
      score:         doc.final_score   || doc.overall_score || 0,
      band:          doc.verdict_band  || "Early Stage",
      summary:       BAND_DESCRIPTIONS[doc.verdict_band] || "",
      recommendations: immediateActions,
      riskFlags:     redFlags,
      answerSummary: [], // raw answers not stored in Appwrite; omitted from admin-triggered email
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Email failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[admin/send-report] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

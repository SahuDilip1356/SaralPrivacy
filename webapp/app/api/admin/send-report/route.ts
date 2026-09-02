import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS } from "@/lib/appwrite";
import { sendSurveyResultEmail } from "@/lib/email";
import { requireRole } from "@/lib/adminSession";

export async function POST(request: NextRequest) {
  // Auth check — signature-verified session, admin role only
  const session = await requireRole(request, ["admin"]);
  if (!session) {
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
    let answers: Record<string, unknown> = {};
    let categoryScores: Record<string, number> = {};
    try { immediateActions = JSON.parse(doc.immediate_actions_json || "[]"); } catch { /* noop */ }
    try { redFlags         = JSON.parse(doc.red_flags_json          || "[]"); } catch { /* noop */ }
    try { answers          = JSON.parse(doc.answers_json            || "{}"); } catch { /* noop */ }
    try { categoryScores   = JSON.parse(doc.category_scores_json    || "{}"); } catch { /* noop */ }

    // Rebuild answer summary from stored answers
    const { QUESTIONS } = await import("@/lib/data/dpdpa-assessment");
    const answerSummary: Array<{ question: string; answer: string }> = [];
    for (const q of QUESTIONS) {
      const val = answers[q.key as keyof typeof answers];
      if (!val) continue;
      if (Array.isArray(val)) {
        const texts = (val as string[]).map((id) => q.options.find((o) => o.id === id)?.text).filter(Boolean) as string[];
        if (texts.length) answerSummary.push({ question: q.text, answer: texts.join(", ") });
      } else {
        const opt = q.options.find((o) => o.id === val);
        if (opt) answerSummary.push({ question: q.text, answer: opt.text });
      }
    }

    const BAND_DESCRIPTIONS: Record<string, string> = {
      "Not Started":           "Your business shows high exposure or very weak controls. Immediate action is needed on the fundamentals before your risk compounds.",
      "Early Stage":           "You have some awareness of DPDPA obligations but important gaps remain. A focused 30-day effort will close most of the critical gaps.",
      "Building Foundations":  "Basic elements exist but are not applied consistently across your business. Focus on ownership, consent, and operational readiness.",
      "Progressing Well":      "Good momentum and some operational maturity. Tighten documentation, vendor controls, and test your incident response.",
      "Operationally Strong":  "Strong readiness signals across most areas. Your controls are well above average for Indian MSMEs.",
    };

    const emailResult = await sendSurveyResultEmail({
      email:           doc.email,
      name:            doc.name          || "",
      businessName:    doc.business_name || "",
      score:           doc.final_score   || doc.overall_score || 0,
      band:            doc.verdict_band  || "Early Stage",
      summary:         BAND_DESCRIPTIONS[doc.verdict_band] || "",
      recommendations: immediateActions,
      riskFlags:       redFlags,
      answerSummary,
      reportToken:     doc.report_token  || "",
      categoryScores: {
        noticeConsent:       categoryScores.noticeConsent       ?? 0,
        accessControl:       categoryScores.accessControl       ?? 0,
        retentionDeletion:   categoryScores.retentionDeletion   ?? 0,
        ownershipGovernance: categoryScores.ownershipGovernance ?? 0,
        vendorPartnerRisk:   categoryScores.vendorPartnerRisk   ?? 0,
        incidentReadiness:   categoryScores.incidentReadiness   ?? 0,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || "Email failed to send" }, { status: 500 });
    }

    // Record send timestamp so admin panel shows sent status
    await databases.updateDocument(DB_ID, COLLECTIONS.ASSESSMENTS, doc.$id, {
      email_sent_at:  new Date().toISOString(),
      email_sent_by:  "admin",
    }).catch((err) => console.error("Failed to record email_sent_at:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[admin/send-report] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendAssessmentAlert, sendSurveyResultEmail } from "@/lib/email";
import { upsertSubscriber } from "@/lib/subscribers";
import { QUESTIONS } from "@/lib/data/dpdpa-assessment";

function buildAnswerSummary(answers: Record<string, unknown>): Array<{ question: string; answer: string }> {
  const result: Array<{ question: string; answer: string }> = [];
  for (const q of QUESTIONS) {
    const val = answers[q.key as keyof typeof answers];
    if (!val) continue;
    if (Array.isArray(val)) {
      const texts = (val as string[])
        .map((id) => q.options.find((o) => o.id === id)?.text)
        .filter(Boolean) as string[];
      if (texts.length) result.push({ question: q.text, answer: texts.join(", ") });
    } else {
      const opt = q.options.find((o) => o.id === val);
      if (opt) result.push({ question: q.text, answer: opt.text });
    }
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both legacy industry assessment shape and new general assessment shape
    const {
      email,
      // Legacy fields (industry assessments)
      industry,
      riskLevel,
      scores,
      // New general assessment fields
      name,
      business,
      mobile,
      report_type,
      answers,
      result,
      consentReport,
      consentNewsletter,
      consentFollowup,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region  = request.headers.get("x-vercel-ip-country-region") || "";
    const userAgent = request.headers.get("user-agent") || "";

    // Determine industry/sector: new flow uses answers.q1_sector, legacy uses industry field
    const resolvedIndustry = answers?.q1_sector || industry || "general";
    const resolvedRiskLevel = result?.verdictBand || riskLevel || "";

    const reportToken = randomUUID();
    const reportTokenExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const assessmentData = {
      // ── Legacy fields (kept for backward compatibility with industry assessments) ──
      email,
      industry:             resolvedIndustry,
      risk_level:           resolvedRiskLevel,
      applicability_score:  scores?.applicability ?? 0,
      maturity_score:       scores?.maturity ?? 0,
      risk_score:           scores?.risk ?? 0,
      urgency_score:        scores?.urgency ?? 0,
      overall_score:        result?.finalScore ?? scores?.overall ?? 0,

      // ── New general assessment fields ──
      raw_score:              result?.rawScore ?? 0,
      final_score:            result?.finalScore ?? 0,
      verdict_band:           result?.verdictBand ?? "",
      data_exposure:          result?.dataExposure ?? 0,
      control_maturity:       result?.controlMaturity ?? 0,
      operational_readiness:  result?.operationalReadiness ?? 0,
      red_flags_json:         JSON.stringify(result?.redFlagsTriggered ?? []),
      q11_blocker:            answers?.q11_blocker ?? "",
      q12_resource:           answers?.q12_resource ?? "",
      immediate_actions_json: JSON.stringify(result?.immediateActions ?? []),
      thirty_day_actions_json: JSON.stringify(result?.thirtyDayActions ?? []),
      report_type:            report_type ?? "quick",
      name:                   name ?? "",
      business_name:          business ?? "",
      mobile:                 mobile ?? "",
      consent_report:         consentReport ?? false,
      consent_newsletter:     consentNewsletter ?? false,
      consent_followup:       consentFollowup ?? false,

      // ── Geo / session ──
      created_at:   new Date().toISOString(),
      ip_address:   ip,
      city,
      country,
      region,

      // ── Report delivery ──
      report_token:            reportToken,
      report_token_expires_at: reportTokenExpiresAt,
      answers_json:            JSON.stringify(answers ?? {}),
      category_scores_json:    JSON.stringify(result?.categoryScores ?? {}),
    };

    await databases.createDocument(DB_ID, COLLECTIONS.ASSESSMENTS, ID.unique(), assessmentData);

    // Write consent log entry
    const timestamp = new Date().toISOString();
    databases.createDocument(DB_ID, COLLECTIONS.CONSENT_LOG, ID.unique(), {
      email,
      source:          "assessment",
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

    // Fire-and-forget admin alert
    sendAssessmentAlert(assessmentData).catch((err) =>
      console.error("sendAssessmentAlert error:", err)
    );

    // Create subscriber if user opted in to daily briefings
    if (consentNewsletter && email) {
      upsertSubscriber({
        email,
        name:    name ?? "",
        industry: resolvedIndustry,
        source:  "assessment_form",
        ip, userAgent, city, country, region,
      }).catch((err) => console.error("upsertSubscriber assessment:", err));
    }

    // Send personalised report email to user when they consented to report delivery
    if (consentReport && email) {
      sendSurveyResultEmail({
        email,
        name:            name ?? "",
        businessName:    business ?? "",
        score:           result?.finalScore ?? 0,
        band:            result?.verdictBand ?? "Early Stage",
        summary:         result?.verdictDescription ?? "",
        recommendations: result?.immediateActions ?? [],
        riskFlags:       result?.redFlagsTriggered ?? [],
        answerSummary:   buildAnswerSummary((answers as Record<string, unknown>) ?? {}),
        reportToken,
        categoryScores:  result?.categoryScores,
      }).catch((err) => console.error("sendSurveyResultEmail error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assessment save error:", error);
    return NextResponse.json({ error: "Failed to save assessment." }, { status: 500 });
  }
}

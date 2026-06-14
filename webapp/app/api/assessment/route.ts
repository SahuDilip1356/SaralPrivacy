import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PRIVACY_NOTICE_VERSION } from "@/lib/utils";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendAssessmentAlert, sendSurveyResultEmail } from "@/lib/email";
import { upsertSubscriber } from "@/lib/subscribers";
import { QUESTIONS } from "@/lib/data/dpdpa-assessment";
import { getClientIp, rateLimit, isHoneypotTripped } from "@/lib/abuseGuard";

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
  // Abuse guard: cap submissions per IP (a real user submits once).
  const rl = rateLimit(`assessment:${getClientIp(request)}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json();

    // Honeypot: a hidden field only bots fill. Pretend success, store nothing.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

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
    // Prefer a self-reported city from the form; fall back to Vercel geo header.
    const city    = (typeof body.city === "string" && body.city.trim()) || decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
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

    const doc = await databases.createDocument(DB_ID, COLLECTIONS.ASSESSMENTS, ID.unique(), assessmentData);

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
      try {
        const emailResult = await sendSurveyResultEmail({
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
          // Industry packs (CA, Training, …) use their own bucket keys, not the
          // general engine's 6 category keys, so skip the email scorecard for them
          // (DB still stores the buckets via category_scores_json).
          categoryScores:  ["ca-firm", "training", "recruit", "d2c", "clinic", "school", "law-firm", "realty", "hotel", "pharmacy", "fintech", "wellness"].includes(report_type) ? undefined : result?.categoryScores,
          checklistUrl:    report_type === "ca-firm" ? "https://saralprivacy.com/templates/ca-firm-dpdpa-starter-checklist.pdf"
                         : report_type === "recruit" ? "https://saralprivacy.com/templates/recruitment-agency-dpdpa-starter-checklist.pdf"
                         : report_type === "d2c" ? "https://saralprivacy.com/templates/d2c-brand-dpdpa-starter-checklist.pdf"
                         : report_type === "training" ? "https://saralprivacy.com/templates/training-institute-dpdpa-starter-checklist.pdf"
                         : report_type === "clinic" ? "https://saralprivacy.com/templates/clinic-diagnostic-lab-dpdpa-starter-checklist.pdf"
                         : report_type === "school" ? "https://saralprivacy.com/templates/school-college-dpdpa-starter-checklist.pdf"
                         : report_type === "law-firm" ? "https://saralprivacy.com/templates/law-firm-dpdpa-starter-checklist.pdf"
                         : report_type === "realty" ? "https://saralprivacy.com/templates/real-estate-dpdpa-starter-checklist.pdf"
                         : report_type === "hotel" ? "https://saralprivacy.com/templates/hotels-travel-dpdpa-starter-checklist.pdf"
                         : report_type === "pharmacy" ? "https://saralprivacy.com/templates/pharmacy-dpdpa-starter-checklist.pdf"
                         : report_type === "fintech" ? "https://saralprivacy.com/templates/fintech-nbfc-dpdpa-starter-checklist.pdf"
                         : report_type === "wellness" ? "https://saralprivacy.com/templates/gyms-salons-spas-dpdpa-starter-checklist.pdf"
                         : undefined,
          checklistTitle:  report_type === "ca-firm" ? "CA Firm DPDPA Starter Checklist"
                         : report_type === "recruit" ? "Recruitment Agency DPDPA Starter Checklist"
                         : report_type === "d2c" ? "D2C Brand DPDPA Starter Checklist"
                         : report_type === "training" ? "Training Institute DPDPA Starter Checklist"
                         : report_type === "clinic" ? "Clinic & Diagnostic Lab DPDPA Starter Checklist"
                         : report_type === "school" ? "School & College DPDPA Starter Checklist"
                         : report_type === "law-firm" ? "Law Firm DPDPA Starter Checklist"
                         : report_type === "realty" ? "Real Estate DPDPA Starter Checklist"
                         : report_type === "hotel" ? "Hotels & Travel DPDPA Starter Checklist"
                         : report_type === "pharmacy" ? "Pharmacy DPDPA Starter Checklist"
                         : report_type === "fintech" ? "Fintech / NBFC DPDPA Starter Checklist"
                         : report_type === "wellness" ? "Gym / Salon / Spa DPDPA Starter Checklist"
                         : undefined,
        });
        if (emailResult.success) {
          databases.updateDocument(DB_ID, COLLECTIONS.ASSESSMENTS, doc.$id, {
            email_sent_at: new Date().toISOString(),
            email_sent_by: "auto",
          }).catch((err) => console.error("Failed to record auto email_sent_at:", err));
        }
      } catch (err) {
        console.error("sendSurveyResultEmail error:", err);
      }
    }

    return NextResponse.json({ success: true, reportToken });
  } catch (error) {
    console.error("Assessment save error:", error);
    return NextResponse.json({ error: "Failed to save assessment." }, { status: 500 });
  }
}

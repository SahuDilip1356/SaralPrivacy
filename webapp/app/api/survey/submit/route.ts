import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { sendSurveyResultEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, score } = body;

    if (!answers || !score) {
      return NextResponse.json({ error: "Missing answers or score" }, { status: 400 });
    }

    const wantsReport = answers.want_detailed_report === "Yes, send it to me";
    const now = new Date().toISOString();

    // Save to Appwrite survey_responses collection
    await databases.createDocument(DB_ID, COLLECTIONS.SURVEY_RESPONSES, ID.unique(), {
      // Business profile
      role:                answers.role                || "",
      employee_size:       answers.employee_size       || "",
      sector:              answers.sector              || "",
      operating_footprint: answers.operating_footprint || "",
      state_ut:            answers.state_ut            || "",
      city:                answers.city                || "",

      // Data footprint
      digital_personal_data: answers.digital_personal_data || "",
      data_types:            JSON.stringify(answers.data_types    || []),
      data_storage:          JSON.stringify(answers.data_storage  || []),

      // Preparedness
      controls_in_place:    JSON.stringify(answers.controls_in_place || []),
      readiness_self_view:  answers.readiness_self_view  || "",
      biggest_blocker:      answers.biggest_blocker      || "",
      most_helpful_resource: answers.most_helpful_resource || "",

      // Score
      score:      score.score,
      score_band: score.band,

      // Lead fields (only if opted in)
      wants_report:       wantsReport,
      name:               answers.name           || "",
      business_name:      answers.business_name  || "",
      work_email:         answers.work_email      || "",
      mobile_number:      answers.mobile_number  || "",
      contact_preference: answers.contact_preference || "",
      consent_followup:   answers.consent_followup   ?? false,

      // Consent metadata
      consent_given:     true,
      consent_version:   "v1.0",
      consent_timestamp: now,
      created_at:        now,
    }).catch(err => {
      // Non-blocking — log but don't fail the response
      console.error("[survey] Appwrite save failed:", err);
    });

    // Send follow-up report email if opted in
    if (wantsReport && answers.work_email) {
      await sendSurveyResultEmail({
        email:        answers.work_email,
        name:         answers.name         || "there",
        businessName: answers.business_name || "",
        score:        score.score,
        band:         score.band,
        summary:      score.summary,
        recommendations: score.recommendations || [],
        riskFlags:    score.riskFlags || [],
      }).catch(err => {
        console.error("[survey] Follow-up email failed:", err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[survey] Submit error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

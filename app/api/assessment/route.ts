import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, industry, riskLevel, scores } = body;

    if (!email || !industry || !riskLevel) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    await databases.createDocument(DB_ID, COLLECTIONS.ASSESSMENTS, ID.unique(), {
      email,
      industry,
      risk_level:           riskLevel,
      applicability_score:  scores?.applicability || 0,
      maturity_score:       scores?.maturity || 0,
      risk_score:           scores?.risk || 0,
      urgency_score:        scores?.urgency || 0,
      overall_score:        scores?.overall || 0,
      created_at:           new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assessment save error:", error);
    return NextResponse.json({ error: "Failed to save assessment." }, { status: 500 });
  }
}

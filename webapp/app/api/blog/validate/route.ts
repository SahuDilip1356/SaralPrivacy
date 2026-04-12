import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// ── Output schema ─────────────────────────────────────────────────────────────

const SectionFeedbackSchema = z.object({
  section:  z.enum(["what_changed", "law_says", "do_now", "uncertain", "mistakes"]),
  status:   z.enum(["verified", "warning", "error"]),
  note:     z.string(),
});

const SuggestedSourceSchema = z.object({
  claim:      z.string(),
  sourceType: z.enum(["Act text", "Notified Rules", "Gazette", "Official press release", "Court judgment", "Regulator analysis", "Law firm commentary"]),
  citation:   z.string(),
  riskLevel:  z.enum(["Low", "Medium", "High"]),
});

const ValidateOutputSchema = z.object({
  scores: z.object({
    score_legal_accuracy: z.number(),
    score_primary_source: z.number(),
    score_currency:       z.number(),
    score_scope:          z.number(),
    score_operational:    z.number(),
    total:                z.number(),
  }),
  section_feedback:  z.array(SectionFeedbackSchema),
  suggested_sources: z.array(SuggestedSourceSchema),
  editorial_notes:   z.string(),
  // validated_at is NOT in the AI schema — set server-side in IST below
});

// ── DPDPA Guardrail System Prompt ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior DPDPA (Digital Personal Data Protection Act, 2023) editorial validator for SaralPrivacy.com.

Your job is to review blog post content and validate it against the DPDPA Act 2023 and DPDP Rules 2025, then return a structured validation report.

## Scoring Rubric (100 points total)

1. **Legal Accuracy (max 35)** — Are all legal claims correct? Do section references match the Act? No GDPR concepts wrongly imported to India?
2. **Primary Source Support (max 25)** — Are claims backed by Act text, notified Rules, official gazettes, or government releases?
3. **Currency / Status Accuracy (max 15)** — Is the status of notifications, rules, and timelines current and accurate?
4. **Scope Precision (max 15)** — Are the applicability boundaries (who it applies to, exemptions) stated correctly?
5. **Operational Usefulness (max 10)** — Are the practical steps actionable, specific, and relevant to Indian MSMEs?

## Key DPDPA Reference Points
- DPDPA 2023 received Presidential assent on 11 August 2023
- DPDP Rules 2025 are notified and in effect
- Consent must be: free, specific, informed, unconditional, and unambiguous (Section 6)
- Data principal rights: access, correction, erasure, grievance redressal, nominate (Sections 11–14)
- No "legitimate interest" basis unlike GDPR — India uses consent + specified legitimate uses only
- Penalties: up to ₹250 crore per breach; ₹10,000 for individual complainants filing non-bona-fide complaints
- Exemptions: personal/domestic use, journalistic/research use, national security, state processing for subsidies

## Per-Section Feedback Rules
- "verified": claim is accurate and well-supported
- "warning": claim is partially correct or needs a citation
- "error": claim contradicts the Act/Rules or is factually wrong

## Important
You MUST return a valid JSON object matching the schema. Every field is required. scores.total must equal the sum of all five score fields.`;

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || !["authenticated", "blogger"].includes(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      lane,
      section_what_changed,
      section_law_says,
      section_do_now,
      section_uncertain,
      section_mistakes,
    } = body;

    if (!title || !section_what_changed) {
      return NextResponse.json(
        { error: "Title and at least one content section required" },
        { status: 400 }
      );
    }

    const userContent = `Please validate this DPDPA blog post:

TITLE: ${title}
LANE: ${lane}

--- SECTION: What Changed ---
${section_what_changed || "(empty)"}

--- SECTION: What the Law Actually Says ---
${section_law_says || "(empty)"}

--- SECTION: What Businesses Should Do Now ---
${section_do_now || "(empty)"}

--- SECTION: What Is Still Uncertain ---
${section_uncertain || "(empty)"}

--- SECTION: Top Mistakes to Avoid ---
${section_mistakes || "(empty)"}

Return the structured validation report with all scores filled in.`;

    const { output } = await generateText({
      model:  anthropic("claude-sonnet-4-6"),
      system: SYSTEM_PROMPT,
      prompt: userContent,
      output: Output.object({ schema: ValidateOutputSchema }),
    });

    if (!output) {
      return NextResponse.json(
        { error: "Validation model did not return a structured response. Please try again." },
        { status: 502 }
      );
    }

    // Compute validation date server-side in IST (UTC+5:30) — never trust the AI for dates
    const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const validated_at = istDate.toISOString().slice(0, 10); // YYYY-MM-DD in IST

    return NextResponse.json({ ...output, validated_at });
  } catch (err: unknown) {
    console.error("[blog/validate POST]", err);
    const message = err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

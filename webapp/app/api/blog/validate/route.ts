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

## Per-Section Feedback — Section-Specific Criteria

For each section, apply the criteria below to determine its status. Do NOT apply identical generic citation rules across all sections — each section has a distinct purpose and must be validated accordingly.

### what_changed (What Changed)
- Purpose: Factual, dated regulatory events — gazette notifications, amendments, DPAI orders, court rulings.
- VERIFIED: Events are correctly named, accurately dated, and traceable to official sources (Gazette, MCA notice, DPAI order).
- WARNING: Event occurred but date is missing, approximate, or the specific notification reference (gazette number) is absent.
- ERROR: Event is fabricated, misdated by more than minor rounding, or misattributes who issued the notification.

### law_says (What the Law Actually Says)
- Purpose: Direct legal interpretation citing specific Act sections and Rule numbers.
- VERIFIED: Every claim maps to an explicit DPDPA 2023 section or DPDP Rules 2025 rule number with correct characterisation.
- WARNING: Claim is generally legally correct but the section/rule number is missing, imprecise, or paraphrased in a potentially misleading way.
- ERROR: GDPR concepts imported without qualification (e.g., "legitimate interest", "DPO" without citing the correct Rule), wrong section numbers cited, claim contradicts the Act text, or Indian-law-specific nuances misrepresented.

### do_now (What Businesses Should Do Now)
- Purpose: Concrete, operationally actionable steps for Indian MSMEs to achieve compliance today.
- VERIFIED: Every action step is legally grounded, specific (not vague), and immediately actionable by an MSME without requiring legal interpretation.
- WARNING: Advice is legally correct but too vague ("review your privacy policy") without specifying what to review or what the legal standard is; or advice is premature because the relevant Rule has not yet been notified.
- ERROR: Following this advice would lead a business to non-compliance; advice contradicts what law_says states; advice is only applicable to Significant Data Fiduciaries (SDFs) without flagging that scope limitation.

### uncertain (What Is Still Uncertain)
- Purpose: Genuine, unresolved regulatory questions — pending Rules, unissued DPAI guidance, unlitigated interpretations.
- VERIFIED: Uncertainty is real (the Rule/guidance has not been notified as of today), properly attributed, and not speculation presented as fact.
- WARNING: Item flagged as uncertain has since been resolved by a notified Rule, official clarification, or gazette notification — meaning it should move to what_changed or law_says.
- ERROR: A settled legal point (clearly stated in the Act or notified Rules) is misrepresented as uncertain; or speculative claims ("DPAI may introduce X") are stated without explicitly labelling them as speculation.

### mistakes (Top Mistakes to Avoid)
- Purpose: Common compliance errors businesses make, with the legally correct alternative.
- VERIFIED: Each mistake is a documented real-world pitfall, the legal basis for why it's wrong is cited (Act section or Rule), and the correction is accurate.
- WARNING: Mistake is plausible but lacks citation of the legal standard being violated; or the "correct" alternative is stated without legal grounding.
- ERROR: The "correct" alternative guidance is itself non-compliant; or a mistake is described that is not actually prohibited under DPDPA (importing GDPR prohibitions that do not apply in India).

## Cross-Section Consistency Check
After evaluating each section individually, verify:
1. do_now action steps must not contradict law_says legal claims. If there is a conflict, flag the relevant section as "error".
2. uncertain items must not overlap with what_changed — if something is listed as uncertain but was already resolved in what_changed, flag uncertain as "warning".
3. mistakes corrections must align with law_says legal claims — if a mistake's "correct" answer contradicts the law_says section, flag mistakes as "error".

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

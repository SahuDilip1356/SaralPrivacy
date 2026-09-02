import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/adminSession";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// ── Section metadata ──────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  section_what_changed: "What Changed",
  section_law_says:     "What the Law Actually Says",
  section_do_now:       "What Businesses Should Do Now",
  section_uncertain:    "What Is Still Uncertain",
  section_mistakes:     "Top Mistakes to Avoid",
};

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior DPDPA editorial corrector for SaralPrivacy.com.

You are given a single section of a blog post that has been flagged by the DPDPA Guardrail Validator, along with the specific validation feedback explaining what is wrong.

Your task is to rewrite ONLY that section to address every issue raised in the validation feedback.

## Strict Rules

1. **No speculation.** Remove any claim that is not directly traceable to the DPDPA Act 2023 text or notified DPDP Rules 2025. Do not use words like "likely", "proposed", "may be introduced", "expected", "could", unless clearly labelling them as speculation with explicit attribution.

2. **Official citations only.** Replace unofficial source references (blog posts, commentary sites, non-government URLs) with official citations: DPDPA Act 2023 (section number), DPDP Rules 2025 (rule number), or Gazette of India notifications. If a claim cannot be officially cited, remove it.

3. **Correct legal terminology.** Use the exact terms from the Act — do not import GDPR concepts, common-law tort terms, or terminology not present in the DPDPA. For example:
   - "vicarious liability" → "Data Fiduciary accountability for Data Processors (Section 8(2))"
   - "legitimate interest" → does not exist in DPDPA; use "consent or specified legitimate use"
   - "DPO" attribution must cite the specific Rule, not Section 10(1) directly

4. **Preserve structure and intent.** Keep the same heading style, paragraph structure, and bullet points as the original. Do not rewrite from scratch — correct what the validator flagged, leave the rest intact.

5. **Fix formatting artifacts.** Remove any leftover markdown artifacts (e.g., "## heading" inside a textarea that renders as plain text), "dpdpa" fragments accidentally appended to words, broken table cell text.

6. **Return ONLY the corrected section text.** No preamble, no explanation, no "Here is the corrected version:" prefix. Just the corrected content, ready to replace the textarea value directly.`;

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await requireRole(req, ["admin", "blogger"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      sectionKey,
      currentContent,
      feedbackNote,
      title,
      section_what_changed,
      section_law_says,
      section_do_now,
      section_uncertain,
      section_mistakes,
    } = body as {
      sectionKey:           string;
      currentContent:       string;
      feedbackNote:         string;
      title:                string;
      section_what_changed?: string;
      section_law_says?:     string;
      section_do_now?:       string;
      section_uncertain?:    string;
      section_mistakes?:     string;
    };

    if (!sectionKey || !currentContent || !feedbackNote) {
      return NextResponse.json(
        { error: "sectionKey, currentContent, and feedbackNote are required" },
        { status: 400 }
      );
    }

    const sectionLabel = SECTION_LABELS[sectionKey] ?? sectionKey;

    // Build context from the other sections so the AI revises in the context of the full post
    const otherSections: string[] = [];
    const allSections: Record<string, string | undefined> = {
      section_what_changed,
      section_law_says,
      section_do_now,
      section_uncertain,
      section_mistakes,
    };
    for (const [key, content] of Object.entries(allSections)) {
      if (key !== sectionKey && content?.trim()) {
        otherSections.push(`--- ${SECTION_LABELS[key] ?? key} ---\n${content.trim()}`);
      }
    }

    const contextBlock = otherSections.length
      ? `\n\n## Other Sections in This Post (for cross-section consistency — do NOT rewrite these)\n${otherSections.join("\n\n")}`
      : "";

    const prompt = `Blog post title: "${title}"

Section being corrected: "${sectionLabel}"

--- CURRENT SECTION CONTENT ---
${currentContent}

--- VALIDATION FEEDBACK (issues to fix) ---
${feedbackNote}${contextBlock}

Please rewrite the section content above, addressing every issue in the validation feedback. Ensure your revision is consistent with the other sections shown above — do NOT contradict their legal claims or duplicate their content. Follow all rules in your system prompt. Return only the corrected section text.`;

    const { text } = await generateText({
      model:  anthropic("claude-sonnet-4-6"),
      system: SYSTEM_PROMPT,
      prompt,
    });

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Revision model returned empty content. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ revisedContent: text.trim() });
  } catch (err: unknown) {
    console.error("[blog/revise POST]", err);
    const message = err instanceof Error ? err.message : "Revision failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

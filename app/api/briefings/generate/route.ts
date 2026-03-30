import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { sendBriefingApprovalEmail } from "@/lib/email";

// ─── Daily DPDPA topic rotation ───────────────────────────────────────────────
const DPDPA_TOPICS = [
  { category: "consent-management",  topic: "Consent notice requirements under DPDPA Section 6 — what your forms must say from Day 1" },
  { category: "sector-specific",     topic: "Recruitment agencies and CV databases — DPDPA obligations for candidate data handling" },
  { category: "sector-specific",     topic: "CA firms and tax data — DPDPA compliance for PAN, Aadhaar, and ITR data processing" },
  { category: "consent-management",  topic: "WhatsApp marketing and DPDPA — consent requirements for D2C and e-commerce brands" },
  { category: "regulatory-update",   topic: "Data breach notification under DPDPA — timelines, scope, and what businesses must report" },
  { category: "sector-specific",     topic: "Training institutes and EdTech — student and parent data protection under DPDPA Section 9" },
  { category: "data-rights",         topic: "Rights of Data Principals under DPDPA — access, correction, erasure, and nomination rights" },
  { category: "compliance-guidance", topic: "Significant Data Fiduciary criteria — how to know if your business qualifies and what changes" },
  { category: "enforcement",         topic: "DPDPA penalties under Section 33 — fines up to ₹250 crore and what triggers them" },
  { category: "consent-management",  topic: "Children's data under DPDPA Section 9 — parental consent and age verification requirements" },
  { category: "compliance-guidance", topic: "Grievance redressal mechanism under Section 13 — what your business must provide" },
  { category: "sector-specific",     topic: "Healthcare and patient data — DPDPA compliance for hospitals, clinics, and healthtech" },
  { category: "regulatory-update",   topic: "Cross-border data transfers under DPDPA — approved countries and restricted jurisdictions" },
  { category: "compliance-guidance", topic: "Data retention and deletion — how long to keep personal data under DPDPA" },
  { category: "sector-specific",     topic: "Fintech and digital lending — DPDPA compliance for NBFCs, lending apps, and UPI platforms" },
  { category: "compliance-guidance", topic: "Employee HR data privacy — DPDPA obligations for Indian employers and HR departments" },
  { category: "compliance-guidance", topic: "Third-party vendors and data processors — DPDPA obligations beyond your own systems" },
  { category: "regulatory-update",   topic: "DPDPA Rules notification status — what to expect from the government in 2025-26" },
  { category: "consent-management",  topic: "E-commerce checkout and DPDPA — customer consent, order data, and return processes" },
  { category: "compliance-guidance", topic: "DPDPA audit trail and record-keeping — what documentation every business must maintain" },
  { category: "consent-management",  topic: "Withdrawing consent under DPDPA Section 6(4) — building the right mechanism for users" },
  { category: "data-rights",         topic: "Data correction and erasure rights under Section 12 — implementing right to be forgotten" },
  { category: "sector-specific",     topic: "Real estate and DPDPA — buyer data, broker databases, and PropTech compliance" },
  { category: "compliance-guidance", topic: "Small business DPDPA compliance — a practical 90-day roadmap for Indian SMEs" },
  { category: "consent-management",  topic: "Newsletter and email marketing under DPDPA — consent, unsubscribe, and record-keeping" },
  { category: "sector-specific",     topic: "Hospitality and hotels — guest data, loyalty programs, and DPDPA compliance" },
  { category: "compliance-guidance", topic: "Website privacy policy update checklist for DPDPA 2023 compliance" },
  { category: "regulatory-update",   topic: "Data Protection Board of India — structure, powers, and how complaints will be handled" },
  { category: "sector-specific",     topic: "Manufacturing and DPDPA — employee biometrics, CCTV, and shop-floor data" },
  { category: "compliance-guidance", topic: "DPDPA vs GDPR — key differences for Indian businesses expanding globally" },
];

// ─── Day-of-week theme system ─────────────────────────────────────────────────
const DOW_THEMES = [
  { type: "recap",   label: "Weekly Recap",    tone: "Summarise the key DPDPA lesson for the week in a story-style recap — what should readers take away from this week?" },
  { type: "concept", label: "Big Idea",         tone: "Explain one core DPDPA concept in the simplest possible language for a shop owner, HR manager, or SME founder." },
  { type: "example", label: "Business Example", tone: "Walk through a concrete real-world scenario showing exactly how this DPDPA rule plays out in an Indian MSME." },
  { type: "mistake", label: "Common Mistake",   tone: "Reveal the single most common DPDPA mistake Indian MSMEs make on this topic and how to fix it immediately." },
  { type: "audit",   label: "Mini Audit",       tone: "Give readers a quick 5-minute self-check they can do right now to assess their compliance on this topic." },
  { type: "myth",    label: "Myth Buster",      tone: "Bust a common wrong assumption MSMEs have about this DPDPA rule and reveal the surprising truth." },
  { type: "case",    label: "Case Story",       tone: "Tell a scenario story: 'Imagine this happened in your company...' Make it feel real and close to home for Indian MSMEs." },
];

// ─── Claude API call ──────────────────────────────────────────────────────────
async function generateWithClaude(topic: string, category: string, theme: typeof DOW_THEMES[number]): Promise<any> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const actionFormatValue = theme.type === "audit"
    ? "audit"
    : (theme.type === "case" || theme.type === "recap")
      ? "team"
      : (theme.type === "mistake" || theme.type === "example")
        ? "mistake"
        : "today";

  const prompt = `You are the DPDPA Editorial Team at SaralPrivacy — India's plain-language DPDPA compliance platform for small and medium businesses.

Today's theme: ${theme.label} — ${theme.tone}
Topic: "${topic}"

Write a 2-minute daily DPDPA briefing for Indian MSME owners, founders, HR managers, accountants, and operations leads. Write for an 8th-grade reading level. No legal jargon. No "notwithstanding". No "pursuant to". Never start a sentence with "Under Section" — start with pain, risk, or a real business situation.

LEGAL TERM TRANSLATIONS (always use these):
- Data Principal → the person whose data it is
- Data Fiduciary → the business using the data
- Personal data → information that can identify a person
- Processing → collecting, storing, sharing, using, or deleting data
- Consent → clear permission

Return ONLY a valid JSON object (no markdown, no explanation, no extra text):

{
  "title": "A question-style title that a business owner would actually ask. Max 85 characters. Examples: 'Can You Keep Ex-Employee Records Forever?', 'What Happens If You Share Customer Data Without Permission?'",
  "tag": "One topic label only — one of: Consent / Notice / Penalty / Data Breach / HR Records / Vendor Risk / Children's Data / Employee Data / Marketing / Customer Data / Data Storage / Access Control",
  "hook_line1": "One sharp line with tension, risk, danger, or a surprising reality. Max 18 words. Must NOT start with 'Under Section'. Start with pain or confusion.",
  "hook_line2": "One line stating the business impact in plain language. Max 20 words.",
  "card_what": "Complete one-line plain English meaning of this rule. Max 20 words.",
  "card_why": "Complete one-line risk or business consequence. Max 20 words.",
  "card_action": "Complete one practical action the reader can take. Max 20 words.",
  "card_owner": "Who in the company is responsible — list roles separated by + e.g. Founder + HR + IT",
  "explainer_concept": "The concept explained in very plain language. Max 30 words. Write like you are explaining to a friend.",
  "explainer_example": "A specific real MSME example — a recruitment agency, CA firm, D2C brand, training institute, or general business. Max 30 words.",
  "explainer_mistake": "The most common mistake businesses make on this exact topic. Max 30 words. Start with the mistake, not with 'The mistake is'.",
  "action_format": "${actionFormatValue}",
  "action_items": ["Action or question 1 — max 18 words", "Action or question 2 — max 18 words", "Action or question 3 — max 18 words"],
  "save_line": "One sharp, memorable, slightly punchy sentence. This is the one line readers will screenshot and share. Max 25 words.",
  "participation": "One short question that makes readers think about their own business. Max 15 words. Example: 'Would your business pass this check today?'",
  "excerpt": "2 sentences for the card preview on the briefings list page. Max 200 characters.",
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"],
  "industries": ["one or more of: recruitment, ca-firms, training-institutes, d2c-brands, healthcare, fintech, general"],
  "featured": false,
  "author": "DPDPA Editorial Team"
}

Critical rules:
- action_format must be exactly one of: today / team / mistake / audit
- action_items must have EXACTLY 3 items
- All fields must be complete sentences or phrases — no trailing "..."
- Keep every field SHORT — brevity is the whole point
- Write for a person reading on their phone between meetings
- Return ONLY the JSON object`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":          apiKey,
      "anthropic-version":  "2023-06-01",
      "content-type":       "application/json",
    },
    body: JSON.stringify({
      model:      "claude-opus-4-5",
      max_tokens: 2048,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  // Strip markdown fences if Claude adds them
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ─── Optional GitHub push ─────────────────────────────────────────────────────
async function pushToGitHub(slug: string, briefingData: object): Promise<void> {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const owner = (process.env.GITHUB_OWNER || "").trim();
  const repo  = (process.env.GITHUB_REPO  || "").trim();
  if (!token || !owner || !repo) return; // Skip if not configured

  const dateStr = new Date().toISOString().split("T")[0];
  const path    = `briefings/${dateStr}-${slug}.json`;
  const encoded = Buffer.from(JSON.stringify(briefingData, null, 2)).toString("base64");

  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method:  "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Accept":        "application/vnd.github.v3+json",
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      message: `chore: daily briefing — ${slug}`,
      content: encoded,
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    console.warn(`[briefing] GitHub push failed: ${err}`);
  }
}

// ─── Core generate logic ──────────────────────────────────────────────────────
async function generateAndSave(request: NextRequest) {
  // Validate secret — Vercel Cron sends Authorization: Bearer {CRON_SECRET}
  const secret = (
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "")
  )?.trim();
  // Vercel auto-generates CRON_SECRET and sends it in the Authorization header.
  // Fall back to BRIEFING_CRON_SECRET for manual/local triggers.
  const expected = (process.env.CRON_SECRET || process.env.BRIEFING_CRON_SECRET || "").trim();

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Optional ?forDate=YYYY-MM-DD override (admin backfill only)
  const url = new URL(request.url);
  const forDate = url.searchParams.get("forDate");
  const refDate = forDate ? new Date(forDate + "T12:00:00Z") : new Date();

  // Pick topic by day-of-year of refDate
  const startOfYear = new Date(refDate.getFullYear(), 0, 1).getTime();
  const dayOfYear   = Math.floor((refDate.getTime() - startOfYear) / 86_400_000);
  const { topic, category } = DPDPA_TOPICS[dayOfYear % DPDPA_TOPICS.length];

  // Compute day-of-week theme from refDate
  const dow = refDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const theme = DOW_THEMES[dow];

  // Generate content via Claude
  const briefingData_raw = await generateWithClaude(topic, category, theme);

  // Build slug using refDate
  const dateStr = refDate.toISOString().split("T")[0];
  const generatedSlug = `${dateStr}-${(briefingData_raw.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)}`;

  // Tomorrow 9AM IST = 3:30 UTC
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(3, 30, 0, 0);

  const approvalToken = crypto.randomUUID();

  // Pack new 6-block fields into why_it_matters JSON envelope (v2)
  const whyEnvelope = JSON.stringify({
    version: 2,
    tag: briefingData_raw.tag || "",
    hook_line1: briefingData_raw.hook_line1 || "",
    hook_line2: briefingData_raw.hook_line2 || "",
    card_what: briefingData_raw.card_what || "",
    card_why: briefingData_raw.card_why || "",
    card_action: briefingData_raw.card_action || "",
    card_owner: briefingData_raw.card_owner || "",
    explainer_concept: briefingData_raw.explainer_concept || "",
    explainer_example: briefingData_raw.explainer_example || "",
    explainer_mistake: briefingData_raw.explainer_mistake || "",
    action_format: briefingData_raw.action_format || "today",
    action_items: briefingData_raw.action_items || [],
    save_line: briefingData_raw.save_line || "",
    participation: briefingData_raw.participation || "",
    theme_type: theme.type,
    theme_label: theme.label,
  });

  // word count for read_time (approximate for new short format)
  const wordCount = [
    briefingData_raw.hook_line1, briefingData_raw.hook_line2,
    briefingData_raw.card_what, briefingData_raw.card_why, briefingData_raw.card_action,
    briefingData_raw.explainer_concept, briefingData_raw.explainer_example, briefingData_raw.explainer_mistake,
    ...(briefingData_raw.action_items || []),
    briefingData_raw.save_line,
  ].join(" ").split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const briefingData = {
    title:            briefingData_raw.title,
    slug:             generatedSlug,
    excerpt:          briefingData_raw.excerpt || "",
    summary:          briefingData_raw.save_line || "", // save_line in summary for email
    why_it_matters:   whyEnvelope,
    action_checklist: JSON.stringify(briefingData_raw.action_items || []),
    category:         briefingData_raw.category || category,
    tags:             JSON.stringify(briefingData_raw.tags || []),
    industries:       JSON.stringify(briefingData_raw.industries || ["general"]),
    featured:         briefingData_raw.featured ?? false,
    author:           briefingData_raw.author || "DPDPA Editorial Team",
    status:           "approved",   // live on website immediately — no manual approval gate
    read_time:        readTime,
    approval_token:   approvalToken,
    scheduled_for:    tomorrow.toISOString(),
    created_at:       new Date().toISOString(),
  };

  const doc = await databases.createDocument(
    DB_ID, COLLECTIONS.BRIEFINGS, ID.unique(), briefingData
  );

  // Push to GitHub (non-blocking)
  pushToGitHub(generatedSlug, { ...briefingData, id: doc.$id }).catch(console.error);

  // Email approval link to admin
  await sendBriefingApprovalEmail({ ...briefingData, id: doc.$id }, approvalToken)
    .catch(console.error);

  return NextResponse.json({ success: true, briefingId: doc.$id, slug: generatedSlug, topic });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET — disabled. Content is now published exclusively via the n8n pipeline
 * (90-day roadmap → publish_to_webapp.py → POST below).
 * The Vercel cron has been removed from vercel.json.
 * This endpoint is kept for backward-compat but returns 410 Gone.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { error: "Vercel cron disabled. Use n8n pipeline → POST /api/briefings/generate." },
    { status: 410 }
  );
}

/**
 * POST — called by n8n pipeline via publish_to_webapp.py at 9 AM IST daily.
 * Saves briefing to Appwrite with status "approved" → immediately live on site.
 * Email to subscribers is handled separately: admin approves via /api/briefings/approve.
 */
export async function POST(request: NextRequest) {
  const secret = (
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "")
  )?.trim();
  const expected = (process.env.CRON_SECRET || process.env.BRIEFING_CRON_SECRET || "").trim();

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    // If no title, auto-generate via Claude
    if (!body.title) {
      return generateAndSave(request);
    }

    // Manual submission with pre-written content
    // Use date from payload if provided (Python pipeline sends its own date)
    const dateStr = (body.date as string) || new Date().toISOString().split("T")[0];
    const slug = `${dateStr}-${(body.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)}`;

    // Duplicate guard: if a draft with this slug already exists, delete it first
    // (prevents duplicates if the pipeline retries a same-day submission)
    try {
      const existing = await databases.listDocuments(DB_ID, COLLECTIONS.BRIEFINGS, [
        Query.equal("slug", slug),
        Query.equal("status", "draft"),
        Query.limit(5),
      ]);
      if (existing.documents.length > 0) {
        await Promise.all(
          existing.documents.map((d) =>
            databases.deleteDocument(DB_ID, COLLECTIONS.BRIEFINGS, d.$id)
          )
        );
        console.log(`[briefing] Deleted ${existing.documents.length} existing draft(s) for slug: ${slug}`);
      }
    } catch { /* non-blocking */ }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 30, 0, 0);

    const approvalToken = crypto.randomUUID();

    // Pack rich data same way as auto-generation
    const whyRich = (body.business_impact || body.who_is_affected)
      ? JSON.stringify({
          why:      body.why_it_matters  || "",
          impact:   body.business_impact || "",
          affected: body.who_is_affected || [],
        })
      : (body.why_it_matters || "");

    const briefingData = {
      title:            body.title,
      slug,
      excerpt:          body.excerpt          || "",
      summary:          body.summary          || "",
      why_it_matters:   whyRich,
      action_checklist: JSON.stringify(body.action_checklist || []),
      category:         body.category         || "compliance-guidance",
      tags:             JSON.stringify(body.tags             || []),
      industries:       JSON.stringify(body.industries       || ["general"]),
      read_time: (() => {
        if (body.read_time) return body.read_time;
        const txt = [body.title, body.excerpt, body.summary, body.why_it_matters, body.business_impact,
          (body.who_is_affected || []).join(" "), (body.action_checklist || []).join(" ")].join(" ");
        return Math.max(1, Math.round(txt.split(/\s+/).filter(Boolean).length / 200));
      })(),
      featured:         false,
      author:           "DPDPA Editorial Team",
      status:           "approved",   // live on website immediately
      approval_token:   approvalToken,
      scheduled_for:    tomorrow.toISOString(),
      created_at:       new Date().toISOString(),

      // ── Infographic (stored in dedicated 1MB attribute) ────────────────────
      infographic_base64:  body.infographic_base64  || "",
      // Note: all Hook/Body/CTA rich fields are packed into why_it_matters JSON
      // by publish_to_webapp.py. The briefing detail page unpacks them via parseWhyField().
    };

    const doc = await databases.createDocument(
      DB_ID, COLLECTIONS.BRIEFINGS, ID.unique(), briefingData
    );

    // Admin approval dropped — briefing is live on site immediately (status: approved).
    // Email delivery to subscribers is handled by the n8n pipeline (send_email.py).

    return NextResponse.json({ success: true, briefingId: doc.$id, slug });
  } catch (error) {
    console.error("Briefing generate error:", error);
    return NextResponse.json({ error: "Failed to generate briefing." }, { status: 500 });
  }
}

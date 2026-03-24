import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";
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

// ─── Claude API call ──────────────────────────────────────────────────────────
async function generateWithClaude(topic: string, category: string): Promise<any> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = `You are the DPDPA Editorial Team at SaralPrivacy.com — India's leading DPDPA compliance platform for small and medium businesses.

Generate a daily DPDPA compliance briefing on this topic:
"${topic}"

Return ONLY a valid JSON object (absolutely no markdown, no explanation, no extra text) with these exact fields:

{
  "title": "Specific, compelling title (max 85 characters)",
  "excerpt": "2-3 sentence card preview that makes business owners want to read more (max 220 characters)",
  "why_it_matters": "2-3 paragraphs explaining the business risk and urgency for Indian SMEs. Reference specific DPDPA sections. (150-250 words)",
  "summary": "Plain-English explanation of the DPDPA requirement. Avoid legalese. Written for a non-lawyer business owner. (200-300 words)",
  "business_impact": "Specific, practical impact on day-to-day operations. Include examples relevant to Indian SMEs. (150-250 words)",
  "who_is_affected": ["Type of business or scenario 1", "Type of business or scenario 2", "Type of business or scenario 3", "Type of business or scenario 4"],
  "action_checklist": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"],
  "industries": ["one or more of: recruitment, ca-firms, training-institutes, d2c-brands, healthcare, fintech, general"],
  "read_time": 5,
  "featured": false,
  "author": "DPDPA Editorial Team"
}

Rules:
- Write for Indian SME owners, CXOs, and compliance managers — not lawyers
- Be specific and actionable, not generic platitudes
- Reference specific DPDPA sections (Section 6, Section 8, Section 13, etc.) where relevant
- Use Indian business context (WhatsApp, UPI, CA firms, recruitment agencies, GST, etc.)
- who_is_affected must have exactly 4-6 items
- action_checklist must have exactly 5-7 concrete steps
- Return ONLY the JSON object, no other text`;

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

  // Pick today's topic by day-of-year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
  const dayOfYear   = Math.floor((Date.now() - startOfYear) / 86_400_000);
  const { topic, category } = DPDPA_TOPICS[dayOfYear % DPDPA_TOPICS.length];

  // Generate content via Claude
  const generated = await generateWithClaude(topic, category);

  // Build slug
  const dateStr = new Date().toISOString().split("T")[0];
  const slug    = `${dateStr}-${(generated.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)}`;

  // Tomorrow 9AM IST = 3:30 UTC
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(3, 30, 0, 0);

  const approvalToken = crypto.randomUUID();

  // Pack business_impact + who_is_affected into why_it_matters as JSON envelope
  // (avoids needing separate Appwrite attributes; backward-compatible with static briefings)
  const whyRich = JSON.stringify({
    why:      generated.why_it_matters  || "",
    impact:   generated.business_impact || "",
    affected: generated.who_is_affected || [],
  });

  const briefingData = {
    title:            generated.title,
    slug,
    excerpt:          generated.excerpt          || "",
    summary:          generated.summary          || "",
    why_it_matters:   whyRich,
    action_checklist: JSON.stringify(generated.action_checklist || []),
    category:         generated.category         || category,
    tags:             JSON.stringify(generated.tags             || []),
    industries:       JSON.stringify(generated.industries       || ["general"]),
    read_time:        generated.read_time         || 5,
    featured:         false,
    author:           "DPDPA Editorial Team",
    status:           "draft",
    approval_token:   approvalToken,
    scheduled_for:    tomorrow.toISOString(),
    created_at:       new Date().toISOString(),
  };

  const doc = await databases.createDocument(
    DB_ID, COLLECTIONS.BRIEFINGS, ID.unique(), briefingData
  );

  // Push to GitHub (non-blocking)
  pushToGitHub(slug, { ...briefingData, id: doc.$id }).catch(console.error);

  // Email approval link to admin
  await sendBriefingApprovalEmail({ ...briefingData, id: doc.$id }, approvalToken)
    .catch(console.error);

  return NextResponse.json({ success: true, briefingId: doc.$id, slug, topic });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/** GET — triggered by Vercel Cron at 3:30 UTC (9 AM IST) */
export async function GET(request: NextRequest) {
  try {
    return await generateAndSave(request);
  } catch (error) {
    console.error("Briefing generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate briefing.", detail: String(error) },
      { status: 500 }
    );
  }
}

/** POST — manual trigger or pre-written content submission */
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
    const dateStr = new Date().toISOString().split("T")[0];
    const slug = `${dateStr}-${(body.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)}`;

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
      read_time:        body.read_time         || 5,
      featured:         false,
      author:           "DPDPA Editorial Team",
      status:           "draft",
      approval_token:   approvalToken,
      scheduled_for:    tomorrow.toISOString(),
      created_at:       new Date().toISOString(),
    };

    const doc = await databases.createDocument(
      DB_ID, COLLECTIONS.BRIEFINGS, ID.unique(), briefingData
    );

    await sendBriefingApprovalEmail({ ...briefingData, id: doc.$id }, approvalToken)
      .catch(console.error);

    return NextResponse.json({ success: true, briefingId: doc.$id });
  } catch (error) {
    console.error("Briefing generate error:", error);
    return NextResponse.json({ error: "Failed to generate briefing." }, { status: 500 });
  }
}

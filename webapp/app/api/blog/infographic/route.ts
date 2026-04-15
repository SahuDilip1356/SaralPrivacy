import { NextRequest, NextResponse } from "next/server";
import { databases, storage, DB_ID, COLLECTIONS, ID } from "@/lib/appwrite";

// Allow up to 3 minutes for KIE.ai polling (120s timeout + buffer)
export const maxDuration = 180;

// ── KIE.ai config (same service as daily briefings pipeline) ──────────────────
const KIE_API_BASE    = "https://api.kie.ai/api/v1";
const KIE_CREATE_TASK = `${KIE_API_BASE}/jobs/createTask`;
const KIE_RECORD_INFO = `${KIE_API_BASE}/jobs/recordInfo`;

const POLL_INTERVAL_MS = 5000;   // 5 seconds between polls
const POLL_TIMEOUT_MS  = 120000; // 120 second max wait
const MAX_RETRIES      = 2;
const RETRY_DELAY_MS   = 8000;

// ── Brand tokens v3.0 (SaralPrivacy Brand Guidelines) ────────────────────────
const BRAND_NAVY  = "#121A2E";
const BRAND_GREEN = "#07B981";
const BRAND_TEAL  = "#35B6AE";
const BRAND_GOLD  = "#E8AB42";
const BRAND_SLATE = "#334155";
const BRAND_CLOUD = "#F7F9FC";
const BRAND_WHITE = "#FFFFFF";

// ── 4-palette system (A–D) ────────────────────────────────────────────────────
const PALETTES: Record<string, {
  name: string; background: string; heading: string;
  accent: string; highlight: string; body_text: string;
}> = {
  A: { name: "Trust Navy",    background: BRAND_NAVY,  heading: BRAND_WHITE, accent: BRAND_GREEN, highlight: BRAND_GOLD,  body_text: BRAND_CLOUD },
  B: { name: "Cloud & Green", background: BRAND_CLOUD, heading: BRAND_NAVY,  accent: BRAND_GREEN, highlight: BRAND_TEAL,  body_text: BRAND_SLATE },
  C: { name: "Teal Forward",  background: BRAND_WHITE, heading: BRAND_NAVY,  accent: BRAND_TEAL,  highlight: BRAND_GREEN, body_text: BRAND_SLATE },
  D: { name: "Midnight Gold", background: BRAND_NAVY,  heading: BRAND_GOLD,  accent: BRAND_TEAL,  highlight: BRAND_GREEN, body_text: BRAND_WHITE },
};

// Lane → palette mapping (kebab-case keys used by the blog editor)
const LANE_PALETTE_MAP: Record<string, string> = {
  "law-explained":       "A",
  "compliance-playbook": "D",
  "myth-fact":           "C",
  "sector-notes":        "B",
  "governance-watch":    "D",
};
const DEFAULT_PALETTE = "A";

function selectPalette(lane: string): typeof PALETTES[string] {
  const key = LANE_PALETTE_MAP[lane] ?? DEFAULT_PALETTE;
  return PALETTES[key];
}

function paletteStyle(p: typeof PALETTES[string]): string {
  return (
    `Professional infographic design. Clean, modern layout. ` +
    `Color palette: background ${p.background}, heading text ${p.heading}, ` +
    `primary accent ${p.accent}, highlight color ${p.highlight}, body text ${p.body_text}. ` +
    `Sans-serif typography. Indian business context. No extra watermarks from the model. No borders. Flat design style. ` +
    `Newsletter-ready, 600px wide format.`
  );
}

// ── Lane → infographic type mapping ──────────────────────────────────────────
const LANE_TYPE_MAP: Record<string, string> = {
  "law-explained":       "stat",
  "compliance-playbook": "process",
  "myth-fact":           "comparison",
  "sector-notes":        "checklist",
  "governance-watch":    "timeline",
};

// ── Layout instructions (palette-aware) ───────────────────────────────────────
function layoutInstructions(infType: string, p: typeof PALETTES[string]): string {
  switch (infType) {
    case "stat":
      return (
        `Large statistic callout cards. 2-3 bold numbers or key facts displayed prominently. ` +
        `Each card has a number/value, short label, and accent color bar. ` +
        `Horizontal layout. Cards use ${p.background} background with ${p.heading} headings and ${p.accent} highlights.`
      );
    case "process":
      return (
        `Vertical step-by-step process flowchart. ` +
        `Numbered steps with connecting arrows. ` +
        `Each step has an icon area, bold heading, and short description. ` +
        `${p.accent} numbered circles, ${p.highlight} arrows, ${p.background} card backgrounds.`
      );
    case "comparison":
      return (
        `Side-by-side comparison table. ` +
        `Two columns with a clear divider. ` +
        `Row-by-row comparison of attributes. ` +
        `${p.heading} headers, alternating ${p.background}/${p.body_text} rows, ${p.accent} highlights for key differences.`
      );
    case "checklist":
      return (
        `Visual checklist or summary card. ` +
        `Bullet points with checkmark icons. ` +
        `Clear heading at top, items below with icons. ` +
        `Two-column layout if more than 5 items. ` +
        `${p.heading} headings, ${p.accent} checkmarks.`
      );
    case "timeline":
      return (
        `Horizontal timeline. ` +
        `Nodes connected by a line showing progression. ` +
        `Each node has a year/label and short event description. ` +
        `${p.accent} line, ${p.highlight} milestone dots, ${p.background} background.`
      );
    default:
      return `Clean infographic layout with ${p.background} background and ${p.heading} headings.`;
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(params: {
  lane: string;
  title: string;
  excerpt: string;
  section_what_changed: string;
  section_law_says: string;
  section_do_now: string;
}): string {
  const infType   = LANE_TYPE_MAP[params.lane] ?? "stat";
  const palette   = selectPalette(params.lane);
  const layout    = layoutInstructions(infType, palette);
  const style     = paletteStyle(palette);
  const keyPoints = [
    params.section_what_changed,
    params.section_law_says,
    params.section_do_now,
  ]
    .filter(Boolean)
    .map((s) => s.trim().slice(0, 200))
    .join("\n");

  return `Create a professional newsletter infographic for a DPDPA compliance article.

Title: "${params.title}"
Summary: ${params.excerpt?.slice(0, 300) || ""}

Layout type: ${layout}

Key points to visualise:
${keyPoints}

Style: ${style}

The infographic must be self-contained and readable without additional context.
Include the title prominently at the top.
Label: "© SaralPrivacy™" in small text at the bottom right corner.
Image dimensions: approximately 560px wide × 280px tall (landscape, 2:1 ratio).`;
}

// ── KIE.ai API call (same pattern as tools/generate_infographic.py) ───────────

async function callKieNanoBanana(prompt: string, apiKey: string): Promise<Buffer> {
  const model = process.env.NANO_BANANA_MODEL ?? "nano-banana-2";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Step 1: Submit task
  const createRes = await fetch(KIE_CREATE_TASK, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: {
        prompt,
        aspect_ratio:  "16:9",
        resolution:    "1K",
        output_format: "jpg",
        google_search: false,
        image_input:   [],
      },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (createRes.status === 401) throw new Error("KIE.ai API key invalid or expired");
  if (createRes.status === 429) throw new Error("KIE.ai rate limit hit — try again shortly");
  if (!createRes.ok) throw new Error(`KIE.ai createTask failed: ${createRes.status}`);

  const createData = await createRes.json();
  if (createData.code !== 200) throw new Error(`KIE.ai createTask error: ${createData.msg}`);

  const taskId = createData.data?.taskId as string;
  if (!taskId) throw new Error("KIE.ai returned no taskId");

  // Step 2: Poll for completion
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const pollRes = await fetch(`${KIE_RECORD_INFO}?taskId=${taskId}`, {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    if (!pollRes.ok) throw new Error(`KIE.ai poll failed: ${pollRes.status}`);

    const pollData = await pollRes.json();
    if (pollData.code !== 200) throw new Error(`KIE.ai recordInfo error: ${JSON.stringify(pollData)}`);

    const task  = pollData.data ?? {};
    const state = task.state as string;

    if (state === "success") {
      const resultJson = JSON.parse(task.resultJson ?? "{}");
      const urls: string[] = resultJson.resultUrls ?? [];
      if (!urls.length) throw new Error("KIE.ai task succeeded but no result URL returned");

      const imgRes = await fetch(urls[0], { signal: AbortSignal.timeout(30000) });
      if (!imgRes.ok) throw new Error(`Failed to download KIE.ai image: ${imgRes.status}`);

      const arrayBuf = await imgRes.arrayBuffer();
      return Buffer.from(arrayBuf);
    }

    if (state === "failed" || state === "error") {
      throw new Error(`KIE.ai task failed: ${task.failMsg ?? "unknown error"}`);
    }
    // state === "pending" → keep polling
  }

  throw new Error(`KIE.ai task ${taskId} did not complete within ${POLL_TIMEOUT_MS / 1000}s`);
}

// ── Appwrite upload + URL ─────────────────────────────────────────────────────

async function uploadToAppwrite(imageBuffer: Buffer, docId: string): Promise<string> {
  const BUCKET_ID   = process.env.APPWRITE_BUCKET_ID!;
  const ENDPOINT    = process.env.APPWRITE_ENDPOINT!;
  const PROJECT_ID  = process.env.APPWRITE_PROJECT_ID!;
  const fileId      = `blog_inf_${docId}`;

  // Delete existing file if present (re-generation case)
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch {
    // File doesn't exist yet — fine
  }

  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" });
  const file = new File([blob], `${fileId}.jpg`, { type: "image/jpeg" });

  await storage.createFile(BUCKET_ID, fileId, file);

  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || !["authenticated", "blogger"].includes(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KIE_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      id: docId,
      lane,
      title,
      excerpt,
      section_what_changed,
      section_law_says,
      section_do_now,
    } = body;

    if (!docId || !title) {
      return NextResponse.json({ error: "id and title are required" }, { status: 400 });
    }

    const prompt = buildPrompt({ lane, title, excerpt, section_what_changed, section_law_says, section_do_now });

    // Try KIE.ai with retries (same retry logic as Python pipeline)
    let imageBuffer: Buffer | null = null;
    let lastError: string = "";

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        imageBuffer = await callKieNanoBanana(prompt, apiKey);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`[blog/infographic] KIE.ai attempt ${attempt} failed: ${lastError}`);
        if (attempt <= MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { error: `KIE.ai failed after ${MAX_RETRIES + 1} attempts: ${lastError}` },
        { status: 502 }
      );
    }

    // Upload to Appwrite Storage
    const publicUrl = await uploadToAppwrite(imageBuffer, docId);

    // Save infographic_url back to the blog_posts document
    await databases.updateDocument(DB_ID, COLLECTIONS.BLOG_POSTS, docId, {
      infographic_url: publicUrl,
    });

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: unknown) {
    console.error("[blog/infographic POST]", err);
    const message = err instanceof Error ? err.message : "Infographic generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

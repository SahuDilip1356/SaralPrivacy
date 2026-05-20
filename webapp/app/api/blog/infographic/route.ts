import { NextRequest, NextResponse } from "next/server";
import { databases, storage, DB_ID, COLLECTIONS } from "@/lib/appwrite";

// Deterministic SVG generation is sub-second; the old 180s budget was for AI polling.
export const maxDuration = 30;

// ── SaralPrivacy Brand v3.0 — locked tokens ───────────────────────────────────
const BRAND = {
  navy:  "#121A2E",
  green: "#07B981",
  teal:  "#35B6AE",
  gold:  "#E8AB42",
  slate: "#334155",
  cloud: "#F7F9FC",
  white: "#FFFFFF",
  mute:  "#94A3B8",
} as const;

type LayoutId = "stat" | "process" | "comparison" | "checklist" | "timeline";

const LANE_LAYOUT: Record<string, LayoutId> = {
  "law-explained":       "stat",
  "compliance-playbook": "process",
  "myth-fact":           "comparison",
  "sector-notes":        "checklist",
  "governance-watch":    "timeline",
};

const DEFAULT_LAYOUT: LayoutId = "stat";

interface InfographicInput {
  title: string;
  excerpt?: string;
  section_what_changed?: string;
  section_law_says?: string;
  section_do_now?: string;
  lane: string;
}

// ── Canvas ────────────────────────────────────────────────────────────────────
const W   = 1200;
const H   = 630;
const PAD = 60;

// ── XML / SVG primitives ──────────────────────────────────────────────────────

function esc(s: string): string {
  return (s ?? "")
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}

// SVG <text> has no auto-wrap; this approximate wrapper splits on character
// budget (Inter at the supplied size renders close enough to char-monospace
// estimate for short headings and bullets).
function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (lines.length >= maxLines) break;
    const next = cur ? cur + " " + w : w;
    if (next.length <= maxChars) cur = next;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  const used  = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (used < words.length && lines.length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[\s.,;:!?]*$/, "") + "…";
  }
  return lines;
}

function splitBullets(content: string, maxItems: number): string[] {
  return (content ?? "")
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s•·▪◦\-*\d.)]+/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, maxItems);
}

function textWrapped(s: string, opts: {
  x: number; y: number; maxChars: number; maxLines: number;
  lineHeight: number; fill: string; size: number; weight?: number; anchor?: "start" | "middle" | "end";
}): string {
  const lines = wrapText(s, opts.maxChars, opts.maxLines);
  if (!lines.length) return "";
  const tspans = lines.map((ln, i) =>
    `<tspan x="${opts.x}" dy="${i === 0 ? 0 : opts.lineHeight}">${esc(ln)}</tspan>`,
  ).join("");
  return `<text x="${opts.x}" y="${opts.y}" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${opts.size}" font-weight="${opts.weight ?? 400}" fill="${opts.fill}"${opts.anchor ? ` text-anchor="${opts.anchor}"` : ""}>${tspans}</text>`;
}

// ── Shared chrome: outer frame, title, footer ─────────────────────────────────

function frame(bg: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <title>SaralPrivacy — Verified DPDPA insights</title>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${body}
</svg>`;
}

function titleBlock(title: string, color: string): string {
  return textWrapped(title, {
    x: PAD, y: PAD + 36,
    maxChars: 50, maxLines: 2, lineHeight: 44,
    fill: color, size: 34, weight: 700,
  });
}

function footer(onDark: boolean): string {
  const txtFg = onDark ? BRAND.cloud : BRAND.slate;
  const meta  = BRAND.mute;
  return `
  <line x1="${PAD}" y1="${H - 60}" x2="${W - PAD}" y2="${H - 60}" stroke="${BRAND.green}" stroke-width="2"/>
  <text x="${PAD}" y="${H - 28}" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700" fill="${txtFg}">© SaralPrivacy</text>
  <text x="${W - PAD}" y="${H - 28}" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500" fill="${meta}" text-anchor="end">Verified DPDPA insights  ·  saralprivacy.com</text>
  `;
}

// ── Layout: STAT — three card columns on navy (law-explained) ─────────────────

function layoutStat(input: InfographicInput): string {
  const bullets: string[] = [];
  bullets.push(...splitBullets(input.section_what_changed ?? "", 1));
  bullets.push(...splitBullets(input.section_law_says    ?? "", 1));
  bullets.push(...splitBullets(input.section_do_now      ?? "", 1));
  while (bullets.length < 3) bullets.push("");

  const labels = ["What changed", "What the law says", "What to do now"];
  const gap    = 24;
  const cardW  = (W - PAD * 2 - gap * 2) / 3;
  const cardH  = 330;
  const cardY  = 190;

  const cards = bullets.slice(0, 3).map((b, i) => {
    const x = PAD + i * (cardW + gap);
    return `
    <rect x="${x}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${BRAND.cloud}" rx="12" ry="12"/>
    <rect x="${x}" y="${cardY}" width="${cardW}" height="6" fill="${BRAND.green}" rx="3" ry="3"/>
    <text x="${x + 24}" y="${cardY + 50}" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700" fill="${BRAND.green}" letter-spacing="2">${esc(labels[i].toUpperCase())}</text>
    ${textWrapped(b, {
      x: x + 24, y: cardY + 90,
      maxChars: 30, maxLines: 8, lineHeight: 26,
      fill: BRAND.navy, size: 17, weight: 500,
    })}`;
  }).join("");

  return frame(BRAND.navy,
    titleBlock(input.title, BRAND.white) + cards + footer(true),
  );
}

// ── Layout: PROCESS — vertical numbered steps on navy (compliance-playbook) ───

function layoutProcess(input: InfographicInput): string {
  const items = [
    ...splitBullets(input.section_do_now      ?? "", 5),
    ...splitBullets(input.section_what_changed ?? "", 5),
  ].slice(0, 5);
  while (items.length < 3) items.push("");

  const steps = items.length;
  const stepGap = 16;
  const startY  = 200;
  const stepH   = (H - startY - 90 - stepGap * (steps - 1)) / steps;

  const rows = items.map((it, i) => {
    const y = startY + i * (stepH + stepGap);
    const cx = PAD + 36;
    const cy = y + stepH / 2;
    return `
    <circle cx="${cx}" cy="${cy}" r="28" fill="${BRAND.green}"/>
    <text x="${cx}" y="${cy + 8}" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700" fill="${BRAND.white}" text-anchor="middle">${i + 1}</text>
    <rect x="${PAD + 88}" y="${y}" width="${W - PAD * 2 - 88}" height="${stepH}" fill="${BRAND.cloud}" rx="10" ry="10" opacity="0.06"/>
    ${textWrapped(it, {
      x: PAD + 108, y: y + 36,
      maxChars: 78, maxLines: 2, lineHeight: 24,
      fill: BRAND.white, size: 18, weight: 500,
    })}`;
  }).join("");

  return frame(BRAND.navy,
    titleBlock(input.title, BRAND.white) + rows + footer(true),
  );
}

// ── Layout: COMPARISON — two-column table on cloud (myth-fact) ────────────────

function layoutComparison(input: InfographicInput): string {
  const leftSrc  = splitBullets(input.section_what_changed ?? "", 5);
  const rightSrc = splitBullets(input.section_law_says     ?? input.section_do_now ?? "", 5);
  const rows     = Math.max(leftSrc.length, rightSrc.length, 3);

  const tableY  = 200;
  const tableH  = 330;
  const colW    = (W - PAD * 2) / 2;
  const headerH = 50;
  const rowH    = (tableH - headerH) / rows;

  let body = "";
  // Header row
  body += `
    <rect x="${PAD}"          y="${tableY}" width="${colW}" height="${headerH}" fill="${BRAND.navy}"  rx="10" ry="10"/>
    <rect x="${PAD + colW}"   y="${tableY}" width="${colW}" height="${headerH}" fill="${BRAND.green}" rx="10" ry="10"/>
    <text x="${PAD + 20}"        y="${tableY + 32}" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700" fill="${BRAND.cloud}" letter-spacing="2">CLAIM</text>
    <text x="${PAD + colW + 20}" y="${tableY + 32}" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700" fill="${BRAND.white}" letter-spacing="2">VERDICT</text>`;

  for (let i = 0; i < rows; i++) {
    const y = tableY + headerH + i * rowH;
    const stripe = i % 2 === 0 ? BRAND.cloud : "#EEF2F7";
    body += `
      <rect x="${PAD}" y="${y}" width="${W - PAD * 2}" height="${rowH}" fill="${stripe}"/>
      <line x1="${PAD + colW}" y1="${y}" x2="${PAD + colW}" y2="${y + rowH}" stroke="${BRAND.green}" stroke-width="2"/>
      ${textWrapped(leftSrc[i]  ?? "", { x: PAD + 20,        y: y + 26, maxChars: 44, maxLines: 2, lineHeight: 22, fill: BRAND.slate, size: 15, weight: 500 })}
      ${textWrapped(rightSrc[i] ?? "", { x: PAD + colW + 20, y: y + 26, maxChars: 44, maxLines: 2, lineHeight: 22, fill: BRAND.navy,  size: 15, weight: 600 })}`;
  }

  return frame(BRAND.cloud,
    titleBlock(input.title, BRAND.navy) + body + footer(false),
  );
}

// ── Layout: CHECKLIST — green checkmark bullets on cloud (sector-notes) ───────

function layoutChecklist(input: InfographicInput): string {
  const items = [
    ...splitBullets(input.section_do_now       ?? "", 8),
    ...splitBullets(input.section_what_changed ?? "", 8),
  ].slice(0, 8);
  while (items.length < 4) items.push("");

  const twoCol  = items.length > 4;
  const colW    = twoCol ? (W - PAD * 2 - 40) / 2 : W - PAD * 2;
  const perCol  = twoCol ? Math.ceil(items.length / 2) : items.length;
  const startY  = 200;
  const rowH    = 56;

  const rows = items.map((it, i) => {
    const col = twoCol && i >= perCol ? 1 : 0;
    const row = twoCol && i >= perCol ? i - perCol : i;
    const x   = PAD + col * (colW + 40);
    const y   = startY + row * rowH;
    return `
    <circle cx="${x + 16}" cy="${y + 14}" r="14" fill="${BRAND.green}"/>
    <path d="M ${x + 10} ${y + 14} l 4 4 l 8 -8" stroke="${BRAND.white}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${textWrapped(it, {
      x: x + 44, y: y + 18,
      maxChars: twoCol ? 38 : 80, maxLines: 2, lineHeight: 22,
      fill: BRAND.slate, size: 15, weight: 500,
    })}`;
  }).join("");

  return frame(BRAND.cloud,
    titleBlock(input.title, BRAND.navy) + rows + footer(false),
  );
}

// ── Layout: TIMELINE — horizontal milestones on navy (governance-watch) ───────

function layoutTimeline(input: InfographicInput): string {
  const items = [
    ...splitBullets(input.section_what_changed ?? "", 5),
    ...splitBullets(input.section_law_says     ?? "", 5),
  ].slice(0, 5);
  while (items.length < 3) items.push("");

  const count   = items.length;
  const lineY   = 330;
  const startX  = PAD + 40;
  const endX    = W - PAD - 40;
  const stepX   = count > 1 ? (endX - startX) / (count - 1) : 0;

  const dots = items.map((it, i) => {
    const cx = startX + i * stepX;
    const labelY = i % 2 === 0 ? lineY - 60 : lineY + 90;
    return `
    <circle cx="${cx}" cy="${lineY}" r="14" fill="${BRAND.gold}"/>
    <circle cx="${cx}" cy="${lineY}" r="6"  fill="${BRAND.navy}"/>
    ${textWrapped(it, {
      x: cx, y: labelY,
      maxChars: 22, maxLines: 3, lineHeight: 20,
      fill: BRAND.white, size: 14, weight: 500, anchor: "middle",
    })}`;
  }).join("");

  return frame(BRAND.navy,
    titleBlock(input.title, BRAND.white) +
    `<line x1="${startX}" y1="${lineY}" x2="${endX}" y2="${lineY}" stroke="${BRAND.green}" stroke-width="3" stroke-linecap="round"/>` +
    dots +
    footer(true),
  );
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

function buildSvg(input: InfographicInput): string {
  const layout = LANE_LAYOUT[input.lane] ?? DEFAULT_LAYOUT;
  switch (layout) {
    case "stat":       return layoutStat(input);
    case "process":    return layoutProcess(input);
    case "comparison": return layoutComparison(input);
    case "checklist":  return layoutChecklist(input);
    case "timeline":   return layoutTimeline(input);
  }
}

// ── Appwrite Storage upload ──────────────────────────────────────────────────

async function uploadSvg(svg: string, docId: string): Promise<string> {
  const BUCKET_ID  = process.env.APPWRITE_BUCKET_ID!;
  const ENDPOINT   = process.env.APPWRITE_ENDPOINT!;
  const PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;
  const fileId     = `blog_inf_${docId}`;

  // Replace any prior file (re-generation case)
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch {
    // File doesn't exist yet — fine
  }

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const file = new File([blob], `${fileId}.svg`, { type: "image/svg+xml" });

  await storage.createFile(BUCKET_ID, fileId, file);

  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || !["authenticated", "blogger"].includes(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    } = body as Partial<InfographicInput> & { id?: string };

    if (!docId || !title) {
      return NextResponse.json({ error: "id and title are required" }, { status: 400 });
    }

    const svg = buildSvg({
      title,
      excerpt,
      section_what_changed,
      section_law_says,
      section_do_now,
      lane: lane ?? "",
    });

    const publicUrl = await uploadSvg(svg, docId);

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

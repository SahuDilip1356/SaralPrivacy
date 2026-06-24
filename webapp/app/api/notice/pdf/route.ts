import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/abuseGuard";
import { noticeDocumentHtml, PDF_HEADER, PDF_FOOTER } from "@/lib/notice-pack/render";
import type { NPState } from "@/lib/notice-pack/types";

// Puppeteer + headless chromium need the Node runtime (not edge) and more time
// than a default function — PDF render is CPU-bound.
export const runtime = "nodejs";
export const maxDuration = 60;

// Permissive schema: we only PDF the user's own answers, and buildNotice()
// escapes every field before it reaches the renderer, so the risk is bounded.
// We validate shape + clamp sizes to keep the render fast and the payload sane.
const str = (max: number) => z.string().max(max).optional().default("");
const Body = z.object({
  org: str(160),
  website: str(200),
  sector: str(80),
  data: z.array(z.string().max(120)).max(80).optional().default([]),
  contexts: z.array(z.string().max(60)).max(40).optional().default([]),
  purpose: z.record(z.string(), z.string().max(400)).optional().default({}),
  consentVia: str(80),
  withdrawMethod: str(80),
  withdrawContact: str(200),
  vendors: z.array(z.string().max(120)).max(40).optional().default([]),
  noVendors: z.boolean().optional().default(false),
  children: z.enum(["", "Yes", "No", "Not sure"]).optional().default(""),
  childWhy: z.array(z.string().max(120)).max(20).optional().default([]),
  retention: str(60),
  cName: str(120),
  cEmail: str(160),
  cPhone: str(40),
  regAddress: str(240),
  slug: str(80),
  lang: z.enum(["en", "hi"]).optional().default("en"),
  effIso: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(`notice-pdf:${getClientIp(request)}`, 6, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let parsed;
  try {
    parsed = Body.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notice data." }, { status: 400 });
  }
  const { effIso, ...state } = parsed.data;

  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;
  try {
    const html = noticeDocumentHtml(state as NPState, { effIso });
    browser = await launchBrowser();
    const page = await browser.newPage();
    // The notice is self-contained (inline CSS, no external assets), so "load"
    // is sufficient — no network round-trips to idle-wait on.
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: PDF_HEADER,
      footerTemplate: PDF_FOOTER,
      margin: { top: "18mm", bottom: "20mm", left: "16mm", right: "16mm" },
    });

    const fileName = `dpdpa-privacy-notice-${slugForFile(state.org)}.pdf`;
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("notice pdf error:", error);
    // Client keeps a browser-print fallback for this case.
    return NextResponse.json({ error: "Could not generate the PDF. Please try the print fallback." }, { status: 500 });
  } finally {
    await browser?.close().catch(() => {});
  }
}

const slugForFile = (s: string) =>
  (s || "your-business").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "your-business";

// Launch headless chromium. On Vercel we use @sparticuz/chromium's bundled
// binary; locally, set CHROME_EXECUTABLE_PATH to a system Chrome/Chromium.
async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;
  const chromium = (await import("@sparticuz/chromium")).default;
  const localChrome = process.env.CHROME_EXECUTABLE_PATH;
  // chromium.args are tuned for serverless; locally, pass none and let puppeteer
  // apply its own defaults for the system Chrome at CHROME_EXECUTABLE_PATH.
  return puppeteer.launch({
    args: localChrome ? [] : chromium.args,
    executablePath: localChrome || (await chromium.executablePath()),
    headless: true,
  });
}

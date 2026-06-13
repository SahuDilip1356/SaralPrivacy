// Headless smoke test of /discovery. Run while dev server is up on :3100.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3100";
const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1400 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("console", (m) => m.type() === "error" && !m.text().includes("googletagmanager") && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

// Stub the lead API to success so we can verify the client download + sent state
// independent of the local Appwrite schema (dev DB is missing the `source` attr).
await page.route("**/api/template-download", (route) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) }),
);

async function runToResult(quickChip) {
  await page.goto(`${BASE}/discovery`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/discovery`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=What kind of business is this?", { timeout: 15000 });
  await page.click(`button.quick-chip:has-text('${quickChip}')`);
  await page.click("button.btn-primary:has-text('Continue')");
  await page.waitForSelector("text=confirm the data you handle");
  await page.click("button.btn-primary:has-text('Continue')");
  await page.waitForSelector(".cq-opts");
  for (let i = 0; i < 3; i++) {
    const opts = await page.$$(".cq");
    await opts[i].$eval(".cq-opt", (b) => b.click());
  }
  await page.click("button.btn-primary:has-text('See my risk snapshot')");
  await page.waitForSelector(".gauge");
}

// ── A. dedicated-pack path (diagnostic-labs → clinic checklist), incl. download ──
await runToResult("Diagnostic lab");
const score = await page.$eval(".gauge-score", (e) => e.textContent);
const band = await page.$eval(".rv-pill", (e) => e.textContent);
const obls = await page.$$eval(".oblig-chip", (e) => e.map((x) => x.textContent));
console.log(`✓ dedicated result: score=${score} band=${band}`);
console.log(`  obligations: ${obls.join(" · ")}`);

await page.click("button.btn-primary:has-text('Get the checklist')");
await page.waitForSelector("#d-email");
// invalid email → inline error
await page.fill("#d-email", "nope");
await page.click("button.btn-primary:has-text('Download the checklist')");
console.log(`✓ invalid email inline error: ${!!(await page.$(".field-err"))}`);
// valid → expect a download
await page.fill("#d-email", "owner@lab.example");
await page.fill("#d-biz", "Acme Diagnostics");
await page.fill("#d-name", "Asha");
await page.fill("#d-phone", "9999999999");
await page.selectOption("#d-emp", "11-50");
const [dl] = await Promise.all([
  page.waitForEvent("download", { timeout: 8000 }).catch(() => null),
  page.click("button.btn-primary:has-text('Download the checklist')"),
]);
console.log(`✓ checklist downloaded: ${dl ? dl.suggestedFilename() : "NO DOWNLOAD"}`);
await page.waitForSelector("text=Your checklist is downloading");
console.log("✓ sent state shown");

// ── B. generic niche (no dedicated PDF) → assessment CTA, no form ──
await runToResult("CA firm");
// CA firms IS dedicated; use the picker for a generic one instead — pick Manufacturing → Pharma
await page.goto(`${BASE}/discovery`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("text=What kind of business is this?");
await page.click(".picker2 .dd:nth-child(1) .dd-field");
await page.click(".dd-item:has-text('Manufacturing & Industrial Units')");
await page.click(".picker2 .dd:nth-child(2) .dd-field");
await page.fill(".dd-search input", "pharma");
await page.click(".dd-item:has-text('Pharma')");
await page.click("button.btn-primary:has-text('Continue')");
await page.waitForSelector("text=confirm the data you handle");
await page.click("button.btn-primary:has-text('Continue')");
await page.waitForSelector(".cq-opts");
for (let i = 0; i < 3; i++) { const o = await page.$$(".cq"); await o[i].$eval(".cq-opt", (b) => b.click()); }
await page.click("button.btn-primary:has-text('See my risk snapshot')");
await page.waitForSelector(".gauge");
const genHasForm = await page.$("button:has-text('Get the checklist')");
const genHasAssess = await page.$(".result-cta a:has-text('Take the full assessment')");
console.log(`✓ generic niche: checklistBtn=${!!genHasForm} assessmentCTA=${!!genHasAssess}`);

console.log(errors.length ? `\n✗ ERRORS:\n${errors.join("\n")}` : "\n✓ no console/page errors (excl. GA CSP)");
await browser.close();
process.exit(errors.length ? 1 : 0);

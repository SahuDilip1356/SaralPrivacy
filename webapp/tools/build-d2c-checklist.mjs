// Generates the branded "D2C Brand DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-d2c-checklist.mjs   (from webapp/webapp)
// Output: public/templates/d2c-brand-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/d2c-brand-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Customer data collection & minimisation",
    items: [
      "List the customer data you collect at checkout, in accounts, in support and in marketing.",
      "Collect only what you actually use — drop fields you don't need.",
      "Avoid reusing customer lists exported from marketplaces for your own marketing without consent.",
      "Keep one primary customer record so you always know what you hold and where.",
      "Show a clear privacy notice at the point you collect data — not buried in the footer.",
    ],
  },
  {
    n: 2,
    title: "Marketing consent (WhatsApp / SMS / email)",
    items: [
      "Capture a clear, unticked opt-in before any promotional WhatsApp, SMS or email.",
      "Keep marketing consent separate from order acceptance — a purchase is not consent.",
      "Use a separate opt-in for each channel (email, SMS, WhatsApp), not one bundled box.",
      "Record how and when each customer opted in, as evidence.",
      "Re-consent any list built from bought, scraped or pre-ticked sources.",
    ],
  },
  {
    n: 3,
    title: "Unsubscribe & preference management",
    items: [
      "Offer a one-click opt-out and honour it across every channel, not just email.",
      "Maintain a single customer preference the customer can view and change.",
      "Stop WhatsApp/SMS marketing the moment a customer opts out, everywhere.",
      "Confirm opt-out requests and apply them within a defined timeline.",
      "Don't rely on manual 'remove me when they ask' handling.",
    ],
  },
  {
    n: 4,
    title: "Tracking, pixels & adtech disclosure",
    items: [
      "Inventory every pixel, tag and script on your store — Meta, Google, TikTok, recording tools.",
      "Remove any agency-managed or unknown scripts you can't account for.",
      "Disclose all tracking tools in your privacy notice.",
      "Add a consent mechanism before non-essential / remarketing tracking fires.",
      "Review the tag list whenever an agency or app changes your storefront.",
    ],
  },
  {
    n: 5,
    title: "Lifecycle marketing & profiling",
    items: [
      "List your automated flows — cart abandonment, win-back, recommendations, loyalty.",
      "Disclose customer segmentation and lookalike-audience use, and get consent where needed.",
      "Treat personalisation that profiles customers as a purpose to disclose, not a default.",
      "Make sure lifecycle messages respect the customer's opt-out state.",
      "Avoid sharing customer data with ad platforms beyond what the customer agreed to.",
    ],
  },
  {
    n: 6,
    title: "Vendor & processor management",
    items: [
      "List every vendor that touches customer data — payment, logistics, CRM, email/SMS, plugins, agency.",
      "Put data-processing terms in place with each vendor (a DPA).",
      "Vet third-party Shopify/WooCommerce plugins before installing — they can read customer data.",
      "Confirm what your marketing agency stores and where, if it handles your data.",
      "Remove vendors and apps you no longer use, and revoke their access.",
    ],
  },
  {
    n: 7,
    title: "Store-admin & account access",
    items: [
      "Use role-based access for your store admin, marketing tools and exports.",
      "Avoid shared logins — give each team member their own account.",
      "Turn on MFA for every account that can open customer data.",
      "Revoke ex-staff and ex-agency access the day the relationship ends.",
      "Review who can export the customer list at least twice a year.",
    ],
  },
  {
    n: 8,
    title: "Sensitive & health / body data",
    items: [
      "Identify any skin, hair, body, health or wellness data you collect (beauty, fitness, food, wellness).",
      "Treat it as sensitive — stronger consent, tighter access, clear purpose.",
      "Avoid using health/body data for ad targeting or lookalikes without explicit consent.",
      "Limit who inside the team can see sensitive customer attributes.",
      "Delete sensitive data you no longer need for the stated purpose.",
    ],
  },
  {
    n: 9,
    title: "Customer rights (access / correction / deletion)",
    items: [
      "Publish a simple way for customers to access, correct or delete their data.",
      "Define who handles requests and a target response timeline.",
      "Verify identity before acting on a request.",
      "Delete across store, marketing tools, exports and backups — not just the primary record.",
      "Log each request and what you did, as evidence of compliance.",
    ],
  },
  {
    n: 10,
    title: "Retention & breach readiness",
    items: [
      "Set how long you keep customer data, and delete inactive records on a schedule.",
      "Don't keep all customer data indefinitely by default.",
      "Know which vendors hold copies of your customer data.",
      "Have a basic breach-response plan: who to tell, how fast, what to record.",
      "Write retention rules down so the whole team applies them consistently.",
    ],
  },
];

const today = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" });

const sectionHtml = SECTIONS.map(
  (s) => `
  <section class="sec">
    <h2><span class="num">${s.n}</span>${s.title}</h2>
    <ul>
      ${s.items.map((it) => `<li><span class="box"></span><span class="txt">${it}</span></li>`).join("")}
    </ul>
  </section>`
).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  :root{
    --navy:#121A2E; --green:#07B981; --gold:#E8AB42; --teal:#35B6AE;
    --slate:#334155; --muted:#94A3B8; --pearl:#F7F9FC; --border:#E2E8F0;
  }
  *{box-sizing:border-box;}
  @page{ size:A4; margin:14mm 14mm 16mm; }
  body{ font-family:-apple-system,'Helvetica Neue',Arial,sans-serif; color:var(--slate); margin:0; font-size:11.5px; line-height:1.5; }
  .cover{ background:var(--navy); color:#fff; padding:26px 28px; border-radius:14px; margin-bottom:22px; }
  .brand{ display:flex; align-items:center; gap:8px; font-weight:700; font-size:13px; color:var(--teal); letter-spacing:.3px; }
  .dot{ width:9px;height:9px;border-radius:50%;background:var(--green); display:inline-block; }
  .cover h1{ font-size:25px; margin:12px 0 8px; color:#fff; line-height:1.18; }
  .cover p{ margin:0; color:#CBD5E1; font-size:11.5px; max-width:62ch; }
  .chips{ margin-top:14px; }
  .chip{ display:inline-block; border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.08);
         color:#E2E8F0; font-size:9px; font-weight:600; padding:3px 8px; border-radius:99px; margin:0 4px 4px 0; }
  .lead{ background:var(--pearl); border:1px solid var(--border); border-left:3px solid var(--green);
         border-radius:0 8px 8px 0; padding:12px 14px; margin-bottom:20px; font-size:11px; }
  .lead strong{ color:var(--navy); }
  .sec{ break-inside:avoid; border:1px solid var(--border); border-radius:10px; padding:14px 16px; margin-bottom:12px; background:#fff; }
  .sec h2{ font-size:13.5px; color:var(--navy); margin:0 0 10px; display:flex; align-items:center; gap:9px; }
  .num{ display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:6px;
        background:var(--teal); color:#fff; font-size:11px; font-weight:700; }
  ul{ list-style:none; margin:0; padding:0; }
  li{ display:flex; gap:9px; padding:4px 0; align-items:flex-start; }
  .box{ flex:0 0 auto; width:12px; height:12px; border:1.6px solid var(--gold); border-radius:3px; margin-top:2px; }
  .txt{ flex:1; }
  .footer{ margin-top:14px; border-top:1px solid var(--border); padding-top:10px; font-size:9px; color:var(--muted); display:flex; justify-content:space-between; }
  .footer b{ color:var(--navy); }
</style></head><body>
  <div class="cover">
    <div class="brand"><span class="dot"></span>SaralPrivacy</div>
    <h1>D2C Brand DPDPA Starter Checklist</h1>
    <p>Your D2C brand doesn't just sell products — it tracks, messages and retargets customers every day. Work through these ten areas to bring marketing consent, tracking, vendor sharing, customer data and retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Customer Data","Marketing Consent","WhatsApp","SMS","Meta Pixel","Retargeting","Vendors","Unsubscribe","Health Data","Retention"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with marketing consent, unsubscribe/preferences and tracking disclosure — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

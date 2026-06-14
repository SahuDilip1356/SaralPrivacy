// Generates the branded "Gym / Salon / Spa DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-wellness-checklist.mjs   (from webapp/webapp)
// Output: public/templates/gyms-salons-spas-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/gyms-salons-spas-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Customer & membership data",
    items: [
      "List where customer data is collected — booking app, walk-in form, WhatsApp, Instagram DMs, staff notes.",
      "Collect only the membership, contact and appointment data you actually need.",
      "Keep one primary record (app/CRM) so you always know what you hold.",
      "Capture emergency contacts and family/group details only where needed.",
      "Tell customers how their data is used and shared at sign-up.",
    ],
  },
  {
    n: 2,
    title: "Health & body data",
    items: [
      "Collect fitness goals, weight, BMI, injuries and allergies only when needed.",
      "Treat health and body data as high-impact — restrict who can see it.",
      "Keep health declarations out of uncontrolled WhatsApp and staff notes.",
      "Store body/health data in an access-controlled system, not personal phones.",
      "Set a deletion rule for old health and body records.",
    ],
  },
  {
    n: 3,
    title: "Skin / hair / therapy consultation notes",
    items: [
      "Limit consultation notes to the staff who deliver the service.",
      "Avoid storing consultation notes in shared chats or open sheets.",
      "Don't reuse consultation/therapy notes for marketing without consent.",
      "Review who can read and edit consultation records.",
      "Apply a retention rule to old consultation notes.",
    ],
  },
  {
    n: 4,
    title: "Customer photos & before-after images",
    items: [
      "Get separate, documented consent before using customer photos or videos.",
      "Offer a clear removal process for photos and testimonials on request.",
      "Don't post before-after or bridal photos without specific consent.",
      "Keep customer photos off staff personal phones and personal social media.",
      "Store and delete customer images under a defined retention rule.",
    ],
  },
  {
    n: 5,
    title: "WhatsApp campaigns & appointment reminders",
    items: [
      "Separate promotional messages from transactional appointment reminders.",
      "Get opt-in for promotions and offer an easy opt-out.",
      "Keep a central record of message preferences and consent.",
      "Avoid adding customers to broadcast lists without permission.",
      "Don't run campaigns from staff personal WhatsApp accounts.",
    ],
  },
  {
    n: 6,
    title: "Appointment app / CRM / gym software",
    items: [
      "Consolidate customer data into an app/CRM with role-based access.",
      "Limit which staff can view full customer profiles and history.",
      "Turn on MFA on app, CRM, email and admin accounts.",
      "Confirm what your software vendors store and for how long.",
      "Review access at least twice a year.",
    ],
  },
  {
    n: 7,
    title: "Staff phones & personal WhatsApp",
    items: [
      "Move customer communication to business channels, not personal phones.",
      "Don't let staff keep customer photos or notes on personal devices.",
      "Prohibit personal WhatsApp for customer follow-up.",
      "Brief staff on what they can and can't store or share.",
      "Wipe customer data from devices when staff leave.",
    ],
  },
  {
    n: 8,
    title: "Trainer / therapist / beautician access",
    items: [
      "Give each role only the customer data it needs.",
      "Don't share logins across staff, branches or vendors.",
      "Remove ex-staff and old vendor/branch access the same day they leave.",
      "Keep branch-level systems consistent and access-controlled.",
      "Review access for biometric/body-analysis devices and CCTV.",
    ],
  },
  {
    n: 9,
    title: "Customer record & photo retention",
    items: [
      "Set a retention period for old member records, photos and consultation notes.",
      "Don't keep customer data, photos and notes indefinitely for marketing.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Offer customers a way to request removal of their photos and records.",
      "Write retention rules down so the whole team applies them consistently.",
    ],
  },
  {
    n: 10,
    title: "Wrong-photo sharing & breach response",
    items: [
      "Write a one-page plan: who to call and what to do first if a photo or record reaches the wrong person.",
      "Know how to quickly lock a compromised WhatsApp, app or CRM account.",
      "Keep a contact list (IT, software vendor, and a way to reach affected customers).",
      "Be ready to notify the Data Protection Board and affected customers as required.",
      "After any incident, record what happened and what you changed.",
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
    <h1>Gym / Salon / Spa DPDPA Starter Checklist</h1>
    <p>Your gym, salon or spa doesn't just manage appointments — it stores health, body and image data every day. Work through these ten areas to bring customer photos, health/body data, staff access and old-record retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Membership Data","Health Details","Body Measurements","Customer Photos","Photo Consent","WhatsApp Campaigns","Staff Access","Retention"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with photo consent, health-data access and staff phones — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

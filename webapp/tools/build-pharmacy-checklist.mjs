// Generates the branded "Pharmacy DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-pharmacy-checklist.mjs   (from webapp/webapp)
// Output: public/templates/pharmacy-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/pharmacy-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Prescription collection",
    items: [
      "List where prescriptions are collected — in-store, WhatsApp, app/website, doctor, delivery agent.",
      "Collect only the prescription and customer data the order actually needs.",
      "Prefer a secure app or website upload over WhatsApp and email.",
      "Keep one primary billing/POS record so you always know what you hold.",
      "Tell customers how their prescription and contact data will be used.",
    ],
  },
  {
    n: 2,
    title: "WhatsApp prescription handling",
    items: [
      "Reduce prescription images arriving and sitting in WhatsApp.",
      "Verify the recipient's number before sending any prescription or order detail.",
      "Don't forward prescriptions into staff or vendor WhatsApp groups.",
      "Clear prescription images from chats once moved into your system.",
      "Use business channels, not staff personal phones, for prescriptions.",
    ],
  },
  {
    n: 3,
    title: "Medicine-history & health indicators",
    items: [
      "Treat medicine order history as high-impact — it can reveal health conditions.",
      "Limit who can view medicine history and condition notes.",
      "Don't use chronic-care, mental-health or other high-impact categories for targeting without consent.",
      "Avoid storing diagnosis notes unless genuinely needed.",
      "Apply extra care to fertility, sexual-health, oncology and HIV-related records.",
    ],
  },
  {
    n: 4,
    title: "Refill reminder & promotional messaging",
    items: [
      "Get clear opt-in before sending refill or promotional messages.",
      "Offer an easy unsubscribe and honour preferences.",
      "Don't base health-related reminders on medicine history without separate consent.",
      "Keep a record of consent and message preferences.",
      "Separate transactional order updates from promotional messaging.",
    ],
  },
  {
    n: 5,
    title: "Delivery partner data-sharing",
    items: [
      "Share only what delivery partners need for fulfilment — not full prescription details.",
      "Keep a register of which delivery and courier partners receive customer data.",
      "Confirm what each partner stores and for how long.",
      "Instruct delivery staff to use business channels, not personal phones.",
      "Review delivery-partner access and sharing periodically.",
    ],
  },
  {
    n: 6,
    title: "Pharmacy billing / POS software access",
    items: [
      "Consolidate prescriptions and orders into billing/POS software with role-based access.",
      "Limit which staff can view full customer and prescription records.",
      "Turn on MFA on billing, email, cloud and online-pharmacy accounts.",
      "Avoid keeping prescription data in loose sheets, inboxes and staff devices.",
      "Review who can access prescription records at least twice a year.",
    ],
  },
  {
    n: 7,
    title: "Staff, branch & vendor access",
    items: [
      "Give pharmacists, counter and delivery staff only the access their role needs.",
      "Don't share logins or passwords across staff or branches.",
      "Remove ex-staff and old vendor/branch access the same day they leave.",
      "Keep branch-level systems consistent and access-controlled.",
      "Limit IT and software-vendor access to what support actually requires.",
    ],
  },
  {
    n: 8,
    title: "Online pharmacy & telemedicine partners",
    items: [
      "Know what customer and prescription data online platforms and aggregators hold.",
      "Share only what telemedicine and platform partners need for the service.",
      "Confirm data-sharing terms and retention with each platform partner.",
      "Apply a retention rule to data pulled from online dashboards.",
      "Restrict which staff can access platform and telemedicine dashboards.",
    ],
  },
  {
    n: 9,
    title: "Old prescription & order-history retention",
    items: [
      "Set a retention period for old prescriptions, medicine history and WhatsApp orders.",
      "Don't keep customer and prescription records indefinitely for convenience or refills.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Offer customers a way to request correction or deletion of old data.",
      "Write retention rules down so the whole team applies them consistently.",
    ],
  },
  {
    n: 10,
    title: "Wrong-prescription sharing & breach response",
    items: [
      "Write a one-page plan: who to call and what to do first if a prescription reaches the wrong person.",
      "Know how to quickly lock a compromised WhatsApp, email or billing account.",
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
    <h1>Pharmacy DPDPA Starter Checklist</h1>
    <p>Your pharmacy doesn't just sell medicines — it stores prescription and medicine-history data every day. Work through these ten areas to bring prescription handling, medicine-history controls, vendor sharing, staff access and old-record retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Prescriptions","Medicine History","WhatsApp Orders","Refill Reminders","Delivery Partners","Health Indicators","Billing Software","Old Records"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with prescription handling, medicine-history controls and delivery-partner access — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

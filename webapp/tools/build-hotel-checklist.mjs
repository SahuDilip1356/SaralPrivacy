// Generates the branded "Hotels & Travel DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-hotel-checklist.mjs   (from webapp/webapp)
// Output: public/templates/hotels-travel-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/hotels-travel-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Guest & traveller data inventory",
    items: [
      "List where guest and traveller data is collected — front desk, booking desk, website, OTAs, WhatsApp, agents.",
      "Record what each guest record holds, why, and who can access it.",
      "Collect only the data the booking or trip actually needs.",
      "Keep one primary PMS/CRM record so you always know what you hold.",
      "Explain data use and sharing at booking or check-in.",
    ],
  },
  {
    n: 2,
    title: "Aadhaar / passport / visa documents",
    items: [
      "Collect Aadhaar, passport and visa copies only when the stay or trip needs them.",
      "Prefer a secure booking portal or upload link over WhatsApp and email.",
      "Don't keep duplicate ID copies on staff phones or personal accounts.",
      "Restrict who can open and forward passport and visa documents.",
      "Delete ID and travel documents once the stay or trip is complete.",
    ],
  },
  {
    n: 3,
    title: "WhatsApp & email document sharing",
    items: [
      "Reduce passport, ID and ticket exchange over WhatsApp and email.",
      "Verify the recipient's number or address before sending any document.",
      "Don't forward guest IDs into staff or vendor WhatsApp groups.",
      "Clear documents from chats once moved into your PMS/records.",
      "Use business channels, not staff personal accounts, for guest documents.",
    ],
  },
  {
    n: 4,
    title: "OTA & booking-engine data",
    items: [
      "Know what guest data each OTA and booking engine collects and stores.",
      "Download only the guest data you need for service, not for unrelated marketing.",
      "Apply a retention rule to data pulled from OTA dashboards.",
      "Restrict who in your team can access OTA and booking-engine dashboards.",
      "Confirm OTA and channel-manager sharing terms for guest data.",
    ],
  },
  {
    n: 5,
    title: "PMS / CRM / front-desk access",
    items: [
      "Consolidate guest records into a PMS/CRM with role-based access.",
      "Limit which staff can view full guest records and ID copies.",
      "Turn on MFA on PMS, email, cloud and OTA accounts.",
      "Remove ex-staff and old vendor/agent access the same day they leave.",
      "Review who can access guest data at least twice a year.",
    ],
  },
  {
    n: 6,
    title: "Travel agent & vendor sharing",
    items: [
      "Share the minimum guest detail needed with transport vendors, guides and partners.",
      "Keep a simple register of which vendors receive guest data and why.",
      "Avoid forwarding full IDs where only contact or booking details are needed.",
      "Confirm what each vendor stores and for how long.",
      "Brief field staff and agents on what can and can't be shared.",
    ],
  },
  {
    n: 7,
    title: "Foreign guest / C-Form data",
    items: [
      "Handle foreign guest and C-Form data through a defined, controlled process.",
      "Avoid moving passport and visa copies through WhatsApp or open inboxes.",
      "Share foreign guest data only with the authorities and parties that require it.",
      "Store C-Form-related records with access control, not reception folders.",
      "Apply a clear retention and deletion rule to foreign guest records.",
    ],
  },
  {
    n: 8,
    title: "CCTV, key-card & Wi-Fi logs",
    items: [
      "Document the purpose for CCTV, key-card and Wi-Fi logging.",
      "Limit who can view CCTV footage and access logs.",
      "Place clear notices where CCTV and monitoring are in use.",
      "Set a retention period for CCTV footage and access logs.",
      "Review monitoring coverage so it doesn't collect more than needed.",
    ],
  },
  {
    n: 9,
    title: "Loyalty & promotional messaging",
    items: [
      "Get clear opt-in before sending promotional or loyalty messages to guests.",
      "Offer an easy unsubscribe and honour preferences.",
      "Don't reuse OTA or booking data for marketing without a lawful basis.",
      "Keep a record of consent and message preferences.",
      "Separate transactional confirmations from promotional messaging.",
    ],
  },
  {
    n: 10,
    title: "Guest ID, passport & booking retention",
    items: [
      "Set a retention period for guest IDs, passport copies, bookings and travel documents.",
      "Don't keep old guest records indefinitely for repeat-booking convenience.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Offer guests a way to request deletion or correction of old data.",
      "Write a one-page plan for a wrong-recipient share or an exposed passport folder.",
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
    <h1>Hotels &amp; Travel DPDPA Starter Checklist</h1>
    <p>Your hotel or travel business doesn't just manage bookings — it collects, shares and stores guest travel data every day. Work through these ten areas to bring guest IDs, passport handling, OTA sharing, system access and old-record retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Guest IDs","Passport Copies","OTA Sharing","Travel Documents","WhatsApp Confirmations","CCTV","PMS Access","Old Guest Records"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with ID/passport handling, OTA/vendor sharing and PMS access — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

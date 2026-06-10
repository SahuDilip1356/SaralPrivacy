// Generates the branded "Real Estate DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-realty-checklist.mjs   (from webapp/webapp)
// Output: public/templates/real-estate-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/real-estate-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Buyer / tenant / seller data inventory",
    items: [
      "List where buyer, tenant, seller and landlord data is collected — calls, WhatsApp, site visits, lead forms, referrals.",
      "Record what each lead holds, why, and who can access it.",
      "Collect only the data the deal actually needs.",
      "Keep one primary lead/CRM record so you always know what you hold.",
      "Explain data use and sharing in your lead or site-visit form.",
    ],
  },
  {
    n: 2,
    title: "PAN / Aadhaar / passport KYC",
    items: [
      "Collect PAN, Aadhaar and passport copies only when the deal needs them.",
      "Prefer a secure upload link or portal over WhatsApp and email.",
      "Mask or limit ID numbers where the full value isn't needed.",
      "Don't keep duplicate ID copies on staff phones or personal accounts.",
      "Delete ID copies once the deal closes or the purpose ends.",
    ],
  },
  {
    n: 3,
    title: "Rent agreement & sale deed handling",
    items: [
      "Store agreements, deeds and title papers in access-controlled systems, not open folders.",
      "Restrict who can open and forward property documents.",
      "Avoid keeping duplicate copies across email, WhatsApp and devices.",
      "Track which documents were shared with whom for registration or filing.",
      "Apply a retention rule to closed-deal documents.",
    ],
  },
  {
    n: 4,
    title: "WhatsApp document sharing",
    items: [
      "Reduce PAN, Aadhaar and agreement exchange over WhatsApp.",
      "Verify the recipient's number before sending any document.",
      "Don't forward KYC or property papers into broker groups.",
      "Clear documents from chats once moved into your CRM/records.",
      "Use business channels, not staff personal accounts, for client documents.",
    ],
  },
  {
    n: 5,
    title: "Broker-network & co-broker sharing",
    items: [
      "Share buyer/tenant details only with client instruction or a documented purpose.",
      "Avoid circulating leads in open co-broker WhatsApp groups.",
      "Don't share lead sheets containing contacts and KYC broadly.",
      "Tell clients their details may be shared with co-brokers and partners.",
      "Keep a record of what was shared, with whom, and why.",
    ],
  },
  {
    n: 6,
    title: "Builder / society / landlord sharing",
    items: [
      "Share the minimum buyer/tenant detail needed with builders, societies and landlords.",
      "Confirm what each party stores and for how long.",
      "Avoid forwarding full KYC where only contact details are needed.",
      "Brief field staff on what can and can't be shared.",
      "Record onward sharing so you can answer client questions later.",
    ],
  },
  {
    n: 7,
    title: "Loan partner & bank document sharing",
    items: [
      "Share income, bank and loan documents with lenders only with client awareness/consent.",
      "Keep lender sharing purposeful and access-controlled.",
      "Avoid forwarding financial documents case-by-case over WhatsApp/email.",
      "Confirm what loan agents/NBFCs store and for how long.",
      "Record what financial data was shared, with whom, and why.",
    ],
  },
  {
    n: 8,
    title: "CRM / Google Sheets / staff phone access",
    items: [
      "Consolidate leads and KYC into a CRM/system with role-based access.",
      "Limit Google Sheets/Excel lead lists and who can open them.",
      "Turn on MFA on email, cloud and CRM accounts.",
      "Remove ex-staff and old broker access the same day they leave.",
      "Review who can access leads and documents at least twice a year.",
    ],
  },
  {
    n: 9,
    title: "Old lead & closed-deal retention",
    items: [
      "Set a retention period for old leads, KYC copies, agreements and property papers.",
      "Don't keep old buyer/tenant databases indefinitely for 'future deals'.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Offer clients a way to request deletion or correction of old data.",
      "Write retention rules down so the whole team applies them consistently.",
    ],
  },
  {
    n: 10,
    title: "Wrong-recipient & breach response",
    items: [
      "Write a one-page plan: who to call and what to do first if a document reaches the wrong person.",
      "Know how to quickly lock a compromised WhatsApp, email or CRM account.",
      "Keep a contact list (IT, software vendor, and a way to reach affected clients).",
      "Be ready to notify the Data Protection Board and affected clients as required.",
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
    <h1>Real Estate DPDPA Starter Checklist</h1>
    <p>Your real estate firm doesn't just close deals — it moves buyer, tenant and property data across people and networks. Work through these ten areas to bring KYC collection, document handling, broker sharing, CRM access and old-lead retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Buyer Leads","Tenant KYC","PAN / Aadhaar","Agreements","Property Papers","WhatsApp Sharing","Broker Networks","Loan Partners","CRM Access","Old Leads"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with KYC handling, broker sharing and CRM access — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

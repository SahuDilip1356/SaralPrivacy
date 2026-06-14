// Generates the branded "Fintech / NBFC DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-fintech-checklist.mjs   (from webapp/webapp)
// Output: public/templates/fintech-nbfc-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/fintech-nbfc-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "KYC & financial-data inventory",
    items: [
      "List where customer financial data is collected — app, website, KYC flow, DSAs, call centre, partners.",
      "Record what each dataset holds (PAN, Aadhaar, bank, bureau, UPI, repayment), why, and who can access it.",
      "Collect only the data the product actually needs.",
      "Keep one core system of record so you always know what you hold.",
      "Tell customers, in clear notice, how their financial data is used and shared.",
    ],
  },
  {
    n: 2,
    title: "PAN / Aadhaar / bank data handling",
    items: [
      "Use your regulated KYC/eKYC/CKYC flow — not WhatsApp, email or staff phones.",
      "Mask or tokenise identifiers where the full value isn't needed.",
      "Restrict who can view and export PAN, Aadhaar and bank statements.",
      "Don't keep duplicate copies on agent or staff devices.",
      "Set a deletion rule for KYC and bank data once the purpose ends.",
    ],
  },
  {
    n: 3,
    title: "Bureau check & credit-score data",
    items: [
      "Capture clear, traceable consent before pulling bureau data.",
      "Limit who can pull, view and store credit reports and scores.",
      "Don't reuse bureau/repayment data for unrelated marketing without consent.",
      "Log bureau pulls so you can show purpose and access.",
      "Apply a retention rule to bureau reports and score history.",
    ],
  },
  {
    n: 4,
    title: "Consent & notice evidence",
    items: [
      "Capture timestamped consent for collection, verification, profiling and partner sharing.",
      "Avoid bundling consent into terms and conditions without clear explanation.",
      "Make notice specific — what data, what purpose, which partners, how long.",
      "Keep consent evidence traceable and easy to retrieve.",
      "Operationalise withdrawal, correction and deletion across systems and partners.",
    ],
  },
  {
    n: 5,
    title: "Profiling & underwriting governance",
    items: [
      "Document scoring, eligibility and risk-model purpose and data inputs.",
      "Identify decision points, model owners and review steps.",
      "Keep human review where decisions materially affect customers.",
      "Make the customer notice for automated decisions clear.",
      "Review model inputs for unnecessary or high-impact data.",
    ],
  },
  {
    n: 6,
    title: "DSA / field-agent / collection-agent controls",
    items: [
      "Give agents role-based, monitored access — only what each role needs.",
      "Prohibit exporting customer lists to Excel/CSV/WhatsApp.",
      "Stop customer follow-up on personal phones and personal WhatsApp.",
      "Bind agents and DSAs with data-protection terms.",
      "Remove ex-agent access the same day they leave.",
    ],
  },
  {
    n: 7,
    title: "Payment, UPI & settlement partners",
    items: [
      "Keep a register of payment, UPI, wallet and settlement partners.",
      "Share only the data each partner needs for the transaction.",
      "Confirm what each partner stores and for how long.",
      "Review partner access and data flows periodically.",
      "Bind partners with data-processing/sharing terms.",
    ],
  },
  {
    n: 8,
    title: "Vendor & dashboard access",
    items: [
      "Map vendors with access — KYC, account aggregator, fraud/risk, cloud, CRM, analytics.",
      "Give least-privilege access to vendor dashboards.",
      "Turn on MFA on core systems, dashboards and admin accounts.",
      "Review vendor and dashboard access at least twice a year.",
      "Remove old vendor access promptly when contracts end.",
    ],
  },
  {
    n: 9,
    title: "Rejected application & KYC retention",
    items: [
      "Set a retention period for rejected applications, KYC, bank and bureau data.",
      "Don't keep customer financial records indefinitely for 'future offers'.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Offer customers correction and deletion of their data.",
      "Write retention rules down so the whole team applies them consistently.",
    ],
  },
  {
    n: 10,
    title: "Financial-data breach response",
    items: [
      "Write a one-page plan: who to call and what to do first if data is exposed or a list is leaked.",
      "Know how to quickly lock a compromised dashboard, account or agent access.",
      "Keep a contact list (security, IT, compliance, and a way to reach affected customers).",
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
    <h1>Fintech / NBFC DPDPA Starter Checklist</h1>
    <p>Your fintech or NBFC doesn't just process transactions — it verifies, profiles and shares financial data every day. Work through these ten areas to bring KYC, consent, profiling, partner/agent access and retention under DPDPA-ready control. This is a DPDPA-readiness checklist and sits alongside your RBI obligations, not instead of them.</p>
    <div class="chips">
      ${["KYC","PAN / Aadhaar","Bank Data","Credit Bureau","Consent Evidence","Profiling","DSAs & Agents","Retention"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with consent evidence, KYC handling and agent access — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

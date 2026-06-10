// Generates the branded "Law Firm DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-law-checklist.mjs   (from webapp/webapp)
// Output: public/templates/law-firm-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/law-firm-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Client & matter-data inventory",
    items: [
      "List where client and matter data is collected — onboarding, KYC, contracts, pleadings, evidence.",
      "Record what each matter file holds, why, and who can access it.",
      "Collect only the documents the matter actually needs.",
      "Keep one primary matter file so you always know what you hold.",
      "Update the engagement letter to explain data use, sharing, storage and retention.",
    ],
  },
  {
    n: 2,
    title: "KYC / PAN / Aadhaar / passport handling",
    items: [
      "Store ID proofs in access-controlled systems, not open folders or inboxes.",
      "Restrict who can open PAN/Aadhaar/passport copies.",
      "Don't keep duplicate ID copies across WhatsApp, email and devices.",
      "Mask or limit ID numbers where the full value isn't needed.",
      "Delete ID documents you no longer need for the matter.",
    ],
  },
  {
    n: 3,
    title: "Sensitive-matter classification",
    items: [
      "Mark family, criminal, employment, medical, whistleblower, harassment and disciplinary matters as sensitive.",
      "Restrict sensitive files to the matter team only.",
      "Don't store sensitive matters alongside regular matter files.",
      "Define who approves access to a sensitive matter.",
      "Review sensitive-matter access periodically.",
    ],
  },
  {
    n: 4,
    title: "Evidence, screenshots & media files",
    items: [
      "Store evidence files, screenshots, call records and videos in controlled locations.",
      "Avoid keeping evidence copies across personal phones, WhatsApp and email.",
      "Track where each piece of evidence is stored and who has accessed it.",
      "Apply stricter access to evidence in sensitive matters.",
      "Delete or archive evidence per your retention rules once the matter closes.",
    ],
  },
  {
    n: 5,
    title: "WhatsApp / email / client document intake",
    items: [
      "Prefer a secure portal or structured upload link for client documents.",
      "Reduce intake of sensitive records and evidence through informal WhatsApp.",
      "Don't accept matter documents through personal accounts of juniors/staff.",
      "Keep a record of what was received, from whom, and when.",
      "Move intake documents into the matter file promptly, then clear them from chats/inboxes.",
    ],
  },
  {
    n: 6,
    title: "Junior, intern & paralegal access",
    items: [
      "Give juniors, interns and paralegals access only to the matters they work on.",
      "Avoid shared logins — give each person their own account, with MFA.",
      "Review who can access which matter folders at least twice a year.",
      "Brief every joiner on client confidentiality and DPDPA basics.",
      "Don't let interns use personal laptops/email for client work.",
    ],
  },
  {
    n: 7,
    title: "External counsel, clerk & filing-agent sharing",
    items: [
      "Share client documents externally only with a defined purpose and controlled access.",
      "Keep a record of what was shared, with whom, and why.",
      "Brief clerks, filing agents and couriers on handling matter documents.",
      "Track physical files sent to court, client, counsel or filing agents.",
      "Share the minimum needed for the filing, brief or expert opinion.",
    ],
  },
  {
    n: 8,
    title: "Legal tech / AI / document-review tools",
    items: [
      "List the legal-tech, e-discovery and document-review tools that touch client data.",
      "Use only approved AI/drafting tools with data controls — not public tools case-by-case.",
      "Confirm what each tool stores, for how long, and where.",
      "Put data-handling terms (a DPA) in place with each platform.",
      "Avoid pasting sensitive client data into public AI tools.",
    ],
  },
  {
    n: 9,
    title: "Closed matter file retention",
    items: [
      "Set a retention period by matter and record type, based on limitation and professional needs.",
      "Don't keep every closed matter file indefinitely by default.",
      "Schedule a periodic review to archive or delete files past their period.",
      "Have a process for client return, correction or deletion requests.",
      "Write retention rules down so the whole firm applies them consistently.",
    ],
  },
  {
    n: 10,
    title: "Wrong-recipient & breach response",
    items: [
      "Write a one-page plan: who to call and what to do first if a matter file reaches the wrong person.",
      "Know how to quickly lock a compromised email, WhatsApp account or cloud folder.",
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
    <h1>Law Firm DPDPA Starter Checklist</h1>
    <p>Your law firm doesn't just protect client confidentiality — it stores, shares and retains client data every day. Work through these ten areas to bring matter intake, client KYC, sensitive-file handling, junior/intern access, court/vendor sharing and closed-file retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Client KYC","PAN / Aadhaar","Sensitive Matters","Evidence Files","WhatsApp Intake","Junior Access","External Counsel","Legal Tech / AI","Closed Matters","Breach Response"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with sensitive-matter classification, junior/intern access and external sharing — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

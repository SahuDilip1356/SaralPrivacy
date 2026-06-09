// Generates the branded "CA Firm DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-ca-checklist.mjs   (from webapp/webapp)
// Output: public/templates/ca-firm-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/ca-firm-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Client document intake",
    items: [
      "Define ONE primary channel for receiving PAN, Aadhaar, ITR, bank statements and payroll (e.g. a secure portal or upload link).",
      "Tell clients at onboarding which channel to use — and ask them to avoid WhatsApp for sensitive documents.",
      "Collect only the documents the engagement actually needs (data minimisation).",
      "On receipt, move documents off WhatsApp/email into controlled storage, then delete the chat/attachment copy.",
      "Keep a simple log of what each client has sent, so you always know what you hold.",
    ],
  },
  {
    n: 2,
    title: "PAN / Aadhaar / bank statement handling",
    items: [
      "Collect Aadhaar only when genuinely required; prefer masked Aadhaar where possible.",
      "Store identity and financial copies in access-controlled storage — not personal laptops or inboxes.",
      "Restrict who can open PAN/Aadhaar/bank files to staff who need them for the task.",
      "Avoid keeping extra photocopies or duplicate scans beyond what is needed.",
      "Securely destroy physical copies once digitised and no longer required.",
    ],
  },
  {
    n: 3,
    title: "Google Drive / OneDrive / cloud access",
    items: [
      "Turn on multi-factor authentication (MFA) for every account that can open client folders.",
      "Use folder-level, role-based permissions — avoid 'anyone with the link' sharing.",
      "Review who has access to client folders at least twice a year.",
      "Remove access the same day a staff member changes role or leaves.",
      "Do not store client documents in personal cloud accounts.",
    ],
  },
  {
    n: 4,
    title: "Article assistant / intern access",
    items: [
      "Give article assistants and interns access only to the clients they actively work on.",
      "Use need-based, time-bound access and revoke it when the assignment ends.",
      "Brief every new joiner on confidentiality and DPDPA basics before they touch client data.",
      "Keep a simple record of who can access which client folders.",
      "Disable accounts and revoke device/app access on the last working day.",
    ],
  },
  {
    n: 5,
    title: "Engagement letter / client notice",
    items: [
      "Add a clause stating what client data you collect and why.",
      "State where data is stored, who may access it, and how long it is kept.",
      "Name a contact for client data questions and requests.",
      "Mention the vendors or tools that process client data on your behalf.",
      "Update the clause for DPDPA and re-issue it at renewal.",
    ],
  },
  {
    n: 6,
    title: "Vendor and software access",
    items: [
      "List every tool/vendor that stores or processes client data — tax & GST software, payroll, cloud, IT support, outsourced teams.",
      "Prefer vendors that offer written terms covering data protection.",
      "Never share client files with vendors or outsourced teams over WhatsApp or personal email.",
      "Give each vendor access to the minimum data needed.",
      "Review the vendor list once a year.",
    ],
  },
  {
    n: 7,
    title: "Client communication & consent",
    items: [
      "Get consent before adding clients to WhatsApp broadcast lists or marketing groups.",
      "Keep service messages (deadline/compliance reminders) separate from promotions and festival greetings.",
      "Give clients an easy way to opt out of newsletters and promotional messages.",
      "Don't reuse a client list from one service to market unrelated services without consent.",
      "Avoid exposing other clients' numbers — use broadcast, not open groups.",
    ],
  },
  {
    n: 8,
    title: "Old client file retention",
    items: [
      "Set retention periods by document type, based on tax, audit, legal and professional needs.",
      "Separate 'must keep' (statutory) files from 'can delete' files.",
      "Schedule an annual review to archive or delete files past their period.",
      "Do not keep client data 'forever' by default.",
      "Write down your retention rules so the whole team applies them consistently.",
    ],
  },
  {
    n: 9,
    title: "Client data rights (access / correction / deletion)",
    items: [
      "Be ready to tell a client what personal data you hold about them, on request.",
      "Have a process to correct inaccurate client details.",
      "Honour deletion/erasure requests for data you're not legally required to retain.",
      "Verify the client's identity before acting on a rights request.",
      "Log each request and your response as evidence of compliance.",
    ],
  },
  {
    n: 10,
    title: "Breach response",
    items: [
      "Write a one-page response plan: who to call and what to do first.",
      "Know how to quickly lock a lost/stolen laptop, email, cloud folder or WhatsApp account.",
      "Keep a contact list (IT, partners, and a way to reach affected clients).",
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
  .grid{ }
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
    <h1>CA Firm DPDPA Starter Checklist</h1>
    <p>Most CA firms don't have a tax knowledge problem — they have a client-document control problem. Work through these ten areas to bring your PAN, Aadhaar, ITR, bank, payroll and audit records under DPDPA-ready control.</p>
    <div class="chips">
      ${["PAN","Aadhaar","ITR","Bank Statements","Payroll","Google Drive","WhatsApp","Article-Staff Access","Client Rights","Old Files"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with intake, access and retention — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

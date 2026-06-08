// Generates the branded "Recruitment Agency DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-recruitment-checklist.mjs   (from webapp/webapp)
// Output: public/templates/recruitment-agency-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/recruitment-agency-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Candidate sourcing & notice",
    items: [
      "List the channels you actually source from (portals, LinkedIn, referrals, walk-ins, reused databases, client lists).",
      "Avoid scraping or buying candidate lists without a lawful basis and a clear notice.",
      "Give every candidate a short notice: what you collect, why, who you share it with, and how long you keep it.",
      "Capture sourcing consent at the point of first contact — not verbally after the fact.",
      "Maintain one primary candidate record so you always know what you hold and where.",
    ],
  },
  {
    n: 2,
    title: "CV sharing with clients",
    items: [
      "Share only relevant, shortlisted profiles — not bulk CV folders.",
      "Confirm candidate consent before forwarding a CV to a specific client.",
      "Prefer a controlled ATS/client portal over email/WhatsApp attachments.",
      "Tell clients in writing how they may use and retain the CVs you share.",
      "Keep a log of which candidate was shared with which client, and when.",
    ],
  },
  {
    n: 3,
    title: "PAN / Aadhaar / salary / BGV documents",
    items: [
      "Collect identity, salary and BGV documents only after shortlist/offer — and only when needed.",
      "Prefer masked Aadhaar where possible; avoid collecting full ID at registration.",
      "Store these documents in access-controlled storage, not inboxes or laptops.",
      "Restrict who can open salary, bank and BGV files to staff who need them.",
      "Delete identity/verification copies once the purpose is complete.",
    ],
  },
  {
    n: 4,
    title: "ATS & candidate database access",
    items: [
      "Use an ATS/CRM with role-based access as the single source of truth.",
      "Give each recruiter access only to the mandates they work on.",
      "Turn on MFA for every account that can open candidate records.",
      "Review who has access to the candidate database at least twice a year.",
      "Avoid duplicate copies of the database in spreadsheets and personal drives.",
    ],
  },
  {
    n: 5,
    title: "WhatsApp / email / Excel tracker risk",
    items: [
      "Avoid using WhatsApp groups to circulate CVs or candidate details.",
      "Move candidate data off WhatsApp/email into controlled storage, then delete the copy.",
      "Replace ad-hoc Excel trackers with controlled ATS records where possible.",
      "Never store PAN/Aadhaar/salary documents on recruiter personal devices.",
      "Lock down shared Drive/Dropbox folders — no 'anyone with the link'.",
    ],
  },
  {
    n: 6,
    title: "Client-sharing & hiring-manager access",
    items: [
      "Define how hiring managers receive and store the profiles you send.",
      "Avoid giving clients standing access to your ATS or full candidate database.",
      "Set expectations (or contract terms) on client-side retention and re-sharing.",
      "Track what happens to a CV after it is forwarded, as far as practical.",
      "Withdraw shared profiles when a candidate opts out or a mandate closes.",
    ],
  },
  {
    n: 7,
    title: "Freelancer / ex-recruiter access removal",
    items: [
      "Give freelancers, interns and external recruiters need-based, time-bound access.",
      "Revoke access the same day an assignment ends or a recruiter leaves.",
      "Keep a record of who can access which candidate folders/trackers.",
      "Disable accounts and revoke device/app access on the last working day.",
      "Brief every joiner on candidate-data confidentiality and DPDPA basics.",
    ],
  },
  {
    n: 8,
    title: "Rejected-candidate retention",
    items: [
      "Set a retention period for rejected/inactive profiles (e.g. 12–24 months).",
      "Separate 'keep with consent for future roles' from 'delete now'.",
      "Schedule an annual review to archive or delete profiles past their period.",
      "Do not keep candidate databases 'forever' by default.",
      "Write down retention rules so the whole team applies them consistently.",
    ],
  },
  {
    n: 9,
    title: "Candidate correction / deletion requests",
    items: [
      "Publish a simple way for candidates to correct, delete or withdraw their profile.",
      "Define who handles requests and a target response timeline.",
      "Verify identity before acting on a request.",
      "Delete across ATS, email, drives and trackers — not just the primary record.",
      "Log each request and what you did, as evidence of compliance.",
    ],
  },
  {
    n: 10,
    title: "AI screening & CV parsing",
    items: [
      "List the AI tools that screen, summarise, rank or parse candidate data.",
      "Keep a human in the loop for shortlisting and rejection decisions.",
      "Disclose AI processing in your candidate notice.",
      "Check what each AI vendor stores and whether data is used to train models.",
      "Avoid pasting candidate PII into ungoverned public AI tools.",
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
    <h1>Recruitment Agency DPDPA Starter Checklist</h1>
    <p>Your agency doesn't just forward CVs — it moves candidate data across clients, tools and teams. Work through these ten areas to bring candidate sourcing, CV sharing, identity documents, ATS access and rejected-candidate retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["CVs","Candidate Consent","Job Portals","ATS","WhatsApp","Client Sharing","BGV","Salary Slips","Rejected Profiles","AI Screening"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with sourcing notice, CV sharing and rejected-candidate retention — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

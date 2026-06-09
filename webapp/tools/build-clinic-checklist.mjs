// Generates the branded "Clinic & Diagnostic Lab DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-clinic-checklist.mjs   (from webapp/webapp)
// Output: public/templates/clinic-diagnostic-lab-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/clinic-diagnostic-lab-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Patient registration & intake",
    items: [
      "Define approved channels for collecting patient details, prescriptions and ID proof.",
      "Reduce scattered intake through WhatsApp, phone calls and loose paper forms.",
      "Show a short notice at registration: what you collect, why, who sees it, how long you keep it.",
      "Collect only the patient data the visit/test actually needs.",
      "Keep one primary patient record so you always know what you hold.",
    ],
  },
  {
    n: 2,
    title: "Prescription & lab-report handling",
    items: [
      "Store reports, prescriptions and images in access-controlled systems, not open folders or inboxes.",
      "Avoid keeping duplicate copies of reports across WhatsApp, email and devices.",
      "Treat fertility, pregnancy, mental-health and chronic-condition data as especially sensitive.",
      "Restrict who can open sensitive reports to staff who need them for the task.",
      "Label and organise reports so the right one reaches the right patient.",
    ],
  },
  {
    n: 3,
    title: "WhatsApp / email report sharing",
    items: [
      "Verify the patient's number/email before sending any report.",
      "Prefer a secure portal or password-protected file for sensitive reports.",
      "Don't forward reports through personal WhatsApp/email accounts of staff.",
      "Keep a record of which report was sent to whom, and when.",
      "Delete report copies from chats/inboxes once delivered.",
    ],
  },
  {
    n: 4,
    title: "Family-member / caregiver sharing",
    items: [
      "Get the patient's consent before sending reports to a family member or caregiver.",
      "Confirm the recipient's identity — don't assume the registered number is the patient.",
      "Be especially careful with sensitive results (fertility, mental health, infectious disease).",
      "Record who the patient authorised to receive their reports.",
      "Stop sharing with a contact when the patient withdraws consent.",
    ],
  },
  {
    n: 5,
    title: "Reception, billing & lab-staff access",
    items: [
      "Give reception, billing, lab and support staff access only to what they need.",
      "Avoid shared logins — give each person their own account, with MFA.",
      "Review who can access patient records at least twice a year.",
      "Brief every joiner on patient-data confidentiality and DPDPA basics.",
      "Log access where your software supports it.",
    ],
  },
  {
    n: 6,
    title: "Clinic software / LIS / HIS access",
    items: [
      "List the clinic software, LIS, HIS and imaging tools that hold patient data.",
      "Turn on role-based access and MFA in each system.",
      "Remove access the same day a staff member or vendor leaves.",
      "Check whether your software vendor stores or backs up patient data, and where.",
      "Put data-handling terms (a DPA) in place with each platform.",
    ],
  },
  {
    n: 7,
    title: "Outsourced labs & home sample collection",
    items: [
      "List every outsourced/referral lab and home-collection partner that handles patient data.",
      "Confirm what each partner stores, for how long, and who can access it.",
      "Give home-collection agents only the patient details they need for the visit.",
      "Use agreements that require partners to protect and delete patient data.",
      "Track samples and reports end-to-end so nothing is lost or mis-delivered.",
    ],
  },
  {
    n: 8,
    title: "Insurance / TPA / corporate sharing",
    items: [
      "Share patient data with insurers/TPAs/corporates only with authorisation or a clear purpose.",
      "Tell patients when their reports will be shared with an insurer or employer.",
      "Don't share reports simply because a partner or referring doctor asks.",
      "Share the minimum needed for the claim or referral.",
      "Keep a record of what was shared, with whom, and why.",
    ],
  },
  {
    n: 9,
    title: "Old report & prescription retention",
    items: [
      "Set a retention period for reports, prescriptions and images by record type.",
      "Balance medical-record obligations with 'delete when no longer needed'.",
      "Don't keep patient records indefinitely by default.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Write retention rules down so the whole team applies them consistently.",
    ],
  },
  {
    n: 10,
    title: "Wrong-report sharing & breach response",
    items: [
      "Write a one-page plan: who to call and what to do first if a report reaches the wrong person.",
      "Know how to quickly lock a compromised WhatsApp account, email or lab-software login.",
      "Keep a contact list (IT, software vendor, and a way to reach affected patients).",
      "Be ready to notify the Data Protection Board and affected patients as required.",
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
    <h1>Clinic & Diagnostic Lab DPDPA Starter Checklist</h1>
    <p>Your clinic doesn't just treat patients — it collects, stores and shares health data every day. Work through these ten areas to bring patient intake, report sharing, recipient verification, staff/vendor access and old-record retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Patient Reports","Prescriptions","Health Data","WhatsApp Sharing","Lab Software","Reception Access","Home Collection","Doctor Referrals","Insurance / TPA","Retention"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with recipient verification, report sharing and staff access — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal or medical advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

// Generates the branded "School & College DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-school-checklist.mjs   (from webapp/webapp)
// Output: public/templates/school-college-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/school-college-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Student & parent data inventory",
    items: [
      "List where student and parent data is collected — admission, fee, academic, health, transport, hostel and apps.",
      "Record what each system holds, why, and who can access it.",
      "Collect only the data the activity actually needs.",
      "Keep one primary student record so you always know what you hold.",
      "Show a short notice at admission: what you collect, why, who sees it, how long you keep it.",
    ],
  },
  {
    n: 2,
    title: "Parent / guardian consent",
    items: [
      "For students below 18, take documented parent/guardian consent at admission/onboarding.",
      "Cover school apps, photos, CCTV, transport, LMS, communication and vendor platforms — not just a website policy.",
      "Keep consent evidence you can show later.",
      "Make it easy for parents to ask questions or withdraw consent.",
      "Avoid behavioural tracking or targeted advertising directed at children.",
    ],
  },
  {
    n: 3,
    title: "Admission forms & ID documents",
    items: [
      "Store admission forms, ID proof and birth certificates in access-controlled systems, not open folders.",
      "Restrict who can open ID and birth-certificate copies.",
      "Don't keep duplicate copies across WhatsApp, email and personal devices.",
      "Mask or limit ID numbers where the full value isn't needed.",
      "Delete admission documents you no longer need.",
    ],
  },
  {
    n: 4,
    title: "School ERP / app / LMS",
    items: [
      "List the ERP, parent app, LMS and online-exam tools that hold student data.",
      "Turn on role-based access and MFA in each system.",
      "Remove access the same day a staff member or vendor leaves.",
      "Check whether each platform stores or backs up student data, and where.",
      "Put data-handling terms (a DPA) in place with every platform.",
    ],
  },
  {
    n: 5,
    title: "WhatsApp & parent communication",
    items: [
      "Prefer the official app/ERP for circulars, attendance, fees and results.",
      "If you use WhatsApp, prefer broadcasts over groups so parents' numbers aren't exposed to each other.",
      "Avoid posting student photos or sensitive updates in open/social groups.",
      "Keep a central record of what was sent, to whom, and when.",
      "Brief staff not to use personal accounts for parent communication.",
    ],
  },
  {
    n: 6,
    title: "Student photos, videos & results",
    items: [
      "Take separate, documented consent before publishing student photos, videos or results.",
      "Be especially careful where minors are involved.",
      "Tell parents where images will appear (website, social media, brochures).",
      "Offer a simple removal process on request.",
      "Avoid tagging students' full names with images on public pages.",
    ],
  },
  {
    n: 7,
    title: "CCTV, biometric, RFID & transport GPS",
    items: [
      "Define a clear purpose for each monitoring and location system.",
      "Restrict who can view CCTV footage and transport/RFID location data.",
      "Set a retention limit for CCTV footage and review it.",
      "Put up visible notice/signage where monitoring is in use.",
      "Treat biometric data as sensitive — limit its use and protect it carefully.",
    ],
  },
  {
    n: 8,
    title: "Vendors & EdTech platforms",
    items: [
      "Keep a register of every vendor that processes student data.",
      "Cover ERP, LMS, apps, fee portals, exam tools, transport, CCTV and IT support.",
      "Confirm what each vendor stores, for how long, and who can access it.",
      "Use agreements that require vendors to protect and delete student data.",
      "Review vendor access at least once a year.",
    ],
  },
  {
    n: 9,
    title: "Hostel, health & counselling data",
    items: [
      "Restrict access to health, allergy, disability and special-needs records.",
      "Keep counselling and disciplinary notes out of general student files.",
      "Limit hostel entry/exit and residential data to staff who need it.",
      "Define a clear purpose for collecting sensitive student data.",
      "Review who can access these records periodically.",
    ],
  },
  {
    n: 10,
    title: "Old record & CCTV retention",
    items: [
      "Set a retention period for student records, photos, app data and CCTV footage by type.",
      "Don't keep old admission files, parent contacts or alumni data indefinitely by default.",
      "Schedule a periodic review to archive or delete records past their period.",
      "Write a one-page plan for if student data, photos or CCTV/app access is exposed.",
      "Be ready to notify the Data Protection Board and affected parents/students as required.",
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
    <h1>School & College DPDPA Starter Checklist</h1>
    <p>Your institution doesn't just educate students — it collects, monitors and shares student data every day. Work through these ten areas to bring children's data, parent consent, school apps, communication, monitoring systems, vendors, photos and old-record retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Children's Data","Parent Consent","School Apps","CCTV","Attendance","Transport GPS","Student Photos","Vendors","Hostel / Health","Retention"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with parent consent, student photos and monitoring governance — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

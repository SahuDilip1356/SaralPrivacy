// Generates the branded "Training Institute DPDPA Starter Checklist" PDF lead magnet.
// Run: node tools/build-training-checklist.mjs   (from webapp/webapp)
// Output: public/templates/training-institute-dpdpa-starter-checklist.pdf
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/templates/training-institute-dpdpa-starter-checklist.pdf");

const SECTIONS = [
  {
    n: 1,
    title: "Student data collection & minimisation",
    items: [
      "List the student data you collect at enquiry, admission, classes and placement.",
      "Collect only what you actually need — drop fields you don't use.",
      "Keep one primary student record so you always know what you hold and where.",
      "Show a clear notice at the point of collection: what you collect, why, who you share it with, how long you keep it.",
      "Avoid collecting extra identity or family data 'just in case'.",
    ],
  },
  {
    n: 2,
    title: "Identifying minors & age",
    items: [
      "Record each student's age / date of birth so you know who is a minor.",
      "Treat 'age not recorded' as if the student may be a minor.",
      "Flag which programmes typically enrol students under 18.",
      "Apply stronger protection to all data of students under 18.",
      "Don't run behavioural tracking or targeted ads at minors.",
    ],
  },
  {
    n: 3,
    title: "Parental / guardian consent",
    items: [
      "Get verifiable parental/guardian consent before processing a minor's data.",
      "Record who gave consent, for what, and when.",
      "Use a consent method you can actually verify (signed form, verified contact) — not just a verbal yes.",
      "Re-confirm consent if the purpose changes (e.g. marketing, photos).",
      "Give parents a simple way to withdraw consent later.",
    ],
  },
  {
    n: 4,
    title: "Admission forms & enrolment notice",
    items: [
      "Add a short privacy notice to your admission/enquiry form.",
      "Keep marketing consent separate from the enrolment form — enrolling is not marketing consent.",
      "Don't bundle photo/testimonial consent into the admission signature.",
      "Store completed forms in access-controlled storage, not open drawers or shared drives.",
      "Tell students/parents how to update or correct their details.",
    ],
  },
  {
    n: 5,
    title: "WhatsApp groups & class communication",
    items: [
      "Avoid exposing every student's number to the whole group — use broadcast or admin-only posting.",
      "Keep separate, purpose-specific groups; don't reuse old batches for new marketing.",
      "Get consent before adding students/parents to a WhatsApp group.",
      "Don't circulate student photos, marks or fee details in open groups.",
      "Remove students/parents from groups when their programme ends.",
    ],
  },
  {
    n: 6,
    title: "Promotional & placement marketing",
    items: [
      "Get a clear opt-in before promotional WhatsApp/SMS/email to students or parents.",
      "Don't reuse old student databases for new-batch marketing without consent.",
      "Get explicit consent before publishing a student's name, score or placement.",
      "Avoid sharing student results or rank lists publicly without consent.",
      "Honour opt-outs across every channel, promptly.",
    ],
  },
  {
    n: 7,
    title: "Student photos, videos & testimonials",
    items: [
      "Get specific consent before using student photos, videos or testimonials in ads.",
      "For minors, get parental consent for any image or testimonial use.",
      "Tell students where the content will appear and for how long.",
      "Provide a way to withdraw a photo/testimonial later.",
      "Don't repurpose class/event photos for marketing without consent.",
    ],
  },
  {
    n: 8,
    title: "LMS, apps & third-party tools",
    items: [
      "List the LMS, apps, CRM and tools that store or process student data.",
      "Check what each vendor stores, where, and whether data trains their models.",
      "Put data-processing terms (a DPA) in place with each platform.",
      "Disclose the tools you use in your privacy notice.",
      "Remove apps and integrations you no longer use, and revoke their access.",
    ],
  },
  {
    n: 9,
    title: "Staff, tutor & vendor access",
    items: [
      "Give tutors and staff access only to the student data they need.",
      "Avoid shared logins — give each person their own account, with MFA.",
      "Revoke ex-tutor, ex-staff and ex-vendor access the day they leave.",
      "Brief every joiner on student-data confidentiality and DPDPA basics.",
      "Review who can access student records at least twice a year.",
    ],
  },
  {
    n: 10,
    title: "Retention, records & student rights",
    items: [
      "Set how long you keep student records after a programme ends, and delete on schedule.",
      "Don't keep student databases 'forever' by default.",
      "Publish a simple way for students/parents to access, correct or delete data.",
      "Verify identity before acting on a request, and log what you did.",
      "Write retention and rights rules down so the whole team applies them consistently.",
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
    <h1>Training Institute DPDPA Starter Checklist</h1>
    <p>Your institute doesn't just teach students — it collects, shares and stores student and parent data every day, often for minors. Work through these ten areas to bring student data, parental consent, communication, LMS tools and retention under DPDPA-ready control.</p>
    <div class="chips">
      ${["Student Data","Minors","Parental Consent","Admission Forms","WhatsApp Groups","Student Photos","LMS Tools","Placement Data","Vendor Access","Retention"].map((c)=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
  <div class="lead"><strong>How to use this:</strong> tick what you already do, and turn the unticked boxes into your next actions. Start with minor identification, parental consent and admission-form notice — they remove the most risk for the least effort.</div>
  <div class="grid">${sectionHtml}</div>
  <div class="footer"><span><b>SaralPrivacy</b> · saralprivacy.com · DPDPA readiness for Indian businesses</span><span>${today} · Educational, not legal advice</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log("Wrote", OUT);

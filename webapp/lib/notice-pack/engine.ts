// Notice Pack Builder — deterministic assembly engine (no LLM).
import { SECTORS, VENDOR_CLAUSE, VAGUE, SCORE_WEIGHTS, SCORE_BANDS, SENSITIVE, CONTEXTS, consentBlocks } from "./data";
import type { NPState, NPBand } from "./types";

export const escHtml = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
export const slugify = (s: string) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const isVague = (p: string) => !p || VAGUE.some((v) => p.trim().toLowerCase() === v || p.trim().toLowerCase().length < 6);

const H = {
  en: {
    title: (n: string) => `Privacy Notice — ${n || "[Your business]"}`,
    eff: "Effective date",
    intro: (n: string) => `${n || "[Your business]"} ("we", "us", "our") respects your privacy and is the Data Fiduciary responsible for the personal data described here. This notice explains what personal data we collect, why and how, and the rights you have under India's Digital Personal Data Protection Act, 2023 (DPDPA).`,
    h: ["1. Who we are", "2. Personal data we collect", "3. Why we collect it", "4. How we collect it", "5. Sharing with service providers", "6. Children’s data", "7. How long we keep your data", "8. Consent & withdrawal", "9. Your rights", "10. Grievance & Data Protection Board", "11. Contact us", "12. Updates to this notice"],
    rights: "You have the right to access the data we hold about you, correct or complete it, erase it where the law allows, withdraw consent as easily as you gave it, nominate someone to exercise your rights, and raise a grievance with our Officer.",
    child: "We process children’s data only with verifiable parental or guardian consent, and never for behavioural monitoring or targeted advertising directed at children.",
    board: "If we do not resolve your grievance, you may complain to the Data Protection Board of India in the manner prescribed under the DPDP Act and Rules.",
    disc: "This notice is generated for guidance and is not legal advice. Review it before publishing.",
  },
  hi: {
    title: (n: string) => `गोपनीयता सूचना — ${n || "[आपका व्यवसाय]"}`,
    eff: "प्रभावी तिथि",
    intro: (n: string) => `${n || "[आपका व्यवसाय]"} आपकी निजता का सम्मान करता है। यह सूचना बताती है कि हम कौन-सा व्यक्तिगत डेटा एकत्र करते हैं, क्यों, कैसे, और DPDPA, 2023 के तहत आपके अधिकार क्या हैं।`,
    h: ["1. हम कौन हैं", "2. हम कौन-सा डेटा एकत्र करते हैं", "3. हम इसे क्यों एकत्र करते हैं", "4. हम इसे कैसे एकत्र करते हैं", "5. सेवा प्रदाताओं के साथ साझा करना", "6. बच्चों का डेटा", "7. हम डेटा कब तक रखते हैं", "8. सहमति और वापसी", "9. आपके अधिकार", "10. शिकायत और डेटा संरक्षण बोर्ड", "11. संपर्क करें", "12. इस सूचना में बदलाव"],
    rights: "आपके पास अपने डेटा तक पहुँच, सुधार, कानून अनुमति देने पर मिटाने, सहमति वापस लेने, अधिकार हेतु किसी को नामित करने और शिकायत दर्ज करने का अधिकार है।",
    child: "हम बच्चों का डेटा केवल माता-पिता/अभिभावक की सत्यापित सहमति से संसाधित करते हैं और उसका उपयोग ट्रैकिंग या लक्षित विज्ञापन हेतु नहीं करते।",
    board: "यदि शिकायत हल नहीं होती, तो आप भारत के डेटा संरक्षण बोर्ड को शिकायत कर सकते हैं।",
    disc: "यह सूचना मार्गदर्शन हेतु है, कानूनी सलाह नहीं। प्रकाशित करने से पहले समीक्षा करें।",
  },
};

export function vclause(S: NPState): string {
  if (S.noVendors) return "We do not share your personal data with third parties, except where required by law.";
  const sec = SECTORS.find((s) => s.key === S.sector);
  return VENDOR_CLAUSE[sec ? sec.vclause : "generic"] || VENDOR_CLAUSE.generic;
}

// Why each recipient category receives data — drives the structured sharing list (§5).
const VENDOR_PURPOSE: Record<string, string> = {
  "Payment gateway": "to process payments and refunds",
  "Logistics / courier": "to deliver orders and manage returns",
  "WhatsApp / SMS / email provider": "to send service updates and, with consent, marketing messages",
  "Cloud storage": "to host and back up records securely",
  "CRM": "to manage customer records and communication",
  "Accounting / tax consultant": "for accounting, tax filing and statutory compliance",
  "Legal consultant": "for legal advice and compliance",
  "HR / payroll software": "to run payroll and HR administration",
  "Recruitment / BGV vendor": "for candidate sourcing and background verification",
  "LMS / EdTech platform": "to deliver classes and learning",
  "Diagnostic lab partner": "to perform tests and deliver reports",
  "Insurance partner": "to process claims and billing",
  "Hotel / travel platform": "to manage bookings and travel",
  "Analytics / advertising": "to measure usage and, with consent, run marketing",
  "CCTV / security vendor": "for premises safety, security and access control",
};

function sharingHtml(S: NPState): string {
  if (S.noVendors) return `<p>We do not share your personal data with third parties, except where required by law.</p>`;
  if (!S.vendors.length) return `<p>${vclause(S)}</p>`;
  return `<p>We share personal data only with the following categories of service providers, and only for the purposes described:</p><ul>${S.vendors
    .map((v) => `<li><b>${escHtml(v)}</b> — ${VENDOR_PURPOSE[v] || "to deliver the services described in this notice"}</li>`)
    .join("")}</ul>`;
}

export function retText(S: NPState): string {
  const m: Record<string, string> = {
    "Until service ends": "for as long as needed to provide the service",
    "1 year": "for up to 1 year after your last activity",
    "3 years": "for up to 3 years",
    "5–8 yrs (tax/legal)": "for 5–8 years to meet tax and legal requirements",
    "As required by law": "for as long as applicable law requires",
    "Forever": "[set a retention period]",
    "Not sure": "[set a retention period]",
  };
  return m[S.retention] || "for as long as needed for the purposes above";
}

export function buildNotice(S: NPState, L: "en" | "hi", effIso?: string): string {
  const t = H[L];
  const n = S.org;
  // Effective date is stamped once at generation (passed in) so it's stable across preview/PDF.
  const today = (effIso ? new Date(effIso) : new Date()).toLocaleDateString(L === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });
  const e = escHtml;
  const li = (a: string[]) => (a && a.length ? `<ul>${a.map((x) => `<li>${e(x)}</li>`).join("")}</ul>` : `<p class="muted">— not specified yet —</p>`);
  const sec = SECTORS.find((s) => s.key === S.sector);
  let h = `<h1 class="dt">${t.title(n)}</h1><div class="dmeta">SP-NOTICE-2026-(draft) · v1.0 · ${t.eff}: ${today}${S.website ? " · " + e(S.website) : ""}</div><p>${t.intro(n)}</p>`;
  // §1 Who we are — proper-cased sector + website + grievance contact + optional registered address.
  const whoWeAre =
    `${e(n) || "[business]"}${sec ? " is a " + e(sec.label) : ""}.` +
    (S.website ? ` Website: ${e(S.website)}.` : "") +
    (S.regAddress ? ` Registered address: ${e(S.regAddress)}.` : "") +
    (S.cName || S.cEmail ? ` For privacy matters, contact ${e(S.cName) || "our Grievance Officer"}${S.cEmail ? " at " + e(S.cEmail) : ""}.` : "");
  h += `<h2 class="dh">${t.h[0]}</h2><p>${whoWeAre}</p>`;
  h += `<h2 class="dh">${t.h[1]}</h2>${li(S.data)}`;
  h += `<h2 class="dh">${t.h[2]}</h2>${S.data.length ? `<ul>${S.data.map((d) => `<li><b>${e(d)}</b> — ${e(S.purpose[d] || "…")}</li>`).join("")}</ul>` : '<p class="muted">— add purposes —</p>'}`;
  h += `<h2 class="dh">${t.h[3]}</h2>${li(S.contexts.map((k) => { const c = CONTEXTS.find((x) => x.key === k); return c ? c.label : k; }))}`;
  h += `<h2 class="dh">${t.h[4]}</h2>${sharingHtml(S)}`;
  if (S.children === "Yes") h += `<h2 class="dh">${t.h[5]}</h2><p>${t.child}</p>`;
  h += `<h2 class="dh">${t.h[6]}</h2><p>${L === "hi" ? "हम आपका डेटा रखते हैं " : "We keep your data "}${retText(S)}.</p>`;
  const wContact = S.withdrawContact || S.cEmail;
  h += `<h2 class="dh">${t.h[7]}</h2><p>${L === "hi" ? "सहमति आधार पर। आप किसी भी समय सहमति वापस ले सकते हैं" : "We process data on the basis of your consent (DPDPA §6). You can withdraw consent at any time"}${wContact ? ` — ${e(wContact)}` : ""}.</p>`;
  h += `<h2 class="dh">${t.h[8]}</h2><p>${t.rights}</p>`;
  h += `<h2 class="dh">${t.h[9]}</h2><p>${e(S.cName) || "[Officer]"}${S.cEmail ? " · " + e(S.cEmail) : ""}. ${t.board}</p>`;
  h += `<h2 class="dh">${t.h[10]}</h2><p>${e(S.cName) || "[name]"}${S.cEmail ? " · " + e(S.cEmail) : ""}${S.cPhone ? " · " + e(S.cPhone) : ""}</p>`;
  h += `<h2 class="dh">${t.h[11]}</h2><p>${L === "hi" ? "हम इस सूचना को समय-समय पर अद्यतन कर सकते हैं।" : "We may update this notice from time to time; the latest version is shown here."}</p>`;
  h += `<p class="disc">${t.disc}</p>`;
  return h;
}

export function score(S: NPState): number {
  const w = SCORE_WEIGHTS;
  let s = 0;
  if (S.sector) s += w.businessType;
  if (S.data.length) s += w.dataCategories;
  if (S.data.length) {
    const mapped = S.data.filter((d) => !isVague(S.purpose[d])).length;
    s += Math.round((w.purposeMapped * mapped) / S.data.length);
  }
  if (S.contexts.length) s += w.contexts;
  if (S.withdrawMethod && S.withdrawMethod !== "Not available yet" && S.withdrawContact) s += w.withdrawal;
  if (S.cEmail) s += w.rightsContact;
  if (S.noVendors || S.vendors.length) s += w.vendorDisclosed;
  if (S.retention && !["Forever", "Not sure"].includes(S.retention)) s += w.retention;
  if (S.children !== "Yes" || S.childWhy.length) s += w.children;
  if (S.slug || S.cEmail) s += w.dsar;
  let v = Math.min(100, s);
  // Honesty cap: an unresolved defect must not read as "Strong" (≥85).
  if (flags(S).some((f) => f.severity === "risk")) v = Math.min(v, 84);
  return v;
}

export function band(s: number): NPBand {
  return SCORE_BANDS.find((b) => s >= b.min) as NPBand;
}

export interface RiskFlag { color: string; title: string; detail: string; severity: "risk" | "info"; }
export function flags(S: NPState): RiskFlag[] {
  const f: RiskFlag[] = [];
  // ── Risks: real defects that lower the score (capped below "Strong") ──
  if (!S.cEmail) f.push({ severity: "risk", color: "#E24B4A", title: "No grievance contact", detail: "Add a contact email for rights requests (DPDPA §5/§13)." });
  if (!(S.withdrawMethod && S.withdrawMethod !== "Not available yet")) f.push({ severity: "risk", color: "#E24B4A", title: "No withdrawal channel", detail: "Withdrawal must be as easy as giving consent — add a clear channel." });
  if (["Forever", "Not sure"].includes(S.retention)) f.push({ severity: "risk", color: "#E8AB42", title: "Weak retention", detail: "Set a time-bound or purpose-linked period instead of “" + (S.retention || "—") + "”." });
  if (!S.noVendors && !S.vendors.length) f.push({ severity: "risk", color: "#E8AB42", title: "No vendors disclosed", detail: 'Add who you share data with, or tick "no third party".' });
  if (S.data.some((d) => isVague(S.purpose[d]))) f.push({ severity: "risk", color: "#E8AB42", title: "Vague purpose detected", detail: "Some data has a too-broad purpose — describe the specific activity." });
  if (S.children === "Yes" && !S.childWhy.length) f.push({ severity: "risk", color: "#E8AB42", title: "Children’s data not detailed", detail: "State why children’s data is collected." });
  // ── Heads-up: informational, not defects — no score impact ──
  const sens = S.data.filter((d) => SENSITIVE.has(d));
  if (sens.length) f.push({ severity: "info", color: "#35B6AE", title: "Sensitive data in scope", detail: sens.slice(0, 4).join(", ") + (sens.length > 4 ? "…" : "") + " — handle with extra care." });
  if (S.children === "Yes") f.push({ severity: "info", color: "#35B6AE", title: "Children’s data in scope", detail: "Verifiable parental consent required; no targeted ads — clause added." });
  const mkt = (SECTORS.find((s) => s.key === S.sector)?.purposes) || [];
  if (mkt.some((p) => /market/i.test(p))) f.push({ severity: "info", color: "#35B6AE", title: "Marketing in scope", detail: "A separate marketing consent block is included — never bundle it into service consent." });
  return f;
}

export function dsarLink(S: NPState): string {
  return "saralprivacy.com/r/" + (S.slug || slugify(S.org) || "your-business");
}

export function rightsBlock(S: NPState): string {
  return `You may request access, correction, erasure, withdrawal of consent, grievance redressal or nomination by contacting ${S.cEmail || "[email]"}. You may also use our Data Rights Request Form: ${dsarLink(S)}. If your grievance is not resolved, you may complain to the Data Protection Board of India.`;
}

export function miniFor(S: NPState, key: string): string {
  const c = CONTEXTS.find((x) => x.key === key);
  return c ? c.mini(S.org || "us") : "";
}

export function newNoticeId(): string {
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SP-NOTICE-${new Date().getFullYear()}-${r}`;
}

// Real SHA-256 of the notice text (browser Web Crypto). Returns "" if unavailable (SSR).
export async function sha256(text: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle === "undefined") return "";
  const buf = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return "sha256:" + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function evidence(S: NPState, opts?: { noticeId?: string; hash?: string }) {
  const sec = SECTORS.find((s) => s.key === S.sector);
  return {
    notice_id: opts?.noticeId || "SP-NOTICE-(pending)",
    notice_version: "1.0",
    business_name: S.org,
    sector: sec?.label || "",
    generated_at: new Date().toISOString(),
    language: S.lang,
    data_categories: S.data,
    purpose_mappings: S.data.map((d) => ({ data: d, purpose: S.purpose[d] || "" })),
    collection_contexts: S.contexts,
    vendors: S.noVendors ? [] : S.vendors,
    children_data: S.children === "Yes",
    retention_basis: S.retention,
    withdrawal_method: S.withdrawMethod,
    rights_contact_email: S.cEmail,
    dsar_link: dsarLink(S),
    readiness_score: score(S),
    notice_hash: opts?.hash || "sha256:(generated on export)",
  };
}

export { consentBlocks };

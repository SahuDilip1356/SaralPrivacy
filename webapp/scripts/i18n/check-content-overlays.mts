// ─────────────────────────────────────────────────────────────────────────────
// W4 content-overlay gate — the mechanical half of MULTILINGUAL_SPEC §7.5
// (verify.mts) for the hand-authored Hindi content overlays.
//
//   node --import ./scripts/ts-resolve.mjs --experimental-strip-types \
//        scripts/i18n/check-content-overlays.mts [--locale hi] [--verbose]
//
// For every (English, translated) string pair it enforces:
//   1. CITATION IDENTITY — every Section/Sec./s./Rule/Schedule citation, ₹/€
//      amount, date and dated statute name in the English appears
//      byte-identical in the translation, the same number of times. A
//      translator "fixing" a section number is a defect (spec §6).
//   2. NUMERAL IDENTITY — the multiset of numbers is identical (catches a
//      number added, dropped or changed anywhere, citation or not), and so is
//      the multiset of parenthetical enumerators like (a), (ii), (3).
//   3. LATIN DIGITS ONLY — zero Devanagari digits (०-९).
//   4. DO-NOT-TRANSLATE — every DNT term in the English survives in Latin, and
//      no known transliteration of one appears.
//   5. MARKDOWN STRUCTURE (learn topics) — same non-empty line count, and line
//      by line the same kind (h2/h3/bullet/numbered with the same number/table
//      row with the same column count/paragraph) and the same bold-span count;
//      table separator rows and link hrefs byte-identical.
//   6. ORPHANS — an overlay key with no English entity is an error.
// Coverage (fields translated / total) is reported per module.
// Exit code 1 on any error.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const LOCALE = args.includes("--locale") ? args[args.indexOf("--locale") + 1] : "hi";
const VERBOSE = args.includes("--verbose");

const imp = async (rel: string) => import(resolve(ROOT, rel));
const tryOverlay = async (rel: string, wholeModule = false) => {
  try {
    const m = await imp(rel);
    return wholeModule ? m : m.default;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ERR_MODULE_NOT_FOUND") return undefined;
    throw e;
  }
};

// ── Rules ────────────────────────────────────────────────────────────────────
const MONTH =
  "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
const CITATION_PATTERNS: [string, RegExp][] = [
  // Section 8(6) · Sections 11-14 · Sec. 7 · s.9 · ss. 3 · Rule 13 · Rules 3–5 · Schedule 1 · Article 21
  [
    "citation",
    /\b(?:Sections?|Sec\.?|ss?\.|Rules?|Schedule|Article|Clause)\s?\d+[A-Za-z]?(?:\([0-9A-Za-z]+\))*(?:\s?[-–]\s?\d+[A-Za-z]?(?:\([0-9A-Za-z]+\))*)?/g,
  ],
  ["amount", /[₹€$]\s?\d(?:[\d,.]*\d)?(?:\s?(?:crore|lakhs?|million|billion|cr|L)\b)?/g],
  [
    "date",
    new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)? ${MONTH}(?:,? \\d{4})?\\b|\\b${MONTH}(?: \\d{1,2},)? \\d{4}\\b`, "g"),
  ],
  // Dated statute names: "Aadhaar Act, 2016", "DPDP Rules, 2025", "Companies Act 2013"
  ["statute", /\b(?:[A-Z][A-Za-z&-]*\s){0,6}(?:Act|Rules|Regulations|Code),?\s\d{4}\b/g],
  // Undated statute short names that must stay Latin
  ["statute", /\b(?:DPDP Act|IT Act|DPDP Rules|Aadhaar Act|Companies Act|Income[- ]Tax Act)\b/g],
];
const NUMBER = /\d+(?:[.,:]\d+)*/g;
// Enumerators only when free-standing: "purpose(s)" is a plural, not an (s).
const ENUMERATOR = /(?<![A-Za-z])\((?:[a-z]|[ivx]{1,4}|\d{1,2})\)/g;
// A sentence-initial article is not part of a statute's name.
const LEADING_FUNCTION_WORD = /^(?:(?:The|This|These|That|Under|Both|And|Or|Of|By|In|An?)\s+)+/;
const DEVANAGARI_DIGIT = /[०-९]/;
const DEVANAGARI = /[ऀ-ॿ]/;

// DNT: [label, pattern]. Stems so plurals ("Data Fiduciaries") still match.
const DNT: [string, RegExp][] = [
  ["DPDPA", /\bDPDPA\b/],
  ["DPDP", /\bDPDP\b/],
  ["SaralPrivacy", /SaralPrivacy/],
  ["Setu", /\bSetu\b/],
  ["Aadhaar", /\bAadhaar\b/],
  ["PAN", /\bPAN\b/],
  ["GST", /\bGST\b/],
  ["TDS", /\bTDS\b/],
  ["ITR", /\bITR\b/],
  ["CA", /\bCA\b/],
  ["DPO", /\bDPO\b/],
  ["KYC", /\bKYC\b/],
  ["GDPR", /\bGDPR\b/],
  ["Data Fiduciary", /Data Fiduciar(?:y|ies)/],
  ["Data Principal", /Data Principals?/],
  ["Data Processor", /Data Processors?/],
  ["Consent Manager", /Consent Managers?/],
  ["Data Protection Board", /Data Protection Board/],
  ["WhatsApp", /WhatsApp/],
  ["Google", /\bGoogle\b/],
  ["Tally", /\bTally\b/],
  ["Razorpay", /Razorpay/],
];
const DNT_ANCHORED_ON_EN = new Set(["DPDP"]); // "DPDP" inside "DPDPA" is fine
const FORBIDDEN_TRANSLITERATION =
  /डीपीडीपी|व्हाट्स|गूगल|सरल ?प्राइवेसी|पैन कार्ड|जीएसटी|टीडीएस|आईटीआर|केवाईसी|जीडीपीआर|डेटा फ़?फ़िड्यूशरी|डेटा फिड्यूशरी|डेटा प्रिंसिपल|कंसेंट मैनेजर|रेज़रपे|टैली/;

const count = (hay: string, needle: string) => hay.split(needle).length - 1;
const multiset = (s: string, re: RegExp) => (s.match(re) ?? []).slice().sort();
const sameMultiset = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

// ── Collector ────────────────────────────────────────────────────────────────
type Pair = { where: string; en: string; tr: string | undefined; markdown?: boolean; localTerm?: boolean };
const errors: string[] = [];
const warnings: string[] = [];
const coverage: Record<string, { total: number; done: number; words: number }> = {};
const words = (s: string) => (s.match(/\S+/g) ?? []).length;

function checkPair(module: string, p: Pair) {
  const cov = (coverage[module] ??= { total: 0, done: 0, words: 0 });
  cov.total++;
  if (p.tr === undefined || p.tr.trim() === "") return;
  cov.done++;
  cov.words += words(p.en);
  const { en, tr, where } = p;
  const e = (msg: string) => errors.push(`${module} ${where}: ${msg}`);

  if (DEVANAGARI_DIGIT.test(tr)) e(`Devanagari digit in translation`);
  if (FORBIDDEN_TRANSLITERATION.test(tr))
    e(`transliterated DNT term: "${tr.match(FORBIDDEN_TRANSLITERATION)?.[0]}"`);
  if (!DEVANAGARI.test(tr)) warnings.push(`${module} ${where}: translation has no Devanagari`);
  if (p.localTerm) return; // a headword gloss: digit + DNT-transliteration rules only

  for (const [kind, re] of CITATION_PATTERNS) {
    const seen = new Set<string>();
    for (const m of en.match(re) ?? []) {
      const token = kind === "statute" ? m.trim().replace(LEADING_FUNCTION_WORD, "") : m.trim();
      if (!token) continue;
      if (seen.has(token)) continue;
      seen.add(token);
      const want = count(en, token);
      const got = count(tr, token);
      if (got !== want) e(`${kind} "${token}" appears ${want}× in English, ${got}× in translation`);
    }
  }
  const nEn = multiset(en, NUMBER);
  const nTr = multiset(tr, NUMBER);
  if (!sameMultiset(nEn, nTr)) e(`numbers differ — en [${nEn.join(" ")}] vs tr [${nTr.join(" ")}]`);
  const phEn = multiset(en, /\{[A-Za-z]+/g);
  const phTr = multiset(tr, /\{[A-Za-z]+/g);
  if (!sameMultiset(phEn, phTr)) e(`placeholders differ — en [${phEn.join(" ")}] vs tr [${phTr.join(" ")}]`);
  const enumEn = multiset(en, ENUMERATOR);
  const enumTr = multiset(tr, ENUMERATOR);
  if (!sameMultiset(enumEn, enumTr))
    e(`enumerators differ — en [${enumEn.join(" ")}] vs tr [${enumTr.join(" ")}]`);

  for (const [label, re] of DNT) {
    if (!re.test(en)) continue;
    if (DNT_ANCHORED_ON_EN.has(label) && !/\bDPDP\b(?!A)/.test(en)) continue;
    if (!re.test(tr)) e(`DNT term "${label}" missing (must stay in Latin script)`);
  }

  if (p.markdown) checkMarkdown(module, where, en, tr);
}

type LineKind = string;
function lineKind(line: string): LineKind {
  if (line.startsWith("### ")) return "h3";
  if (line.startsWith("## ")) return "h2";
  if (line.startsWith("- ")) return "bullet";
  const num = line.match(/^(\d+)\. /);
  if (num) return `num:${num[1]}`;
  if (line.trimStart().startsWith("|")) {
    if (/^\s*\|[\s|:-]+\|\s*$/.test(line)) return `tablesep:${line.trim()}`;
    return `row:${line.split("|").length}`;
  }
  return "p";
}
function checkMarkdown(module: string, where: string, en: string, tr: string) {
  const e = (msg: string) => errors.push(`${module} ${where}: ${msg}`);
  const L = (s: string) => s.trim().split("\n").filter((l) => l.trim() !== "");
  const a = L(en);
  const b = L(tr);
  if (a.length !== b.length) {
    e(`markdown has ${b.length} non-empty lines, English has ${a.length}`);
    return;
  }
  const hrefs = (s: string) => [...s.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  for (let i = 0; i < a.length; i++) {
    const ka = lineKind(a[i]);
    const kb = lineKind(b[i]);
    if (ka !== kb) e(`line ${i + 1}: English is ${ka}, translation is ${kb} ("${b[i].slice(0, 60)}")`);
    const boldA = (a[i].match(/\*\*/g) ?? []).length;
    const boldB = (b[i].match(/\*\*/g) ?? []).length;
    if (boldA !== boldB) e(`line ${i + 1}: ${boldA / 2} bold span(s) in English, ${boldB / 2} in translation`);
    if (boldB % 2 !== 0) e(`line ${i + 1}: unbalanced ** in translation`);
    const hA = hrefs(a[i]).join(" ");
    const hB = hrefs(b[i]).join(" ");
    if (hA !== hB) e(`line ${i + 1}: link hrefs differ [${hA}] vs [${hB}]`);
  }
}

function orphans(module: string, overlayKeys: string[], enKeys: Iterable<string>) {
  const known = new Set(enKeys);
  for (const k of overlayKeys) if (!known.has(k)) errors.push(`${module}: orphan overlay key "${k}" (no English entity)`);
}

// ── Modules ──────────────────────────────────────────────────────────────────
const FAQ = await imp("lib/data/faqs.ts");
const faqO = await tryOverlay(`lib/data/i18n/faqs.${LOCALE}.ts`);
if (faqO) {
  orphans("faqs", Object.keys(faqO.items ?? {}), FAQ.faqs.map((f: { id: string }) => f.id));
  orphans("faqs", Object.keys(faqO.categories ?? {}), FAQ.faqCategories.map((c: { id: string }) => c.id));
}
for (const f of FAQ.faqs) {
  checkPair("faqs", { where: `${f.id}.question`, en: f.question, tr: faqO?.items?.[f.id]?.question });
  checkPair("faqs", { where: `${f.id}.answer`, en: f.answer, tr: faqO?.items?.[f.id]?.answer });
}
for (const c of FAQ.faqCategories)
  checkPair("faqs", { where: `category.${c.id}`, en: c.label, tr: faqO?.categories?.[c.id] });

const LEARN = (await imp("lib/data/learn-content.ts")).learnContent;
let learnO = await tryOverlay(`lib/data/i18n/learn-content.${LOCALE}.ts`);
// Work-in-progress: LEARN_PARTS_DIR=<dir> merges every *.mts part file there
// (each default-exporting { [slug]: {...} }) when the assembled overlay is absent.
if (!learnO && process.env.LEARN_PARTS_DIR) {
  const { readdirSync } = await import("node:fs");
  learnO = {};
  for (const f of readdirSync(process.env.LEARN_PARTS_DIR).filter((f) => f.endsWith(".mts")))
    Object.assign(learnO, (await import(resolve(process.env.LEARN_PARTS_DIR, f))).default);
}
if (learnO) orphans("learn", Object.keys(learnO), Object.keys(LEARN));
for (const [slug, t] of Object.entries<{ title: string; description: string; content: string }>(LEARN)) {
  const o = learnO?.[slug];
  checkPair("learn", { where: `${slug}.title`, en: t.title, tr: o?.title });
  checkPair("learn", { where: `${slug}.description`, en: t.description, tr: o?.description });
  checkPair("learn", { where: `${slug}.content`, en: t.content, tr: o?.content, markdown: true });
}

const GL = await imp("components/glossary/glossaryData.ts");
const glO = await tryOverlay(`components/glossary/i18n/glossaryData.${LOCALE}.ts`);
if (glO) {
  orphans("glossary", Object.keys(glO.terms ?? {}), GL.TERMS.map((t: { id: string }) => t.id));
  orphans("glossary", Object.keys(glO.categories ?? {}), GL.CATEGORIES.map((c: { id: string }) => c.id));
}
for (const t of GL.TERMS) {
  const o = glO?.terms?.[t.id];
  checkPair("glossary", { where: `${t.id}.definition`, en: t.definition, tr: o?.definition });
  checkPair("glossary", { where: `${t.id}.localTerm`, en: t.term, tr: o?.localTerm, localTerm: true });
}
for (const c of GL.CATEGORIES)
  checkPair("glossary", { where: `category.${c.id}`, en: c.label, tr: glO?.categories?.[c.id] });

const CL = await imp("lib/data/compliance-checklist.ts");
const clO = await tryOverlay(`lib/data/i18n/compliance-checklist.${LOCALE}.ts`);
const clSections = [...CL.part1Sections, ...CL.part2Sections];
const clItems = clSections.flatMap((s: { items: unknown[] }) => s.items) as {
  id: string; subsection: string; requirement: string; guardrail: string;
}[];
if (clO) {
  orphans("checklist", Object.keys(clO.sections ?? {}), clSections.map((s: { sectionId: string }) => s.sectionId));
  orphans("checklist", Object.keys(clO.items ?? {}), clItems.map((i) => i.id));
  orphans("checklist", Object.keys(clO.statusLabels ?? {}), CL.statusLabels.map((s: { type: string }) => s.type));
  orphans("checklist", Object.keys(clO.keyGuardrails ?? {}), CL.keyGuardrails.map((g: { id: number }) => String(g.id)));
}
for (const s of clSections)
  checkPair("checklist", { where: `section.${s.sectionId}.title`, en: s.title, tr: clO?.sections?.[s.sectionId]?.title });
for (const i of clItems) {
  const o = clO?.items?.[i.id];
  checkPair("checklist", { where: `${i.id}.subsection`, en: i.subsection, tr: o?.subsection });
  if (o?.subsection && !o.subsection.startsWith(`${i.id} `))
    errors.push(`checklist ${i.id}.subsection: must keep the "${i.id} " prefix`);
  checkPair("checklist", { where: `${i.id}.requirement`, en: i.requirement, tr: o?.requirement });
  checkPair("checklist", { where: `${i.id}.guardrail`, en: i.guardrail, tr: o?.guardrail });
}
for (const s of CL.statusLabels) {
  checkPair("checklist", { where: `status.${s.type}.label`, en: s.label, tr: clO?.statusLabels?.[s.type]?.label });
  checkPair("checklist", { where: `status.${s.type}.meaning`, en: s.meaning, tr: clO?.statusLabels?.[s.type]?.meaning });
}
for (const g of CL.keyGuardrails) {
  checkPair("checklist", { where: `guardrail.${g.id}.heading`, en: g.heading, tr: clO?.keyGuardrails?.[String(g.id)]?.heading });
  checkPair("checklist", { where: `guardrail.${g.id}.body`, en: g.body, tr: clO?.keyGuardrails?.[String(g.id)]?.body });
}
checkPair("checklist", { where: "disclaimer", en: CL.DISCLAIMER, tr: clO?.disclaimer });

const HV = await imp("lib/data/hero-verdicts.ts");
const hvO = await tryOverlay(`lib/data/i18n/hero-verdicts.${LOCALE}.ts`);
if (hvO) orphans("hero-verdicts", Object.keys(hvO), HV.HERO_VERDICTS.map((v: { slug: string }) => v.slug));
for (const v of HV.HERO_VERDICTS) {
  checkPair("hero-verdicts", { where: `${v.slug}.chipLabel`, en: v.chipLabel, tr: hvO?.[v.slug]?.chipLabel });
  checkPair("hero-verdicts", { where: `${v.slug}.riskLine`, en: v.riskLine, tr: hvO?.[v.slug]?.riskLine });
}

const VP = await imp("lib/data/verdict-previews.ts");
const vpO = await tryOverlay(`lib/data/i18n/verdict-previews.${LOCALE}.ts`);
type Preview = { slug: string; tab: string; label: string; categories: { label: string }[]; topGaps: string[]; firstActions: string[] };
if (vpO) orphans("verdict-previews", Object.keys(vpO.previews ?? {}), VP.VERDICT_PREVIEWS.map((p: Preview) => p.slug));
for (const p of VP.VERDICT_PREVIEWS as Preview[]) {
  const o = vpO?.previews?.[p.slug];
  checkPair("verdict-previews", { where: `${p.slug}.tab`, en: p.tab, tr: o?.tab });
  checkPair("verdict-previews", { where: `${p.slug}.label`, en: p.label, tr: o?.label });
  if (o) {
    orphans(`verdict-previews ${p.slug}.categories`, Object.keys(o.categories ?? {}), p.categories.map((c) => c.label));
    orphans(`verdict-previews ${p.slug}.topGaps`, Object.keys(o.topGaps ?? {}), p.topGaps);
    orphans(`verdict-previews ${p.slug}.firstActions`, Object.keys(o.firstActions ?? {}), p.firstActions);
  }
  for (const c of p.categories) checkPair("verdict-previews", { where: `${p.slug}.category`, en: c.label, tr: o?.categories?.[c.label] });
  for (const g of p.topGaps) checkPair("verdict-previews", { where: `${p.slug}.topGap`, en: g, tr: o?.topGaps?.[g] });
  for (const a of p.firstActions) checkPair("verdict-previews", { where: `${p.slug}.firstAction`, en: a, tr: o?.firstActions?.[a] });
}
if (vpO) orphans("verdict-previews checklist", Object.keys(vpO.checklist ?? {}), VP.VERDICT_CHECKLIST);
for (const c of VP.VERDICT_CHECKLIST) checkPair("verdict-previews", { where: "checklist", en: c, tr: vpO?.checklist?.[c] });

// Homepage deck copy — English lives inside the client component, so read it
// from the source text (the component cannot be imported outside Next).
const deckSrc = readFileSync(resolve(ROOT, "components/home/AudienceCards.tsx"), "utf8");
const deckO = await tryOverlay(`components/home/i18n/AudienceCards.${LOCALE}.ts`);
const deckCards = [...deckSrc.matchAll(/href: "\/industries\/([^"]+)"[\s\S]*?risk: "([^"]+)",\s*painPoints: \[([^\]]*)\],\s*line: "([^"]+)"/g)].map(
  (m) => ({ slug: m[1], risk: m[2], painPoints: [...m[3].matchAll(/"([^"]+)"/g)].map((x) => x[1]), line: m[4] })
);
if (deckCards.length !== 12) errors.push(`deck: expected 12 cards in AudienceCards.tsx, parsed ${deckCards.length}`);
if (deckO) orphans("deck", Object.keys(deckO), deckCards.map((c) => c.slug));
for (const c of deckCards) {
  const o = deckO?.[c.slug];
  checkPair("deck", { where: `${c.slug}.risk`, en: c.risk, tr: o?.risk });
  checkPair("deck", { where: `${c.slug}.line`, en: c.line, tr: o?.line });
  if (o) orphans(`deck ${c.slug}.painPoints`, Object.keys(o.painPoints ?? {}), c.painPoints);
  for (const pp of c.painPoints) checkPair("deck", { where: `${c.slug}.painPoint`, en: pp, tr: o?.painPoints?.[pp] });
}

const RT = (await tryOverlay("lib/data/resource-templates.ts", true)) ?? { RESOURCE_TEMPLATES: [] };
const rtO = await tryOverlay(`lib/data/i18n/resource-templates.${LOCALE}.ts`);
if (rtO) orphans("resource-templates", Object.keys(rtO), RT.RESOURCE_TEMPLATES.map((t: { file: string }) => t.file));
for (const t of RT.RESOURCE_TEMPLATES) {
  checkPair("resource-templates", { where: `${t.file}.title`, en: t.title, tr: rtO?.[t.file]?.title });
  checkPair("resource-templates", { where: `${t.file}.desc`, en: t.desc, tr: rtO?.[t.file]?.desc });
}

// Chrome catalog namespaces W4 added (mechanism A: same key in en.json).
const W4_NAMESPACES = ["faqPage", "glossaryPage", "checklistPage", "resourcesPage", "home.band", "learn.topic"];
const enMsg = JSON.parse(readFileSync(resolve(ROOT, "messages/en.json"), "utf8"));
const trMsg = JSON.parse(readFileSync(resolve(ROOT, `messages/${LOCALE}.json`), "utf8"));
const at = (o: unknown, path: string) =>
  path.split(".").reduce<unknown>((cur, k) => (cur && typeof cur === "object" ? (cur as Record<string, unknown>)[k] : undefined), o);
function walk(en: unknown, tr: unknown, path: string) {
  if (typeof en === "string") {
    checkPair("messages", { where: path, en, tr: typeof tr === "string" ? tr : undefined });
    return;
  }
  if (en && typeof en === "object") for (const k of Object.keys(en)) walk((en as Record<string, unknown>)[k], at(tr, k), `${path}.${k}`);
}
for (const ns of W4_NAMESPACES) {
  const e = at(enMsg, ns);
  const t = at(trMsg, ns);
  if (ns === "home.band") {
    // mechanism B (data-driven): hi-only keys, English source is the band union
    for (const [k, v] of Object.entries((t ?? {}) as Record<string, string>))
      checkPair("messages", { where: `home.band.${k}`, en: k, tr: v, localTerm: true });
    continue;
  }
  if (e === undefined) continue;
  walk(e, t, ns);
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`W4 content-overlay check — locale "${LOCALE}"`);
for (const [m, c] of Object.entries(coverage))
  console.log(`  ${m.padEnd(20)} ${String(c.done).padStart(4)}/${String(c.total).padEnd(4)} fields translated · ${c.words} English words covered`);
if (VERBOSE || warnings.length <= 20) for (const w of warnings) console.log(`  warn  ${w}`);
else console.log(`  ${warnings.length} warnings (use --verbose)`);
if (errors.length) {
  console.log(`\n✖ ${errors.length} error(s):`);
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log(`\n✔ citation identity · numerals · Latin digits · DNT · markdown structure · orphans — all clean`);

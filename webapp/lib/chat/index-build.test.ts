// Chat index extraction guard tests — run against the REAL repo content.
// Run: node --test --experimental-strip-types lib/chat/index-build.test.ts
//
// These are coverage floors: if a content refactor breaks extraction (renamed
// const, moved module, restructured page), counts collapse and this fails
// before a hollow index ever ships.

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  collectAllChunks,
  extractBalancedArray,
  evalDataLiteral,
  extractTsxProse,
  splitMarkdownSections,
} from "./index-build.ts";
import { INDUSTRY_SLUGS, isValidCitation } from "./site-routing.ts";

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const { chunks, stats } = collectAllChunks(APP_ROOT);

test("coverage floors per source", () => {
  assert.ok(stats.bySource.learn >= 60, `learn chunks: ${stats.bySource.learn}`);
  assert.ok(stats.bySource.glossary >= 45, `glossary: ${stats.bySource.glossary}`);
  assert.ok(stats.bySource.faq >= 12, `faq: ${stats.bySource.faq}`);
  assert.ok(stats.bySource.checklist >= 20, `checklist: ${stats.bySource.checklist}`);
  assert.ok(stats.bySource.industry >= 48, `industry: ${stats.bySource.industry}`);
  assert.ok(stats.bySource.learnStatic >= 4, `learnStatic: ${stats.bySource.learnStatic}`);
  assert.ok(stats.total >= 150, `total: ${stats.total}`);
});

test("every industry contributes typed FAQ chunks and prose", () => {
  for (const slug of INDUSTRY_SLUGS) {
    const ofSector = chunks.filter((c) => c.industry === slug);
    const typedFaqs = ofSector.filter((c) => c.id.includes(":faq:"));
    assert.ok(typedFaqs.length >= 3, `${slug}: only ${typedFaqs.length} typed FAQ chunks`);
    assert.ok(ofSector.length >= 4, `${slug}: only ${ofSector.length} chunks total`);
  }
});

test("every chunk cites a valid URL and sane text", () => {
  const ids = new Set<string>();
  for (const c of chunks) {
    assert.ok(isValidCitation(c.url), `invalid chunk url: ${c.url} (${c.id})`);
    assert.ok(!ids.has(c.id), `dup id ${c.id}`);
    ids.add(c.id);
    assert.ok(c.text.length >= 40 && c.text.length <= 4000, `bad length ${c.text.length}: ${c.id}`);
    assert.ok(c.title.length > 0 && c.section.length > 0);
  }
});

test("tsx-text extraction stays a minority of the index", () => {
  assert.ok(stats.tsxTextShare <= 0.5, `tsx-text share ${stats.tsxTextShare}`);
});

test("splitMarkdownSections handles intro + headings", () => {
  const secs = splitMarkdownSections("intro line\n\n## One\nbody1\n\n## Two\nbody2");
  assert.deepEqual(
    secs.map((s) => s.heading),
    ["Overview", "One", "Two"]
  );
});

test("extractBalancedArray + evalDataLiteral round-trip a faqs literal", () => {
  const src = `const x = 1;\nconst faqs = [\n  { question: "A [tricky] one?", answer: "Yes {\\"quoted\\"} and 'nested'." },\n];\nexport default x;`;
  const lit = extractBalancedArray(src, "faqs");
  assert.ok(lit);
  const val = evalDataLiteral(lit) as Array<{ question: string; answer: string }>;
  assert.equal(val.length, 1);
  assert.equal(val[0].question, "A [tricky] one?");
});

test("extractTsxProse keeps sentences, drops class strings", () => {
  const src = `
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
      {"CA firms process substantial personal data including PAN and Aadhaar records, which makes them Data Fiduciaries under the Act."}
    </div>`;
  const prose = extractTsxProse(src);
  assert.equal(prose.length, 1);
  assert.match(prose[0], /Data Fiduciaries/);
});

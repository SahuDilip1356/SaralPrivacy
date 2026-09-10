// seo-title.test.ts — run from webapp/:
//   node --experimental-strip-types --test lib/content/seo-title.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { seoTitle } from "./seo-title.ts";

/** The real headlines behind the mid-word titles measured live on 2026-09-09. */
const LIVE_BROKEN = [
  "DPDPA Consent Notice Requirements: What Your Business Must Disclose",
  "Recruitment Agencies: Your CV Database Is Now a Compliance Liability",
  "CA Firms and DPDPA: Your Obligations When Handling Client Financial Data",
  "Data Breach Notification Under DPDPA: Timelines and Reporting Duties",
  "Training Institutes and DPDPA: Managing Student and Trainer Records",
  "Rights of Data Principals Under DPDPA: What Individuals Can Demand",
  "Significant Data Fiduciaries: Who Gets Designated and What Changes",
];

test("never emits an ellipsis, for any live headline", () => {
  for (const t of LIVE_BROKEN) {
    assert.ok(!seoTitle(t).includes("…"), `ellipsis survived in: ${seoTitle(t)}`);
  }
});

test("never exceeds max", () => {
  for (const t of LIVE_BROKEN) {
    assert.ok(seoTitle(t).length <= 46, `${seoTitle(t).length} chars: ${seoTitle(t)}`);
  }
});

test("short titles pass through untouched", () => {
  assert.equal(seoTitle("DPDPA in plain English"), "DPDPA in plain English");
});

test("cuts at the colon when one falls late enough", () => {
  assert.equal(
    seoTitle("Rights of Data Principals Under DPDPA: What Individuals Can Demand"),
    "Rights of Data Principals Under DPDPA",
  );
});

test("keeps the specific half when the colon falls too early", () => {
  // Cutting at the colon here would yield a vague "CA Firms and DPDPA"; the
  // word-boundary path keeps the part that says what the page is actually about.
  assert.equal(
    seoTitle("CA Firms and DPDPA: Your Obligations When Handling Client Financial Data"),
    "CA Firms and DPDPA: Your Obligations",
  );
});

test("ignores a clause break that falls too early to keep the sense", () => {
  // The comma sits at 5 chars — cutting there would leave "Today", not a title.
  const out = seoTitle("Today, small businesses handling customer records face a new obligation");
  assert.notEqual(out, "Today");
  assert.ok(out.length > 20, out);
});

test("never ends mid-word", () => {
  const source = "Significant Data Fiduciaries Who Get Designated And What Changes Next";
  const out = seoTitle(source);
  // Every emitted word must appear whole in the source.
  for (const w of out.split(" ")) {
    assert.ok(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(source), `partial word "${w}" in: ${out}`);
  }
});

test("never ends on a connective", () => {
  const out = seoTitle("Your Obligations When Handling Extremely Sensitive Client Records");
  const last = out.split(" ").pop()!.toLowerCase();
  assert.ok(!["when", "and", "the", "your", "with", "of", "to"].includes(last), `dangling "${last}": ${out}`);
});

test("strips trailing dashes, as the old truncator did", () => {
  const out = seoTitle("Data Breach Notification Under DPDPA — Timelines and Duties");
  assert.ok(!/[—–\-]$/.test(out), out);
});

test("a single over-long word still returns something", () => {
  const out = seoTitle("Supercalifragilisticexpialidociousandthensomemoreletters", 20);
  assert.ok(out.length > 0 && out.length <= 20, out);
  assert.ok(!out.includes("…"));
});

test("output is stable — running it twice changes nothing", () => {
  for (const t of LIVE_BROKEN) {
    assert.equal(seoTitle(seoTitle(t)), seoTitle(t));
  }
});

test("never leaves a quotation hanging open", () => {
  const out = seoTitle("From 'Subject' to 'Principal': what the DPDPA rename actually changes");
  assert.ok(!/(^|\s)['"“‘]\S*$/.test(out), `unclosed quote: ${out}`);
  assert.ok(out.length > 10, out);
});

test("possessives and contractions are not mistaken for quotes", () => {
  assert.match(seoTitle("Do you know where your customers' info actually lives today"), /customers'/);
  assert.match(seoTitle("You don't need fancy tools to start complying with the DPDPA"), /don't/);
});

test("prefers a whole sentence over a mid-sentence cut", () => {
  assert.equal(
    seoTitle("You don't need fancy tools. You need a plan that fits your business"),
    "You don't need fancy tools.",
  );
});

test("rendered title with the suffix never exceeds 60", () => {
  for (const t of LIVE_BROKEN) {
    const rendered = `${seoTitle(t)} | SaralPrivacy`;
    assert.ok(rendered.length <= 60, `${rendered.length}: ${rendered}`);
  }
});

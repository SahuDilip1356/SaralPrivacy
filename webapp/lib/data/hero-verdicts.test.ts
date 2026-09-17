// Hero tap #2 contract tests (HERO_TAP2_SPEC.md §3, §6.1).
// Run: node --test --experimental-strip-types lib/data/hero-verdicts.test.ts
//
// The packs can't be imported under --experimental-strip-types (core.ts pulls
// types through value imports, and packs + core stay byte-identical by the
// isolation rule), so this reads pack SOURCE — the same drift-guard approach
// lib/data-flow/data-flow.test.ts takes with the recruitment pack.
//
// The hero asks a yes/no wrapper of a REAL pack question and a "Yes"
// pre-selects that option in the assessment. These tests hold that promise:
//   1. every row's `pre` names a question + option that exist in its pack,
//      and the question is one parsePrefill() can pre-fill;
//   2. band movement is monotonic (noBand ≤ band ≤ yesBand) AND visible
//      (yesBand ≠ noBand) — the rule that caught CA sitting at a capped High;
//   3. every questioned row has its copy in messages/en.json, so the hero never
//      renders a raw catalog key.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { HERO_VERDICTS, type HeroBand } from "./hero-verdicts.ts";
import { parsePrefill } from "./industry-assessment/prefill.ts";
import type { IAQuestion } from "./industry-assessment/core.ts";

const here = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(readFileSync(join(here, "../../messages/en.json"), "utf8"));

const ORDER: HeroBand[] = ["Moderate", "Moderate–High", "High"];
const rank = (b: HeroBand) => ORDER.indexOf(b);

// ── Pack source reader ───────────────────────────────────────────────────────
// Question objects open with an indented `id: "qN",` line; options are
// one-line `{ id: "…", label: …, riskPoints: … }` objects inside them.
type SourcePack = { industry: string; questions: IAQuestion[] };

function readPack(file: string): SourcePack {
  const src = readFileSync(join(packDir, file), "utf8");
  const industry = src.match(/industry:\s*"([^"]+)"/)![1];
  const starts = [...src.matchAll(/^\s+id:\s*"(q\d+)",/gm)];
  const questions = starts.map((m, i) => {
    const body = src.slice(m.index, starts[i + 1]?.index ?? src.length);
    return {
      id: m[1],
      type: body.match(/type:\s*"(single|multi)"/)![1],
      options: [...body.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((o) => ({ id: o[1] })),
    } as unknown as IAQuestion;
  });
  return { industry, questions };
}

const packDir = join(here, "industry-assessment", "packs");
const PACKS = readdirSync(packDir).filter((f) => f.endsWith(".ts")).map(readPack);

/** The hero keys by assessment route slug; packs key by industry. */
const packFor = (slug: string) =>
  PACKS.find((p) => p.industry === slug || p.industry === `${slug}-agencies`);

const questioned = HERO_VERDICTS.filter((v) => v.pre);

test("the three hero sectors each carry a question", () => {
  for (const slug of ["recruitment", "ca-firms", "d2c-brands"]) {
    assert.ok(
      questioned.some((v) => v.slug === slug),
      `${slug} has no hero question`
    );
  }
});

test("the source reader sees all 12 packs", () => {
  assert.equal(PACKS.length, 12);
  for (const p of PACKS) assert.ok(p.questions.length >= 10, `${p.industry}: read ${p.questions.length} questions`);
});

test("every row resolves to a pack", () => {
  for (const v of HERO_VERDICTS) {
    assert.ok(packFor(v.slug), `${v.slug}: no pack source with this industry`);
  }
});

test("every `pre` names a real pack question and option", () => {
  for (const v of questioned) {
    const pack = packFor(v.slug)!;
    const q = pack.questions.find((x) => x.id === v.pre!.questionId);
    assert.ok(q, `${v.slug}: ${v.pre!.questionId} is not in the ${pack.industry} pack`);
    assert.ok(
      q.options.some((o) => o.id === v.pre!.optionId),
      `${v.slug}: option ${v.pre!.optionId} is not in ${pack.industry} ${q.id}`
    );
  }
});

test("every `pre` round-trips through parsePrefill", () => {
  for (const v of questioned) {
    const pack = packFor(v.slug)!;
    const params = new URLSearchParams(`pre=${v.pre!.questionId}:${v.pre!.optionId}&src=hero`);
    const answers = parsePrefill(params, pack);
    assert.ok(answers, `${v.slug}: parsePrefill rejected its own hero link`);
    const value = answers[v.pre!.questionId];
    const ids = Array.isArray(value) ? value : [value];
    assert.deepEqual(ids, [v.pre!.optionId]);
  }
});

test("band movement is authored, monotonic, and visible", () => {
  for (const v of questioned) {
    assert.ok(v.yesBand && v.noBand, `${v.slug}: a questioned row needs yesBand and noBand`);
    assert.ok(rank(v.noBand!) <= rank(v.band), `${v.slug}: noBand above band`);
    assert.ok(rank(v.band) <= rank(v.yesBand!), `${v.slug}: yesBand below band`);
    assert.notEqual(v.yesBand, v.noBand, `${v.slug}: both answers must move the band`);
    // One authored step each way — capped at High, floored at Moderate.
    assert.equal(rank(v.yesBand!), Math.min(rank(v.band) + 1, 2), `${v.slug}: yesBand is not one step up`);
    assert.equal(rank(v.noBand!), Math.max(rank(v.band) - 1, 0), `${v.slug}: noBand is not one step down`);
  }
});

test("rows without a question carry no stray band steps", () => {
  for (const v of HERO_VERDICTS.filter((x) => !x.pre)) {
    assert.equal(v.yesBand, undefined, `${v.slug}: yesBand without a question`);
    assert.equal(v.noBand, undefined, `${v.slug}: noBand without a question`);
  }
});

test("CA typical is Moderate–High (spec §3.1 re-author)", () => {
  assert.equal(HERO_VERDICTS.find((v) => v.slug === "ca-firms")?.band, "Moderate–High");
});

test("every questioned row has its copy in en.json", () => {
  const keys = ["question", "yesLine", "noLine", "yesClause", "noClause"];
  for (const v of questioned) {
    const row = en.home.heroQuestions?.[v.slug];
    assert.ok(row, `${v.slug}: missing home.heroQuestions.${v.slug}`);
    for (const k of keys) {
      assert.equal(typeof row[k], "string", `${v.slug}: missing ${k}`);
      assert.ok(row[k].trim().length > 0, `${v.slug}: empty ${k}`);
    }
  }
});

test("the fixed hero + assessment strings exist in en.json", () => {
  for (const k of ["questionEyebrow", "yes", "no", "youSaid", "change", "typicalFor", "seeRealScore", "bandAnnounce"]) {
    assert.equal(typeof en.home.hero[k], "string", `home.hero.${k} missing`);
  }
  assert.equal(typeof en.assessment.shared.prefillNote, "string", "assessment.shared.prefillNote missing");
});

test("no praise openers — the card states the next gap", () => {
  for (const v of questioned) {
    const row = en.home.heroQuestions[v.slug];
    for (const line of [row.yesLine, row.noLine]) {
      assert.doesNotMatch(line, /^(Good|Great|Nice|Well done)\b/i, `${v.slug}: "${line}"`);
    }
  }
});

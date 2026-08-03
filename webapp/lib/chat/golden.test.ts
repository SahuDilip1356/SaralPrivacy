// Golden-set eval (spec §10) — runs the deterministic turn brain over
// eval/chat-golden.json and gates on ≥90% routing accuracy.
// Run: node --test --experimental-strip-types lib/chat/golden.test.ts
//
// A case passes when an accepted URL appears in the turn's citations OR
// actions (or, for refusal cases, when the turn refuses). Refusal cases are
// a HARD gate: any hallucinated answer to off-corpus input fails the suite
// regardless of the overall pass rate.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { planTurn, buildMeta } from "./orchestrate.ts";
import { createInitialState } from "./journeys.ts";

interface GoldenCase {
  id: string;
  category: string;
  query: string;
  accept?: string[];
  expectRefusal?: boolean;
  allowRefusal?: boolean;
  stretch?: boolean;
}

const goldenPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "eval", "chat-golden.json");
const golden = JSON.parse(readFileSync(goldenPath, "utf8")) as {
  gate: number;
  cases: GoldenCase[];
};

function runCase(c: GoldenCase): { pass: boolean; detail: string } {
  const state = createInitialState("golden", "/");
  const plan = planTurn(c.query, state);
  const meta = buildMeta(plan);
  const urls = [...meta.citations.map((x) => x.url), ...meta.actions.map((x) => x.url)];

  if (c.expectRefusal) {
    return { pass: meta.refusal, detail: meta.refusal ? "refused" : `answered with ${urls.join(", ")}` };
  }
  if (meta.refusal) {
    return {
      pass: c.allowRefusal === true && urls.includes("/contact"),
      detail: `refused (allowRefusal=${c.allowRefusal ?? false})`,
    };
  }
  const hit = c.accept!.find((u) => urls.includes(u));
  return { pass: Boolean(hit), detail: hit ? `hit ${hit}` : `got ${urls.slice(0, 4).join(", ")}` };
}

const core = golden.cases.filter((c) => !c.stretch);
const stretch = golden.cases.filter((c) => c.stretch);

test(`golden set: core routing accuracy >= ${golden.gate * 100}%`, () => {
  assert.ok(core.length >= 40, `only ${core.length} core cases`);
  const results = core.map((c) => ({ c, r: runCase(c) }));
  const failures = results.filter((x) => !x.r.pass);
  for (const f of failures) {
    console.error(`  FAIL [${f.c.id}] "${f.c.query}" -> ${f.r.detail}`);
  }
  const rate = (core.length - failures.length) / core.length;
  console.error(
    `  golden core: ${core.length - failures.length}/${core.length} = ${(rate * 100).toFixed(1)}%`
  );
  assert.ok(rate >= golden.gate, `routing accuracy ${(rate * 100).toFixed(1)}% below gate`);
});

test("refusal cases are a hard zero-hallucination gate", () => {
  for (const c of golden.cases.filter((x) => x.expectRefusal && !x.stretch)) {
    const { pass, detail } = runCase(c);
    assert.ok(pass, `[${c.id}] must refuse but ${detail}`);
  }
});

test("stretch cases reported (not gated)", () => {
  for (const c of stretch) {
    const { pass, detail } = runCase(c);
    console.error(`  stretch [${c.id}] ${pass ? "PASS" : "fail"} — ${detail}`);
  }
});

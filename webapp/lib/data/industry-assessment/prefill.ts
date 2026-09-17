// ─────────────────────────────────────────────────────────────────────────────
// Assessment pre-fill seam (HERO_TAP2_SPEC.md §4).
//
// URL contract: /assessment/<sector>?pre=<questionId>:<optionId>&src=hero
//
// The homepage hero asks one real pack question early; a "Yes" arrives here as
// `?pre=` and pre-SELECTS that option. It never skips a question: the scan
// still opens on q0, and nothing is scored that the visitor didn't confirm by
// advancing past it. Anything that doesn't validate against the pack — unknown
// question, unknown option, extra segments — yields null, so a hand-edited URL
// degrades cleanly (the same rule as ?bucket=).
//
// One function, twelve call sites, no per-sector logic — the first step of the
// 12× assessment-client dedup.
// ─────────────────────────────────────────────────────────────────────────────

import type { IAAnswers, IAQuestion } from "./core";

/** The slice of URLSearchParams / ReadonlyURLSearchParams this seam reads. */
type ParamReader = { get(name: string): string | null } | null | undefined;

export function parsePrefill(
  searchParams: ParamReader,
  pack: { questions: IAQuestion[] }
): IAAnswers | null {
  const raw = searchParams?.get("pre");
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length !== 2) return null;
  const [questionId, optionId] = parts;
  const q = pack.questions.find((x) => x.id === questionId);
  if (!q || !q.options.some((o) => o.id === optionId)) return null;
  if (q.type === "multi") return { [questionId]: [optionId] };
  if (q.type === "single") return { [questionId]: optionId };
  return null;
}

const ids = (v: IAAnswers[string]): string[] =>
  Array.isArray(v) ? v : v ? [v] : [];

/**
 * Whether question `questionId` still holds the pre-filled option — the
 * condition for its "Pre-selected from your homepage answer" note. Once the
 * visitor unticks it, the note has nothing left to explain and goes.
 */
export function prefillStillHeld(
  prefill: IAAnswers | null,
  questionId: string,
  answers: IAAnswers
): boolean {
  const want = ids(prefill?.[questionId]);
  const have = ids(answers[questionId]);
  return want.length > 0 && want.every((id) => have.includes(id));
}

/** Entry source for assessment_start. Only a known value is ever reported. */
export function entrySource(searchParams: ParamReader): "hero" | "" {
  return searchParams?.get("src") === "hero" ? "hero" : "";
}

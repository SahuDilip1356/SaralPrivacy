/**
 * editorial-guard.ts — stops unresolved editorial notes from being presented
 * as verified fact.
 *
 * The blog pipeline has an LLM validator (app/api/blog/validate/route.ts) that
 * writes reviewer notes into `PrimarySource.citation`, and the article page
 * renders `{src.citation}` verbatim into the public Sources list. The "Verified"
 * badge was gated on `validation_score >= 75` alone, so an article could tell a
 * reader "this claim as written is outdated and must be corrected" while wearing
 * a green Verified badge. Two live posts did exactly that:
 *   - dpdpa-compliance-for-smes-practical-guide-key-obligations (5 notes)
 *   - dpdpa-terminology-data-principal-fiduciary-guide (4 notes, 2 in body prose)
 *
 * This module is the systemic guard: cleaning those two Appwrite rows fixes
 * today's leak, not the next generated post.
 *
 * Fails SAFE by design — an ambiguous match costs a badge, never a false claim
 * of verification. Under-claiming is always the correct side to err on.
 */

/**
 * Phrases that mean "a human still has to resolve this". Deliberately narrow:
 * each requires the reviewer/editor framing, so ordinary advice copy such as
 * "verify that the vendor is registered…" does not trip it.
 */
export const EDITORIAL_NOTE_PATTERNS: RegExp[] = [
  /\beditors?\s+should\b/i,
  /\breaders?\s+should\s+verify\b/i,
  /\bmust\s+be\s+corrected\b/i,
  /\bas\s+written\s+is\s+outdated\b/i,
  /\breviewer\s+notes?\b/i,
  /\bappears\s+unsupported\b/i,
  /\bto\s+be\s+cited\b/i,
  /\bverify\s+whether\b/i,
  /\bTODO\b|\bTBD\b|\bFIXME\b/,
];

/** True when the text carries an unresolved editorial/reviewer note. */
export function hasEditorialNote(text: string | null | undefined): boolean {
  if (!text) return false;
  return EDITORIAL_NOTE_PATTERNS.some((re) => re.test(text));
}

/**
 * How many of the given texts carry an editorial note. Pass every surface a
 * reader can see — source citations AND section bodies. Two of the four leaks
 * on the terminology post were in body prose, so a sources-only check misses them.
 */
export function countEditorialNotes(texts: Array<string | null | undefined>): number {
  return texts.reduce<number>((n, t) => (hasEditorialNote(t) ? n + 1 : n), 0);
}

/**
 * Whether an article may display the "Verified" badge.
 * A passing validation score is necessary but not sufficient — the article must
 * also carry no unresolved editorial notes on any reader-visible surface.
 */
export function isVerifiable(
  validationScore: number | null | undefined,
  readerVisibleTexts: Array<string | null | undefined>,
  minScore = 75
): boolean {
  if (!validationScore || validationScore < minScore) return false;
  return countEditorialNotes(readerVisibleTexts) === 0;
}

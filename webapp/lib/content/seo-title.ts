/**
 * seo-title.ts — turn an editorial headline into a search-result title.
 *
 * Briefing headlines are written for humans and run long; Google shows roughly
 * 60 characters including our " | SaralPrivacy" suffix, so they must be cut.
 * The old truncator sliced at a fixed offset and appended "…", which cut
 * through words: 55 live titles read "…When Han…", "…Managing Stude…",
 * "…Who Gets Design…". A title that looks broken does not get clicked, and the
 * site's 28-day CTR was 0.25% on ~4,000 impressions.
 *
 * So: cut at a boundary a reader would have chosen, and never signal the cut.
 * A title ending on a whole phrase reads as deliberate; an ellipsis reads as a
 * bug. No "…" is ever emitted.
 *
 * Alias-free on purpose — the node test resolver cannot follow "@/" imports,
 * so pure logic lives outside the page that uses it (same reason as
 * lib/content/editorial-guard.ts).
 */

/** Ending a title on one of these reads as a sentence cut off mid-breath. */
const DANGLING = new Set([
  "a", "an", "and", "are", "as", "at", "but", "by", "can", "do", "does", "for",
  "from", "has", "have", "how", "if", "in", "into", "is", "it", "its", "of",
  "on", "or", "our", "should", "so", "than", "that", "the", "their", "then",
  "they", "this", "to", "under", "was", "were", "what", "when", "where",
  "which", "while", "who", "why", "will", "with", "you", "your",
]);

/** Clause breaks a human would cut at, in the order we prefer them. */
const CLAUSE_BREAKS = [": ", " — ", " – ", "; ", ", "];

/**
 * Briefing headlines are often two sentences ("You don't need fancy tools. You
 * need a plan."). The first sentence alone is a complete, clickable title, so
 * it beats any mid-sentence cut. The 3-letter guard keeps "Dr." and "e.g."
 * from reading as sentence ends.
 */
const SENTENCE_END = /[a-z0-9]{3,}[.!?](?=\s)/gi;

/**
 * A clause break is only worth taking if it leaves most of the headline —
 * cutting "CA Firms and DPDPA: ..." down to "CA Firms and DPDPA" is fine,
 * but cutting a long headline at a comma near the start throws away the point.
 */
const MIN_CLAUSE_SHARE = 0.6;

const TRAILING_PUNCT = /[\s,;:—–\-'’"“”(]+$/;

/**
 * Shorten `title` to at most `max` characters on a natural boundary.
 * Returns it unchanged when it already fits. Never appends an ellipsis.
 *
 * `max` defaults to 45 so that " | SaralPrivacy" (15) keeps the rendered
 * <title> at 60 — Google's display width. The old truncator used 46 and
 * shipped 61-character titles.
 */
export function seoTitle(title: string, max = 45): string {
  const clean = title.trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max);
  const floorAt = Math.floor(max * MIN_CLAUSE_SHARE);

  // 0. A whole sentence beats every partial cut — it reads as written, not cut.
  let sentence = -1;
  for (const m of window.matchAll(SENTENCE_END)) {
    const end = m.index + m[0].length;
    if (end >= floorAt) sentence = end;
  }
  if (sentence > 0) return closeQuotes(clean.slice(0, sentence).trim());

  // 1. A clause break, if one falls late enough to keep the headline's sense.
  let best = -1;
  for (const b of CLAUSE_BREAKS) {
    const i = window.lastIndexOf(b);
    if (i >= floorAt && i > best) best = i;
  }
  if (best > 0) return closeQuotes(clean.slice(0, best).replace(TRAILING_PUNCT, ""));

  // 2. Otherwise a word boundary. If the character just past the window is not
  //    whitespace, the window ends mid-word — drop that partial word.
  const words = window.trimEnd().split(/\s+/).filter(Boolean);
  if (!/\s/.test(clean.charAt(max))) words.pop();

  // 3. Never end on a connective: "…Obligations When" reads as truncated.
  while (words.length > 1 && DANGLING.has(stripWord(words[words.length - 1]))) {
    words.pop();
  }

  // A single word longer than `max` has no boundary to find — cut it and
  // accept the hard edge rather than returning an empty title.
  if (words.length === 0) return closeQuotes(window.replace(TRAILING_PUNCT, ""));

  return closeQuotes(words.join(" ").replace(TRAILING_PUNCT, ""));
}

function stripWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Drop a quotation the cut left hanging open — "From 'Subject' to 'Principal"
 * reads as a typo. Only a quote that STARTS a word counts as an opener, so
 * possessives ("customers'") and contractions ("don't") are left alone.
 */
function closeQuotes(s: string): string {
  const opener = /(^|\s)(['"“‘])/g;
  let cut = -1;
  for (const m of s.matchAll(opener)) {
    const at = m.index + m[1].length;
    const closer = m[2] === "“" ? "”" : m[2] === "‘" ? "’" : m[2];
    const closed = s.indexOf(closer, at + 1) !== -1 || (closer === "'" && /['’]/.test(s.slice(at + 1)));
    if (!closed) cut = at;
  }
  return cut === -1 ? s : s.slice(0, cut).replace(TRAILING_PUNCT, "");
}

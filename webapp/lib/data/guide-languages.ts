// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — DPDPA Guide languages · single source of truth
//
// Every language surface (the form chip selector, the per-language PDF lookup in
// /api/white-paper, the "Read online" links, the sitemap entries, and the
// hreflang alternates) derives from this one array — so the language list can
// never disagree across them.
//
// Hosting:
//   • PDFs  → Vercel Blob (large binaries kept out of git). Upload with
//             tools/upload-guide-pdfs.mjs; paste the returned URLs into `pdfUrl`.
//   • HTML  → standalone, self-styled documents served statically from
//             /public/guides/dpdpa-guide-{code}.html. They carry their own
//             <head>, fonts, <html lang>, and hreflang <link>s, so "Read online"
//             links straight to them.
//
// Activating a language is data-only: set `pdfUrl` and/or `htmlUrl`. A language
// with neither renders as a "coming soon" chip that falls back to the English
// PDF. Structure never changes; only values.
//
// NOTE: page count is intentionally NOT stored — each translation runs to a
// different length, so no shared surface should claim a fixed number of pages.
//
// Invariants:
//  • `code` is the value sent as body.language AND stored in the Appwrite
//    DOWNLOADS.language attr — keep it ≤5 chars (DOWNLOADS.language is string(5)).
//  • `locale` is the BCP-47 tag used for hreflang.
//  • English is the canonical fallback for every unresolved language.
// ─────────────────────────────────────────────────────────────────────────────

const BLOB = "https://krocsl5bx9ykit9h.public.blob.vercel-storage.com/guides";
const html = (code: string) => `/guides/dpdpa-guide-${code}.html`;

export interface GuideLanguage {
  /** body.language + DOWNLOADS.language (≤5 chars) */
  code: string;
  /** BCP-47 tag for hreflang */
  locale: string;
  /** Native-script name shown on the chip (e.g. "हिन्दी") */
  native: string;
  /** Roman name for analytics, aria-labels, fallbacks (e.g. "Hindi") */
  roman: string;
  /** PDF download URL (Vercel Blob). null → falls back to the English PDF */
  pdfUrl: string | null;
  /** Static HTML reading page. null → "Read online" hidden for this language */
  htmlUrl: string | null;
}

export const GUIDE_LANGUAGES: GuideLanguage[] = [
  { code: "en", locale: "en-IN", native: "English",  roman: "English",  pdfUrl: `${BLOB}/dpdpa-guide-en.pdf`, htmlUrl: html("en") },
  { code: "hi", locale: "hi-IN", native: "हिन्दी",    roman: "Hindi",    pdfUrl: `${BLOB}/dpdpa-guide-hi.pdf`, htmlUrl: html("hi") },
  { code: "gu", locale: "gu-IN", native: "ગુજરાતી",  roman: "Gujarati", pdfUrl: `${BLOB}/dpdpa-guide-gu.pdf`, htmlUrl: html("gu") },
  { code: "mr", locale: "mr-IN", native: "मराठी",    roman: "Marathi",  pdfUrl: `${BLOB}/dpdpa-guide-mr.pdf`, htmlUrl: html("mr") },
  { code: "kn", locale: "kn-IN", native: "ಕನ್ನಡ",     roman: "Kannada",  pdfUrl: `${BLOB}/dpdpa-guide-kn.pdf`, htmlUrl: html("kn") },
  { code: "ta", locale: "ta-IN", native: "தமிழ்",     roman: "Tamil",    pdfUrl: `${BLOB}/dpdpa-guide-ta.pdf`, htmlUrl: html("ta") },
  { code: "te", locale: "te-IN", native: "తెలుగు",    roman: "Telugu",   pdfUrl: `${BLOB}/dpdpa-guide-te.pdf`, htmlUrl: html("te") },
];

export const DEFAULT_LANG_CODE = "en";

export const LANG_CODES = GUIDE_LANGUAGES.map((l) => l.code);

/** Languages whose PDF is downloadable (the rest fall back to English). */
export const DOWNLOADABLE_LANGS = GUIDE_LANGUAGES.filter((l) => l.pdfUrl !== null);

/** Languages whose HTML reading page is published — drives sitemap + hreflang. */
export const READING_LANGS = GUIDE_LANGUAGES.filter((l) => l.htmlUrl !== null);

/** Resolve a code to its config, falling back to English for anything unknown. */
export function getLanguage(code?: string | null): GuideLanguage {
  return GUIDE_LANGUAGES.find((l) => l.code === code) ?? GUIDE_LANGUAGES[0];
}

/** Resolve a code to a usable PDF URL, falling back to the English file. */
export function getPdfUrl(code?: string | null): string {
  const lang = getLanguage(code);
  return lang.pdfUrl ?? GUIDE_LANGUAGES[0].pdfUrl!;
}

/** True when the language has at least one format live (else show "coming soon"). */
export function isLive(lang: GuideLanguage): boolean {
  return lang.pdfUrl !== null || lang.htmlUrl !== null;
}

/**
 * termLinks.ts — Single source of truth for cross-site keyword linking
 *
 * Each entry maps a DPDPA term to:
 *   term      — exact string to match (case-sensitive, as it appears in Act/Rules)
 *   href      — destination URL (undefined = highlight only, no link)
 *   className — Tailwind colour classes (blue / green / amber categories)
 *
 * ORDER MATTERS: longest terms must come first so the regex doesn't
 * match a short substring before a longer enclosing term.
 */

export interface TermLink {
  term: string;
  href?: string;
  className: string;
}

// ─── Shared colour class strings ─────────────────────────────────────────────

const BLUE  = "bg-blue-50 text-blue-700 border border-blue-200 rounded px-0.5";
const GREEN = "bg-green-50 text-green-700 border border-green-200 rounded px-0.5";
const AMBER = "bg-amber-50 text-amber-700 border border-amber-200 rounded px-0.5";

// ─── Term map — longest first ─────────────────────────────────────────────────

export const TERM_LINKS: TermLink[] = [

  // ── 30+ chars ──────────────────────────────────────────────────────────────
  {
    term: "Data Protection Impact Assessment",
    href: "/glossary#dpia",
    className: GREEN,
  },
  {
    term: "Data Protection Board of India",
    href: "/glossary#dpb",
    className: BLUE,
  },

  // ── 20–29 chars ───────────────────────────────────────────────────────────
  {
    term: "Significant Data Fiduciary",
    href: "/glossary#significant-data-fiduciary",
    className: BLUE,
  },
  {
    term: "Data Processing Agreement",
    href: "/glossary#data-processing-agreement",
    className: GREEN,
  },
  {
    term: "Personal Data Breach",
    href: "/learn/data-breach",
    className: AMBER,
  },
  {
    term: "Data Protection Board",
    href: "/glossary#dpb",
    className: BLUE,
  },

  // ── 16–19 chars ───────────────────────────────────────────────────────────
  {
    term: "Security Safeguards",
    href: "/glossary#security-safeguards",
    className: GREEN,
  },
  {
    term: "Breach Notification",
    href: "/glossary#breach-notification",
    className: AMBER,
  },
  {
    term: "Appellate Tribunal",
    href: "/glossary#appellate-tribunal",
    className: BLUE,
  },
  {
    term: "Central Government",
    href: undefined, // highlight only — no single useful destination
    className: BLUE,
  },
  {
    term: "Verifiable Consent",
    href: "/learn/consent",
    className: GREEN,
  },
  {
    term: "Purpose Limitation",
    href: "/glossary#purpose-limitation",
    className: GREEN,
  },
  {
    term: "Financial Penalty",
    href: "/penalty-calculator",
    className: AMBER,
  },
  {
    term: "Data Minimisation",
    href: "/glossary#data-minimisation",
    className: GREEN,
  },

  // ── 13–15 chars ───────────────────────────────────────────────────────────
  {
    term: "Consent Manager",
    href: "/glossary#consent-manager",
    className: BLUE,
  },
  {
    term: "Legitimate Uses",
    href: "/learn/consent",
    className: GREEN,
  },
  {
    term: "Deemed Consent",
    href: "/glossary#deemed-consent",
    className: GREEN,
  },
  {
    term: "Data Fiduciary",
    href: "/glossary#data-fiduciary",
    className: BLUE,
  },
  {
    term: "Data Principal",
    href: "/glossary#data-principal",
    className: BLUE,
  },
  {
    term: "Data Processor",
    href: "/glossary#data-processor",
    className: BLUE,
  },
  {
    term: "Personal Data",
    href: "/glossary#personal-data",
    className: GREEN,
  },

  // ── 9–12 chars ────────────────────────────────────────────────────────────
  {
    term: "Data Breach",
    href: "/learn/data-breach",
    className: AMBER,
  },
  {
    term: "Data Audit",
    href: "/glossary#data-audit",
    className: GREEN,
  },
  {
    term: "Complaint",
    href: "/glossary#right-grievance",
    className: AMBER,
  },

  // ── 6–8 chars ─────────────────────────────────────────────────────────────
  // NOTE: short terms match aggressively — keep this list tight.
  {
    term: "Consent",
    href: "/learn/consent",
    className: GREEN,
  },
  {
    term: "Penalty",
    href: "/penalty-calculator",
    className: AMBER,
  },
  {
    term: "Inquiry",
    href: "/glossary#inquiry",
    className: AMBER,
  },
  {
    term: "Notice",
    href: "/learn/notice",
    className: GREEN,
  },
  {
    term: "Breach",
    href: "/learn/data-breach",
    className: AMBER,
  },

];

/**
 * Pre-compiled regex — built once at module load.
 * All terms are escaped and joined longest-first so alternation
 * matches the longest possible term before a shorter prefix.
 */
export const TERM_REGEX = new RegExp(
  `(${TERM_LINKS
    .map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g"
);

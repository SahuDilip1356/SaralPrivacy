import type { PromptDef } from './types'

/**
 * LOCKED PROMPTS — do NOT change once measurement begins.
 * Trendlines are only valid if these stay constant across runs.
 *
 * Each prompt ends with "Cite sources." to force every engine into citation mode.
 */
export const PROMPTS: readonly PromptDef[] = [
  {
    id: 'Q1',
    topic: 'Recruitment',
    text: 'I run a recruitment agency in India. What does DPDPA require me to do about candidate CVs and consent? Cite sources.',
    targetPage: '/industries/recruitment-agencies',
    rationale: 'Industry-specific intent — tests vertical authority',
  },
  {
    id: 'Q2',
    topic: 'Penalty',
    text: "What's the maximum DPDPA penalty for a small business that fails to notify a data breach in India? Cite sources.",
    targetPage: '/penalty-calculator',
    rationale: 'Fact-lookup intent — tests citation of statutory specifics',
  },
  {
    id: 'Q3',
    topic: 'Consent',
    text: "Under India's DPDPA, do I need consent before sharing a candidate's CV with a client company? Cite sources.",
    targetPage: '/learn/consent',
    rationale: 'Decision intent — tests practical guidance citation',
  },
  {
    id: 'Q4',
    topic: 'DPDP Rules 2025',
    text: "Plain-English summary of India's DPDP Rules 2025 — what changed and when does it apply? Cite sources.",
    targetPage: '/learn/dpdp-rules-2025-plain-english-guide',
    rationale: 'Summary intent — tests definitive-source positioning',
  },
  {
    id: 'Q5',
    topic: 'Significant Data Fiduciary',
    text: "What classifies a company as a Significant Data Fiduciary under India's DPDPA, and what extra obligations does it trigger? Cite sources.",
    targetPage: '/glossary',
    rationale: 'Definition intent — tests glossary authority',
  },
] as const

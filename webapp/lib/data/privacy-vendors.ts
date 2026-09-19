// Single source of truth for the Data Fiduciary / DPO identity and the sub-processor
// list published in the Privacy Notice. VENDORS renders on app/privacy; DPO is also
// read by app/rights, app/consent-preferences, and Footer.
//
// ─────────────────────────────────────────────────────────────────────────────
//  RULE: a row belongs here ONLY if the vendor actually receives a data
//  principal's PERSONAL DATA. "We have the dep installed" is not the test —
//  "does our users' personal data reach them" is. If a PR adds such a processor,
//  it adds the row in the SAME PR; if one stops being used, the row goes. An
//  inaccurate sub-processor list is the exact failure our own assessments penalise,
//  and over-disclosure (listing vendors that DON'T get personal data) is just as
//  inaccurate as under-disclosure.
//
//  Anthropic has TWO uses, and only one makes it a processor:
//   • Setu (app/api/chat) — a PROCESSOR. The visitor's raw question (≤2000 chars,
//     NOT redacted — lib/chat/redact.ts only guards stored logs) plus recent turns
//     go to Anthropic to write the answer, and the question alone goes to Pinecone
//     for retrieval (lib/chat/pinecone.ts). Both have rows below. This was missed
//     from 2026-08-03 (Setu launch) to 2026-09-19: re-audit this list whenever a
//     feature sends user-typed text to any third party.
//   • Drafting briefings/blog (app/api/briefings/generate, blog/validate,
//     blog/revise) — editorial text only, no subscriber/lead/assessment data. Not a
//     second row; the notice's AI note explains the difference.
//
//  Deliberately NOT listed, and why:
//   • Vercel Blob — hosts our own static templates and guides, uploaded offline by
//                  scripts/upload-templates.mjs. Runtime code only list()s them
//                  (app/api/templates/download); nothing a visitor enters is written
//                  there. The download request itself is Vercel traffic, covered by
//                  the Vercel Inc. row. Add a row back if a runtime put() of user
//                  content ever ships.
//   • Svix       — NOT a processor. `svix` is used once, in app/api/webhooks/resend
//                  to VERIFY the signature of incoming Resend webhooks. We send it
//                  nothing; it is Resend's sub-processor, not ours.
//   • Twilio     — dep installed but unused (no live WhatsApp send). Add the row in
//                  the PR that ships WhatsApp delivery.
//   • KIE / Nano-Banana — offline infographic build script (tools/), no personal data.
// ─────────────────────────────────────────────────────────────────────────────

export const DPO = {
  name: 'Dilip Sahu',
  email: 'dpo@saralprivacy.com',
  org: 'Saral Privacy',
  site: 'saralprivacy.com',
} as const

/**
 * DPA status.
 *  'available' — vendor publishes a standard DPA, not yet confirmed executed by us.
 *  'executed'  — we have signed/accepted it. Only use once actually true.
 *
 * Appwrite's is self-serve: Console → Organization Settings → Download DPA.
 * Flip rows to 'executed' as each is confirmed — do not pre-tick.
 */
export type DpaStatus = 'available' | 'executed'

export interface Vendor {
  name: string
  purpose: string
  /** What personal data this processor actually receives. Be specific, not euphemistic. */
  dataReceived: string
  location: string
  dpa: DpaStatus
}

export const VENDORS: Vendor[] = [
  {
    name: 'Supabase',
    purpose:
      'Our database and file storage — where your records live (we are migrating here from Appwrite)',
    dataReceived:
      'Name, email, phone, company, and your assessment and discovery answers',
    location: 'India (Mumbai)',
    dpa: 'available',
  },
  {
    // Being retired: modules move to Supabase one by one; this row leaves the
    // list when the Appwrite project is deleted at the end of the migration.
    name: 'Appwrite',
    purpose: 'Our previous database and file storage, during the migration window',
    dataReceived:
      'Name, email, phone, company, and your assessment and discovery answers',
    location: 'Singapore',
    dpa: 'available',
  },
  {
    name: 'Vercel Inc.',
    purpose: 'Website hosting and the serverless functions behind our tools',
    dataReceived: 'IP address, access logs, and form submissions in transit',
    location: 'United States',
    dpa: 'available',
  },
  {
    name: 'Resend Inc.',
    purpose: 'Sending our briefings and transactional email',
    dataReceived: 'Name, email address, and delivery events (sent, opened, bounced)',
    location: 'United States',
    dpa: 'available',
  },
  {
    name: 'Vercel Web Analytics',
    purpose: 'Website analytics — understanding which pages are useful',
    dataReceived:
      'Page views, aggregated. No cookies. Visitors are counted with a hash that resets every day, so you cannot be tracked between days or across sites',
    location: 'United States',
    dpa: 'available',
  },
  {
    // app/api/chat/route.ts — streamText via @ai-sdk/anthropic (direct, not a gateway).
    name: 'Anthropic',
    purpose: 'Writes the answers from Setu, the question-and-answer assistant on our site',
    dataReceived:
      'The question you type to Setu, the recent turns of that conversation, the page you are on, and anything you picked in the chat, such as your industry',
    location: 'United States',
    dpa: 'available',
  },
  {
    // lib/chat/pinecone.ts — integrated index, embeds the query server-side.
    // Region verified via describe-index 2026-09-19: aws us-east-1.
    name: 'Pinecone',
    purpose: 'Finds the pages on our site that match your Setu question',
    dataReceived: 'The question you type to Setu, on its own',
    location: 'United States',
    dpa: 'available',
  },
]

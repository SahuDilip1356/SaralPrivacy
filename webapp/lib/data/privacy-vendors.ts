// Single source of truth for the Data Fiduciary / DPO identity and the sub-processor
// list published in the Privacy Notice. Read by app/privacy, app/rights, and Footer.
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
//  Deliberately NOT listed, and why:
//   • Anthropic  — used to DRAFT briefings/blog content (app/api/briefings/generate,
//                  blog/validate, blog/revise). Only our own editorial text is sent;
//                  no subscriber/lead/assessment data. Covered by a plain-language
//                  AI note in the notice instead of a sub-processor row.
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
    name: 'Appwrite',
    purpose: 'Our database and file storage — where your records actually live',
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
    name: 'Vercel Blob',
    purpose: 'Storage for generated PDFs — reports, guides, and checklists',
    dataReceived: 'Report files, which may contain the details you entered',
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
]

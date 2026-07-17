// Single source of truth for the Data Fiduciary / DPO identity and the sub-processor
// list published in the Privacy Notice. Read by app/privacy, app/rights, and Footer.
//
// ─────────────────────────────────────────────────────────────────────────────
//  RULE: every row here must trace to real code. If a PR adds a processor that
//  touches personal data, it adds the row in the SAME PR. If a processor stops
//  being used, the row goes. An inaccurate sub-processor list is the exact
//  failure our own assessments penalise.
//
//  Deliberately NOT listed:
//   • Twilio      — dep installed but unused (no live WhatsApp send). If/when
//                   WhatsApp delivery ships, add the row in that PR.
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
    name: 'Svix',
    purpose: 'Webhook delivery infrastructure used by our email provider',
    dataReceived: 'Email delivery event metadata',
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
    name: 'Anthropic PBC',
    purpose: 'AI drafting of our briefings and blog content',
    dataReceived:
      'Our own editorial content only — we do not send your personal data to it',
    location: 'United States',
    dpa: 'available',
  },
]

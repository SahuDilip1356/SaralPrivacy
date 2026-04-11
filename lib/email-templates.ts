// email-templates.ts — HTML email templates for SaralPrivacy
// Uses inline CSS for maximum email client compatibility (Gmail, Outlook, etc.)
// Brand colors: #1E3A5F (navy), #E07B39 (saffron/orange)

const NAV = '#1E3A5F';
const SAFFRON = '#E07B39';
const LIGHT_BG = '#F7F8FA';
const TEXT = '#2D3748';
const MUTED = '#718096';
const BORDER = '#E2E8F0';

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SaralPrivacy</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${NAV};border-radius:12px 12px 0 0;padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="color:#FFFFFF;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Saral<span style="color:${SAFFRON};">Privacy</span></span>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">DPDPA Compliance Platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#FFFFFF;padding:32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${LIGHT_BG};border:1px solid ${BORDER};border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${MUTED};">
                SaralPrivacy · DPDPA Compliance Made Simple<br/>
                <a href="https://saralprivacy.com" style="color:${NAV};text-decoration:none;">saralprivacy.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function badge(label: string, color: string = NAV): string {
  return `<span style="display:inline-block;padding:3px 10px;background-color:${color};color:#fff;font-size:11px;font-weight:600;border-radius:20px;letter-spacing:0.5px;">${label}</span>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BORDER};margin:20px 0;" />`;
}

function labelRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:6px 0;font-size:13px;color:${MUTED};width:140px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:${TEXT};font-weight:500;vertical-align:top;">${value || '—'}</td>
  </tr>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Consultation Alert (Admin)
// ──────────────────────────────────────────────────────────────────────────────

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  industry?: string;
  company_size?: string;
  issue_summary?: string;
  preferred_contact?: string;
  preferred_time?: string;
}

export function consultationAlertTemplate(lead: LeadData): { subject: string; html: string } {
  const subject = `New Consultation Request — ${lead.name} from ${lead.company}`;

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">ADMIN ALERT</p>
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${NAV};">New Consultation Request</h2>

    ${badge('Consultation Lead', SAFFRON)}
    ${divider()}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${labelRow('Name', lead.name)}
      ${labelRow('Email', lead.email)}
      ${labelRow('Phone', lead.phone || '—')}
      ${labelRow('Company', lead.company)}
      ${labelRow('Industry', lead.industry || '—')}
      ${labelRow('Company Size', lead.company_size || '—')}
      ${labelRow('Preferred Contact', lead.preferred_contact || '—')}
      ${labelRow('Preferred Time', lead.preferred_time || '—')}
    </table>

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${NAV};">Issue Summary</p>
    <div style="background-color:${LIGHT_BG};border-left:3px solid ${SAFFRON};padding:14px 16px;border-radius:0 8px 8px 0;font-size:13px;color:${TEXT};line-height:1.6;">
      ${lead.issue_summary || 'Not provided'}
    </div>

    <p style="margin:20px 0 0;font-size:12px;color:${MUTED};">Reply directly to this lead within 1 business day.</p>
  `);

  return { subject, html };
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Download Alert (Admin)
// ──────────────────────────────────────────────────────────────────────────────

export interface DownloadData {
  name: string;
  email: string;
  company: string;
  industry?: string;
  company_size?: string;
  consent_email?: boolean;
}

export function downloadAlertTemplate(download: DownloadData): { subject: string; html: string } {
  const subject = `White Paper Downloaded — ${download.name} from ${download.company}`;

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">ADMIN ALERT</p>
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${NAV};">White Paper Downloaded</h2>

    ${badge('Download Lead', '#2D9B6F')}
    ${divider()}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${labelRow('Name', download.name)}
      ${labelRow('Email', download.email)}
      ${labelRow('Company', download.company)}
      ${labelRow('Industry', download.industry || '—')}
      ${labelRow('Company Size', download.company_size || '—')}
      ${labelRow('Email Consent', download.consent_email ? 'Yes — follow up permitted' : 'No')}
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:${MUTED};">
      ${download.consent_email ? 'This lead has consented to follow-up emails. Consider reaching out.' : 'This lead has not consented to follow-up emails.'}
    </p>
  `);

  return { subject, html };
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Assessment Alert (Admin)
// ──────────────────────────────────────────────────────────────────────────────

export interface AssessmentData {
  email: string;
  industry: string;
  risk_level: string;
  applicability_score?: number;
  maturity_score?: number;
  risk_score?: number;
  urgency_score?: number;
  overall_score?: number;
}

export function assessmentAlertTemplate(assessment: AssessmentData): { subject: string; html: string } {
  const subject = `Assessment Completed — ${assessment.industry} | Risk: ${assessment.risk_level}`;

  const riskColor = assessment.risk_level === 'HIGH' ? '#E53E3E' : assessment.risk_level === 'MEDIUM' ? SAFFRON : '#2D9B6F';

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">ADMIN ALERT</p>
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${NAV};">Assessment Completed</h2>

    ${badge(`Risk: ${assessment.risk_level}`, riskColor)}
    ${divider()}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${labelRow('Email', assessment.email)}
      ${labelRow('Industry', assessment.industry)}
      ${labelRow('Risk Level', assessment.risk_level)}
      ${labelRow('Applicability', `${assessment.applicability_score ?? '—'}`)}
      ${labelRow('Maturity Score', `${assessment.maturity_score ?? '—'}`)}
      ${labelRow('Risk Score', `${assessment.risk_score ?? '—'}`)}
      ${labelRow('Urgency Score', `${assessment.urgency_score ?? '—'}`)}
      ${labelRow('Overall Score', `${assessment.overall_score ?? '—'}`)}
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:${MUTED};">Consider reaching out with tailored compliance guidance for this industry.</p>
  `);

  return { subject, html };
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Welcome Email (Subscriber)
// ──────────────────────────────────────────────────────────────────────────────

export function welcomeEmailTemplate(name: string): { subject: string; html: string } {
  const subject = `Welcome to SaralPrivacy Daily Briefings`;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${NAV};">Welcome, ${name}!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:${MUTED};line-height:1.6;">
      You're now subscribed to the SaralPrivacy Daily Brief — India's most trusted source for DPDPA compliance news.
    </p>

    ${divider()}

    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${NAV};">What you'll receive:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:8px 0;font-size:13px;color:${TEXT};">📋 &nbsp;<strong>Daily DPDPA briefings</strong> — regulatory updates distilled to essentials</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:${TEXT};">⚡ &nbsp;<strong>Actionable checklists</strong> — know exactly what to do and when</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:${TEXT};">🔔 &nbsp;<strong>Priority alerts</strong> — never miss a deadline or enforcement update</td>
      </tr>
    </table>

    ${divider()}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:${SAFFRON};border-radius:8px;padding:12px 24px;">
          <a href="https://saralprivacy.com" style="color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;">Explore SaralPrivacy →</a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:12px;color:${MUTED};line-height:1.6;">
      You can unsubscribe at any time by clicking the unsubscribe link in any briefing email.
      We respect your privacy and will never share your data.
    </p>
  `);

  return { subject, html };
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Briefing Approval Email (Admin)
// ──────────────────────────────────────────────────────────────────────────────

export interface BriefingData {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  why_it_matters?: string;
  action_checklist?: string;
  status: string;
  scheduled_for?: string;
  created_at?: string;
}

export function briefingApprovalTemplate(briefing: BriefingData, approveLink: string): { subject: string; html: string } {
  const subject = `New Briefing LIVE: ${briefing.title} — Send to Subscribers`;

  let checklist = '';
  try {
    const items: string[] = JSON.parse(briefing.action_checklist || '[]');
    checklist = items.map(item => `<li style="padding:4px 0;font-size:13px;color:${TEXT};">${item}</li>`).join('');
  } catch {
    checklist = '';
  }

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:13px;color:#2D9B6F;font-weight:600;">✓ BRIEFING IS LIVE ON SARALPRIVACY.COM</p>
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${NAV};">${briefing.title}</h2>

    ${briefing.summary ? `
    <div style="background-color:${LIGHT_BG};border-left:3px solid ${SAFFRON};padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.6;">${briefing.summary}</p>
    </div>` : ''}

    ${briefing.why_it_matters ? `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${NAV};">Why It Matters</p>
    <p style="margin:0 0 20px;font-size:13px;color:${TEXT};line-height:1.6;">${briefing.why_it_matters}</p>` : ''}

    ${checklist ? `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${NAV};">Action Checklist</p>
    <ul style="margin:0 0 20px;padding-left:20px;">${checklist}</ul>` : ''}

    ${divider()}

    <p style="margin:0 0 16px;font-size:13px;color:${MUTED};">
      Scheduled for: <strong style="color:${TEXT};">${briefing.scheduled_for || 'Immediately'}</strong>
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#2D9B6F;border-radius:8px;padding:14px 28px;">
          <a href="${approveLink}" style="color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;">Send to Subscribers →</a>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 0;font-size:12px;color:${MUTED};">
      This briefing is already live on saralprivacy.com. Click the button above when you are ready
      to email it to all active subscribers. This action cannot be undone.
    </p>
  `);

  return { subject, html };
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. Survey Result Email (Score-based follow-up to survey respondent)
// ──────────────────────────────────────────────────────────────────────────────

export interface SurveyResultData {
  email: string;
  name: string;
  businessName: string;
  score: number;
  band: string;
  summary: string;
  recommendations: string[];
  riskFlags: string[];
}

// Score-band follow-up content
const BAND_RESOURCES: Record<string, { label: string; headline: string; body: string; resource: string; resourceLabel: string }> = {
  "Just Starting": {
    label: "Early Stage",
    headline: "Your free 'What is DPDPA?' guide is here",
    body: "You are at the beginning of your DPDPA journey. That is totally okay — most small businesses are. This one-page guide explains DPDPA in plain language. No legal words. Just what you need to know to start.",
    resource: "https://saralprivacy.com/learn/what-is-dpdpa",
    resourceLabel: "Read: What is DPDPA? (Plain English)",
  },
  "Exposed but Aware": {
    label: "Partly Ready",
    headline: "Your free 'Top 5 Gaps MSMEs Miss' checklist",
    body: "You are aware of DPDPA but there are some important gaps. This checklist shows the 5 most common mistakes small businesses make — and simple ways to fix them this week.",
    resource: "https://saralprivacy.com/resources",
    resourceLabel: "Download: Top 5 Gaps Checklist",
  },
  "Building Controls": {
    label: "Partly Ready",
    headline: "Your free 'Top 5 Gaps MSMEs Miss' checklist",
    body: "You have made good progress. This checklist will help you find the remaining gaps and close them quickly. Focus on consistency and making sure all your vendors follow the same rules.",
    resource: "https://saralprivacy.com/resources",
    resourceLabel: "Download: Top 5 Gaps Checklist",
  },
  "Moving Well": {
    label: "Moving Well",
    headline: "Your free Vendor Data Processing Agreement template",
    body: "You are ahead of most small businesses. The next level is tightening your vendor agreements. This template gives you the exact clauses to add to your contracts so your vendors handle data the right way.",
    resource: "https://saralprivacy.com/resources",
    resourceLabel: "Download: Vendor DPA Template",
  },
};

export function surveyResultEmailTemplate(data: SurveyResultData): { subject: string; html: string } {
  const resource = BAND_RESOURCES[data.band] || BAND_RESOURCES["Just Starting"];
  const subject  = `Your DPDPA Readiness Score: ${data.score}/7 — ${resource.label}`;

  const recsHtml = data.recommendations
    .map((rec, i) => `
      <tr>
        <td style="padding:8px 0;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:26px;vertical-align:top;padding-top:2px;">
              <div style="width:22px;height:22px;background-color:${SAFFRON};border-radius:50%;text-align:center;line-height:22px;">
                <span style="color:#fff;font-size:11px;font-weight:700;">${i + 1}</span>
              </div>
            </td>
            <td style="padding-left:10px;font-size:13px;color:${TEXT};line-height:1.6;">${rec}</td>
          </tr></table>
        </td>
      </tr>`)
    .join("");

  const riskHtml = data.riskFlags.length > 0
    ? `<div style="background:#FEF2F2;border-left:3px solid #EF4444;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#991B1B;">⚠ Higher-risk areas to address</p>
        <ul style="margin:0;padding-left:18px;">
          ${data.riskFlags.map(f => `<li style="font-size:12px;color:#B91C1C;padding:2px 0;">${f}</li>`).join("")}
        </ul>
      </div>`
    : "";

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.5px;">Your DPDPA Readiness Score</p>
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${NAV};">Hi ${data.name || "there"} 👋</h2>

    <!-- Score -->
    <div style="background-color:${LIGHT_BG};border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:56px;font-weight:800;color:${SAFFRON};line-height:1;">${data.score}</div>
      <div style="font-size:16px;color:#666;margin-top:2px;">out of 7</div>
      <div style="display:inline-block;background-color:${SAFFRON};color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;">${data.band}</div>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:${TEXT};line-height:1.7;">${data.summary}</p>

    ${riskHtml}

    ${divider()}

    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:${NAV};">3 things to do this week</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${recsHtml}
    </table>

    ${divider()}

    <!-- Resource CTA -->
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${NAV};">${resource.headline}</p>
    <p style="margin:0 0 16px;font-size:13px;color:${TEXT};line-height:1.6;">${resource.body}</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:${SAFFRON};border-radius:8px;padding:12px 24px;">
          <a href="${resource.resource}" style="color:#FFFFFF;font-size:13px;font-weight:700;text-decoration:none;">${resource.resourceLabel} →</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:${NAV};border-radius:8px;padding:12px 24px;">
          <a href="https://saralprivacy.com/contact" style="color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;">Book a free consultation →</a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:11px;color:${MUTED};line-height:1.6;">
      You received this because you requested your DPDPA Readiness Score on SaralPrivacy.
      <a href="https://saralprivacy.com/consent-preferences" style="color:${MUTED};">Manage preferences</a>.
    </p>
  `);

  return { subject, html };
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. Briefing Email (Subscriber)
// ──────────────────────────────────────────────────────────────────────────────

export function briefingEmailTemplate(briefing: BriefingData, unsubscribeUrl: string): { subject: string; html: string } {
  const subject = `DPDPA Daily Brief: ${briefing.title}`;

  const dateStr = briefing.scheduled_for
    ? new Date(briefing.scheduled_for).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let checklistHtml = '';
  try {
    const items: string[] = JSON.parse(briefing.action_checklist || '[]');
    checklistHtml = items.map(item => `
      <tr>
        <td style="padding:8px 0;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:22px;vertical-align:top;padding-top:2px;">
                <div style="width:18px;height:18px;background-color:${SAFFRON};border-radius:50%;text-align:center;line-height:18px;">
                  <span style="color:#fff;font-size:11px;font-weight:700;">✓</span>
                </div>
              </td>
              <td style="padding-left:8px;font-size:13px;color:${TEXT};line-height:1.5;">${item}</td>
            </tr>
          </table>
        </td>
      </tr>`).join('');
  } catch {
    checklistHtml = '';
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DPDPA Daily Brief: ${briefing.title}</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${NAV};border-radius:12px 12px 0 0;padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="color:#FFFFFF;font-size:20px;font-weight:700;">Saral<span style="color:${SAFFRON};">Privacy</span></span>
                    <p style="margin:2px 0 12px;color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px;">DPDPA Daily Brief</p>
                    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;">${dateStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="background-color:#FFFFFF;padding:32px 32px 0;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${NAV};line-height:1.3;">${briefing.title}</h1>
              ${briefing.summary ? `<p style="margin:0 0 0;font-size:15px;color:${MUTED};line-height:1.7;border-left:3px solid ${SAFFRON};padding-left:16px;">${briefing.summary}</p>` : ''}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:#FFFFFF;padding:0 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />
            </td>
          </tr>

          ${briefing.why_it_matters ? `
          <!-- Why It Matters -->
          <tr>
            <td style="background-color:#FFFFFF;padding:0 32px 24px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${SAFFRON};text-transform:uppercase;letter-spacing:1px;">Why It Matters</p>
              <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.7;">${briefing.why_it_matters}</p>
            </td>
          </tr>` : ''}

          ${briefing.content ? `
          <!-- Full Content -->
          <tr>
            <td style="background-color:#FFFFFF;padding:0 32px 24px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <div style="font-size:14px;color:${TEXT};line-height:1.7;">${briefing.content}</div>
            </td>
          </tr>` : ''}

          ${checklistHtml ? `
          <!-- Action Checklist -->
          <tr>
            <td style="background-color:#F0F7FF;padding:24px 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:${NAV};text-transform:uppercase;letter-spacing:1px;">Your Action Checklist</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${checklistHtml}
              </table>
            </td>
          </tr>` : ''}

          <!-- CTA -->
          <tr>
            <td style="background-color:#FFFFFF;padding:24px 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${NAV};border-radius:8px;padding:12px 24px;">
                    <a href="https://saralprivacy.com" style="color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;">Get Expert Guidance →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${LIGHT_BG};border:1px solid ${BORDER};border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${MUTED};">
                You're receiving this because you subscribed to DPDPA Daily Briefings.
              </p>
              <p style="margin:0;font-size:12px;color:${MUTED};">
                <a href="https://saralprivacy.com" style="color:${NAV};text-decoration:none;">saralprivacy.com</a>
                &nbsp;·&nbsp;
                <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  return { subject, html };
}


// ──────────────────────────────────────────────────────────────────────────────
// 9. bloggerInviteTemplate — invite a contributor to set up their account
// ──────────────────────────────────────────────────────────────────────────────
export interface BloggerInviteData {
  name: string;
  email: string;
  inviteUrl: string;
}

export function bloggerInviteTemplate(data: BloggerInviteData): { subject: string; html: string } {
  const subject = `You've been invited to contribute to SaralPrivacy Insights`;
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1E3A5F;">Welcome, ${data.name}!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#718096;">You have been invited to contribute expert insights to <strong>SaralPrivacy</strong> — India's DPDPA compliance platform.</p>

    <p style="margin:0 0 16px;font-size:14px;color:#2D3748;">As a <strong>Blog Contributor</strong>, you can:</p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#2D3748;line-height:1.8;">
      <li>Write and draft DPDPA compliance insights</li>
      <li>Run AI-powered DPDPA guardrail validation on your content</li>
      <li>Generate smart infographics from your articles</li>
      <li>Submit posts for admin review and publication</li>
    </ul>

    <p style="margin:0 0 20px;font-size:14px;color:#718096;">Click the button below to set up your password and get started. This invite link is valid for <strong>72 hours</strong>.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:8px;background-color:#1E3A5F;">
          <a href="${data.inviteUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Set Up My Account</a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#718096;">If the button does not work, copy this link into your browser:<br/>
    <a href="${data.inviteUrl}" style="color:#1E3A5F;word-break:break-all;">${data.inviteUrl}</a></p>
  `);
  return { subject, html };
}

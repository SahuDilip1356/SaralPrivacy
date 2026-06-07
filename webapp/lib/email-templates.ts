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
// 6. Assessment Result Email (sent to user after gate form submission)
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
  answerSummary: Array<{ question: string; answer: string }>;
  reportToken?: string;
  /** Optional industry lead-magnet (e.g. CA Firm DPDPA Starter Checklist) */
  checklistUrl?: string;
  checklistTitle?: string;
  categoryScores?: {
    noticeConsent: number;
    accessControl: number;
    retentionDeletion: number;
    ownershipGovernance: number;
    vendorPartnerRisk: number;
    incidentReadiness: number;
  };
}

// Band colours for email (hex, email-safe)
const BAND_COLOR: Record<string, string> = {
  "Not Started":           "#DC2626",
  "Early Stage":           "#F97316",
  "Building Foundations":  "#EAB308",
  "Progressing Well":      "#22C55E",
  "Operationally Strong":  "#16A34A",
};

// Band-specific next-step resource
const BAND_CTA: Record<string, { headline: string; body: string; href: string; label: string }> = {
  "Not Started": {
    headline: "Start here — What is DPDPA? (Plain English guide)",
    body: "You are at the beginning of your DPDPA journey. This guide explains what the law requires in plain language — no legal jargon, just the essentials for your business.",
    href: "https://saralprivacy.com/learn/what-is-dpdpa",
    label: "Read the Plain English Guide →",
  },
  "Early Stage": {
    headline: "Download your free DPDPA Readiness Checklist",
    body: "You have some awareness but important gaps remain. This checklist shows the 5 most common mistakes Indian businesses make and simple ways to fix them this week.",
    href: "https://saralprivacy.com/white-paper",
    label: "Download White Paper →",
  },
  "Building Foundations": {
    headline: "Download your free DPDPA Readiness Checklist",
    body: "Good progress. Use this checklist to find remaining gaps and close them systematically. Focus on consistency across all your data channels and vendor agreements.",
    href: "https://saralprivacy.com/white-paper",
    label: "Download White Paper →",
  },
  "Progressing Well": {
    headline: "Tighten your vendor agreements with our DPA template",
    body: "You are ahead of most businesses. The next step is securing your vendor chain. This template gives you the exact data processing clauses to add to your contracts.",
    href: "https://saralprivacy.com/white-paper",
    label: "Download White Paper →",
  },
  "Operationally Strong": {
    headline: "Book a review session to certify your controls",
    body: "Strong readiness signals across all areas. A structured review with our experts will confirm your controls are audit-ready and identify any remaining edge-case gaps.",
    href: "https://saralprivacy.com/contact",
    label: "Book Expert Review →",
  },
};

export function surveyResultEmailTemplate(data: SurveyResultData): { subject: string; html: string } {
  const bandColor = BAND_COLOR[data.band] ?? SAFFRON;
  const cta       = BAND_CTA[data.band] ?? BAND_CTA["Early Stage"];

  // Subject line varies by band
  const isLow  = ["Not Started", "Early Stage"].includes(data.band);
  const isHigh = data.band === "Operationally Strong";
  const subject = isLow
    ? `Your DPDPA Score: ${data.score}/100 — Here's exactly why and what to do first`
    : isHigh
    ? `Your DPDPA Score: ${data.score}/100 — Strong start. Here's what to protect`
    : `Your DPDPA Score: ${data.score}/100 — You're building. Here's the path to 70+`;

  const barWidth = Math.max(4, Math.round(data.score * 5.36));

  // ── 5 scoring blocks (display layer mapping, engine untouched) ──────────────
  const cats = data.categoryScores;
  const dataInventoryScore = cats
    ? Math.round((cats.retentionDeletion + cats.vendorPartnerRisk) / 2)
    : 0;

  function scoreStatus(s: number): { label: string; color: string } {
    if (s >= 70) return { label: "Strong",      color: "#16A34A" };
    if (s >= 40) return { label: "Developing",  color: SAFFRON   };
    return              { label: "Needs Work",  color: "#DC2626" };
  }

  function scorecardRow(label: string, score: number): string {
    const pct    = Math.min(100, Math.max(0, score));
    const filled = Math.round(pct * 2.36); // max fill ~236px in a 600px email
    const st     = scoreStatus(pct);
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:12px;font-weight:600;color:${TEXT};width:190px;vertical-align:middle;">${label}</td>
              <td style="vertical-align:middle;padding:0 10px;">
                <div style="background:#E2E8F0;border-radius:4px;height:6px;overflow:hidden;">
                  <div style="height:6px;width:${filled}px;background-color:${st.color};border-radius:4px;"></div>
                </div>
              </td>
              <td style="text-align:right;vertical-align:middle;white-space:nowrap;">
                <span style="font-size:12px;font-weight:700;color:${TEXT};">${score}/100</span>
                <span style="display:inline-block;margin-left:6px;padding:2px 8px;background-color:${st.color}1A;color:${st.color};font-size:10px;font-weight:700;border-radius:10px;">${st.label}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  const scorecardsHtml = cats ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      ${scorecardRow("Notice &amp; Consent",               cats.noticeConsent)}
      ${scorecardRow("Data Inventory &amp; Storage",       dataInventoryScore)}
      ${scorecardRow("Data Principal Rights &amp; Control",cats.accessControl)}
      ${scorecardRow("Ownership &amp; Governance",         cats.ownershipGovernance)}
      ${scorecardRow("Incident &amp; Operational Readiness",cats.incidentReadiness)}
    </table>
    <p style="margin:0 0 0;font-size:11px;color:${MUTED};">These 5 areas explain why your overall score is ${data.score}/100.</p>
  ` : "";

  // ── Red flags ───────────────────────────────────────────────────────────────
  const riskHtml = data.riskFlags.length > 0 ? `
    <div style="background:#FEF2F2;border-left:3px solid #DC2626;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:0.5px;">⚠ Risk Flags Detected</p>
      <ul style="margin:0;padding-left:18px;">
        ${data.riskFlags.map(f => `<li style="font-size:12px;color:#B91C1C;padding:3px 0;line-height:1.5;">${f}</li>`).join("")}
      </ul>
    </div>` : "";

  // ── Top 3 answers ───────────────────────────────────────────────────────────
  const top3Answers = data.answerSummary.slice(0, 3);
  const answersHtml = top3Answers.length > 0 ? `
    ${top3Answers.map(row => `
      <div style="border:1px solid ${BORDER};border-radius:8px;padding:12px 14px;margin-bottom:8px;">
        <p style="margin:0 0 4px;font-size:11px;color:${MUTED};font-weight:600;text-transform:uppercase;letter-spacing:0.4px;">Your response</p>
        <p style="margin:0 0 6px;font-size:12px;color:${TEXT};font-weight:600;">${row.question}</p>
        <p style="margin:0;font-size:12px;color:${SAFFRON};font-weight:700;">${row.answer}</p>
      </div>`).join("")}` : "";

  // ── Quick wins / recommendations ────────────────────────────────────────────
  const stepsHtml = data.recommendations
    .map((rec, i) => `
      <tr>
        <td style="padding:10px 0;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:28px;vertical-align:top;padding-top:1px;">
              <div style="width:24px;height:24px;background-color:${NAV};border-radius:50%;text-align:center;line-height:24px;">
                <span style="color:#fff;font-size:11px;font-weight:700;">${i + 1}</span>
              </div>
            </td>
            <td style="padding-left:10px;font-size:13px;color:${TEXT};line-height:1.6;">${rec}</td>
          </tr></table>
        </td>
      </tr>`).join("");

  // ── Report page link ────────────────────────────────────────────────────────
  const reportUrl = data.reportToken
    ? `https://saralprivacy.com/report/${data.reportToken}`
    : "https://saralprivacy.com/assessment";

  const greeting     = data.name ? `Hi ${data.name}` : "Hi there";
  const businessLine = data.businessName
    ? `<p style="margin:0 0 24px;font-size:13px;color:${MUTED};">Business: <strong style="color:${TEXT};">${data.businessName}</strong></p>`
    : "";

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.5px;">DPDPA Readiness Assessment — Your Report</p>
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:${NAV};">${greeting} 👋</h2>
    ${businessLine}

    <!-- Block 2: Score + Verdict -->
    <div style="background-color:${LIGHT_BG};border-radius:12px;padding:24px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <div style="font-size:52px;font-weight:800;color:${bandColor};line-height:1;">${data.score}</div>
            <div style="font-size:14px;color:${MUTED};margin-top:2px;">out of 100</div>
          </td>
          <td style="vertical-align:middle;text-align:right;padding-left:20px;">
            <div style="display:inline-block;background-color:${bandColor};color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;">${data.band.toUpperCase()}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:16px;background-color:#E2E8F0;border-radius:4px;height:8px;overflow:hidden;">
        <div style="height:8px;width:${barWidth}px;background-color:${bandColor};border-radius:4px;"></div>
      </div>
      <p style="margin:12px 0 0;font-size:13px;color:${TEXT};line-height:1.6;">${data.summary}</p>
    </div>

    <!-- Block 3: Red flags (conditional) -->
    ${riskHtml}

    <!-- Block 4: 5 Scoring blocks -->
    ${cats ? `
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:${NAV};">Your readiness by area</p>
    <div style="background-color:${LIGHT_BG};border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      ${scorecardsHtml}
    </div>` : ""}

    <!-- Block 5: Your top answers -->
    ${answersHtml ? `
    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${NAV};">Your responses</p>
    <div style="margin-bottom:24px;">${answersHtml}</div>` : ""}

    ${divider()}

    <!-- Block 6: Quick wins -->
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${NAV};">Key steps to improve your score</p>
    <p style="margin:0 0 12px;font-size:12px;color:${MUTED};">Focus on these first — they have the highest impact on your readiness.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${stepsHtml}
    </table>

    ${data.checklistUrl ? `
    <!-- Block 6b: Industry checklist lead magnet -->
    <div style="background-color:#E6FAF4;border:1px solid #87E9C8;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${NAV};">Your free download</p>
      <p style="margin:0 0 12px;font-size:12px;color:${TEXT};line-height:1.6;">Use the ${data.checklistTitle || "Starter Checklist"} to turn these steps into action — tick what you do, fix the rest.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background-color:#07B981;border-radius:8px;padding:11px 22px;">
            <a href="${data.checklistUrl}" style="color:#FFFFFF;font-size:13px;font-weight:700;text-decoration:none;">Download the ${data.checklistTitle || "Checklist"} →</a>
          </td>
        </tr>
      </table>
    </div>` : ""}

    ${divider()}

    <!-- Block 7: Reassessment prompt -->
    <div style="background-color:#EFF6FF;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1E40AF;">Track your improvement</p>
      <p style="margin:0 0 12px;font-size:12px;color:#1E40AF;line-height:1.6;">Implement the quick wins above, then retake the assessment in 14 days to measure your progress.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background-color:#1E40AF;border-radius:8px;padding:10px 20px;">
            <a href="https://saralprivacy.com/assessment" style="color:#FFFFFF;font-size:12px;font-weight:700;text-decoration:none;">Retake Assessment →</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Block 8: CTAs -->
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${NAV};">${cta.headline}</p>
    <p style="margin:0 0 16px;font-size:13px;color:${TEXT};line-height:1.6;">${cta.body}</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
      <tr>
        <td style="background-color:${bandColor};border-radius:8px;padding:12px 24px;">
          <a href="${reportUrl}" style="color:#FFFFFF;font-size:13px;font-weight:700;text-decoration:none;">View Full Report →</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
      <tr>
        <td style="background-color:${NAV};border-radius:8px;padding:12px 24px;">
          <a href="${cta.href}" style="color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;">${cta.label}</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border:1px solid ${BORDER};border-radius:8px;padding:12px 24px;">
          <a href="https://saralprivacy.com/contact" style="color:${NAV};font-size:13px;font-weight:600;text-decoration:none;">Book a free expert consultation →</a>
        </td>
      </tr>
    </table>

    <!-- Block 9: Disclaimer + footer note -->
    <p style="margin:24px 0 8px;font-size:11px;color:${MUTED};line-height:1.6;border-top:1px solid ${BORDER};padding-top:16px;">
      <strong>Disclaimer:</strong> Information on this report is for educational purposes only and does not constitute formal legal advice. Consult a qualified professional for legal guidance.
    </p>
    <p style="margin:0;font-size:11px;color:${MUTED};line-height:1.6;">
      You received this because you completed the DPDPA Readiness Assessment at SaralPrivacy and consented to report delivery.
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
// 9. outreachBriefingEmail — cold outreach email wrapping actual daily briefing
//    One-time send to cold contacts. Subscribe CTA replaces unsubscribe footer.
// ──────────────────────────────────────────────────────────────────────────────

export interface OutreachBriefingContact {
  name?: string;
  email: string;
  subscribeUrl: string;
  unsubscribeUrl: string;
}

export function outreachBriefingEmail(
  briefing: BriefingData,
  contact: OutreachBriefingContact,
): { subject: string; html: string; text: string } {
  const subject = `${briefing.title}`;
  const firstName = (contact.name || "").split(" ")[0] || "there";

  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  let checklistHtml = "";
  let checklistText = "";
  try {
    const raw = briefing.action_checklist || "[]";
    const items: string[] = JSON.parse(raw);
    checklistHtml = items.map(item => `
      <tr>
        <td style="padding:8px 0;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:22px;vertical-align:top;padding-top:2px;">
              <div style="width:18px;height:18px;background-color:${SAFFRON};border-radius:50%;text-align:center;line-height:18px;">
                <span style="color:#fff;font-size:11px;font-weight:700;">✓</span>
              </div>
            </td>
            <td style="padding-left:8px;font-size:13px;color:${TEXT};line-height:1.5;">${item}</td>
          </tr></table>
        </td>
      </tr>`).join("");
    checklistText = items.map((item, i) => `${i + 1}. ${item}`).join("\n");
  } catch { checklistHtml = ""; checklistText = ""; }

  const whyText = (() => {
    try {
      const raw = briefing.why_it_matters || "";
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed?.hook_line1 || parsed?.why || raw;
    } catch { return briefing.why_it_matters || ""; }
  })();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${briefing.title}</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT_BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background-color:${NAV};border-radius:12px 12px 0 0;padding:28px 32px;">
            <span style="color:#FFFFFF;font-size:20px;font-weight:700;">Saral<span style="color:${SAFFRON};">Privacy</span></span>
            <p style="margin:2px 0 12px;color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px;">DPDPA Daily Brief</p>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;">${dateStr}</p>
          </td>
        </tr>

        <!-- Intro band -->
        <tr>
          <td style="background-color:#f0fdf4;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};padding:16px 32px;">
            <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
              Hi ${firstName}, here is today's DPDPA briefing — we're sharing it because your business operates in a sector covered by the Act.
              <strong>One email. Practical. Plain English.</strong>
            </p>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="background-color:#FFFFFF;padding:28px 32px 0;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${NAV};line-height:1.3;">${briefing.title}</h1>
            ${briefing.summary ? `<p style="margin:0;font-size:15px;color:${MUTED};line-height:1.7;border-left:3px solid ${SAFFRON};padding-left:16px;">${briefing.summary}</p>` : ""}
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="background-color:#FFFFFF;padding:0 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
            <hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />
          </td>
        </tr>

        ${whyText ? `
        <!-- Why It Matters -->
        <tr>
          <td style="background-color:#FFFFFF;padding:0 32px 24px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${SAFFRON};text-transform:uppercase;letter-spacing:1px;">Why It Matters</p>
            <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.7;">${whyText}</p>
          </td>
        </tr>` : ""}

        ${briefing.content ? `
        <!-- Content -->
        <tr>
          <td style="background-color:#FFFFFF;padding:0 32px 24px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
            <div style="font-size:14px;color:${TEXT};line-height:1.7;">${briefing.content}</div>
          </td>
        </tr>` : ""}

        ${checklistHtml ? `
        <!-- Action Checklist -->
        <tr>
          <td style="background-color:#F0F7FF;padding:24px 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:${NAV};text-transform:uppercase;letter-spacing:1px;">Your Action Checklist</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${checklistHtml}</table>
          </td>
        </tr>` : ""}

        <!-- Subscribe CTA -->
        <tr>
          <td style="background-color:#FFFFFF;padding:28px 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};text-align:center;">
            <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-weight:600;">Want this every morning?</p>
            <p style="margin:0 0 20px;font-size:13px;color:${MUTED};line-height:1.6;">
              We publish a free DPDPA briefing every day — practical steps for Indian businesses. No jargon. 2-minute reads.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#16a34a;border-radius:8px;padding:14px 32px;">
                  <a href="${contact.subscribeUrl}" style="color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;">Subscribe to Daily Briefings →</a>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;font-size:12px;color:${MUTED};">One email per day. Unsubscribe anytime. No spam — ever.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:${LIGHT_BG};border:1px solid ${BORDER};border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:${MUTED};line-height:1.6;">
              You are receiving this one-time briefing because your business operates in a sector covered by DPDPA.
              We will not email you again unless you subscribe above.
            </p>
            <p style="margin:0;font-size:12px;color:${MUTED};">
              <a href="${contact.unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Remove me from this list</a>
              &nbsp;·&nbsp;
              <a href="https://saralprivacy.com/privacy-policy" style="color:${MUTED};text-decoration:underline;">Privacy Policy</a>
              &nbsp;·&nbsp;SaralPrivacy, India
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},

Here is today's DPDPA briefing — ${briefing.title}

${briefing.summary || ""}

${whyText ? `WHY IT MATTERS\n${whyText}\n` : ""}
${briefing.content ? `${briefing.content}\n` : ""}
${checklistText ? `YOUR ACTION CHECKLIST\n${checklistText}\n` : ""}

Want this every morning?
Subscribe here: ${contact.subscribeUrl}
One email per day. Unsubscribe anytime.

---
You are receiving this one-time briefing because your business operates in a sector covered by DPDPA.
We will not email you again unless you subscribe.

Remove me: ${contact.unsubscribeUrl}
SaralPrivacy, India`;

  return { subject, html, text };
}

// ──────────────────────────────────────────────────────────────────────────────
// 10. bloggerInviteTemplate — invite a contributor to set up their account
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

// email.ts — Resend email client for SaralPrivacy
import { Resend } from 'resend';
import {
  consultationAlertTemplate,
  downloadAlertTemplate,
  assessmentAlertTemplate,
  welcomeEmailTemplate,
  briefingApprovalTemplate,
  briefingEmailTemplate,
  surveyResultEmailTemplate,
  bloggerInviteTemplate,
  type LeadData,
  type DownloadData,
  type AssessmentData,
  type BriefingData,
  type SurveyResultData,
  type BloggerInviteData,
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_BRIEFINGS = process.env.RESEND_FROM_BRIEFINGS || 'briefings@saralprivacy.com';
const FROM_NOREPLY   = process.env.RESEND_FROM_NOREPLY   || 'noreply@saralprivacy.com';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL            || 'dilip.sahu@gmail.com';

// All 3 admins receive briefing approval emails; any one can approve
const ADMIN_EMAILS: string[] = [
  'dilip.sahu@gmail.com',
  'sahudilip1356@gmail.com',
  'saralprivacy@gmail.com',
  ...(process.env.EXTRA_ADMIN_EMAILS ? process.env.EXTRA_ADMIN_EMAILS.split(',').map(e => e.trim()) : []),
].filter(Boolean);

export interface EmailResult {
  success: boolean;
  error?: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ──────────────────────────────────────────────────────────────────────────────
// 1. sendConsultationAlert — notify admin of new contact form submission
// ──────────────────────────────────────────────────────────────────────────────
export async function sendConsultationAlert(lead: LeadData): Promise<EmailResult> {
  try {
    const { subject, html } = consultationAlertTemplate(lead);
    const { error } = await resend.emails.send({
      from: FROM_NOREPLY,
      to:   ADMIN_EMAIL,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendConsultationAlert failed:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. sendDownloadAlert — notify admin of white paper download
// ──────────────────────────────────────────────────────────────────────────────
export async function sendDownloadAlert(download: DownloadData): Promise<EmailResult> {
  try {
    const { subject, html } = downloadAlertTemplate(download);
    const { error } = await resend.emails.send({
      from: FROM_NOREPLY,
      to:   ADMIN_EMAIL,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendDownloadAlert failed:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. sendAssessmentAlert — notify admin of completed assessment
// ──────────────────────────────────────────────────────────────────────────────
export async function sendAssessmentAlert(assessment: AssessmentData): Promise<EmailResult> {
  try {
    const { subject, html } = assessmentAlertTemplate(assessment);
    const { error } = await resend.emails.send({
      from: FROM_NOREPLY,
      to:   ADMIN_EMAIL,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendAssessmentAlert failed:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. sendWelcomeEmail — send welcome email to new newsletter subscriber
// ──────────────────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(subscriber: { name: string; email: string }): Promise<EmailResult> {
  try {
    const { subject, html } = welcomeEmailTemplate(subscriber.name);
    const { error } = await resend.emails.send({
      from: FROM_BRIEFINGS,
      to:   subscriber.email,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendWelcomeEmail failed:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. sendBriefingApprovalEmail — send draft briefing to admin for approval
// ──────────────────────────────────────────────────────────────────────────────
export async function sendBriefingApprovalEmail(briefing: BriefingData, approvalToken: string): Promise<EmailResult> {
  try {
    const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL || 'https://saralprivacy.com';
    const approveLink = `${siteUrl}/api/briefings/approve?token=${approvalToken}&briefingId=${briefing.id}`;
    const { subject, html } = briefingApprovalTemplate(briefing, approveLink);

    // Send to all 3 admins — any one click approves for all
    const results = await Promise.allSettled(
      ADMIN_EMAILS.map(adminEmail =>
        resend.emails.send({ from: FROM_NOREPLY, to: adminEmail, subject, html })
      )
    );

    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error));
    if (failed.length === ADMIN_EMAILS.length) {
      return { success: false, error: 'All admin approval emails failed to send' };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendBriefingApprovalEmail failed:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. sendBriefingToSubscribers — broadcast approved briefing to all subscribers
// ──────────────────────────────────────────────────────────────────────────────
export async function sendBriefingToSubscribers(
  briefing: BriefingData,
  subscribers: Array<{ email: string; name: string; $id?: string }>
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  let sent   = 0;
  let failed = 0;

  try {
    for (const subscriber of subscribers) {
      const result = await sendSubscriberBriefing(subscriber.email, subscriber.name, briefing);
      if (result.success) {
        sent++;
      } else {
        failed++;
        console.error(`[email] Failed to send to ${subscriber.email}:`, result.error);
      }
      // 100ms delay to avoid Resend rate limiting
      await wait(100);
    }
    return { success: true, sent, failed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendBriefingToSubscribers failed:', msg);
    return { success: false, sent, failed, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. sendSubscriberBriefing — send briefing to a single subscriber
// ──────────────────────────────────────────────────────────────────────────────
export async function sendSubscriberBriefing(
  email: string,
  name: string,
  briefing: BriefingData
): Promise<EmailResult> {
  try {
    const siteUrl       = process.env.NEXT_PUBLIC_SITE_URL || 'https://saralprivacy.com';
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
    const { subject, html } = briefingEmailTemplate(briefing, unsubscribeUrl);
    const { error } = await resend.emails.send({
      from:    FROM_BRIEFINGS,
      to:      email,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[email] sendSubscriberBriefing to ${email} failed:`, msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. sendSurveyResultEmail — score-based follow-up after survey submission
// ──────────────────────────────────────────────────────────────────────────────
export async function sendSurveyResultEmail(data: SurveyResultData): Promise<EmailResult> {
  try {
    const { subject, html } = surveyResultEmailTemplate(data);
    const { error } = await resend.emails.send({
      from:    FROM_BRIEFINGS,
      to:      data.email,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendSurveyResultEmail failed:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. sendBloggerInvite — send invite link to a new blogger contributor
// ──────────────────────────────────────────────────────────────────────────────
export async function sendBloggerInvite(data: BloggerInviteData): Promise<EmailResult> {
  try {
    const { subject, html } = bloggerInviteTemplate(data);
    const { error } = await resend.emails.send({
      from:    FROM_NOREPLY,
      to:      data.email,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] sendBloggerInvite failed:', msg);
    return { success: false, error: msg };
  }
}

export type { LeadData, DownloadData, AssessmentData, BriefingData, SurveyResultData, BloggerInviteData };

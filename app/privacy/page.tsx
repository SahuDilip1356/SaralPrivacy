import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "SaralPrivacy's Privacy Notice — how we collect, use, and protect your personal data.",
  alternates: { canonical: 'https://saralprivacy.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Privacy Notice v1.0</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Privacy Notice</h1>
          <p className="text-slate-300 mt-2">How SaralPrivacy collects, uses, and protects your personal data.</p>
          <p className="text-sm text-slate-500 mt-1">Last updated: March 2026 | Version 1.0</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>We practice what we preach.</strong> As a DPDPA education platform, we handle
            personal data of our users in a manner consistent with the principles of the DPDPA.
            This notice explains exactly what we collect, why, and your rights.
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "1. Who We Are",
              content: `SaralPrivacy (saralprivacy.com) is a compliance education and advisory platform focused on the Digital Personal Data Protection Act, 2023. We help Indian businesses understand and prepare for DPDPA compliance.

For the purposes of this Privacy Notice, SaralPrivacy is the Data Fiduciary — we determine the purpose and means of processing your personal data.

Contact for privacy matters: privacy@saralprivacy.com`,
            },
            {
              title: "2. What Personal Data We Collect",
              content: `We collect the following categories of personal data:

**From White Paper Downloads:**
- Full name
- Work email address
- Mobile number (optional)
- Company name
- Industry
- Company size

**From Newsletter Subscriptions:**
- Name
- Email address
- Industry (optional)
- Frequency preference

**From Consultation Requests:**
- Full name
- Work email
- Mobile number
- Company name
- Industry
- Issue description
- Preferred contact method and time

**From Website Usage:**
- IP address (anonymised for analytics)
- Device type and browser (aggregated)
- Pages visited and time on page (aggregated)

We do not collect sensitive personal data (Aadhaar, PAN, financial data, health data, or biometric data) through this platform.`,
            },
            {
              title: "3. Why We Collect and How We Use It",
              content: `**White paper download:**
We collect your information to deliver the white paper and, where you have separately consented, to send relevant follow-up content.

**Newsletter subscription:**
We collect your details to send the briefings or digest you subscribed to. We use your industry preference to personalise content where possible.

**Consultation requests:**
We collect your contact details to schedule and conduct the requested consultation and send a follow-up summary.

**Analytics:**
We collect aggregated, anonymised usage data to understand how our platform is used and to improve it. We do not track individual users across sessions.

We do not:
- Sell your personal data to third parties
- Use your data for purposes other than those stated in this notice and any specific consent you have given
- Send marketing communications without your specific consent`,
            },
            {
              title: "4. Legal Basis for Processing",
              content: `We process your personal data on the basis of:
- **Your consent** — for newsletter subscriptions, marketing communications, and optional contact permissions (where you have actively opted in)
- **Contractual necessity** — to deliver the white paper or conduct a consultation you requested
- **Legitimate interest** — for aggregated, anonymised analytics that help us improve the platform

We do not rely on "legitimate interest" as a basis for marketing communications.`,
            },
            {
              title: "5. How Long We Keep Your Data",
              content: `- **Newsletter subscribers:** For as long as you remain subscribed. We delete your record within 30 days of unsubscription.
- **White paper download records:** 24 months from download, unless you have requested earlier deletion.
- **Consultation records:** 12 months from the consultation date.
- **Anonymised analytics:** Retained indefinitely (no personal data involved).

We review our retention policies annually.`,
            },
            {
              title: "6. Who We Share Data With",
              content: `We use the following categories of service providers:
- **Email service provider** — to deliver newsletters and transactional emails (Data Processor)
- **CRM platform** — to manage consultation and download records (Data Processor)
- **Analytics provider** — aggregated, anonymised data only

All service providers are bound by Data Processing Agreements. We do not share your personal data with third parties for their marketing purposes.`,
            },
            {
              title: "7. Your Rights",
              content: `You have the following rights over your personal data:

**Right to access:** Ask us what personal data we hold about you.
**Right to correction:** Request correction of inaccurate data.
**Right to erasure:** Ask us to delete your data where it is no longer needed.
**Right to withdraw consent:** Withdraw any consent you have given, at any time.
**Right to grievance redressal:** Raise a complaint with us if you believe your rights have been violated.

To exercise any of these rights, email us at privacy@saralprivacy.com. We will respond within 30 days.

If you are not satisfied with our response, you will have the right to escalate to the Data Protection Board of India once it is constituted.`,
            },
            {
              title: "8. How to Withdraw Consent",
              content: `You can withdraw consent at any time by:
- Clicking "Unsubscribe" in any email we send you
- Emailing privacy@saralprivacy.com
- Using our Consent Preferences page at saralprivacy.com/consent-preferences

Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal.`,
            },
            {
              title: "9. Changes to This Notice",
              content: `We may update this Privacy Notice. If changes are material, we will notify subscribed users by email. The current version and date are shown at the top of this page.`,
            },
            {
              title: "10. Contact",
              content: `For any privacy-related queries, requests, or complaints:

Email: privacy@saralprivacy.com
Subject: Data Privacy Request

We are committed to responding within 30 days.`,
            },
          ].map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-navy-700 text-xl mb-3">{section.title}</h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-2">
                {section.content.split("\n\n").map((para, i) => (
                  <p key={i} dangerouslySetInnerHTML={{
                    __html: para
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
                      .replace(/\n/g, '<br />')
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact box */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <Mail size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-700 text-sm">Privacy Contact</p>
            <p className="text-green-600 text-sm">
              For access, correction, erasure, or any privacy question:{" "}
              <a href="mailto:privacy@saralprivacy.com" className="underline">
                privacy@saralprivacy.com
              </a>
            </p>
            <div className="flex gap-3 mt-2">
              <Link href="/consent-preferences" className="text-xs text-green-500 underline">
                Manage Consent
              </Link>
              <Link href="/rights/erasure" className="text-xs text-green-500 underline">
                Request Erasure
              </Link>
              <Link href="/unsubscribe" className="text-xs text-green-500 underline">
                Unsubscribe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

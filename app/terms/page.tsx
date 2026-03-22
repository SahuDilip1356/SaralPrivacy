import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "SaralPrivacy terms of use — educational platform for DPDPA compliance guidance.",
  alternates: { canonical: 'https://saralprivacy.com/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white">Terms of Use</h1>
          <p className="text-slate-300 mt-2">SaralPrivacy Terms of Use</p>
          <p className="text-sm text-slate-500 mt-1">Last updated: March 2026 | Version 1.0</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-6">
          {[
            { title: "1. Educational Purpose", content: "SaralPrivacy provides educational and informational content about the Digital Personal Data Protection Act, 2023. Nothing on this platform constitutes formal legal advice. Users should consult a qualified data protection lawyer for formal legal opinions specific to their situation." },
            { title: "2. Accuracy of Content", content: "We make reasonable efforts to ensure that content on this platform is accurate and up to date. However, DPDPA is a developing area of law and regulatory guidance evolves. We cannot guarantee that all content is current or complete at any given time." },
            { title: "3. Limitation of Liability", content: "SaralPrivacy is not liable for any losses or damages arising from reliance on content published on this platform. Users rely on this content at their own risk and should independently verify any compliance steps before implementing them." },
            { title: "4. Intellectual Property", content: "All content on this platform — including briefings, guides, templates, and assessments — is the intellectual property of SaralPrivacy. Content may be used for internal educational purposes. Reproduction or distribution for commercial purposes requires written permission." },
            { title: "5. Privacy", content: "Your use of this platform is subject to our Privacy Notice, which explains how we collect and use your personal data." },
            { title: "6. Changes to These Terms", content: "We may update these Terms of Use from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms." },
          ].map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-brand-700 text-lg mb-3">{section.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-slate-500">
          Questions about these terms?{" "}
          <Link href="/contact" className="text-saffron-500 hover:underline">Contact us</Link> or email{" "}
          <a href="mailto:hello@saralprivacy.com" className="text-saffron-500 hover:underline">hello@saralprivacy.com</a>
        </div>
      </div>
    </div>
  );
}

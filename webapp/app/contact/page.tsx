import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Book a Free DPDPA Consultation",
  description:
    "Request a free 30-minute DPDPA consultation with the SaralPrivacy advisory team. We respond within one business day.",
  alternates: { canonical: 'https://saralprivacy.com/contact' },
};

export default function ContactPage() {
  return (
    <>
      {/* Server-rendered answer block — ensures crawlers index what this page offers */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-slate-50 border-l-4 border-green-400 rounded-r-xl px-5 py-4 mb-6">
          <p className="text-slate-700 text-sm leading-relaxed">
            Book a free 30-minute DPDPA consultation with the SaralPrivacy advisory team.
            We cover your specific sector risks, data flows, consent gaps, and highest-priority
            compliance actions. We respond within one business day. Contact us at{' '}
            <a href="mailto:privacy@saralprivacy.com" className="text-green-600 hover:underline">
              privacy@saralprivacy.com
            </a>.
          </p>
        </div>
      </div>
      <ContactContent />
    </>
  );
}

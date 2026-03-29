import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "DPDPA for D2C Brands",
  description: "Practical DPDPA guidance for D2C brands on checkout consent, WhatsApp and SMS marketing, analytics tools, loyalty data, and retention.",
  alternates: { canonical: 'https://saralprivacy.com/industries/d2c-brands' },
};

export default function D2CBrandsPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'Industries', url: 'https://saralprivacy.com/industries' },
        { name: 'D2C Brands', url: 'https://saralprivacy.com/industries/d2c-brands' },
      ])}
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-700 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-rose-300 text-sm font-semibold">Industry Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">DPDPA for D2C Brands and E-commerce Businesses</h1>
          <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 max-w-2xl">
            <p className="text-slate-200 text-sm leading-relaxed">D2C brands run on customer data: checkout details, remarketing audiences, WhatsApp lists, analytics tools, loyalty signals, and behavioural targeting. Under DPDPA, the biggest problems usually show up in bundled consent, undisclosed tracking, sloppy opt-ins, and indefinite retention. This guide shows D2C teams how to keep growth systems running without turning the customer funnel into a compliance minefield.</p>
            <p className="text-rose-300 text-xs mt-2 font-medium">If checkout consent is doing three jobs at once, it is probably doing all three badly.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {[
              { title: "Marketing Consent at Checkout", risk: "Critical", desc: "Most D2C checkouts bundle marketing consent with purchase acceptance — pre-ticked boxes or embedded T&Cs. This is non-compliant under DPDPA.", action: "Redesign checkout to include separate, unchecked consent boxes for email, SMS, and WhatsApp marketing. Separate from order processing." },
              { title: "WhatsApp and SMS Campaigns", risk: "High", desc: "WhatsApp Business API campaigns require documented opt-in. Sending marketing messages to customers who only gave transactional consent is a violation.", action: "Audit your WhatsApp subscriber list. Run a re-consent campaign for existing subscribers. Implement separate opt-in at checkout for WhatsApp." },
              { title: "Third-Party Analytics and Pixels", risk: "High", desc: "Meta Pixel, Google Analytics, Clevertap, and similar tools process customer personal data. They must be disclosed in your Privacy Notice.", action: "Update your Privacy Notice to list all tracking tools. Consider a cookie/tracking consent banner if you use non-essential tracking." },
              { title: "Customer Data Retention", risk: "Medium", desc: "Holding personal data of customers who haven't purchased in 2+ years without a purpose creates unnecessary risk and clutter.", action: "Define a retention policy: e.g., active customers indefinitely (with consent); inactive for 12 months post-last-purchase with a notice." },
              { title: "Loyalty and Personalisation Data", risk: "Medium", desc: "Rich behavioural profiling for personalisation must be disclosed at the point of data collection.", action: "Update your Privacy Notice to describe your personalisation and loyalty data use. Obtain consent where profiling is significant." },
            ].map((area) => (
              <div key={area.title} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-brand-700">{area.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${area.risk === "Critical" ? "bg-red-100 text-red-700" : area.risk === "High" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{area.risk} Risk</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">{area.desc}</p>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-rose-800 text-xs"><strong>Action: </strong>{area.action}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <div className="bg-rose-700 rounded-xl p-5 text-white">
              <h3 className="font-bold mb-2">Take the Free Assessment</h3>
              <p className="text-rose-100 text-sm mb-4">8 questions. Check your D2C data practices.</p>
              <Link href="/assessment/d2c-brands" className="block text-center py-2.5 bg-white text-rose-800 font-bold rounded-lg text-sm">Start Assessment →</Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-brand-700 text-sm mb-2">Free White Paper</h3>
              <p className="text-slate-600 text-xs mb-3">45-page DPDPA compliance guide covering D2C and e-commerce.</p>
              <Link href="/white-paper" className="block text-center py-2.5 bg-brand-700 text-white font-semibold rounded-lg text-sm hover:bg-brand-800 transition-colors">
                Download White Paper →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-brand-700 text-sm mb-3">Related Briefings</h3>
              <div className="space-y-2 text-sm">
                <Link href="/briefings/d2c-brands-whatsapp-marketing-consent-dpdpa" className="block text-saffron-600 hover:underline">→ WhatsApp Marketing Consent</Link>
                <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-saffron-600 hover:underline">→ Consent Notice Requirements</Link>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <Link href="/contact" className="block text-center py-2.5 bg-brand-700 text-white font-semibold rounded-lg text-sm">Request Consultation →</Link>
            </div>
          </div>
        </div>
      </div>
        <div data-nosnippet className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
    </div>
    </>
  );
}

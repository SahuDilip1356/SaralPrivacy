import Link from "next/link";
import { Shield, Mail, ExternalLink } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Daily Briefings", href: "/briefings" },
    { label: "DPDPA Guide", href: "/learn" },
    { label: "Insights", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
  ],
  industries: [
    { label: "Recruitment Agencies", href: "/industries/recruitment-agencies" },
    { label: "CA Firms", href: "/industries/ca-firms" },
    { label: "Training Institutes", href: "/industries/training-institutes" },
    { label: "D2C Brands", href: "/industries/d2c-brands" },
  ],
  assessment: [
    { label: "Take Free Assessment", href: "/assessment" },
    { label: "Recruitment Assessment", href: "/assessment/recruitment" },
    { label: "CA Firm Assessment", href: "/assessment/ca-firms" },
    { label: "Training Institute", href: "/assessment/training-institutes" },
    { label: "D2C Brand Assessment", href: "/assessment/d2c-brands" },
  ],
  legal: [
    { label: "Privacy Notice", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Consent Preferences", href: "/consent-preferences" },
    { label: "Request Data Access", href: "/rights/access" },
    { label: "Request Erasure", href: "/rights/erasure" },
    { label: "Unsubscribe", href: "/unsubscribe" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-700 text-slate-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-base leading-none">
                  Saral<span className="text-saffron-400">Privacy</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                  DPDPA Compliance Platform
                </div>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              India&apos;s practical DPDPA compliance platform for businesses. Daily briefings,
              industry assessments, resources, and advisory — without the legalese.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-saffron-400" />
              <a href="mailto:privacy@saralprivacy.com" className="text-slate-400 hover:text-white transition-colors">
                privacy@saralprivacy.com
              </a>
            </div>
            <div data-nosnippet className="mt-5 p-3 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-xs text-slate-400">
                <span className="text-amber-400 font-semibold">Disclaimer:</span> Information on
                this platform is for educational purposes only and does not constitute formal legal
                advice. Consult a qualified professional for legal guidance.
              </p>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Industries</h4>
            <ul className="space-y-2.5">
              {footerLinks.industries.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold text-sm mb-4 mt-6">Assessments</h4>
            <ul className="space-y-2.5">
              {footerLinks.assessment.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Privacy & Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div data-nosnippet className="mt-6 p-3 rounded-lg bg-saffron-700/30 border border-saffron-600">
              <p className="text-xs text-saffron-300 font-semibold mb-1">Data Rights Contact</p>
              <a
                href="mailto:privacy@saralprivacy.com"
                className="text-xs text-saffron-400 hover:text-saffron-300"
              >
                privacy@saralprivacy.com
              </a>
              <p className="text-xs text-slate-500 mt-1">
                For access, correction, erasure, or complaints
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div data-nosnippet className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SaralPrivacy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Privacy Notice v1.0 · Updated March 2026</span>
            <Link
              href="/privacy"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/consent-preferences"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Consent
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

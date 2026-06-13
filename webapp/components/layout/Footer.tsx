import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { PressProofStrip } from "@/components/ui/PressProofStrip";

const footerLinks = {
  platform: [
    { label: "Personal Data Discovery", href: "/discovery" },
    { label: "Daily Briefings", href: "/briefings" },
    { label: "DPDPA Guide", href: "/learn" },
    { label: "Insights", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Glossary", href: "/glossary" },
    { label: "About", href: "/about" },
    { label: "Media", href: "/media" },
  ],
  industries: [
    { label: "Recruitment Agencies", href: "/industries/recruitment-agencies" },
    { label: "CA Firms", href: "/industries/ca-firms" },
    { label: "Training Institutes", href: "/industries/training-institutes" },
    { label: "D2C Brands", href: "/industries/d2c-brands" },
    { label: "Clinics & Diagnostic Labs", href: "/industries/clinics-diagnostic-labs" },
    { label: "Schools & Colleges", href: "/industries/schools-colleges" },
    { label: "Law Firms & Legal Consultants", href: "/industries/law-firms" },
    { label: "Real Estate & Property Firms", href: "/industries/real-estate" },
  ],
  assessment: [
    { label: "Take Free Assessment", href: "/assessment" },
    { label: "Recruitment Assessment", href: "/assessment/recruitment" },
    { label: "CA Firm Assessment", href: "/assessment/ca-firms" },
    { label: "Training Institute", href: "/assessment/training-institutes" },
    { label: "D2C Brand Assessment", href: "/assessment/d2c-brands" },
    { label: "Clinic & Diagnostic Lab", href: "/assessment/clinics-diagnostic-labs" },
    { label: "School & College", href: "/assessment/schools-colleges" },
    { label: "Law Firm & Legal", href: "/assessment/law-firms" },
    { label: "Real Estate & Property", href: "/assessment/real-estate" },
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
    <footer className="bg-navy-700 text-slate-300">
      {/* Gold rule at top — ceremonial brand divider */}
      <div className="h-px bg-gold-400 opacity-40" />

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0">
                <Image
                  src="/logo-emblem.png"
                  alt="SaralPrivacy logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-white text-base leading-none">
                  Saral<span className="text-green-400">Privacy</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                  Privacy Made Practical for India
                </div>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              India&apos;s practical DPDPA readiness platform for businesses. Daily briefings,
              industry assessments, resources, and advisory — without the legalese.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-teal-400" />
              <a href="mailto:privacy@saralprivacy.com" className="text-slate-400 hover:text-white transition-colors">
                privacy@saralprivacy.com
              </a>
            </div>
            <div data-nosnippet className="mt-5 p-3 rounded-lg bg-navy-800 border border-navy-600">
              <p className="text-xs text-slate-400">
                <span className="text-gold-400 font-semibold">Disclaimer:</span> Information on
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

            <div data-nosnippet className="mt-6 p-3 rounded-lg bg-teal-900/40 border border-teal-700/50">
              <p className="text-xs text-teal-300 font-semibold mb-1">Data Rights Contact</p>
              <a
                href="mailto:privacy@saralprivacy.com"
                className="text-xs text-teal-400 hover:text-teal-300"
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

      {/* Press proof strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 border-t border-navy-600 pt-5">
        <PressProofStrip variant="compact" />
      </div>

      {/* Bottom bar */}
      <div data-nosnippet className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SaralPrivacy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Privacy Notice v1.0 · Updated March 2026</span>
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/consent-preferences" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Consent
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

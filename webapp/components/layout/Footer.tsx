import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { sectorNavLinks } from "@/lib/data/sectors";
import { dataMapFooterLinks } from "@/lib/data/data-flow";
import { DPO } from "@/lib/data/privacy-vendors";

const footerLinks = {
  platform: [
    { label: "Daily Briefings", href: "/briefings" },
    { label: "DPDPA Guide", href: "/learn" },
    { label: "Insights", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Glossary", href: "/glossary" },
    { label: "About", href: "/about" },
    { label: "Media", href: "/media" },
  ],
  industries: sectorNavLinks,
  // Landing page first, then the sectors that actually have a map. Derived from
  // the data-flow registry, so publishing the next map adds its row here with
  // no edit to this file - and a sector without a map can never be listed.
  dataMapping: [
    { label: "Data Mapping Overview", href: "/data-mapping" },
    ...dataMapFooterLinks,
  ],
  assessment: [
    { label: "DPDPA Readiness Assessment", href: "/assessment" },
    { label: "Personal Data Discovery", href: "/discovery" },
    { label: "DPDPA Notice Generator", href: "/tools/dpdpa-privacy-notice-generator" },
  ],
  // "Your Rights" → /rights is the single entry for data-principal rights. The old
  // per-action links ("Request Data Access" → /rights#access, "Request Erasure" →
  // /rights#erasure) were dropped: they landed on the same page /rights already opens,
  // which surfaces every right (access, erasure, withdraw, nominate, grievance) on arrival.
  // The /rights/access + /rights/erasure stub routes still 308-redirect for old bookmarks.
  // "Unsubscribe" is intentionally NOT here. /unsubscribe is the one-click target for
  // the mandatory link inside marketing emails — it needs an ?email= param and errors
  // (or now redirects to /consent-preferences) without one, so it makes a poor footer
  // destination. "Consent Preferences" is the human-navigable surface and carries its
  // own "Unsubscribe from All" button, so nothing is lost.
  legal: [
    { label: "Privacy Notice", href: "/privacy" },
    { label: "Your Rights", href: "/rights" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Consent Preferences", href: "/consent-preferences" },
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
              <a href="mailto:privacy@saralprivacy.com" className="inline-flex items-center pointer-coarse:min-h-11 text-slate-400 hover:text-white transition-colors">
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
                    className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Data Mapping - sits under Platform per the product spine:
                Discovery -> Data Mapping -> Assessment -> Notice. Industry rows
                come from the registry, so this list grows as maps ship. */}
            <h4 className="text-white font-semibold text-sm mb-4 mt-6">Data Flow Maps</h4>
            <ul className="space-y-2.5">
              {footerLinks.dataMapping.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-400 hover:text-white transition-colors"
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
                    className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-400 hover:text-white transition-colors"
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
                    className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-400 hover:text-white transition-colors"
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
                    className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div data-nosnippet className="mt-6 p-3 rounded-lg bg-teal-900/40 border border-teal-700/50">
              <p className="text-xs text-teal-300 font-semibold mb-1">Data Protection Officer</p>
              <a
                href={`mailto:${DPO.email}`}
                className="inline-flex items-center pointer-coarse:min-h-11 text-xs text-teal-400 hover:text-teal-300"
              >
                {DPO.email}
              </a>
              <p className="text-xs text-slate-400 mt-1">
                {DPO.name} — for access, correction, erasure, or complaints
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Briefings signup — moved here from the bottom of the homepage, where it
          was the page's closing conversion. It asked the visitor to swap a free
          score they could have in three minutes for an email subscription;
          subscribing is a good outcome, just not the one that page is for.

          A link, not an inline field. The real form carries a consent checkbox
          that is never pre-checked plus the Privacy Notice reference, and a
          one-field footer box could not carry those honestly. /subscribe and
          /briefings both have the full, consent-correct version. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-navy-600 pt-5 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              DPDPA briefings, delivered to your inbox
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              A short daily read for business owners, not lawyers. Unsubscribe any time.
            </p>
          </div>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-1.5 shrink-0 pointer-coarse:min-h-11 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            Subscribe to briefings
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Press proof strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 border-t border-navy-600 pt-5">
        <PressProofStrip variant="compact" />
      </div>

      {/* Bottom bar */}
      <div data-nosnippet className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SaralPrivacy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Privacy Notice v2.0 · Updated July 2026</span>
            <Link href="/privacy" className="inline-flex items-center pointer-coarse:min-h-11 text-xs text-slate-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/rights" className="inline-flex items-center pointer-coarse:min-h-11 text-xs text-slate-400 hover:text-white transition-colors">
              Rights
            </Link>
            <Link href="/terms" className="inline-flex items-center pointer-coarse:min-h-11 text-xs text-slate-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/consent-preferences" className="inline-flex items-center pointer-coarse:min-h-11 text-xs text-slate-400 hover:text-white transition-colors">
              Consent
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

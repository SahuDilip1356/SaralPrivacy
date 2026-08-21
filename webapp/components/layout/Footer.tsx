import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { sectorNavLinks } from "@/lib/data/sectors";
import { dataMapFooterLinks } from "@/lib/data/data-flow";
import { DPO } from "@/lib/data/privacy-vendors";

// The institutional footer (Quiet Authority spec §10). Restructured, not
// reduced: every link the old footer carried is still here — the footer is a
// load-bearing internal-linking surface — but the grouping now says what kind
// of organisation this is.
//
// The old layout interleaved two headed lists per column (Platform above Data
// Flow Maps, Industries above Assessments) and scattered the trust apparatus:
// the disclaimer sat in the brand column, the DPO in a tinted box under Legal,
// the general contact somewhere else again. Now: four columns that answer the
// four questions a footer gets asked — what do you make (Product), who is it
// for (Industries), what have you written (Knowledge), who are you (Company) —
// and one PRIVACY OFFICE band that gathers contact, DPO and disclaimer into
// the single block a privacy company should end on.
//
// Column labels are the site's eyebrow style, not bold white — quieter reads
// as more established. cloud-400 on navy measures 7.64:1.

const productLinks = [
  { label: "DPDPA Readiness Assessment", href: "/assessment" },
  { label: "Personal Data Discovery", href: "/discovery" },
  { label: "Data Mapping Overview", href: "/data-mapping" },
  { label: "DPDPA Notice Generator", href: "/tools/dpdpa-privacy-notice-generator" },
];

// Every sector's flow map is now live, which made the old footer render two
// near-identical twelve-row columns — the sector list under INDUSTRIES and the
// same twelve names again under DATA FLOW MAPS. That duplication was most of
// the footer's height. The maps keep their links, but as a quiet "map" suffix
// on each industry row: one column, twenty-four hrefs, half the pixels.
// Registry-driven — a sector without a live map simply gets no suffix.
const FLOW_MAP_HREFS = new Map(
  dataMapFooterLinks.map((l) => [l.href.replace(/\/data-flow$/, ""), l.href]),
);

const knowledgeLinks = [
  { label: "Daily Briefings", href: "/briefings" },
  { label: "DPDPA Guide", href: "/learn" },
  { label: "Insights", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Glossary", href: "/glossary" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Media", href: "/media" },
];

const legalLinks = [
  { label: "Privacy Notice", href: "/privacy" },
  { label: "Your Rights", href: "/rights" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Consent Preferences", href: "/consent-preferences" },
];

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-cloud-400 mb-4">
      {children}
    </h4>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-400 hover:text-white transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-700 text-slate-300">
      {/* Gold rule at top — the one ceremonial gold on the page, and it is on
          navy, which is the only surface the interim gold ruling permits it. */}
      <div className="h-px bg-gold-400 opacity-40" />

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 pointer-coarse:min-h-11">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0">
                <Image
                  src="/logo-emblem.png"
                  alt="SaralPrivacy logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="font-bold text-white text-base leading-none">
                Saral<span className="text-green-400">Privacy</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-slate-300 mb-3">
              Privacy made practical for India.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              India&apos;s practical DPDPA readiness platform for businesses.
              Daily briefings, industry assessments, resources, and advisory —
              without the legalese.
            </p>
          </div>

          {/* Product */}
          <div>
            <ColumnLabel>Product</ColumnLabel>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </ul>
          </div>

          {/* Industries — all twelve, each with its live flow map as a quiet
              suffix. The footer is part of the internal-linking budget
              (INTERNAL_LINKING_SPEC.md) and drops nothing: 12 industry hrefs +
              12 map hrefs, in one column instead of two. */}
          <div>
            <ColumnLabel>Industries</ColumnLabel>
            <ul className="space-y-2.5">
              {sectorNavLinks.map((l) => {
                const mapHref = FLOW_MAP_HREFS.get(l.href);
                return (
                  <li key={l.href} className="text-sm leading-snug">
                    <Link
                      href={l.href}
                      className="inline-flex items-center pointer-coarse:min-h-11 text-slate-400 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                    {mapHref && (
                      <>
                        {" "}
                        <Link
                          href={mapHref}
                          aria-label={`${l.label} — data flow map`}
                          className="inline-flex items-center pointer-coarse:min-h-11 text-xs text-teal-300/80 hover:text-teal-200 transition-colors"
                        >
                          · map
                        </Link>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Knowledge */}
          <div>
            <ColumnLabel>Knowledge</ColumnLabel>
            <ul className="space-y-2.5">
              {knowledgeLinks.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </ul>
          </div>

          {/* Company + legal */}
          <div>
            <ColumnLabel>Company</ColumnLabel>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </ul>
            <ColumnLabel>
              <span className="mt-6 inline-block">Privacy &amp; legal</span>
            </ColumnLabel>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Privacy Office — the block a privacy company should end on: who to
          write to, who answers for data protection, and what this platform is
          not. data-nosnippet keeps the disclaimer out of search snippets. ── */}
      <div className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-cloud-400 mb-5">
            Privacy office
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">General</p>
              <a
                href="mailto:privacy@saralprivacy.com"
                className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-slate-300 hover:text-white transition-colors"
              >
                privacy@saralprivacy.com
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Data Protection Officer — {DPO.name}
              </p>
              <a
                href={`mailto:${DPO.email}`}
                className="inline-flex items-center pointer-coarse:min-h-11 text-sm text-teal-300 hover:text-teal-200 transition-colors"
              >
                {DPO.email}
              </a>
              <p className="text-xs text-slate-400 mt-1">
                For access, correction, erasure, or complaints
              </p>
            </div>
            <div data-nosnippet>
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-gold-400 font-semibold">Disclaimer:</span>{" "}
                Information on this platform is for educational purposes only
                and does not constitute formal legal advice. Consult a qualified
                professional for legal guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Briefings signup — a link, not an inline field: the real form
          carries an un-prechecked consent box plus the Privacy Notice
          reference, which a one-field footer box could not carry honestly. ── */}
      <div className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            className="inline-flex items-center gap-1.5 shrink-0 pointer-coarse:min-h-11 text-sm font-semibold text-teal-300 hover:text-teal-200 transition-colors"
          >
            Subscribe to briefings
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Press proof ── */}
      <div className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <PressProofStrip variant="compact" />
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div data-nosnippet className="border-t border-navy-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SaralPrivacy. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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

import Link from "next/link";
import Image from "next/image";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { sectorNavLinks } from "@/lib/data/sectors";
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

          {/* Industries — two lines, not twenty-four.
              The column used to list all twelve sectors, each with its flow map
              as a "· map" suffix: 24 links on every page of the site. Founder
              call (2026-08-22): it read as clutter, and it did.

              Dropping it outright would have cost the sitewide crawl path to
              twelve pages we invest in — the homepage's sector deck carries
              those links, but only on the homepage. So the rows collapse to
              their two hubs, which link onward to all twelve. Clutter gone,
              crawl path intact, one extra hop. */}
          <div>
            <ColumnLabel>Industries</ColumnLabel>
            <ul className="space-y-2.5">
              <FooterLink href="/industries" label={`All ${sectorNavLinks.length} industries`} />
              <FooterLink href="/data-mapping" label="Data flow maps" />
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
            {/* Privacy & legal — now one pane, per the founder's "bring privacy
                and legal into the same pane". The Privacy Office used to be a
                full-width band of its own below the columns; the contacts it
                carried live here instead. They are not dropped: a data
                fiduciary has to be reachable for access, correction, erasure
                and complaints, and the DPO's address is how. */}
            <ColumnLabel>
              <span className="mt-6 inline-block">Privacy &amp; legal</span>
            </ColumnLabel>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
              <li className="text-sm leading-snug pt-1.5">
                <a
                  href={`mailto:${DPO.email}`}
                  className="inline-block pointer-coarse:min-h-11 break-all text-teal-300 hover:text-teal-200 transition-colors"
                >
                  {DPO.email}
                </a>
                <span className="block text-xs text-slate-400 mt-0.5">
                  Data Protection Officer — {DPO.name}
                </span>
              </li>
              <li className="text-sm leading-snug">
                <a
                  href="mailto:privacy@saralprivacy.com"
                  className="inline-block pointer-coarse:min-h-11 break-all text-slate-400 hover:text-white transition-colors"
                >
                  privacy@saralprivacy.com
                </a>
                <span className="block text-xs text-slate-400 mt-0.5">General enquiries</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The Privacy Office band and the briefings signup band both used to
          sit here — three stacked full-width bands above the press row, which
          is what made this footer read as cluttered. The office contacts moved
          into the Privacy & legal column above; the briefings signup is one
          click away from the "Daily Briefings" link in Knowledge and from
          /subscribe. Disclaimer moved to the bottom bar, still data-nosnippet. */}

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
            © {new Date().getFullYear()} SaralPrivacy. All rights reserved.{" "}
            <span className="block sm:inline">
              <span className="text-gold-400 font-semibold">Disclaimer:</span> educational
              information, not formal legal advice.
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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

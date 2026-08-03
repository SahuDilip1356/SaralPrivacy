"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Download } from "lucide-react";
import { TemplateDownloadModal } from "@/components/TemplateDownloadModal";
import { sectorNavLinks } from "@/lib/data/sectors";

const navigation = [
  {
    label: "Data Discovery",
    href: "/discovery",
    badge: "Free",
  },
  {
    label: "Data Flow",
    href: "/data-mapping",
    badge: "Free",
  },
  {
    label: "Assessment",
    href: "/assessment",
    badge: "Free",
  },
  {
    label: "Industries",
    href: "/industries",
    children: sectorNavLinks,
  },
  {
    label: "Learn DPDPA",
    href: "/learn",
    children: [
      { label: "DPDP Act 2023 (Full Text)",   href: "/learn/dpdp-act-2023" },
      { label: "DPDP Rules 2025",             href: "/learn/dpdp-rules-2025-plain-english-guide" },
      { label: "What is DPDPA?",             href: "/learn/what-is-dpdpa" },
      { label: "Who Does It Apply To?",      href: "/learn/applicability" },
      { label: "Key Terms Explained",        href: "/learn/key-terms" },
      { label: "Consent Under DPDPA",        href: "/learn/consent" },
      { label: "Rights of Individuals",      href: "/learn/rights" },
      { label: "Data Breach Basics",         href: "/learn/data-breach" },
      { label: "Penalties Under DPDPA",      href: "/penalty-calculator" },
      { label: "DPDPA Glossary (50+ Terms)", href: "/glossary" },
    ],
  },
  {
    label: "Briefings",
    href: "/briefings",
    badge: "Daily",
  },
  {
    label: "Blog",
    href: "/blog",
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  function openMenu(label: string) {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(label);
  }

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Allow any page CTA (e.g. TemplatesCTA component) to open the modal
  // by dispatching a "openTemplatesModal" CustomEvent — avoids prop-drilling
  // through server components.
  useEffect(() => {
    const handler = () => setTemplateModalOpen(true);
    window.addEventListener("openTemplatesModal", handler);
    return () => window.removeEventListener("openTemplatesModal", handler);
  }, []);

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white border-b border-slate-200 shadow-sm"
          : "bg-white/95 backdrop-blur-sm border-b border-slate-100"
      )}
    >
      {/* Top urgency strip — Trust Navy with Signal Gold dot */}
      <div className="bg-navy-700 text-white text-xs py-2 px-4 text-center font-medium">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          {/* Pulsing urgency dot — Signal Gold, echoes logo tick */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-400" />
          </span>
          <span>
            <strong>DPDP Rules, 2025 are now in effect.</strong>{" "}
            See where your business stands, in 3–5 minutes.
          </span>
          <Link
            href="/discovery"
            className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-green-600 transition-colors shrink-0"
          >
            Find out — free →
          </Link>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* SP circle emblem — shown on all screen sizes */}
            <Image
              src="/logo-emblem.png"
              alt="SaralPrivacy emblem"
              width={40}
              height={40}
              className="h-10 w-10 object-contain shrink-0 self-center"
              priority
            />
            {/* Wordmark + tagline — hidden on mobile */}
            <div className="hidden sm:flex flex-col justify-center">
              <div className="font-bold text-base leading-tight tracking-tight">
                <span className="text-green-500">saral</span><span className="text-navy-700">Privacy</span>
              </div>
              <div className="text-[10px] text-navy-700 leading-tight tracking-wide">
                Privacy Made Practical for India
              </div>
            </div>
          </Link>

          {/* Desktop nav.
              Shown from xl, not lg: at 1024-1279 the six items + two CTAs + logo
              measured exactly 0px of slack, so labels wrapped to two lines
              ("Data Discovery", "Learn DPDPA") and squeezed the wordmark. The
              mobile menu is the better experience in that band than a wrapped
              bar. `whitespace-nowrap` makes any future overflow visible as
              overflow instead of silently re-wrapping. */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && openMenu(item.label)}
                onMouseLeave={() => item.children && scheduleClose()}
              >
                {item.badge && (
                  <span className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gold-400 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
                    {item.badge}
                  </span>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-green-600 bg-green-50"
                      : "text-slate-700 hover:text-navy-700 hover:bg-cloud-50"
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        openDropdown === item.label && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={() => scheduleClose()}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-cloud-50 hover:text-navy-700 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold whitespace-nowrap bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              <Download size={14} />
              Templates
            </button>
            <div className="relative hidden md:inline-flex">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-gold-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
                7 Indian languages
              </span>
              <Link
                href="/white-paper#download"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold whitespace-nowrap bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={14} />
                DPDPA Guide
              </Link>
            </div>
            <button
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-1 max-h-[80vh] overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium",
                  pathname === item.href
                    ? "text-green-600 bg-green-50"
                    : "text-slate-700 hover:bg-cloud-50"
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-gold-400 text-navy-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
              {item.children && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-3 py-2 text-sm text-slate-600 hover:text-navy-700 rounded-lg hover:bg-cloud-50"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => { setMobileOpen(false); setTemplateModalOpen(true); }}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Download DPDPA Templates
            </button>
            <Link
              href="/white-paper#download"
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={14} />
              DPDPA Guide
              <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy-800">7 Indian languages</span>
            </Link>
            <Link
              href="/contact"
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold border border-navy-300 text-navy-700 rounded-lg hover:bg-cloud-50 transition-colors"
            >
              Get Consultation
            </Link>
          </div>
        </div>
      )}
    </header>

    {/* Template download modal — mounted outside <header> to avoid z-index conflicts */}
    <TemplateDownloadModal
      open={templateModalOpen}
      onOpenChange={setTemplateModalOpen}
    />
    </>
  );
}

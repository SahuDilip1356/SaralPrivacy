"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Download } from "lucide-react";
import { TemplateDownloadModal } from "@/components/TemplateDownloadModal";
import { sectorNavLinks } from "@/lib/data/sectors";

// No badges here on purpose. Three gold "Free" chips plus "Daily" plus a
// "7 Indian languages" chip put five competing emphasis devices in 64px of
// chrome; "free" is now said once, in the hero trust line.
const navigation = [
  {
    label: "Data Discovery",
    href: "/discovery",
  },
  {
    label: "Data Flow",
    href: "/data-mapping",
  },
  {
    label: "Assessment",
    href: "/assessment",
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
      {/* The urgency strip that used to sit here said the same thing as the
          hero eyebrow 90px below it. The message now lives in the hero only.
          Removing it also removes the 32px of extra top padding <main> was
          carrying to clear it — see app/layout.tsx. */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group min-h-11 pointer-coarse:min-w-11">
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
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-green-800 bg-green-50"
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

          {/* One filled action in the chrome. Templates steps down to a text
              button; the guide keeps the fill because it is the one thing here
              that isn't already a nav link. */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 rounded-lg hover:text-navy-700 hover:bg-cloud-50 transition-colors"
            >
              <Download size={14} />
              Templates
            </button>
            <Link
              href="/white-paper#download"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold whitespace-nowrap bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              <Download size={14} />
              DPDPA Guide
            </Link>
            <button
              className="xl:hidden inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-slate-600 hover:text-slate-900"
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
                    ? "text-green-800 bg-green-50"
                    : "text-slate-700 hover:bg-cloud-50"
                )}
              >
                <span>{item.label}</span>
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
            <Link
              href="/white-paper#download"
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              <Download size={14} />
              DPDPA Guide
            </Link>
            <button
              onClick={() => { setMobileOpen(false); setTemplateModalOpen(true); }}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold border border-pearl-300 text-navy-700 rounded-lg hover:bg-cloud-50 transition-colors"
            >
              Download DPDPA Templates
            </button>
            <Link
              href="/contact"
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold border border-pearl-300 text-navy-700 rounded-lg hover:bg-cloud-50 transition-colors"
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

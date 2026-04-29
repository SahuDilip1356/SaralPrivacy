"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";

const navigation = [
  {
    label: "Daily Briefings",
    href: "/briefings",
  },
  {
    label: "DPDPA Guide",
    href: "/learn",
    children: [
      { label: "What is DPDPA?", href: "/learn/what-is-dpdpa" },
      { label: "Who Does It Apply To?", href: "/learn/applicability" },
      { label: "Key Terms Explained", href: "/learn/key-terms" },
      { label: "DPDPA Glossary (50+ Terms)", href: "/glossary" },
      { label: "Penalties Under DPDPA", href: "/penalty-calculator" },
      { label: "Consent Under DPDPA", href: "/learn/consent" },
      { label: "Rights of Individuals", href: "/learn/rights" },
      { label: "Data Breach Basics", href: "/learn/data-breach" },
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "Recruitment Agencies", href: "/industries/recruitment-agencies" },
      { label: "CA Firms", href: "/industries/ca-firms" },
      { label: "Training Institutes", href: "/industries/training-institutes" },
      { label: "D2C Brands", href: "/industries/d2c-brands" },
    ],
  },
  {
    label: "Assessment",
    href: "/assessment",
    badge: "Free",
  },
  {
    label: "Insights",
    href: "/blog",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
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
            <strong>DPDP Rules 2025 are now in effect.</strong>{" "}
            How ready is your business? Most Indian companies don&apos;t know yet.
          </span>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-green-600 transition-colors shrink-0"
          >
            Find out in 10 minutes — free →
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-green-600 bg-green-50"
                      : "text-slate-700 hover:text-navy-700 hover:bg-cloud-50"
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
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
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
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
          <div className="flex items-center gap-3">
            <Link
              href="/white-paper#download"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-navy-700 border border-navy-300 rounded-lg hover:bg-cloud-50 transition-colors"
            >
              White Paper
            </Link>
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Get Consultation
            </Link>
            <button
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
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
        <div className="lg:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-1 max-h-[80vh] overflow-y-auto">
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
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
            <Link
              href="/white-paper"
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-navy-700 border border-navy-300 rounded-lg"
            >
              Download White Paper
            </Link>
            <Link
              href="/contact"
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-lg"
            >
              Get Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Download, ArrowRight } from "lucide-react";
import { TemplateDownloadModal } from "@/components/TemplateDownloadModal";
import { surfaceClasses } from "@/components/ui/Surface";
import { navMenus, primaryAction, secondaryAction, type NavItem, type NavMenu } from "@/lib/data/navigation";
import { trackEvent } from "@/lib/analytics";

// No badges here on purpose. Three gold "Free" chips plus "Daily" plus a
// "7 Indian languages" chip put five competing emphasis devices in 64px of
// chrome; "free" is now said once, in the hero trust line.
//
// The IA itself lives in lib/data/navigation.ts, with a node --test suite
// asserting every href resolves to a real page. This file renders it.
//
// ── Why the triggers are <button>, not <Link>
//
// They used to be links with onMouseEnter/onMouseLeave and nothing else,
// which meant the menus could not be opened by keyboard at all: Tab focused
// the trigger, Enter navigated away, and the panel never appeared. There was
// no aria-expanded, no aria-haspopup, and no Escape. A button that owns
// aria-expanded is the disclosure pattern this actually is, and the section
// hub it used to link to is now the panel's featured item — reachable in one
// keystroke instead of being the only thing the trigger could do.

const MENU_CLOSE_DELAY_MS = 150;

/**
 * Hover-intent delay before a panel opens.
 *
 * Without it, dragging the pointer from the logo across to Resources flashes
 * Readiness, Tools and Industries open on the way — the "diagonal problem".
 * A trigger is ~90px wide, so a pointer crossing the bar at a normal 800+px/s
 * dwells under 110ms on each one; 120ms filters the pass-through while still
 * feeling immediate on a deliberate hover.
 *
 * It applies ONLY to the first open. Once a panel is up, moving along the bar
 * switches instantly — by then the reader is clearly browsing the menu, and a
 * delay there would feel broken rather than considered.
 */
const MENU_OPEN_DELAY_MS = 120;

/** Panel ids are derived once so trigger and panel always agree. */
const panelId = (label: string) => `nav-panel-${label.toLowerCase()}`;

/** Every grid item in a menu, flattened across its groups. */
const gridItems = (menu: NavMenu) => menu.groups.flatMap((g) => g.items);

/**
 * Tailwind needs the column count as a literal class, not an interpolation,
 * or the JIT never emits it. The nav test caps groups at four.
 */
const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Mirrors openMenu so the hover-intent path can read the current value
  // without taking it as a dependency — otherwise every open rebuilds the
  // handlers and the pending timer is cancelled by the re-render.
  const openMenuRef = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
  }, []);

  const open = useCallback(
    (label: string) => {
      clearTimers();
      openMenuRef.current = label;
      setOpenMenu((current) => {
        if (current !== label) trackEvent.navMenuOpen({ menu: label });
        return label;
      });
    },
    [clearTimers]
  );

  const close = useCallback(() => {
    clearTimers();
    openMenuRef.current = null;
    setOpenMenu(null);
  }, [clearTimers]);

  /** Hover only. Click and keyboard call `open` directly — those are intent. */
  const scheduleOpen = useCallback(
    (label: string) => {
      clearTimers();
      // Already browsing the menu: switch now, no delay.
      if (openMenuRef.current) {
        open(label);
        return;
      }
      openTimerRef.current = setTimeout(() => open(label), MENU_OPEN_DELAY_MS);
    },
    [clearTimers, open]
  );

  /** The pointer left a trigger before the intent delay elapsed. */
  const cancelScheduledOpen = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      openMenuRef.current = null;
      setOpenMenu(null);
    }, MENU_CLOSE_DELAY_MS);
  }, [clearTimers]);

  /** Escape closes and hands focus back to the trigger, per WAI-ARIA disclosure. */
  const closeAndRestoreFocus = useCallback(
    (label: string) => {
      close();
      triggerRefs.current[label]?.focus();
    },
    [close]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // `close()` rather than a bare setState: it also clears the pending timers.
  // A hover-intent timer that outlived a route change would pop a panel open
  // on the page the reader just navigated to.
  useEffect(() => {
    setMobileOpen(false);
    setMobileSection(null);
    close();
  }, [pathname, close]);

  // Clicking anywhere outside the bar closes an open panel. Without this the
  // panel survives a click on page content, because the only close paths were
  // mouseleave and route change.
  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openMenu, close]);

  // Allow any page CTA (e.g. TemplatesCTA component) to open the modal
  // by dispatching a "openTemplatesModal" CustomEvent — avoids prop-drilling
  // through server components.
  useEffect(() => {
    const handler = () => setTemplateModalOpen(true);
    window.addEventListener("openTemplatesModal", handler);
    return () => window.removeEventListener("openTemplatesModal", handler);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Lock the page behind the mobile drawer. Without this, scrolling inside the
  // drawer scrolls the page underneath once the drawer's own list hits its
  // end — on a 26-screen homepage that reads as the drawer being broken.
  //
  // `position: fixed` on body rather than `overflow: hidden`: iOS Safari
  // ignores overflow-hidden on body, and the fixed approach also has to
  // restore the scroll offset by hand, since fixing the body drops it to 0.
  useEffect(() => {
    if (!mobileOpen) return;
    const y = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      // `behavior: "instant"` is load-bearing, not decoration. globals.css sets
      // `html { scroll-behavior: smooth }`, which makes the two-argument
      // scrollTo() animate over ~600ms — so closing the drawer would slide the
      // page back to where it already was, which is the exact jump this lock
      // exists to hide. Restoring an offset is not navigation; it must not
      // animate.
      window.scrollTo({ top: y, behavior: "instant" });
    };
  }, [mobileOpen]);

  /** Move focus between triggers with the arrow keys, wrapping at both ends. */
  function focusTriggerByOffset(label: string, offset: number) {
    const i = navMenus.findIndex((m) => m.label === label);
    const next = navMenus[(i + offset + navMenus.length) % navMenus.length];
    triggerRefs.current[next.label]?.focus();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, menu: NavMenu) {
    switch (e.key) {
      case "Escape":
        if (openMenu === menu.label) {
          e.preventDefault();
          closeAndRestoreFocus(menu.label);
        }
        break;
      case "ArrowDown": {
        e.preventDefault();
        open(menu.label);
        // The panel mounts on state change, so defer the focus a frame.
        requestAnimationFrame(() => {
          document
            .getElementById(panelId(menu.label))
            ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
            ?.focus();
        });
        break;
      }
      case "ArrowRight":
        e.preventDefault();
        focusTriggerByOffset(menu.label, 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTriggerByOffset(menu.label, -1);
        break;
    }
  }

  function handleItemActivate(menu: string, item: NavItem) {
    trackEvent.navItemClick({ menu, item: item.label });
    close();
    if (item.action === "templates") setTemplateModalOpen(true);
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  /** A menu counts as current when any of its destinations is the open page. */
  const menuIsActive = (menu: NavMenu) =>
    [menu.featured, ...gridItems(menu)].some((i) => !i.comingSoon && isActive(i.href));

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || openMenu
            ? "bg-white border-b border-slate-200 shadow-sm"
            : "bg-white/95 backdrop-blur-sm border-b border-slate-100"
        )}
      >
        <div ref={navRef} onMouseLeave={scheduleClose}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 gap-2">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2.5 group min-h-11 pointer-coarse:min-w-11 shrink-0"
              >
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
                    <span className="text-green-500">saral</span>
                    <span className="text-navy-700">Privacy</span>
                  </div>
                  <div className="text-[10px] text-navy-700 leading-tight tracking-wide">
                    Privacy Made Practical for India
                  </div>
                </div>
              </Link>

              {/* Desktop bar.
                  Now `lg`, not `xl`. Seven top-level items previously measured
                  0px of slack at 1024-1279px, so that whole band — most work
                  laptops — got the hamburger. Four menus give the row roughly
                  190px back, which is what buys the breakpoint. */}
              <nav
                className="hidden lg:flex items-center gap-0.5 xl:gap-1"
                aria-label="Main"
              >
                {navMenus.map((menu) => {
                  const isOpen = openMenu === menu.label;
                  return (
                    <div
                      key={menu.label}
                      className="relative"
                      onPointerEnter={(e) => {
                        // Guard on mouse: on touch, pointerenter fires with the
                        // tap and would open the panel a frame before the click
                        // handler toggles it shut again.
                        if (e.pointerType === "mouse") scheduleOpen(menu.label);
                      }}
                      onPointerLeave={(e) => {
                        // The pointer was only passing through. Drop the pending
                        // open; the panel-close path is handled by the bar's own
                        // onMouseLeave so a hover into the panel still survives.
                        if (e.pointerType === "mouse") cancelScheduledOpen();
                      }}
                    >
                      <button
                        type="button"
                        ref={(el) => {
                          triggerRefs.current[menu.label] = el;
                        }}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        aria-controls={panelId(menu.label)}
                        onClick={() => (isOpen ? close() : open(menu.label))}
                        onKeyDown={(e) => onTriggerKeyDown(e, menu)}
                        className={cn(
                          // px-2 at lg, px-3 from xl. Adding the Insights menu
                          // cost the 1024px row about 93px and dropped its
                          // slack to 19px — under the 24px floor the
                          // acceptance script enforces. Four triggers at
                          // px-2 instead of px-2.5 hand back ~32px, which
                          // clears the floor without hiding the guide link or
                          // pushing the bar back up to the xl breakpoint.
                          // Invisible at that width; xl is unchanged.
                          "flex items-center gap-1 whitespace-nowrap px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
                          isOpen || menuIsActive(menu)
                            ? "text-green-800 bg-green-50"
                            : "text-slate-700 hover:text-navy-700 hover:bg-cloud-50"
                        )}
                      >
                        {menu.label}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </nav>

              {/* Actions. Exactly one filled button, and it is the assessment.
                  The guide used to carry the fill, which put two green CTAs
                  above the fold competing for the same click. */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={secondaryAction.href}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 pointer-coarse:min-h-11 text-sm font-medium whitespace-nowrap text-slate-700 rounded-lg hover:text-navy-700 hover:bg-cloud-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
                >
                  <Download size={14} />
                  {secondaryAction.label}
                </Link>
                <Link
                  href={primaryAction.href}
                  onClick={() => trackEvent.navItemClick({ menu: "chrome", item: primaryAction.label })}
                  className="hidden sm:inline-flex items-center px-4 py-2 pointer-coarse:min-h-11 text-sm font-semibold whitespace-nowrap bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
                >
                  {primaryAction.label}
                </Link>
                <button
                  className="lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded-lg"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-nav"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mega panels live outside the flex row so they can span the bar's
              full container width rather than hang off one trigger. Rendering
              all four and hiding the closed ones would put every link in the
              tab order at once, so only the open one mounts. */}
          {navMenus.map((menu) =>
            openMenu === menu.label ? (
              <MegaPanel
                key={menu.label}
                menu={menu}
                onEscape={() => closeAndRestoreFocus(menu.label)}
                onActivate={(item) => handleItemActivate(menu.label, item)}
                isActive={isActive}
              />
            ) : null
          )}
        </div>

        {/* Mobile drawer — the desktop panels as accordions. */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="lg:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-1 max-h-[80vh] overflow-y-auto"
          >
            {navMenus.map((menu) => {
              const expanded = mobileSection === menu.label;
              return (
                <div key={menu.label}>
                  <button
                    type="button"
                    onClick={() => setMobileSection(expanded ? null : menu.label)}
                    aria-expanded={expanded}
                    aria-controls={`m-${panelId(menu.label)}`}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2.5 min-h-11 rounded-lg text-sm font-medium transition-colors",
                      expanded ? "text-green-800 bg-green-50" : "text-slate-700 hover:bg-cloud-50"
                    )}
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      size={16}
                      className={cn("transition-transform duration-200", expanded && "rotate-180")}
                    />
                  </button>

                  {expanded && (
                    <div id={`m-${panelId(menu.label)}`} className="ml-3 mt-1 space-y-0.5">
                      <MobileItem
                        item={menu.featured}
                        featured
                        onActivate={() => {
                          handleItemActivate(menu.label, menu.featured);
                          setMobileOpen(false);
                        }}
                      />
                      {/* The drawer carries the same groups as the panel. It
                          used to flatten them into one list, so the drawer and
                          the desktop bar described the site differently. */}
                      {menu.groups.map((group) => (
                        <div key={group.heading} className="pt-2">
                          <h3 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {group.heading}
                          </h3>
                          {group.items.map((item) => (
                            <MobileItem
                              key={item.label + item.href}
                              item={item}
                              onActivate={() => {
                                handleItemActivate(menu.label, item);
                                setMobileOpen(false);
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href={primaryAction.href}
                onClick={() => trackEvent.navItemClick({ menu: "chrome", item: primaryAction.label })}
                className="flex w-full items-center justify-center px-4 py-2.5 min-h-11 text-sm font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                {primaryAction.label}
              </Link>
              <Link
                href={secondaryAction.href}
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 min-h-11 text-sm font-semibold border border-pearl-300 text-navy-700 rounded-lg hover:bg-cloud-50 transition-colors"
              >
                <Download size={14} />
                {secondaryAction.label}
              </Link>
              <Link
                href="/contact"
                className="flex w-full items-center justify-center px-4 py-2.5 min-h-11 text-sm font-semibold border border-pearl-300 text-navy-700 rounded-lg hover:bg-cloud-50 transition-colors"
              >
                Get Consultation
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Template download modal — mounted outside <header> to avoid z-index conflicts */}
      <TemplateDownloadModal open={templateModalOpen} onOpenChange={setTemplateModalOpen} />
    </>
  );
}

/* ── Desktop mega panel ──────────────────────────────────────────────────── */

function MegaPanel({
  menu,
  onEscape,
  onActivate,
  isActive,
}: {
  menu: NavMenu;
  onEscape: () => void;
  onActivate: (item: NavItem) => void;
  isActive: (href: string) => boolean;
}) {
  // Descriptions are all-or-nothing per menu (asserted in the test suite), so
  // one probe decides the grid's density for the whole panel.
  const described = gridItems(menu)[0]?.description !== "";

  return (
    <div
      id={panelId(menu.label)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onEscape();
        }
      }}
      className="hidden lg:block absolute left-0 right-0 top-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className={cn(surfaceClasses("raised"), "overflow-hidden", "sp-panel-in")}>
          {/* Featured — the panel's one lead. Sits in a well so it reads as
              the ground the rest of the menu stands on, not another card. */}
          <Link
            href={menu.featured.href}
            onClick={() => onActivate(menu.featured)}
            className={cn(
              surfaceClasses("sunken", { flush: true }),
              "group block border-0 border-b px-6 py-5 transition-colors hover:bg-cloud-200/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700"
            )}
          >
            <span className="inline-flex items-center gap-2 text-base font-semibold text-navy-700">
              {menu.featured.label}
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
            <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-slate-600">
              {menu.featured.description}
            </span>
          </Link>

          {/* One column per group. The old grid flowed a flat item list into a
              declared column count, which is what left Readiness and Tools
              with an empty fourth cell: three items never fill a 2x2. Columns
              derived from the groups cannot disagree with their contents. */}
          <div
            className={cn(
              "grid gap-x-8 px-6 py-5 items-start",
              COLS[menu.groups.length] ?? "grid-cols-2"
            )}
          >
            {menu.groups.map((group) => (
              <div key={group.heading}>
                {/* The heading names the reader's intent. It is not a link:
                    a clickable column header competes with the items under
                    it for the same glance. */}
                {/* text-xs, not text-2xs: `text-2xs` is used elsewhere in this
                    file but is not defined by the v4 @theme in globals.css and
                    emits no rule, so it silently renders at the inherited
                    size. See the note on the coming-soon chips below. */}
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.heading}
                </h3>
                <div className={cn("grid", described ? "gap-y-5" : "gap-y-1")}>
                  {group.items.map((item) => (
                    <PanelItem
                      key={item.label + item.href}
                      item={item}
                      described={described}
                      current={!item.comingSoon && isActive(item.href)}
                      onActivate={() => onActivate(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelItem({
  item,
  described,
  current,
  onActivate,
}: {
  item: NavItem;
  described: boolean;
  current: boolean;
  onActivate: () => void;
}) {
  // A menu entry that navigates nowhere is worse than no entry at all, so
  // coming-soon renders as inert text — not a link, not in the tab order.
  if (item.comingSoon) {
    // slate-500 (4.76:1 on white), not slate-400 (2.56:1). "De-emphasised"
    // and "unreadable" are different things, and the design-lint ratchet
    // caught the first draft of this doing the second. The chip takes
    // slate-600 because slate-500 drops to 4.23:1 on the cloud-100 fill.
    return (
      <div className="cursor-not-allowed">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          {item.label}
          <span className="rounded-full bg-cloud-100 px-2 py-0.5 text-2xs font-medium text-slate-600">
            Coming soon
          </span>
        </span>
        {described && (
          <span className="mt-0.5 block text-sm leading-snug text-slate-500">
            {item.description}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onActivate}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
    >
      <span
        className={cn(
          "block text-sm font-semibold transition-colors",
          current ? "text-green-800" : "text-navy-700 group-hover:text-green-800"
        )}
      >
        {item.label}
      </span>
      {described && (
        <span className="mt-0.5 block text-sm leading-snug text-slate-600">
          {item.description}
        </span>
      )}
    </Link>
  );
}

/* ── Mobile accordion row ────────────────────────────────────────────────── */

function MobileItem({
  item,
  featured = false,
  onActivate,
}: {
  item: NavItem;
  featured?: boolean;
  onActivate: () => void;
}) {
  if (item.comingSoon) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 min-h-11 text-sm text-slate-500">
        {item.label}
        <span className="rounded-full bg-cloud-100 px-2 py-0.5 text-2xs font-medium text-slate-600">
          Coming soon
        </span>
      </div>
    );
  }

  // The drawer used to render bare labels while the desktop panel carried a
  // description under each one — so the exact ambiguity descriptions exist to
  // resolve ("Data flow maps" vs "Data discovery") came back on the smaller
  // screen, where there is less context to recover it from. Same copy, both
  // places. Industries opts out of descriptions wholesale, so its rows stay
  // single-line here too.
  const described = item.description.length > 0;

  return (
    <Link
      href={item.href}
      onClick={onActivate}
      className={cn(
        "flex flex-col justify-center px-3 py-2 min-h-11 rounded-lg text-sm transition-colors hover:bg-cloud-50",
        featured ? "font-semibold text-navy-700" : "text-slate-600 hover:text-navy-700"
      )}
    >
      <span>{item.label}</span>
      {described && (
        <span className="mt-0.5 text-xs leading-snug text-slate-500">
          {item.description}
        </span>
      )}
    </Link>
  );
}

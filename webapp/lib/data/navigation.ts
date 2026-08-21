// Relative, not "@/lib/...": this module is covered by a node --test suite,
// and the alias does not resolve under --experimental-strip-types. Every
// other tested file under lib/ follows the same rule.
import { sectorNavLinks } from "./sectors.ts";

/**
 * The header information architecture, as data.
 *
 * It lives apart from Header.tsx so the route contract can be reviewed — and
 * tested — without reading the rendering. Every `href` here is asserted to
 * exist by `lib/data/__tests__/navigation.test.ts`; a typo'd path fails the
 * suite rather than shipping a 404 into the chrome.
 *
 * ── Why four menus
 *
 * The previous bar carried seven top-level items mixing three taxonomies at
 * one altitude: tools (Data Discovery, Data Flow, Assessment), an audience
 * (Industries), and content (Learn DPDPA, Briefings, Blog). Nothing told the
 * reader which kind of thing they were choosing between, so the bar had to be
 * read rather than scanned. The four below are questions a visitor actually
 * arrives with:
 *
 *   Readiness   where do I stand?
 *   Tools       help me do the work
 *   Industries  show me my sector
 *   Resources   help me understand it
 *
 * Seven items also forced the desktop bar to `xl` (1280px), which handed every
 * 1024–1279px laptop a hamburger. Four fit at `lg`.
 *
 * ── Why every item carries a description
 *
 * "Data Flow" and "Data Discovery" are indistinguishable as bare labels; the
 * reader cannot tell which one finds data and which one charts it without
 * clicking one and going back. A one-line description is the difference
 * between a menu that answers the question and a menu that defers it.
 */

export type NavItem = {
  label: string;
  href: string;
  /** One line, sentence case, says what the thing does — not what it is. */
  description: string;
  /**
   * Renders inert with a "Coming soon" tag. A menu entry that navigates
   * nowhere is worse than no entry; this makes the promise without the 404.
   */
  comingSoon?: boolean;
  /** Opens the templates modal instead of navigating. */
  action?: "templates";
};

export type NavMenu = {
  label: string;
  /**
   * The panel's lead item, given the full-width slot. Exactly one per menu:
   * a "featured" section with three peers in it features nothing.
   */
  featured: NavItem;
  items: NavItem[];
  /** Columns for the item grid. Three only when the list is long enough. */
  columns: 2 | 3;
  /** Optional trailing link out to the section hub. */
  viewAll?: { label: string; href: string };
};

export const navMenus: NavMenu[] = [
  {
    label: "Readiness",
    columns: 2,
    featured: {
      label: "Quick readiness assessment",
      href: "/assessment",
      description:
        "A free five-minute check across the DPDPA obligations that actually apply to your business.",
    },
    items: [
      {
        label: "Deep assessment",
        href: "/assessment",
        description: "A full control-by-control review, 25 questions deep.",
        comingSoon: true,
      },
      {
        label: "Compliance checklist",
        href: "/compliance-checklist",
        description: "The steps that close your gaps, in the order worth doing them.",
      },
      {
        label: "Penalty calculator",
        href: "/penalty-calculator",
        description: "What a breach would actually cost you under the Act.",
      },
    ],
  },
  {
    label: "Tools",
    columns: 2,
    // Data flow maps takes the featured slot: it is the deepest thing on the
    // site and the one users arrive without knowing they need.
    featured: {
      label: "Data flow maps",
      href: "/data-mapping",
      description:
        "Chart where personal data enters your business, where it moves, and who it reaches.",
    },
    items: [
      {
        label: "Data discovery",
        href: "/discovery",
        description: "Find the personal data you are already holding, system by system.",
      },
      {
        label: "Privacy notice generator",
        href: "/tools/dpdpa-privacy-notice-generator",
        description: "Produce a DPDPA-ready privacy notice for your business.",
      },
      {
        label: "DPDPA templates",
        href: "/resources",
        description: "Consent forms, notices and registers, ready to adapt.",
        action: "templates",
      },
    ],
  },
  {
    label: "Industries",
    columns: 3,
    featured: {
      label: "All industries",
      href: "/industries",
      description:
        "Same law, different data. Twelve sectors, each with its own risks and its own fixes.",
    },
    items: sectorNavLinks.map((s) => ({
      label: s.label,
      href: s.href,
      // The sector grid is twelve items; a description on each would turn the
      // panel into a page. The labels are self-evident here in a way that
      // "Data Flow" was not.
      description: "",
    })),
  },
  {
    label: "Resources",
    columns: 2,
    featured: {
      label: "Learn DPDPA",
      href: "/learn",
      description:
        "Plain-English explanations of the Act, the Rules, and what they ask of you.",
    },
    items: [
      {
        label: "DPDP Act 2023",
        href: "/learn/dpdp-act-2023",
        description: "The full text, annotated in plain language.",
      },
      {
        label: "DPDP Rules 2025",
        href: "/learn/dpdp-rules-2025-plain-english-guide",
        description: "What the notified Rules changed, and what they now require.",
      },
      {
        label: "Daily briefings",
        href: "/briefings",
        description: "What moved in Indian privacy today, in under two minutes.",
      },
      {
        label: "Blog",
        href: "/blog",
        description: "Longer pieces on doing privacy work in an Indian business.",
      },
      {
        label: "Glossary",
        href: "/glossary",
        description: "Fifty-plus DPDPA terms, defined without the legalese.",
      },
      {
        label: "FAQ",
        href: "/faq",
        description: "The questions business owners actually ask us.",
      },
    ],
  },
];

/**
 * The quiet secondary action. It used to be a filled green button, which put
 * two filled greens above the fold and split the one decision the page is
 * asking for. The guide is worth offering and is not worth outshouting the
 * assessment.
 */
export const secondaryAction = {
  label: "DPDPA Guide",
  href: "/white-paper#download",
};

/** The single filled action in the chrome. There is exactly one, deliberately. */
export const primaryAction = {
  label: "Take free assessment",
  href: "/assessment",
};

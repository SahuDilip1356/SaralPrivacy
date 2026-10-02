// Relative, not "@/lib/...": this module is covered by a node --test suite,
// and the alias does not resolve under --experimental-strip-types. Every
// other tested file under lib/ follows the same rule.
import { sectorNavLinks } from "./sectors.ts";

/**
 * The header information architecture, as data.
 *
 * It lives apart from Header.tsx so the route contract can be reviewed — and
 * tested — without reading the rendering. Every `href` here is asserted to
 * exist by `lib/data/navigation.test.ts`; a typo'd path fails the suite rather
 * than shipping a 404 into the chrome.
 *
 * ── Why menus carry groups, not a flat list
 *
 * The previous model was `featured` plus a flat `items: NavItem[]`, with a
 * `columns: 2 | 3` hint for the grid. That gave every panel the same structural
 * treatment regardless of what was in it, and the result was skewed four ways:
 *
 *   Readiness   3 items in a 2-col grid — one empty cell, ragged bottom-right
 *   Tools       3 items in a 2-col grid — the same empty cell
 *   Industries  12 items, no descriptions, gap-y-1 — a dense wall
 *   Resources   6 items mixing four different kinds with nothing to say so
 *
 * Density ran backwards: the panel with the most items was the only one with
 * no descriptions, so the fullest menu read as the tightest. And the four
 * triggers looked identical in weight while the payload behind them varied 4x.
 *
 * Groups fix the cause rather than the symptom. A group is a column with a
 * heading that names the reader's intent, so twelve sectors become four
 * scannable triads and Resources stops asking the reader to infer that a hub,
 * a feed and a lookup are different kinds of thing.
 *
 * ── Which four menus
 *
 * The bar follows how people look for help, in the order they usually need it:
 *
 *   Learn DPDPA  I am new to this — explain the law and answer my question
 *   Industries   show me my sector
 *   Tools        give me something to use on my own business
 *   Updates      what is new since I last looked
 *
 * The previous bar was Compliance · Industries · Insights · Resources, with
 * "Learn DPDPA" hidden as the featured item inside Resources. The site's main
 * subject was one click deeper than its tools. A fifth chip, Professionals
 * (for CAs, legal and IT professionals), is planned; it waits until those
 * landing pages exist, because a menu of links to nothing is worse than none.
 *
 * ── On the destinations that appear here and in lib/learnNav.ts
 *
 * /penalty-calculator, /glossary and /compliance-checklist are each reachable
 * from this bar AND listed as topics in learnNav's 17-entry reading order.
 * That is deliberate, not drift: the header is wayfinding ("what can I do
 * here?"), learnNav is a reading order through the Act ("what comes next?").
 * The same page legitimately holds a place in both. What was wrong before was
 * that neither file said so. Those three entries in learnNav carry an explicit
 * `href` precisely because they leave /learn/[topic]; that flag is the seam,
 * and it is documented on both sides now.
 *
 * ── Why every item carries a description
 *
 * "Data flow maps" and "Data discovery" are indistinguishable as bare labels;
 * the reader cannot tell which one finds data and which one charts it without
 * clicking one and going back. A one-line description is the difference
 * between a menu that answers the question and a menu that defers it.
 *
 * The sector grid is the one exception, and it opts out wholesale rather than
 * half-describing itself: twelve descriptions would turn the panel into a
 * page, and the sector labels are self-evident in a way that "Data flow" is
 * not. The all-or-none rule is asserted per menu in the test suite.
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
  /**
   * Icon name for tile menus, resolved to a lucide icon in Header.tsx. A
   * string, not a component: this module is tested under plain node, which
   * cannot load React.
   */
  icon?: string;
};

/**
 * One column of a panel. The heading names what the reader is trying to do,
 * not what the items are — "Assess where you stand" beats "Assessments".
 */
export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export type NavMenu = {
  label: string;
  /**
   * The panel's lead item, given the full-width slot. Exactly one per menu:
   * a "featured" section with three peers in it features nothing.
   */
  featured: NavItem;
  /**
   * Columns, in order. The count is the column count — the grid is derived
   * from the content rather than declared alongside it, which is what let the
   * old `columns: 2` disagree with a 3-item list and leave a hole.
   */
  groups: NavGroup[];
  /**
   * "tiles" renders the panel as a grid of icon tiles (Dilip's 2026-10-02
   * review) instead of headed text columns. Worth it only for a small set of
   * peers a reader picks between — Tools and Industries. Learn (reference,
   * nine entries) and Updates (three) stay lists: tiles would make Learn
   * twice as tall and add nothing to three links.
   */
  layout?: "tiles";
};

export const navMenus: NavMenu[] = [
  {
    // Learn used to be the featured item of a menu called "Resources", so the
    // site's main subject was one click deeper than its own tools. It is the
    // first chip now: most visitors arrive not knowing the Act yet, and this
    // is where they start.
    label: "Learn DPDPA",
    featured: {
      label: "Start with the basics",
      href: "/learn",
      description:
        "Plain-English explanations of the Act, the Rules, and what they ask of you.",
    },
    groups: [
      {
        heading: "Understand the law",
        items: [
          {
            label: "Does it apply to me?",
            href: "/learn/applicability",
            description: "Who the Act covers, and the few cases it does not.",
          },
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
            // Was "Penalty calculator" under Compliance. It explains the Act's
            // penalty schedule rather than assessing the reader's business, so
            // it belongs with the reference material.
            label: "Penalties explained",
            href: "/penalty-calculator",
            description: "The Act's penalty schedule, and how it is applied.",
          },
        ],
      },
      {
        heading: "Get answers",
        items: [
          {
            // Was the standalone "DPDPA Guide" chip beside the primary action.
            label: "Complete DPDPA guide",
            href: "/white-paper",
            description: "The whole Act in one guide, in seven Indian languages.",
          },
          {
            label: "FAQ",
            href: "/faq",
            description: "The questions business owners actually ask us.",
          },
          {
            label: "Glossary",
            href: "/glossary",
            description: "Fifty-plus DPDPA terms, defined without the legalese.",
          },
          {
            label: "Get help",
            href: "/contact",
            description: "Ask a question about your own situation and get a considered answer.",
          },
        ],
      },
    ],
  },
  {
    label: "Industries",
    layout: "tiles",
    featured: {
      label: "All industries",
      href: "/industries",
      description:
        "Same law, different data. Twelve sectors, each with its own risks and its own fixes.",
    },
    // Four triads rather than one twelve-item wall. The grouping is not
    // cosmetic: DPDPA exposure clusters this way — regulated financial and
    // legal data, health data under the SPDI overlap, minors' data in
    // education, and high-volume consumer data. A reader scanning for their
    // own sector finds it in a group of three, not a list of twelve.
    groups: sectorGroups(),
  },
  {
    // Was "Compliance". The label described an outcome; the menu holds things
    // you use. "Deep assessment (coming soon)" is gone — a primary menu is not
    // the place for a promise.
    label: "Tools",
    layout: "tiles",
    featured: {
      label: "Check readiness",
      href: "/assessment",
      icon: "clipboard-check",
      description:
        "A free five-minute check across the DPDPA obligations that actually apply to your business.",
    },
    groups: [
      {
        heading: "Understand your data",
        items: [
          {
            label: "Discover personal data",
            href: "/discovery",
            icon: "search",
            description: "Identify the personal data your business already holds.",
          },
          {
            label: "Explore data-flow maps",
            href: "/data-mapping",
            icon: "route",
            description: "See how information moves through a business like yours.",
          },
        ],
      },
      {
        heading: "Take the next step",
        items: [
          {
            label: "Draft a privacy notice",
            href: "/tools/dpdpa-privacy-notice-generator",
            icon: "file-text",
            description: "Prepare a DPDPA notice draft for review.",
          },
          {
            label: "Compliance checklist",
            href: "/compliance-checklist",
            icon: "list-checks",
            description: "The steps that close your gaps, in the order worth doing them.",
          },
          {
            label: "DPDPA templates",
            href: "/resources",
            icon: "files",
            description: "Consent forms, notices and registers, ready to adapt.",
            action: "templates",
          },
        ],
      },
    ],
  },
  {
    // Was "Insights". Media coverage and the press wall left for the footer:
    // they are about SaralPrivacy, not about the law, and the footer already
    // links /media. A single combined Updates page would let this become a
    // plain link; until one exists it stays a small menu.
    label: "Updates",
    featured: {
      label: "Daily briefings",
      href: "/briefings",
      description: "What moved in Indian privacy today, in under two minutes.",
    },
    groups: [
      {
        heading: "Keep reading",
        items: [
          {
            label: "Briefings archive",
            href: "/briefings/all",
            description: "Every briefing so far, searchable.",
          },
          {
            label: "Blog",
            href: "/blog",
            description: "Longer pieces on doing privacy work in an Indian business.",
          },
        ],
      },
    ],
  },
];

/**
 * The twelve sectors, grouped. Derived from `sectorNavLinks` so the labels and
 * hrefs still have exactly one source of truth — this function only decides
 * which group each slug belongs to, and fails loudly if the taxonomy changes
 * underneath it.
 */
function sectorGroups(): NavGroup[] {
  const GROUPS: { heading: string; slugs: string[] }[] = [
    {
      heading: "Finance & legal",
      slugs: ["ca-firms", "law-firms", "fintech-nbfc"],
    },
    {
      heading: "Health & wellness",
      slugs: ["clinics-diagnostic-labs", "pharmacies", "gyms-salons-spas"],
    },
    {
      heading: "Education & people",
      slugs: ["schools-colleges", "training-institutes", "recruitment-agencies"],
    },
    {
      heading: "Consumer & property",
      slugs: ["d2c-brands", "hotels-travel", "real-estate"],
    },
  ];

  const bySlug = new Map(
    sectorNavLinks.map((s) => [s.href.replace("/industries/", ""), s])
  );

  return GROUPS.map((g) => ({
    heading: g.heading,
    items: g.slugs.map((slug) => {
      const link = bySlug.get(slug);
      // A sector renamed or removed in sectors.ts would otherwise vanish from
      // the menu silently. The nav test asserts the total is still twelve.
      if (!link) throw new Error(`nav: unknown sector slug "${slug}"`);
      return {
        label: link.label,
        href: link.href,
        // The same icon /industries and the homepage sector wall use.
        icon: slug,
        // The sector grid opts out of descriptions wholesale — see the note
        // at the top of this file.
        description: "",
      };
    }),
  }));
}

/**
 * The quiet secondary action. It used to be a filled green button, which put
 * two filled greens above the fold and split the one decision the page is
 * asking for. The guide is worth offering and is not worth outshouting the
 * assessment. It also appears inside Learn DPDPA as "Complete DPDPA guide":
 * the chip is the download shortcut, the menu entry is where it belongs.
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

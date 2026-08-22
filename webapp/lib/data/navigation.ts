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
 * ── Why three menus, not four
 *
 * "Readiness" and "Tools" claimed to split on "where do I stand?" versus "help
 * me do the work", but the line did not hold: the penalty calculator is a tool
 * that answers where you stand, the compliance checklist is work, and data
 * discovery tells you where you stand. Three of six items sat on the wrong
 * side, and the split bought two half-empty panels for a distinction the
 * content did not honour.
 *
 * They are now one menu whose groups follow the actual sequence of the work —
 * Assess, then Map, then Act. The scent words the split was protecting survive
 * as group headings, which is where they were doing the work anyway.
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
};

export const navMenus: NavMenu[] = [
  {
    label: "Compliance",
    featured: {
      label: "Quick readiness assessment",
      href: "/assessment",
      description:
        "A free five-minute check across the DPDPA obligations that actually apply to your business.",
    },
    groups: [
      {
        heading: "Assess",
        items: [
          {
            label: "Deep assessment",
            href: "/assessment",
            description: "A full control-by-control review, 25 questions deep.",
            comingSoon: true,
          },
          {
            label: "Penalty calculator",
            href: "/penalty-calculator",
            description: "What a breach would actually cost you under the Act.",
          },
        ],
      },
      {
        heading: "Map",
        items: [
          {
            label: "Data flow maps",
            href: "/data-mapping",
            description:
              "Chart where personal data enters your business, where it moves, and who it reaches.",
          },
          {
            label: "Data discovery",
            href: "/discovery",
            description: "Find the personal data you are already holding, system by system.",
          },
        ],
      },
      {
        heading: "Act",
        items: [
          {
            label: "Compliance checklist",
            href: "/compliance-checklist",
            description: "The steps that close your gaps, in the order worth doing them.",
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
    ],
  },
  {
    label: "Industries",
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
    label: "Resources",
    featured: {
      label: "Learn DPDPA",
      href: "/learn",
      description:
        "Plain-English explanations of the Act, the Rules, and what they ask of you.",
    },
    groups: [
      {
        heading: "Learn the law",
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
            label: "Glossary",
            href: "/glossary",
            description: "Fifty-plus DPDPA terms, defined without the legalese.",
          },
        ],
      },
      {
        heading: "Keep up",
        items: [
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
        ],
      },
      {
        heading: "Get answers",
        items: [
          {
            label: "FAQ",
            href: "/faq",
            description: "The questions business owners actually ask us.",
          },
          {
            // Was reachable only from the mobile drawer ("Get Consultation"),
            // so desktop and mobile shipped different IA. It belongs in both.
            label: "Talk to us",
            href: "/contact",
            description: "Ask a question about your own situation and get a considered answer.",
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

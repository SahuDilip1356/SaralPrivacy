import { cn } from "@/lib/utils";

/**
 * The page-rhythm primitive.
 *
 * ── Why this exists in this shape ────────────────────────────────────────────
 * W1.3 put every beat on one canvas at a uniform py-24 and moved rhythm to
 * "silhouette" — a padding ladder. The ladder was specified and never enforced,
 * so the homepage drifted to ten consecutive cloud-50 sections at
 * 16/16/32/24/16/16/20/10/20/20, with the only two dark bands at the very top
 * and the very bottom. It read as one flat wash.
 *
 * The measured position, across the whole light ramp:
 *
 *   white ↔ cloud-50    1.05:1      invisible — this is what we had
 *   white ↔ cloud-100   1.12:1      still invisible
 *   white ↔ cloud-200   1.28:1      readable — and it is the exact ratio
 *                                   Surface already trusts as a card hairline
 *   white ↔ cloud-300   1.59:1      heavy for a full-width band
 *   white ↔ navy-700   17.31:1      the chapter break
 *
 * So W1.3 was right that cloud-50 cannot separate sections, and wrong to
 * generalise that to the whole ramp. WCAG ratios are calibrated for small-text
 * legibility; area discrimination is an easier task, and a 1.28:1 boundary
 * running the full viewport width is legible where 1.28:1 on 14px type is not.
 *
 * Hence three surfaces, and a division of labour:
 *
 *   FILL     marks the group      navy = chapter, white ↔ deep = sub-group
 *   PADDING  marks the beat       the type ladder below
 *   HAIRLINE marks the boundary   between two beats that share a fill
 *
 * That is why adjacent sections are allowed to share a fill: two sections that
 * are genuinely one thought (the demo pair, the reference pair) should read as
 * one tray, separated by a hairline and a padding step rather than by a flip.
 * Flipping every section is the 1.05:1 zebra W1.3 killed, just louder.
 *
 * ── Enforcement ──────────────────────────────────────────────────────────────
 * `scripts/design-lint.sh` carries a `section-rhythm` rule: two adjacent light
 * homepage sections may not share a padding type. A primitive nothing enforces
 * gets zero adoption — that was this file's first outing.
 */

export type SectionSurface = "white" | "deep" | "navy";

/**
 * What the section is FOR. Padding follows from the job, not from taste, so the
 * ladder survives someone reordering the page.
 */
export type SectionType =
  /** a held breath — narrow, large type, no cards */
  | "statement"
  /** a product moment — the visual leads */
  | "demo"
  /** reference material — quiet */
  | "utility"
  /** receipts — dense, tight */
  | "evidence"
  /** a fork in the road — one line, one action */
  | "decision"
  /** a proof strip — thinner than any beat, never carries a heading */
  | "rail";

/**
 * Ink rules per surface — the deep fill is 1.28:1 darker than white, which is
 * enough to push two inks off AA. Measured:
 *
 *   green-700  5.48:1 on white → 4.29:1 on deep   FAILS. Use green-800 (6.01:1).
 *   slate-400  3.62:1 on white → 2.00:1 on deep   FAILS, as it does on any
 *                                                 light fill (see the
 *                                                 muted-text-on-light rule).
 *
 * Everything else clears: slate-600 5.92:1, slate-700 8.10:1, navy-700 13.54:1,
 * teal-800 5.81:1, gold-700 4.62:1.
 */
const surfaceClasses: Record<SectionSurface, string> = {
  white: "bg-cloud-25 text-slate-700",
  deep: "bg-cloud-200 text-slate-700",
  navy: "bg-navy-700 text-cloud-100",
};

// Compressed one notch from the original 128/96/80/64/64/40 after founder
// review: at the old values, every section boundary at a 900px viewport showed
// nothing but empty ground — which read as "the page faded out", not as
// breathing room. The LADDER survives (each type still steps down, the rhythm
// lint still bites); only the absolute scale changed. Scroll-pull now comes
// from the next section peeking into the current viewport, not from air.
const typePadding: Record<SectionType, string> = {
  statement: "py-24",
  demo: "py-20",
  utility: "py-16",
  evidence: "py-14",
  decision: "py-14",
  rail: "py-6",
};

const widthClasses = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

interface SectionProps {
  children: React.ReactNode;
  surface?: SectionSurface;
  type?: SectionType;
  width?: keyof typeof widthClasses;
  /**
   * Hairline above the section. Only meaningful when this section shares its
   * fill with the one above — a fill change already IS the boundary. Never
   * renders on navy, where 17.31:1 makes a 1.28:1 line meaningless.
   */
  divider?: boolean;
  /** Drop the max-width container when a child needs to bleed full-width. */
  bleed?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function Section({
  children,
  surface = "white",
  type = "utility",
  width = "default",
  divider = false,
  bleed = false,
  className,
  id,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        typePadding[type],
        surfaceClasses[surface],
        // The hairline reaches 1.28:1 on white and 1.24:1 on the deep fill —
        // weak as a plane, strong as an edge. Same argument Surface makes for
        // card borders, applied at section scale.
        divider &&
          surface !== "navy" &&
          (surface === "deep" ? "border-t border-cloud-300" : "border-t border-cloud-200"),
        className
      )}
      {...rest}
    >
      {bleed ? (
        children
      ) : (
        <div className={cn("mx-auto px-4 sm:px-6", widthClasses[width])}>{children}</div>
      )}
    </section>
  );
}

interface EyebrowProps {
  children: React.ReactNode;
  /** Match the surface the eyebrow sits on. */
  surface?: SectionSurface;
  className?: string;
}

/**
 * The one section-label style. Every section except the hero, the proof rail and
 * the closing band opens with one — it is the cheapest chapter marker there is,
 * and four sections used to start with no signal that a new one had begun.
 *
 * Measured: slate-600 is 7.58:1 on white and 5.92:1 on the deep fill;
 * cloud-400 is 7.64:1 on navy. All clear of AA.
 */
export function Eyebrow({ children, surface = "white", className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em]",
        surface === "navy" ? "text-cloud-400" : "text-slate-600",
        className
      )}
    >
      {children}
    </p>
  );
}

import { cn } from "@/lib/utils";

/**
 * The surface depth ladder — Core Theme v4.1.
 *
 * Four rungs, expressed as fill + border + shadow triples rather than four
 * fills. The reason is measured, not stylistic: between #EEF2F7 and #FFFFFF
 * every available fill step lands at 1.03–1.07:1, which does not read as
 * structure on a light canvas. The hairline reaches 1.28–1.59:1 against the
 * same fills. Counting contrast above 1.0 — the part that is actually
 * visible — the edge carries roughly ten times the signal of the plane.
 *
 * Which is why `card` and `raised` share a fill and separate on border and
 * shadow alone. That is not a shortcut around picking a fifth grey; it is
 * the only mechanism with enough range left on a canvas this light.
 *
 * Rationing, so the ladder keeps meaning:
 *   canvas  the page itself. The datum. Nothing "sits on" it visually.
 *   sunken  a well — something recessed INTO the page. Read-only wells,
 *           quiet reference panels, the inside of a card. Never for a CTA:
 *           a recess reads as inactive, which is the wrong promise.
 *   card    the default. Content lifted off the canvas by a hairline.
 *   raised  overlays only — dropdowns, modals, popovers. Anything that
 *           floats above the page and closes. If four of these are on
 *           screen at once, none of them is above anything.
 */
type Rung = "canvas" | "sunken" | "card" | "raised";

const rungClasses: Record<Rung, string> = {
  // The datum: no edge, no lift. Its job is to be the thing others sit on.
  canvas: "bg-cloud-50",
  // border 1.14:1 on its own fill — the shallowest edge in the set, which is
  // correct: a well should be felt before it is seen.
  sunken: "bg-cloud-100 border border-cloud-200 shadow-sunken",
  // border 1.28:1 on white.
  card: "bg-cloud-25 border border-cloud-200 shadow-card",
  // border 1.59:1 on white — the strongest edge, paired with the only real
  // drop shadow, because an overlay has to win against whatever it covers.
  raised: "bg-cloud-25 border border-cloud-300 shadow-elevated",
};

// 12px is the card tier of the 8/12/pill radius vocabulary (Core Theme v4.0
// §2.3). `rounded-2xl` is the drift the `card-radius` lint rule counts.
const radiusClasses: Record<Rung, string> = {
  canvas: "",
  sunken: "rounded-lg",
  card: "rounded-xl",
  raised: "rounded-xl",
};

/**
 * The rung mapping, for surfaces that cannot be a `<Surface>` — most often
 * because the whole card is a `next/link` and must render an `<a>`. Use this
 * rather than hand-copying the classes: a card that spells out its own fill
 * and border is exactly how the ladder drifts back apart.
 */
export function surfaceClasses(
  rung: Rung,
  { interactive = false, flush = false }: { interactive?: boolean; flush?: boolean } = {}
): string {
  return cn(
    rungClasses[rung],
    !flush && radiusClasses[rung],
    interactive && rung === "card" && "transition-shadow hover:shadow-card-hover"
  );
}

// `HTMLElement`, not `HTMLDivElement`: the handler types have to stay wide
// enough for every tag `as` accepts, or passing `as="li"` fails to compile on
// the event props alone.
interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  rung: Rung;
  /**
   * Hover lift. Only meaningful on `card`, and only when the whole surface is
   * a link or button — a shadow that moves under a cursor promises a click.
   */
  interactive?: boolean;
  /** Drop the rung's default radius when a parent already clips. */
  flush?: boolean;
  as?: "div" | "article" | "aside" | "li";
  children?: React.ReactNode;
}

export function Surface({
  rung,
  interactive = false,
  flush = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <Tag className={cn(surfaceClasses(rung, { interactive, flush }), className)} {...rest}>
      {children}
    </Tag>
  );
}

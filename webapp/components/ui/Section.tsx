import { cn } from "@/lib/utils";

type SectionTone = "light" | "navy";

interface SectionProps {
  children: React.ReactNode;
  /**
   * `light` is the page canvas and the default. `navy` is rationed: a page gets
   * an opening band and a closing one, and nothing in between — alternating the
   * two is what made the old landing page read as nine separate websites.
   */
  tone?: SectionTone;
  /** Hairline above the section. Omit on the first section after a navy band. */
  divider?: boolean;
  /** Drop the max-width container when a child needs to bleed full-width. */
  bleed?: boolean;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
}

const toneClasses: Record<SectionTone, string> = {
  light: "bg-cloud-50 text-slate-700",
  navy: "bg-navy-700 text-cloud-100",
};

export function Section({
  children,
  tone = "light",
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
        "py-24",
        toneClasses[tone],
        divider && tone === "light" && "border-t border-pearl-100",
        className
      )}
      {...rest}
    >
      {bleed ? children : <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>}
    </section>
  );
}

interface EyebrowProps {
  children: React.ReactNode;
  /** Match the surface the eyebrow sits on. */
  tone?: SectionTone;
  className?: string;
}

/**
 * The one section-label style. Every hand-rolled uppercase label on the site is
 * a slightly different size and colour; this is the shared one.
 */
export function Eyebrow({ children, tone = "light", className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em]",
        tone === "navy" ? "text-cloud-400" : "text-slate-500",
        className
      )}
    >
      {children}
    </p>
  );
}

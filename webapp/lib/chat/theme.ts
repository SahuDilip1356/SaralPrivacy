// Setu widget colour roles.
//
// This file exists because #121A2E was doing two unrelated jobs across the
// widget — 3 uses as a dark SURFACE and 12 as INK — and they happened to share
// a hex. Converting "the navy to green" without separating them turns body
// text green and the panel unreadable, and the failure is silent: it still
// renders. Naming the roles is what makes the swap safe to reason about.
//
// Values are rungs on ramps already defined in app/globals.css, so nothing
// here extends the palette:
//   SURFACE  = --color-green-950   ACTION = --color-green-500
//   INK      = --color-navy-700    FOCUS  = teal-deep   TEAL = --color-teal-500

/** Dark ground things sit ON: panel header, launcher, user bubble. */
export const SETU_SURFACE = "#022C22";

/**
 * Text and borders that sit ON something else — including the label on every
 * green button. Stays navy. Not interchangeable with SETU_SURFACE.
 */
export const SETU_INK = "#121A2E";

/** The action colour. Reserved for things that are clickable — never a large
 *  surface, or it stops reading as a control. 5.97:1 on SETU_SURFACE. */
export const SETU_ACTION = "#07B981";

/** Focus rings. */
export const SETU_FOCUS = "#207D78";

/** Secondary accent. 6.10:1 on SETU_SURFACE. */
export const SETU_TEAL = "#35B6AE";

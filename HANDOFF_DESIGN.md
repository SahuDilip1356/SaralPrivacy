# Design handoff — Core Theme v4.0, waves 4–8

Written 21 Aug 2026, at `fe7ae74`. Picks up where `LANDING_PAGE_HANDOFF.md`
and the W0–W3 commits left off. Everything below is verified against the tree
at that SHA, not recalled.

> **Superseded in part by W9** (`claude/design-w9-surface-depth`). Two things
> in this document are now wrong, and both are corrected in §6 at the bottom:
> the surface-depth proposal in §2a does not work as specced (its middle rungs
> measure 1.027:1), and §2d's "mobile has never been verified" no longer
> holds. Read §6 before acting on §2a or §2d.

---

## 1. Where things stand

`main` is at **`fe7ae74`**. Nothing is open: no PRs, no unmerged branches, no
scheduled watchers. All five waves below are merged and deployed (Vercel builds
`main` natively; `.github/workflows/deploy.yml` is documentation only).

| SHA | Wave | What landed |
|---|---|---|
| `dbed708` | **W4** | Beat rhythm. Ten homepage beats went from a flat `py-24` to a 40/64/80/96/128 ladder driven by beat type. Net −336px of dead vertical space. |
| `b0d4fab` | **W5** | Hero CTA. Filled action is now `Take free assessment`; Discovery demoted to an escape-hatch line. Analytics `cta` values deliberately unchanged so before/after stays comparable. |
| `4e95c42` | **W6** | 77 hand-rolled `green-500` CTAs → 0. 57 light sites to `green-700`/white (5.48:1), 8 navy sites to `green-400`/`navy-950` (9.72:1). |
| `856b092` | **W7** | 40 green chips at 4.48:1 → `green-800` (6.28:1), plus a new `green-on-green` lint rule. |
| `fe7ae74` | **W8** | `Button` honoured `as="a"`/`href` for the first time; the old silent failure is now a compile error. |

### Lint state (`webapp/scripts/design-lint.sh`)

Six rules guard at zero; three carry inherited debt.

```
✓ cta-glow                ✓ chrome-badges
✓ heading-weight          ✓ low-contrast-green-text
✓ unreadable-green        ✓ green-on-green
· card-radius             4     known debt
· low-contrast-teal      25     known debt
· muted-text-on-light   279     known debt
```

The script is a **ratchet, not a wall** — it fails only when a count rises.
`--update` re-records the baseline.

---

## 2. What is left

### 2a. Deferred by the owner, not started

**Surface depth** — the biggest remaining structural gap, and the reason cards
still read flat.

```css
/* webapp/app/globals.css:127-128 — the entire ladder */
--c-bg:      #F7F9FC;   /* canvas  */
--c-surface: #FFFFFF;   /* card    */
```

Two rungs, **1.05:1 apart** (computed, not estimated). Linear has four. A card
can only be found by its border, and nesting a panel inside a card has nowhere
to go. Proposed addition, costed at ~3h:

```css
--c-bg:      #F7F9FC;   /* rung 0 — canvas   */
--c-sunken:  #EEF2F7;   /* rung 1 — recessed */  ← new
--c-raised:  #FBFCFE;   /* rung 2 — card     */  ← new
--c-surface: #FFFFFF;   /* rung 3 — lifted   */
```

Do **not** solve this by alternating white against `cloud-50` per section. At
1.05:1 that reads as banding, not structure, and it reintroduces the nine-flip
zebra W1.3 removed.

**Accent discipline** — `@theme` registers four chromatic families (`green`,
`teal`, `gold`, `navy` — plus `brand` as a navy alias) against Linear's single
accent. Nothing on a page is obviously *the* important thing when four colours
compete for it. Caveat before sweeping: green/amber/red carry **real semantic
meaning** in assessment results. Ration the decorative use; keep the semantic use.

### 2b. Open decision — owner's call, not a design one

**Header `DPDPA Guide` button.** `components/layout/Header.tsx:205` (desktop)
and `:255` (mobile) both render a filled green CTA pointing at
`/white-paper#download`. So two filled green buttons still compete above the
fold, which partly blunts W5.

Changing it to the assessment trades **guide downloads for assessment starts on
every page of the site**. That is a business tradeoff, deliberately left unmade.

### 2c. Known debt the ratchet is holding

| Rule | Count | Notes |
|---|---|---|
| `card-radius` | 4 | `ConsultationCTA:8`, `NoticeCTA:54`, `DiscoveryCTA:54`, `VerdictPreview:68` — `rounded-2xl` against an 8/12/pill vocabulary. ~15 min. |
| `low-contrast-teal` | 25 | `teal-600/700` measures 3.2–4.7:1 on light. Legal on navy, so it is a ratchet not a ban. |
| `muted-text-on-light` | 279 | `slate-400` is 2.4–2.6:1 on light, correct on navy. The rule is a bare grep with **no surface awareness** — expect false positives on navy. |

### 2d. Found along the way, unfixed

**`Section.tsx` has zero adoption.** Built in W0.3 to own the canvas-and-spacing
decision; every beat still hand-rolls `<section className="py-…">`. W4's rhythm
therefore lives in 11 hand-applied class strings and a comment in `page.tsx` —
nothing enforces it. Migrating beats onto `Section` is what stops it drifting
back. `Button` is at 6 files; `Section` at 0.

**Mobile has never been verified.** W4's ladder was measured at 1440px and W5's
hero at 390px, but the full page has not been checked at real 360–430px widths.
That is where most Indian SMB traffic is.

---

## 3. Traps in this repo that cost real time

Read this section before doing any colour or contrast work.

### Tailwind v4 emits `lab()` and `oklab()`

A digit regex on `getComputedStyle(el).backgroundColor` **silently mangles
them**. `oklab(0.999994 0.0000455678 …)` parses to `[0, 999994, 0]` and passes a
naive "is it green?" test — translucent white overlays get counted as green
CTAs. The W1.3 commit message warned about exactly this and it still caught a
later pass.

Resolve colours through a canvas instead:

```js
const ctx = document.createElement('canvas').getContext('2d');
const toRGBA = (css) => {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';      // reset, so an invalid value can't inherit
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  return Array.from(ctx.getImageData(0, 0, 1, 1).data);  // true sRGB + alpha
};
```

Also filter on `alpha >= 200`, or translucent overlays pollute the sample.

### `design-lint.sh --update` produces ~330 lines of phantom churn

`grep -r` walks directories in a different order each run, so every
`.baseline.d/` snapshot re-orders even when content is identical. Verify with
`diff <(sort old) <(sort new)` before assuming a real change. For a single new
rule, hand-edit `design-lint.baseline` and touch an empty snapshot file instead
— W7 did this and the diff stayed at 9 lines.

### Squash merges leave the working branch stale

After a squash merge, `origin/<branch>` still points at the pre-squash commit,
so a stop-hook or `git status` reports "1 unpushed commit" even though content
is identical to `main`. Confirm with
`git diff --stat origin/main origin/<branch>` (empty = safe), then
`git push --force-with-lease`. Enabling **auto-delete head branches** in repo
settings removes this loop entirely.

### Other

- **`_`-prefixed app folders are not routed.** App Router treats them as
  private, so a probe page at `app/__probe/` 404s. Use a plain name.
- **`npm run build` needs `RESEND_API_KEY`** set to anything
  (`RESEND_API_KEY=re_dummy npm run build`).
- **Rebuild after checking out a different commit.** `next start` serves
  `.next/`, not the working tree — a stale server once produced a "before"
  screenshot labelled "after". Verify with
  `curl -s localhost:3000/<page> | grep -oE '<marker>'` against disk.
- **`styles.refero.design` and `saralprivacy.com` are blocked** by this
  environment's egress proxy. The Linear reference was reconstructed from
  mirrors; the live site cannot be fetched — build and serve locally instead.

---

## 4. Verification recipes that worked

**Real contrast of every green element on a page** — build, `npm run start`,
then Playwright with the canvas parser above. Walk `a, button, span, div`,
keep greenish opaque fills carrying text, and compute WCAG ratio against
`getComputedStyle(el).color`. W6/W7 went 16 failing → 0 this way.

**Prove a lint rule actually fires.** A rule reporting "clean" is worthless if
it cannot fail. Inject one violation, confirm exit 1 with the file and line
named, restore, confirm exit 0. Both W0.3 and W7 did this.

**Chromium is pre-installed** at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Pass it as
`executablePath`; do not run `playwright install`.

---

## 5. Suggested order for a fresh session

1. **Verify mobile** at 360–430px first — cheapest, and it gates everything
   else. Nothing has been checked there.
2. **Migrate beats onto `Section`** (2d). Small, and it stops W4 drifting back.
3. **Surface depth** (2a). Biggest visible gain; the four-line token addition is
   the easy part, applying the rungs is the work.
4. **Accent discipline** (2a), respecting the semantic-colour caveat.
5. `card-radius` (2c) whenever those four files are open anyway.

The header CTA (2b) is blocked on the owner, not on sequencing.

---

## 6. W9 — what changed, and what this document got wrong

Branch `claude/design-w9-surface-depth`, three commits off `7f698da`.
Everything here is measured against a production build, not recalled.

### 6a. §2a's surface-depth proposal was wrong. Don't build it.

The four-rung **fill** ladder proposed above does not survive measurement.
Its adjacent steps land at **1.027:1** — a 2.7% luminance step — and
`#FBFCFE` against `#FFFFFF` is not a rung, it is a rounding error. The
entire range from `#EEF2F7` to white is 1.124:1. There is no fifth grey
hiding on a canvas this light.

The hairline measures 1.279:1 against white, 1.592:1 at `cloud-300`.
Counting contrast above 1.0 — the visible part — **the edge carries about
ten times the signal of any fill step available.**

So the shipped ladder is fill + border + shadow triples, with the border
load-bearing. It lives in `components/ui/Surface.tsx`, which owns the
mapping; `surfaceClasses()` is the escape hatch for surfaces that must
render an `<a>`. Rungs 2 and 3 share a fill on purpose.

Guarded by a `hand-rolled-surface` ratchet at baseline 7 — the lesson of
`Section.tsx` being that an unenforced primitive gets zero adoption. The 7
are VerdictPreview's tab buttons (not cards) and the navy-band surfaces,
**where the light ladder does not apply**: white on navy already separates
without a hairline. Do not "finish the job" by applying rungs there.

`card-radius` is now **3**, not 4 — VerdictPreview's `rounded-2xl` went
with the migration. `--shadow-sunken` was the only new token needed.

### 6b. §2d's "mobile has never been verified" is done

Verified at 360/390/430px. Two real defects, both fixed:

- **The page was 6px wider than a 360px phone.** VerdictPreview's card
  header had `shrink-0` on its pill group, so it pushed the document wider
  rather than yielding. Note the trap: `<header>` *looks* like the culprit
  in a naive walk because a fixed element stretches to the overflowed
  scroll area. Trace non-fixed elements first.
- **64 tap targets under 44px, now 14.** The mechanism is
  `pointer-coarse:min-h-11` — a floor on the *pointer*, not the breakpoint,
  since a 1024px tablet is touch and a narrow desktop window is not.
  `Button`'s own scale was the systemic offender: `sm` renders 32px and
  `md` — the default — renders 40px.

The 14 remaining are documented exemptions, not misses: six footer links
that are 44px tall but 27–42px wide (a 24×24 target fits, so they pass
2.5.8 AA), the compact press row (inline sentence flow, explicitly
exempt), and the consent checkbox (its label carries `htmlFor`).

### 6c. New, and the top of the list

**The mobile footer is 3202px** — 30% taller than its 2458px desktop self,
because 25 stacked links each take a real touch target. That is the honest
cost of 6b, accepted for the accessibility, but it is the argument for a
collapsible mobile footer. **This is now the highest-value mobile item.**

**The homepage is 26 screens on a phone**, and `AudienceCards` alone is
~5800px of it — the 12-card sector wall at one column. Padding is only 8%
of page height, so the beat ladder is *not* the mobile problem; the card
wall is. Worth a "show 4, expand" treatment before anything else.

**The beat ladder has no responsive scaling.** All 12 beat paddings are
unqualified — `py-32` is 256px of vertical padding at 360px exactly as at
1440px. Less urgent than the two above, given the 8% figure.

**`pearl-50..300` and `cloud-50..300` are the same four hex values** under
two names, and cards in the wild pick between `border-slate-200`,
`border-pearl-200` and `border-cloud-200`. One ramp, three spellings.

**Container widths are a 4-value vocabulary chosen ad hoc** — `max-w-7xl`,
`6xl`, `5xl`, `3xl` across 13 beats. This is why `Section.tsx` can't simply
be adopted: its hardcoded `max-w-6xl` is wrong for 11 of the 13. Migrating
beats onto `Section` needs that decision made first, or `bleed` used
throughout, which leaves `Section` owning almost nothing.

### 6d. Traps W9 added to §3

- **A stale `next-server` survives `pkill -f "next start"`** and will serve
  the old bundle through an entire verification pass. Kill by PID, confirm
  with `pgrep`, and grep the *served HTML* for a marker from your change
  before trusting a measurement.
- **`npm install` rewrites `package-lock.json`** (drops `peer: true` flags)
  with no dependency change. Unstage it.
- **Appwrite is blocked by this environment's egress**, so
  `BriefingsSection` renders empty locally and the page measures shorter
  than production.
- **`pointer-coarse:` compiles fine in Tailwind 4.2** — verified against
  the real PostCSS pipeline before relying on it, which is worth doing for
  any variant you have not used in this repo before.
- **Polymorphic `as` props need `React.HTMLAttributes<HTMLElement>`**, not
  `<HTMLDivElement>`, or `as="li"` fails to compile on event handlers alone.

### 6e. Verification recipes W9 used

- **Desktop neutrality proof.** Load the same page at `pointer: fine` and
  `pointer: coarse` in one run and compare page height. W9.2 claimed
  "desktop untouched" and could show 19670px both before and after, with
  the whole +826px isolated to touch.
- **Ladder-as-rendered.** Probe each rung by the classes `Surface` emits,
  resolve fill and border through a canvas, and report `edge:fill` beside
  `fill:beneath`. That is the check that makes the design thesis falsifiable
  rather than assertable.
- **Prove the new lint rule fails**, per §4. `hand-rolled-surface` was
  injected, confirmed exit 1 naming file and line, restored, confirmed 0.

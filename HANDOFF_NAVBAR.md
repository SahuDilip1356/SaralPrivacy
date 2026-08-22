# Navbar handoff — the four-menu header

Written 22 Aug 2026, at `ebc3817`. Covers the header restructure (`bb97567`,
PR #13) and the Tier 1 behaviour fixes (`daaeb07`, PR #17). Everything below is
verified against the tree at that SHA, not recalled — where something is
unverified it says so in those words.

Sibling documents: `HANDOFF_DESIGN.md` (Core Theme v4.0, waves 4–9) and
`HANDOFF_SEO.md`. §3 of the design handoff — the traps section — applies here
too and is not repeated.

---

## 1. Where things stand

Both navbar changes are merged and deployed. Nothing is open: no PRs, no
unmerged branches, no scheduled watchers.

| SHA | PR | What landed |
|---|---|---|
| `bb97567` | #13 | Seven top-level items → four menus. IA extracted to data. The bar became keyboard-operable for the first time. |
| `daaeb07` | #17 | Tier 1 behaviour: hover intent, panel entry animation, mobile body scroll lock. |

No commit since `daaeb07` has touched any nav file — verified with
`git log daaeb07..HEAD -- <the four files>`, which returns empty. If that is no
longer true when you read this, re-verify §4 before trusting it.

### The files

| File | Lines | Owns |
|---|---|---|
| `webapp/lib/data/navigation.ts` | 203 | The IA as data. Menus, items, both chrome actions. |
| `webapp/lib/data/navigation.test.ts` | 148 | Route contract + IA rules. 9 tests, no browser. |
| `webapp/components/layout/Header.tsx` | 653 | All rendering and behaviour. Desktop bar, mega panels, mobile drawer. |
| `webapp/scripts/nav-acceptance.mjs` | 323 | 39 browser assertions across 6 sections. |

The split between the first and third is deliberate: the route contract can be
reviewed and tested without reading any rendering code, and a typo'd path fails
a test suite instead of shipping a 404 into the chrome on every page.

---

## 2. The decisions worth not re-litigating

Each of these was argued out once and has a comment at the site explaining it.
Reopening them is fine; doing so without reading the reasoning is not.

**Four menus, not seven.** The old bar mixed three taxonomies at one altitude —
tools, an audience, and content — so nothing told the reader which kind of thing
they were choosing between. The four are questions a visitor actually arrives
with: *where do I stand / help me do the work / show me my sector / help me
understand it.* Seven items also forced the desktop bar to `xl` (1280px), which
handed every 1024–1279px laptop a hamburger. Four fit at `lg`, and
`nav-acceptance.mjs` §1 measures that rather than asserting it — 46px of slack
at 1024px, against the old bar's 0px.

**The triggers are `<button>`, not `<Link>`.** They used to be links with
`onMouseEnter` and nothing else, so the menus could not be opened by keyboard at
all: Tab focused the trigger, Enter navigated away, and the panel never
appeared. A button owning `aria-expanded` is the disclosure pattern this
actually is. The section hub the trigger used to link to is now the panel's
featured item, so it is still one keystroke away.

**Every item carries a description, except Industries.** "Data Flow" and "Data
Discovery" are indistinguishable as bare labels. The exception is
all-or-nothing per menu and enforced by a test — a menu cannot half-describe its
items and render a ragged panel. Industries opts out wholesale because twelve
self-evident sector names in a three-column grid would become a page.

**Exactly one filled action.** `primaryAction` (Take free assessment) is the
only fill in the chrome; `DPDPA Guide` is a quiet secondary. Two filled greens
above the fold is what W5 removed from the hero and what the header had quietly
put back. A test asserts the two never restate each other.

**`comingSoon` renders inert.** Not a link, not a button — a menu entry that
navigates nowhere is worse than no entry. A test asserts its `href` still
resolves, so the contract stays honest if it is ever made clickable by accident.

### The Tier 1 timings, and why those numbers

`MENU_OPEN_DELAY_MS = 120` (`Header.tsx:46`). A trigger is ~90px wide, so a
pointer crossing the bar at a normal 800+px/s dwells under 110ms on each one.
120ms filters that pass-through while still feeling immediate on a deliberate
hover. **It applies only to the first open** — once a panel is up, moving along
the bar switches instantly, because by then the reader is clearly browsing and a
delay would feel broken rather than considered.

`MENU_CLOSE_DELAY_MS = 150` predates this work and is the forgiveness window for
the gap between trigger and panel.

Panel entry is 140ms, opacity plus a 4px rise, in `globals.css` as
`sp-panel-in`. There is **no exit animation on purpose**: the panel unmounts on
state change, so an exit would mean keeping the element in the tree after it
stops being reachable. `prefers-reduced-motion` collapses the duration to `1ms`
rather than setting `animation: none`, which in some engines leaves the
from-state (opacity 0) applied and the panel invisible.

### The scroll-lock trap, which will bite again

The mobile drawer locks the page with `position: fixed` on `body`, not
`overflow: hidden`, because **iOS Safari ignores overflow-hidden on body**. The
cost is that fixing the body drops the scroll offset to 0, so it is captured on
open and restored on close.

That restore **must** be `window.scrollTo({ top: y, behavior: "instant" })`.
`globals.css:169` sets `html { scroll-behavior: smooth }`, which applies to
programmatic scrolls too — so the two-argument `scrollTo(0, y)` animates the
page back over ~600ms, re-introducing the exact visible jump the lock exists to
remove. Restoring an offset is not navigation and must not animate.

This is worth internalising beyond the navbar: **any programmatic scroll
anywhere in this codebase inherits smooth behaviour** unless it opts out.

---

## 3. What is verified, and how to re-run it

### Route + IA contract — no browser, fast

```
cd webapp
node --test --experimental-strip-types --import ./scripts/ts-resolve.mjs \
  lib/data/navigation.test.ts
```

9 tests, 9 passing at `ebc3817`. TIER 1 asserts every `href` resolves to a real
page under `app/`, using deliberately the same `pageExists()` shape as
`lib/chat/site-routing.test.ts` so the two agree about what "a route exists"
means. TIER 2 asserts the IA rules above.

`navigation.test.ts` imports with explicit `.ts` and needs no resolver hook, but
passing `--import ./scripts/ts-resolve.mjs` is harmless and is what the sibling
suites require. A suite failing with `ERR_MODULE_NOT_FOUND` is usually a wrong
invocation, not a broken test — I lost time to exactly that on
`site-routing.test.ts`, which reports 11/12 without the hook and 12/12 with it.

### Behaviour — needs a running production build

```
cd webapp
RESEND_API_KEY=re_dummy npm run build      # the key can be any string
npx next start -p 3000
NODE_PATH=/opt/node22/lib/node_modules node scripts/nav-acceptance.mjs
```

**39 assertions across 6 sections, all passing** at `ebc3817`. Run six times
while writing this document; no flake. The script prints 40 `✓` lines — 39
assertions plus a summary line — so count assertions with `grep -cE '^  ✓'`, not
`grep -c '✓'`.

| § | Assertions | Covers |
|---|---|---|
| 1 | 9 | Bar fits at 1024/1280/1440 without wrapping, ≥24px slack |
| 2 | 12 | Keyboard + ARIA: Enter, Escape + focus restore, ArrowDown into panel, ArrowLeft/Right between triggers, coming-soon inert |
| 3 | 7 | Mobile drawer at 360px: accordion collapsed by default, no horizontal overflow, every target ≥44px |
| 4 | 3 | Hover intent: pass-through opens nothing, deliberate hover opens, switching is instant |
| 5 | 3 | Panel entry name/duration, reduced-motion collapse, still ends opaque |
| 6 | 5 | Scroll lock: body fixed, page behind pinned, unlocks, offset restored within 60ms |

Two things about this script that are load-bearing:

- **§4 drives real `page.mouse.move()`.** A synthetic
  `dispatchEvent(new PointerEvent('pointerenter'))` never reaches React, which
  synthesises `onPointerEnter` from `pointerover` delegation — so a
  dispatch-based test here passes for the wrong reason. It cost me a debugging
  cycle.
- **§6 samples 60ms after close**, where a smooth restore is only about a third
  of the way home. Widening that timeout would make the check pass against the
  bug it exists to catch.

---

## 4. What is NOT verified

Two items, both stated plainly because "no reason to expect a problem" is
exactly what leaves things broken for months.

**The two nav analytics events have never been confirmed to land.**
`lib/analytics.ts:262` carries a ⚠️ UNVERIFIED notice on `nav_menu_open` and
`nav_item_click`. They use the same `gtag` helper as every working event, so
there is no *reason* to expect failure — but this repo has previously had 23
events silently dead for months on that same reasoning. Someone with a browser
on the live site needs to open a menu, check the network tab for
`POST /_vercel/insights/event`, and then delete the notice. **Only a human can
close this**; the build container cannot reach `saralprivacy.com`.

These two are not decoration: the four-menu IA is a bet that the labels match
how people actually search. `nav_menu_open` says which of the four they reach
for; `nav_item_click` says whether the panel then answered them. Without the
pair the restructure can only be asserted, never evaluated.

**The scroll lock has never run on real iOS Safari** — which is precisely the
browser it exists for, being the one that ignores `overflow: hidden` on body.
Verification was Chromium emulating a 390px touch viewport with
`isMobile`/`hasTouch`. That exercises the logic but not the WebKit quirk. One
pass on a real iPhone closes it.

**`nav-acceptance.mjs` is not in CI** and nothing runs it automatically. It
needs a running server, and Playwright is not a dependency of this package
(it is available globally in the build container). Wiring it up is real work —
a server lifecycle plus a Playwright dependency — not a config line.

---

## 5. What is left

Tiers as originally scoped, with what I have since verified folded in.

### Tier 2 — answering "where do I start?"

**#4. Industries has no route for the undecided.** Twelve sector names, no
descriptions. Someone running a diagnostic lab has to recognise themselves in
"Clinics & Diagnostic Labs". A single line at the foot of that panel — *"Not
sure which fits? Take the 2-minute check →"* — catches everyone who hesitates.
Small, self-contained, no product decision needed.

**#5. Make the bar remember the sector.** The highest-value item, and the one
that needs **your** decision, not a design one. I have since verified the
mechanics, which changes the cost:

- The hero *does* ask for business type — `components/home/HeroSection.tsx:77`,
  and `trackEvent.heroSectorSelect` already fires on it. My original premise
  was right.
- **It is not persisted.** It is a bare `useState<string | null>(null)`, lost on
  navigation. There is no sector store, context, or cookie anywhere.
- **But it is already threaded through URLs**: the hero builds
  `/assessment/${sectorSlug}` and `/discovery?sector=${sectorSlug}`
  (`HeroSection.tsx:80-81`).
- `app/discovery` persists its own state under `localStorage["sp_discovery_v1"]`
  including an `industry` field, but **nothing reads that key back** outside
  `DiscoveryClient`. It is not a shared store and should not be repurposed as
  one without thought.

So the cheap version is real: the header can read the sector from the pathname
and search params on sector-scoped routes and adapt without any persistence
being built. The expensive version — remembering across a whole session,
including a cold landing on `/blog` — needs a store that does not exist yet.
**Those are different projects**; pick one before anyone starts.

**#6. `Coming soon` is a dead end.** Deep assessment announces itself and offers
nothing. "Notify me" turns it into a lead list for the thing you are about to
build. Needs somewhere for the address to go, so it is not purely front-end.

### Tier 3 — real utility, more work

**#7. Search.** With 12 learn topics (`learnContent`), a fifty-plus-term
glossary, the blog and daily briefings, this is genuine utility rather than a
maturity signal. `Cmd/Ctrl+K`
costs nothing extra once the index exists.

**#8. A keyboard hint.** The arrow-key navigation works and nobody will
discover it. A small `↑↓ to browse · esc to close` line in the panel footer
surfaces work that is already done and paid for.

### Deliberately not doing

**Hide-on-scroll header** — the one filled CTA should stay reachable, and on a
page this long a disappearing bar costs more than the vertical space it saves.
**Imagery in every panel** — only Tools has anything genuinely visual to show;
elsewhere it would be decoration competing with the labels.

---

## 6. Traps specific to this component

§3 of `HANDOFF_DESIGN.md` covers the repo-wide ones (`lab()`/`oklab()` parsing,
`design-lint --update` churn, stale `next-server`, `RESEND_API_KEY`). These are
the navbar's own.

- **`pgrep -f 'next-server'` matches the shell running it.** `kill`ing that list
  kills your own command. Use `pgrep -x next-server`, or grep the served HTML
  for a marker instead. I did this to myself twice in one session.
- **`grep -c` counts lines, not matches.** Minified HTML is one line, so
  `grep -c 'aria-haspopup' index.html` returns 1 whether the nav rendered once
  or fifty times. Use `grep -o … | wc -l` for any marker check against built
  output.
- **The panel's `sp-panel-in` class is not in the SSR'd HTML** — the panel
  mounts on state change. To confirm a build actually carries it, grep the CSS
  chunk (`/_next/static/chunks/*.css`, 4 occurrences) rather than the page.
- **A squash merge re-offers already-merged work as a conflict.** When PR #12
  squashed, its commits landed under a new SHA that was not in #13's ancestry,
  so git presented W9's old Header as a conflicting side. Take your own version
  and then **grep-verify** the earlier change survived rather than assuming —
  I checked all three W9 touch-target fixes by hand that way.
- **`@/` does not resolve under `node --test --experimental-strip-types`.**
  That is why `navigation.ts` imports `./sectors.ts` with an extension.

---

## 7. Suggested order for a fresh session

1. **Confirm the analytics events fire** (§4). Needs a human with a browser,
   blocks nothing else, and until it is done the entire restructure is
   unevaluated. Then delete the notice in `lib/analytics.ts`.
2. **Open the drawer on a real iPhone** (§4). Five minutes, and it is the one
   platform the scroll lock was written for.
3. **Tier 2 #4**, the Industries escape hatch. Small, self-contained, no
   decision needed.
4. **Decide Tier 2 #5's scope** — URL-derived or a real session store. The
   research is done in §5; the choice is a product one.
5. **Tier 2 #6 / Tier 3** as appetite allows.

Wiring `nav-acceptance.mjs` into CI is worth doing before anyone makes
substantial changes to `Header.tsx`, since 39 assertions that nobody runs decay
into 39 assertions that no longer pass.

---

## 8. One known inaccuracy

`navigation.ts:11` points at `lib/data/__tests__/navigation.test.ts`. The file
is actually at `lib/data/navigation.test.ts` — the comment is stale, the test is
real and passing. Left as-is rather than bundled into an unrelated commit; fix
it whenever that file is open anyway.

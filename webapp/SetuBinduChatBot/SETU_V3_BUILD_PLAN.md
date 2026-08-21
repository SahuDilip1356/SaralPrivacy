# Setu v3 — Build Plan

> **Branch:** `feature/setu-v3` (cut from `feature/setu-outcome-layer`, which carries the spec)
> **Spec:** `SETU_OUTCOME_LAYER_SPEC.md` v1.0 · **Visual:** §V below
> **Status:** in build · **Merge to `main` only on explicit owner confirmation**
> **Date:** 2026-08-21

---

## 1. Scope lock

The owner limited this development to the Setu chatbot. The touch list is closed:

**May touch**
- `components/chat/**`
- `lib/chat/**`
- `app/api/chat/**`
- `lib/analytics.ts` — **additive only** (new `chat_*` helpers, no existing line reordered)
- `scripts/setup-appwrite.mjs` — **additive only** (one collection definition)

**Must not touch** — everything else, including two things the spec originally proposed:

| Spec said | Why it is not happening here | Deferred to |
|---|---|---|
| §6.5 extract shared lead-write from `app/api/contact/route.ts` into `lib/leads.ts` | Refactors a non-Setu route. The handoff writes its own lead through the same collections and the same field shape instead. | Follow-up PR, owner's call |
| §8.3 add a Setu toggle to `app/consent-preferences/*` | Edits a non-Setu page. The off switch is widget-local (`sp_setu_off`) and the footer links to the existing page without modifying it. | Follow-up PR, owner's call |

Recording this because it creates one accepted deviation from the spec's own §2.3 "one lead path" principle — the handoff's write is a second implementation of the same sequence. It is duplication with a reason, not drift, and consolidating it is a one-file change whenever the owner opens that scope.

## 2. Assumptions taken

The build was instructed to proceed to completion, so the open decisions are resolved to the recommendations already put to the owner. Each is reversible; all are flagged for confirmation at review.

| ID | Decision | Taken as |
|---|---|---|
| D10 | Lead capture location | **In-widget**, three fields |
| D11 | Human lane fulfils by | **Callback request** — no calendar dependency |
| D12 | Cookieless analytics | **Permanent.** No visitor ID, no enrichment, no cross-session history |
| D13 | Voice | **Not in this build.** §11.1 exclusion holds |
| D14 | Qualification opener scope | **Industry + Learn pages only**, existing suppression list intact |
| V1 | Panel surface | **`#022C22`** green-950 |
| V2 | User bubble follows header | **Yes** — all three surfaces move together |
| V3 | Site chrome | **Unchanged.** Widget only |
| V4 | Launcher shape | **Superseded** by the 3D orb below |

## 3. The 3D avatar — what is and isn't possible

The owner asked for a 3D Setu that glows and bubbles, replacing the flat PNG.

**Not possible here:** a true 3D character mesh. No rig, mesh or `.glb` exists in the repo, and one cannot be generated in this environment. Any claim otherwise would be false.

**Built instead — `SetuOrb`:** a real-time WebGL orb rendered from a custom fragment shader, with the existing character composited at its centre.

- **3D lighting** — ray-marched sphere with Lambertian shading, specular highlight and a fresnel rim that brightens at the silhouette. This is genuine per-pixel 3D, not a CSS gradient imitating one.
- **Bubbling** — layered value-noise displacing the surface normal over time, so light moves across the sphere like a slow simmer rather than a loop.
- **Glow** — emissive bloom whose colour and intensity are driven by Setu's state, replacing the flat `ring-*` classes.
- **The character stays.** The orb is a living ground the avatar sits in, so `SETU_CHARACTER_CANON.md` survives intact. That was the deciding argument against a Gracie-style faceless orb.

**Cost controls**, because this sits in the corner of every page:
- Renders only when visible and animating; the loop parks itself otherwise
- Single canvas per mount, `devicePixelRatio` capped at 2
- `prefers-reduced-motion` → one static frame, no loop
- WebGL unavailable → the existing `<Image>` avatar, unchanged

## 4. Sequence and gates

Baseline before any change: **65 pass / 2 fail**. The two failures are pre-existing and outside scope — `lib/data/data-flow/index.ts:12` imports `"../sectors"` without a file extension, which Node's native type-stripping cannot resolve. Next/webpack resolves it fine, so this is a test-harness incompatibility, not a production defect. It is not fixed here because `lib/data/` is out of scope.

**Gate for every step: failures stay at 2, and new tests pass.**

| # | Step | Gate |
|---|---|---|
| 1 | W0 — instrumentation | Suite green; `ChatMeta.escalation` present on an escalation turn |
| 2 | V — green surface tokens | Contrast unchanged from the ledger; visual diff only |
| 3 | 3D — `SetuOrb` | Renders; reduced-motion static; no-WebGL fallback |
| 4 | W1 — outcome lanes | Golden set still 100% on lane-seeded messages |
| 5 | W2 — handoff | Packet cannot exist without consent; PII redacted; new unit tests |
| 6 | W3 — openers | Opener purity test; suppression list intact |
| 7 | W4 — trust chrome | Memory panel renders state; clear works |
| 8 | Gates | Full suite, `next build`, Playwright screenshots, preview published |

## 5. Verification the owner gets

1. Full test suite output, before and after
2. `next build` completing clean
3. Playwright screenshots of the real widget — launcher, opening state, conversation, handoff, memory panel — light and dark
4. A published preview artifact collecting all of it
5. The branch pushed, **unmerged**

Merge to `main` happens only after the owner confirms. Nothing in this plan performs a merge.

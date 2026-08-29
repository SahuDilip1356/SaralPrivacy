# Mobile App Deep Dive & Build Spec — PWA + Native Routes

**Status:** Draft for review — nothing here ships without preview verification + explicit approval.
**Branch:** `feat/mobile-app-spec`
**Scope:** How to take SaralPrivacy mobile — a full technical deep dive on all four routes (PWA, TWA, Capacitor, React Native), a comparison, and a phased build plan for the recommended path.

---

## 0. Decision summary

| Route | What you get | Tentative effort | Store presence | Verdict |
|---|---|---|---|---|
| **A. PWA** | Installable app, offline shell, push notifications for the Daily Brief | ~25–35 h total across 3 phases | None (web install) | **Build first** |
| **B. TWA (Trusted Web Activity)** | The PWA packaged as a real Android app on the Play Store | ~6–10 h *on top of* Route A | Play Store (Android only) | **Build second** — cheapest store presence that exists |
| **C. Capacitor wrap** | The live site inside an iOS/Android shell with native plugins | ~60–120 h | Both stores (with Apple-review risk) | Only if App Store presence becomes a hard requirement |
| **D. React Native / Expo** | A true native app; UI rebuilt from scratch, engine/data reused | ~300–500 h | Both stores | Post-Gate-3 product decision, not a task |

**The recommended path: A → B.** PWA + TWA together give you an installable mobile app, Daily Brief push notifications, offline reading, *and* a Google Play listing for roughly a week of focused work — while reusing 100 % of the existing site. Routes C and D are documented fully below so the trade-off is on paper, but neither should start until there's evidence the PWA ceiling has been hit.

**Operation Pounce note (on the record):** the locked phase order is P0 security → P2 Razorpay → Gate 3, and the not-do list bans new free surfaces until Gate 3. Routes A+B enhance the *existing* funnel (re-engagement via push, install = retention) rather than creating a new surface, which is the defensible reading — but this build was recommended for *after* Razorpay ships. Proceeding now is a founder call, recorded here so it isn't re-litigated later.

---

## 1. Current state & constraints (verified in repo)

- **Stack:** Next.js 16 App Router (React 19), server-rendered with API routes — **not** statically exportable as-is. Vercel project `webapp`, `rootDirectory = webapp`.
- **No PWA scaffolding exists:** no `manifest.*`, no service worker, no `apple-touch-icon`, no PWA metadata in `app/layout.tsx`. Greenfield.
- **CSP is strict** (`next.config.ts` headers): `default-src 'self'` etc. A same-origin `/sw.js` and `/manifest.webmanifest` are fine as-is; a push-subscribe API route under `/api/` is covered by `connect-src 'self'`. **No CSP change should be needed — verify on preview, don't assume.**
- **Data layer:** Appwrite (Singapore) behind a lazy-init Proxy (never construct at module top level — build crashes without env vars). Short attribute keys (the `report_type` ≤ 10-char lesson generalises).
- **Daily Brief pipeline:** `run_pipeline.sh` + `workflows/` at repo root generate briefings — this is where a push-send step naturally hooks in.
- **Env vars on Vercel:** ⛔ *env var live ≠ env var listed* — after adding VAPID keys, redeploy and then verify at runtime.
- **Assessment engine + 12 sector packs are pure TypeScript** (`webapp/lib/`) — this matters only for Route D, where it's the one genuinely reusable layer.

---

## 2. Route A — PWA (the deep dive)

### 2.1 What a PWA actually is

Three ingredients turn the existing site into an installable app:

1. **Web App Manifest** — a JSON file declaring name, icons, colors, and `display: standalone`. This is what makes browsers offer "install" and what makes the installed app open full-screen without browser chrome.
2. **Service Worker** — a JS file the browser runs in the background, independent of any open tab. It intercepts network requests (→ offline support) and receives push events (→ notifications, even when the app is closed).
3. **HTTPS** — already satisfied.

What it does **not** give you: an App Store / Play Store listing (Route B fixes half of that), and on iOS everything works only after the user adds the site to their Home Screen (see 2.6 — this is the single biggest PWA caveat).

### 2.2 Manifest — Next.js native, zero dependencies

Next.js App Router has first-class manifest support: create `webapp/app/manifest.ts` exporting a `MetadataRoute.Manifest`. Next serves it at `/manifest.webmanifest` and injects the `<link>` automatically.

```ts
// webapp/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SaralPrivacy — DPDPA Compliance",
    short_name: "SaralPrivacy",
    description: "DPDPA compliance tools and the Daily Brief for Indian SMBs",
    start_url: "/?source=pwa",          // lets analytics segment PWA sessions
    display: "standalone",
    background_color: "#0b1f3a",        // navy — match the real token, don't trust this hex
    theme_color: "#0b1f3a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

**Icon work (the real effort in this phase):**
- 192 px and 512 px PNGs from the emblem (`public/logo-emblem.png` is the base).
- A **maskable** variant: the emblem must sit inside an 80 %-diameter safe circle on a solid background — Android crops installed icons into circles/squircles, and a non-maskable icon gets an ugly white ring. Test at https://maskable.app.
- `apple-touch-icon.png` (180 px, **no transparency** — iOS composites transparency onto black) + `<link rel="apple-touch-icon">` via the `icons.apple` field of the existing `metadata` export in `app/layout.tsx`.
- ⚠️ Wordmark-green contrast rules don't apply to the icon (logotype exemption), but pick the navy background so the white emblem carries it.

### 2.3 Service worker — hand-rolled, not a framework

**Recommendation: write `webapp/public/sw.js` by hand (~120 lines), register it manually. Do NOT add `next-pwa` or Serwist.**

Why: `next-pwa` is effectively unmaintained and predates the App Router; Serwist (its successor) chases Next.js majors and Next 16 support would need verifying — a dependency risk for something this small. The actual needs (offline fallback + push handling + light caching) fit comfortably in a file you fully control. Files in `public/` are served verbatim at the root, so `/sw.js` gets root scope for free, and the CSP's `script-src 'self'` already allows it.

**Caching strategy — deliberately conservative:**

| Resource | Strategy | Why |
|---|---|---|
| HTML navigations | **Network-first**, fall back to cached copy, then `/offline` | Never serve a stale briefing when online; still readable offline |
| `/_next/static/*` | Cache-first | Content-hashed, immutable by construction |
| `/api/*`, `/admin*` | **Never touched by the SW** | A cached admin or API response is a security/correctness bug |
| `/offline` page | Precached at install | The offline fallback itself must be offline |

Skeleton:

```js
// webapp/public/sw.js
const VERSION = "v1";                 // bump on every SW change — this IS the deploy mechanism
const PRECACHE = [`/offline`];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((hit) => hit || caches.match("/offline"))
        )
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      }))
    );
  }
});

// Push handlers arrive in Phase M3 (see 2.5)
```

Registration lives in a tiny client component mounted once in the root layout:

```tsx
// webapp/components/pwa/register-sw.tsx
"use client";
import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
```

**The kill switch (write it before you need it):** a service worker outlives deploys — if a broken one ships, users keep getting the broken behaviour until it's replaced. The escape hatch is deploying a `sw.js` whose `activate` handler deletes all caches and calls `registration.unregister()`. Keep that file ready in `docs/` as `sw-killswitch.js`. This is the PWA equivalent of a rollback.

**Update flow:** the browser re-checks `/sw.js` byte-for-byte on navigation. `skipWaiting()` + `clients.claim()` means a new version takes over on the *next* page load — good enough here; no "refresh to update" toast needed at this stage.

### 2.4 Install experience

- **Android/Chrome:** fires `beforeinstallprompt`. Capture it, and surface a small "Install app" affordance (e.g., in the footer or after a completed assessment — a moment of delivered value). Calling `prompt()` on the saved event shows the native sheet. With maskable icons in place, Chrome installs it as a WebAPK — real icon, real app drawer entry.
- **iOS Safari:** **no install prompt exists.** The only path is Share → "Add to Home Screen". Ship a small, dismissible instruction hint shown only to iOS Safari non-standalone visitors (`navigator.standalone === false` + UA check). Do not nag; once dismissed, remember in `localStorage`.
- **Detection/analytics:** track `appinstalled` event + `display-mode: standalone` media query as custom events. ⚠️ Per the content/SEO law: *verify the new analytics events actually fire on preview before merge* — the analytics baseline gap is a known open item.

### 2.5 Push notifications for the Daily Brief (the payoff feature)

Architecture — standard Web Push (VAPID), no Firebase needed:

```
Daily Brief pipeline (run_pipeline.sh)
        │  after briefing publish
        ▼
POST /api/push/broadcast  (auth: shared secret header — NOT the admin cookie)
        │  reads subscriptions from Appwrite
        ▼
web-push npm lib → browser push services (FCM endpoint for Chrome, Apple's for iOS PWA)
        ▼
sw.js `push` event → showNotification(title, { body, data: { url } })
        ▼
`notificationclick` → clients.openWindow(briefing URL)
```

Build pieces:

1. **VAPID keypair** — generate once (`npx web-push generate-vapid-keys`), store as `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` on Vercel. ⛔ Redeploy, then verify the vars are actually live at runtime (documented past incident).
2. **Appwrite collection `push_subs`** — attributes: `endpoint` (string, indexed unique), `p256dh`, `auth`, `created_at`, optional `topics` (future: per-sector briefing subscriptions). Keep keys short. Access via the existing lazy-init Proxy pattern. Paginate reads (archive-pagination lesson applies).
3. **`POST /api/push/subscribe`** — stores `PushSubscription.toJSON()`. **`DELETE`** removes it. Rate-limit lightly; validate the endpoint URL is an HTTPS push-service origin before storing (don't persist arbitrary attacker-supplied URLs).
4. **Opt-in UI** — a "Get the Daily Brief as a notification" toggle. **Never call `Notification.requestPermission()` on page load** — browsers punish it (Chrome demotes to a quiet chip; a denied permission is near-unrecoverable). Ask only on explicit tap.
5. **Broadcast route** — called by the pipeline with a shared-secret header (⚠️ investor-audit lesson: this must NOT reuse the forgeable-cookie pattern; a static secret in an env var, compared with a timing-safe equality, is the floor). Iterates subscriptions, sends via `web-push`, and **prunes every subscription that returns HTTP 404/410** (expired). Batch with modest concurrency (e.g., 20 at a time).
6. **SW handlers** — `push` → `showNotification`; `notificationclick` → focus-or-open the briefing URL.

**Payload discipline:** title ≤ ~50 chars, body = the briefing's one-line summary, deep link to the briefing. One notification per day, ever. Push is a trust instrument — the moment it feels like marketing, users revoke and never come back.

### 2.6 iOS reality check (read before promising anyone anything)

- Web push on iOS requires **iOS 16.4+** *and* the site **installed to the Home Screen**. A Safari tab never gets push. So the iOS funnel is: visit → convince to Add-to-Home-Screen → open the installed app → opt in to push. Each step loses people. On Android the funnel is one tap.
- Installed-PWA storage on iOS can be evicted after long disuse (offline cache is best-effort there, not a guarantee).
- Practical consequence: **push adoption will be overwhelmingly Android** — which for an Indian SMB audience is the majority platform anyway (directionally; don't publish a % without a source — content law).

### 2.7 What NOT to cache / do

- Never let the SW touch `/api/*`, `/admin*`, or anything cookie-personalised.
- Don't precache briefing pages en masse (hundreds of pages × cache bloat); cache-on-visit is enough.
- Don't add `next-pwa`/Workbox/Serwist now (see 2.3).
- Don't build an offline briefing *archive* UI — that's a new free surface (Pounce not-do list); offline = "re-read what you already opened".

---

## 3. Route B — TWA: the PWA on the Play Store (~6–10 h, after Route A)

A **Trusted Web Activity** is Google's sanctioned way to publish a PWA as an Android app: a thin Android package that opens your site full-screen in Chrome's engine, verified by a `assetlinks.json` handshake. Unlike Apple, **Google explicitly welcomes this** — no minimum-functionality rejection risk.

Steps:
1. Route A must be done (a TWA is literally the PWA; install-quality manifest + SW required).
2. Use **Bubblewrap CLI** (`@bubblewrap/cli`) or PWABuilder.com to generate the Android project from the live manifest — no Android code written by hand.
3. Serve `/.well-known/assetlinks.json` with the app's signing-key fingerprint (a static file in `public/.well-known/` — verify Vercel serves it with `content-type: application/json`).
4. Play Console: one-time **$25** developer fee. ⚠️ New individual accounts must pass a **closed-testing requirement (a tester cohort for ~14 days) before a production listing is allowed** — check the current rule when you get there; plan the wait into expectations, not the calendar.
5. Store assets: feature graphic, screenshots (mobile viewport captures of `/`, an assessment, a briefing), privacy-policy URL (exists), data-safety form (you're a privacy company — fill it like the audit exhibit it is).
6. Push from Route A keeps working inside the TWA as web push. (A later upgrade to native FCM inside the TWA exists if ever needed.)

**Payoff:** "Download SaralPrivacy on Google Play" — a trust signal for the exact SMB audience, at ~2 % of Capacitor's cost. iOS has no TWA equivalent (Apple requires more than a wrapped site — which is Route C's problem).

---

## 4. Route C — Capacitor wrap (~60–120 h) — documented, not recommended now

Capacitor puts the site in a native WebView shell with JS↔native plugin bridges.

**The architectural fork, honestly:**
- **Bundled mode** (app ships its own HTML/JS): requires `next export`-style static output. **This app cannot do that** — API routes, server rendering, streaming. Rework cost would be enormous. Dead end.
- **Remote mode** (`server.url` pointing at saralprivacy.com): technically trivial… and this is precisely the "repackaged website" Apple's **App Review Guideline 4.2 (minimum functionality)** rejects apps for. Google tolerates it; Apple frequently doesn't. Mitigation = ship real native value: native push (APNs/FCM plugins), offline briefing storage, share-sheet integration, biometric unlock for reports. That mitigation work *is* most of the 60–120 h.

What the honest budget buys: Capacitor project scaffold in a `mobile/` dir, iOS + Android builds, native push plugin wiring (replacing/duplicating the web-push path with FCM + APNs and a second subscription store), deep-link config, icon/splash pipelines, Apple Developer account (**$99/yr**), signing/provisioning, TestFlight, two store reviews, and a permanent second deploy target to maintain.

**When it becomes right:** a real customer segment says "we only trust App Store apps," or an iOS-push requirement appears that home-screen-PWA push can't satisfy. Neither is true today. Gate it on evidence, not aspiration.

---

## 5. Route D — React Native / Expo (~300–500 h) — post-Gate-3 by definition

A true native app: Expo + EAS builds, Expo Router for navigation, native push via Expo Notifications, both stores.

**What's genuinely reusable from this repo** (more than the earlier "zero" framing):
- The **assessment engine and all 12 sector packs are pure TypeScript** — extractable into a shared package and imported by an RN app unchanged. Same for `sectors.ts`, sector accents, and most `lib/data/*`.
- **Not reusable:** every page, component, and Tailwind style — the entire UI layer is a rebuild, plus a parallel design system, QA matrix, and release train. That's why this is a *second product*, and why it sits behind Gate 3 with the other bets.

If Gate 3 passes and mobile engagement data (from Routes A+B — you'll have real install/push numbers by then) justifies it, the decision will be data-backed instead of a guess. That's the strongest argument for building A+B first: **it's the cheapest way to buy the evidence for or against D.**

---

## 6. Comparison matrix

| | A. PWA | B. TWA | C. Capacitor | D. React Native |
|---|---|---|---|---|
| Effort (tentative) | 25–35 h | +6–10 h | 60–120 h | 300–500 h |
| Code reuse | 100 % | 100 % | ~95 % (site) + native glue | engine/data only |
| Play Store | — | ✅ | ✅ | ✅ |
| App Store | — | — | ⚠️ 4.2 rejection risk | ✅ |
| Push: Android | ✅ web push | ✅ | ✅ native | ✅ native |
| Push: iOS | ⚠️ 16.4+, installed only | — | ✅ native | ✅ native |
| Offline | shell + visited pages | same | same + native storage | full native |
| Recurring cost | none | $25 once | $99/yr + maintenance | $99/yr + a product team |
| New deploy targets | 0 | ~0 (rebuild only on manifest change) | 2 | 2 |
| Pounce-compatible | ✅ funnel enhancement | ✅ trust signal | ⚠️ pre-revenue investment | ⛔ second product |

---

## 7. Build plan — Route A + B (sequence only; no dates — scheduling is Dilip's)

Every phase: build on `feat/pwa-*` branch → **Vercel preview** → Dilip verifies on a real Android phone *and* a real iPhone → explicit approval → merge. No exceptions (preview-before-prod law). Note: Vercel doesn't always auto-build feature branches — fall back to `npx vercel deploy` if no preview appears.

### M1 — Installable foundation (~6–10 h)
1. Produce icon set (192/512/maskable/apple-touch) from the emblem; validate maskable safe zone. *(2–3 h — the fiddly part)*
2. `app/manifest.ts` with real design tokens; `icons.apple` in layout metadata. *(1 h)*
3. `/offline` page (static, on-brand, links home). *(1 h)*
4. `public/sw.js` (offline + caching only, no push yet) + `RegisterSW` component + `docs/sw-killswitch.js`. *(2–3 h)*
5. Verify on preview: Lighthouse PWA installability pass; install on Android (WebAPK, correct icon); Add-to-Home-Screen on iOS (standalone launch, no white icon ring); airplane-mode → visited page renders, unvisited page → `/offline`; `/api/*` bypasses cache (check DevTools). *(1–2 h)*
   - **Monitorable outcome:** app installs on both platforms with a correct icon and opens standalone; offline fallback works; zero behaviour change for normal web visitors.

### M2 — Install surfaces + measurement (~4–6 h)
1. `beforeinstallprompt` capture + install affordance at a delivered-value moment (post-assessment result). *(2 h)*
2. iOS Add-to-Home-Screen hint (dismissible, remembered). *(1–2 h)*
3. Custom events: `pwa_install`, `pwa_standalone_session`, hint dismiss/accept. **Fire-verified on preview** before merge. *(1 h)*
   - **Monitorable outcome:** install events visible in Vercel Analytics; a measured install baseline exists for the first time.

### M3 — Daily Brief push (~12–18 h)
1. VAPID keys on Vercel (+ redeploy + runtime verification). *(1 h)*
2. `push_subs` Appwrite collection + subscribe/unsubscribe API routes. *(3–4 h)*
3. Opt-in toggle UI (explicit tap → permission → subscribe → confirm state). *(3–4 h)*
4. `push`/`notificationclick` handlers in `sw.js` (bump `VERSION`). *(1–2 h)*
5. `POST /api/push/broadcast` with timing-safe shared-secret auth + 404/410 pruning + pagination. *(3–4 h)*
6. Pipeline hook: `run_pipeline.sh` calls broadcast after publish; dry-run mode first. *(1–2 h)*
7. End-to-end on preview: subscribe on Android Chrome + installed iOS PWA → trigger broadcast → notification arrives closed-app → tap opens the briefing. *(2 h)*
   - **Monitorable outcome:** a real briefing push lands on both platforms; subscription count queryable in Appwrite; opt-in/opt-out events in analytics.

### M4 — TWA on Play Store (~6–10 h, gated on M1–M3 live and stable)
1. Play Console account + closed-testing cohort plan. *(1–2 h)*
2. Bubblewrap build + `assetlinks.json` + signing. *(2–3 h)*
3. Store listing assets + data-safety form. *(2–3 h)*
4. Closed test → production release. *(1–2 h + Google's waiting period)*
   - **Monitorable outcome:** SaralPrivacy installable from Google Play; listing link usable in outreach/footer.

### M5 — Decision gate (no build)
Review install count, standalone sessions, push opt-ins, push CTR. Only with that data decide: Capacitor (C)? RN (D)? Or PWA is the ceiling and nothing more is needed. Record the decision in this spec.

---

## 8. Risks & gotchas register

| # | Risk | Mitigation |
|---|---|---|
| 1 | Broken SW persists across deploys | `VERSION` bump discipline + pre-written kill switch (2.3) |
| 2 | SW caches admin/API responses | Hard path exclusions in `fetch` handler; verified in M1 step 5 |
| 3 | iOS push expectations oversold | 2.6 messaging; Android-first framing in any announcement |
| 4 | Permission prompt on load tanks opt-in permanently | Explicit-tap-only rule (2.5.4) |
| 5 | Broadcast route becomes the next unauth-endpoint audit finding | Shared secret, timing-safe compare, no cookie auth (2.5.5) |
| 6 | VAPID env vars "set" but not live | Known trap: redeploy + runtime verify |
| 7 | Push subscription table grows unbounded with dead endpoints | 404/410 pruning on every broadcast |
| 8 | Stale content served after publish | Network-first for HTML — cache is fallback only |
| 9 | Icon looks broken in Android launcher | Maskable-zone validation before merge |
| 10 | Play Console closed-testing delay surprises | Known upfront (M4.1); it's Google's clock, not ours |
| 11 | Notification fatigue → revokes | One per day, hard rule; body = value, not marketing |

---

## 9. Open questions for Dilip (answer before M1 starts)

1. **Timing vs Pounce:** proceed with M1–M3 now, or hold until P0-security + Razorpay ship? (This spec is ready either way — that was the point of writing it on a branch.)
2. **Push scope v1:** one daily notification for every subscriber, or per-sector opt-in from day one? (Recommend: single stream v1; `topics` attribute reserves the future.)
3. **Install affordance placement:** post-assessment-result moment (recommended), footer, or both?
4. **TWA (M4):** greenlight in principle now, or decide after M3 data?

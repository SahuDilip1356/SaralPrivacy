# Mobile App Execution Plan — PWA → TWA

**Companion to:** `MOBILE_APP_SPEC.md` (the *why* and the deep dive). This file is the *tracker*: every remaining step, its owner, and the gate that proves it done.
**Scope locked by founder decision:** PWA + TWA only. No Capacitor, no React Native — App Store route parked until the M5 data says otherwise. iOS users get the installable PWA via Add-to-Home-Screen.
**Format:** sequence + tentative hours + monitorable steps. No dates — scheduling is Dilip's.

**Standing rules for every phase**
- One branch per phase (`feat/pwa-m3`, `feat/pwa-m4`), preview build, Dilip verifies on real Android + real iPhone, explicit go, PR merged by Dilip. Never self-merge.
- Every new analytics event is watched firing on preview (`POST /_vercel/insights/event` in the network tab) before merge.
- Any `sw.js` change bumps `VERSION`. Rollback for anything SW-related = deploy `docs/sw-killswitch.js` as `sw.js`.

**Where things stand**
- ✅ Spec (`feat/mobile-app-spec`, `990cfbb`) — unmerged, merge together with Phase 1.
- ✅ M1+M2 code (`feat/pwa-m1`, `75ad0ac`) — preview build green.
- ▶ Next action: Phase 0 below.

---

## Phase 0 — Verify M1+M2 on preview 🔶 DILIP · ~30–45 min

Preview: `https://webapp-8qwt0waon-dilipsahu31s-projects.vercel.app` (or the `webapp-git-feat-pwa-m1-…` alias on the Vercel dashboard).

**Android (Chrome):**
- [ ] 0.1 Footer bottom bar shows "Install app" (may take a few seconds — Chrome fires the prompt event after heuristics pass).
- [ ] 0.2 Tap → native install sheet → install. Launcher icon = SP badge on navy with white disc, **not** clipped, no white ring.
- [ ] 0.3 Launch from icon → opens full-screen, no browser chrome.
- [ ] 0.4 Open a briefing, airplane mode ON → briefing still renders; navigate to an unvisited page → dark "You're offline" screen.

**iPhone (Safari):**
- [ ] 0.5 Footer "Install app" tap → shows the Share → Add-to-Home-Screen hint.
- [ ] 0.6 Add to Home Screen → icon has solid navy background (no black corners) → launches standalone.

**Either device / desktop:**
- [ ] 0.7 `/manifest.webmanifest` loads; DevTools → Application → Service worker shows `sp-v1` active; `/api/*` requests show "no SW interception".
- [ ] 0.8 Vercel Analytics dashboard shows `pwa_standalone_session` and `pwa_install_click` after the above.

**Exit gate:** all boxes ticked → Dilip says go.
**If anything fails:** report what you saw; fix loops back through the same checklist.

## Phase 1 — M1+M2 to production · ~1 h · Claude preps, 🔶 Dilip merges

- [ ] 1.1 PR `feat/pwa-m1` → `main`; fold `MOBILE_APP_SPEC.md` + this plan in (rebase or second PR — reviewer's pick).
- [ ] 1.2 Dilip merges. Vercel prod deploy.
- [ ] 1.3 Prod smoke: install on one Android device from saralprivacy.com; `sp-v1` active; Lighthouse "installable" pass.
- [ ] 1.4 Watch prod analytics until first organic `pwa_install` appears — that number is the baseline M5 needs.

**Exit gate:** installed from the real domain; events flowing on prod.

## Phase 2 — M3: Daily Brief push · ~12–18 h · branch `feat/pwa-m3`

Order matters — each step is testable before the next starts.

- [ ] 2.1 **Keys & secrets** (~1 h) 🔶 shared: generate VAPID pair (`npx web-push generate-vapid-keys`); Dilip adds to Vercel: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:), `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `PUSH_BROADCAST_SECRET` (32+ random bytes). ⛔ Known trap: env var listed ≠ live — redeploy, then hit a debug route that confirms presence (not values).
- [ ] 2.2 **Appwrite `push_subs` collection** (~1 h): attributes `endpoint` (unique index), `p256dh`, `auth`, `created` — short keys, Singapore project, document-level security off (server key only).
- [ ] 2.3 **Subscribe API** (~3 h): `POST/DELETE /api/push/subscribe` — validates the endpoint is an HTTPS push-service URL, upserts/removes; lazy-init Appwrite Proxy pattern; add `web-push` dependency (server-only).
- [ ] 2.4 **Opt-in UI** (~3–4 h): "Notify me when the Daily Brief publishes" toggle on `/briefings` + settings row in footer area. Permission requested **only on tap**; states: unsupported (hidden) / off / on / denied-by-browser (shows how to unblock). iOS not-installed → explains install-first.
- [ ] 2.5 **SW push handlers** (~1–2 h): `push` → `showNotification` (title, one-line body, briefing URL in `data`); `notificationclick` → focus-or-open. Bump to `sp-v2`.
- [ ] 2.6 **Broadcast route** (~3–4 h): `POST /api/push/broadcast` — header secret compared with `crypto.timingSafeEqual`; paginates all subs; sends with concurrency ~20; deletes every 404/410 sub; `?dryRun=1` returns counts without sending; returns `{sent, pruned, failed}`.
- [ ] 2.7 **Pipeline hook** (~1–2 h): `run_pipeline.sh` curls broadcast after briefing publish; dry-run first run; log the response JSON into the pipeline log.
- [ ] 2.8 **E2E on preview** (~2 h) 🔶 shared: subscribe on Android Chrome + installed iOS PWA → trigger broadcast (dry-run, then real) → notification lands with app closed on both → tap opens the briefing → unsubscribe works → events (`push_optin`, `push_optout` — added in this phase) fire.

**Exit gate:** a real briefing notification received closed-app on both platforms from preview; then Phase-1-style merge + one prod broadcast on the next real Daily Brief.

## Phase 3 — M4: TWA on Play Store · ~6–10 h active + Google's clock · branch `feat/pwa-m4`

- [ ] 3.1 🔶 DILIP: Play Console developer account ($25 one-time — account creation and payment are yours; I can't do these). Note: new individual accounts must run a closed test (tester cohort, ~14 days) before production — check the current tester count when you register.
- [ ] 3.2 Bubblewrap init against `https://saralprivacy.com/manifest.webmanifest` → Android project in `mobile/twa/`; generate upload keystore. ⛔ Back the keystore + passwords up outside the repo (losing it = losing the app identity; never commit it).
- [ ] 3.3 `public/.well-known/assetlinks.json` with the signing fingerprint; verify Vercel serves it as `application/json` (no redirect). This is what removes the browser bar — without it the TWA shows Chrome UI.
- [ ] 3.4 Build `.aab`, upload to closed-testing track; recruit testers 🔶 DILIP (CA-partner WhatsApp group is the obvious pool).
- [ ] 3.5 Store listing: name, short/full description (brand-voice pass), feature graphic + phone screenshots (capture from prod at mobile viewport), privacy-policy URL, **data-safety form** — fill it precisely; a privacy company's data-safety card is marketing.
- [ ] 3.6 After Google's testing window: promote to production.
- [ ] 3.7 Post-listing: verify installed-from-Play app opens full-screen (asset link verified), web push still works inside it; add "Get it on Google Play" badge to footer/landing (separate small PR, contrast-checked).

**Exit gate:** public Play Store listing installable by a stranger; badge live on site.

## Phase 4 — M5: decision gate · review only, no build

After meaningful data accumulates (Dilip decides when), review: installs (web + Play), `pwa_standalone_session` repeat rate, push opt-ins, push→briefing open rate, uninstall/opt-out rate. Decide one of: **stop here** (PWA+TWA is the ceiling) / **Capacitor** (only if App-Store demand is documented) / **RN** (only post-Gate-3 with revenue). Record the decision + numbers in `MOBILE_APP_SPEC.md` §7 M5.

---

## Dilip-only actions (everything blocked on you, in order)

1. Phase 0 device checklist → go/no-go (unblocks everything).
2. Merge PRs at each phase gate.
3. Vercel env vars (2.1) — or explicitly authorize me to set them via CLI.
4. Play Console account + $25 (3.1); tester recruitment (3.4).
5. M5 review call.

## Top risks on the active path (full register: spec §8)

| Risk | Guard |
|---|---|
| Broken SW persists on installed clients | kill switch ready; VERSION bump discipline |
| Push opt-in permanently lost to an eager prompt | request only on explicit tap (2.4) |
| Broadcast route = unauth endpoint (audit scar) | timing-safe secret; no cookie auth (2.6) |
| Keystore loss = dead Play listing | off-repo backup rule (3.2) |
| Dead subscriptions bloat sends | 404/410 pruning every broadcast (2.6) |

## Effort roll-up (tentative)

| | Claude build | Dilip actions |
|---|---|---|
| Phase 0–1 | ~1 h | ~1 h |
| Phase 2 (M3) | 12–18 h | ~1–2 h |
| Phase 3 (M4) | 6–10 h | ~2–3 h + Google's wait |
| **Total remaining** | **~19–29 h** | **~4–6 h** |

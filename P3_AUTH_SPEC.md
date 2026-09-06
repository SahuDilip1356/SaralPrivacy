# P3 AUTH SPEC — Supabase Auth + TOTP MFA for the admin surface

**Status:** eng-reviewed (this document is the `/plan-eng-review` output) — build in progress
**Branch:** `claude/supabase-auth-totp-mfa-891f76` (cut from `main` @ `1057af6`)
**Goal (Blueprint P3):** the shared env password disappears. Every admin-surface login is an
individual Supabase Auth user (email + password) **plus a verified TOTP factor (aal2)**.
Roles come from a server-controlled claim. The database carries its first real RLS policies,
keyed on that claim, and a cross-role test proves they deny as designed.
**Decision O1 (pre-made):** Supabase Auth, not Clerk — same vendor as the DB, RLS-native, no per-MAU pricing.
**Exit criteria:** (1) `ADMIN_PASSWORD` deleted from Vercel and from code; (2) the cross-role RLS
test fails-closed as designed; (3) Dilip verifies login + MFA on **preview** before merge (the law).

---

## 1. Architecture

```
Browser (/admin/login, 3 states)          Next.js route handlers (Node, Vercel bom1 later)     Supabase (Mumbai)
────────────────────────────────          ─────────────────────────────────────────────────    ─────────────────
[1] email+password ───POST───────────────▶ /api/admin/login
                                              rateLimit(ip) → signInWithPassword (anon client) ─▶ GoTrue /token
                                              role = user.app_metadata.role  (admin|blogger)
                                              no role → 403 · role ok → set `admin_mfa_pending`
                                              cookie (10 min) = {at, rt}; reply {step: enroll|verify}
[2a] step=enroll ──POST──────────────────▶ /api/admin/mfa/enroll
     shows QR + secret                        client.setSession(pending) → unenroll stale
                                              unverified factors → mfa.enroll(totp) ────────────▶ GoTrue /factors
                                              reply {factorId, qrSvg, secret}
[2b] 6-digit code ──POST─────────────────▶ /api/admin/mfa/verify
                                              rateLimit(ip) → setSession(pending)
                                              factorId ?? first verified totp factor
                                              mfa.challengeAndVerify(code) ─────────────────────▶ GoTrue /factors/:id/verify
                                              require aal == 'aal2'
                                              ★ mint admin_session = createAdminSessionToken(role, name, uid)
                                              revoke Supabase session (signOut) · clear pending
[3] /admin/* ──────────────────────────────▶ proxy.ts + requireRole()  — UNCHANGED (verifies the HMAC cookie)

Invite path (admin only):
  POST /api/admin/bloggers → auth.admin.generateLink({type:'invite'}) → set app_metadata.role
                            → Resend email with /admin/set-password?token_hash=…&type=invite
  POST /api/admin/set-password {token_hash,type,password} → verifyOtp → updateUser({password})
  (same path re-used for the admin's own first password via tools/auth/provision.ts, type=invite,
   and for resets via type=recovery)

Database:
  0005_auth_roles_rls.sql → helper fns ops.jwt_role() / ops.jwt_aal2() · grants to `authenticated`
                            · policy admin_all on every ops.* / app.* table (role=admin ∧ aal2)
                            · blogger policies on ops.blog_posts (all) + ops.blogger_accounts (self, select)
  supabase/tests/rls_crossrole.sql → in-DB test via set_config('request.jwt.claims') — no TOTP needed
```

**Why keep minting the HMAC cookie (vs Supabase JWT end-to-end):** `requireRole` has 12 call sites,
`proxy.ts` runs on every request, and the admin layout re-verifies the same token. Swapping the
session substrate would touch all of them for zero security gain today — the HMAC token is only ever
minted *after* aal2. The Supabase session lives for one login flow (≤10 min) and is revoked at mint.
Adopting the Supabase JWT app-wide is P5's tenancy work, when RLS must gate per-request reads.

**Why no client-side Supabase at all:** every auth call is server-side with the publishable key, so no
`NEXT_PUBLIC_*` env, no browser SDK bundle, no session persistence in localStorage. The login page
stays a plain form posting to our own API.

### File map
```
webapp/lib/auth/supabaseAuth.ts        per-request anon client · signIn · pending-session restore · enroll · verify · roleOf()
webapp/lib/auth/pending.ts             `admin_mfa_pending` cookie: name, TTL, encode/decode (pure, unit-tested)
webapp/lib/adminSession.ts             drop the ADMIN_PASSWORD-derived key · add `u` (user id) claim
webapp/lib/sendGateway.ts              drop the ADMIN_PASSWORD-derived link key (EMAIL_LINK_SECRET only)
webapp/app/api/admin/login/route.ts    password step → pending cookie · DELETE unchanged
webapp/app/api/admin/mfa/enroll/route.ts
webapp/app/api/admin/mfa/verify/route.ts
webapp/app/admin/login/page.tsx        states: password → enroll(QR) | verify(code)
webapp/app/api/admin/bloggers/route.ts invite = Supabase invite link + Resend (bcrypt/invite_token gone)
webapp/app/api/admin/set-password/route.ts  verifyOtp(token_hash) + updateUser(password)
webapp/app/admin/set-password/page.tsx  reads token_hash + type (was token + email)
webapp/tools/auth/provision.ts         service-role: create user → role → invite email (first admin + migrations)
supabase/migrations/0005_auth_roles_rls.sql
supabase/tests/rls_crossrole.sql
```

---

## 2. Data flow — where state lives

| State | Lives in | Lifetime | Notes |
|---|---|---|---|
| Identity + password hash | `auth.users` (Supabase) | permanent | never in our tables; `ops.blogger_accounts.password_hash` becomes dead (dropped at Contract) |
| Role | `auth.users.raw_app_meta_data.role` | permanent | **app_metadata is service-role-writable only** — a user can't self-elevate. Set by `provision.ts` / invite route |
| TOTP secret | `auth.mfa_factors` | until unenrolled | we only ever see the QR/secret once, at enrollment, over TLS |
| MFA-pending session | `admin_mfa_pending` cookie (HttpOnly, Secure, SameSite=Lax, Path=/api/admin, Max-Age 600) | ≤10 min | holds Supabase `{access_token, refresh_token}`; aal1 token can read nothing (no anon/authenticated grants below aal2) |
| Admin session | `admin_session` HMAC cookie | 8 h | unchanged format `v1.<payload>.<sig>`, payload gains `u` |
| Invite / recovery token | Supabase `token_hash` in our Resend email | Supabase default 24 h (invite) / 1 h (recovery) | replaces `blogger_accounts.invite_token` |
| Rate-limit windows | in-memory per instance (`abuseGuard`) | 15 min | login 5/15m · verify 10/15m |

**Secrets (Vercel):** add `SUPABASE_ANON_KEY` (publishable key), `ADMIN_SESSION_SECRET` (32 random
bytes), `EMAIL_LINK_SECRET` (32 random bytes) on Preview first; Production at merge. Then delete
`ADMIN_PASSWORD`, `BLOGGER_EMAIL`, `BLOGGER_PASSWORD`. `ADMIN_EMAIL` stays (notification recipient in
`lib/email.ts`). ⛔ env live ≠ env listed: redeploy, then hit `/api/admin/login` before trusting it.

---

## 3. Edge cases (≥1 per code path)

| Path | Case | Behaviour |
|---|---|---|
| login | wrong password / unknown email | 401 "Invalid credentials." (same message both — no enumeration) |
| login | user exists, `app_metadata.role` missing or not admin/blogger | 403 "Access denied.", Supabase session revoked, nothing set |
| login | 6th attempt in 15 min from one IP | 429 + Retry-After (existing guard) |
| login | `SUPABASE_ANON_KEY` unset | 500 with a named error in logs; page shows "Login is not configured." |
| login | email not confirmed (invite never completed) | GoTrue returns error → 401 |
| enroll | no/expired pending cookie | 401 `{step:"login"}` → page resets to password state |
| enroll | stale *unverified* factor from an abandoned attempt | unenrolled first, then a fresh enroll (avoids "friendly name exists") |
| enroll | user already has a verified factor (someone replays enroll) | 409 → page goes to verify state; can't add a 2nd factor from the login flow |
| verify | wrong code | 401 "Code did not match." — pending cookie kept so they can retry; rate-limited 10/15m |
| verify | code from a factor that isn't theirs (`factorId` forged) | GoTrue rejects (factor scoped to the session's user) → 401 |
| verify | aal still `aal1` after verify (shouldn't happen) | 401, no cookie minted — mint requires `aal2` literally |
| verify | pending token expired (>1 h Supabase access TTL, <10 min ours) | our cookie expires first; `setSession` refresh handles the edge anyway |
| mint | `ADMIN_SESSION_SECRET` unset | `createAdminSessionToken` throws → 500; **no derived fallback any more** |
| invite | email already an auth user | 409 "already exists" (generateLink errors) — admin uses recovery instead |
| invite | Resend fails | 200 with `emailSent:false` + the invite URL in the response for manual sharing (existing behaviour) |
| set-password | token_hash reused / expired | 401 "Invalid or expired link." |
| set-password | password < 12 chars | 400 |
| set-password | `type` not in {invite, recovery} | 400 |
| logout | cookie delete | unchanged; Supabase session was already revoked at mint |
| proxy / requireRole | old-format tokens from before deploy | rejected by signature (secret rotated) → re-login. Expected once |
| RLS | admin aal1 reads `ops.leads` | 0 rows (denied) |
| RLS | blogger aal2 reads `ops.leads` | 0 rows (denied) |
| RLS | blogger aal2 reads/writes `ops.blog_posts` | allowed |
| RLS | admin aal2 reads `ops.leads` | allowed |
| RLS | anon | no grants → 42501 |
| RLS | service role (the app today) | bypasses — no behaviour change for any live route |
| provision | run twice for same email | second run: user exists → sends recovery link instead of failing |
| build | `next build` with zero env | lazy client, nothing throws at module load (the Appwrite lesson) |

---

## 4. Test matrix

**Unit (node --test, no network)**
- `lib/auth/pending.ts`: encode/decode round-trip; garbage → null; missing fields → null.
- `lib/auth/supabaseAuth.ts` pure parts: `roleOf(user)` (admin / blogger / missing / garbage), `nextStep(factors)` (no factors → enroll; verified totp → verify), `pickFactor()`.
- `lib/adminSession.ts` (existing behaviour + new): mint/verify round-trip carries `u`; **no secret → throws** (fallback removed); tampered sig → null; expired → null.
- `lib/sendGateway.ts`: `signEmailForUnsubscribe` returns null without `EMAIL_LINK_SECRET` (fallback removed).

**Integration (live Supabase, run from this session + documented for repeat)**
- `supabase/tests/rls_crossrole.sql` — 6 assertions via `set_config('request.jwt.claims', …)` under `set local role authenticated`; raises on any violation. Run via psql or the MCP; evidence pasted into the handoff.
- Migration 0005 applies clean on the live project; `get_advisors(security)` shows no new "RLS enabled no policy" for ops/app.

**E2E (preview deployment, Dilip)**
- First login as admin: password → QR → code → dashboard. Logout → login → code only.
- Wrong code → error, retry works. Old bookmark `/admin/leads` unauthenticated → login redirect.
- Blogger invite → email → set password → login with MFA → sees only blog nav.
- Curl checks: forged `admin_session` → 401 on `/api/admin/data`; `/api/admin/mfa/verify` without pending → 401.

---

## 5. DX friction
- **TTHW:** `npm ci` in a `/private/tmp` copy (iCloud tree can't run tsc) ≈ 1 min; `node --test` suite < 10 s.
- **Local dev:** needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`, `EMAIL_LINK_SECRET` in `.env.local`. Worktrees don't carry `.env.local` — copy it.
- **Deploy:** Vercel preview on push; the migration is applied to the live project by the MCP in this session (there is no branch-DB CI yet — noted, not fixed here).
- **Provisioning the first admin:** one command, emails an invite; Dilip sets his own password on `/admin/set-password`. Nobody types a password anywhere but that page.

## 6. Dependencies
**None new.** `@supabase/supabase-js` (already a dependency) covers sign-in, MFA enroll/challenge/verify, admin generateLink/updateUser. QR comes back from GoTrue as SVG — no QR library. `bcryptjs` loses its last importer (login + set-password) and is removed from `package.json` in this PR.

## 7. Work plan (sequence + tentative hours)
| # | Work | h | Exit evidence |
|---|---|---|---|
| 1 | Migration 0005 (roles fns, grants, policies) + `rls_crossrole.sql` applied + run live | 1.5 | test raises on violation, passes on allow |
| 2 | `lib/auth/*` + unit tests; adminSession/sendGateway fallback removal + tests | 2 | `node --test` green |
| 3 | login / mfa routes + login page states | 3 | curl flow on local dev |
| 4 | invite + set-password swap; `provision.ts`; drop bcryptjs | 2 | invite → set-password round-trip on preview |
| 5 | Preview env (3 secrets) → push → preview → Dilip E2E | 1 | Dilip's confirmation |
| 6 | Merge → Production env → redeploy → verify → delete `ADMIN_PASSWORD`/`BLOGGER_*` → redeploy → verify | 1 | login works on prod with the var gone |
| | **Total** | **~10.5** | |

## 8. Out of scope (explicit)
Recovery codes (Supabase has none — a second TOTP factor is the documented backup; add "manage factors" UI in P5) · social login · Supabase JWT as the app session · per-user audit log table (the `u` claim is the hook for it) · branch-DB CI.

# Flip Runbook — per-module cutover (spec §8)

The same ritual for every module, in order:
**M1 templates → M2 subscribers → M3 leads → M4 notices → M5 outreach → M6 assessments → M7 editorial → M8 admin.**

## Preconditions (once, before M1)
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `webapp/.env.local` (loader) AND Vercel env, all environments (app).
- [ ] Full backfill green: `load.ts` (direct) then `verify.ts` → ALL GREEN report.
- [ ] Privacy notice sub-processor swap (Appwrite→Supabase, Mumbai) ships with the FIRST prod flip PR — `lib/data/privacy-vendors.ts`.

## Per module
1. **Delta-sync**: `export.ts <collections>` → `load.ts <collections>` → `verify.ts <collections>` green.
2. **Preview flip**: set `DATA_BACKEND_<MODULE>=supabase` in Vercel *Preview* env only → redeploy preview → verify the flag is LIVE (env law: listed ≠ live).
3. **Parity on preview**: run `smoke.sh <preview-url> <module>` + module-specific checks below. Byte-parity on responses; error paths match.
4. **Founder sign-off** on the preview (the law — no prod flag without it).
5. **Write-freeze + prod flip**: one more delta-sync (`export` + `load` for the module's collections — takes seconds), then set the flag in *Production* env → redeploy → `smoke.sh https://saralprivacy.com <module>`.
6. **48h watch**: function logs for the module's routes; re-run `verify.ts` counts once/day — a growing Appwrite-side count after the flip means a consumer missed the seam (CI guard should prevent; investigate, fix, delta-sync).
7. **Rollback** at any point: flip the flag back + redeploy. If Supabase-side writes happened meanwhile: export those rows (created_at > flip time) and replay to Appwrite before diagnosing.

## Module-specific parity checks
- **M1 templates**: POST a template-download on preview → row lands in `ops.template_downloads` (check via SQL) → email still sends.
- **M2 subscribers**: subscribe (new + resubscribe of an unsubscribed address) → duplicate-subscribe stays deduped; unsubscribe via signed link; `isSuppressed` honours bounced rows (6 legacy null-status rows must behave as eligible).
- **M3 leads**: contact form + survey submit → rows land; consent_log entries written.
- **M4 notices**: notice-generator capture + events; chat feedback now actually persists (the collection finally exists — expect first-ever rows).
- **M5 outreach**: stats endpoint counts match SQL counts (Appwrite capped at 5,000 — Supabase shows TRUE counts: expect the admin stats numbers to JUMP: total ~10,348. That jump is correct, not a bug); magic-token subscribe/unsubscribe round-trip; cron between windows (04:00 IST): DAILY_CAP send + status transitions + email_send_log rows.
- **M6 assessments**: complete an assessment on preview → `/report/[token]` renders; a PRE-FLIP report URL (legacy Appwrite id data) still renders via legacy_id lookup; admin send-report works.
- **M7 editorial** (the big one — own preview cycle): run `files.ts` storage migration first (165 infographics → `infographics` bucket + `blog_posts.infographic_url` rewrite + HTTP-200 check on every URL); briefings list/detail SSR pages, blog list/detail, sitemap.xml diff vs prod (slug sets equal), chat briefings-live answers, infographic regeneration writes to Supabase Storage; revalidate/ISR purge after prod flip; approval-email link with an OLD briefing id still approves.
- **M8 admin**: dashboard counts (same true-count jump as M5), data tables per collection, blogger login (bcrypt hash migrated), bloggers CRUD.

## After M8
7 consecutive green days → Appwrite key read-only → final archive export → 30 days → delete project → cleanup PR (remove lib/appwrite + node-appwrite + flags + report_type cap; `vercel.json` regions `sin1`→`bom1`, redeploy, verify).

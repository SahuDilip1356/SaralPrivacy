# Author Identity Fix — spec

**Status:** Awaiting Dilip's decisions (D1–D4) before build · **Owner:** unassigned (a prior session claimed it; that work never landed on any branch)
**Ship protocol:** branch off `main` → preview → Dilip verifies → merge. ⛔ Preview-before-prod law. Never self-merge.
**Sequencing:** sequence + tentative hours only, no calendar.

---

## The finding

`SaahoDilipKumaar` is a typo'd author name in the site's `Person` structured data. But fixing only that leaves the real problem in place: **the site currently publishes four different author identities**, and a single briefing page emits three of them at once.

Verified against live prod HTML, not inferred:

| # | String | Where it comes from | Where it appears | Correct? |
|---|--------|--------------------|------------------|----------|
| 1 | `SaahoDilipKumaar` | `lib/data/authors.ts:14` (single constant) | `Article`/`WebPage` JSON-LD `author.name` on every page that emits schema | ❌ **typo** |
| 2 | `SaralPrivacy Editorial Team` | `app/layout.tsx:26` + `app/briefings/[slug]/page.tsx:220` | `<meta name="author">`, `<meta property="article:author">` sitewide | ⚠️ conflicts with #1 |
| 3 | `DPDPA Editorial Team` | hardcoded fallback, `app/briefings/[slug]/page.tsx:118` | **visible byline** on every briefing (the Appwrite `author` field is empty, so the fallback always wins) | ⚠️ third variant |
| 4 | `Dilip Sahu` | `lib/data/privacy-vendors.ts` (DPO record) + `/about` body copy | DPO contact block, `/about` prose | ✅ correct, but it is a DPO/contact role — not a byline |

**What a crawler sees on one briefing page:** JSON-LD says the author is a Person called `SaahoDilipKumaar`; the meta tags say the author is `SaralPrivacy Editorial Team`; the visible byline says `DPDPA Editorial Team`. Three answers to one question. For a compliance publication this is an E-E-A-T problem well beyond a spelling mistake.

### Two structural gaps found alongside it

- **`/about` emits no `Person` schema at all.** Verified: zero `"@type":"Person"` blocks. Every article's `author.url` points to `/about`, so the identity pointer resolves to a page with nothing machine-readable to confirm it. Renaming the constant does not fix this.
- **`sameAs` is empty in two places** — the author's (`lib/data/authors.ts:17`) and the Organization's (`lib/schema.tsx:41`, homepage-only, called from `app/page.tsx:39`). Confirmed absent from the live homepage Organization block.

### Blast radius

The typo lives in exactly **one line of code**. `grep -rn "SaahoDilipKumaar\|Saaho"` across all `.ts/.tsx/.js/.mjs/.json/.md` returns a single hit: `lib/data/authors.ts:14`. It is clean of the string in `public/`, `tools/` generators, email templates, and all generated PDFs/guides.

That one constant feeds `defaultAuthor` → `lib/schema.tsx:79` → the `author` block of every page emitting Article/WebPage schema. Spot-verified present on `/blog/*`, `/briefings/*`, `/learn/consent`, `/white-paper`, `/penalty-calculator`, `/compliance-checklist`; absent on `/glossary`. A parallel audit session counted **153 unique live pages** — plausible and consistent with my sampling, not independently recounted here.

**So: a one-line fix with a 153-page effect, plus three follow-on decisions.**

---

## Decisions needed from Dilip before build

- **D1 — Canonical author name.** Confirm `Dilip Sahu` (matches `/about` copy and the DPO record). *Recommended: yes.*
- **D2 — One identity or two?** Today the schema claims a Person and the meta tags claim a team. Recommended: **one Person, `Dilip Sahu`, everywhere** — a named expert author is worth more than a generic team for a legal/compliance site, and it is the identity the About page already asserts. The alternative (team everywhere) means deleting the Person schema entirely and giving up author-level E-E-A-T.
- **D3 — Briefing visible byline.** Briefings are daily and semi-automated. Options: (a) `Dilip Sahu` — consistent, but attributes ~130 generated pieces to a named person; (b) keep an editorial-team label but make it *one* string; (c) drop the visible byline and let schema carry attribution. *Recommended: (a) if you stand behind the briefings as published under your name, otherwise (b).* This is an editorial call, not a technical one.
- **D4 — `sameAs` URLs.** **Blocker — I cannot supply these.** Need your personal LinkedIn profile URL and the SaralPrivacy company page URL (plus X/GitHub if you want them claimed). ⛔ I will not guess a profile URL: a wrong `sameAs` asserts an identity link that does not exist, which is worse than an empty array.

---

## Batch A — the typo and identity unification (~1.5–2h)

### A1 · Rename the constant — ~10 min
1. `webapp/lib/data/authors.ts:14`: `name: 'SaahoDilipKumaar'` → `name: 'Dilip Sahu'`.
2. Rename the object key and `id` (`saahodilipkumaar` → `dilipsahu`, lines 12–13) and the `defaultAuthor` reference (line 24). Safe: the only external importer is `lib/schema.tsx`, which uses `defaultAuthor`, never the key.
3. Re-read the `description` field (lines 18–21) while in there — it still lists only the first four sectors ("recruitment agencies, CA firms, training institutes, and D2C brands") when 12 are live. Update to reflect 12 sectors.
4. **Accept:** `grep -rn "Saaho" webapp/ --include="*.ts*"` → 0 hits. View-source any blog post on preview → `"author":{"@type":"Person","name":"Dilip Sahu"`.

### A2 · Unify the meta author with the schema author (D2-dependent) — ~20 min
1. `app/layout.tsx:26` — `authors: [{ name: 'SaralPrivacy Editorial Team' }]` → `[{ name: 'Dilip Sahu', url: 'https://saralprivacy.com/about' }]`.
2. `app/briefings/[slug]/page.tsx:220` — `authors: ['SaralPrivacy Editorial Team']` → same value.
3. Prefer importing `defaultAuthor.name` over re-typing the string, so there is one source of truth and this can never drift again.
4. **Accept:** on preview, `<meta name="author">`, `<meta property="article:author">` and the JSON-LD `author.name` all read the same string on a blog post AND a briefing.

### A3 · Briefing visible byline (D3-dependent) — ~15 min
1. `app/briefings/[slug]/page.tsx:118` — replace the hardcoded `"DPDPA Editorial Team"` fallback per D3.
2. Rendered at lines 331 and 549 — both read `briefing.author.name`, so one change covers both.
3. Note: the Appwrite `author` field is **empty on every briefing checked**, so the fallback is what readers actually see. If D3 picks a stored value instead, it needs a backfill across ~130 documents — call that out before choosing.
4. **Accept:** three sampled briefings show the agreed string; no page shows two different bylines.

### A4 · Blog visible byline — ~10 min
1. `app/blog/[slug]/page.tsx:355` renders `{post.author && <span>{post.author}</span>}`. The field is **empty on all sampled posts**, so blog posts currently show no visible author at all while their schema names one.
2. Either backfill `author` in Appwrite for the 8 posts, or fall back to `defaultAuthor.name` in code. *Recommended: code fallback* — no content migration, and it can never drift from the schema.
3. **Accept:** a blog post shows a visible byline matching its JSON-LD author.

---

## Batch B — make the identity resolvable (~1–1.5h)

### B1 · Add `Person` schema to `/about` — ~40 min
1. `/about` is the target of every `author.url` in the site's schema and currently emits **no** `Person` block, so the pointer resolves to nothing verifiable.
2. Emit a `Person` node on `/about` built from `defaultAuthor` (same constant — never a second copy), including `name`, `jobTitle`, `url`, `image`, `description`, `sameAs`, and `worksFor` → the Organization.
3. **Accept:** `/about` on preview contains one `"@type":"Person"` block whose `name` matches `defaultAuthor.name`; Google Rich Results test on the preview URL parses it without error.

### B2 · Populate both `sameAs` arrays (BLOCKED on D4) — ~20 min
1. `webapp/lib/data/authors.ts:17` — author `sameAs` ← personal LinkedIn (+ any other stable public profiles).
2. `webapp/lib/schema.tsx:41` — Organization `sameAs` ← SaralPrivacy company page + any genuine directory/press profiles.
3. Only include URLs that are live, public, and genuinely the stated entity. An empty array is better than a wrong link.
4. **Accept:** both blocks non-empty on preview; every URL returns 200 and resolves to the claimed profile.

---

## Impact and risk

**User-visible:** the visible byline on briefings changes (and appears on blog posts if A4 lands). Nothing else moves — the typo lives in structured data, which readers never see.

**SEO:** this is the upside. Today three conflicting author signals cancel each other out; after this there is one consistent, resolvable Person identity backed by an About page and external profiles. That is the difference between claiming expertise and evidencing it.

**Risk:** low and reversible. No schema changes, no migrations, no new dependencies. The main risk is *behavioural* — attributing ~130 semi-automated daily briefings to a named person (D3 option a) is an editorial commitment, not a technical one. Decide it deliberately.

**Not in scope:** re-crawling. After prod, request re-indexing in Search Console for `/about` and a sample of blog/briefing URLs so the corrected author propagates rather than waiting on organic recrawl.

---

## Verification checklist before merge

1. `grep -rn "Saaho" webapp/` → 0 hits.
2. On preview, one blog post + one briefing + `/about`: JSON-LD `author.name`, `<meta name="author">`, `article:author`, and the visible byline **all agree**.
3. `/about` emits exactly one `Person` block, `sameAs` populated, every URL 200.
4. Google Rich Results test passes on the preview `/about` and one article URL.
5. `next build` passes; route count unchanged.
6. `git status --short webapp/` — new files show `A`, not `??`.

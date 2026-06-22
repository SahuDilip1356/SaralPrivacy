# Spec — SaralPrivacy Notice Pack Builder + Data Rights Form (unified)

**Product:** SaralPrivacy · **Tools:** Notice Pack Builder (Rail card 3) + Data Rights Form / DSAR (Rail card 4)
**Author:** Dilip Sahu · **Date:** 2026-06-21 · **Version:** 3.0 (unified, dev-ready)
**Status:** In build · **Fully supersedes** `spec-notice-generator-and-dsar.md` (both tools)

> **v3.0 adds:** the DSAR companion (Part II), the shared-infra/seam reconciliation, and the P1 planning
> reviews (Part III: CEO addendum · Design · Eng · Dharma3 route). Parts §1–§25 below are the Notice Pack
> (unchanged from v2.0). Read Part II before sequencing the build — it closes the dead-link seam.

> **Grounding:** ConsentX validates the *template → email capture → automate/evidence* funnel and the
> itemized data-purpose / withdrawal / rights / DPB / children / processor structure. The DPO India
> article pushes the direction toward clear language, granular purposes, contextual notices, multilingual
> access, practical rights, children's handling, layered notices, consent-workflow integration, and
> version control. The cautionary DPDPA consent form (which mislabels consent as §7 and lists GDPR-style
> portability/restriction rights) is *why* this tool needs a **legal-validity layer**, not just static generation.

### Reconciliation note (v1.0 → v2.0)
- **Notice Readiness Score:** moved P1 → **P0** (founder direction).
- **Re-inserted from v1.0 (the PRD paste dropped these):** the **DPDPA legal-validity guardrail** (§17b) and the
  **"store categories, never real PII" security rule** (§16). Both are non-negotiable trust controls.
- **Added from the PRD:** consultant/cross-tool journeys, full event taxonomy, 5-table data model, SEO,
  scoring bands, risk flags, funnel targets, the Claude Code build prompt.
- **Scope caution:** P0 below is heavier than a "minimum lovable" cut. A tighter MLP option is noted in §22.

---

## 1. Product Summary

**Name:** SaralPrivacy DPDPA Privacy Notice Pack Builder.
**Type:** Free-to-use, lead-generating compliance utility for Indian SMBs.
**Promise:** Generate a practical, DPDPA-ready **Privacy Notice Pack** in minutes — not one long static notice.

**The pack (outputs):** ① Full Privacy Notice · ② Contextual mini-notices · ③ Consent checkbox blocks ·
④ Marketing consent block · ⑤ Children's data clause *(conditional)* · ⑥ Vendor/processor sharing clause
*(conditional)* · ⑦ Rights & grievance block · ⑧ DSAR/Data Rights Form link · ⑨ Notice evidence record ·
⑩ Notice readiness score.

**Strategic role:** the bridge between SaralPrivacy's educational/assessment layer and Pro/advisory. Converts
blog/briefing/assessment/discovery traffic into qualified SMB leads, then funnels into the DSAR tool.

**One-line positioning:** *Generate a practical DPDPA Privacy Notice Pack for your Indian business — full
notice, form notices, consent text, rights block, and evidence record.*

---

## 2. Problem Statement
Indian SMBs know they need a privacy notice under DPDPA but don't know what data they collect, how to map it
to specific purposes, what to say before consent, how to explain rights simply, how to handle children's data
or vendor sharing, how to create short notices for forms/WhatsApp/checkout/admission/appointment/onboarding,
or how to preserve evidence. Existing options are static templates, legal-heavy policies, enterprise CMPs, or
consultant documents — none sector-aware for Indian SMBs. SaralPrivacy solves this with a practical, guided,
sector-aware builder.

---

## 3. Target Users
- **Primary:** Indian SMB owner/operator — clinic/school/coaching admin, CA partner, recruitment owner, D2C founder, local business operator.
- **Secondary:** CA/CS/lawyer/consultant/agency/privacy freelancer creating notices for multiple SMB clients.
- **Internal:** SaralPrivacy founder/admin using captured leads to qualify demand and upsell Pro/advisory.

---

## 4. Target Sectors (P0) — the 12 priority sectors
CA firms · Recruitment & staffing · Training/coaching centres · D2C brands · Clinics & diagnostic labs ·
Schools & colleges · Law firms · Real estate brokers · Hotels/hospitality/travel · Pharmacies ·
Financial services/NBFC-like · Manufacturing/industrial.
Each sector ships smart defaults for: data collected · collection contexts · purposes · vendor categories ·
high-risk flags · mini-notice examples · children's clauses where applicable (see §15).

---

## 5. Product Principles
1. **SMB-first** — feels like a guided business checklist, not a legal drafting tool.
2. **Sector-aware** — understands a CA firm ≠ clinic ≠ school ≠ D2C.
3. **Purpose-specific** — every data category links to a specific business purpose.
4. **Contextual** — generates notices for real collection points, not just one long page.
5. **Evidence-backed** — every run produces a record (version, timestamp, inputs, output hash, exports).
6. **No false compliance claim** — never "legally compliant" / "guaranteed" / "avoid penalties in one click."
   Use: *DPDPA-ready draft · practical starting notice · built around DPDPA notice requirements · review before publishing.*
7. **Value first, email later** — preview + score + flags are ungated; export requires email.

---

## 6. Core User Journeys
- **A · First-time SMB:** land → pick business type → confirm suggested data → pick contexts → map data→purpose
  → vendors → children → retention → grievance contact → preview + score + flags → **email to export** →
  store lead + evidence → suggest creating a free Data Rights Form.
- **B · Consultant/CA/CS:** select "creating this for a client" → enter client name + sector → generate →
  export → lead tagged `advisor/consultant` → future Pro: multi-business workspace.
- **C · From Personal Data Discovery:** discovery pre-fills data categories → review purposes → generate →
  store strong cross-tool conversion event.
- **D · From Readiness Assessment:** weak notice/consent score → CTA "Generate your Privacy Notice Pack" →
  builder opens with business type pre-filled → lead tagged `assessment-to-notice`.

---

## 7. Tool Page Structure
- **URL:** `/tools/dpdpa-privacy-notice-generator`
- **H1:** Generate your DPDPA Privacy Notice Pack in minutes
- **Sub:** Answer a few simple questions. Get a full privacy notice, short form notices, consent checkbox text, rights request block, and evidence record — built for Indian SMBs.
- **Primary CTA:** Build my free Notice Pack · **Secondary:** See sample output
- **Trust line:** Preview is free. No login required. Export requires email.
- **"What you get"** cards: full notice · form mini-notices · consent text · marketing consent · children's clause · vendor clause · rights block · evidence record.
- **"How it works":** pick business type → confirm data → map purpose → generate → download & publish.
- **Disclaimer:** *This tool generates a practical draft based on your inputs. It is not legal advice. Review before publishing.*

---

## 8. Wizard (8 steps)
State preserved (localStorage), back/next, progress "1 of 8", no forced login. Live preview + risk notes on
the right (desktop); single column (mobile).

1. **Business profile** — business name (req), website (opt), business type (req), sector (req), city/state (opt), notice use-case multi-select (req: website, app, WhatsApp, offline form, onboarding, appointment, checkout, admission, job application, newsletter).
2. **Personal data collected** — sector pre-selects likely categories. Groups: basic identity · government IDs · financial · health · education/minor · employment/recruitment · digital/technical · documents/uploads (full list in PRD appendix). **Rule:** ≥1 category required.
3. **Collection context** — website form · WhatsApp · checkout · appointment · admission · job application · onboarding · support · newsletter · feedback · offline paper · mobile app · CCTV/visitor · employee/contractor onboarding. Each selected context → one mini-notice.
4. **Purpose mapping** — table: *data → suggested purpose → mandatory/optional → edit*. Sector smart defaults pre-fill. **Vague-purpose guardrail** (§17a) flags "business purposes / internal use / better experience / service improvement / analytics / marketing" without specificity.
5. **Consent & withdrawal** — how consent is collected (checkbox/app screen/paper/WhatsApp opt-in/email/verbal/not sure); how users withdraw (email/web form/account settings/WhatsApp/phone/not available). **Required:** withdrawal contact + method. Warn if "not available yet."
6. **Vendor / processor sharing** — vendor categories (payment, logistics, comms, cloud, CRM, accounting, legal, HR/payroll, BGV, LMS, lab, insurance, travel platform, analytics/ads, CCTV, none, not sure) → sharing clause. P1: disclosure table.
7. **Children's data** — Yes/No/Not sure. If Yes: why collected, how parent/guardian consent is taken, ads/profiling Y/N, photos/videos Y/N, third-party apps/LMS Y/N → warning + child clause + parent consent block.
8. **Retention & contact** — retention basis (until service complete / 6m / 1y / 3y / 5–8y tax-legal / as required by law / forever / not sure; warn on forever/not sure) + grievance contact name (req), email (req), phone (opt), address (opt), DPO applicable Y/N/Not sure.

→ Preview renders ungated at every step; **export = email gate.**

---

## 9. Generated Outputs

**① Full Privacy Notice (sections):** intro · who we are · scope · data we collect · why (purpose-wise) ·
how we collect · consent & withdrawal (§6) · sharing with service providers · children's data (§9, conditional) ·
retention · security safeguards · your rights (the **five DPDPA rights only**) · how to exercise them ·
grievance (§13) · Data Protection Board route · contact · updates · notice ID/version/date · disclaimer.

**② Contextual mini-notices** — one per selected context, using only that context's data. Export: plain text,
HTML snippet, tooltip copy, QR (P1). *(Examples: contact form, checkout, WhatsApp enquiry, clinic appointment, coaching admission — in PRD.)*

**③/④ Consent blocks** — Service (required), Marketing (separate, optional), Parental/guardian (if children's
data), Vendor-disclosure acknowledgement. **Marketing is never bundled into service consent.**

**⑤ Rights & DSAR block** — lists the five DPDPA rights + action: email `[contact]` or use
`saralprivacy.com/r/[business-slug]`. If no DSAR page exists → "Create free Data Rights Form" CTA. + DPB route line.

**⑥ Vendor-sharing clause** — generic + sector-specific phrasing from step 6.

**⑦ Children's clause** — parental/guardian consent + no behavioural monitoring / targeted ads.

**⑧ Notice Evidence Record** — JSON (schema in §13), generated after email/export, with SHA-256 hash.

---

## 10. Notice Readiness Score (0–100) — **P0**
**Components:** business type 5 · data categories 10 · purpose mapped per category 20 · contexts 10 ·
withdrawal method 10 · rights contact 10 · vendor sharing disclosed 10 · retention basis 10 · children handled 10 · DSAR link/route 5.
**Bands:** 0–39 Weak · 40–69 Basic · 70–84 Good · 85–100 Strong (review before publishing).
**Risk flags (shown separately):** children's data · health/financial/govt-ID data · marketing without separate
consent · vendor sharing without categories · retention forever/not-sure · no withdrawal method · no grievance
email · no DSAR link · vague purpose detected · **GDPR-rights or §7-consent language detected (validity flag).**

---

## 11. Lead Capture & Funnel
- **Ungated:** wizard · live preview · readiness score · risk flags.
- **Email-gated:** PDF · copy HTML · full pack ZIP · send-to-email · save evidence record · create hosted page (P1).
- **Capture fields:** email (req), name (opt), business name/type (already captured), consent-to-updates (opt).
- **Success state:** download PDF · copy HTML · copy form notices · create Data Rights Form · book 20-min review.

---

## 12. Event Tracking
`notice_builder_started · business_type_selected · data_categories_confirmed · purpose_matrix_completed ·
collection_contexts_selected · notice_preview_generated · notice_score_calculated · notice_lead_captured ·
notice_pdf_downloaded · notice_html_copied · mini_notice_copied · consent_block_copied · dsar_cta_clicked ·
notice_evidence_record_created`.
**Primary conversion:** `notice_lead_captured`. **Secondary:** `dsar_cta_clicked`.
**OMTM contribution (qualified emails/week):** `notice_lead_captured` + `dsar_page_claimed` +
`assessment_report_email_captured` + `notify_lead_captured`.

---

## 13. Data Model (PostgreSQL)
- **notice_leads** — id · email · name · business_name · business_type · sector · source · utm_* · created_at.
- **privacy_notice_runs** — id · lead_id · notice_id (unique) · notice_version · business_name/type · sector ·
  language · input_json · purpose_matrix_json · collection_contexts · vendor_categories · children_data ·
  retention_basis · withdrawal_method · rights_contact_email · dsar_link · notice_html · notice_html_hash ·
  notice_pdf_url · readiness_score · risk_flags · created_at · updated_at.
- **notice_exports** — id · notice_run_id · export_type · export_url · created_at.
- **notice_events** — id · event_name · event_version · session_id · lead_id · notice_run_id · payload_json · created_at.
- **notice_versions** — id · notice_id · version · notice_run_id · change_reason · created_at.

**Evidence record (JSON, hashed):**
```json
{ "notice_id":"SP-NOTICE-2026-000001","notice_version":"1.0","business_name":"ABC Clinic",
  "business_type":"Clinic","generated_by_email":"owner@example.com","generated_at":"2026-06-21T13:30:00+05:30",
  "language":"English","selected_data_categories":["name","phone","health_reports"],
  "purpose_mappings":[{"data":"health_reports","purpose":"diagnostic reporting and medical consultation"}],
  "collection_contexts":["appointment_booking","whatsapp_enquiry"],"vendor_categories":["cloud_storage","diagnostic_lab"],
  "children_data":false,"retention_basis":"as required by applicable law","withdrawal_method":"email",
  "rights_contact_email":"privacy@abcclinic.com","dsar_link":"saralprivacy.com/r/abc-clinic",
  "notice_html_hash":"sha256:…","pdf_generated":true,"html_copied":true }
```

---

## 14. Template Engine
**P0 rule: deterministic template blocks. No LLM-generated legal text in P0.** Assemble from: core mandatory
blocks · sector blocks · context mini-notice blocks · risk blocks · vendor blocks · children blocks · rights/DSAR
blocks · disclaimer blocks. Block shape:
```json
{ "block_id":"children_data_clause_v1","condition":"children_data == true","language":"en","text":"If we collect personal data of children…" }
```
P1: language variants (Hindi). P2: admin UI to edit blocks.

---

## 15. Sector Smart Defaults
Each of the 12 sectors pre-fills data + purposes (+ vendor categories, risk flags, children's handling). Full
per-sector lists in the PRD appendix; representative:
- **CA firms:** PAN, Aadhaar, ITR, Form 16, bank statements, GST, payroll, client family data → tax filing, accounting, audit, GST compliance, payroll, statutory records.
- **Clinics/labs:** name, phone, age, health info, prescription, lab report, appointment, payment → appointment, consultation, diagnostic reporting, billing, communication, statutory records. *(health = sensitive flag.)*
- **Coaching/schools:** student/parent data, age/class, attendance, academic, photos, LMS, transport → admission, class mgmt, parent comms, learning, attendance, fees. *(children's handling on.)*
- **D2C:** name, phone, email, address, order, payment ref, support, web usage, WhatsApp opt-in → order, delivery, returns, support, marketing-with-consent, fraud, analytics. *(separate marketing consent.)*
- (Recruitment, law, real estate, hotels/travel, pharmacies, NBFC, manufacturing — analogous; see PRD appendix.)

---

## 16. Security & Privacy Requirements *(re-inserted — non-negotiable)*
- **Data minimisation — store categories, never real PII.** The tool stores **category selections only**. It must
  **not** collect/store actual customer records, uploaded documents, or **Aadhaar/PAN/passport/health values**.
- Encrypt sensitive lead data at rest where available; restrict admin access; rate-limit + spam-protect email capture.
- Do not expose generated notice records publicly unless the user opts into a hosted page (P1).
- Event logs store analytics, not sensitive personal data.

---

## 17. Quality / Intelligence Engines (rules-based)
**17a. Purpose-specificity guardrail (P0)** — reject vague purposes; inline: *"This purpose is too broad. Describe the specific activity for which this data is used."*

**17b. DPDPA legal-validity guardrail (P0 — trust moat, re-inserted):**
- Consent is **§6**, not §7 (§7 = certain legitimate uses). Never label consent as §7.
- Notice = §5 · children = §9 · cross-border = §16.
- **Rights limited to the five DPDPA rights:** access (§11), correction/completion/update & erasure (§12),
  grievance (§13), nominate (§14), withdraw consent (§6).
- **Block GDPR-only rights** — never emit data portability, right to restriction, or right to object; strip them
  from any custom/imported text. No "GDPR" or non-Indian regulator references in output.
- *Acceptance:* any clause containing "data portability / right to restrict / right to object / Section 7 consent"
  is flagged and the non-compliant phrasing is removed/replaced.

**17c. Plain-language engine** — P0 lite: flag sentences >22 words, legal jargon (hereinafter/aforesaid/
notwithstanding), missing action ("contact us at…"). P1 full: passive→active rewrite, paragraph→bullets, 8th-grade
target. Labels: *Readability · Purpose clarity · Rights clarity.*

---

## 18. UI Requirements
SaralPrivacy design system: white cards, hairline borders, minimal/no shadows, professional typography, clear
CTAs, progress stepper, plain language, no legal clutter. Wizard: question left / live preview + risk notes right
(desktop), single column (mobile), back-next, localStorage, no forced login. **Result page:** score · risk flags ·
full notice preview · mini-notices · consent blocks · rights/DSAR block · export options · Create-DSAR CTA · Book-review CTA.

---

## 19. Acceptance Criteria
**Functional:** complete wizard without login · preview without email · email required for PDF/HTML/pack export ·
generates full notice · ≥1 contextual mini-notice · consent blocks · rights block · children's clause if applicable ·
vendor clause if vendors selected · readiness score · stores evidence record after export · fires all events · links to DSAR creation.
**Guardrails:** never says "legally compliant"; says draft/review-before-publishing; never stores real
Aadhaar/PAN/records; warns on vague purpose; never bundles marketing into service consent; warns on children's data;
**flags/strips GDPR-rights & §7-consent language (17b).**
**Performance:** wizard <2s · preview <1s · PDF <5s · mobile usable.
**Analytics:** start→preview · preview→email · email→PDF · notice→DSAR CTA · sector-wise demand · high-risk flags.

---

## 20. Success Metrics
**OMTM:** qualified emails/week from Notice Builder.

| Funnel step | Target |
|---|---|
| Landing → wizard start | 20%+ |
| Wizard start → preview | 40%+ |
| Preview → email capture | 25%+ |
| Email capture → PDF download | 80%+ |
| Notice result → DSAR CTA click | 15%+ |
| Advisory CTA click | 5–8% |

**Lead tags:** sector · risk score · children's data · financial/health/govt-ID · vendor sharing · marketing use ·
retention weakness · DSAR interest · consultant/advisor.

---

## 21. SEO
- **Title:** Free DPDPA Privacy Notice Generator for Indian Businesses | SaralPrivacy
- **Description:** Generate a DPDPA-ready Privacy Notice Pack for your Indian business. Full privacy notice, form notices, consent text, rights block, and evidence record.
- **Schema:** SoftwareApplication · FAQPage · HowTo · LegalService · BreadcrumbList.
- **Internal links from:** homepage toolkit · DPDPA guide · assessment result · discovery result · sector blogs (CA/clinic/D2C) · DSAR tool · vendor tracker.

---

## 22. Roadmap & scope

**P0 — Free Notice Pack Builder:** 8-step wizard · sector defaults · purpose-data matrix · full notice ·
mini-notices · consent blocks · rights block · vendor clause · children's clause · **readiness score** ·
**validity + specificity guardrails** · email-gated PDF/HTML · evidence record · DSAR CTA.

**P1:** hosted notice page (+version display, public link, update flow) · **Hindi** (full + mini-notices, legal
review first) · version archive (compare, old PDFs, change reason) · vendor disclosure table · readability-full · QR mini-notices.

**P2:** consent receipt lite (embed code, consent timestamp, notice-version accepted, CSV) · vendor disclosure
table advanced · DSAR dashboard · more languages · admin block editor.

**⚠ Lean caution (founder call needed):** this P0 is larger than a minimum-lovable cut. If you want to ship faster,
the tightest MLP that still proves the wedge is: *wizard (≤6 steps) + matrix + full notice + 3 mini-notices +
service/marketing consent + rights/DSAR block + email gate + evidence record*, with **score and the 12-sector
defaults trimmed to 4 launch sectors**. Recommend deciding this before build (see §24).

---

## 22b. CEO scope decision (plan-ceo-review · 2026-06-21)
- **Mode chosen: Selective Expansion** — build the *Selective slice* (keep matrix + mini-notices +
  validity guardrail + email gate + evidence record + **4 launch sectors**; defer score, sectors 5–12,
  consultant flow, hosted page, version archive; trim events to ~6, tables to 3).
- **Wedge:** the only free tool outputting a sector-aware, purpose-mapped Notice *Pack* (notice +
  form/WhatsApp mini-notices + consent blocks) with an India-validity guardrail (no GDPR drift, §6≠§7).
- **Riskiest assumption:** SMBs will give email to export a pack. **Test <1 week** on the existing
  `notice-generator.html` prototype behind the email gate; drive ~150–300 owned-channel visits; **GO ≥25%**
  preview→email, kill/rethink <10%.
- **User in 30 days:** clinic admin · CA partner · coaching owner · D2C founder (from assessment CTA +
  sector blogs + Daily Brief). Consultant flow deferred.
- **Unit economics @10×:** works — deterministic templates ≈ zero marginal cost; only real cost is the
  one-time legal sign-off. Keep rules-based (no LLM) until a notice can be *sold*, not just generated.
- **Rejected:** Expansion (power-user build pre-demand), Reduction (loses the differentiator), Hold (forgoes the OMTM wedge).
- **Gate to advance:** run the <1-week test before full build → then `/plan-eng-review` on the Selective slice.

## 23. Hard gate before export ships
One legal sign-off pass on: the full-notice section template, the §17b validity rule set (section mappings + the
GDPR-strip list), the children's clause, and the cross-border (§16) wording vs. final DPDP Rules.

---

## 24. Open Decisions
- **[Founder]** Adopt full P0 (§22) or the tighter MLP cut? (Recommend MLP cut + 4 launch sectors.)
- **[Legal — blocking export]** Template + §17b guardrail + children's clause sign-off.
- **[Eng]** Persist evidence record in P0 (recommended, so P1 archive reuses it) — confirmed by data model §13.
- **[Eng]** Rules-based assembly in P0 (locked, §14) — no LLM legal text.
- **[Product]** Mini-notice P0 export formats: plain-text + HTML enough? (QR/tooltip → P1.)

---

## 25. Claude Code / Cursor build prompt
> Build a production-ready SaralPrivacy DPDPA Privacy Notice Pack Builder — a **sector-aware notice generation
> layer for Indian SMBs**, not a static template generator.
>
> **Page:** `/tools/dpdpa-privacy-notice-generator`. **Stack:** Next.js/React + Node + PostgreSQL.
>
> **Wizard (8 steps):** business profile · personal data · collection context · purpose-data mapping · consent &
> withdrawal · vendor/processor sharing · children's data · retention & grievance contact. Sector smart defaults
> for the 12 sectors (§4/§15). State in localStorage, back/next, no forced login.
>
> **Generate:** full privacy notice · contextual mini-notices · consent checkbox blocks · rights/DSAR block ·
> notice evidence record. **Readiness score 0–100** with risk flags (§10).
>
> **Gating:** preview/score/flags ungated; email required for PDF, HTML copy, pack export, evidence record.
>
> **Store:** lead · wizard input · generated notice · purpose matrix · risk flags · readiness score · evidence
> record · events. **Fire** the §12 events. **Use deterministic template blocks — no LLM legal text in P0.**
>
> **Guardrails:** never say "legally compliant/guaranteed/avoid penalties"; use "DPDPA-ready draft / review before
> publishing"; **never store real Aadhaar/PAN/customer records**; warn on vague purpose; never bundle marketing
> into service consent; warn on children's data; **enforce the DPDPA validity guardrail — consent=§6 not §7, only
> the five DPDPA rights, strip GDPR portability/restriction/object.** Disclaimer: "practical draft based on your
> inputs, not legal advice, review before publishing."
>
> **Design:** SaralPrivacy system — white cards, hairline borders, professional type, progress stepper, no clutter,
> mobile-first. **Result CTAs:** Create free Data Rights Form · Book a 20-minute DPDPA review.
>
> **Deliver:** React/Next components · data model + migrations · template engine · event tracking · PDF/HTML export ·
> email capture · result page · tests for all critical flows.
>
> **Key decision:** build it as a Notice Pack Builder (purpose mapping + mini-notices + consent blocks + DSAR link +
> evidence record), not another template. That is the strategic wedge.

---

---
---

# PART II — DSAR companion + shared infra (seam fix)

## II-1. Why DSAR is here, and scoped down
Every Notice Pack contains a rights block pointing to `saralprivacy.com/r/[slug]`. If Notice ships and
DSAR doesn't exist, that's a **dead link** — violating the Tool Rail honesty rule. So a **minimal DSAR
ships in the same phase** as the Notice Pack, purely to make the rights block live. The full DSAR
(status management, CSV, dashboard, SLA) follows in Phase 2.

**CEO lens on DSAR:** weak as standalone top-of-funnel (nobody googles "rights intake form"), strong as
*the artefact the Notice points to* + recurring-return stickiness. → Build as **companion, not standalone
acquisition.** Mode stays **Selective Expansion**.

## II-2. Minimal DSAR (Phase-1, seam-closer) — P0
- **Slug claim:** owner claims `business-slug` (validated, unique) — the *same* slug the Notice rights block uses.
- **Public intake page** at `/r/[slug]`: business name + request-type picker + name + email + free-text + consent checkbox.
- **Request types (DPDPA-mapped):** access (§11) · correct/update (§12) · erase (§12) · withdraw consent (§6) · grievance (§13) · nominate (§14).
- **Lightweight email confirmation** to requester (confirm-link, anti-spam) → **Request ID + timestamp**.
- **Owner email notification** on each confirmed request (< 1 min).
- "Educational, not legal advice" + privacy line on the page.

## II-3. Full DSAR — Phase 2 (P1)
Owner list view behind magic-link auth · manual status Received→In progress→Closed · CSV export ·
response-due indicator · internal notes · Hindi page · page branding. *(Per the prior combined spec, carried forward.)*

## II-4. Shared infra + schema reconciliation (closes Open Question [Data])
**One shared layer, both tools write to it** — do **not** let the Notice Pack's `notice_leads` diverge from DSAR's capture.

| Shared entity | Replaces / unifies | Used by |
|---|---|---|
| `business_profile` (id, **slug** unique, name, sector, owner_email, created_at) | Notice "business" + DSAR "owner setup" | Both — slug claimed once, reused |
| `email_captures` (id, email, **source** enum, profile_id, consent, utm_*, created_at) | Notice `notice_leads` **and** DSAR requester/owner capture | Both — the OMTM pipe |
| `events` (id, name, session_id, profile_id, payload, created_at) | Notice `notice_events` + DSAR events | Both |
| `render_jobs` (html→pdf) | — | Notice (P0), DSAR CSV (P2) |

Notice-specific (`privacy_notice_runs`, `notice_versions`) and DSAR-specific (`dsar_requests`) tables FK to
`business_profile`. **Decision:** `notice_leads` from §13 is renamed/merged into `email_captures` with
`source='notice-generator'`; DSAR writes `source='dsar-owner' | 'dsar-requester'`. Segmentation works day one.

## II-5. Slug ownership (closes the dead-link)
- Notice wizard gains a **light, optional "reserve your rights-page slug"** step at export (defaults to a
  slugified business name). Reserving creates the `business_profile` + a **stub** `/r/[slug]` that already
  accepts requests (minimal DSAR). → The Notice rights block is **never a dead link.**
- If the owner skips slug reservation, the rights block falls back to **email-only** rights wording +
  a "Create your free Data Rights Form" CTA (no broken URL). Honesty rule held either way.

## II-6. DSAR success metrics
Pages created/week · setup completion ≥ 60% of starts · owner notified < 1 min · returning-owner ≥ 30% (P2) ·
`dsar_page_claimed` counts toward the OMTM (qualified emails/week).

---

# PART III — P1 Planning Reviews

## III-1. CEO review — carry-forward + DSAR addendum
*(Full CEO review ran 2026-06-21, logged §22b: **Selective Expansion**. Not re-litigated.)*
- **Addendum:** DSAR is folded in as a **Phase-1 seam-closer (minimal)**, not a standalone bet. The minimal
  DSAR is the cheapest way to keep the Notice funnel honest and whole; full DSAR waits for demand signal
  (`dsar_page_claimed` rate). No change to mode.
- **Riskiest assumption unchanged:** SMBs trade email for export. **<1-week test on the existing prototype
  remains the gate before full build.**

## III-2. Design review (8 dimensions)
Rated against the existing SaralPrivacy system (mature: hairlines, tokens, Inter, green/navy) + the live `notice-generator.html` prototype.
```
1 Hierarchy        9/10
2 State coverage   6/10  — async export, PDF-render wait, DSAR submit, and confirm-email states NOT yet designed. Design loading/empty/error/success for: export gate, PDF generation, DSAR submit, slug-taken.
3 Typography       9/10
4 Color            9/10
5 Spacing          9/10
6 Interaction      7/10  — wizard chips/segments good; define focus-visible + disabled on the Next button when step invalid, and modal focus-trap.
7 Copy             9/10  — guardrail/"draft, not legal advice" voice already strong.
8 Accessibility    6/10  — verify contrast on teal/gold pills (gold on cream is borderline), keyboard path through chips + segmented controls, ARIA on the email-gate modal + live-preview region (aria-live).
AVERAGE: 8.0/10 → PROCEED (with the 3 sub-7 notes fixed during build, not after)
```

## III-3. Engineering review (6 sections)
```
ARCHITECTURE
  Next.js app
   ├ /tools/dpdpa-privacy-notice-generator  (wizard SPA, localStorage state)
   ├ /r/[slug]                              (public DSAR intake, SSR)
   ├ /api/notice/export                     (email gate → render_jobs → PDF/HTML)
   ├ /api/dsar/request                      (intake → confirm email → dsar_requests)
   ├ /api/dsar/confirm                      (confirm-link → status=Received → owner notify)
   ├ /api/capture                           (email_captures, source-tagged)
   └ /api/events                            (events sink)
  Engine:   /lib/notice-engine  (deterministic template blocks — NO LLM in P0)
  Data:     PostgreSQL (business_profile · email_captures · events · privacy_notice_runs ·
            notice_versions · dsar_requests · render_jobs)
  Render:   single HTML→PDF worker (Node)

DATA FLOW
  Wizard input → localStorage → notice-engine assembles preview (client, ungated)
  → Export click → email gate → /api/capture + /api/notice/export → render_job → PDF/HTML + evidence record (hash)
  DSAR: /r/[slug] submit → /api/dsar/request → confirm email → /api/dsar/confirm → dsar_requests(Received) → owner email
  State: wizard = client (localStorage); persisted = PostgreSQL on export/submit only.

EDGE CASES (≥1 per path)
  Wizard: zero data categories (block Next); refresh mid-wizard (restore from localStorage); back preserves answers.
  Engine: data without purpose (flag); vague purpose (flag); §7/GDPR-rights in custom text (strip+flag — §17b).
  Export: email invalid; render_job fails (retry + show "download HTML instead"); double-submit (idempotent on hash).
  DSAR: slug taken (clear error); slug squatting (rate-limit + email-confirm); spam submits (confirm-link gate);
        malformed request payload (validate); confirm-link expired/reused (one-time token).
  Privacy: reject any attempt to store real Aadhaar/PAN/health values — categories only (§16).

TEST MATRIX
  unit:        notice-engine block assembly · readiness-score calc · validity-guardrail strip (§17b) · slugify/validate
  integration: /api/capture (source tagging) · /api/notice/export (gate→render→evidence) · /api/dsar/request+confirm
  e2e:         wizard→preview (no email) · export→email gate→PDF · DSAR submit→confirm→owner-notify · slug-taken path

DX FRICTION
  TTHW: reuse landing-page design tokens + prototype → low. Local: Postgres + Node worker (docker-compose).
  Deploy: Vercel (app) + managed Postgres + one worker. Render worker is the only non-trivial piece.

DEPENDENCIES
  none new for engine (rules-based, stdlib + ~template JSON).
  PDF: ONE lib (reuse the shared render service from §7 — Playwright/Puppeteer-core or a lighter html-pdf).
       Justify before adding: if landing/site already bundles a headless renderer, reuse it.
  email: reuse existing transactional provider (no new vendor). NO LLM dependency in P0.
```

## III-4. Dharma3 — PLAN phase status / route
- **Phase 1 PLAN: complete.** Intent ✓ · CEO (Selective Expansion) ✓ · Design (8.0, proceed w/ 3 notes) ✓ · Eng (locked) ✓.
- **Forced gates before Build:** (a) **run the <1-week prototype email-gate validation test** (CEO gate); (b) **one legal sign-off** on §17b validity rules + 13-section template + children's clause + DSAR page copy.
- **Route → next wave:** ① validation test (this week, no build) → if ≥25% preview→email: ② shared infra (`business_profile` + `email_captures` + `events`) → ③ Notice engine + wizard (4 launch sectors) → ④ minimal DSAR (`/r/[slug]`) → ⑤ export + evidence + events.
- **Not started without your go:** `/dharma3 execute` (spawns build agents). Say the word and I route the waves.

---
---

# PART IV — Implementation status (as of 2026-06-21)

Built as a **Next.js route** in the webapp (`SaralPrivacy.git`), so it inherits the real `<Header/>`/`<Footer/>`
and brand from `app/layout.tsx`. Direction = **01 Split Studio** (wizard left, live notice right).

**Files:** `app/tools/dpdpa-privacy-notice-generator/` (`page.tsx`, `NoticePackClient.tsx`, `notice-pack.css`)
· `lib/notice-pack/` (`data.ts`, `engine.ts`, `types.ts`). Type-checks clean.

Legend: ✅ built (front-end) · ⚠️ partial (front-end only, no backend) · ❌ not built · ⏸ deferred (P1/P2)

## IV-1. ✅ Built (what the user sees & clicks)
8-step wizard · 12 sector smart-defaults · purpose-data mapping + vague-purpose flag · 5 outputs (full notice,
contextual mini-notices, consent blocks, rights/DSAR block, evidence record) · children's clause · vendor clause ·
readiness score 0–100 + bands + risk flags · English + Hindi · value-first **email-gated** export · DPDPA
legal-validity guardrails (§6≠§7, five rights only, no GDPR) · "draft, not legal advice" · SEO metadata + FAQ/
breadcrumb/WebApp schema · native brand chrome.

## IV-2. ⚠️/❌ Remaining — with definition of done
| Item | State | Definition of done |
|---|---|---|
| Email capture → DB (`email_captures`) | ⚠️ posts to Formspree placeholder, no DB | `email_captures` table + `/api/capture` route writing email · business · sector · score · source |
| Evidence record persisted + real hash | ⚠️ shown on screen, hash is a placeholder string, not stored | server-side **SHA-256** of notice text + row in `privacy_notice_runs` |
| PDF export | ⚠️ browser print-to-PDF | server-side branded render service (§7) |
| localStorage save/resume | ❌ state resets on refresh | persist wizard state to localStorage, restore on load (**front-end only, ~cheap**) |
| Event tracking (14 events) | ❌ nothing fires | fire §12 events to GA (`G-…` already in layout) + `notice_events` table → funnel & sector demand |
| Consultant "for a client" journey (B) | ❌ | "creating for a client?" toggle on step 1 + `advisor` lead tag |
| Cross-tool prefill from Discovery/Assessment (C/D) | ❌ | CTA on those result pages + URL-param prefill (`?sector=`) + `source` tag |
| Data model / migrations · tests | ❌ | migrations for the 5 §13 tables + unit/e2e (engine, score, gate, export) |
| Hosted page · version archive · consent-receipt · vendor table | ⏸ | P1/P2 per §22 roadmap — after validation |

## IV-3. Build priority for the remainder
1. **Cheapest, highest value (front-end only):** localStorage + event tracking → makes the validation test *measurable* (rates, not just an email count).
2. **Lead backend:** `email_captures` + `/api/capture` + internal admin (Part V) → real lead visibility, replaces Formspree.
3. **Then:** server PDF · evidence persistence · journeys B/C/D · DSAR (Part VI).

---

# PART V — Admin & internal visibility

**Two distinct admin surfaces — keep them separate. Neither is built yet.**

## V-1. Business-owner dashboard (per business)
The DSAR owner view (design: "Platform Workbench" / `03-app` screenshot). A business sees **its own** rights
requests + notice readiness. Behind **magic-link auth** (no passwords). Status: **designed, not built** (Phase 2, Part VI).

## V-2. SaralPrivacy internal admin (founder) — the lead board
Purpose: see **who is using the tools** = the OMTM. Lives under the **existing `app/admin/`** area.
- `app/admin/notice-leads` — table of captured leads: email · business · sector · readiness score · export type ·
  source · date; filter by sector / score / date; **CSV export**. (Mirrors the DSAR table layout.)
- Funnel card from `notice_events` (anonymous): started → preview → score → email, split by sector.
- Status: **not built.**

## V-3. Identity model — how admin knows who generated a notice
- **Value-first / no-login ⇒ previews are anonymous by design.** Identity is captured **only at the email gate (export)** — this is the intended wedge, not a gap.
- **Identified leads** (email + business + sector + score) → `email_captures` → shown in `app/admin/notice-leads`.
- **Anonymous activity** (counts only, no identity) → `notice_events` keyed by `session_id`.
- **Today (interim):** the *only* visibility is the **Formspree inbox** for people who exported. No anonymous funnel, no DB, no admin page.

---

# PART VI — DSAR build detail (expands Part II)

**Status: specced + designed, not built.** The Notice Pack only links to it (`/r/[slug]`) + an inert "Create free Data Rights Form" CTA.

## VI-1. Public intake `/r/[slug]` (P0, seam-closer)
Request types (6, DPDPA-mapped): access (§11) · correct/update (§12) · erase (§12) · withdraw consent (§6) ·
grievance (§13) · nominate (§14). Form: name + email + free-text + consent. Email-confirm link → creates record
with **Request ID + timestamp**, status = Received → owner email notification (<1 min). "Educational, not legal advice" line.

## VI-2. Owner dashboard (P1/full — the screenshot)
Scorecards: Total / Open / Closed / This week. Table: Request ID · Type · Requester · Date · **Status** dropdown
(Received → In progress → Closed). Actions: **Preview public page**, **Export CSV**. Behind magic-link auth.
Footer note: "Requester identity is confirmed by email link before a request appears here."

## VI-3. Data & sequencing
`dsar_requests` table FK → shared `business_profile`; reuses `email_captures` + `events` (Part II-4). Slug claimed
once and reused by the Notice rights block. Build order: minimal intake first (closes the dead-link seam), owner
dashboard next.

---
---

# PART VII — Build plan / sprints (added 2026-06-21)

**Assumptions:** solo founder + Claude Code (1 effective builder) · **1-week sprints** · ~3.5 committed
build-days/week (≈75% capacity) · DB = **Supabase Postgres** · Sprint 1 starts Mon 2026-06-22.
**Carryover:** none — front-end P0 is built and on a Vercel preview (`/tools/dpdpa-privacy-notice-generator`).
**Shippable after Sprint 1** as a clean, measurable validation surface; rest is built against real demand.

| Sprint | Dates | Goal | Backlog (est build-days) |
|--------|-------|------|--------------------------|
| **S1** | Jun 22–28 | Not broken + leads captured | QA blockers — hide/wire 2 dead CTAs · fix copy-after-unlock bug · required-field validation · modal a11y · hide Hindi (EN-only) (1.5d) · `/api/capture` + `email_captures` (Supabase), replaces Formspree (1d) · fire 14 events → GA + `notice_events` · localStorage save/resume · real evidence hash+id (1d) |
| **S2** | Jun 29–Jul 5 | A page that sells + ranks | What-you-get cards · How-it-works · See-sample · hero (1.5d) · HowTo schema + internal links (homepage/guide/assessment/discovery/sector blogs) (1d) · server-side branded PDF or robust print fallback (1.5d) |
| **S3** | Jul 6–12 | Cross-tool funnel | Journey D (Assessment CTA + prefill + tag, 1d) · Journey C (Discovery prefill + event, 1d) · Journey B (consultant toggle + advisor tag, 0.5d) · `privacy_notice_runs` persistence + stored evidence (1d) |
| **S4** | Jul 13–19 | DSAR live (minimal) + lead board | Minimal DSAR — slug claim · `/r/[slug]` intake · 6 types · email-confirm · Request ID · owner notify · `dsar_requests` (2.5d) · internal `app/admin/notice-leads` (table + filters + CSV) (1d) |
| **S5** | Jul 20–26 | DSAR owner dashboard + tests | Owner dashboard (scorecards · table · status · CSV · preview) behind magic-link (2.5d) · tests: unit (engine/score/guardrail) + e2e (wizard→gate→export; DSAR submit→confirm) (1.5d) |
| **S6** | Jul 27–Aug 2 | P1 depth | Hosted notice page `/n/[slug]` + version archive + review reminder (2d) · full Hindi (data/purpose strings, native review) (1.5d) · vendor disclosure table (1d) |

**Forced gate:** one **legal sign-off** (template + §17b validity guardrails + children's clause + DSAR copy) before any public/prod promote — start it in parallel during S1–S2.

### Risks
| Risk | Mitigation |
|---|---|
| DB/auth setup slows S1/S4 | Supabase MCP + magic-link (no password infra) |
| Server PDF on Vercel fiddly | ship print fallback; defer true PDF if it slips |
| Legal sign-off blocks launch | run the review in parallel from S1 |
| Solo capacity / interrupts | plan ~75%; cut stretch (Hindi-finish) first |

### Open decisions (gating S1)
1. DB = Supabase Postgres? 2. Hindi: hide now (rec) or finish in S1? 3. Booking URL for "Book a review" + hide "Create Data Rights Form" until S4? 4. Go straight to `/api/capture` (rec) or interim Formspree id?

### Definition of Done (per item)
- [ ] Type-checks + `next build` passes · [ ] Works on the Vercel preview · [ ] Mobile verified · [ ] Founder sign-off · [ ] (data/legal items) legal-reviewed

---
---

# PART VIII — Engineering build plan (dev tasks · eng review · testing)

## VIII-0. Reuse baseline — build ON existing infra, add ~nothing
Verified from the repo (`webapp/`). **Correction to earlier "PostgreSQL" assumption — the app uses Appwrite.**
| Need | Reuse (already in repo) |
|---|---|
| Database + storage | **Appwrite** — `lib/appwrite.ts` (`databases`, `storage`, `DB_ID`, `COLLECTIONS`, `ID`, `Query`, `getFileViewUrl`) |
| Spam / rate-limit | `lib/abuseGuard.ts` (`rateLimit`, `getClientIp`, `HONEYPOT_FIELD`, `isHoneypotTripped`) |
| Transactional email | `lib/email.ts` (**Resend**) — add `sendNoticeLeadAlert`, `sendDsarConfirm`, `sendDsarOwnerAlert` |
| Validation | **zod** (installed) |
| Auth (owner/admin) | Appwrite magic-URL (used in `app/subscribe`); existing `app/admin` area |
| Analytics | GA (`G-…` in `layout.tsx`) + `lib/analytics.ts` |
| Route pattern | copy `app/api/subscribe/route.ts` → rateLimit → honeypot → zod → `databases.createDocument` → email |
**New deps: none** — except an optional server-side PDF renderer (deferred; see Dependencies).

## VIII-1. New Appwrite collections (add to `COLLECTIONS`)
Appwrite uses document permissions, not SQL/RLS — scope owner docs with per-document read perms.
- `notice_captures` — email · name · business_name · sector · readiness_score · export_type · source · ip/city/country · created_at
- `notice_runs` — notice_id(unique) · version · language · sector · input_json · readiness_score · risk_flags · notice_hash · pdf_file_id · created_at
- `notice_events` — name(whitelisted) · session_id · sector · payload(no PII) · created_at
- `business_profiles` — slug(unique idx) · name · sector · owner_email · created_at
- `dsar_requests` — request_id(unique) · profile_slug · type · requester_name · requester_email · detail · status · confirm_token · confirmed_at · created_at

## VIII-2. Per-sprint dev tasks (files · acceptance)
**S1 — not broken + capture/events**
- `NoticePackClient.tsx`: hide 2 inert CTAs; fix copy-after-unlock (store requested text); per-step required-field gate (S1: name+sector; S8: cEmail) with disabled Next + inline error; modal focus-trap/Esc/aria; hide Hindi behind flag; **localStorage** save/resume; real evidence — `crypto.subtle` SHA-256 + `notice_id`.
- `app/api/notice/capture/route.ts` (clone subscribe): rateLimit→honeypot→zod→`createDocument(notice_captures)`→`sendNoticeLeadAlert`. Client gate posts here (drop Formspree).
- `app/api/notice/events/route.ts`: zod-whitelist 14 names→`notice_events`; `lib/notice-pack/track.ts` fires events + `gtag`.
- *Acceptance:* no dead CTA · correct copy · can't export with placeholders · refresh restores · capture row + founder alert · 429 on flood · events recorded.

**S2 — page sells + ranks + PDF**
- `page.tsx`: hero · what-you-get cards · how-it-works · see-sample (prefilled demo link) · trust line. HowTo schema. Internal links from homepage toolkit, `/learn` guide, assessment + discovery result pages, industry pages.
- PDF: enhance **client print** (popup-block fallback + branded header/logo) [P0]; server PDF deferred.
- *Acceptance:* sections render · links resolve · PDF downloads or shows fallback.

**S3 — cross-tool + run persistence**
- `app/api/notice/run/route.ts` → `notice_runs` on export (hash, score, flags). Journey D (Assessment CTA → `?sector=&src=assessment`), C (Discovery prefill `src=discovery`), B (step-1 "for a client?" → `advisor` tag). Client reads params → `applySector` + source tag on capture/events.
- *Acceptance:* prefill from params · source tags flow to capture · runs persisted.

**S4 — minimal DSAR + lead board**
- `app/api/business/route.ts` (slug claim, unique) → `business_profiles`. `app/r/[slug]/page.tsx` (SSR lookup) + form → `app/api/dsar/request/route.ts` (rateLimit+honeypot+zod) → `dsar_requests` status `pending_confirm` → `sendDsarConfirm`. `app/api/dsar/confirm/route.ts?token` → `Received` → `sendDsarOwnerAlert`. `app/admin/notice-leads/page.tsx` (existing admin auth) → list `notice_captures` + filters + CSV.
- *Acceptance:* unique slug · submit→confirm→Received+owner alert · admin list + CSV.

**S5 — DSAR owner dashboard + tests**
- Appwrite magic-URL login → owner view: scorecards · table · status PATCH (`app/api/dsar/[id]/status`, owner-scoped perms) · CSV · preview public. Tests (below).
- *Acceptance:* owner sees only own requests · status persists · CI green.

**S6 — P1 depth**
- Hosted notice `/n/[slug]` (publish a `notice_run`; version history) + review reminder · full **Hindi** strings (native review) + re-enable toggle · vendor disclosure table output.

## VIII-3. Engineering review (plan-eng-review)
```
ARCHITECTURE
  Next.js (App Router, Vercel) — front-end built.
   app/tools/dpdpa-privacy-notice-generator  (wizard SPA)         [built]
   app/r/[slug]                              (DSAR intake SSR)    [S4]
   app/admin/notice-leads                    (lead board)         [S4]
   app/api/notice/{capture,events,run,pdf}                        [S1–S3]
   app/api/business · app/api/dsar/{request,confirm,[id]/status} [S4–S5]
  Engine: lib/notice-pack/{data,engine,types,track}  (deterministic, no LLM)
  Data:   Appwrite collections (VIII-1) + Appwrite Storage (PDF)
  Reuse:  abuseGuard · email(Resend) · zod · analytics(GA) · appwrite

DATA FLOW
  Wizard → localStorage (client) → engine assembles preview (ungated).
  Export → email gate → POST /api/notice/capture (Appwrite write + Resend alert) → POST /api/notice/run (persist + hash) → PDF/HTML.
  Events → POST /api/notice/events (batch) + gtag. State: client until export; server on capture/export only.
  DSAR → /r/[slug] submit → /api/dsar/request (pending_confirm) → confirm email → /api/dsar/confirm → Received → owner alert → owner dashboard status updates.

EDGE CASES (≥1 per path)
  capture: bad email(400) · honeypot(silent-ok) · flood(429) · oversized(413) · Appwrite down(502, don't lose UX).
  events: unknown name(drop) · PII in payload(strip) · flood(rate-limit).
  run: duplicate notice_id(idempotent) · giant input(cap).
  business/slug: taken(409) · reserved/invalid chars · squatting(rate-limit + email-confirm before public).
  dsar/request: invalid type · missing email · spam(confirm-gate+honeypot+rate-limit) · XSS in detail(sanitize/escape).
  dsar/confirm: token invalid/expired/reused(one-time) · already-confirmed(idempotent).
  dsar/status: not owner(403) · invalid status · concurrent edit(last-write).
  auth: magic-link expired/wrong-email · admin not in allowlist(403).
  privacy: never store real Aadhaar/PAN/health — categories only; events carry no PII.

TEST MATRIX
  unit: engine(buildNotice per sector · score · band · flags severity+cap · isVague · slugify · vclause · retText · evidence · rightsBlock) · validity guardrail(no GDPR rights, §6 not §7) · CSV serializer · sha256.
  integration: /api/notice/capture(write+tag+reject+429) · /events(whitelist) · /business(unique 409) · /dsar/request+confirm(state machine + owner alert) · /dsar/status(owner-scope 403) · email senders(mock Resend).
  e2e(Playwright): wizard→preview(no email) · export→gate→capture→download · prefill(?sector=) · DSAR submit→confirm→owner dashboard→status→CSV · admin lead board lists capture.
  a11y: wizard keyboard + modal focus-trap (axe).

DX FRICTION
  TTHW: `npm run dev` + Appwrite dev project + env (APPWRITE_*, RESEND_API_KEY, NEXT_PUBLIC_GA). Deploy: Vercel auto per push.
  (Note: dev server can't run in the agent sandbox — verify locally / via Vercel preview.)

DEPENDENCIES
  none new for S1–S5 — reuse appwrite · resend · zod · abuseGuard · analytics.
  testing: add vitest (unit) + Playwright (e2e) — justified: no runner present; standard, dev-only.
  PDF (S2+, optional): puppeteer-core + @sparticuz/chromium to render notice HTML → Appwrite Storage.
    Heaviest dep; only if branded server PDF is required. Default: client print (no dep). DECISION NEEDED.
```

## VIII-4. Testing strategy
**Pyramid:** many unit (engine is pure → cheapest, highest value) · some integration (route handlers, Appwrite/Resend mocked) · few e2e (the 3 revenue-critical funnels).
- **Cover:** engine assembly + scoring + §17b validity guardrail (security boundary) · capture/DSAR state machines · owner-scoping (authorization) · CSV/hash integrity · the export funnel.
- **Skip:** framework/Next internals · trivial presentational components · generated types · the deterministic data tables (lint, not test).
- **Coverage targets:** `lib/notice-pack/*` **100%** (pure, critical) · API route logic **≥80%** · 3 e2e funnels green.
- **Example cases:** "clinic notice never emits GDPR portability/restriction" · "score caps ≤84 when a risk flag exists" · "DSAR confirm token is single-use" · "owner A cannot read owner B's requests" · "honeypot submit stores nothing, returns ok".
- **CI gates (per PR):** `tsc` + `eslint` + `vitest` + `next build`; Playwright e2e pre-deploy; Vercel preview per PR. Block merge on red.

---

*House standard: no competitive-analysis section (lives in product-context). Full detail intended — this is the dev-ready spec.*

"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import Link from "next/link";
import { useMessages, useTranslations } from "next-intl";
import { ArrowRight, Check, CheckCircle } from "lucide-react";
import type { HeroBand, HeroVerdict } from "@/lib/data/hero-verdicts";
import type { VerdictPreview } from "@/lib/data/verdict-previews";
import { chromeMessage, labelKey } from "@/lib/i18n/chrome";
import { ScoreDial } from "@/components/home/ScoreDial";
import { trackEvent } from "@/lib/analytics";

// S1 — Hero. NAVY, locked by founder decision (Option A, 2026-08-22) after the
// light-vs-navy comparison. The P0 upgrades survive the revert: the display
// type scale, the four-chip selector, the chromed snapshot card, the derived
// geometry backdrop, and the first-fix line. What returns is the ground.
//
// With the hero navy, the opening becomes ONE CONTINUOUS DARK CHAPTER —
// hero → proof seam (navy-800) → risk map (navy) — which is what the master
// spec always specified: "dark zones = Hero+Scatter". Light begins at the
// report (S4), where the product shows itself.
//
// CTA convention, settled with the founder: DARK surfaces carry the bright
// green fill with a navy label (green-400 + navy-950, 9.72:1 — the literal
// brand-book "green + white" measures 2.54:1 and fails everywhere); LIGHT
// surfaces carry deep green with a white label (green-700 + white, 5.48:1).
//
// The hero is deliberately SHORT (pt/pb-14): at a 900px viewport the proof
// seam and the top of the risk map peek above the fold — the pull to scroll
// is the next thing being visible, not a decoration.

/** The page's priority sectors. Must match AudienceCards and VERDICT_PREVIEWS. */
const PRIORITY_SLUGS = ["recruitment", "ca-firms", "d2c-brands"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Tap #2 (HERO_TAP2_SPEC.md) ──────────────────────────────────────────────
// One sector-true yes/no inside the snapshot card. The answer narrows the
// TYPICAL band one authored step and pre-selects the matching option in the
// real assessment via `?pre=` — the hero only WRITES the query; it never reads
// one (no useSearchParams here: that would strip the hero out of the indexed
// HTML).
type Answer = "yes" | "no";
const ANSWERS: Answer[] = ["yes", "no"];

// The answer lives in sessionStorage, read through useSyncExternalStore — so a
// visitor who clicks through to the assessment and presses Back finds their
// answer, not the sample card, with no restore-in-an-effect. Storage that
// throws (private modes, blocked site data) falls back to module memory: the
// card still works, it just forgets on a reload.
const ANSWER_STORE = "sp.hero.answer";
type StoredAnswer = { slug: string; answer: Answer };

let memoryFallback: string | null = null;
let listeners: (() => void)[] = [];

function subscribeAnswer(onChange: () => void) {
  listeners.push(onChange);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

/** Raw string — a stable snapshot React can compare between renders. */
function answerSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(ANSWER_STORE);
  } catch {
    return memoryFallback;
  }
}

function writeStoredAnswer(v: StoredAnswer | null) {
  const raw = v ? JSON.stringify(v) : null;
  memoryFallback = raw;
  try {
    if (raw) window.sessionStorage.setItem(ANSWER_STORE, raw);
    else window.sessionStorage.removeItem(ANSWER_STORE);
  } catch {
    // Storage is a convenience; the in-memory fallback carries this session.
  }
  for (const l of listeners) l();
}

function parseStoredAnswer(raw: string | null): StoredAnswer | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v && typeof v.slug === "string" && (v.answer === "yes" || v.answer === "no")) {
      return { slug: v.slug, answer: v.answer };
    }
  } catch {
    // Unreadable or hand-edited storage → S0, silently.
  }
  return null;
}

// Gold stays the only attention colour; only its WEIGHT steps with the band.
// navy-700 text throughout, measured: 10.30 / 8.52 / 6.54 : 1. Full class
// strings — never derive a Tailwind class by string manipulation.
const BAND_CHIP: Record<HeroBand, string> = {
  Moderate: "bg-gold-300",
  "Moderate–High": "bg-gold-400",
  High: "bg-gold-500",
};

/* Data-governance geometry — faint relationship paths and nodes in white at
   ~5% on navy (felt, not seen). Replaces the two radial-gradient glows the
   old navy hero carried, which read as the stock security-SaaS treatment. */
function HeroGeometry() {
  return (
    <svg
      className="absolute inset-0 h-full w-full text-white opacity-[0.05] pointer-events-none"
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M-20 440 C 240 400, 420 320, 700 340 S 1100 280, 1240 320" strokeDasharray="4 7" />
        <path d="M-20 210 C 300 250, 520 150, 820 190 S 1150 130, 1240 170" strokeDasharray="4 7" />
        <path d="M130 -20 C 170 190, 100 330, 190 580" strokeDasharray="4 7" />
        <path d="M980 -20 C 940 170, 1030 350, 960 580" strokeDasharray="4 7" />
      </g>
      <g fill="currentColor">
        <circle cx="700" cy="340" r="3.5" />
        <circle cx="245" cy="402" r="3" />
        <circle cx="820" cy="190" r="3.5" />
        <circle cx="430" cy="192" r="3" />
        <circle cx="130" cy="150" r="3" />
        <circle cx="980" cy="130" r="3" />
        <circle cx="1090" cy="295" r="3" />
      </g>
    </svg>
  );
}

// Verdicts + previews arrive already localized from the server page (spec §4.3
// bundle law) — this client component never imports an overlay.
export function HeroSection({
  verdicts,
  previews,
}: {
  verdicts: HeroVerdict[];
  previews: VerdictPreview[];
}) {
  const t = useTranslations("home.hero");
  const tq = useTranslations("home.heroQuestions");
  // `band` is a typed key; its display text is a data-driven override
  // (home.band.<key>), English falling back to the key itself.
  const messages = useMessages();
  const bandLabel = (band: string) =>
    chromeMessage(messages, `home.band.${labelKey(band)}`, band);
  const getHeroVerdict = (s: string) => verdicts.find((v) => v.slug === s);

  // A stored answer restores its sector too, so Back lands on S3, not S0. The
  // server snapshot is always null — the card renders S0 on the server and
  // settles on the stored state after hydration.
  const storedRaw = useSyncExternalStore(subscribeAnswer, answerSnapshot, () => null);
  const stored = useMemo(() => {
    const s = parseStoredAnswer(storedRaw);
    return s && PRIORITY_SLUGS.includes(s.slug) ? s : null;
  }, [storedRaw]);

  // null = nothing picked yet; "other" = picked, but no sector-specific read.
  const [picked, setPicked] = useState<string | null>(null);
  const slug = picked ?? stored?.slug ?? null;
  const sectorSlug = slug === "other" ? null : slug;
  const verdict = sectorSlug ? getHeroVerdict(sectorSlug) : null;
  const discoverHref = sectorSlug ? `/discovery?sector=${sectorSlug}` : "/discovery";

  // A row asks its question only when the data carries the structure AND the
  // catalog carries the copy — a missing key renders S1, never a raw key.
  const asked =
    verdict?.pre &&
    verdict.yesBand &&
    verdict.noBand &&
    chromeMessage(messages, `home.heroQuestions.${verdict.slug}.question`, "")
      ? verdict
      : null;
  // The answer the card is showing (S3) — the store is the single source, so
  // the same read serves a fresh answer and a restored one.
  const shown: Answer | null = asked && stored?.slug === asked.slug ? stored.answer : null;
  const band: HeroBand | undefined = !verdict
    ? undefined
    : shown === "yes"
      ? verdict.yesBand
      : shown === "no"
        ? verdict.noBand
        : verdict.band;
  const clause = asked && shown ? tq(`${asked.slug}.${shown}Clause`) : null;

  // One destination per state, two entry points (left CTA + card CTA). Only
  // pack ids travel in the URL — never a score, never anything personal.
  const assessHref =
    asked && shown
      ? `/assessment/${asked.slug}?${
          shown === "yes" ? `pre=${asked.pre!.questionId}:${asked.pre!.optionId}&` : ""
        }src=hero`
      : sectorSlug
        ? `/assessment/${sectorSlug}`
        : "/assessment";

  // Focus follows the swap: answering moves focus to "Change" (the radios it
  // replaced are gone); "Change" returns it to the first radio. Restoring from
  // storage on mount must NOT steal focus, so only a click arms this.
  const focusNext = useRef<"change" | "radio" | null>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [radioFocus, setRadioFocus] = useState(0);
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "change") changeRef.current?.focus();
    if (target === "radio") radioRefs.current[0]?.focus();
  }, [shown]);

  function choose(next: Answer) {
    if (!asked) return;
    if (next !== shown) trackEvent.heroQuestionAnswer({ sector: asked.slug, answer: next });
    focusNext.current = "change";
    writeStoredAnswer({ slug: asked.slug, answer: next });
  }

  function changeAnswer() {
    focusNext.current = "radio";
    setRadioFocus(0);
    writeStoredAnswer(null);
  }

  // Roving tabindex: one tab stop for the pair; ←/→ (and ↑/↓) move, Home/End
  // jump, Space/Enter select (native button activation).
  function onRadioKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = ANSWERS.length - 1;
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i === last ? 0 : i + 1)
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i === 0 ? last : i - 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (to === null) return;
    e.preventDefault();
    setRadioFocus(to);
    radioRefs.current[to]?.focus();
  }

  // The snapshot's "first fix" comes from the same data the full report shows —
  // never invented here. Exists for exactly the three priority sectors.
  const sample = sectorSlug ? previews.find((p) => p.slug === sectorSlug) : undefined;
  const firstFix = sample?.firstActions[0];
  // The dial's number is the report tab's sample number for the same sector —
  // one figure per sector on the page. Only the number: the "Typical risk" row
  // below stays the authored band the answer moves, and a band word on the dial
  // would contradict it the moment the answer steps it.
  const sampleScore = sample?.score;
  // S0's dial is labelled Clinics & Labs, so it reads the Clinics sample too.
  const s0Score = previews.find((p) => p.slug === "clinics-diagnostic-labs")?.score ?? 41;

  // Three priority sectors, resolved from the single source, plus a generic
  // fourth. "Other business" routes to the general pack at /assessment — which
  // is a real, working assessment, but does NOT produce a sector verdict. So it
  // deliberately leaves the sample card up rather than inventing a read.
  const chips = [
    ...PRIORITY_SLUGS.map((s) => getHeroVerdict(s)).filter(
      (v): v is NonNullable<typeof v> => Boolean(v),
    ),
    { slug: "other", chipLabel: t("otherBusiness") },
  ];

  return (
    <section className="relative bg-navy-700 overflow-hidden">
      <HeroGeometry />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-14 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* LEFT — copy + selector + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-500/40 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              <span className="text-teal-300 text-xs font-semibold">
                {t("badge")}
              </span>
            </div>

            {/* The promise is the SCORE, not a position — it names the
                deliverable the report actually hands over. */}
            <h1 className="type-display-1 text-white mb-6 max-w-[16ch]">
              {t.rich("title", {
                accent: (chunks) => <span className="text-green-400">{chunks}</span>,
              })}
            </h1>
            <p className="type-intro text-slate-300 mb-8 max-w-xl">
              {t("intro")}
            </p>

            {/* is-this-me selector — one interaction grammar, dark register:
                selected = bright green fill + navy label + check. */}
            <div className="mb-7">
              <span className="block text-sm text-slate-400 mb-2.5">{t("iRunA")}</span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={t("selectorAria")}
              >
                {chips.map((v) => {
                  const active = v.slug === slug;
                  return (
                    <button
                      key={v.slug}
                      type="button"
                      onClick={() => {
                        if (v.slug !== slug) {
                          trackEvent.heroSectorSelect({ sector: v.slug });
                          // A new sector asks its own question (S3 → S2/S1).
                          setRadioFocus(0);
                          writeStoredAnswer(null);
                        }
                        setPicked(v.slug);
                      }}
                      aria-pressed={active}
                      className={`inline-flex items-center justify-center gap-1.5 text-sm rounded-full border transition-colors px-4 py-2.5 min-h-[44px] sm:px-3.5 sm:py-1.5 sm:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                        active
                          ? "bg-green-400 border-green-400 text-navy-950 font-medium"
                          : "bg-white/5 border-white/15 text-slate-200 hover:border-white/30"
                      }`}
                    >
                      {active && <Check size={14} aria-hidden="true" />}
                      {cap(v.chipLabel)}
                    </button>
                  );
                })}
              </div>
              {/* The nine sectors not shown are one scroll away, not gone. */}
              <p className="mt-2.5 text-sm text-cloud-400">
                <a
                  href="#sectors"
                  className="inline-flex items-center pointer-coarse:min-h-11 underline underline-offset-4 decoration-white/25 hover:decoration-white hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 rounded"
                >
                  {t("seeAllSectors")}
                  <span aria-hidden="true"> ↓</span>
                </a>
              </p>
            </div>

            {/* One filled action — the dark-surface register: bright green,
                navy label, 9.72:1. The brightest object in the frame. */}
            <div className="mb-5">
              <Link
                href={assessHref}
                onClick={() =>
                  trackEvent.landingCtaClick({ cta: "assess", sector: slug ?? "", answered: shown ?? "" })
                }
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-400 hover:bg-green-300 text-navy-950 font-semibold rounded-lg transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
              >
                {shown ? t("seeRealScore") : t("takeFreeAssessment")}
                <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-sm text-cloud-400">{t("frictionLine")}</p>

            <p className="mt-4 text-sm text-cloud-400">
              {t("notSureData")}{" "}
              <Link
                href={discoverHref}
                onClick={() =>
                  trackEvent.landingCtaClick({ cta: "discover", sector: slug ?? "", answered: shown ?? "" })
                }
                className="font-medium text-slate-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 rounded"
              >
                {slug && slug !== "other" ? t("seeMyDataMap") : t("mapItFirst")}
                <span aria-hidden="true"> →</span>
              </Link>
            </p>
          </div>

          {/* RIGHT — the Privacy Readiness Snapshot: one product-chromed frame,
              sample by default, live verdict on select. White needs no hairline
              on navy — the fill IS the edge. min-h holds the tallest state
              (S2, the question) so the swap never re-centres the row.
              The card no longer re-reads itself on every swap: one scoped
              polite region announces the narrowed band on S3. */}
          {/* 548px = the tallest state measured at build (recruitment S2, the
              same at 1024, 1280 and 1440; was 504 before the sample dial). The
              left column is ~630px, so holding this costs the hero no height
              and the card stops re-centring on a chip change. Re-measure if a
              question or riskLine gets longer. */}
          <div aria-live="off" className="lg:pl-4 lg:min-h-[548px]">
            <p className="sr-only" aria-live="polite">
              {asked && shown && band
                ? t("bandAnnounce", { sector: asked.chipLabel, clause: clause ?? "", band: bandLabel(band) })
                : ""}
            </p>
            <div className="max-w-md mx-auto lg:ml-auto rounded-xl overflow-hidden shadow-elevated">
              {/* chrome — a shade darker than the page, so it reads as the
                  card's title bar rather than the page bleeding through */}
              <div className="flex items-center justify-between gap-3 bg-navy-950 px-4 py-2.5">
                <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-cloud-400">
                  {t("snapshotTitle")}
                </span>
                <span className="text-2xs font-semibold text-white whitespace-nowrap">
                  {verdict ? cap(verdict.chipLabel) : t("sampleLabel")}
                </span>
              </div>

              {/* body */}
              {verdict && band ? (
                <div key={verdict.slug} className="bg-white p-6 animate-fade-up motion-reduce:animate-none">
                  {/* The sample dial sits beside the lead line in every
                      picked state, as it does on S0 — the card never goes
                      numberless on a pick. */}
                  <div className="flex items-center gap-4 mb-4">
                    {sampleScore !== undefined ? (
                      <div className="shrink-0">
                        <ScoreDial value={sampleScore} size={66} animate />
                      </div>
                    ) : (
                      <CheckCircle size={20} className="text-green-800 shrink-0 self-start mt-0.5" />
                    )}
                    <div>
                      {asked && shown ? (
                        // S3 — applies-to is already known; the answer line
                        // takes the top. It states the next gap, never praise.
                        <p className="text-navy-700 font-semibold text-sm leading-snug">
                          {tq(`${asked.slug}.${shown}Line`)}
                        </p>
                      ) : (
                        <p className="text-navy-700 font-semibold text-sm leading-snug">
                          {t("appliesTo", { sector: verdict.chipLabel })}
                        </p>
                      )}
                      {sampleScore !== undefined && (
                        <p className="mt-1 text-xs text-slate-600">{t("sampleScoreNote")}</p>
                      )}
                    </div>
                  </div>
                  {!(asked && shown) && (
                    <p className="text-slate-600 text-sm leading-snug mb-4">{verdict.riskLine}</p>
                  )}

                  {/* The gold band row is the eye's landing point in every
                      state; the question sits AFTER it, as the way to sharpen
                      it. S3 is a narrower TYPICAL — never a score. */}
                  <div className="border-t border-cloud-200 pt-4 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600">{t("typicalRisk")}</span>
                      <span
                        key={band}
                        className={`text-sm font-semibold text-navy-700 ${BAND_CHIP[band]} rounded px-2 py-0.5 whitespace-nowrap transition-colors animate-fade-up motion-reduce:animate-none`}
                        style={{ animationDelay: shown ? "0ms" : "200ms" }}
                      >
                        {bandLabel(band)}
                      </span>
                    </div>
                    {clause && (
                      <p className="mt-1 text-xs text-slate-600 leading-snug">
                        {t("typicalFor", { sector: verdict.chipLabel, clause })}
                      </p>
                    )}
                  </div>

                  {asked && !shown && (
                    // S2 — one choice: a radiogroup, light register (green on a
                    // pill = selected, the chip grammar — never a verdict).
                    <div className="mt-4 pt-4 border-t border-cloud-200 mb-4">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                        {t("questionEyebrow")}
                      </span>
                      <p id={`hero-q-${asked.slug}`} className="text-sm font-semibold text-navy-700 leading-snug mb-2">
                        {tq(`${asked.slug}.question`)}
                      </p>
                      <div role="radiogroup" aria-labelledby={`hero-q-${asked.slug}`} className="flex gap-2">
                        {ANSWERS.map((val, i) => {
                          const checked = shown === val;
                          return (
                            <button
                              key={val}
                              ref={(el) => {
                                radioRefs.current[i] = el;
                              }}
                              type="button"
                              role="radio"
                              aria-checked={checked}
                              tabIndex={i === radioFocus ? 0 : -1}
                              onClick={() => choose(val)}
                              onKeyDown={(e) => onRadioKey(e, i)}
                              onFocus={() => setRadioFocus(i)}
                              className={`flex-1 sm:flex-none inline-flex items-center justify-center text-sm font-medium rounded-full border transition-colors px-4 py-2 min-h-[44px] sm:px-3.5 sm:py-1.5 sm:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 ${
                                checked
                                  ? "bg-green-700 border-green-700 text-white hover:bg-green-800"
                                  : "bg-white border-cloud-300 text-navy-700 hover:border-navy-700 hover:bg-cloud-50 active:bg-cloud-100"
                              }`}
                            >
                              {t(val)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {asked && shown && (
                    <p className="mt-4 pt-4 border-t border-cloud-200 mb-4 text-xs text-slate-600 leading-snug">
                      {t("youSaid", { answer: t(shown).toLowerCase() })}
                      <span aria-hidden="true"> · </span>
                      <button
                        ref={changeRef}
                        type="button"
                        onClick={changeAnswer}
                        className="inline-flex items-center pointer-coarse:min-h-11 font-medium text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
                      >
                        {t("change")}
                      </button>
                    </p>
                  )}

                  {firstFix && (
                    <div className="mb-4">
                      <span className="block text-2xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                        {t("firstFixLabel")}
                      </span>
                      <p className="text-sm text-slate-600 leading-snug">{firstFix}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-snug">
                    {t("realScoreAway")}{" "}
                    {shown ? (
                      <Link
                        href={assessHref}
                        onClick={() =>
                          trackEvent.landingCtaClick({ cta: "assess_card", sector: slug ?? "", answered: shown })
                        }
                        className="font-medium text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded"
                      >
                        {t("seeRealScore")}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    ) : (
                      <a
                        href="#report"
                        className="font-medium text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800"
                      >
                        {t("seeFullReport")} ↓
                      </a>
                    )}
                  </p>
                </div>
              ) : (
                <div className="bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      <ScoreDial value={s0Score} size={66} animate />
                    </div>
                    <div>
                      <span className="inline-block text-xs font-semibold text-navy-800 bg-gold-300 rounded-full px-3 py-1 mb-1.5">
                        {t("highPriorityAction")}
                      </span>
                      <p className="text-sm text-slate-600 leading-snug">
                        {t("significantGaps")}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-4">
                    {slug === "other" ? t("generalCheck") : t("pickBusiness")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

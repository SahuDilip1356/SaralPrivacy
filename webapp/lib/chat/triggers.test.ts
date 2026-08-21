// Run: node --test --experimental-strip-types lib/chat/triggers.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import {
  DISMISS_SUPPRESSION_MS,
  afterDismissed,
  afterShown,
  canShowProactive,
  triggerForPage,
  type ProactiveStore,
} from "./triggers.ts";

const fresh = (): ProactiveStore => ({ muted: false, shownThisSession: false });

test("page table: right condition per surface", () => {
  assert.equal(triggerForPage("/")?.condition.kind, "dwell");
  assert.deepEqual(triggerForPage("/industries/ca-firms")?.condition, { kind: "scroll", percent: 50 });
  assert.deepEqual(triggerForPage("/learn/consent")?.condition, { kind: "scroll", percent: 60 });
  assert.equal(triggerForPage("/faq")?.condition.kind, "dwell");
  assert.deepEqual(triggerForPage("/blog/some-post")?.condition, { kind: "scroll", percent: 80 });
});

test("suppressed surfaces never get proactive prompts", () => {
  for (const p of [
    "/privacy",
    "/terms",
    "/consent-preferences",
    "/rights",
    "/contact",
    "/assessment/ca-firms", // active quiz
    "/tools/dpdpa-privacy-notice-generator",
    "/subscribe",
  ]) {
    assert.equal(triggerForPage(p), null, `should suppress ${p}`);
  }
});

test("assessment hub still allowed even though quiz steps are not", () => {
  // Hub has no entry in the table (returns null) but not because of suppression —
  // documents that /assessment/{slug} is the suppressed shape.
  assert.equal(triggerForPage("/assessment"), null);
});

test("frequency caps: once per session, 7-day dismissal, permanent mute", () => {
  const now = 1_000_000;
  let store = fresh();
  assert.equal(canShowProactive(store, now), true);

  store = afterShown(store);
  assert.equal(canShowProactive(store, now), false, "only one per session");

  let dismissed = afterDismissed(fresh(), now, false);
  assert.equal(canShowProactive({ ...dismissed, shownThisSession: false }, now + 1000), false);
  assert.equal(
    canShowProactive({ ...dismissed, shownThisSession: false }, now + DISMISS_SUPPRESSION_MS + 1),
    true,
    "suppression expires after ~7 days"
  );

  const muted = afterDismissed(fresh(), now, true);
  assert.equal(
    canShowProactive({ ...muted, shownThisSession: false }, now + DISMISS_SUPPRESSION_MS * 100),
    false,
    "mute is permanent"
  );
});

// ── Outcome layer §7.1/§7.3 ────────────────────────────────────────────────

test("every sector page gets its own authored opener, not the generic line", () => {
  const SLUGS = [
    "ca-firms", "recruitment-agencies", "training-institutes", "d2c-brands",
    "clinics-diagnostic-labs", "schools-colleges", "law-firms", "real-estate",
    "hotels-travel", "pharmacies", "fintech-nbfc", "gyms-salons-spas",
  ];
  const seen = new Set<string>();
  for (const slug of SLUGS) {
    const trig = triggerForPage(`/industries/${slug}`);
    assert.ok(trig, `${slug} has no trigger`);
    assert.notEqual(
      trig!.message,
      "Would you like to check what this means for your business?",
      `${slug} still shows the generic opener`
    );
    assert.ok(!seen.has(trig!.message), `${slug} reuses another sector's line`);
    seen.add(trig!.message);
  }
});

test("an unknown sector slug falls back rather than throwing", () => {
  const trig = triggerForPage("/industries/not-a-real-sector");
  assert.ok(trig);
  assert.equal(trig!.message, "Would you like to check what this means for your business?");
});

test("the homepage opener is a question with answerable chips that fill slots", () => {
  const trig = triggerForPage("/");
  assert.ok(trig?.chips, "homepage opener has no chips");
  assert.equal(trig!.chips!.length, 3);
  for (const chip of trig!.chips!) {
    assert.ok(chip.slot.length > 0, "chip writes no slot");
    assert.ok(chip.value.length > 0);
    assert.ok(chip.message.length > 0, "chip sends no message");
  }
});

test("opener selection is a pure function of the path — no other source is read", () => {
  // The no-tracking boundary (§7.3), enforced rather than merely documented.
  // If someone later reaches for a visitor profile or a cross-session history
  // to pick an opener, repeated calls stop agreeing and this fails.
  for (const path of ["/", "/industries/pharmacies", "/learn/consent", "/faq", "/contact"]) {
    const a = triggerForPage(path);
    const b = triggerForPage(path);
    assert.deepEqual(a, b, `${path} is not deterministic`);
  }
});

test("suppression list survived the opener rewrite", () => {
  for (const p of [
    "/privacy", "/terms", "/consent-preferences", "/rights", "/subscribe",
    "/unsubscribe", "/contact", "/assessment/ca-firms", "/tools/dpdpa-privacy-notice-generator",
  ]) {
    assert.equal(triggerForPage(p), null, `${p} is no longer suppressed`);
  }
});

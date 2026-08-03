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

// Header IA contract tests.
// Run: node --test --experimental-strip-types lib/data/navigation.test.ts
//
// This file's imports carry explicit ".ts", so it needs no resolver hook.
// Suites that import the bundler-style paths (lib/chat/site-routing.test.ts
// reaching the data-flow registry) need the repo's hook and fail with
// ERR_MODULE_NOT_FOUND without it — that is a wrong invocation, not a
// broken test:
//   node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test <file>
//
// The header is the one component on every page, so a dead link here is a
// dead link sitewide. TIER 1 asserts every href resolves to a real page under
// app/ — the same guarantee lib/chat/site-routing.test.ts gives the bot, and
// the pageExists() logic is deliberately the same shape so the two agree
// about what "a route exists" means.
// TIER 2 asserts the IA rules the design depends on: one featured item per
// menu, exactly one filled action, descriptions where the design renders them.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { navMenus, primaryAction, secondaryAction } from "./navigation.ts";
import { learnContent } from "./learn-content.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(HERE, "..", "..", "app");
const LEARN_TOPIC_SLUGS = new Set(Object.keys(learnContent));

function pageExists(path: string): boolean {
  // Strip the fragment: /white-paper#download is the page plus an anchor.
  const clean = path.split("#")[0];
  if (clean === "/") return existsSync(join(APP_DIR, "page.tsx"));
  const segments = clean.slice(1).split("/");
  if (existsSync(join(APP_DIR, ...segments, "page.tsx"))) return true;
  // Learn topics render through app/learn/[topic]/page.tsx.
  if (segments[0] === "learn" && segments.length === 2) {
    return (
      existsSync(join(APP_DIR, "learn", "[topic]", "page.tsx")) &&
      LEARN_TOPIC_SLUGS.has(segments[1])
    );
  }
  return false;
}

function allItems() {
  return navMenus.flatMap((m) => [m.featured, ...m.items]);
}

// ── TIER 1: the route contract ────────────────────────────────────────────

test("every nav href resolves to a real page under app/", () => {
  for (const menu of navMenus) {
    for (const item of [menu.featured, ...menu.items]) {
      assert.ok(
        pageExists(item.href),
        `dead link in ${menu.label} menu: ${item.label} -> ${item.href}`
      );
    }
    if (menu.viewAll) {
      assert.ok(
        pageExists(menu.viewAll.href),
        `dead viewAll link in ${menu.label}: ${menu.viewAll.href}`
      );
    }
  }
});

test("both header actions resolve to real pages", () => {
  assert.ok(pageExists(primaryAction.href), `dead primary action: ${primaryAction.href}`);
  assert.ok(pageExists(secondaryAction.href), `dead secondary action: ${secondaryAction.href}`);
});

// ── TIER 2: the IA rules the design depends on ────────────────────────────

test("the bar stays scannable: at most five top-level menus", () => {
  // Seven is what forced the desktop bar to xl and handed 1024-1279px
  // laptops a hamburger. Past five, a bar gets read instead of scanned.
  assert.ok(
    navMenus.length <= 5,
    `${navMenus.length} top-level menus; the bar stops being scannable past 5`
  );
});

test("every menu has exactly one featured item", () => {
  for (const menu of navMenus) {
    assert.ok(menu.featured, `${menu.label} has no featured item`);
    assert.ok(
      !menu.items.some((i) => i.href === menu.featured.href && !i.comingSoon),
      `${menu.label} repeats its featured href in the item grid`
    );
  }
});

test("featured items always carry a description", () => {
  // The featured slot renders its description unconditionally; an empty one
  // leaves a visible gap in the panel.
  for (const menu of navMenus) {
    assert.ok(
      menu.featured.description.length > 0,
      `${menu.label} featured item has no description`
    );
  }
});

test("grid items carry a description unless the menu opted out wholesale", () => {
  // Industries is the deliberate exception: twelve self-evident sector names
  // in a three-column grid. The rule is all-or-nothing per menu, so a menu
  // cannot half-describe its items and render a ragged panel.
  for (const menu of navMenus) {
    const described = menu.items.filter((i) => i.description.length > 0).length;
    assert.ok(
      described === 0 || described === menu.items.length,
      `${menu.label} describes ${described} of ${menu.items.length} items; make it all or none`
    );
  }
});

test("exactly one filled action exists in the chrome", () => {
  // Two filled greens above the fold is what W5 removed from the hero and
  // what the header quietly put back. primaryAction is the only fill.
  assert.equal(typeof primaryAction.label, "string");
  assert.ok(primaryAction.label.length > 0);
  assert.notEqual(
    secondaryAction.label,
    primaryAction.label,
    "the secondary action must not restate the primary one"
  );
});

test("a coming-soon item never claims a unique destination", () => {
  // It renders inert, so its href is never followed. Pointing it at the hub
  // keeps the contract honest if it is ever made clickable by accident.
  for (const item of allItems()) {
    if (item.comingSoon) {
      assert.ok(pageExists(item.href), `coming-soon item points nowhere: ${item.label}`);
    }
  }
});

test("no duplicate labels within a menu", () => {
  for (const menu of navMenus) {
    const labels = [menu.featured, ...menu.items].map((i) => i.label);
    assert.equal(new Set(labels).size, labels.length, `${menu.label} has duplicate labels`);
  }
});

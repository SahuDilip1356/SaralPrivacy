// Setu site-router guard tests.
// Run: node --test --experimental-strip-types lib/chat/site-routing.test.ts
//
// TIER 1: every linkable path resolves to a real page under app/ — a route
// added here without a page (or a page renamed without updating the router)
// fails at test time, which is the spec §3 "dead links fail at compile/test
// time" guarantee.
// TIER 2: allowlist semantics — isValidCitation / isAuthorityCitation accept
// exactly the shapes the bot may emit and reject everything else.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  DEFAULT_CHIPS,
  EXCLUDE_FROM_AUTHORITY,
  INDUSTRY_SLUGS,
  NEVER_SURFACE_PREFIXES,
  ROUTES,
  chipsForPage,
  isAuthorityCitation,
  isNeverSurfaced,
  isValidCitation,
  routeForIndustry,
  routesForTopic,
  toolForIntent,
  type Intent,
} from "./site-routing.ts";
import { topicNav } from "../learnNav.ts";

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "app");

/** Learn slugs served by app/learn/[topic] (entries without an external href). */
const LEARN_TOPIC_SLUGS = new Set(
  topicNav.filter((t) => !("href" in t) || t.href?.startsWith("/learn/")).map((t) => t.slug)
);

function pageExists(path: string): boolean {
  if (path === "/") return existsSync(join(APP_DIR, "page.tsx"));
  const segments = path.slice(1).split("/");
  // Static match first.
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

test("every ROUTES url resolves to a real page under app/", () => {
  for (const route of ROUTES) {
    assert.ok(pageExists(route.url), `dead link in ROUTES: ${route.url}`);
  }
});

test("every EXCLUDE_FROM_AUTHORITY url resolves to a real page", () => {
  for (const url of EXCLUDE_FROM_AUTHORITY) {
    assert.ok(pageExists(url), `dead utility link: ${url}`);
  }
});

test("route urls are canonical and unique", () => {
  const seen = new Set<string>();
  for (const route of ROUTES) {
    assert.match(route.url, /^\/[a-z0-9\-/]*$/, `non-canonical url: ${route.url}`);
    assert.ok(!route.url.endsWith("/") || route.url === "/", `trailing slash: ${route.url}`);
    assert.ok(!seen.has(route.url), `duplicate url: ${route.url}`);
    seen.add(route.url);
    assert.ok(route.title.length > 0 && route.summary.length > 0, `empty copy: ${route.url}`);
  }
});

test("all 12 industries have exactly one tier-2 route", () => {
  assert.equal(INDUSTRY_SLUGS.length, 12);
  for (const slug of INDUSTRY_SLUGS) {
    const matches = ROUTES.filter((r) => r.industry === slug);
    assert.equal(matches.length, 1, `industry ${slug} has ${matches.length} routes`);
    assert.equal(matches[0].tier, 2);
    assert.equal(routeForIndustry(slug).url, `/industries/${slug}`);
  }
});

test("toolForIntent covers every intent", () => {
  const intents: Intent[] = ["assessment", "penalty", "discovery", "notice", "whitepaper"];
  for (const intent of intents) {
    const route = toolForIntent(intent);
    assert.ok(route, `no tool route for intent ${intent}`);
    assert.equal(route.tier, 3);
  }
});

test("isValidCitation accepts allowlisted paths in both absolute and relative form", () => {
  assert.ok(isValidCitation("/learn/consent"));
  assert.ok(isValidCitation("https://saralprivacy.com/learn/consent"));
  assert.ok(isValidCitation("/learn/consent/")); // trailing slash normalised
  assert.ok(isValidCitation("/contact")); // utility: linkable
  assert.ok(isValidCitation("/data-mapping"));
  assert.ok(isValidCitation("/assessment")); // hub linkable even though /assessment/* is banned
});

test("isValidCitation rejects everything the bot must never emit", () => {
  const banned = [
    "https://evil.example.com/learn/consent",
    "http://saralprivacy.com/learn/consent", // wrong scheme prefix → not host-stripped
    "/admin",
    "/admin/briefings",
    "/api/chat",
    "/assessment/ca-firms", // quiz step
    "/report/abc",
    "/subscribe",
    "/unsubscribe",
    "/learn/consent?utm=x", // no query params in citations
    "/learn/consent#s2", // no fragments
    "/learn/invented-page",
    "/industries/crypto-exchanges", // not a real sector
    "javascript:alert(1)",
    "",
  ];
  for (const url of banned) {
    assert.equal(isValidCitation(url), false, `should reject: ${url}`);
  }
});

test("isAuthorityCitation is tier 1/2 only", () => {
  assert.ok(isAuthorityCitation("/learn/consent"));
  assert.ok(isAuthorityCitation("/industries/ca-firms"));
  assert.equal(isAuthorityCitation("/white-paper"), false); // tier 3
  assert.equal(isAuthorityCitation("/briefings"), false); // tier 4
  assert.equal(isAuthorityCitation("/contact"), false); // utility
});

test("utility paths never overlap ROUTES and never-surface prefixes never match linkables", () => {
  const routeUrls = new Set(ROUTES.map((r) => r.url));
  for (const url of EXCLUDE_FROM_AUTHORITY) {
    assert.ok(!routeUrls.has(url), `utility url also in ROUTES: ${url}`);
  }
  for (const url of [...routeUrls, ...EXCLUDE_FROM_AUTHORITY]) {
    assert.ok(!isNeverSurfaced(url), `linkable ${url} is never-surfaced`);
  }
});

test("routesForTopic ranks tier 1 first", () => {
  const consent = routesForTopic("consent");
  assert.ok(consent.length > 0);
  assert.equal(consent[0].url, "/learn/consent");
  assert.equal(routesForTopic("").length, 0);
});

test("chipsForPage: contextual on industry and learn pages, default elsewhere", () => {
  for (const slug of INDUSTRY_SLUGS) {
    const chips = chipsForPage(`/industries/${slug}`);
    assert.equal(chips.length, 3, `industry chips for ${slug}`);
    for (const chip of chips) {
      assert.ok(chip.label.length > 0 && chip.message.length > 0);
    }
  }
  assert.equal(chipsForPage("/learn/consent").length, 3);
  assert.deepEqual(chipsForPage("/"), DEFAULT_CHIPS);
  assert.deepEqual(chipsForPage("/industries/not-a-sector"), DEFAULT_CHIPS);
  assert.equal(chipsForPage("/").length, 5);
});

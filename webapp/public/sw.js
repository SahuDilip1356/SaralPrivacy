/*
 * SaralPrivacy service worker — offline shell only (push arrives in M3).
 * See MOBILE_APP_SPEC.md §2.3. Rollback = deploy docs/sw-killswitch.js as sw.js.
 *
 * VERSION is the deploy mechanism: the browser re-checks this file
 * byte-for-byte, so any change here (including the version bump itself)
 * ships a new worker that takes over on the next page load.
 */
const VERSION = "sp-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Same-origin only, and never touch API or admin — a cached response for
  // either is a correctness/security bug, not a performance win.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  // Pages: network-first so a fresh briefing always wins; cached copy is the
  // offline fallback, /offline the last resort.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Build assets are content-hashed, hence immutable: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});

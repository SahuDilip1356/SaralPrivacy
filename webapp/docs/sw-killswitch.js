/*
 * SERVICE WORKER KILL SWITCH — do not import; this file is a standby.
 *
 * If a broken service worker ever ships, installed clients keep running it
 * until a replacement arrives. To roll back:
 *   1. Copy this file over public/sw.js
 *   2. Deploy
 * Every client picks it up on its next navigation, wipes all SW caches,
 * unregisters itself, and reloads open tabs back onto the plain network.
 * (MOBILE_APP_SPEC.md §2.3 — "the PWA equivalent of a rollback".)
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});

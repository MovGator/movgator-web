/* MovGator service worker: app-shell + static caching only.
   NEVER caches /api/*, cookies, or auth responses. Versioned cache. */
const VERSION = "mg-v2";
const SHELL = ["/offline", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // API + auth: network only, never cache private data.
  if (url.pathname.startsWith("/api/")) return;
  if (request.method !== "GET") return;
  // Static/brand assets: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/brand/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            // Never cache failures: a 404/500 body stored under a .css/.js
            // URL is served back forever (cache-first) and the page renders
            // permanently unstyled. Only persist successful responses.
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }
  // Navigations: network-first, offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline").then((r) => r || Response.error()))
    );
  }
});

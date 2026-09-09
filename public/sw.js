// LingoAI Safe Production Service Worker
// Version: 1.0.0
// Strict Security Principle: Static assets only. Never cache authenticated APIs or user data.

const CACHE_NAME = "lingoai-static-v1";
const STATIC_PRECACHE = [
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/offline.html",
];

// 1. Installation: Precache public static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn("[SW] Precache notice:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activation: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: Conservative routing
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // STRICT SECURITY CHECK: Never intercept or cache private / authenticated routes
  const isPrivateEndpoint =
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/notifications") ||
    url.pathname.startsWith("/_next/data/");

  if (isPrivateEndpoint) {
    // Direct network pass-through — never touch cache
    return;
  }

  // Static Assets (icons, images, manifest): Cache-first with network fallback
  const isStaticAsset =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.json";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Navigation / Page Requests: Network-first, safe fallback to offline.html if offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/offline.html");
      })
    );
  }
});

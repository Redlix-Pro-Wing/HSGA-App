const CACHE_NAME = "hsga-pwa-cache-v1";
const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force cache static assets
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip API requests and external URLs except our Cloudinary logo
  if (
    url.pathname.startsWith("/api") ||
    (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes("cloudinary.com"))
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we get a valid response, cache it dynamically for future offline access (except sensitive dashboard pages)
        if (
          response.status === 200 &&
          !url.pathname.startsWith("/admin") &&
          !url.pathname.startsWith("/employee")
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network query failed, check cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If navigation request fails and nothing in cache, redirect to offline page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          
          return Promise.reject("no-match");
        });
      })
  );
});

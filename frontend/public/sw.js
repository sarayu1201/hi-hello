const CACHE_NAME = "kr-academy-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/logo.svg",
  "/logo192.png",
  "/logo512.png",
  "/manifest.json"
];

// Install Service Worker and cache core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static shell assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Serve cached assets or query network
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip caching for API requests, websockets, and external API calls (e.g. port 5000)
  if (url.pathname.startsWith("/api/") || request.url.includes(":5000") || request.method !== "GET") {
    return; // Let standard fetch handle the request
  }

  // Handle SPA routing: serve /index.html with Network First strategy
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match("/index.html");
        })
    );
    return;
  }

  // Define static files that can be cached first (images, icons, manifest, fonts)
  const isStaticAsset = url.pathname.endsWith(".png") || 
                        url.pathname.endsWith(".svg") || 
                        url.pathname.endsWith(".jpg") || 
                        url.pathname.endsWith(".gif") || 
                        url.pathname.endsWith(".ico") || 
                        url.pathname.endsWith(".json") || 
                        url.pathname.includes("/assets/fonts/");

  if (isStaticAsset) {
    // Cache First with Network Fallback
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Network First with Cache Fallback (for JS, CSS, and main documents)
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback for offline images
            if (request.headers.get("accept") && request.headers.get("accept").includes("image")) {
              return caches.match("/logo.svg");
            }
          });
        })
    );
  }
});

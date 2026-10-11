// PRAN-NET Progressive Web App Service Worker
const CACHE_NAME = 'pran-net-v1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: precache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: cleanup obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Never intercept or cache non-GET requests (e.g. POST /actions mutations)
  if (req.method !== 'GET') {
    return;
  }

  // 2. Telemetry and live APIs: Network-first, do NOT cache as live if offline
  if (
    url.pathname.includes('/telemetry') ||
    url.pathname.includes('/advisory') ||
    url.hostname.includes('open-meteo.com') ||
    url.hostname.includes('data.gov.in')
  ) {
    event.respondWith(
      fetch(req).catch(() => {
        // Return a JSON response marking data as unavailable/offline rather than stale fake live
        return new Response(
          JSON.stringify({
            status: 'OFFLINE_UNAVAILABLE',
            error: 'Live telemetry is unavailable offline. Reconnect to refresh atmospheric readings.',
            cached: false,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
          }
        );
      })
    );
    return;
  }

  // 3. Static assets & app shell: Cache-first, fall back to network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(req).then((response) => {
        // Cache successful local GET responses
        if (response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone);
          });
        }
        return response;
      });
    })
  );
});

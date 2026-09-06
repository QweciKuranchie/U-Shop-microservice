// U-Shop Service Worker
// Implements offline-first caching with network fallback strategies

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `ushop-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ushop-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `ushop-images-${CACHE_VERSION}`;

// Core shell assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/offline',
];

// Max entries for dynamic caches to prevent storage bloat
const DYNAMIC_CACHE_LIMIT = 50;
const IMAGE_CACHE_LIMIT = 100;

// Trim cache to a max number of items (FIFO)
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => trimCache(cacheName, maxItems));
      }
    });
  });
}

// ─── INSTALL ────────────────────────────────────────────────────────────────────
// Precache core shell assets for instant loading
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate new SW immediately without waiting for old one to finish
  self.skipWaiting();
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────────
// Clean up old versioned caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('ushop-') && !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── FETCH ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Clerk auth, API routes, Sanity Studio, and extension URLs
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/studio') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.hostname.includes('clerk') ||
    url.hostname.includes('sanity') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Strategy 1: Cache-first for static assets (JS, CSS, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 2: Cache-first for images with dedicated image cache
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/) ||
    url.pathname.startsWith('/_next/image')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 3: Network-first for HTML pages (always try fresh content)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            // Serve cached version, or offline fallback page
            return cached || caches.match('/offline');
          });
        })
    );
    return;
  }

  // Strategy 4: Stale-while-revalidate for everything else (JSON data, etc.)
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

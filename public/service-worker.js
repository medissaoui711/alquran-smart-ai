const CACHE_NAME = 'mushaf-pro-v3'; // Bump version for updates
const ASSETS_CACHE = 'assets-v3';
const AUDIO_CACHE = 'audio-v1'; // Audio can stay v1
const API_CACHE = 'api-v1';

// Assets to pre-cache (Essential for Shell & PWA Icons)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.svg',
  '/apple-touch-icon.png',
  '/icon-192.svg',
  '/icon-192.png',
  '/icon-512.svg',
  '/icon-512.png',
  '/mushaf_cover.svg',
  '/mushaf_cover.jpg',
  '/ai_feature_icon.svg',
  '/ai_feature_icon.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE).then(async (cache) => {
      console.log('Pre-caching essential assets...');
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('Failed to pre-cache asset:', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![ASSETS_CACHE, AUDIO_CACHE, API_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle Message for Skip Waiting (Triggered from UI)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // 1. Handle Audio Files (Cache First, Fallback to Network)
  // Large files, we don't want to block the main thread or cache them all at once
  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) return response;
          return fetch(event.request).then((networkResponse) => {
            // Only cache if successful
            if (networkResponse.status === 200 || networkResponse.status === 206) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Handle API Calls (Network First, Fallback to Cache)
  // We want the freshest data for Quran text/explanations
  if (url.hostname.includes('api.alquran.cloud') || url.hostname.includes('gemini')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(API_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Handle Fonts & CDNs (Cache First)
  if (
    url.hostname.includes('fonts.gstatic.com') || 
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('cdn-icons-png.flaticon.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 4. Default Strategy: Stale-While-Revalidate for application assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache successful same-origin requests or specific external assets
        if (networkResponse.status === 200 && (url.origin === location.origin)) {
          caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
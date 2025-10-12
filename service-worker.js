const CACHE_NAME = 'spy-app-v3';
const OFFLINE_PAGE = '/index.html';
const ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/css/styles.css',
  '/css/nsb-box.css',
  '/js/programm.js',
  '/js/langSwitcher.js',
  '/js/topics.js',
  '/js/topics-en.js',
  '/js/how-to.js',
  '/js/safari-fix.js',
  '/js/restor-player-count.js',
  '/datenschutz/index.html',
  '/impressum/index.html',
  '/images/info.svg',
  '/images/logo.svg',
  '/images/background.webp',
  '/how-to-de.html',
  '/how-to-en.html',
  '/README-EN.html',
  '/README-DE.html',
  '/README.md'
];

// INSTALL – pre-cache all core assets
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const asset of ASSETS) {
      try {
        await cache.add(asset);
      } catch (err) {
        console.warn('[SW] Failed to cache', asset, err);
      }
    }
    await self.skipWaiting();
  })());
});

// ACTIVATE – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== CACHE_NAME) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

// FETCH – cache-first with offline fallback
self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle same-origin GETs
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin)
    return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      // Offline fallback only for navigation requests
      if (request.mode === 'navigate') {
        return cache.match(OFFLINE_PAGE);
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
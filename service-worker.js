const CACHE_NAME = 'spy-app-v1';
const OFFLINE_PAGE = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  OFFLINE_PAGE,
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
  '/README.md',
];

// Install: Cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for (const asset of ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn('Failed to cache', asset, err);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Network-first for .txt files
  if (url.pathname.endsWith('.txt')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 2. Navigation: Cache-first, then network with cache update, else offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then(response => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => caches.match(OFFLINE_PAGE));
      })
    );
    return;
  }

  // 3. Default: Cache-first, then network with cache persistence
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
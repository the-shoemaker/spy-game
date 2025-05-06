// service-worker.js
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
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch handler: network-first for .txt, cache-first for others
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for text files (how-to txt)
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

  // For navigation, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // Default: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

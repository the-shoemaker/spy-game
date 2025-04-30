// service-worker.js
const CACHE_NAME = 'spy-app-v1';
const OFFLINE_PAGE = '/offline.html';
const ASSETS = [
  '/', // falls du deine App unter root hostest
  '/index.html',
  OFFLINE_PAGE,
  '/site.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/css/styles.css',
  '/js/programm.js',
  '/js/langSwitcher.js',
  '/js/topics.js',
  '/js/how-to.js',
  '/js/safari-fix.js',
  '/js/topics-en.js',
  '/datenschutz/index.html',
  '/impressum/index.html',
  '/images/info.svg',
  '/images/logo.svg',
  '/images/background.webp',
  '/images/background.webp',
  '/how-to-de.txt',
  '/how-to-en.txt',
  '/README-EN.html',
  '/README-DE.html',
  '/README.md',
];

// Beim Install die Dateien in den Cache legen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Alten Cache aufräumen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch-Handler: schau zuerst im Cache, sonst lade von Netzwerk
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) return cachedResp;
      return fetch(event.request)
        .then(networkResp => {
          // frische Version cachen
          if (networkResp && networkResp.ok) {
            const clone = networkResp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResp;
        })
        .catch(() => {
          // Fallback offline-Seite für Navigation-Requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE);
          }
        });
    })
  );
});
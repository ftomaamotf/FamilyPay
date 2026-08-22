const CACHE_NAME = 'sandouq-cache-v4-live';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Always fetch directly from network to guarantee latest updates
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

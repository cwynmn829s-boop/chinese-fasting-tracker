const CACHE_NAME = 'fasting-timer-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
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
});

self.addEventListener('fetch', (event) => {
  // Add a cache-busting timestamp to the request if it's the main page
  let request = event.request;
  if (request.mode === 'navigate') {
    const url = new URL(request.url);
    url.searchParams.set('t', Date.now());
    request = new Request(url, {
      mode: 'navigate',
      cache: 'no-store'
    });
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(event.request);
    })
  );
});

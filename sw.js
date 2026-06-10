const CACHE_NAME = 'fasting-v601';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Offline persistence of state is handled via localStorage in main script.
// SW handles asset caching for instant loading and offline access.

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets');
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Network first, then cache for dynamic assets or specific logic if needed
    // But for this SPA, Cache first for UI assets works best
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    // Cache new external resources like Chart.js if not already cached
                    if (event.request.url.includes('cdn.jsdelivr.net')) {
                        cache.put(event.request.url, fetchRes.clone());
                    }
                    return fetchRes;
                });
            });
        }).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});

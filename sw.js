// Bump this version string whenever you deploy an update!
const CACHE_NAME = 'poke-cache-v1.4.3';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './global.js',
    './effects.js',
    './game.js',
    './inventory.js',
    './journey.js',
    './defense.js',
    './survival.js',
    './battle.js'
];

// 1. Install & Cache All Assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force new service worker to activate immediately
});

// 2. Activate, Purge Old Caches & Take Control
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((oldCache) => {
                    if (oldCache !== CACHE_NAME) {
                        console.log(`[ServiceWorker] Purging outdated cache: ${oldCache}`);
                        return caches.delete(oldCache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Take immediate control of all open windows
        })
    );
});

// 3. Stale-While-Revalidate Network Strategy (Fetches fresh files in background)
self.addEventListener('fetch', (e) => {
    // Only cache GET requests (ignore API/external POSTs)
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            const fetchPromise = fetch(e.request).then((networkResponse) => {
                // If valid network response, update the cache in background
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
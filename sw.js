self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('poke-cache-v1.1').then((cache) => cache.addAll([
        './index.html',
        './style.css',
        './game.js'
      ]))
    );
});
  
self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
});

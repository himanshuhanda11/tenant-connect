self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      const legacyKeys = cacheNames.filter((cacheName) => /workbox|vite-pwa|pwa|sw/i.test(cacheName));
      await Promise.all(legacyKeys.map((cacheName) => caches.delete(cacheName)));
    } finally {
      await self.registration.unregister();
    }
  })());
});

self.addEventListener('fetch', () => {
  // no-op
});

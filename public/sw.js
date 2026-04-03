self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => client.navigate(client.url));
  })());
});

self.addEventListener('fetch', () => {
  // Intentionally no-op: network should handle all requests.
});

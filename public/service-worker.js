// Self-destructing service worker: wipes ALL caches and unregisters itself on activate.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map((client) => {
      const url = new URL(client.url);
      url.searchParams.set('sw-cleanup', Date.now().toString());
      if (url.hostname === 'aireatro.com') url.hostname = 'www.aireatro.com';
      return client.navigate(url.toString());
    }));
    await self.registration.unregister();
  })());
});

// Network-first passthrough: never serve cached responses while still active.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('', { status: 504 })));
});

// Duplicate kill switch for clients that previously registered /service-worker.js.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
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
      return client.navigate(url.toString()).catch(() => undefined);
    }));

    await self.registration.unregister();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request.mode === 'navigate'
    ? new Request(event.request, { cache: 'reload' })
    : event.request;
  event.respondWith(fetch(request).catch(() => new Response('', { status: 504 })));
});
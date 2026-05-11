// Aggressive cache-buster: unregister any service workers and wipe ALL Cache Storage on every load.
// Combined with /version.json polling, this guarantees the live site never serves stale UI assets.
(async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch (error) {
    console.warn('[cache-bust] SW unregister skipped:', error);
  }

  try {
    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
    }
  } catch (error) {
    console.warn('[cache-bust] Cache Storage wipe skipped:', error);
  }
})();

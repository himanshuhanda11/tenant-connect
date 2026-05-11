// Aggressive cache-buster: unregister any service workers and wipe ALL Cache Storage on every load.
// If a previous service worker was controlling the page, force one fresh navigation so it cannot
// keep serving an old app shell after a new publish.
(() => {
  const buildId = (() => {
    try {
      return new URL(document.currentScript?.src || window.location.href).searchParams.get('v') || String(Date.now());
    } catch {
      return String(Date.now());
    }
  })();

  const reloadKey = `__aireatro_cache_reset_${buildId}`;
  const freshUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('__fresh', buildId);
    return url.toString();
  };

  (async () => {
    let hadPersistentCache = Boolean(navigator.serviceWorker?.controller);

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      hadPersistentCache = hadPersistentCache || registrations.length > 0;
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch (error) {
    console.warn('[cache-bust] SW unregister skipped:', error);
  }

  try {
    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      hadPersistentCache = hadPersistentCache || cacheKeys.length > 0;
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
    }
  } catch (error) {
    console.warn('[cache-bust] Cache Storage wipe skipped:', error);
  }

    try {
      if (hadPersistentCache && sessionStorage.getItem(reloadKey) !== '1') {
        sessionStorage.setItem(reloadKey, '1');
        window.location.replace(freshUrl());
      }
    } catch {
      if (hadPersistentCache) window.location.replace(freshUrl());
    }
  })();
})();

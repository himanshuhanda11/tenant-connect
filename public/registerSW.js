(async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const alreadyRan = sessionStorage.getItem('legacy-sw-cleanup-ran');
    if (alreadyRan) return;
    sessionStorage.setItem('legacy-sw-cleanup-ran', '1');

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      const legacyKeys = cacheKeys.filter((key) => /workbox|vite-pwa|pwa|sw/i.test(key));
      await Promise.all(legacyKeys.map((key) => window.caches.delete(key)));
    }
  } catch (error) {
    console.warn('Legacy PWA cleanup skipped:', error);
  }
})();

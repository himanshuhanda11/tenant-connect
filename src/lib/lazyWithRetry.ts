import { lazy, ComponentType } from 'react';

const RELOAD_KEY = 'lazy_retry_reload';

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(() =>
    importFn().catch((error) => {
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Loading CSS chunk') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError) {
        const hasReloaded = sessionStorage.getItem(RELOAD_KEY);
        if (!hasReloaded) {
          sessionStorage.setItem(RELOAD_KEY, '1');
          window.location.reload();
          // Return a never-resolving promise to prevent React from rendering an error
          return new Promise<{ default: T }>(() => {});
        }
        sessionStorage.removeItem(RELOAD_KEY);
      }
      throw error;
    })
  );
}

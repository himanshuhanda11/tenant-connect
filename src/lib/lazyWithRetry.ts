import { lazy, ComponentType } from 'react';

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Loading chunk',
  'Loading CSS chunk',
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isChunkError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 2
) {
  return lazy(async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error;

        if (!isChunkError(error) || attempt === retries) {
          throw error;
        }

        await wait(250 * (attempt + 1));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Lazy import failed');
  });
}

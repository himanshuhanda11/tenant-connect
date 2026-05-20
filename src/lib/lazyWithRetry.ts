import { lazy, ComponentType } from 'react';
import { isChunkLoadError, recoverFromChunkLoadError } from './chunkRecovery';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

        if (!isChunkLoadError(error)) {
          throw error;
        }

        if (attempt === retries) {
          await recoverFromChunkLoadError(error, 'lazyWithRetry');
          throw error;
        }

        await wait(250 * (attempt + 1));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Lazy import failed');
  });
}

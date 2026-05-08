import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

// Module-level in-memory cache shared across all admin pages.
// Keeps previously loaded data visible while a fresh fetch happens in background.
type CacheEntry = { data: any; ts: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();
const DEFAULT_TTL = 30_000; // 30s freshness window

async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch(`${ADMIN_FN_URL}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export function adminCacheInvalidate(prefix?: string) {
  if (!prefix) { cache.clear(); return; }
  for (const k of Array.from(cache.keys())) if (k.startsWith(prefix)) cache.delete(k);
}

export function adminCachePeek<T = any>(path: string): T | undefined {
  return cache.get(path)?.data;
}

/**
 * Stale-while-revalidate query for admin endpoints.
 * - Returns cached data instantly when available (no flicker)
 * - Triggers a background refresh; UI shows skeleton ONLY on first uncached load
 */
export function useAdminQuery<T = any>(
  path: string | null,
  opts: { ttl?: number; enabled?: boolean } = {},
) {
  const { ttl = DEFAULT_TTL, enabled = true } = opts;
  const initial = path ? cache.get(path)?.data : undefined;
  const [data, setData] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && !!path && enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const run = useCallback(async (force = false) => {
    if (!path || !enabled) return;
    const cached = cache.get(path);
    const fresh = cached && Date.now() - cached.ts < ttl;
    if (cached) { setData(cached.data); setLoading(false); }
    if (fresh && !force) return;

    setRefreshing(!!cached);
    if (!cached) setLoading(true);
    try {
      let p = inflight.get(path);
      if (!p) {
        p = adminFetch(path).finally(() => inflight.delete(path));
        inflight.set(path, p);
      }
      const json = await p;
      cache.set(path, { data: json, ts: Date.now() });
      if (mounted.current) { setData(json); setError(null); }
    } catch (e: any) {
      if (mounted.current) setError(e.message || 'Failed to load');
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, [path, enabled, ttl]);

  useEffect(() => { run(); }, [run]);

  return { data, loading, refreshing, error, refetch: () => run(true), setData };
}

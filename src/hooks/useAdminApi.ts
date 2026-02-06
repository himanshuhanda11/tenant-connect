import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated — please log in first');

  const url = `${ADMIN_FN_URL}/${path}`;
  console.log(`[Admin API] ${options.method || 'GET'} ${path}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    console.error(`[Admin API] Error ${res.status}:`, json);
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  console.log(`[Admin API] Success:`, path);
  return json;
}

export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (path: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch(path, options);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((path: string) => request(path), [request]);

  const post = useCallback((path: string, body: any) => request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  }), [request]);

  return { get, post, loading, error };
}

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${ADMIN_FN_URL}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
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

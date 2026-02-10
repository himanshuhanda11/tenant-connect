import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get a fresh signed URL for media stored in Supabase Storage.
 * Falls back to the original URL if no bucket/path is available.
 */
export function useMediaUrl(originalUrl?: string, bucket?: string, path?: string) {
  const [freshUrl, setFreshUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const currentUrl = freshUrl || originalUrl || '';

  const refresh = useCallback(async () => {
    if (!bucket || !path) {
      setError(true);
      return null;
    }
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-media-url', {
        body: { bucket, path },
      });
      if (fnError || !data?.url) {
        setError(true);
        setLoading(false);
        return null;
      }
      setFreshUrl(data.url);
      setError(false);
      setLoading(false);
      return data.url as string;
    } catch {
      setError(true);
      setLoading(false);
      return null;
    }
  }, [bucket, path]);

  return { url: currentUrl, refresh, loading, error, hasStoragePath: !!(bucket && path) };
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reads a single `platform_settings` flag. Returns `undefined` while loading
 * and `false` if the flag is missing or the query fails — fail-closed for
 * gating features that depend on the flag being explicitly enabled.
 */
export function usePlatformFlag(key: string): { value: boolean | undefined; loading: boolean } {
  const [value, setValue] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', key)
          .maybeSingle();
        if (cancelled) return;
        setValue((data as any)?.value === true);
      } catch {
        if (!cancelled) setValue(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  return { value, loading };
}

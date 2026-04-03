import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface InboxSidebarCounts {
  unassigned: number;
  open: number;
  follow_up: number;
  resolved: number;
  spam: number;
}

export function useInboxSidebarCounts() {
  const { currentTenant } = useTenant();
  const [counts, setCounts] = useState<InboxSidebarCounts>({
    unassigned: 0,
    open: 0,
    follow_up: 0,
    resolved: 0,
    spam: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase.rpc('inbox_sidebar_counts', {
        p_tenant_id: currentTenant.id,
      });
      if (!error && data) {
        const d = data as unknown as InboxSidebarCounts;
        setCounts(d);
      }
    } catch (err) {
      console.error('Failed to fetch inbox sidebar counts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Listen for inbox updates
  useEffect(() => {
    const handler = () => fetchCounts();
    window.addEventListener('inbox-update', handler);
    return () => window.removeEventListener('inbox-update', handler);
  }, [fetchCounts]);

  return { counts, loading, refetch: fetchCounts };
}
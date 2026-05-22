import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface SavedForm {
  id: string;
  name: string;
  description: string | null;
  status: string;
  active_version_id: string | null;
  updated_at: string;
}

/**
 * Lists builder-mode forms saved in the workspace's form library.
 * Used by CreateFormRuleModal to let users reuse existing forms across rules.
 */
export function useSavedForms() {
  const { currentTenant } = useTenant();
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchForms = useCallback(async () => {
    if (!currentTenant?.id) {
      setForms([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('forms')
        .select('id, name, description, status, active_version_id, updated_at')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .not('active_version_id', 'is', null)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setForms((data as SavedForm[]) || []);
    } catch (err) {
      console.error('Error loading saved forms:', err);
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  return { forms, loading, refetch: fetchForms };
}

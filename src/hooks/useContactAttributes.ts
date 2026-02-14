import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface ContactAttribute {
  key: string;
  value: string | null;
}

export function useContactAttributes(contactId?: string) {
  const { currentTenant } = useTenant();
  const [attributes, setAttributes] = useState<ContactAttribute[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttributes = useCallback(async () => {
    if (!currentTenant?.id || !contactId) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('contact_attributes')
        .select('key, value')
        .eq('tenant_id', currentTenant.id)
        .eq('contact_id', contactId)
        .order('key');
      if (error) throw error;
      setAttributes(data || []);
    } catch (e) {
      console.error('Error fetching attributes:', e);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, contactId]);

  useEffect(() => {
    if (contactId) fetchAttributes();
  }, [contactId, fetchAttributes]);

  const setAttribute = async (key: string, value: string) => {
    if (!currentTenant?.id || !contactId) return;
    try {
      const { error } = await (supabase as any)
        .from('contact_attributes')
        .upsert({
          tenant_id: currentTenant.id,
          contact_id: contactId,
          key,
          value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id,contact_id,key' });
      if (error) throw error;
      fetchAttributes();
    } catch (e) {
      console.error('Error setting attribute:', e);
    }
  };

  const removeAttribute = async (key: string) => {
    if (!currentTenant?.id || !contactId) return;
    try {
      const { error } = await (supabase as any)
        .from('contact_attributes')
        .delete()
        .eq('tenant_id', currentTenant.id)
        .eq('contact_id', contactId)
        .eq('key', key);
      if (error) throw error;
      fetchAttributes();
    } catch (e) {
      console.error('Error removing attribute:', e);
    }
  };

  return { attributes, loading, setAttribute, removeAttribute, refetch: fetchAttributes };
}

/** Fetches distinct attribute keys used in the workspace for filter dropdowns */
export function useAttributeKeys() {
  const { currentTenant } = useTenant();
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!currentTenant?.id) return;
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('contact_attributes')
          .select('key')
          .eq('tenant_id', currentTenant.id);
        const allKeys: string[] = (data || []).map((d: { key: string }) => d.key);
        const dedupedKeys: string[] = [];
        const seen = new Set<string>();
        for (const k of allKeys) {
          if (!seen.has(k)) { seen.add(k); dedupedKeys.push(k); }
        }
        dedupedKeys.sort();
        setKeys(dedupedKeys);
      } catch (e) {
        console.error('Error fetching attribute keys:', e);
      }
    })();
  }, [currentTenant?.id]);

  return keys;
}

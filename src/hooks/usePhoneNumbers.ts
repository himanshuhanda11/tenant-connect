import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { 
  PhoneNumber, 
  WABA, 
  WebhookDeliveryLog, 
  QualityHistory,
  MOCK_PHONE_NUMBERS,
  MOCK_WABAS
} from '@/types/phoneNumber';

// Legacy type alias for backward compatibility
export interface PhoneNumberOption {
  id: string;
  display_number: string;
  phone_number_id: string;
  verified_name?: string;
  status: string;
}

// Main hook for phone numbers
export function usePhoneNumbers() {
  const { currentTenant } = useTenant();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);

  const fetchPhoneNumbers = useCallback(async () => {
    if (!currentTenant) {
      setPhoneNumbers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch phone numbers with joined WABA data
      const { data, error } = await (supabase as any)
        .from('phone_numbers')
        .select('*, waba_accounts!waba_account_id(id, waba_id, name, business_name, status)')
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      // Helper to map quality rating from DB (uppercase) to frontend (lowercase)
      const mapQualityRating = (rating?: string): 'green' | 'yellow' | 'red' | 'unknown' => {
        if (!rating) return 'unknown';
        const r = rating.toLowerCase();
        if (r === 'green' || r === 'yellow' || r === 'red') return r;
        return 'unknown';
      };

      // Helper to map messaging limit from DB to frontend
      const mapMessagingLimit = (limit?: string): 'tier_1k' | 'tier_10k' | 'tier_100k' | 'tier_unlimited' | 'unknown' => {
        if (!limit) return 'unknown';
        const l = limit.toLowerCase();
        if (l.includes('1k') && !l.includes('10k') && !l.includes('100k')) return 'tier_1k';
        if (l.includes('10k') && !l.includes('100k')) return 'tier_10k';
        if (l.includes('100k')) return 'tier_100k';
        if (l.includes('unlimited')) return 'tier_unlimited';
        return 'unknown';
      };

      // Helper to map webhook health
      const mapWebhookHealth = (health?: string): 'healthy' | 'degraded' | 'down' | 'unknown' => {
        if (!health) return 'unknown';
        const h = health.toLowerCase();
        if (h === 'healthy' || h === 'degraded' || h === 'down') return h;
        return 'unknown';
      };

      // Map database fields to PhoneNumber type
      const mappedNumbers: PhoneNumber[] = (data || []).map((n: any) => ({
        id: n.id,
        tenant_id: n.tenant_id,
        waba_uuid: n.waba_account_id,
        waba_id: n.waba_accounts?.waba_id || null,
        phone_number_id: n.phone_number_id,
        display_name: n.display_number || n.verified_name,
        phone_e164: n.display_number || '',
        verified_name: n.verified_name,
        certificate: n.certificate,
        status: (n.status || 'pending').toLowerCase() as any,
        quality_rating: mapQualityRating(n.quality_rating),
        messaging_limit: mapMessagingLimit(n.messaging_limit),
        default_team_id: n.default_team_id,
        default_assignment_strategy: n.default_assignment_strategy || 'round_robin',
        only_online: n.only_online || false,
        max_open_conversations_per_agent: n.max_open_conversations_per_agent,
        enforce_opt_in: n.enforce_opt_in ?? true,
        block_marketing_without_optin: n.block_marketing_without_optin ?? true,
        quiet_hours: n.quiet_hours,
        business_hours: n.business_hours,
        webhook_health: mapWebhookHealth(n.webhook_health),
        last_webhook_at: n.last_webhook_at,
        last_message_at: n.last_message_at,
        raw: n.raw || {},
        last_error: n.last_error,
        is_default: n.is_default || false,
        created_at: n.created_at,
        updated_at: n.updated_at,
      }));

      setPhoneNumbers(mappedNumbers);

      // Auto-select first phone number if none selected
      if (mappedNumbers.length > 0 && !selectedPhoneId) {
        setSelectedPhoneId(mappedNumbers[0].id);
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      setPhoneNumbers([]);
    } finally {
      setLoading(false);
    }
  }, [currentTenant, selectedPhoneId]);

  useEffect(() => {
    fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  const addPhoneNumber = async (data: Partial<PhoneNumber>) => {
    if (!currentTenant) {
      // Mock add for demo
      const newNumber: PhoneNumber = {
        id: `pn-${Date.now()}`,
        tenant_id: '1',
        phone_number_id: data.phone_number_id || '',
        phone_e164: data.phone_e164 || '',
        display_name: data.display_name,
        waba_id: data.waba_id,
        status: 'pending',
        quality_rating: 'unknown',
        messaging_limit: 'unknown',
        default_assignment_strategy: 'round_robin',
        only_online: false,
        enforce_opt_in: true,
        block_marketing_without_optin: true,
        webhook_health: 'unknown',
        raw: {},
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPhoneNumbers(prev => [...prev, newNumber]);
      toast.success('Phone number added');
      return newNumber;
    }

    try {
      // Check if phone number already exists for this tenant
      const { data: existing } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('phone_number_id', data.phone_number_id || '')
        .maybeSingle();

      if (existing) {
        // Update existing record
        const statusVal = (['pending', 'connected', 'disconnected', 'banned'].includes(data.status || '')
          ? data.status
          : existing.status) as 'pending' | 'connected' | 'disconnected' | 'banned';
        const { data: updated, error: updateError } = await supabase
          .from('phone_numbers')
          .update({
            display_number: data.phone_e164 || existing.display_number,
            verified_name: data.display_name || existing.verified_name,
            waba_account_id: data.waba_id || existing.waba_account_id,
            status: statusVal,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        toast.success('Phone number updated');
        await fetchPhoneNumbers();
        return updated;
      }

      const insertStatus = (['pending', 'connected', 'disconnected', 'banned'].includes(data.status || '')
        ? data.status
        : 'pending') as 'pending' | 'connected' | 'disconnected' | 'banned';
      const { data: result, error } = await supabase
        .from('phone_numbers')
        .insert({
          tenant_id: currentTenant.id,
          phone_number_id: data.phone_number_id || '',
          display_number: data.phone_e164 || '',
          verified_name: data.display_name,
          waba_account_id: data.waba_id || '',
          status: insertStatus,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Phone number added');
      await fetchPhoneNumbers();
      return result;
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast.error('Failed to add phone number');
      throw error;
    }
  };

  const updatePhoneNumber = async (id: string, updates: Partial<PhoneNumber>) => {
    // Update local state first (optimistic update)
    setPhoneNumbers(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
    ));

    if (!currentTenant) {
      toast.success('Settings updated');
      return;
    }

    try {
      // Map our type to database columns
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.display_name !== undefined) dbUpdates.verified_name = updates.display_name;
      if (updates.phone_e164 !== undefined) dbUpdates.display_number = updates.phone_e164;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { error } = await supabase
        .from('phone_numbers')
        .update(dbUpdates)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast.error('Failed to update settings');
      // Revert optimistic update
      await fetchPhoneNumbers();
    }
  };

  const setDefaultNumber = async (id: string) => {
    // Optimistic update
    setPhoneNumbers(prev => prev.map(n => ({
      ...n,
      is_default: n.id === id,
    })));

    if (!currentTenant) {
      toast.success('Default number updated');
      return;
    }

    try {
      // Use RPC function if available
      const { error } = await supabase.rpc('set_default_phone_number', {
        p_tenant_id: currentTenant.id,
        p_number_id: id,
      });

      if (error) {
        console.warn('RPC not available, using fallback:', error);
      }

      toast.success('Default number updated');
    } catch (error) {
      console.error('Error setting default number:', error);
      toast.error('Failed to set default number');
      await fetchPhoneNumbers();
    }
  };

  const disconnectNumber = async (id: string) => {
    if (!currentTenant) {
      setPhoneNumbers(prev => prev.map(n => 
        n.id === id ? { ...n, status: 'disconnected' as const } : n
      ));
      toast.success('Number disconnected');
      return;
    }

    try {
      const { error } = await supabase
        .from('phone_numbers')
        .update({ status: 'disconnected' })
        .eq('id', id)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;
      toast.success('Number disconnected');
      await fetchPhoneNumbers();
    } catch (error) {
      console.error('Error disconnecting number:', error);
      toast.error('Failed to disconnect number');
    }
  };

  // Convert to legacy format for backward compatibility
  const legacyPhoneNumbers: PhoneNumberOption[] = phoneNumbers.map(n => ({
    id: n.id,
    display_number: n.phone_e164 || n.display_name || '',
    phone_number_id: n.phone_number_id,
    verified_name: n.verified_name,
    status: n.status,
  }));

  return {
    phoneNumbers,
    // Also expose as legacy format for components still using old interface
    phoneNumberOptions: legacyPhoneNumbers,
    loading,
    selectedPhoneId,
    setSelectedPhoneId,
    refetch: fetchPhoneNumbers,
    addPhoneNumber,
    updatePhoneNumber,
    setDefaultNumber,
    disconnectNumber,
  };
}

// Hook for WABAs
export function useWABAs() {
  const { currentTenant } = useTenant();
  const [wabas, setWabas] = useState<WABA[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWabas = useCallback(async () => {
    if (!currentTenant) {
      setWabas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waba_accounts')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      const mappedWabas: WABA[] = (data || []).map((w: any) => ({
        id: w.id,
        tenant_id: w.tenant_id,
        waba_id: w.waba_id,
        name: w.name,
        business_id: w.business_id,
        business_name: w.business_name,
        is_default: w.is_default || false,
        created_at: w.created_at,
        updated_at: w.updated_at,
      }));

      setWabas(mappedWabas);
    } catch (error) {
      console.error('Error fetching WABAs:', error);
      setWabas([]);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  useEffect(() => {
    fetchWabas();
  }, [fetchWabas]);

  const addWaba = async (data: { waba_id: string; name?: string }) => {
    if (!currentTenant) {
      const newWaba: WABA = {
        id: `w-${Date.now()}`,
        tenant_id: '1',
        waba_id: data.waba_id,
        name: data.name,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setWabas(prev => [...prev, newWaba]);
      return newWaba;
    }

    try {
      // First check if WABA already exists for this tenant
      const { data: existing } = await supabase
        .from('waba_accounts')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('waba_id', data.waba_id)
        .maybeSingle();

      if (existing) {
        // Already exists, return it
        return existing;
      }

      // Insert new WABA
      const { data: result, error } = await supabase
        .from('waba_accounts')
        .insert({
          tenant_id: currentTenant.id,
          waba_id: data.waba_id,
          name: data.name,
          business_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchWabas();
      return result;
    } catch (error) {
      console.error('Error adding WABA:', error);
      throw error;
    }
  };

  return {
    wabas,
    loading,
    refetch: fetchWabas,
    addWaba,
  };
}

// Hook for webhook logs
export function useWebhookLogs(phoneNumberId?: string) {
  const { currentTenant } = useTenant();
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phoneNumberId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      // Mock logs for demo
      setLogs([
        {
          id: 'log1',
          tenant_id: '1',
          phone_number_id: phoneNumberId,
          direction: 'inbound',
          status_code: 200,
          success: true,
          received_at: new Date(Date.now() - 60000).toISOString(),
          processed_at: new Date(Date.now() - 59500).toISOString(),
          latency_ms: 245,
          event_type: 'messages',
          raw: {},
        },
        {
          id: 'log2',
          tenant_id: '1',
          phone_number_id: phoneNumberId,
          direction: 'inbound',
          status_code: 200,
          success: true,
          received_at: new Date(Date.now() - 120000).toISOString(),
          processed_at: new Date(Date.now() - 119800).toISOString(),
          latency_ms: 189,
          event_type: 'statuses',
          raw: {},
        },
      ]);
      setLoading(false);
    };

    fetchLogs();
  }, [currentTenant, phoneNumberId]);

  return { logs, loading };
}

// Hook for quality history
export function useQualityHistory(phoneNumberUuid?: string) {
  const { currentTenant } = useTenant();
  const [history, setHistory] = useState<QualityHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phoneNumberUuid) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      // Mock history for demo
      setHistory([
        {
          id: 'qh1',
          tenant_id: '1',
          phone_number_uuid: phoneNumberUuid,
          quality_rating: 'green',
          messaging_limit: 'tier_100k',
          reason: 'Consistent high delivery rates',
          recorded_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'qh2',
          tenant_id: '1',
          phone_number_uuid: phoneNumberUuid,
          quality_rating: 'yellow',
          messaging_limit: 'tier_10k',
          reason: 'Some user reports',
          recorded_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ]);
      setLoading(false);
    };

    fetchHistory();
  }, [currentTenant, phoneNumberUuid]);

  return { history, loading };
}

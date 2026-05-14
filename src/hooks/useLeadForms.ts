import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface LeadForm {
  id: string;
  tenant_id: string;
  page_id: string;
  page_name: string | null;
  form_id: string;
  form_name: string | null;
  status: string;
  is_webhook_subscribed: boolean;
  last_sync_at: string | null;
  last_lead_at: string | null;
  lead_count: number;
  created_at: string;
}

export interface LeadFormRule {
  id: string;
  tenant_id: string;
  name: string;
  trigger_type: string;
  page_id: string;
  form_id: string;
  phone_number_id: string | null;
  reply_mode: string;
  template_id: string | null;
  field_mapping: Record<string, string>;
  flow_id: string | null;
  flow_trigger_keyword: string | null;
  assignment_mode: string;
  assign_to_user_id: string | null;
  assign_to_team_id: string | null;
  junk_filter_enabled: boolean;
  enabled: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
}

export interface LeadEvent {
  id: string;
  tenant_id: string | null;
  form_id: string | null;
  lead_id: string | null;
  page_id: string | null;
  ad_id: string | null;
  raw_payload: any;
  normalized_data: any;
  status: string;
  error_text: string | null;
  rule_id: string | null;
  conversation_id: string | null;
  contact_id: string | null;
  processing_duration_ms: number | null;
  created_at: string;
}

export interface WebhookSubscription {
  id: string;
  tenant_id: string;
  page_id: string;
  page_name: string | null;
  is_subscribed: boolean;
  last_event_at: string | null;
  event_count_24h: number;
  failure_count_24h: number;
  last_error: string | null;
  subscribed_at: string | null;
}

/** Returns the Facebook Page id selected during the Meta Ads connection (the only page we should show data for). */
export function useConnectedPageId() {
  const { currentTenant } = useTenant();
  const [pageId, setPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!currentTenant?.id) { setPageId(null); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('smeksh_meta_ad_accounts')
      .select('facebook_page_id, status, is_active, updated_at')
      .eq('workspace_id', currentTenant.id)
      .eq('status', 'connected')
      .eq('is_active', true)
      .not('facebook_page_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (cancelled) return;
        const row = Array.isArray(data) ? data[0] : null;
        setPageId((row?.facebook_page_id as string) || null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentTenant?.id, tick]);

  // React to connect/disconnect actions from anywhere in the app
  useEffect(() => {
    if (!currentTenant?.id) return;
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('meta-account-changed', bump);
    const channel = supabase
      .channel(`meta-acc-${currentTenant.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'smeksh_meta_ad_accounts', filter: `workspace_id=eq.${currentTenant.id}` },
        bump)
      .subscribe();
    return () => {
      window.removeEventListener('meta-account-changed', bump);
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id]);

  return { pageId, loading };
}

export function useLeadForms() {
  const { currentTenant } = useTenant();
  const { pageId: connectedPageId, loading: pageLoading } = useConnectedPageId();
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const capturePermissionError = useCallback((message?: string | null) => {
    if (!message) return false;
    if (message.includes('leads_retrieval') || message.includes('missing_leads_retrieval')) {
      setPermissionError(message);
      return true;
    }
    return false;
  }, []);

  const fetchForms = useCallback(async () => {
    if (!currentTenant) return;
    if (pageLoading) return;
    if (!connectedPageId) { setForms([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('meta_lead_forms')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .eq('page_id', connectedPageId)
      .order('created_at', { ascending: false });

    if (!error && data) setForms(data as any);
    setLoading(false);
  }, [currentTenant, connectedPageId, pageLoading]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const syncForms = useCallback(async () => {
    if (!currentTenant) return;
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'sync_forms' },
      });
      if (error) throw error;

      const formsCount = data?.forms?.length || 0;
      const syncErrors = Array.isArray(data?.errors) ? data.errors : [];
      const leadPermissionError = syncErrors.find((item: any) => capturePermissionError(item?.error))?.error;

      if (formsCount > 0) {
        if (leadPermissionError) {
          toast.error(leadPermissionError, { duration: 8000 });
        } else {
          toast.success(`Synced ${formsCount} lead form${formsCount === 1 ? '' : 's'}`);
          setPermissionError(null);
        }
      } else if (syncErrors.length > 0) {
        const firstError = syncErrors[0]?.error || 'Meta could not return lead forms';
        capturePermissionError(firstError);
        // Show longer permission errors as a warning with more context
        if (firstError.includes('pages_manage_ads') || firstError.includes('permission') || firstError.includes('(#200)')) {
          toast.error(firstError, { duration: 8000 });
        } else {
          toast.error(firstError);
        }
      } else {
        toast.error(data?.message || 'No lead forms found for the connected Meta pages');
      }

      await fetchForms();
      return data;
    } catch (err: any) {
      const message = err?.context?.error || err?.message || 'Unknown error';
      capturePermissionError(message);
      toast.error('Failed to sync forms: ' + message);
    }
  }, [currentTenant, fetchForms, capturePermissionError]);

  const subscribeWebhook = useCallback(async (pageId: string) => {
    if (!currentTenant) return;
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'subscribe_webhook', pageId },
      });
      if (error) throw error;
      if (data?.success) {
        setPermissionError(null);
        toast.success('Webhook subscribed successfully');
        await fetchForms();
      } else {
        const message = data?.error || 'Subscription failed';
        capturePermissionError(message);
        toast.error(message);
      }
    } catch (err: any) {
      const message = err?.context?.error || err?.message || 'Unknown error';
      capturePermissionError(message);
      toast.error(message.includes('leads_retrieval') ? message : `Failed to subscribe webhook: ${message}`, { duration: 8000 });
    }
  }, [currentTenant, fetchForms, capturePermissionError]);

  const testWebhook = useCallback(async (pageId?: string) => {
    if (!currentTenant) return;
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'test_webhook', pageId },
      });
      if (error) throw error;
      toast.success('Test webhook event created');
    } catch (err: any) {
      toast.error('Test failed: ' + (err.message || 'Unknown error'));
    }
  }, [currentTenant]);

  return { forms, loading, syncForms, subscribeWebhook, testWebhook, permissionError, clearPermissionError: () => setPermissionError(null), refetch: fetchForms };
}

export function useLeadFormRules() {
  const { currentTenant } = useTenant();
  const [rules, setRules] = useState<LeadFormRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('lead_form_rules')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setRules(data as any);
    setLoading(false);
  }, [currentTenant]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const createRule = useCallback(async (rule: Partial<LeadFormRule>) => {
    if (!currentTenant) return;
    const { data, error } = await supabase
      .from('lead_form_rules')
      .insert({ ...rule, tenant_id: currentTenant.id } as any)
      .select()
      .single();
    
    if (error) { toast.error('Failed to create rule'); return null; }
    toast.success('Automation rule created');
    await fetchRules();
    return data;
  }, [currentTenant, fetchRules]);

  const updateRule = useCallback(async (id: string, updates: Partial<LeadFormRule>) => {
    const { error } = await supabase
      .from('lead_form_rules')
      .update(updates as any)
      .eq('id', id);
    
    if (error) { toast.error('Failed to update rule'); return; }
    toast.success('Rule updated');
    await fetchRules();
  }, [fetchRules]);

  const deleteRule = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('lead_form_rules')
      .delete()
      .eq('id', id);
    
    if (error) { toast.error('Failed to delete rule'); return; }
    toast.success('Rule deleted');
    await fetchRules();
  }, [fetchRules]);

  const toggleRule = useCallback(async (id: string, enabled: boolean) => {
    await updateRule(id, { enabled } as any);
  }, [updateRule]);

  return { rules, loading, createRule, updateRule, deleteRule, toggleRule, refetch: fetchRules };
}

export function useLeadEvents() {
  const { currentTenant } = useTenant();
  const { pageId: connectedPageId, loading: pageLoading } = useConnectedPageId();
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async (limit = 100) => {
    if (!currentTenant) return;
    if (pageLoading) return;
    if (!connectedPageId) { setEvents([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('lead_events')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .eq('page_id', connectedPageId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) setEvents(data as any);
    setLoading(false);
  }, [currentTenant, connectedPageId, pageLoading]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
}

export function useWebhookHealth() {
  const { currentTenant } = useTenant();
  const { pageId: connectedPageId, loading: pageLoading } = useConnectedPageId();
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    if (!currentTenant) return;
    if (pageLoading) return;
    if (!connectedPageId) { setSubscriptions([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('meta_webhook_subscriptions')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .eq('page_id', connectedPageId);

    if (!error && data) setSubscriptions(data as any);
    setLoading(false);
  }, [currentTenant, connectedPageId, pageLoading]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  return { subscriptions, loading, refetch: fetchHealth };
}


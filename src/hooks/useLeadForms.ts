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

export function useLeadForms() {
  const { currentTenant } = useTenant();
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('meta_lead_forms')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setForms(data as any);
    setLoading(false);
  }, [currentTenant]);

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

      if (formsCount > 0) {
        toast.success(`Synced ${formsCount} lead form${formsCount === 1 ? '' : 's'}`);
      } else if (syncErrors.length > 0) {
        const firstError = syncErrors[0]?.error || 'Meta could not return lead forms';
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
      toast.error('Failed to sync forms: ' + (err.message || 'Unknown error'));
    }
  }, [currentTenant, fetchForms]);

  const subscribeWebhook = useCallback(async (pageId: string) => {
    if (!currentTenant) return;
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'subscribe_webhook', pageId },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success('Webhook subscribed successfully');
        await fetchForms();
      } else {
        toast.error(data?.error || 'Subscription failed');
      }
    } catch (err: any) {
      toast.error('Failed to subscribe webhook: ' + (err.message || 'Unknown error'));
    }
  }, [currentTenant, fetchForms]);

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

  return { forms, loading, syncForms, subscribeWebhook, testWebhook, refetch: fetchForms };
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
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async (limit = 100) => {
    if (!currentTenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('lead_events')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (!error && data) setEvents(data as any);
    setLoading(false);
  }, [currentTenant]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
}

export function useWebhookHealth() {
  const { currentTenant } = useTenant();
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('meta_webhook_subscriptions')
      .select('*')
      .eq('tenant_id', currentTenant.id);
    
    if (!error && data) setSubscriptions(data as any);
    setLoading(false);
  }, [currentTenant]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  return { subscriptions, loading, refetch: fetchHealth };
}

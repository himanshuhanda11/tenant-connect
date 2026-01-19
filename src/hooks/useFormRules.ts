import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import type { FormRule, FormRuleLog, FormRuleTriggerType } from '@/types/formRule';

export function useFormRules() {
  const { currentTenant } = useTenant();
  const [rules, setRules] = useState<FormRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('form_rules')
        .select(`
          *,
          form:templates(id, name, category, status),
          creator:profiles(id, full_name, email)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setRules(data || []);
    } catch (err: any) {
      console.error('Error fetching form rules:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (ruleData: Partial<FormRule>): Promise<FormRule | null> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return null;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await (supabase as any)
        .from('form_rules')
        .insert({
          tenant_id: currentTenant.id,
          name: ruleData.name,
          description: ruleData.description,
          form_id: ruleData.form_id,
          form_template_name: ruleData.form_template_name,
          form_language: ruleData.form_language || 'en',
          form_variables: ruleData.form_variables || {},
          trigger_type: ruleData.trigger_type,
          trigger_config: ruleData.trigger_config || {},
          conditions: ruleData.conditions || [],
          cooldown_minutes: ruleData.cooldown_minutes ?? 60,
          max_sends_per_contact_per_day: ruleData.max_sends_per_contact_per_day ?? 1,
          require_opt_in: ruleData.require_opt_in ?? true,
          business_hours_only: ruleData.business_hours_only ?? false,
          priority: ruleData.priority ?? 0,
          is_active: ruleData.is_active ?? true,
          created_by: userData?.user?.id,
        })
        .select(`
          *,
          form:templates(id, name, category, status),
          creator:profiles(id, full_name, email)
        `)
        .single();

      if (error) throw error;
      
      setRules(prev => [data, ...prev]);
      toast.success('Form rule created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating form rule:', err);
      toast.error(err.message || 'Failed to create form rule');
      return null;
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<FormRule>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('form_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ruleId)
        .eq('tenant_id', currentTenant?.id);

      if (error) throw error;
      
      setRules(prev => prev.map(r => 
        r.id === ruleId ? { ...r, ...updates } : r
      ));
      toast.success('Form rule updated');
      return true;
    } catch (err: any) {
      console.error('Error updating form rule:', err);
      toast.error(err.message || 'Failed to update form rule');
      return false;
    }
  };

  const deleteRule = async (ruleId: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('form_rules')
        .delete()
        .eq('id', ruleId)
        .eq('tenant_id', currentTenant?.id);

      if (error) throw error;
      
      setRules(prev => prev.filter(r => r.id !== ruleId));
      toast.success('Form rule deleted');
      return true;
    } catch (err: any) {
      console.error('Error deleting form rule:', err);
      toast.error(err.message || 'Failed to delete form rule');
      return false;
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean): Promise<boolean> => {
    return updateRule(ruleId, { is_active: isActive });
  };

  const duplicateRule = async (ruleId: string): Promise<FormRule | null> => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) {
      toast.error('Rule not found');
      return null;
    }

    return createRule({
      name: `${rule.name} (Copy)`,
      description: rule.description,
      form_id: rule.form_id,
      form_template_name: rule.form_template_name,
      form_language: rule.form_language,
      form_variables: rule.form_variables,
      trigger_type: rule.trigger_type,
      trigger_config: rule.trigger_config,
      conditions: rule.conditions,
      cooldown_minutes: rule.cooldown_minutes,
      max_sends_per_contact_per_day: rule.max_sends_per_contact_per_day,
      require_opt_in: rule.require_opt_in,
      business_hours_only: rule.business_hours_only,
      priority: rule.priority,
      is_active: false,
    });
  };

  return {
    rules,
    loading,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    duplicateRule,
  };
}

export function useFormRuleLogs(ruleId?: string) {
  const { currentTenant } = useTenant();
  const [logs, setLogs] = useState<FormRuleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
  });

  const fetchLogs = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    
    try {
      let query = (supabase as any)
        .from('form_rule_logs')
        .select(`
          *,
          rule:form_rules(id, name),
          contact:contacts(id, name, wa_id)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (ruleId) {
        query = query.eq('rule_id', ruleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setLogs(data || []);
      
      // Calculate stats
      const newStats = {
        total: data?.length || 0,
        sent: data?.filter((l: FormRuleLog) => l.status === 'sent').length || 0,
        delivered: data?.filter((l: FormRuleLog) => l.status === 'delivered').length || 0,
        failed: data?.filter((l: FormRuleLog) => l.status === 'failed').length || 0,
        skipped: data?.filter((l: FormRuleLog) => l.status === 'skipped').length || 0,
      };
      setStats(newStats);
    } catch (err: any) {
      console.error('Error fetching form rule logs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, ruleId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    stats,
    fetchLogs,
  };
}

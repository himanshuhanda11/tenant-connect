import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface CartRecoveryRule {
  id: string;
  tenant_id: string;
  store_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>[];
  delay_minutes: number;
  max_attempts: number;
  discount_type: string | null;
  discount_value: number;
  discount_code: string | null;
  min_cart_value: number;
  priority: number;
  stats_triggered: number;
  stats_recovered: number;
  stats_revenue_recovered: number;
  created_at: string;
  updated_at: string;
}

export interface CartRecoveryLog {
  id: string;
  tenant_id: string;
  store_id: string;
  rule_id: string | null;
  checkout_id: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  cart_value: number | null;
  action_taken: string;
  channel: string | null;
  status: string;
  discount_code_used: string | null;
  recovered_value: number | null;
  created_at: string;
}

export function useCartRecoveryRules(storeId: string | undefined) {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['cart-recovery-rules', storeId, currentTenant?.id],
    queryFn: async () => {
      if (!storeId || !currentTenant) return [];
      const { data, error } = await (supabase as any)
        .from('shopify_cart_recovery_rules')
        .select('*')
        .eq('store_id', storeId)
        .eq('tenant_id', currentTenant.id)
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data || []) as CartRecoveryRule[];
    },
    enabled: !!storeId && !!currentTenant,
  });

  const logsQuery = useQuery({
    queryKey: ['cart-recovery-logs', storeId, currentTenant?.id],
    queryFn: async () => {
      if (!storeId || !currentTenant) return [];
      const { data, error } = await (supabase as any)
        .from('shopify_cart_recovery_logs')
        .select('*')
        .eq('store_id', storeId)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as CartRecoveryLog[];
    },
    enabled: !!storeId && !!currentTenant,
  });

  const createRule = useMutation({
    mutationFn: async (rule: Partial<CartRecoveryRule>) => {
      if (!currentTenant || !storeId) throw new Error('Missing context');
      const { data, error } = await (supabase as any)
        .from('shopify_cart_recovery_rules')
        .insert({ ...rule, tenant_id: currentTenant.id, store_id: storeId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-recovery-rules'] });
      toast.success('Recovery rule created');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from('shopify_cart_recovery_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-recovery-rules'] });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('shopify_cart_recovery_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-recovery-rules'] });
      toast.success('Rule deleted');
    },
  });

  // Summary stats
  const stats = {
    totalRules: rulesQuery.data?.length || 0,
    activeRules: rulesQuery.data?.filter(r => r.is_active).length || 0,
    totalTriggered: rulesQuery.data?.reduce((s, r) => s + r.stats_triggered, 0) || 0,
    totalRecovered: rulesQuery.data?.reduce((s, r) => s + r.stats_recovered, 0) || 0,
    revenueRecovered: rulesQuery.data?.reduce((s, r) => s + r.stats_revenue_recovered, 0) || 0,
    recentLogs: logsQuery.data || [],
    pendingRecoveries: logsQuery.data?.filter(l => l.status === 'pending' || l.status === 'sent').length || 0,
    recoveredLogs: logsQuery.data?.filter(l => l.status === 'recovered').length || 0,
  };

  return {
    rules: rulesQuery.data || [],
    logs: logsQuery.data || [],
    stats,
    isLoading: rulesQuery.isLoading,
    isLogsLoading: logsQuery.isLoading,
    createRule,
    toggleRule,
    deleteRule,
  };
}

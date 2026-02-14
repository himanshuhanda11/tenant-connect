import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface MessageCredits {
  id: string;
  tenant_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  tenant_id: string;
  amount: number;
  balance_after: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
}

export function useMessageCredits() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ['message-credits', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('message_credits')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      if (error) throw error;
      return data as MessageCredits | null;
    },
    enabled: !!currentTenant?.id,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['credit-transactions', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as CreditTransaction[];
    },
    enabled: !!currentTenant?.id,
  });

  const balance = credits?.balance ?? 0;
  const totalPurchased = credits?.total_purchased ?? 0;
  const totalUsed = credits?.total_used ?? 0;
  const hasCredits = balance > 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['message-credits', currentTenant?.id] });
    queryClient.invalidateQueries({ queryKey: ['credit-transactions', currentTenant?.id] });
  };

  return {
    credits,
    balance,
    totalPurchased,
    totalUsed,
    hasCredits,
    isLoading,
    transactions,
    transactionsLoading,
    invalidate,
  };
}

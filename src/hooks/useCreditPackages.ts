import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface CreditTopupPackage {
  id: string;
  package_name: string;
  credits: number;
  price: number;
  currency: string;
  region: 'IN' | 'GULF' | 'OTHER';
  stripe_price_id: string | null;
  recommended: boolean;
  best_value: boolean;
  sort_order: number;
  active: boolean;
}

export function useCreditPackages() {
  const { currentTenant } = useTenant();

  // Resolve workspace pricing_region (lives on tenants table, not in TenantWithRole)
  const { data: region } = useQuery({
    queryKey: ['tenant-region', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return 'OTHER' as const;
      const { data } = await supabase
        .from('tenants')
        .select('pricing_region')
        .eq('id', currentTenant.id)
        .maybeSingle();
      return ((data?.pricing_region as 'IN' | 'GULF' | 'OTHER') || 'OTHER');
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['credit-packages', region],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_topup_packages')
        .select('*')
        .eq('active', true)
        .eq('region', region || 'OTHER')
        .order('sort_order');
      if (error) throw error;
      return (data || []) as CreditTopupPackage[];
    },
    enabled: !!region,
  });

  return { packages: packages || [], region: region || 'OTHER', isLoading };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

/** Team-page names for agents (falls back to the profile name where none is set). */
export function useAgentDisplayNames() {
  const { currentTenant } = useTenant();
  const { data } = useQuery({
    queryKey: ['agent-display-names', currentTenant?.id],
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('user_id, display_name')
        .eq('tenant_id', currentTenant!.id);
      if (error) return new Map<string, string>();
      const map = new Map<string, string>();
      for (const a of data ?? []) if (a.user_id && a.display_name) map.set(a.user_id, a.display_name);
      return map;
    },
  });
  return (userId?: string | null, fallback?: string | null) =>
    (userId && data?.get(userId)) || fallback || null;
}

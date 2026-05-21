import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface QrCampaign {
  id: string;
  tenant_id: string;
  user_id: string;
  campaign_name: string;
  slug: string;
  whatsapp_number: string;
  prefilled_message: string;
  cta_text: string | null;
  qr_link: string;
  qr_design_config: any;
  qr_image_url: string | null;
  scan_count: number;
  lead_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useQrCampaigns() {
  const { currentTenant } = useTenant();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['qr-campaigns', currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_campaigns' as any)
        .select('*')
        .eq('tenant_id', currentTenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as QrCampaign[];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<QrCampaign>) => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('qr_campaigns' as any)
        .insert({
          tenant_id: currentTenant!.id,
          user_id: u.user!.id,
          ...payload,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as QrCampaign;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qr-campaigns'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<QrCampaign> & { id: string }) => {
      const { error } = await supabase.from('qr_campaigns' as any).update(patch as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qr-campaigns'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('qr_campaigns' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qr-campaigns'] }),
  });

  return { list, create, update, remove };
}

export function useQrAnalytics(campaignId?: string) {
  const { currentTenant } = useTenant();
  return useQuery({
    queryKey: ['qr-analytics', currentTenant?.id, campaignId],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      let q = supabase
        .from('qr_scan_events' as any)
        .select('*')
        .eq('tenant_id', currentTenant!.id)
        .order('created_at', { ascending: false })
        .limit(500);
      if (campaignId) q = q.eq('qr_campaign_id', campaignId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

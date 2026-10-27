import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface WhatsAppAdSource {
  id: string;
  ad_id: string;
  display_name: string | null;
  headline: string | null;
  body: string | null;
  source_url: string | null;
  image_url: string | null;
  clicks_count: number;
  leads_count: number;
  first_seen_at: string;
  last_seen_at: string;
  last_lead_at: string | null;
}

const COLUMNS = 'id, ad_id, display_name, headline, body, source_url, image_url, clicks_count, leads_count, first_seen_at, last_seen_at, last_lead_at';

/** Short, human label for an ad that sent people to WhatsApp. */
export function adSourceLabel(ad: Pick<WhatsAppAdSource, 'display_name' | 'headline' | 'ad_id'>) {
  if (ad.display_name?.trim()) return ad.display_name.trim();
  const headline = ad.headline?.trim();
  if (headline && headline.toLowerCase() !== 'chat with us') return headline;
  return `Ad …${ad.ad_id.slice(-6)}`;
}

/**
 * Ads detected from Click-to-WhatsApp chats. Works without Meta ad-account
 * access because WhatsApp itself reports which ad each chat came from.
 */
export function useWhatsAppAdSources() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;

  const query = useQuery({
    queryKey: ['whatsapp-ad-sources', tenantId],
    queryFn: async () => {
      if (!tenantId) return [] as WhatsAppAdSource[];
      const { data, error } = await supabase
        .from('meta_ctwa_ads')
        .select(COLUMNS)
        .eq('tenant_id', tenantId)
        .order('last_seen_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as WhatsAppAdSource[];
    },
    enabled: !!tenantId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`whatsapp-ad-sources-${tenantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meta_ctwa_ads', filter: `tenant_id=eq.${tenantId}` }, () => {
        void queryClient.invalidateQueries({ queryKey: ['whatsapp-ad-sources', tenantId] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [tenantId, queryClient]);

  const rename = async (id: string, name: string) => {
    const { error } = await supabase
      .from('meta_ctwa_ads')
      .update({ display_name: name.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['whatsapp-ad-sources', tenantId] });
  };

  return { adSources: query.data || [], isLoading: query.isLoading, rename };
}

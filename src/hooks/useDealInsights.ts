import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DealAiInsights {
  lead_quality: number;
  conversion_probability: number;
  risk_score: number;
  next_best_action: string;
  summary: string;
  tags: string[];
  generated_at?: string;
}

export function useDealInsights() {
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async (dealId: string): Promise<DealAiInsights | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crm-deal-insights', {
        body: { deal_id: dealId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return (data as any).insights as DealAiInsights;
    } catch (e: any) {
      const msg = e?.message || 'AI failed';
      if (msg.includes('rate_limited')) toast.error('AI rate limit reached. Try again in a moment.');
      else if (msg.includes('payment_required')) toast.error('AI credits exhausted. Top up Lovable AI.');
      else toast.error('Failed to generate insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading };
}

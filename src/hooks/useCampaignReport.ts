import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignJobRow {
  id: string;
  status: string;
  recipient_phone: string;
  recipient_name: string | null;
  wamid: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  replied_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  skip_reason: string | null;
  created_at: string;
  updated_at: string;
  attempts: number | null;
}

export function useCampaignJobs(campaignId?: string) {
  return useQuery({
    queryKey: ['campaign-jobs', campaignId],
    queryFn: async (): Promise<CampaignJobRow[]> => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from('campaign_jobs')
        .select('id,status,recipient_phone,recipient_name,wamid,sent_at,delivered_at,read_at,replied_at,failed_at,error_code,error_message,skip_reason,created_at,updated_at,attempts')
        .eq('campaign_id', campaignId)
        .order('updated_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data as CampaignJobRow[]) || [];
    },
    enabled: !!campaignId,
    refetchInterval: 15000,
  });
}

/** Build a 30-min bucketed delivery timeline from jobs. */
export function buildTimeline(jobs: CampaignJobRow[]) {
  const buckets = new Map<number, { sent: number; delivered: number; read: number; replied: number; failed: number }>();
  const bucket = (iso: string | null) => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    return Math.floor(t / (30 * 60 * 1000)) * (30 * 60 * 1000);
  };
  const ensure = (k: number) => {
    if (!buckets.has(k)) buckets.set(k, { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 });
    return buckets.get(k)!;
  };
  for (const j of jobs) {
    const s = bucket(j.sent_at); if (s) ensure(s).sent++;
    const d = bucket(j.delivered_at); if (d) ensure(d).delivered++;
    const r = bucket(j.read_at); if (r) ensure(r).read++;
    const rp = bucket(j.replied_at); if (rp) ensure(rp).replied++;
    const f = bucket(j.failed_at); if (f) ensure(f).failed++;
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([k, v]) => ({
      time: new Date(k).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...v,
    }));
}

export function jobsToCSV(jobs: CampaignJobRow[]): string {
  const headers = ['recipient_phone','recipient_name','status','wamid','sent_at','delivered_at','read_at','replied_at','failed_at','error_code','error_message','skip_reason','attempts'];
  const escape = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(',')];
  for (const j of jobs) {
    lines.push(headers.map(h => escape((j as any)[h])).join(','));
  }
  return lines.join('\n');
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

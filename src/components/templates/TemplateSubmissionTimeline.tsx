import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Trash2, Clock, CheckCircle2, XCircle, Link2, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SubmissionLog {
  id: string;
  step: string | null;
  meta_status: string | null;
  meta_template_id: string | null;
  rejection_reason: string | null;
  meta_error_code: number | null;
  meta_error_subcode: number | null;
  meta_error_title: string | null;
  meta_error_details: any;
  request_payload: any;
  response_payload: any;
  created_at: string;
  version_id: string;
}

const stepConfig: Record<string, { icon: any; label: string; color: string }> = {
  deleted: { icon: Trash2, label: 'Old version deleted on Meta', color: 'text-orange-500' },
  posted: { icon: Send, label: 'Posted to Meta', color: 'text-blue-500' },
  submitted: { icon: Send, label: 'Submitted', color: 'text-blue-500' },
  pending: { icon: Clock, label: 'Pending review', color: 'text-yellow-500' },
  linked: { icon: Link2, label: 'Linked to existing Meta template', color: 'text-indigo-500' },
  retried: { icon: RefreshCw, label: 'Retried after delete', color: 'text-blue-500' },
  approved: { icon: CheckCircle2, label: 'Approved', color: 'text-green-600' },
  rejected: { icon: XCircle, label: 'Rejected by Meta', color: 'text-destructive' },
};

export function TemplateSubmissionTimeline({ templateId }: { templateId: string }) {
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('template_submission_logs')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (mounted) {
        setLogs((data as any) || []);
        setLoading(false);
      }
    })();

    const ch = supabase
      .channel(`tsl-${templateId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'template_submission_logs',
        filter: `template_id=eq.${templateId}`,
      }, (payload) => {
        setLogs((prev) => [payload.new as any, ...prev]);
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [templateId]);

  if (loading) {
    return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No submission attempts yet.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-3">
        {logs.map((log, idx) => {
          const key = (log.step || log.meta_status || 'submitted').toLowerCase();
          const cfg = stepConfig[key] || stepConfig.submitted;
          const Icon = cfg.icon;
          const isReject = key === 'rejected' || log.meta_status === 'rejected';
          return (
            <div key={log.id} className="relative flex gap-3 pl-1">
              <div className={`relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-background border-2 ${idx === 0 ? 'border-primary' : 'border-muted'}`}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{cfg.label}</p>
                  {log.meta_status && (
                    <Badge variant="outline" className="text-[10px] uppercase">{log.meta_status}</Badge>
                  )}
                  {log.meta_error_subcode != null && (
                    <Badge variant="outline" className="text-[10px]">subcode {log.meta_error_subcode}</Badge>
                  )}
                  {log.meta_error_code != null && (
                    <Badge variant="outline" className="text-[10px]">code {log.meta_error_code}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  <span className="mx-1">•</span>
                  {format(new Date(log.created_at), 'MMM d, h:mm a')}
                  {log.meta_template_id && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="font-mono">Meta ID {log.meta_template_id}</span>
                    </>
                  )}
                </p>
                {isReject && (log.meta_error_title || log.rejection_reason) && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive space-y-1">
                    {log.meta_error_title && <p className="font-semibold">{log.meta_error_title}</p>}
                    {log.rejection_reason && <p className="whitespace-pre-wrap">{log.rejection_reason}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

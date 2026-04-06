import { useLeadEvents } from '@/hooks/useLeadForms';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ScrollText, RefreshCw, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  received: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', icon: Clock },
  processing: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400', icon: Clock },
  success: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle2 },
  failed: { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', icon: AlertCircle },
  skipped: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400', icon: Clock },
};

export function LeadEventsLog() {
  const { events, loading, refetch } = useLeadEvents();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ScrollText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">No Events Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Webhook events will appear here when Meta sends lead form submissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.received;
            const StatusIcon = config.icon;
            const isExpanded = expandedId === event.id;

            return (
              <Card
                key={event.id}
                className={`overflow-hidden transition-all cursor-pointer border-border/60 ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
              >
                <CardContent className="p-0">
                  {/* Summary Row */}
                  <div className="flex items-center gap-3 p-3 sm:p-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-foreground">{event.lead_id?.slice(0, 16) || 'Unknown'}</span>
                        <Badge className={`${config.color} text-[10px] h-4 px-1.5`} variant="secondary">
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span>Form: {event.form_id?.slice(0, 12) || '—'}</span>
                        {event.processing_duration_ms && <span>{event.processing_duration_ms}ms</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-border/40 p-3 sm:p-4 bg-muted/20 space-y-3">
                      {event.error_text && (
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-xs font-medium text-red-700 dark:text-red-400">Error: {event.error_text}</p>
                        </div>
                      )}
                      {event.normalized_data && (
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1.5">Normalized Data</p>
                          <pre className="text-[11px] bg-background p-2.5 rounded-lg border border-border/60 overflow-auto max-h-36 text-muted-foreground">
                            {JSON.stringify(event.normalized_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground mb-1.5">Raw Payload</p>
                        <pre className="text-[11px] bg-background p-2.5 rounded-lg border border-border/60 overflow-auto max-h-36 text-muted-foreground">
                          {JSON.stringify(event.raw_payload, null, 2)}
                        </pre>
                      </div>
                      <div className="flex gap-4 text-[11px] text-muted-foreground">
                        {event.contact_id && <span>Contact: {event.contact_id.slice(0, 8)}…</span>}
                        {event.conversation_id && <span>Conversation: {event.conversation_id.slice(0, 8)}…</span>}
                        <span className="sm:hidden">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

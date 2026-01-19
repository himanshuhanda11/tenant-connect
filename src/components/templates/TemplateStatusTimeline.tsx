import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileEdit, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface TemplateEvent {
  id: string;
  kind: 'STATUS_CHANGE' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ERROR' | 'NOTE';
  status: string | null;
  message: string | null;
  payload: Record<string, any>;
  created_at: string;
}

interface TemplateStatusTimelineProps {
  templateId: string;
  currentStatus: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  DRAFT: { icon: FileEdit, color: 'text-muted-foreground', label: 'Draft' },
  SUBMITTED: { icon: Send, color: 'text-blue-500', label: 'Submitted' },
  UNDER_REVIEW: { icon: Clock, color: 'text-yellow-500', label: 'Under Review' },
  APPROVED: { icon: CheckCircle2, color: 'text-green-500', label: 'Approved' },
  REJECTED: { icon: XCircle, color: 'text-destructive', label: 'Rejected' },
  PAUSED: { icon: AlertCircle, color: 'text-orange-500', label: 'Paused' },
};

const kindConfig: Record<string, { icon: React.ElementType; color: string }> = {
  STATUS_CHANGE: { icon: RefreshCw, color: 'text-blue-500' },
  SUBMITTED: { icon: Send, color: 'text-blue-500' },
  APPROVED: { icon: CheckCircle2, color: 'text-green-500' },
  REJECTED: { icon: XCircle, color: 'text-destructive' },
  ERROR: { icon: AlertCircle, color: 'text-destructive' },
  NOTE: { icon: MessageSquare, color: 'text-muted-foreground' },
};

export function TemplateStatusTimeline({ templateId, currentStatus }: TemplateStatusTimelineProps) {
  const [events, setEvents] = useState<TemplateEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`template-events-${templateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wa_template_events',
          filter: `template_id=eq.${templateId}`,
        },
        (payload) => {
          setEvents(prev => [payload.new as TemplateEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [templateId]);

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('wa_template_events')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setEvents(data as unknown as TemplateEvent[]);
    }
    setLoading(false);
  }

  const currentStatusConfig = statusConfig[currentStatus] || statusConfig.DRAFT;
  const StatusIcon = currentStatusConfig.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Status Timeline</CardTitle>
          <Badge 
            variant="outline" 
            className={`${currentStatusConfig.color} border-current`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {currentStatusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Education Banner */}
        {currentStatus === 'SUBMITTED' || currentStatus === 'UNDER_REVIEW' ? (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <Clock className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Meta Review in Progress</strong>
              <br />
              Templates typically take 24-48 hours to review. Some may take longer during high volume periods.
            </AlertDescription>
          </Alert>
        ) : null}

        {currentStatus === 'REJECTED' && (
          <Alert className="mb-4 bg-destructive/10 border-destructive/30">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm">
              <strong>Template Rejected</strong>
              <br />
              Use the "Fix with AI" feature to get suggestions and create a new version for resubmission.
            </AlertDescription>
          </Alert>
        )}

        {/* Timeline */}
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileEdit className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs">Events will appear here when you submit the template</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                {events.map((event, index) => {
                  const config = kindConfig[event.kind] || kindConfig.NOTE;
                  const Icon = config.icon;
                  
                  return (
                    <div key={event.id} className="relative flex gap-3 pl-1">
                      {/* Timeline dot */}
                      <div className={`
                        relative z-10 flex items-center justify-center 
                        h-8 w-8 rounded-full bg-background border-2 
                        ${index === 0 ? 'border-primary' : 'border-muted'}
                      `}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-4">
                        <p className="text-sm font-medium">{event.message || event.kind.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          <span className="mx-1">•</span>
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </p>
                        
                        {/* Show rejection reason if available */}
                        {event.kind === 'REJECTED' && event.payload?.meta?.error?.message && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                            {event.payload.meta.error.message}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
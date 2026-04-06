import { useWebhookHealth } from '@/hooks/useLeadForms';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Webhook, CheckCircle2, XCircle, RefreshCw, Activity, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLeadForms } from '@/hooks/useLeadForms';

export function WebhookHealthPanel() {
  const { subscriptions, loading, refetch } = useWebhookHealth();
  const { subscribeWebhook } = useLeadForms();

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}</p>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={refetch}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Webhook className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">No Webhook Subscriptions</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Sync your lead forms first, then subscribe to webhooks to start receiving lead notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {sub.page_name || sub.page_id}
                  </h4>
                  {sub.is_subscribed ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30 shrink-0">
                      <XCircle className="h-2.5 w-2.5 mr-0.5" />
                      Disconnected
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/40">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{sub.event_count_24h}</p>
                    <p className="text-[10px] text-muted-foreground">Events 24h</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${sub.failure_count_24h > 0 ? 'text-red-600' : 'text-foreground'}`}>
                      {sub.failure_count_24h}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Failures</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {sub.last_event_at
                        ? formatDistanceToNow(new Date(sub.last_event_at), { addSuffix: true })
                        : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Last Event</p>
                  </div>
                </div>

                {/* Error */}
                {sub.last_error && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-[11px] text-red-700 dark:text-red-400 line-clamp-2">{sub.last_error}</p>
                  </div>
                )}

                {/* Action */}
                {!sub.is_subscribed && (
                  <Button size="sm" className="w-full h-8 text-xs" onClick={() => subscribeWebhook(sub.page_id)}>
                    <Webhook className="h-3 w-3 mr-1.5" />
                    Resubscribe
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

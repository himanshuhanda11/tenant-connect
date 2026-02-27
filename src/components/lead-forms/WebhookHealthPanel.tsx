import { useWebhookHealth } from '@/hooks/useLeadForms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Webhook, CheckCircle2, XCircle, RefreshCw, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLeadForms } from '@/hooks/useLeadForms';

export function WebhookHealthPanel() {
  const { subscriptions, loading, refetch } = useWebhookHealth();
  const { subscribeWebhook } = useLeadForms();

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Webhook Health</h3>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Webhook className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Webhook Subscriptions</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Sync your lead forms first, then subscribe to webhooks to start receiving lead notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{sub.page_name || sub.page_id}</CardTitle>
                  {sub.is_subscribed ? (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30">
                      <XCircle className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Event</span>
                  <span>{sub.last_event_at ? formatDistanceToNow(new Date(sub.last_event_at), { addSuffix: true }) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Events (24h)</span>
                  <span className="font-mono">{sub.event_count_24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failures (24h)</span>
                  <span className={`font-mono ${sub.failure_count_24h > 0 ? 'text-red-600' : ''}`}>
                    {sub.failure_count_24h}
                  </span>
                </div>
                {sub.last_error && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded text-xs text-red-700 dark:text-red-400 mt-2">
                    {sub.last_error}
                  </div>
                )}
                {!sub.is_subscribed && (
                  <Button size="sm" className="w-full mt-2" onClick={() => subscribeWebhook(sub.page_id)}>
                    <Webhook className="h-3 w-3 mr-2" />
                    Resubscribe
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

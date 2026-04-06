import { useLeadForms } from '@/hooks/useLeadForms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, FileText, Zap, Webhook, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LeadFormsList() {
  const { forms, loading, syncForms, subscribeWebhook, testWebhook } = useLeadForms();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await syncForms();
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {forms.length} form{forms.length !== 1 ? 's' : ''} connected
        </p>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm" className="h-8 text-xs">
          {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          Sync from Meta
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">No Lead Forms Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Connect your Meta Business account and sync your Facebook & Instagram Lead Forms to capture leads automatically.
            </p>
            <Button onClick={handleSync} disabled={syncing} size="sm">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync from Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="overflow-hidden hover:shadow-md transition-shadow border-border/60">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {form.form_name || form.form_id}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {form.page_name || form.page_id}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => testWebhook(form.page_id)}>
                        Send Test Lead
                      </DropdownMenuItem>
                      {!form.is_webhook_subscribed && (
                        <DropdownMenuItem onClick={() => subscribeWebhook(form.page_id)}>
                          Subscribe Webhook
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={form.status === 'active' ? 'default' : 'secondary'}
                    className="text-[10px] h-5 px-1.5"
                  >
                    {form.status}
                  </Badge>
                  {form.is_webhook_subscribed ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                      <Zap className="h-2.5 w-2.5 mr-0.5" />
                      Webhook Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                      <Webhook className="h-2.5 w-2.5 mr-0.5" />
                      Not Subscribed
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground leading-none">{form.lead_count}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Leads</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {form.last_lead_at
                        ? formatDistanceToNow(new Date(form.last_lead_at), { addSuffix: true })
                        : 'No leads yet'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Last Lead</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

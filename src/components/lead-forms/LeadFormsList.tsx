import { useLeadForms } from '@/hooks/useLeadForms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Loader2, FileText, Zap, Webhook, MoreHorizontal, Filter, AlertTriangle, ArrowDownToLine } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function LeadFormsList() {
  const { forms, loading, syncForms, subscribeWebhook, testWebhook, permissionError, refetch } = useLeadForms();
  const { currentTenant } = useTenant();
  const [syncing, setSyncing] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>('all');
  const [backfillForm, setBackfillForm] = useState<{ form_id: string; form_name: string; lead_count: number } | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const navigate = useNavigate();

  const handleBackfill = async () => {
    if (!backfillForm || !currentTenant?.id) return;
    setBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: {
          tenantId: currentTenant.id,
          action: 'backfill_form_leads',
          formId: backfillForm.form_id,
          maxLeads: 5000,
        },
      });
      if (error) throw error;
      if (data?.success) {
        const r = data.results?.[0];
        if (r?.error) {
          toast.error(`Backfill error: ${r.error}`);
        } else {
          toast.success(
            `Backfilled ${data.total_inserted} new lead${data.total_inserted === 1 ? '' : 's'}`,
            { description: `Fetched ${data.total_fetched}, skipped ${r?.skipped ?? 0} duplicates. Auto-replies were NOT sent.` }
          );
        }
      } else {
        toast.error(data?.error || 'Backfill failed');
      }
      await refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Backfill failed');
    } finally {
      setBackfilling(false);
      setBackfillForm(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncForms();
    setSyncing(false);
  };

  const pages = useMemo(() => {
    const map = new Map<string, string>();
    forms.forEach((f) => {
      if (f.page_id) map.set(f.page_id, f.page_name || f.page_id);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [forms]);

  const filteredForms = useMemo(() => {
    if (selectedPageId === 'all') return forms;
    return forms.filter((f) => f.page_id === selectedPageId);
  }, [forms, selectedPageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {permissionError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="flex-1 text-sm">{permissionError}</span>
            <Button
              size="sm"
              variant="outline"
              className="w-fit shrink-0"
              onClick={() => navigate('/meta-ads/setup?reauthorize=lead_forms')}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Auto-Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''}
            {selectedPageId !== 'all' && ' on selected page'}
          </p>
          {pages.length > 1 && (
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <Filter className="h-3 w-3 mr-1.5 shrink-0" />
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {pages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm" className="h-8 text-xs">
          {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          Sync from Meta
        </Button>
      </div>

      {filteredForms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {selectedPageId !== 'all' ? 'No Forms for This Page' : 'No Lead Forms Found'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {selectedPageId !== 'all'
                ? 'This page has no lead forms. Try selecting a different page or sync from Meta.'
                : 'Connect your Meta Business account and sync your Facebook & Instagram Lead Forms to capture leads automatically.'}
            </p>
            <Button onClick={handleSync} disabled={syncing} size="sm">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync from Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <Card key={form.id} className="overflow-hidden hover:shadow-md transition-shadow border-border/60">
              <CardContent className="p-4 space-y-3">
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
                      {form.lead_count > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setBackfillForm({ form_id: form.form_id, form_name: form.form_name || form.form_id, lead_count: form.lead_count })}
                          >
                            <ArrowDownToLine className="h-3.5 w-3.5 mr-2" />
                            Backfill {form.lead_count} historical leads
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

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
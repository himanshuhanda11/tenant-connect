import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadFormRulesPanel } from '@/components/lead-forms/LeadFormRulesPanel';
import { WebhookHealthPanel } from '@/components/lead-forms/WebhookHealthPanel';
import { LeadEventsLog } from '@/components/lead-forms/LeadEventsLog';
import { SEO } from '@/components/seo';
import {
  FileText, Zap, Activity, ScrollText, ArrowDownToLine, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, ExternalLink, Shield, Facebook, Webhook, Loader2, Check,
  ChevronRight, MoreHorizontal, Sparkles, Link2, Inbox,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLeadForms, useLeadFormRules, useLeadEvents, useWebhookHealth } from '@/hooks/useLeadForms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const REQUIRED_META_SCOPES = [
  'ads_read',
  'pages_show_list',
  'pages_manage_ads',
  'leads_retrieval',
  'business_management',
  'pages_read_engagement',
];

type PageSubState = {
  status: 'idle' | 'subscribing' | 'verifying' | 'success' | 'error';
  message?: string;
  isAdminIssue?: boolean;
  isPermIssue?: boolean;
};

export default function LeadFormsPage() {
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageStates, setPageStates] = useState<Record<string, PageSubState>>({});
  const [syncing, setSyncing] = useState(false);
  const [backfillForm, setBackfillForm] = useState<{ form_id: string; form_name: string; lead_count: number } | null>(null);
  const [backfilling, setBackfilling] = useState(false);

  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { forms, syncForms, subscribeWebhook, testWebhook, refetch } = useLeadForms();
  const { rules } = useLeadFormRules();
  const { events } = useLeadEvents();
  const { subscriptions } = useWebhookHealth();

  const metaAccountQuery = useQuery({
    queryKey: ['meta-ad-accounts-leadforms', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data } = await supabase
        .from('smeksh_meta_ad_accounts')
        .select('id, status, scopes_granted, facebook_page_id, facebook_page_name, meta_access_token, token_expires_at')
        .eq('workspace_id', currentTenant.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      const scopes = (data?.scopes_granted as string[] | null) || [];
      if (data?.meta_access_token && !scopes.includes('leads_retrieval')) {
        const { data: refreshed } = await supabase.functions.invoke('meta-sync-lead-forms', {
          body: { tenantId: currentTenant.id, action: 'refresh_permissions' },
        });
        if (Array.isArray(refreshed?.scopes_granted)) {
          return { ...data, scopes_granted: refreshed.scopes_granted };
        }
      }
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  const metaAccount = metaAccountQuery.data;
  const grantedScopes: string[] = (metaAccount?.scopes_granted as string[]) || [];
  const isConnected = metaAccount?.status === 'connected';
  const hasPageManageAds = grantedScopes.includes('pages_manage_ads');
  const hasLeadsRetrieval = grantedScopes.includes('leads_retrieval');
  const hasPageReadEngagement = grantedScopes.includes('pages_read_engagement');
  const hasPage = !!metaAccount?.facebook_page_id;
  const isTokenExpired = metaAccount?.token_expires_at ? new Date(metaAccount.token_expires_at) < new Date() : false;
  const missingScopes = REQUIRED_META_SCOPES.filter((s) => !grantedScopes.includes(s));
  const reconnectToMeta = () => navigate('/meta-ads/setup?reauthorize=lead_forms');

  const connectionIssue = useMemo(() => {
    if (!metaAccount) return { type: 'disconnected', message: 'No Meta account connected. Connect Facebook to access Lead Ads.' };
    if (isTokenExpired) return { type: 'expired', message: 'Your Meta access token has expired. Please reconnect.' };
    if (!hasPageManageAds) return { type: 'missing_scope', message: 'Missing pages_manage_ads. Reconnect and approve all permissions.' };
    if (!hasLeadsRetrieval) return { type: 'missing_scope', message: 'Missing leads_retrieval. Reconnect and toggle Lead Access ON.' };
    if (!hasPageReadEngagement) return { type: 'missing_scope', message: 'Missing pages_read_engagement. Reconnect and approve all permissions.' };
    if (!hasPage) return { type: 'no_page', message: 'No Facebook Page selected. Open Meta Ads Setup and select a Page.' };
    return null;
  }, [metaAccount, isTokenExpired, hasPageManageAds, hasLeadsRetrieval, hasPageReadEngagement, hasPage]);

  // Group forms by page — restricted to the Page selected during Meta connection
  const connectedPageId = metaAccount?.facebook_page_id || null;
  const pageGroups = useMemo(() => {
    const map = new Map<string, { page_id: string; page_name: string; forms: typeof forms; subscribed: boolean; lead_count: number; last_lead_at: string | null }>();
    forms.forEach((f) => {
      if (!f.page_id) return;
      // Only show data for the page that was selected during Meta Ads connection
      if (connectedPageId && f.page_id !== connectedPageId) return;
      const existing = map.get(f.page_id);
      const lastLead = f.last_lead_at ? new Date(f.last_lead_at).getTime() : 0;
      if (existing) {
        existing.forms.push(f);
        existing.lead_count += f.lead_count || 0;
        existing.subscribed = existing.subscribed && !!f.is_webhook_subscribed;
        if (lastLead && (!existing.last_lead_at || lastLead > new Date(existing.last_lead_at).getTime())) {
          existing.last_lead_at = f.last_lead_at;
        }
      } else {
        map.set(f.page_id, {
          page_id: f.page_id,
          page_name: f.page_name || f.page_id,
          forms: [f],
          subscribed: !!f.is_webhook_subscribed,
          lead_count: f.lead_count || 0,
          last_lead_at: f.last_lead_at,
        });
      }
    });
    return Array.from(map.values());
  }, [forms, connectedPageId]);

  // Auto-select the first page when data loads
  useEffect(() => {
    if (!selectedPageId && pageGroups.length > 0) {
      setSelectedPageId(pageGroups[0].page_id);
    }
  }, [pageGroups, selectedPageId]);

  const selectedPage = pageGroups.find((p) => p.page_id === selectedPageId) || null;

  const subscribedCount = pageGroups.filter((p) => p.subscribed).length;
  const totalLeads = events.filter((e) => e.status === 'success').length;

  // Stepper progress
  const steps = [
    { key: 'connect', label: 'Connect', done: isConnected && !isTokenExpired },
    { key: 'permissions', label: 'Permissions', done: isConnected && missingScopes.length === 0 },
    { key: 'forms', label: 'Sync Forms', done: forms.length > 0 },
    { key: 'subscribe', label: 'Subscribe Pages', done: pageGroups.length > 0 && subscribedCount === pageGroups.length },
  ];
  const currentStepIdx = steps.findIndex((s) => !s.done);

  const handleSync = async () => {
    setSyncing(true);
    await syncForms();
    setSyncing(false);
  };

  const setPageState = (pageId: string, state: PageSubState) =>
    setPageStates((prev) => ({ ...prev, [pageId]: state }));

  const handleSubscribePage = async (pageId: string, pageName: string) => {
    if (!currentTenant?.id) return;
    setPageState(pageId, { status: 'subscribing' });
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'subscribe_webhook', pageId },
      });
      if (error) throw error;
      if (data?.success) {
        setPageState(pageId, { status: 'success', message: 'Subscribed on Meta' });
        toast.success(`Subscribed "${pageName}" to leadgen`);
        await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: ['webhook-health'] })]);
      } else {
        const msg = data?.error || 'Subscribe failed';
        const isAdminIssue = /no page access token|not.*admin|admin.*page/i.test(msg);
        const isPermIssue = /pages_manage_metadata|permission|\(#10\)|\(#200\)/i.test(msg);
        setPageState(pageId, { status: 'error', message: msg, isAdminIssue, isPermIssue });
      }
    } catch (err: any) {
      setPageState(pageId, { status: 'error', message: err?.message || 'Network error' });
    }
  };

  const handleVerifyPage = async (pageId: string) => {
    if (!currentTenant?.id) return;
    setPageState(pageId, { status: 'verifying' });
    try {
      const { data } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'verify_subscriptions' },
      });
      const result = data?.results?.find((r: any) => r.page_id === pageId);
      if (result?.subscribed) {
        setPageState(pageId, { status: 'success', message: 'Confirmed subscribed on Meta ✓' });
        toast.success('Verified — your app is installed on this Page');
      } else {
        setPageState(pageId, {
          status: 'error',
          message: result?.error || 'App not installed on this Page yet. Click Subscribe.',
        });
      }
      await refetch();
    } catch (err: any) {
      setPageState(pageId, { status: 'error', message: err?.message || 'Verify failed' });
    }
  };

  const handleBackfill = async () => {
    if (!backfillForm || !currentTenant?.id) return;
    setBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'backfill_form_leads', formId: backfillForm.form_id, maxLeads: 5000 },
      });
      if (error) throw error;
      if (data?.success) {
        const r = data.results?.[0];
        if (r?.error) toast.error(`Backfill error: ${r.error}`);
        else toast.success(`Backfilled ${data.total_inserted} new lead${data.total_inserted === 1 ? '' : 's'}`, {
          description: `Fetched ${data.total_fetched}, skipped ${r?.skipped ?? 0} duplicates.`,
        });
      } else toast.error(data?.error || 'Backfill failed');
      await refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Backfill failed');
    } finally {
      setBackfilling(false);
      setBackfillForm(null);
    }
  };

  return (
    <DashboardLayout>
      <SEO title="Lead Forms - AiReatro" description="Capture Meta lead forms into WhatsApp" />
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 ring-1 ring-primary/20 flex items-center justify-center">
                <Inbox className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Meta Lead Forms</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Auto-capture Facebook & Instagram leads into WhatsApp in real-time.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit text-[11px] px-2.5 py-1 border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live Integration
            </Badge>
          </div>

          {/* Stepper */}
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {steps.map((step, idx) => {
              const active = idx === currentStepIdx;
              const done = step.done;
              return (
                <div
                  key={step.key}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors',
                    done && 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/20',
                    !done && active && 'border-primary/40 bg-primary/5',
                    !done && !active && 'border-border/60 bg-muted/30',
                  )}
                >
                  <div className={cn(
                    'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold',
                    done && 'bg-emerald-500 text-white',
                    !done && active && 'bg-primary text-primary-foreground',
                    !done && !active && 'bg-muted text-muted-foreground',
                  )}>
                    {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-xs font-medium truncate', done ? 'text-emerald-700 dark:text-emerald-300' : active ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection issue */}
        {connectionIssue && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="flex-1 text-sm">{connectionIssue.message}</span>
              <Button size="sm" variant="outline" className="w-fit shrink-0" onClick={reconnectToMeta}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {connectionIssue.type === 'disconnected' ? 'Connect Now' : 'Reconnect'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Connected Pages', value: pageGroups.length, icon: Facebook, color: 'text-blue-500' },
            { label: 'Live Forms', value: forms.length, icon: FileText, color: 'text-violet-500' },
            { label: 'Subscribed', value: `${subscribedCount}/${pageGroups.length || 0}`, icon: Webhook, color: 'text-amber-500' },
            { label: 'Leads Captured', value: totalLeads, icon: ArrowDownToLine, color: 'text-emerald-500' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center', s.color)}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions strip — collapsed line */}
        <Card className="border-border/60">
          <CardContent className="p-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs sm:text-sm text-foreground">
                <span className="font-medium">Meta permissions:</span>{' '}
                {isConnected && missingScopes.length === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">All {REQUIRED_META_SCOPES.length} scopes granted</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">{missingScopes.length} missing — {missingScopes.join(', ')}</span>
                )}
              </p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={reconnectToMeta}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Manage
            </Button>
          </CardContent>
        </Card>

        {/* PAGE MANAGER — the centerpiece */}
        {pageGroups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Sync your first lead forms</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-5">
                Pull all Facebook & Instagram lead forms from your connected Meta Pages.
              </p>
              <Button onClick={handleSync} disabled={syncing} size="sm">
                {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync from Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
            {/* Left: pages list */}
            <Card className="border-border/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Your Pages</p>
                <Button onClick={handleSync} disabled={syncing} variant="ghost" size="sm" className="h-7 text-xs">
                  {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="divide-y divide-border/60 max-h-[480px] overflow-y-auto">
                {pageGroups.map((p) => {
                  const isActive = p.page_id === selectedPageId;
                  return (
                    <button
                      key={p.page_id}
                      onClick={() => setSelectedPageId(p.page_id)}
                      className={cn(
                        'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors',
                        isActive ? 'bg-primary/5' : 'hover:bg-muted/40',
                      )}
                    >
                      <div className={cn(
                        'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                        isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                      )}>
                        <Facebook className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{p.page_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.forms.length} form{p.forms.length === 1 ? '' : 's'} · {p.lead_count} leads
                        </p>
                      </div>
                      {p.subscribed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                      <ChevronRight className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', isActive && 'translate-x-0.5 text-primary')} />
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Right: selected page detail */}
            {selectedPage && (
              <div className="space-y-4">
                {/* Subscribe card for this page */}
                <Card className="border-border/60 overflow-hidden">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground truncate">{selectedPage.page_name}</h3>
                          {selectedPage.subscribed ? (
                            <Badge variant="outline" className="h-5 text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Webhook Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="h-5 text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                              <Webhook className="h-2.5 w-2.5 mr-0.5" /> Not Subscribed
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{selectedPage.page_id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyPage(selectedPage.page_id)}
                          disabled={pageStates[selectedPage.page_id]?.status === 'verifying'}
                          className="h-8 text-xs"
                        >
                          {pageStates[selectedPage.page_id]?.status === 'verifying'
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            : <Shield className="h-3.5 w-3.5 mr-1.5" />}
                          Verify on Meta
                        </Button>
                        {!selectedPage.subscribed && (
                          <Button
                            size="sm"
                            onClick={() => handleSubscribePage(selectedPage.page_id, selectedPage.page_name)}
                            disabled={pageStates[selectedPage.page_id]?.status === 'subscribing'}
                            className="h-8 text-xs"
                          >
                            {pageStates[selectedPage.page_id]?.status === 'subscribing'
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              : <Link2 className="h-3.5 w-3.5 mr-1.5" />}
                            Subscribe Page
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Per-page result feedback */}
                    {pageStates[selectedPage.page_id]?.status === 'success' && (
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {pageStates[selectedPage.page_id]?.message}
                      </div>
                    )}

                    {pageStates[selectedPage.page_id]?.status === 'error' && (
                      <div className="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 px-3 py-2.5 space-y-2">
                        <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                          <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{pageStates[selectedPage.page_id]?.message}</span>
                        </div>

                        {pageStates[selectedPage.page_id]?.isAdminIssue && (
                          <div className="text-[11px] text-muted-foreground space-y-1 pl-5">
                            <p className="text-foreground"><strong>Fix:</strong></p>
                            <ol className="list-decimal pl-4 space-y-0.5">
                              <li>Open Facebook → this Page → Settings → Page roles. Confirm your user has <strong>Admin</strong>.</li>
                              <li>If not, ask the Page owner to grant Admin or to reconnect Facebook here.</li>
                            </ol>
                          </div>
                        )}

                        {pageStates[selectedPage.page_id]?.isPermIssue && (
                          <div className="text-[11px] text-muted-foreground space-y-1 pl-5">
                            <p className="text-foreground"><strong>One-time manual subscribe:</strong></p>
                            <ol className="list-decimal pl-4 space-y-0.5">
                              <li>Open <a href="https://business.facebook.com/settings/pages" target="_blank" rel="noreferrer" className="underline text-primary">Business Settings → Pages</a>.</li>
                              <li>Open <strong>{selectedPage.page_name}</strong> → <em>Connected apps</em> → add this app.</li>
                              <li>Enable the <strong>leadgen</strong> field. Done — leads will start flowing.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Helpful tip */}
                    {!selectedPage.subscribed && !pageStates[selectedPage.page_id] && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Tip:</strong> Subscribing installs Aireatro on this Page so Meta can push new leads to us in real-time. You must be an Admin of this Page.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Forms for selected page */}
                <Card className="border-border/60">
                  <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Lead Forms</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedPage.forms.length} form{selectedPage.forms.length === 1 ? '' : 's'} · {selectedPage.lead_count} captured
                        {selectedPage.last_lead_at && ` · last ${formatDistanceToNow(new Date(selectedPage.last_lead_at), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {selectedPage.forms.map((form) => (
                        <div key={form.id} className="rounded-lg border border-border/60 bg-card p-3 hover:border-primary/30 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{form.form_name || form.form_id}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{form.form_id}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => testWebhook(form.page_id)}>Send Test Lead</DropdownMenuItem>
                                {!form.is_webhook_subscribed && (
                                  <DropdownMenuItem onClick={() => subscribeWebhook(form.page_id)}>Subscribe Webhook</DropdownMenuItem>
                                )}
                                {form.lead_count > 0 && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setBackfillForm({ form_id: form.form_id, form_name: form.form_name || form.form_id, lead_count: form.lead_count })}>
                                      <ArrowDownToLine className="h-3.5 w-3.5 mr-2" /> Backfill {form.lead_count} leads
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/40">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={form.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">{form.status}</Badge>
                              {form.is_webhook_subscribed && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                                  <Zap className="h-2.5 w-2.5 mr-0.5" /> Live
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-foreground">{form.lead_count} leads</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Tabs (advanced) */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-10 p-1 w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="rules" className="text-xs sm:text-sm gap-1.5">
              <Zap className="h-3.5 w-3.5 hidden sm:block" /> Rules
            </TabsTrigger>
            <TabsTrigger value="webhook" className="text-xs sm:text-sm gap-1.5">
              <Activity className="h-3.5 w-3.5 hidden sm:block" /> Health
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs sm:text-sm gap-1.5">
              <ScrollText className="h-3.5 w-3.5 hidden sm:block" /> Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-4"><LeadFormRulesPanel /></TabsContent>
          <TabsContent value="webhook" className="mt-4"><WebhookHealthPanel /></TabsContent>
          <TabsContent value="logs" className="mt-4"><LeadEventsLog /></TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!backfillForm} onOpenChange={(open) => !open && !backfilling && setBackfillForm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Backfill historical leads?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Fetch up to <strong>{backfillForm?.lead_count}</strong> historical leads from Meta for{' '}
                <strong>{backfillForm?.form_name}</strong>.
              </span>
              <span className="block text-amber-700 dark:text-amber-400 text-xs">
                ⚠️ Lead-form rules and auto-replies will <strong>NOT</strong> run. Already-imported leads are skipped.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={backfilling}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleBackfill(); }} disabled={backfilling}>
              {backfilling ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Backfilling…</> : 'Start Backfill'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

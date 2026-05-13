import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadFormsList } from '@/components/lead-forms/LeadFormsList';
import { LeadFormRulesPanel } from '@/components/lead-forms/LeadFormRulesPanel';
import { WebhookHealthPanel } from '@/components/lead-forms/WebhookHealthPanel';
import { LeadEventsLog } from '@/components/lead-forms/LeadEventsLog';
import { SEO } from '@/components/seo';
import { FileText, Zap, Activity, ScrollText, ArrowDownToLine, AlertTriangle, CheckCircle2, XCircle, RefreshCw, ExternalLink, Shield, ShieldAlert, Facebook, Webhook, Loader2 } from 'lucide-react';
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

const REQUIRED_META_SCOPES = [
  'ads_read',
  'pages_show_list',
  'pages_manage_ads',
  'leads_retrieval',
  'business_management',
  'pages_read_engagement',
];

export default function LeadFormsPage() {
  const [activeTab, setActiveTab] = useState('forms');
  const [subscribingAll, setSubscribingAll] = useState(false);
  const [verifyingSubs, setVerifyingSubs] = useState(false);
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { forms } = useLeadForms();
  const { rules } = useLeadFormRules();
  const { events } = useLeadEvents();
  const { subscriptions } = useWebhookHealth();

  const unsubscribedPagesCount = new Set(
    forms.filter((f: any) => !f.is_webhook_subscribed).map((f: any) => f.page_id)
  ).size;

  const [subscribeResult, setSubscribeResult] = useState<{
    total: number;
    succeeded: number;
    failed: number;
    results: Array<{ page_id: string; page_name: string; success: boolean; error?: string }>;
  } | null>(null);

  const handleSubscribeAll = async () => {
    if (!currentTenant?.id) return;
    setSubscribingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'subscribe_all' },
      });
      if (error) throw error;
      if (data?.reconnect) {
        toast.error(data.error || 'Reconnect Facebook required', {
          action: { label: 'Reconnect', onClick: () => navigate('/meta-ads/setup?reauthorize=lead_forms') },
        });
      } else if (data?.success) {
        setSubscribeResult(null);
        toast.success(`Subscribed ${data.succeeded}/${data.total} pages to leadgen webhooks`);
      } else {
        setSubscribeResult({
          total: data?.total ?? 0,
          succeeded: data?.succeeded ?? 0,
          failed: data?.failed ?? 0,
          results: data?.results ?? [],
        });
        toast.warning(`${data?.succeeded ?? 0}/${data?.total ?? 0} succeeded. ${data?.failed ?? 0} failed.`, {
          description: 'See details below to fix the failed pages.',
          action: { label: 'Reconnect', onClick: () => navigate('/meta-ads/setup?reauthorize=lead_forms') },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
      await queryClient.invalidateQueries({ queryKey: ['webhook-health'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to subscribe webhooks');
    } finally {
      setSubscribingAll(false);
    }
  };

  const [verifyResult, setVerifyResult] = useState<{
    total: number;
    subscribed: number;
    meta_app_id: string | null;
    results: Array<{ page_id: string; page_name: string; subscribed: boolean; apps: any[]; error?: string }>;
  } | null>(null);

  const handleVerifySubscriptions = async () => {
    if (!currentTenant?.id) return;
    setVerifyingSubs(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-sync-lead-forms', {
        body: { tenantId: currentTenant.id, action: 'verify_subscriptions' },
      });
      if (error) throw error;
      if (data?.success) {
        setVerifyResult(data);
        const subscribed = data.subscribed ?? 0;
        const total = data.total ?? 0;
        if (subscribed === total && total > 0) {
          toast.success(`All ${total} page${total === 1 ? '' : 's'} subscribed on Meta ✓`);
        } else if (total === 0) {
          toast.info('No pages with lead forms found');
        } else {
          toast.warning(`${subscribed}/${total} pages confirmed subscribed`, {
            description: 'See the details panel below to fix the rest.',
          });
        }
      } else {
        toast.error(data?.error || 'Verification failed');
      }
      await queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
      await queryClient.invalidateQueries({ queryKey: ['webhook-health'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify subscriptions');
    } finally {
      setVerifyingSubs(false);
    }
  };
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
  const hasPagesShowList = grantedScopes.includes('pages_show_list');
  const hasPage = !!metaAccount?.facebook_page_id;
  const isTokenExpired = metaAccount?.token_expires_at ? new Date(metaAccount.token_expires_at) < new Date() : false;
  const missingScopes = REQUIRED_META_SCOPES.filter((scope) => !grantedScopes.includes(scope));
  const reconnectToMeta = () => navigate('/meta-ads/setup?reauthorize=lead_forms');

  const connectionIssue = useMemo(() => {
    if (!metaAccount) return { type: 'disconnected', message: 'No Meta account connected. Connect your Facebook account to access Lead Ads.' };
    if (isTokenExpired) return { type: 'expired', message: 'Your Meta access token has expired. Please reconnect to refresh it.' };
    if (!hasPageManageAds) return { type: 'missing_scope', message: 'Missing pages_manage_ads permission. This is required to access Lead Ads forms and leads. Please reconnect and approve all requested permissions.' };
    // leads_retrieval has its own prominent banner below — skip here so we don't duplicate
    if (!hasPageReadEngagement) return { type: 'missing_scope', message: 'Missing pages_read_engagement permission. Please reconnect and approve all requested permissions.' };
    if (!hasPage) return { type: 'no_page', message: 'No Facebook Page selected. Go to Meta Ads Setup and select a Page.' };
    return null;
  }, [metaAccount, isTokenExpired, hasPageManageAds, hasPageReadEngagement, hasPage]);

  const stats = [
    { label: 'Connected Forms', value: forms.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Active Rules', value: rules.filter(r => r.enabled).length, icon: Zap, color: 'text-amber-500' },
    { label: 'Leads Captured', value: events.filter(e => e.status === 'success').length, icon: ArrowDownToLine, color: 'text-emerald-500' },
    { label: 'Webhooks Active', value: subscriptions.filter(s => s.is_subscribed).length, icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout>
      <SEO title="Lead Forms - AiReatro" description="Manage Meta lead form integrations" />
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Meta Lead Forms</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Capture leads from Facebook & Instagram forms into WhatsApp automatically.
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-xs px-3 py-1 border-primary/30 text-primary bg-primary/5">
            <Activity className="h-3 w-3 mr-1.5" />
            Live Integration
          </Badge>
        </div>

        {/* Connection Status Card */}
        {connectionIssue && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="flex-1 text-sm">{connectionIssue.message}</span>
              <Button
                size="sm"
                variant="outline"
                className="w-fit shrink-0"
                onClick={reconnectToMeta}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {connectionIssue.type === 'disconnected' ? 'Connect Now' : 'Reconnect'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Prominent leads_retrieval missing banner */}
        {!hasLeadsRetrieval && metaAccount && (
          <Card className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Lead Access Permission Missing
                  </h3>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">
                    Your stored Meta token is missing the <strong>leads_retrieval</strong> scope.
                    Without it, Aireatro cannot fetch your Lead Forms or receive new lead submissions.
                    Click the button to reconnect Facebook and make sure the "Lead Access" toggle is ON.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full sm:w-auto shrink-0 bg-red-600 hover:bg-red-700 text-white"
                  onClick={reconnectToMeta}
                >
                  <Facebook className="h-4 w-4 mr-1.5" />
                  Reconnect Facebook
                </Button>
              </div>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-red-200 dark:border-red-800/50 p-3">
                  <p className="text-[11px] text-red-700 dark:text-red-400 font-medium mb-1.5">How to fix:</p>
                  <ol className="text-[11px] text-red-600 dark:text-red-400 space-y-1 list-decimal list-inside">
                    <li>Click <strong>Reconnect Facebook</strong> above.</li>
                    <li>In the Facebook popup, click <strong>Edit Settings</strong>.</li>
                    <li>Toggle <strong>Lead Access (leads_retrieval)</strong> to ON.</li>
                    <li>Click <strong>Continue</strong> and finish the setup wizard.</li>
                    <li>Return here and click <strong>Sync from Meta</strong>.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission Status */}
        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Meta Permissions</p>
                  <p className="text-xs text-muted-foreground">
                    {isConnected && missingScopes.length === 0 ? 'All required scopes are granted' : `${missingScopes.length} required scope${missingScopes.length === 1 ? '' : 's'} missing`}
                  </p>
                </div>
              </div>
              <Button size="sm" variant={missingScopes.length > 0 || !isConnected ? 'default' : 'outline'} className="w-fit shrink-0" onClick={reconnectToMeta}>
                {missingScopes.includes('leads_retrieval') || !isConnected ? <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> : <ExternalLink className="h-3.5 w-3.5 mr-1.5" />}
                {missingScopes.includes('leads_retrieval') || !isConnected ? 'Auto-Reconnect' : 'Meta Ads Setup'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {REQUIRED_META_SCOPES.map((scope) => {
                const granted = grantedScopes.includes(scope);
                return (
                  <div key={scope} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <span className="text-xs font-medium text-foreground truncate">{scope}</span>
                    <Badge variant="outline" className={`text-[10px] h-5 shrink-0 ${granted ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30'}`}>
                      {granted ? <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> : <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                      {granted ? 'Granted' : 'Missing'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {hasPage && (
              <p className="text-xs text-muted-foreground">Connected Page: {metaAccount?.facebook_page_name}</p>
            )}
          </CardContent>
        </Card>

        {/* One-click Subscribe All Webhooks */}
        {hasLeadsRetrieval && hasPage && unsubscribedPagesCount > 0 && (
          <Card className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Webhook className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {unsubscribedPagesCount} page{unsubscribedPagesCount === 1 ? '' : 's'} not subscribed to leadgen webhooks
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  New leads won't arrive in real-time until you subscribe. Click below to subscribe all pages at once.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={verifyingSubs}
                  onClick={handleVerifySubscriptions}
                  className="w-full sm:w-auto border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  {verifyingSubs ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Shield className="h-4 w-4 mr-1.5" />}
                  Verify on Meta
                </Button>
                <Button
                  size="sm"
                  disabled={subscribingAll}
                  onClick={handleSubscribeAll}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {subscribingAll ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Webhook className="h-4 w-4 mr-1.5" />}
                  {subscribingAll ? 'Subscribing…' : 'Subscribe all'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verify result detail */}
        {verifyResult && (
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Meta verification: {verifyResult.subscribed}/{verifyResult.total} pages subscribed
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setVerifyResult(null)}>
                  Dismiss
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Live result of <code className="px-1 py-0.5 rounded bg-muted">GET /{'{page-id}'}/subscribed_apps</code>
                {verifyResult.meta_app_id && <> · matching App ID <code className="px-1 py-0.5 rounded bg-muted">{verifyResult.meta_app_id}</code></>}
              </p>
              <div className="space-y-1.5">
                {verifyResult.results.map((r) => (
                  <div
                    key={r.page_id}
                    className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 ${
                      r.subscribed
                        ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{r.page_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">{r.page_id}</p>
                      {r.error && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">⚠ {r.error}</p>
                      )}
                      {!r.error && !r.subscribed && (
                        <p className="text-[11px] text-red-700 dark:text-red-400 mt-1">
                          Your app is NOT installed on this Page on Meta's side.
                          {r.apps?.length > 0 ? ` ${r.apps.length} other app(s) installed.` : ' No apps installed at all.'}
                          {' '}Click <strong>Subscribe all</strong> above. If it still fails, the connected user is not an admin of this Page — reconnect Facebook with a user who has Page admin role.
                        </p>
                      )}
                    </div>
                    {r.subscribed ? (
                      <Badge variant="outline" className="shrink-0 text-[10px] h-5 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                        Subscribed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 text-[10px] h-5 text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30">
                        <XCircle className="h-2.5 w-2.5 mr-0.5" />
                        Not installed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscribe-all result detail */}
        {subscribeResult && (
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Subscribe result: {subscribeResult.succeeded}/{subscribeResult.total} succeeded
                    {subscribeResult.failed > 0 && <span className="text-red-600 dark:text-red-400"> · {subscribeResult.failed} failed</span>}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSubscribeResult(null)}>
                  Dismiss
                </Button>
              </div>
              <div className="space-y-1.5">
                {subscribeResult.results.map((r) => {
                  const isAdminIssue = !r.success && /no page access token|not.*admin|admin.*page/i.test(r.error || '');
                  return (
                    <div
                      key={r.page_id}
                      className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 ${
                        r.success
                          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{r.page_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">{r.page_id}</p>
                        {r.error && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">⚠ {r.error}</p>
                        )}
                        {isAdminIssue && (
                          <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                            <p className="text-foreground"><strong>How to fix:</strong></p>
                            <ol className="list-decimal pl-4 space-y-0.5">
                              <li>Open Facebook → this Page → <em>Settings → Page roles</em> and confirm your connected user has <strong>Admin</strong> (Full control) access.</li>
                              <li>If you're not an admin, ask the Page owner to grant you admin — or have them reconnect Facebook here using their account.</li>
                              <li>Then click <strong>Reconnect</strong> below and re-run <strong>Subscribe all</strong>.</li>
                            </ol>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] mt-1"
                              onClick={() => navigate('/meta-ads/setup?reauthorize=lead_forms')}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reconnect Facebook
                            </Button>
                          </div>
                        )}
                      </div>
                      {r.success ? (
                        <Badge variant="outline" className="shrink-0 text-[10px] h-5 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                          Subscribed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 text-[10px] h-5 text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30">
                          <XCircle className="h-2.5 w-2.5 mr-0.5" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}


          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-10 p-1 w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="forms" className="text-xs sm:text-sm gap-1.5">
              <FileText className="h-3.5 w-3.5 hidden sm:block" />
              Forms
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs sm:text-sm gap-1.5">
              <Zap className="h-3.5 w-3.5 hidden sm:block" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="webhook" className="text-xs sm:text-sm gap-1.5">
              <Activity className="h-3.5 w-3.5 hidden sm:block" />
              Health
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs sm:text-sm gap-1.5">
              <ScrollText className="h-3.5 w-3.5 hidden sm:block" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="mt-4">
            <LeadFormsList />
          </TabsContent>
          <TabsContent value="rules" className="mt-4">
            <LeadFormRulesPanel />
          </TabsContent>
          <TabsContent value="webhook" className="mt-4">
            <WebhookHealthPanel />
          </TabsContent>
          <TabsContent value="logs" className="mt-4">
            <LeadEventsLog />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadFormsList } from '@/components/lead-forms/LeadFormsList';
import { LeadFormRulesPanel } from '@/components/lead-forms/LeadFormRulesPanel';
import { WebhookHealthPanel } from '@/components/lead-forms/WebhookHealthPanel';
import { LeadEventsLog } from '@/components/lead-forms/LeadEventsLog';
import { SEO } from '@/components/seo';
import { FileText, Zap, Activity, ScrollText, ArrowDownToLine, AlertTriangle, CheckCircle2, XCircle, RefreshCw, ExternalLink, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLeadForms, useLeadFormRules, useLeadEvents, useWebhookHealth } from '@/hooks/useLeadForms';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigate } from 'react-router-dom';

export default function LeadFormsPage() {
  const [activeTab, setActiveTab] = useState('forms');
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const { forms } = useLeadForms();
  const { rules } = useLeadFormRules();
  const { events } = useLeadEvents();
  const { subscriptions } = useWebhookHealth();

  // Check Meta connection & permissions
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
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  const metaAccount = metaAccountQuery.data;
  const grantedScopes: string[] = (metaAccount?.scopes_granted as string[]) || [];
  const isConnected = metaAccount?.status === 'connected';
  const hasPageManageAds = grantedScopes.includes('pages_manage_ads');
  const hasPageReadEngagement = grantedScopes.includes('pages_read_engagement');
  const hasPagesShowList = grantedScopes.includes('pages_show_list');
  const hasPage = !!metaAccount?.facebook_page_id;
  const isTokenExpired = metaAccount?.token_expires_at ? new Date(metaAccount.token_expires_at) < new Date() : false;

  const connectionIssue = useMemo(() => {
    if (!metaAccount) return { type: 'disconnected', message: 'No Meta account connected. Connect your Facebook account to access Lead Ads.' };
    if (isTokenExpired) return { type: 'expired', message: 'Your Meta access token has expired. Please reconnect to refresh it.' };
    if (!hasPageManageAds) return { type: 'missing_scope', message: 'Missing pages_manage_ads permission. This is required to access Lead Ads forms and leads. Please reconnect and approve all requested permissions.' };
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
                onClick={() => navigate('/meta-ads/setup')}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {connectionIssue.type === 'disconnected' ? 'Connect Now' : 'Reconnect'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Status */}
        {isConnected && !connectionIssue && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['pages_show_list', 'pages_manage_ads', 'pages_read_engagement'].map((scope) => {
                    const granted = grantedScopes.includes(scope);
                    return (
                      <Badge key={scope} variant="outline" className={`text-[10px] h-5 ${granted ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30'}`}>
                        {granted ? <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> : <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                        {scope}
                      </Badge>
                    );
                  })}
                </div>
                {hasPage && (
                  <>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <span className="text-xs text-muted-foreground">Page: {metaAccount?.facebook_page_name}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

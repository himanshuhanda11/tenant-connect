import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Instagram, Loader2, PlugZap, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, MessageSquare, Sparkles, Users } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/seo';
import { formatDistanceToNow } from 'date-fns';

interface IGAccount {
  id: string;
  ig_username: string | null;
  ig_name: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  status: string;
  health_status: string;
  last_error: string | null;
  webhook_subscribed: boolean;
  connected_at: string;
  last_synced_at: string | null;
}

const ERROR_LABELS: Record<string, string> = {
  no_ig_account: 'No Instagram Professional account is linked to your Facebook Pages. Convert your account to Business/Creator and link it to a Page.',
  token_exchange: 'Could not exchange authorization code with Meta.',
  state_expired: 'Session expired. Please try again.',
  invalid_state: 'Security check failed. Please try again.',
  missing_params: 'Meta did not return a valid response.',
  save_failed: 'Could not save connection. Please retry.',
  server_error: 'Unexpected error during connection.',
};

export default function InstagramConnect() {
  const { currentTenant, currentRole } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState<IGAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';

  const fetchStatus = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('instagram-manage', {
      body: { tenantId: currentTenant.id, action: 'status' },
    });
    if (error) {
      console.error(error);
      toast({ title: 'Failed to load Instagram status', variant: 'destructive' });
    } else {
      setAccount((data as any)?.account || null);
    }
    setLoading(false);
  }, [currentTenant?.id]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Handle callback redirect params
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      toast({ title: 'Instagram connected', description: 'Your account is ready to receive messages.' });
      setSearchParams({});
      fetchStatus();
    } else if (error) {
      toast({
        title: 'Connection failed',
        description: ERROR_LABELS[error] || decodeURIComponent(error),
        variant: 'destructive',
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, fetchStatus]);

  const handleConnect = async () => {
    if (!currentTenant?.id) return;
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-oauth-start', {
        body: { tenantId: currentTenant.id, returnUrl: window.location.href },
      });
      if (error || !(data as any)?.authUrl) throw new Error(error?.message || 'Failed to start OAuth');
      window.location.href = (data as any).authUrl;
    } catch (err: any) {
      toast({ title: 'Could not start connection', description: err.message, variant: 'destructive' });
      setConnecting(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!currentTenant?.id) return;
    setChecking(true);
    const { data } = await supabase.functions.invoke('instagram-manage', {
      body: { tenantId: currentTenant.id, action: 'health' },
    });
    setChecking(false);
    const status = (data as any)?.status;
    toast({
      title: 'Health check complete',
      description: status === 'connected' ? 'Connection is healthy.' : `Status: ${status}`,
      variant: status === 'connected' ? 'default' : 'destructive',
    });
    fetchStatus();
  };

  const handleDisconnect = async () => {
    if (!currentTenant?.id || !account) return;
    setDisconnecting(true);
    const { error } = await supabase.functions.invoke('instagram-manage', {
      body: { tenantId: currentTenant.id, action: 'disconnect', accountId: account.id },
    });
    setDisconnecting(false);
    if (error) {
      toast({ title: 'Disconnect failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Instagram disconnected' });
      setAccount(null);
    }
  };

  const statusBadge = () => {
    if (!account) return <Badge variant="outline">Not connected</Badge>;
    const map: Record<string, { variant: any; label: string; icon: any }> = {
      connected: { variant: 'default', label: 'Connected', icon: CheckCircle2 },
      expired: { variant: 'destructive', label: 'Token expired', icon: AlertCircle },
      permission_issue: { variant: 'destructive', label: 'Permission issue', icon: AlertCircle },
      webhook_inactive: { variant: 'secondary', label: 'Webhook inactive', icon: AlertCircle },
      disconnected: { variant: 'outline', label: 'Disconnected', icon: AlertCircle },
    };
    const cfg = map[account.status] || map.connected;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1.5">
        <Icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <SEO title="Connect Instagram | Aireatro" description="Connect your Instagram Professional account to manage DMs, comments, and lead capture." />

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/app">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/app/integrations">Integrations</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Instagram</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, #833AB4 0%, #C13584 25%, #E1306C 50%, #FD1D1D 75%, #FCB045 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 50%)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/20 backdrop-blur-md p-3 border border-white/30">
                <Instagram className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Connect Instagram</h1>
                <p className="text-white/90 mt-1 max-w-xl">
                  Manage Instagram DMs, story replies, comments, and lead capture inside Aireatro — alongside WhatsApp and Meta Ads.
                </p>
              </div>
            </div>
            <div>{statusBadge()}</div>
          </div>
        </div>

        {/* Status / Actions Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>One Instagram Professional account per workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : account ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-muted/30">
                  <div className="relative">
                    {account.profile_picture_url ? (
                      <img src={account.profile_picture_url} alt={account.ig_username || ''} className="h-16 w-16 rounded-full object-cover ring-2 ring-pink-500/40" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                        {(account.ig_username || 'IG').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg truncate">@{account.ig_username || '—'}</div>
                    <div className="text-sm text-muted-foreground truncate">{account.ig_name}</div>
                    {account.followers_count !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Users className="h-3 w-3" /> {account.followers_count.toLocaleString()} followers
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Facebook Page</div>
                    <div className="font-medium truncate">{account.facebook_page_name || '—'}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Webhook</div>
                    <div className="font-medium flex items-center gap-1.5">
                      {account.webhook_subscribed ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Subscribed</>
                      ) : (
                        <><AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Inactive</>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Connected</div>
                    <div className="font-medium">{formatDistanceToNow(new Date(account.connected_at), { addSuffix: true })}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Last sync</div>
                    <div className="font-medium">{account.last_synced_at ? formatDistanceToNow(new Date(account.last_synced_at), { addSuffix: true }) : '—'}</div>
                  </div>
                </div>

                {account.last_error && (
                  <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{account.last_error}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleHealthCheck} variant="outline" disabled={checking}>
                    {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Run health check
                  </Button>
                  {isAdmin && (
                    <Button onClick={handleConnect} variant="outline" disabled={connecting}>
                      {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Reconnect
                    </Button>
                  )}
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={disconnecting}>
                          {disconnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect Instagram?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will stop all incoming Instagram DMs and comments for this workspace. You can reconnect anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #FCB045)' }}>
                  <Instagram className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Instagram account connected</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                    Connect your Instagram Professional account linked to a Facebook Page to start receiving DMs in your inbox.
                  </p>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={!isAdmin || connecting}
                  size="lg"
                  className="text-white border-0 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #FD1D1D)' }}
                >
                  {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlugZap className="h-4 w-4 mr-2" />}
                  Connect Instagram
                </Button>
                {!isAdmin && (
                  <p className="text-xs text-muted-foreground">Only workspace admins can connect Instagram.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, title: 'Unified Inbox', desc: 'Manage Instagram DMs alongside WhatsApp.' },
            { icon: Sparkles, title: 'AI Auto-Reply', desc: 'Qualify and route IG leads automatically.' },
            { icon: ShieldCheck, title: 'Secure Tokens', desc: 'Long-lived tokens encrypted server-side.' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="p-4">
                <Icon className="h-5 w-5 text-pink-600 mb-2" />
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
